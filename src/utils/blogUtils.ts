import { BlogPost, BlogSection } from '../types';

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
  coverUrl: string,
  sections: BlogSection[],
  extraImages: string[] = []
): string[] {
  const list: string[] = [];

  const addIfUnique = (url?: string) => {
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
