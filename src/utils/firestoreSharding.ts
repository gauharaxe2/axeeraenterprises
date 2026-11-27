import {
  CLOUD_STORAGE_MAX_BYTES,
  estimateJsonSectionBytes
} from './imageUpload.ts';
import { MAX_FIRESTORE_SECTION_BYTES } from './firestoreSyncGuard.ts';

export const FIRESTORE_CHUNK_TARGET_BYTES = 700_000;
export const CLOUD_BATCH_MAX_BYTES = 4_000_000;
export const MEDIA_REF_PREFIX = '__cloud_media__:';
const MEDIA_SLICE_THRESHOLD_BYTES = 32_000;
const MEDIA_MAX_SLICE_BYTES = 600_000;

export interface FirestoreDocWrite {
  id: string;
  data: string;
  bytes: number;
}

export interface ShardedSectionManifest {
  __sharded: true;
  version: 1;
  sectionId: string;
  totalItems: number;
  chunkCount: number;
  chunkIds: string[];
  mediaIds?: string[];
  totalBytes: number;
}

export interface FirestoreSectionWritePlan {
  sharded: boolean;
  totalBytes: number;
  payloadDocs: FirestoreDocWrite[];
  manifestDoc: FirestoreDocWrite;
  activeShardIds: string[];
}

export interface ParsedSnapshotResult {
  sections: Record<string, unknown>;
  activeShardIdsBySection: Record<string, string[]>;
  observedShardDocIdsBySection: Record<string, string[]>;
  pendingShardedSections: string[];
}

export function utf8ByteLength(text: string): number {
  if (typeof TextEncoder !== 'undefined') {
    return new TextEncoder().encode(text).length;
  }
  return text.length;
}

export function isShardedManifest(value: unknown): value is ShardedSectionManifest {
  if (!value || typeof value !== 'object' || Array.isArray(value)) return false;
  const candidate = value as Partial<ShardedSectionManifest>;
  return (
    candidate.__sharded === true &&
    candidate.version === 1 &&
    typeof candidate.sectionId === 'string' &&
    Array.isArray(candidate.chunkIds) &&
    candidate.chunkIds.every((id) => typeof id === 'string' && id.length > 0) &&
    (!candidate.mediaIds ||
      (Array.isArray(candidate.mediaIds) &&
        candidate.mediaIds.every((id) => typeof id === 'string' && id.length > 0)))
  );
}

function splitLargeMediaString(
  rawValue: string,
  sectionId: string,
  generation: string,
  mediaDocs: FirestoreDocWrite[]
): string {
  const totalBytes = utf8ByteLength(rawValue);
  if (totalBytes <= MEDIA_MAX_SLICE_BYTES) {
    const mediaId = `${sectionId}__g${generation}_m${mediaDocs.length}`;
    const docData = JSON.stringify({ __mediaChunk: rawValue });
    mediaDocs.push({
      id: mediaId,
      data: docData,
      bytes: utf8ByteLength(docData)
    });
    return `${MEDIA_REF_PREFIX}${mediaId}`;
  }

  const sliceIds: string[] = [];
  let cursor = 0;
  while (cursor < rawValue.length) {
    const slice = rawValue.slice(cursor, cursor + MEDIA_MAX_SLICE_BYTES);
    cursor += MEDIA_MAX_SLICE_BYTES;
    const mediaId = `${sectionId}__g${generation}_m${mediaDocs.length}`;
    const docData = JSON.stringify({ __mediaChunk: slice });
    mediaDocs.push({
      id: mediaId,
      data: docData,
      bytes: utf8ByteLength(docData)
    });
    sliceIds.push(mediaId);
  }
  return `${MEDIA_REF_PREFIX}${sliceIds.join('|')}`;
}

