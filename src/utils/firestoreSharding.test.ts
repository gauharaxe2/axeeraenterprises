import test from 'node:test';
import assert from 'node:assert/strict';
import {
  FIRESTORE_CHUNK_TARGET_BYTES,
  buildFirestoreSectionWritePlan,
  findStaleShardDocIds,
  groupDocsForBatches,
  parseSiteContentSnapshotDocs,
  stripEmbeddedImagesForLocalBackup,
  utf8ByteLength
} from './firestoreSharding.ts';
import { CLOUD_STORAGE_MAX_BYTES } from './imageUpload.ts';
import { blogsData } from '../data/blogs.ts';

test('keeps small payloads in a single unsharded Firestore document', () => {
  const smallServices = [{ id: 's1', title: 'Web Dev' }];
  const plan = buildFirestoreSectionWritePlan('services', smallServices);

  assert.equal(plan.sharded, false);
  assert.equal(plan.payloadDocs.length, 0);
  assert.deepEqual(plan.activeShardIds, []);
  assert.equal(plan.manifestDoc.id, 'services');
  assert.deepEqual(JSON.parse(plan.manifestDoc.data), smallServices);
});

test('automatically shards real 90-article blogsData across balanced <=700 KB documents and reassembles identically', () => {
  const plan = buildFirestoreSectionWritePlan('blogs', blogsData, { generation: 'testgen1' });

  assert.equal(plan.sharded, true);
  assert.ok(plan.payloadDocs.length >= 2, `Expected >=2 shard docs, got ${plan.payloadDocs.length}`);

  for (const shard of plan.payloadDocs) {
    assert.ok(
      utf8ByteLength(shard.data) <= FIRESTORE_CHUNK_TARGET_BYTES,
      `Shard ${shard.id} exceeded ${FIRESTORE_CHUNK_TARGET_BYTES} bytes`
    );
    assert.match(shard.id, /^[a-zA-Z0-9_\-]+$/);
    assert.ok(shard.id.length <= 128);
  }

  const docsMap: Record<string, string> = {
    [plan.manifestDoc.id]: plan.manifestDoc.data
  };
  for (const shard of plan.payloadDocs) {
    docsMap[shard.id] = shard.data;
  }

  const parsed = parseSiteContentSnapshotDocs(docsMap, ['blogs', 'services']);
  assert.deepEqual(parsed.pendingShardedSections, []);
  assert.deepEqual(parsed.sections.blogs, blogsData);
  assert.equal(parsed.observedShardDocIdsBySection.blogs.length, plan.payloadDocs.length);
});

test('offloads oversized inline uploaded images from a single item into media shards and rehydrates accurately', () => {
  const coverImage = `data:image/webp;base64,${'A'.repeat(200_000)}`;
  const sectionImage1 = `data:image/webp;base64,${'B'.repeat(200_000)}`;
  const sectionImage2 = `data:image/webp;base64,${'C'.repeat(200_000)}`;
  const sectionImage3 = `data:image/webp;base64,${'D'.repeat(200_000)}`;
  const sectionImage4 = `data:image/webp;base64,${'E'.repeat(200_000)}`;

  const heavyBlog = [
    {
      id: 'heavy-1',
      title: 'Heavy Visual Article',
      imageUrl: coverImage,
      sections: [
        { id: 's1', heading: 'One', paragraphs: ['Text 1'], imageUrl: sectionImage1 },
        { id: 's2', heading: 'Two', paragraphs: ['Text 2'], imageUrl: sectionImage2 },
        { id: 's3', heading: 'Three', paragraphs: ['Text 3'], imageUrl: sectionImage3 },
        { id: 's4', heading: 'Four', paragraphs: ['Text 4'], imageUrl: sectionImage4 }
      ]
    },
    {
      id: 'light-2',
      title: 'Regular Article',
      imageUrl: 'https://images.unsplash.com/photo-1498050108023-c5249f4df085',
      sections: [{ id: 's1', heading: 'Overview', paragraphs: ['Clean text'] }]
    }
  ];

  const plan = buildFirestoreSectionWritePlan('blogs', heavyBlog, { generation: 'media99' });
  assert.equal(plan.sharded, true);
  assert.ok(plan.totalBytes > 1_000_000, 'Single-item test fixture should exceed 1 MB');

  for (const docEntry of [plan.manifestDoc, ...plan.payloadDocs]) {
    assert.ok(
      utf8ByteLength(docEntry.data) <= FIRESTORE_CHUNK_TARGET_BYTES,
      `Doc ${docEntry.id} exceeded ${FIRESTORE_CHUNK_TARGET_BYTES} bytes (${docEntry.bytes})`
    );
  }

  const docsMap: Record<string, string> = {
    [plan.manifestDoc.id]: plan.manifestDoc.data
  };
  for (const shard of plan.payloadDocs) {
    docsMap[shard.id] = shard.data;
  }

  const reassembled = parseSiteContentSnapshotDocs(docsMap, ['blogs']);
  assert.deepEqual(reassembled.sections.blogs, heavyBlog);
});

