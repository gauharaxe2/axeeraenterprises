import test from 'node:test';
import assert from 'node:assert/strict';
import {
  computeScaledDimensions,
  deriveInitials,
  filterSupportedImageFiles,
  isUploadedDataUrl,
  isWithinFirestoreDocBudget,
  sanitizeDisplayImageUrl,
  validateImageFile
} from './imageUpload.ts';

test('validateImageFile accepts valid PNG/JPG/WebP/AVIF files and rejects empty/oversized/unsupported files', () => {
  assert.deepEqual(validateImageFile({ name: 'cover.webp', type: 'image/webp', size: 120_000 }), { ok: true });
  assert.deepEqual(validateImageFile({ name: 'photo.jpg', type: '', size: 42_000 }), { ok: true });

  const empty = validateImageFile({ name: 'empty.png', type: 'image/png', size: 0 });
  assert.equal(empty.ok, false);

  const tooLarge = validateImageFile({ name: 'huge.png', type: 'image/png', size: 20 * 1024 * 1024 });
  assert.equal(tooLarge.ok, false);

  const wrongType = validateImageFile({ name: 'doc.pdf', type: 'application/pdf', size: 5000 });
  assert.equal(wrongType.ok, false);
});

test('filterSupportedImageFiles separates dropped image files from unsupported ones', () => {
  const dropped = [
    { name: 'hero.png', type: 'image/png', size: 1024 },
    { name: 'notes.txt', type: 'text/plain', size: 512 },
    { name: 'gallery.avif', type: 'image/avif', size: 2048 }
  ];
  const result = filterSupportedImageFiles(dropped);
  assert.equal(result.accepted.length, 2);
  assert.equal(result.accepted[0].name, 'hero.png');
  assert.equal(result.accepted[1].name, 'gallery.avif');
  assert.equal(result.rejected.length, 1);
  assert.equal(result.rejected[0].file.name, 'notes.txt');
});

test('computeScaledDimensions maintains aspect ratio without upscaling small images', () => {
  assert.deepEqual(computeScaledDimensions(1600, 800, 800), { width: 800, height: 400 });
  assert.deepEqual(computeScaledDimensions(600, 400, 800), { width: 600, height: 400 });
});

test('sanitizeDisplayImageUrl allows https, relative paths, and image data URLs while blocking unsafe protocols', () => {
  assert.equal(sanitizeDisplayImageUrl('https://cdn.example.com/a.webp'), 'https://cdn.example.com/a.webp');
  assert.equal(sanitizeDisplayImageUrl('/assets/logo.png'), '/assets/logo.png');
  assert.equal(sanitizeDisplayImageUrl('data:image/webp;base64,AAAA'), 'data:image/webp;base64,AAAA');
  assert.equal(sanitizeDisplayImageUrl('javascript:alert(1)'), '');
  assert.equal(isUploadedDataUrl('data:image/png;base64,AAAA'), true);
  assert.equal(isUploadedDataUrl('https://example.com/a.png'), false);
});

test('isWithinFirestoreDocBudget enforces the 850 KB safe ceiling and deriveInitials formats fallbacks', () => {
  assert.equal(isWithinFirestoreDocBudget({ small: 'payload' }, 1024), true);
  assert.equal(isWithinFirestoreDocBudget({ huge: 'x'.repeat(2000) }, 1024), false);
  assert.equal(deriveInitials("Axe's Era"), 'AE');
});
