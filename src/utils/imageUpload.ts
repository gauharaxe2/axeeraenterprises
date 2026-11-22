export const ALLOWED_IMAGE_MIME_TYPES = [
  'image/jpeg',
  'image/jpg',
  'image/png',
  'image/webp',
  'image/gif',
  'image/avif'
] as const;

export const ALLOWED_IMAGE_EXTENSIONS = [
  '.jpg',
  '.jpeg',
  '.png',
  '.webp',
  '.gif',
  '.avif'
] as const;

export const MAX_RAW_IMAGE_BYTES = 15 * 1024 * 1024; // 15 MB input file ceiling
export const DEFAULT_MAX_ENCODED_LENGTH = 220_000; // ~165 KB binary footprint to keep Firestore < 1 MB
export const TEAM_PHOTO_MAX_DIMENSION = 480;
export const REVIEW_AVATAR_MAX_DIMENSION = 240;
export const SERVICE_IMAGE_MAX_DIMENSION = 800;
export const PROJECT_IMAGE_MAX_DIMENSION = 960;
export const FIRESTORE_SAFE_SECTION_BYTES = 850_000;

export interface ImageValidationInput {
  type?: string;
  size: number;
  name?: string;
}

export type ImageValidationResult =
  | { ok: true }
  | { ok: false; error: string };

export function validateImageFile(file: ImageValidationInput): ImageValidationResult {
  if (!file || typeof file.size !== 'number' || file.size <= 0) {
    return { ok: false, error: 'Selected file is empty. Please choose a valid image file.' };
  }

  if (file.size > MAX_RAW_IMAGE_BYTES) {
    return {
      ok: false,
      error: 'Image file is larger than 15 MB. Please choose a smaller image.'
    };
  }

  const normalizedType = (file.type || '').trim().toLowerCase();
  const normalizedName = (file.name || '').trim().toLowerCase();
  const hasAllowedMime = (ALLOWED_IMAGE_MIME_TYPES as readonly string[]).includes(normalizedType);
  const hasAllowedExtension = ALLOWED_IMAGE_EXTENSIONS.some((ext) => normalizedName.endsWith(ext));

  if (!hasAllowedMime && !hasAllowedExtension) {
    return {
      ok: false,
      error: 'Unsupported file format. Please upload a PNG, JPG, WebP, GIF, or AVIF image.'
    };
  }

  return { ok: true };
}

export function computeScaledDimensions(
  width: number,
  height: number,
  maxDimension: number
): { width: number; height: number } {
  const safeWidth = Math.max(1, Math.round(width));
  const safeHeight = Math.max(1, Math.round(height));
  const safeMax = Math.max(32, Math.round(maxDimension));
  const longestSide = Math.max(safeWidth, safeHeight);

  if (longestSide <= safeMax) {
    return { width: safeWidth, height: safeHeight };
  }

  const scale = safeMax / longestSide;
  return {
    width: Math.max(1, Math.round(safeWidth * scale)),
    height: Math.max(1, Math.round(safeHeight * scale))
  };
}

export function sanitizeDisplayImageUrl(url: string | undefined | null): string {
  const trimmed = typeof url === 'string' ? url.trim() : '';
  if (!trimmed) return '';

  if (/^https?:\/\//i.test(trimmed)) {
    return trimmed;
  }

  if (trimmed.startsWith('/') && !trimmed.startsWith('//')) {
    return trimmed;
  }

  if (/^data:image\/(png|jpeg|jpg|webp|gif|avif);base64,[A-Za-z0-9+/=]+$/i.test(trimmed)) {
    return trimmed;
  }

  return '';
}

export function isUploadedDataUrl(url: string | undefined | null): boolean {
  return typeof url === 'string' && /^data:image\//i.test(url.trim());
}

export function estimateDataUrlSizeKb(url: string | undefined | null): number {
  if (!url) return 0;
  const trimmed = url.trim();
  const commaIdx = trimmed.indexOf(',');
  const payload = commaIdx >= 0 ? trimmed.slice(commaIdx + 1) : trimmed;
  const approxBytes = Math.ceil((payload.length * 3) / 4);
  return Math.max(1, Math.round(approxBytes / 1024));
}

