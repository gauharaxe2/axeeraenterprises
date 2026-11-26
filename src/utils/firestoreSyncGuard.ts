export const DEFAULT_ADMIN_EMAILS = [
  'axe426622@gmail.com',
  'gauharaxe@outlook.com',
  'gauhar426622@gmail.com'
] as const;

export interface SnapshotGateInput {
  empty: boolean;
  fromCache: boolean;
  docCount: number;
}

export interface SnapshotGateDecision {
  apply: boolean;
  status: 'connected' | 'offline';
}

/**
 * Prevents offline or empty Firestore snapshots from overwriting live cloud state
 * or falsely reporting an active cloud sync connection.
 */
export function shouldAcceptSnapshotData(input: SnapshotGateInput): SnapshotGateDecision {
  if (input.empty) {
    return {
      apply: false,
      status: input.fromCache ? 'offline' : 'connected'
    };
  }

  if (input.docCount <= 0) {
    return {
      apply: false,
      status: input.fromCache ? 'offline' : 'connected'
    };
  }

  return {
    apply: true,
    status: input.fromCache ? 'offline' : 'connected'
  };
}

export function isAuthorizedAdminEmail(
  email: string | null | undefined,
  allowlist: readonly string[] = DEFAULT_ADMIN_EMAILS
): boolean {
  if (!email) return false;
  const normalized = email.trim().toLowerCase();
  if (!normalized) return false;
  return allowlist.some((allowed) => allowed.trim().toLowerCase() === normalized);
}

export const MAX_FIRESTORE_SECTION_BYTES = 950_000;

export function validateSectionPayloadSize(serializedJson: string): { ok: true; bytes: number } | { ok: false; bytes: number; error: string } {
  const bytes = new TextEncoder().encode(serializedJson).length;
  if (bytes > MAX_FIRESTORE_SECTION_BYTES) {
    return {
      ok: false,
      bytes,
      error: `Section data is too large for a single cloud document (${Math.round(bytes / 1024)} KB / 927 KB limit). Remove oversized embedded images or use external URLs.`
    };
  }
  return { ok: true, bytes };
}

export function formatSyncErrorMessage(sectionId: string, error: unknown): string {
  const raw = error instanceof Error ? error.message : String(error ?? '');
  if (raw.includes('permission-denied') || raw.includes('PERMISSION_DENIED') || raw.includes('insufficient permissions')) {
    return `Cloud save blocked for "${sectionId}": sign in with an authorized admin Google account to publish changes.`;
  }
  if (raw.includes('too large') || raw.includes('exceeds the maximum allowed size')) {
    return `Cloud save failed for "${sectionId}": content exceeds the 1 MB Firestore limit. Use smaller images or external image URLs.`;
  }
  return `Cloud sync failed for "${sectionId}". Your change is only stored locally until published.`;
}