function offloadMediaFromValue(
  value: unknown,
  sectionId: string,
  generation: string,
  mediaDocs: FirestoreDocWrite[]
): unknown {
  if (typeof value === 'string') {
    if (
      value.startsWith('data:image/') &&
      utf8ByteLength(value) > MEDIA_SLICE_THRESHOLD_BYTES
    ) {
      return splitLargeMediaString(value, sectionId, generation, mediaDocs);
    }
    return value;
  }

  if (Array.isArray(value)) {
    return value.map((entry) =>
      offloadMediaFromValue(entry, sectionId, generation, mediaDocs)
    );
  }

  if (value && typeof value === 'object') {
    const result: Record<string, unknown> = {};
    for (const [k, v] of Object.entries(value as Record<string, unknown>)) {
      result[k] = offloadMediaFromValue(v, sectionId, generation, mediaDocs);
    }
    return result;
  }

  return value;
}

function rehydrateMediaInValue(
  value: unknown,
  docsMap: Record<string, string>
): unknown {
  if (typeof value === 'string') {
    if (!value.startsWith(MEDIA_REF_PREFIX)) return value;
    const refIds = value
      .slice(MEDIA_REF_PREFIX.length)
      .split('|')
      .filter(Boolean);
    const parts: string[] = [];
    for (const refId of refIds) {
      const rawDoc = docsMap[refId];
      if (typeof rawDoc !== 'string') return value;
      try {
        const parsed = JSON.parse(rawDoc) as { __mediaChunk?: unknown };
        if (typeof parsed?.__mediaChunk === 'string') {
          parts.push(parsed.__mediaChunk);
        } else {
          return value;
        }
      } catch {
        return value;
      }
    }
    return parts.join('');
  }

  if (Array.isArray(value)) {
    return value.map((entry) => rehydrateMediaInValue(entry, docsMap));
  }

  if (value && typeof value === 'object') {
    const result: Record<string, unknown> = {};
    for (const [k, v] of Object.entries(value as Record<string, unknown>)) {
      result[k] = rehydrateMediaInValue(v, docsMap);
    }
    return result;
  }

  return value;
}

function sanitizeGenerationToken(raw?: string): string {
  const cleaned = (raw || '').replace(/[^a-zA-Z0-9]/g, '');
  if (cleaned) return cleaned.slice(0, 16);
  return `${Date.now().toString(36)}${Math.random().toString(36).slice(2, 5)}`;
}

/**
 * Builds a single-document or auto-sharded multi-document write plan for Firestore.
 * Array sections larger than ~700 KB are automatically split across balanced shard
 * documents (and oversized inline images offloaded into media shards) up to 10 MB.
 */