export function estimateJsonSectionBytes(value: unknown): number {
  try {
    const json = JSON.stringify(value) || '';
    if (typeof TextEncoder !== 'undefined') {
      return new TextEncoder().encode(json).length;
    }
    return json.length;
  } catch {
    return 0;
  }
}

export function isWithinFirestoreDocBudget(
  value: unknown,
  budgetBytes: number = FIRESTORE_SAFE_SECTION_BYTES
): boolean {
  return estimateJsonSectionBytes(value) <= budgetBytes;
}

export function deriveInitials(name: string, explicitInitials?: string): string {
  const custom = (explicitInitials || '').trim();
  if (custom) return custom;

  const words = (name || '')
    .trim()
    .split(/\s+/)
    .filter(Boolean);

  if (words.length === 0) return 'AX';
  if (words.length === 1) return words[0].slice(0, 2).toUpperCase();
  return `${words[0][0].toUpperCase()}${words[words.length - 1][0].toUpperCase()}`;
}

export interface ProcessImageOptions {
  maxDimension?: number;
  maxEncodedLength?: number;
  quality?: number;
}

function readFileAsDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === 'string' && reader.result.startsWith('data:image/')) {
        resolve(reader.result);
      } else {
        reject(new Error('Could not read the selected image file.'));
      }
    };
    reader.onerror = () => reject(new Error('Failed to read image file.'));
    reader.readAsDataURL(file);
  });
}

function loadImageElement(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = () => reject(new Error('Unable to decode this image. Please try another PNG, JPG, or WebP file.'));
    img.src = src;
  });
}

/**
 * Validates, resizes, and compresses a user-selected image file to a compact
 * browser-safe Data URL so saved records remain fast and within Firestore's 1 MB doc limit.
 */
export async function processImageFileToDataUrl(
  file: File,
  options: ProcessImageOptions = {}
): Promise<string> {
  const validation = validateImageFile({
    type: file.type,
    size: file.size,
    name: file.name
  });

  if (!validation.ok) {
    throw new Error(validation.error);
  }

  const maxDimension = options.maxDimension ?? TEAM_PHOTO_MAX_DIMENSION;
  const maxEncodedLength = options.maxEncodedLength ?? DEFAULT_MAX_ENCODED_LENGTH;
  const initialQuality = options.quality ?? 0.84;

  const rawDataUrl = await readFileAsDataUrl(file);

  // If canvas is unavailable (unlikely in browser), fall back only when already compact
  if (typeof document === 'undefined') {
    if (rawDataUrl.length <= maxEncodedLength) return rawDataUrl;
    throw new Error('Image processing requires a browser environment.');
  }

  const img = await loadImageElement(rawDataUrl);
  const naturalW = img.naturalWidth || img.width || maxDimension;
  const naturalH = img.naturalHeight || img.height || maxDimension;

  let currentMaxEdge = maxDimension;
  const qualities = [initialQuality, 0.72, 0.58, 0.45];

  for (let pass = 0; pass < 3; pass += 1) {
    const target = computeScaledDimensions(naturalW, naturalH, currentMaxEdge);
    const canvas = document.createElement('canvas');
    canvas.width = target.width;
    canvas.height = target.height;

    const ctx = canvas.getContext('2d');
    if (!ctx) {
      if (rawDataUrl.length <= maxEncodedLength) return rawDataUrl;
      throw new Error('Browser canvas rendering context unavailable.');
    }

    ctx.clearRect(0, 0, target.width, target.height);
    ctx.drawImage(img, 0, 0, target.width, target.height);

    for (const q of qualities) {
      const webpCandidate = canvas.toDataURL('image/webp', q);
      const output =
        webpCandidate.startsWith('data:image/webp')
          ? webpCandidate
          : canvas.toDataURL('image/jpeg', q);

      if (output.length <= maxEncodedLength) {
        return output;
      }
    }

    currentMaxEdge = Math.max(96, Math.round(currentMaxEdge * 0.7));
  }

  throw new Error('Image could not be compressed cleanly enough for cloud storage. Please try a smaller photo.');
}
