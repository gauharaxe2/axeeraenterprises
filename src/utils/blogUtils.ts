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