test('does not apply incomplete sharded snapshots when any chunk or media shard is missing', () => {
  const plan = buildFirestoreSectionWritePlan('blogs', blogsData, { generation: 'partial1' });
  const docsMap: Record<string, string> = {
    [plan.manifestDoc.id]: plan.manifestDoc.data
  };
  // Omit the last chunk deliberately
  for (const shard of plan.payloadDocs.slice(0, -1)) {
    docsMap[shard.id] = shard.data;
  }

  const parsed = parseSiteContentSnapshotDocs(docsMap, ['blogs']);
  assert.equal(parsed.sections.blogs, undefined);
  assert.deepEqual(parsed.pendingShardedSections, ['blogs']);
});

test('rejects arrays exceeding the 10 MB multi-document cloud storage ceiling', () => {
  const hugeArray = Array.from({ length: 12 }, (_, idx) => ({
    id: `item-${idx}`,
    blob: 'x'.repeat(920_000)
  }));

  assert.throws(
    () => buildFirestoreSectionWritePlan('blogs', hugeArray),
    (err: unknown) => err instanceof Error && /10 MB cloud storage limit/i.test(err.message)
  );
  assert.equal(CLOUD_STORAGE_MAX_BYTES, 10 * 1024 * 1024);
});

test('finds stale shard docs from prior generations and splits large payloads across <=4 MB write batches', () => {
  const stale = findStaleShardDocIds(
    'blogs',
    ['blogs__gold_c0', 'blogs__gold_c1', 'blogs__gnew_c0', 'projects__gold_c0'],
    ['blogs__gnew_c0']
  );
  assert.deepEqual(stale, ['blogs__gold_c0', 'blogs__gold_c1']);

  const batches = groupDocsForBatches(
    [
      { id: 'c0', data: 'a', bytes: 2_500_000 },
      { id: 'c1', data: 'b', bytes: 2_500_000 },
      { id: 'c2', data: 'c', bytes: 1_000_000 }
    ],
    4_000_000
  );
  assert.equal(batches.length, 2);
  assert.equal(batches[0].length, 1);
  assert.equal(batches[1].length, 2);
});

test('stripEmbeddedImagesForLocalBackup strips data:image URLs while preserving text and https URLs', () => {
  const stripped = stripEmbeddedImagesForLocalBackup({
    title: 'Keep me',
    cover: 'data:image/webp;base64,ABC123',
    external: 'https://images.unsplash.com/photo-1',
    nested: [{ img: 'data:image/png;base64,XYZ' }]
  });
  assert.deepEqual(stripped, {
    title: 'Keep me',
    cover: '',
    external: 'https://images.unsplash.com/photo-1',
    nested: [{ img: '' }]
  });
});
