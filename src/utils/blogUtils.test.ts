import test from 'node:test';
import assert from 'node:assert/strict';
import { normalizeBlogSections, aggregateParagraphs, collectArticleImages } from './blogUtils';
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