export function buildFirestoreSectionWritePlan(
  sectionId: string,
  data: unknown,
  options?: {
    generation?: string;
    targetChunkBytes?: number;
    maxSectionBytes?: number;
  }
): FirestoreSectionWritePlan {
  const targetChunkBytes = options?.targetChunkBytes ?? FIRESTORE_CHUNK_TARGET_BYTES;
  const maxSectionBytes =
    options?.maxSectionBytes ??
    (Array.isArray(data) ? CLOUD_STORAGE_MAX_BYTES : MAX_FIRESTORE_SECTION_BYTES);

  const rawJson = JSON.stringify(data);
  const totalBytes = utf8ByteLength(rawJson);

  if (totalBytes > maxSectionBytes) {
    const usedMb = (totalBytes / (1024 * 1024)).toFixed(2);
    const limitLabel =
      maxSectionBytes >= 1024 * 1024
        ? `${Math.round(maxSectionBytes / (1024 * 1024))} MB`
        : `${Math.round(maxSectionBytes / 1024)} KB`;
    throw new Error(
      `Section "${sectionId}" (${usedMb} MB) exceeds the ${limitLabel} cloud storage limit. Remove unused media or use external image URLs.`
    );
  }

  if (!Array.isArray(data) || totalBytes <= targetChunkBytes) {
    return {
      sharded: false,
      totalBytes,
      payloadDocs: [],
      manifestDoc: {
        id: sectionId,
        data: rawJson,
        bytes: totalBytes
      },
      activeShardIds: []
    };
  }

  const generation = sanitizeGenerationToken(options?.generation);
  const mediaDocs: FirestoreDocWrite[] = [];
  const chunkDocs: FirestoreDocWrite[] = [];

  let currentChunkItems: unknown[] = [];

  for (let i = 0; i < data.length; i += 1) {
    let item: unknown = data[i];
    const singleArrayBytes = utf8ByteLength(JSON.stringify([item]));

    if (singleArrayBytes > targetChunkBytes) {
      item = offloadMediaFromValue(item, sectionId, generation, mediaDocs);
      const afterOffloadBytes = utf8ByteLength(JSON.stringify([item]));
      if (afterOffloadBytes > MAX_FIRESTORE_SECTION_BYTES) {
        throw new Error(
          `A single record in "${sectionId}" (${Math.round(afterOffloadBytes / 1024)} KB) exceeds the 927 KB per-document Firestore ceiling.`
        );
      }
    }

    if (currentChunkItems.length === 0) {
      currentChunkItems = [item];
      continue;
    }

    const candidateChunk = [...currentChunkItems, item];
    const candidateJson = JSON.stringify(candidateChunk);
    if (utf8ByteLength(candidateJson) > targetChunkBytes) {
      const chunkJson = JSON.stringify(currentChunkItems);
      chunkDocs.push({
        id: `${sectionId}__g${generation}_c${chunkDocs.length}`,
        data: chunkJson,
        bytes: utf8ByteLength(chunkJson)
      });
      currentChunkItems = [item];
    } else {
      currentChunkItems = candidateChunk;
    }
  }

  if (currentChunkItems.length > 0) {
    const chunkJson = JSON.stringify(currentChunkItems);
    chunkDocs.push({
      id: `${sectionId}__g${generation}_c${chunkDocs.length}`,
      data: chunkJson,
      bytes: utf8ByteLength(chunkJson)
    });
  }

  const chunkIds = chunkDocs.map((c) => c.id);
  const mediaIds = mediaDocs.map((m) => m.id);
  const manifest: ShardedSectionManifest = {
    __sharded: true,
    version: 1,
    sectionId,
    totalItems: data.length,
    chunkCount: chunkDocs.length,
    chunkIds,
    ...(mediaIds.length > 0 ? { mediaIds } : {}),
    totalBytes
  };
  const manifestJson = JSON.stringify(manifest);

  return {
    sharded: true,
    totalBytes,
    payloadDocs: [...mediaDocs, ...chunkDocs],
    manifestDoc: {
      id: sectionId,
      data: manifestJson,
      bytes: utf8ByteLength(manifestJson)
    },
    activeShardIds: [...mediaIds, ...chunkIds]
  };
}

/**
 * Splits a list of Firestore document writes into sequential batch groups
 * under Firestore's 10 MiB commit payload limit.
 */
export function groupDocsForBatches(
  docs: FirestoreDocWrite[],
  maxBatchBytes: number = CLOUD_BATCH_MAX_BYTES,
  maxOpsPerBatch = 400
): FirestoreDocWrite[][] {
  if (docs.length === 0) return [];
  const batches: FirestoreDocWrite[][] = [];
  let current: FirestoreDocWrite[] = [];
  let currentBytes = 0;

  for (const entry of docs) {
    if (
      current.length > 0 &&
      (currentBytes + entry.bytes > maxBatchBytes || current.length >= maxOpsPerBatch)
    ) {
      batches.push(current);
      current = [entry];
      currentBytes = entry.bytes;
    } else {
      current.push(entry);
      currentBytes += entry.bytes;
    }
  }

  if (current.length > 0) {
    batches.push(current);
  }
  return batches;
}

/**
 * Returns any stale shard document IDs belonging to `sectionId` that are no
 * longer referenced by `activeShardIds`.
 */
