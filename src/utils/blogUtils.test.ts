import test from 'node:test';
import assert from 'node:assert/strict';
import {
  normalizeBlogSections,
  aggregateParagraphs,
  collectArticleImages,
  countWords,
  getArticleWordCount,
  estimateReadingTime,
  calculateReadingProgress
} from './blogUtils';
import { BlogPost, BlogSection } from '../types';

test('normalizeBlogSections preserves existing structured sections', () => {
  const existingSections: BlogSection[] = [
    {
      id: 'sec-1',
      heading: 'Custom Heading 1',
      paragraphs: ['Paragraph 1', 'Paragraph 2'],
      imageUrl: 'https://example.com/sec1.jpg',
      imageCaption: 'Caption 1'
    }
  ];

  const post: BlogPost = {
    id: 'post-1',
    title: 'Test Post',
    slug: 'test-post',
    imageUrl: 'https://example.com/cover.jpg',
    summary: 'Test summary',
    paragraphs: ['Old paragraph'],
    sections: existingSections
  };

  const result = normalizeBlogSections(post);
  assert.equal(result.length, 1);
  assert.equal(result[0].heading, 'Custom Heading 1');
  assert.equal(result[0].paragraphs.length, 2);
  assert.equal(result[0].imageUrl, 'https://example.com/sec1.jpg');
});

test('normalizeBlogSections synthesizes sections from legacy paragraphs and images', () => {
  const post: BlogPost = {
    id: 'legacy-post',
    title: 'Legacy Post',
    slug: 'legacy-post',
    imageUrl: 'https://example.com/cover.jpg',
    images: ['https://example.com/cover.jpg', 'https://example.com/sec1.jpg'],
    summary: 'Legacy summary',
    paragraphs: ['First legacy para', 'Second legacy para']
  };

  const result = normalizeBlogSections(post);
  assert.equal(result.length, 2);
  assert.equal(result[0].heading, '1. Strategic Industry Overview');
  assert.equal(result[0].paragraphs[0], 'First legacy para');
  assert.equal(result[0].imageUrl, 'https://example.com/sec1.jpg');
  assert.equal(result[1].heading, '2. Key Technical Architecture');
  assert.equal(result[1].paragraphs[0], 'Second legacy para');
});

test('aggregateParagraphs combines and trims non-empty paragraphs from all sections', () => {
  const sections: BlogSection[] = [
    {
      id: 's1',
      heading: 'Heading 1',
      paragraphs: ['  First paragraph  ', '']
    },
    {
      id: 's2',
      heading: 'Heading 2',
      paragraphs: ['Second paragraph', '   Third paragraph   ']
    }
  ];

  const aggregated = aggregateParagraphs(sections);
  assert.deepEqual(aggregated, [
    'First paragraph',
    'Second paragraph',
    'Third paragraph'
  ]);
});

test('collectArticleImages collects unique cover, section, and gallery images without duplicates', () => {
  const sections: BlogSection[] = [
    {
      id: 's1',
      heading: 'Heading 1',
      paragraphs: ['Para 1'],
      imageUrl: 'https://example.com/image-1.jpg'
    },
    {
      id: 's2',
      heading: 'Heading 2',
      paragraphs: ['Para 2'],
      imageUrl: 'https://example.com/image-2.jpg'
    }
  ];

  const images = collectArticleImages(
    'https://example.com/cover.jpg',
    sections,
    ['https://example.com/image-1.jpg', 'https://example.com/gallery.jpg']
  );

  assert.deepEqual(images, [
    'https://example.com/cover.jpg',
    'https://example.com/image-1.jpg',
    'https://example.com/image-2.jpg',
    'https://example.com/gallery.jpg'
  ]);
});

test('countWords handles empty strings, punctuation, and irregular whitespace', () => {
  assert.equal(countWords(''), 0);
  assert.equal(countWords('   \n\t  '), 0);
  assert.equal(countWords('Hello   world\nfrom   Axe'), 4);
});

test('getArticleWordCount prefers structured sections when present and falls back to paragraphs', () => {
  const structuredPost: BlogPost = {
    id: 'p1',
    title: 'Two Words',
    slug: 'p1',
    imageUrl: '',
    summary: 'Three summary words',
    paragraphs: ['Ignored legacy paragraph with many extra words'],
    sections: [
      {
        id: 's1',
        heading: 'Section Heading',
        paragraphs: ['One two three four']
      }
    ]
  };
  assert.equal(getArticleWordCount(structuredPost), 2 + 3 + 2 + 4);

  const legacyPost: BlogPost = {
    id: 'p2',
    title: 'One',
    slug: 'p2',
    imageUrl: '',
    summary: 'Two three',
    paragraphs: ['Four five six']
  };
  assert.equal(getArticleWordCount(legacyPost), 6);
});

test('estimateReadingTime rounds up to whole minutes with a 1-minute floor', () => {
  const shortPost: BlogPost = {
    id: 'short',
    title: 'Short Post',
    slug: 'short',
    imageUrl: '',
    summary: 'Brief summary',
    paragraphs: ['Only ten words in this entire very short article body.']
  };
  const shortStats = estimateReadingTime(shortPost, 200);
  assert.equal(shortStats.wordCount, 14);
  assert.equal(shortStats.minutes, 1);

  const fourHundredFiftyWords = Array.from({ length: 450 }, (_, i) => `word${i}`).join(' ');
  const longPost: BlogPost = {
    id: 'long',
    title: '',
    slug: 'long',
    imageUrl: '',
    summary: '',
    paragraphs: [fourHundredFiftyWords]
  };
  const longStats = estimateReadingTime(longPost, 200);
  assert.equal(longStats.wordCount, 450);
  assert.equal(longStats.minutes, 3);
});

test('calculateReadingProgress tracks scroll from 0 to 100 and clamps bounds', () => {
  assert.equal(
    calculateReadingProgress({
      scrollY: 0,
      articleTop: 400,
      articleHeight: 2000,
      viewportHeight: 900
    }),
    0
  );

  // articleBottom = 2400, scrollable = 2400 - 900 = 1500
  assert.equal(
    calculateReadingProgress({
      scrollY: 750,
      articleTop: 400,
      articleHeight: 2000,
      viewportHeight: 900
    }),
    50
  );

  assert.equal(
    calculateReadingProgress({
      scrollY: 1500,
      articleTop: 400,
      articleHeight: 2000,
      viewportHeight: 900
    }),
    100
  );

  // Past article bottom into footer stays clamped at 100
  assert.equal(
    calculateReadingProgress({
      scrollY: 2200,
      articleTop: 400,
      articleHeight: 2000,
      viewportHeight: 900
    }),
    100
  );

  // Short article fitting in viewport uses document scroll fallback when available
  assert.equal(
    calculateReadingProgress({
      scrollY: 150,
      articleTop: 100,
      articleHeight: 400,
      viewportHeight: 900,
      documentHeight: 1200
    }),
    50
  );
});
