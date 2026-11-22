import test from 'node:test';
import assert from 'node:assert/strict';
import {
  computeScaledDimensions,
  deriveInitials,
  estimateDataUrlSizeKb,
  estimateJsonSectionBytes,
  isUploadedDataUrl,
  isWithinFirestoreDocBudget,
  MAX_RAW_IMAGE_BYTES,
  PROJECT_IMAGE_MAX_DIMENSION,
  sanitizeDisplayImageUrl,
  SERVICE_IMAGE_MAX_DIMENSION,
  validateImageFile
} from './imageUpload';

test('validateImageFile accepts valid PNG/JPG/WebP/GIF/AVIF files within limit', () => {
  assert.deepEqual(validateImageFile({ type: 'image/png', size: 2048, name: 'photo.png' }), { ok: true });
  assert.deepEqual(validateImageFile({ type: '', size: 4096, name: 'avatar.JPG' }), { ok: true });
  assert.deepEqual(validateImageFile({ type: 'image/webp', size: 1024, name: 'portrait.webp' }), { ok: true });
});

test('validateImageFile rejects empty, oversized, or non-image files cleanly', () => {
  const empty = validateImageFile({ type: 'image/png', size: 0, name: 'empty.png' });
  assert.equal(empty.ok, false);

  const tooBig = validateImageFile({
    type: 'image/jpeg',
    size: MAX_RAW_IMAGE_BYTES + 1,
    name: 'huge.jpg'
  });
  assert.equal(tooBig.ok, false);

  const nonImage = validateImageFile({ type: 'application/pdf', size: 1024, name: 'resume.pdf' });
  assert.equal(nonImage.ok, false);

  const scriptFile = validateImageFile({ type: 'text/html', size: 512, name: 'payload.html' });
  assert.equal(scriptFile.ok, false);
});

test('computeScaledDimensions preserves aspect ratio and avoids upscaling small images', () => {
  assert.deepEqual(computeScaledDimensions(200, 150, 480), { width: 200, height: 150 });
  assert.deepEqual(computeScaledDimensions(1920, 1080, 480), { width: 480, height: 270 });
  assert.deepEqual(computeScaledDimensions(800, 1600, 480), { width: 240, height: 480 });
});

test('sanitizeDisplayImageUrl permits safe HTTPS/relative/base64-image URLs and blocks unsafe schemes', () => {
  assert.equal(sanitizeDisplayImageUrl('  https://example.com/a.jpg  '), 'https://example.com/a.jpg');
  assert.equal(sanitizeDisplayImageUrl('/assets/aistudio/logo.png'), '/assets/aistudio/logo.png');
  assert.equal(
    sanitizeDisplayImageUrl('data:image/webp;base64,UklGRh4AAABXRUJQVlA4'),
    'data:image/webp;base64,UklGRh4AAABXRUJQVlA4'
  );
  assert.equal(sanitizeDisplayImageUrl('javascript:alert(1)'), '');
  assert.equal(sanitizeDisplayImageUrl('data:text/html;base64,PHNjcmlwdD4='), '');
  assert.equal(sanitizeDisplayImageUrl('//evil.example/img.png'), '');
});

test('isUploadedDataUrl, estimateDataUrlSizeKb, and deriveInitials return crisp helpers', () => {
  const sampleData = `data:image/png;base64,${'A'.repeat(4096)}`;
  assert.equal(isUploadedDataUrl(sampleData), true);
  assert.equal(isUploadedDataUrl('https://example.com/photo.jpg'), false);
  assert.equal(estimateDataUrlSizeKb(sampleData), 3);

  assert.equal(deriveInitials('Gauhar Nadeem'), 'GN');
  assert.equal(deriveInitials('Sarah Reynolds', 'S.R.'), 'S.R.');
  assert.equal(deriveInitials('Alex'), 'AL');
  assert.equal(deriveInitials(''), 'AX');
});

test('Service/Project max dimensions and Firestore section byte-budget guards work accurately', () => {
  assert.equal(SERVICE_IMAGE_MAX_DIMENSION, 800);
  assert.equal(PROJECT_IMAGE_MAX_DIMENSION, 960);

  const smallSection = [{ id: 'p1', title: 'Case Study', imageUrl: 'https://example.com/a.webp' }];
  assert.ok(estimateJsonSectionBytes(smallSection) > 0);
  assert.equal(isWithinFirestoreDocBudget(smallSection), true);

  const oversizedSection = [{ id: 'p2', imageUrl: 'A'.repeat(900_000) }];
  assert.equal(isWithinFirestoreDocBudget(oversizedSection), false);
});