export function findStaleShardDocIds(
  sectionId: string,
  observedDocIds: Iterable<string>,
  activeShardIds: Iterable<string>
): string[] {
  const prefix = `${sectionId}__`;
  const activeSet = new Set(activeShardIds);
  const stale: string[] = [];
  for (const docId of observedDocIds) {
    if (docId.startsWith(prefix) && !activeSet.has(docId)) {
      stale.push(docId);
    }
  }
  return stale;
}

/**
 * Reassembles both legacy single-document sections and multi-document sharded sections
 * from a snapshot map of `{ [docId]: docDataString }`.
 */
export function parseSiteContentSnapshotDocs(
  docsMap: Record<string, string>,
  knownSectionIds: readonly string[]
): ParsedSnapshotResult {
  const sections: Record<string, unknown> = {};
  const activeShardIdsBySection: Record<string, string[]> = {};
  const observedShardDocIdsBySection: Record<string, string[]> = {};
  const pendingShardedSections: string[] = [];

  const allDocIds = Object.keys(docsMap);

  for (const sectionId of knownSectionIds) {
    const prefix = `${sectionId}__`;
    observedShardDocIdsBySection[sectionId] = allDocIds.filter((id) =>
      id.startsWith(prefix)
    );

    const rawSectionData = docsMap[sectionId];
    if (typeof rawSectionData !== 'string') continue;

    try {
      const parsed = JSON.parse(rawSectionData);

      if (isShardedManifest(parsed)) {
        const requiredShardIds = [
          ...parsed.chunkIds,
          ...(parsed.mediaIds ?? [])
        ];
        const hasAllShards = requiredShardIds.every(
          (shardId) => typeof docsMap[shardId] === 'string'
        );

        if (!hasAllShards) {
          pendingShardedSections.push(sectionId);
          continue;
        }

        const reassembled: unknown[] = [];
        let chunkParseFailed = false;

        for (const chunkId of parsed.chunkIds) {
          const parsedChunk = JSON.parse(docsMap[chunkId]);
          if (!Array.isArray(parsedChunk)) {
            chunkParseFailed = true;
            break;
          }
          for (const item of parsedChunk) {
            reassembled.push(
              parsed.mediaIds && parsed.mediaIds.length > 0
                ? rehydrateMediaInValue(item, docsMap)
                : item
            );
          }
        }

        if (chunkParseFailed) {
          pendingShardedSections.push(sectionId);
          continue;
        }

        sections[sectionId] = reassembled;
        activeShardIdsBySection[sectionId] = requiredShardIds;
      } else {
        sections[sectionId] = parsed;
        activeShardIdsBySection[sectionId] = [];
      }
    } catch {
      // Skip malformed section JSON gracefully without breaking sibling sections
    }
  }

  return {
    sections,
    activeShardIdsBySection,
    observedShardDocIdsBySection,
    pendingShardedSections
  };
}

/**
 * Removes large inline `data:image/...` strings so localStorage emergency backups
 * never hit the ~5 MB browser quota when Firestore holds up to 10 MB per section.
 */
export function stripEmbeddedImagesForLocalBackup<T>(value: T): T {
  if (typeof value === 'string') {
    if (value.startsWith('data:image/')) {
      return '' as unknown as T;
    }
    return value;
  }
  if (Array.isArray(value)) {
    return value.map((item) => stripEmbeddedImagesForLocalBackup(item)) as unknown as T;
  }
  if (value && typeof value === 'object') {
    const copy: Record<string, unknown> = {};
    for (const [k, v] of Object.entries(value as Record<string, unknown>)) {
      copy[k] = stripEmbeddedImagesForLocalBackup(v);
    }
    return copy as T;
  }
  return value;
}

export function estimateTotalCloudStorageBytes(sections: Record<string, unknown>): number {
  let total = 0;
  for (const value of Object.values(sections)) {
    total += estimateJsonSectionBytes(value);
  }
  return total;
}
