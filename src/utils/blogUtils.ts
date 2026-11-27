import type { BlogPost, BlogSection } from '../types.ts';
import {
  CLOUD_STORAGE_MAX_BYTES,
  estimateJsonSectionBytes,
  formatStorageSize,
  isWithinCloudStorageBudget
} from './imageUpload.ts';

const DEFAULT_BLOG_COVER_IMAGE =
  'https://images.unsplash.com/photo-1498050108023-c5249f4df085?auto=format&fit=crop&w=1200&q=80';

/**
 * Ensures a blog post has structured sections.
 * If sections are already populated, returns them.
 * Otherwise, synthesizes sections from legacy paragraphs and images.
 */
export function normalizeBlogSections(blog: BlogPost): BlogSection[] {
  if (blog.sections && blog.sections.length > 0) {
    return blog.sections;
  }

  const paras = blog.paragraphs && blog.paragraphs.length > 0
    ? blog.paragraphs
    : [blog.summary || 'Article content and strategic overview.'];

  return paras.map((p, idx) => ({
    id: `sec-${idx + 1}`,
    heading: idx === 0 ? '1. Strategic Industry Overview' : `${idx + 1}. Key Technical Architecture`,
    paragraphs: [p],
    imageUrl: blog.images && blog.images[idx + 1] ? blog.images[idx + 1] : undefined,
    imageCaption: `Key architectural insight ${idx + 1}`
  }));
}

/**
 * Aggregates all non-empty paragraphs from an array of sections.
 */
export function aggregateParagraphs(sections: BlogSection[]): string[] {
  const result: string[] = [];
  sections.forEach((sec) => {
    sec.paragraphs.forEach((p) => {
      const trimmed = p.trim();
      if (trimmed) {
        result.push(trimmed);
      }
    });
  });
  return result;
}

/**
 * Collects and deduplicates all unique images for an article:
 * cover image, section images, and additional gallery images.
 */
export function collectArticleImages(
  coverUrl?: string | null,
  sections: BlogSection[] = [],
  extraImages: string[] = []
): string[] {
  const list: string[] = [];

  const addIfUnique = (url?: string | null) => {
    if (url && url.trim() && !list.includes(url.trim())) {
      list.push(url.trim());
    }
  };

  addIfUnique(coverUrl);

  sections.forEach((s) => {
    addIfUnique(s.imageUrl);
  });

  extraImages.forEach((url) => {
    addIfUnique(url);
  });

  return list;
}

/**
 * Returns only unique extra showcase images that are not already stored as the
 * cover image or as any section image, preventing large base64 Data URL duplication.
 */
export function extractExtraArticleImages(
  coverUrl?: string | null,
  sections: BlogSection[] = [],
  extraImages: string[] = []
): string[] {
  const primarySet = new Set<string>();
  if (coverUrl && coverUrl.trim()) {
    primarySet.add(coverUrl.trim());
  }
  sections.forEach((sec) => {
    if (sec.imageUrl && sec.imageUrl.trim()) {
      primarySet.add(sec.imageUrl.trim());
    }
  });

  const extras: string[] = [];
  extraImages.forEach((url) => {
    const trimmed = typeof url === 'string' ? url.trim() : '';
    if (trimmed && !primarySet.has(trimmed) && !extras.includes(trimmed)) {
      extras.push(trimmed);
    }
  });

  return extras;
}

export type PrepareBlogPublishResult =
  | {
      ok: true;
      finalizedBlog: BlogPost;
      nextBlogs: BlogPost[];
      bytes: number;
    }
  | {
      ok: false;
      error: string;
    };

/**
 * Validates and builds a publish-ready BlogPost and updated blogs array while
 * deduplicating image storage and verifying the 10 MB multi-document cloud storage budget.
 */
