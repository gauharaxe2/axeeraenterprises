import test from 'node:test';
import assert from 'node:assert/strict';
import {
  DEFAULT_ADMIN_EMAILS,
  formatSyncErrorMessage,
  isAuthorizedAdminEmail,
  MAX_FIRESTORE_SECTION_BYTES,
  shouldAcceptSnapshotData,
  validateSectionPayloadSize
} from './firestoreSyncGuard.ts';

test('rejects empty cached snapshots and marks status offline so defaults never overwrite live Firestore', () => {
  const decision = shouldAcceptSnapshotData({
    empty: true,
    fromCache: true,
    docCount: 0
  });
  assert.deepEqual(decision, { apply: false, status: 'offline' });
});

test('does not apply empty server snapshots either, preserving local state without cloud seeding', () => {
  const decision = shouldAcceptSnapshotData({
    empty: true,
    fromCache: false,
    docCount: 0
  });
  assert.deepEqual(decision, { apply: false, status: 'connected' });
});

test('applies populated server snapshots and reports connected status', () => {
  const decision = shouldAcceptSnapshotData({
    empty: false,
    fromCache: false,
    docCount: 9
  });
  assert.deepEqual(decision, { apply: true, status: 'connected' });
});

test('applies cached populated snapshots while keeping offline status until server responds', () => {
  const decision = shouldAcceptSnapshotData({
    empty: false,
    fromCache: true,
    docCount: 9
  });
  assert.deepEqual(decision, { apply: true, status: 'offline' });
});

test('authorizes all configured owner admin emails case-insensitively and rejects anonymous/others', () => {
  for (const email of DEFAULT_ADMIN_EMAILS) {
    assert.equal(isAuthorizedAdminEmail(email.toUpperCase()), true);
  }
  assert.equal(isAuthorizedAdminEmail('axe426622@gmail.com'), true);
  assert.equal(isAuthorizedAdminEmail('gauharaxe@outlook.com'), true);
  assert.equal(isAuthorizedAdminEmail('gauhar426622@gmail.com'), true);
  assert.equal(isAuthorizedAdminEmail('visitor@example.com'), false);
  assert.equal(isAuthorizedAdminEmail(null), false);
  assert.equal(isAuthorizedAdminEmail(''), false);
});

test('rejects serialized section payloads above Firestore safe size limit', () => {
  assert.equal(validateSectionPayloadSize('{"ok":true}').ok, true);
  const oversized = 'a'.repeat(MAX_FIRESTORE_SECTION_BYTES + 10);
  const check = validateSectionPayloadSize(oversized);
  assert.equal(check.ok, false);
});

test('formats permission and size errors into clear admin messages', () => {
  const perm = formatSyncErrorMessage('blogs', new Error('7 PERMISSION_DENIED: Missing or insufficient permissions'));
  assert.match(perm, /sign in with an authorized admin/i);
  const size = formatSyncErrorMessage('blogs', new Error('Document exceeds the maximum allowed size'));
  assert.match(size, /1 MB Firestore limit/i);
});