export function prepareBlogForPublish(params: {
  editingBlog: BlogPost;
  currentSections: BlogSection[];
  existingBlogs: BlogPost[];
  isCreating: boolean;
  budgetBytes?: number;
}): PrepareBlogPublishResult {
  const {
    editingBlog,
    currentSections,
    existingBlogs,
    isCreating,
    budgetBytes = CLOUD_STORAGE_MAX_BYTES
  } = params;

  const trimmedTitle = editingBlog.title?.trim() || '';
  if (!trimmedTitle) {
    return { ok: false, error: 'Please enter an article title before publishing.' };
  }

  const trimmedSummary = editingBlog.summary?.trim() || '';
  if (!trimmedSummary) {
    return { ok: false, error: 'Please enter an article summary / excerpt before publishing.' };
  }

  const cleanSections: BlogSection[] = currentSections.map((sec, idx) => ({
    ...sec,
    id: sec.id || `sec-${idx + 1}`,
    heading: sec.heading.trim() || `Section ${idx + 1}`,
    paragraphs: sec.paragraphs.map((p) => p.trim()).filter(Boolean),
    imageUrl: sec.imageUrl?.trim() || '',
    imageCaption: sec.imageCaption?.trim() || ''
  }));

  if (cleanSections.length === 0 || cleanSections.every((s) => s.paragraphs.length === 0)) {
    return { ok: false, error: 'Please write content in at least one article section.' };
  }

  const aggregatedParagraphs = aggregateParagraphs(cleanSections);
  const coverImage = editingBlog.imageUrl?.trim() || DEFAULT_BLOG_COVER_IMAGE;
  const extraImages = extractExtraArticleImages(coverImage, cleanSections, editingBlog.images || []);

  const fallbackSlug =
    trimmedTitle
      .toLowerCase()
      .replace(/[^\w\s-]/g, '')
      .replace(/\s+/g, '-') ||
    editingBlog.id ||
    `article-${Date.now()}`;

  const trimmedMetaDescription = editingBlog.metaDescription?.trim() || undefined;

  const finalizedBlog: BlogPost = {
    ...editingBlog,
    id: editingBlog.id || `blog-${Date.now()}`,
    slug: (editingBlog.slug || '').trim() || fallbackSlug,
    title: trimmedTitle,
    summary: trimmedSummary,
    ...(trimmedMetaDescription ? { metaDescription: trimmedMetaDescription } : {}),
    imageUrl: coverImage,
    images: extraImages,
    category: editingBlog.category || '🌐 Web Development',
    paragraphs: aggregatedParagraphs.length > 0 ? aggregatedParagraphs : [trimmedSummary],
    sections: cleanSections
  };
  if (!trimmedMetaDescription) {
    delete finalizedBlog.metaDescription;
  }

  const nextBlogs = isCreating
    ? [finalizedBlog, ...existingBlogs.filter((b) => b.id !== finalizedBlog.id)]
    : existingBlogs.map((b) => (b.id === finalizedBlog.id ? finalizedBlog : b));

  const bytes = estimateJsonSectionBytes(nextBlogs);
  if (!isWithinCloudStorageBudget(nextBlogs, budgetBytes)) {
    const usedLabel = formatStorageSize(bytes);
    const limitLabel = formatStorageSize(budgetBytes);
    return {
      ok: false,
      error: `Total blogs data (${usedLabel}) exceeds the ${limitLabel} cloud sync budget. Replace some uploaded images with external URLs or remove unused screenshots.`
    };
  }

  return {
    ok: true,
    finalizedBlog,
    nextBlogs,
    bytes
  };
}

/**
 * Merges missing built-in articles into an existing blog collection without
 * duplicating or overwriting any articles already customized or published.
 */
export function mergeMissingBuiltinBlogs(
  existingBlogs: BlogPost[],
  builtinBlogs: BlogPost[],
  targetIds?: string[]
): { nextBlogs: BlogPost[]; addedCount: number } {
  const existingIds = new Set(existingBlogs.map((b) => b.id));
  const targetSet = targetIds ? new Set(targetIds) : null;
  const missing = builtinBlogs.filter(
    (b) => !existingIds.has(b.id) && (!targetSet || targetSet.has(b.id))
  );
  if (missing.length === 0) {
    return { nextBlogs: existingBlogs, addedCount: 0 };
  }
  return {
    nextBlogs: [...existingBlogs, ...missing],
    addedCount: missing.length
  };
}

export const DEFAULT_WORDS_PER_MINUTE = 200;

export interface ReadingStats {
  wordCount: number;
  minutes: number;
}

export interface ReadingProgressMetrics {
  scrollY: number;
  articleTop: number;
  articleHeight: number;
  viewportHeight: number;
  documentHeight?: number;
}

/**
 * Counts whitespace-delimited words in a string.
 */
export function countWords(text?: string | null): number {
  if (!text) return 0;
  const trimmed = text.trim();
  if (!trimmed) return 0;
  return trimmed.split(/\s+/).filter(Boolean).length;
}

/**
 * Computes total readable word count across an article's title, summary,
 * and structured sections (or legacy paragraphs when sections are absent).
 */
export function getArticleWordCount(
  blog: Pick<BlogPost, 'title' | 'summary' | 'paragraphs' | 'sections'>
): number {
  let total = countWords(blog.title) + countWords(blog.summary);

  if (blog.sections && blog.sections.length > 0) {
    blog.sections.forEach((section) => {
      total += countWords(section.heading);
      section.paragraphs.forEach((para) => {
        total += countWords(para);
      });
    });
  } else if (blog.paragraphs && blog.paragraphs.length > 0) {
    blog.paragraphs.forEach((para) => {
      total += countWords(para);
    });
  }

  return total;
}

/**
 * Estimates reading time in whole minutes (minimum 1 min) from article word count.
 */
export function estimateReadingTime(
  blog: Pick<BlogPost, 'title' | 'summary' | 'paragraphs' | 'sections'>,
  wordsPerMinute = DEFAULT_WORDS_PER_MINUTE
): ReadingStats {
  const safeWpm = wordsPerMinute > 0 ? wordsPerMinute : DEFAULT_WORDS_PER_MINUTE;
  const wordCount = getArticleWordCount(blog);
  const minutes = wordCount === 0 ? 1 : Math.max(1, Math.ceil(wordCount / safeWpm));
  return { wordCount, minutes };
}

/**
 * Calculates article reading progress as a clamped percentage [0, 100].
 */
export function calculateReadingProgress({
  scrollY,
  articleTop,
  articleHeight,
  viewportHeight,
  documentHeight
}: ReadingProgressMetrics): number {
  if (scrollY <= 0) return 0;

  const articleBottom = articleTop + Math.max(0, articleHeight);
  const scrollableDistance = articleBottom - viewportHeight;

  if (scrollableDistance <= 0) {
    if (typeof documentHeight === 'number' && documentHeight > viewportHeight) {
      const docScrollable = documentHeight - viewportHeight;
      const pct = (scrollY / docScrollable) * 100;
      return Math.min(100, Math.max(0, Math.round(pct * 10) / 10));
    }
    return 100;
  }

  const raw = (scrollY / scrollableDistance) * 100;
  return Math.min(100, Math.max(0, Math.round(raw * 10) / 10));
}
