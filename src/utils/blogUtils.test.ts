import test from 'node:test';
import assert from 'node:assert/strict';
import {
  normalizeBlogSections,
  aggregateParagraphs,
  collectArticleImages,
  extractExtraArticleImages,
  prepareBlogForPublish,
  countWords,
  getArticleWordCount,
  estimateReadingTime,
  calculateReadingProgress,
  mergeMissingBuiltinBlogs
} from './blogUtils.ts';
import {
  blogsData,
  CURATED_WEB_DEV_BLOG_IDS,
  CURATED_MOBILE_APP_BLOG_IDS,
  CURATED_BRANDING_BLOG_IDS,
  CURATED_SEO_BLOG_IDS,
  CURATED_DIGITAL_MARKETING_BLOG_IDS,
  CURATED_SOCIAL_MEDIA_BLOG_IDS,
  CURATED_DIGITAL_PRODUCTS_SAAS_BLOG_IDS,
  CURATED_ECOMMERCE_BLOG_IDS,
  CURATED_AUTHORITY_BLOG_IDS
} from '../data/blogs.ts';
import type { BlogPost, BlogSection } from '../types.ts';

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

test('extractExtraArticleImages removes cover and section images to prevent payload duplication', () => {
  const coverDataUrl = 'data:image/webp;base64,COVERDATA';
  const sectionDataUrl = 'data:image/webp;base64,SECTIONDATA';
  const extraDataUrl = 'data:image/webp;base64,EXTRADATA';

  const extras = extractExtraArticleImages(
    coverDataUrl,
    [
      {
        id: 's1',
        heading: 'Section 1',
        paragraphs: ['Body'],
        imageUrl: sectionDataUrl
      }
    ],
    [coverDataUrl, sectionDataUrl, extraDataUrl, extraDataUrl, '   ']
  );

  assert.deepEqual(extras, [extraDataUrl]);
});

test('prepareBlogForPublish validates required title, summary, and section content', () => {
  const baseSections: BlogSection[] = [
    {
      id: 's1',
      heading: '1. Architecture',
      paragraphs: ['Detailed engineering insight paragraph.']
    }
  ];

  const missingTitle = prepareBlogForPublish({
    editingBlog: {
      id: 'b1',
      title: '   ',
      slug: '',
      imageUrl: '',
      summary: 'Valid summary',
      paragraphs: []
    },
    currentSections: baseSections,
    existingBlogs: [],
    isCreating: true
  });
  assert.equal(missingTitle.ok, false);
  if (!missingTitle.ok) {
    assert.match(missingTitle.error, /title/i);
  }

  const missingSummary = prepareBlogForPublish({
    editingBlog: {
      id: 'b1',
      title: 'Valid Title',
      slug: '',
      imageUrl: '',
      summary: '',
      paragraphs: []
    },
    currentSections: baseSections,
    existingBlogs: [],
    isCreating: true
  });
  assert.equal(missingSummary.ok, false);
  if (!missingSummary.ok) {
    assert.match(missingSummary.error, /summary/i);
  }

  const emptySections = prepareBlogForPublish({
    editingBlog: {
      id: 'b1',
      title: 'Valid Title',
      slug: '',
      imageUrl: '',
      summary: 'Valid summary',
      paragraphs: []
    },
    currentSections: [{ id: 's1', heading: 'Empty', paragraphs: ['   '] }],
    existingBlogs: [],
    isCreating: true
  });
  assert.equal(emptySections.ok, false);
  if (!emptySections.ok) {
    assert.match(emptySections.error, /section/i);
  }
});

test('prepareBlogForPublish stores cover and section images once instead of duplicating data URLs inside images[]', () => {
  const coverDataUrl = `data:image/webp;base64,${'A'.repeat(220_000)}`;
  const sectionDataUrl = `data:image/webp;base64,${'B'.repeat(220_000)}`;
  const extraDataUrl = `data:image/webp;base64,${'C'.repeat(120_000)}`;

  const result = prepareBlogForPublish({
    editingBlog: {
      id: 'blog-uploaded',
      title: 'Enterprise Performance Guide',
      slug: '',
      imageUrl: coverDataUrl,
      summary: 'How to structure fast React and Firestore platforms without hitting document limits.',
      metaDescription: '  Enterprise React and Firestore performance blueprint.  ',
      paragraphs: [],
      images: [coverDataUrl, sectionDataUrl, extraDataUrl],
      category: '⚡ Performance & Security'
    },
    currentSections: [
      {
        id: 'sec-1',
        heading: '1. Performance Blueprint',
        paragraphs: ['First technical paragraph.', 'Second technical paragraph.'],
        imageUrl: sectionDataUrl
      }
    ],
    existingBlogs: [],
    isCreating: true
  });

  assert.equal(result.ok, true);
  if (result.ok) {
    assert.equal(result.finalizedBlog.slug, 'enterprise-performance-guide');
    assert.equal(result.finalizedBlog.metaDescription, 'Enterprise React and Firestore performance blueprint.');
    assert.deepEqual(result.finalizedBlog.images, [extraDataUrl]);
    assert.deepEqual(
      collectArticleImages(
        result.finalizedBlog.imageUrl,
        result.finalizedBlog.sections,
        result.finalizedBlog.images
      ),
      [coverDataUrl, sectionDataUrl, extraDataUrl]
    );
    assert.ok(result.bytes < 600_000, `Expected non-duplicated payload < 600KB, got ${result.bytes}`);
  }
});

test('prepareBlogForPublish rejects payloads that exceed the cloud document budget', () => {
  const bigImage = `data:image/webp;base64,${'Z'.repeat(20_000)}`;
  const res = prepareBlogForPublish({
    editingBlog: {
      id: 'b-over',
      title: 'Oversized Article',
      slug: 'oversized-article',
      imageUrl: bigImage,
      summary: 'Summary text',
      paragraphs: []
    },
    currentSections: [
      {
        id: 's1',
        heading: 'Section',
        paragraphs: ['Paragraph content']
      }
    ],
    existingBlogs: [],
    isCreating: true,
    budgetBytes: 10_000
  });

  assert.equal(res.ok, false);
  if (!res.ok) {
    assert.match(res.error, /exceeds the/i);
  }
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

test('mergeMissingBuiltinBlogs adds missing articles without duplicating or overwriting existing ones', () => {
  const customPost: BlogPost = {
    id: 'what-is-web-development',
    title: 'Custom Edited Title',
    slug: 'what-is-web-development',
    imageUrl: 'https://example.com/custom.jpg',
    summary: 'Edited summary',
    paragraphs: ['Custom paragraph']
  };
  const builtinA: BlogPost = {
    id: 'what-is-web-development',
    title: 'Original Builtin',
    slug: 'what-is-web-development',
    imageUrl: '',
    summary: 'Original',
    paragraphs: ['Original']
  };
  const builtinB: BlogPost = {
    id: '10-signs-website-needs-redesign',
    title: '10 Signs',
    slug: '10-signs-website-needs-redesign',
    imageUrl: '',
    summary: 'Signs',
    paragraphs: ['Content']
  };

  const merged = mergeMissingBuiltinBlogs([customPost], [builtinA, builtinB]);
  assert.equal(merged.addedCount, 1);
  assert.equal(merged.nextBlogs.length, 2);
  assert.equal(merged.nextBlogs[0].title, 'Custom Edited Title');
  assert.equal(merged.nextBlogs[1].id, '10-signs-website-needs-redesign');

  const noOp = mergeMissingBuiltinBlogs(merged.nextBlogs, [builtinA, builtinB]);
  assert.equal(noOp.addedCount, 0);
  assert.equal(noOp.nextBlogs.length, 2);

  const selective = mergeMissingBuiltinBlogs([customPost], [builtinA, builtinB], ['only-missing-other-id']);
  assert.equal(selective.addedCount, 0);
  assert.equal(selective.nextBlogs.length, 1);
});

test('blogsData includes all curated Web Development articles ready for admin section images', () => {
  const ids = blogsData.map((b) => b.id);
  const slugs = blogsData.map((b) => b.slug);
  assert.equal(new Set(ids).size, ids.length, 'Blog IDs must be unique');
  assert.equal(new Set(slugs).size, slugs.length, 'Blog slugs must be unique');
  assert.equal(CURATED_WEB_DEV_BLOG_IDS.length, 14);

  for (const id of CURATED_WEB_DEV_BLOG_IDS) {
    const post = blogsData.find((b) => b.id === id);
    assert.ok(post, `Expected built-in blog ${id}`);
    assert.equal(post.category, '🌐 Web Development');
    assert.ok(post.metaDescription && post.metaDescription.trim().length > 20);
    assert.ok(post.summary && post.summary.trim().length > 20);
    assert.ok(post.sections && post.sections.length >= 6, `Expected structured sections on ${id}`);
    for (const sec of post.sections!) {
      assert.equal(sec.imageUrl, '', `Expected blank section imageUrl for later admin upload on ${sec.id}`);
      assert.equal(sec.imageCaption, '', `Expected blank section imageCaption for later admin upload on ${sec.id}`);
      assert.ok(sec.heading.trim().length > 0);
      assert.ok(sec.paragraphs.length > 0);
      for (const p of sec.paragraphs) {
        assert.equal(p.includes('**'), false, `Section ${sec.id} should not contain raw markdown bold markers`);
        assert.equal(p.includes('](https://'), false, `Section ${sec.id} should not contain raw markdown link markers`);
      }
    }
  }
});

test('blogsData includes all 10 curated Mobile App Development articles ready for admin section images', () => {
  assert.equal(CURATED_MOBILE_APP_BLOG_IDS.length, 10);

  for (const id of CURATED_MOBILE_APP_BLOG_IDS) {
    const post = blogsData.find((b) => b.id === id);
    assert.ok(post, `Expected built-in mobile app blog ${id}`);
    assert.equal(post.category, '📱 Mobile App Development');
    assert.ok(post.metaDescription && post.metaDescription.trim().length > 20);
    assert.ok(post.summary && post.summary.trim().length > 20);
    assert.ok(post.sections && post.sections.length >= 6, `Expected structured sections on ${id}`);
    for (const sec of post.sections!) {
      assert.equal(sec.imageUrl, '', `Expected blank section imageUrl for later admin upload on ${sec.id}`);
      assert.equal(sec.imageCaption, '', `Expected blank section imageCaption for later admin upload on ${sec.id}`);
      assert.ok(sec.heading.trim().length > 0);
      assert.ok(sec.paragraphs.length > 0);
      for (const p of sec.paragraphs) {
        assert.equal(p.includes('**'), false, `Section ${sec.id} should not contain raw markdown bold markers`);
        assert.equal(p.includes('](https://'), false, `Section ${sec.id} should not contain raw markdown link markers`);
      }
    }
  }
});

test('blogsData includes all 12 curated Branding & Design articles ready for admin section images', () => {
  assert.equal(CURATED_BRANDING_BLOG_IDS.length, 12);

  for (const id of CURATED_BRANDING_BLOG_IDS) {
    const post = blogsData.find((b) => b.id === id);
    assert.ok(post, `Expected built-in branding blog ${id}`);
    assert.equal(post.category, '🎨 Branding & Design');
    assert.ok(post.metaDescription && post.metaDescription.trim().length > 20);
    assert.ok(post.summary && post.summary.trim().length > 20);
    assert.ok(post.sections && post.sections.length >= 6, `Expected structured sections on ${id}`);
    for (const sec of post.sections!) {
      assert.equal(sec.imageUrl, '', `Expected blank section imageUrl for later admin upload on ${sec.id}`);
      assert.equal(sec.imageCaption, '', `Expected blank section imageCaption for later admin upload on ${sec.id}`);
      assert.ok(sec.heading.trim().length > 0);
      assert.ok(sec.paragraphs.length > 0);
      for (const p of sec.paragraphs) {
        assert.equal(p.includes('**'), false, `Section ${sec.id} should not contain raw markdown bold markers`);
        assert.equal(p.includes('](https://'), false, `Section ${sec.id} should not contain raw markdown link markers`);
      }
    }
  }
});

test('blogsData includes all 12 curated SEO & Organic Traffic articles ready for admin section images', () => {
  assert.equal(CURATED_SEO_BLOG_IDS.length, 12);

  for (const id of CURATED_SEO_BLOG_IDS) {
    const post = blogsData.find((b) => b.id === id);
    assert.ok(post, `Expected built-in SEO blog ${id}`);
    assert.equal(post.category, '🔍 SEO & Organic Traffic');
    assert.ok(post.metaDescription && post.metaDescription.trim().length > 20);
    assert.ok(post.summary && post.summary.trim().length > 20);
    assert.ok(post.sections && post.sections.length >= 6, `Expected structured sections on ${id}`);
    for (const sec of post.sections!) {
      assert.equal(sec.imageUrl, '', `Expected blank section imageUrl for later admin upload on ${sec.id}`);
      assert.equal(sec.imageCaption, '', `Expected blank section imageCaption for later admin upload on ${sec.id}`);
      assert.ok(sec.heading.trim().length > 0);
      assert.ok(sec.paragraphs.length > 0);
      for (const p of sec.paragraphs) {
        assert.equal(p.includes('**'), false, `Section ${sec.id} should not contain raw markdown bold markers`);
        assert.equal(p.includes('](https://'), false, `Section ${sec.id} should not contain raw markdown link markers`);
      }
    }
  }
});

test('blogsData includes all 12 curated Digital Marketing articles ready for admin section images', () => {
  assert.equal(CURATED_DIGITAL_MARKETING_BLOG_IDS.length, 12);

  for (const id of CURATED_DIGITAL_MARKETING_BLOG_IDS) {
    const post = blogsData.find((b) => b.id === id);
    assert.ok(post, `Expected built-in Digital Marketing blog ${id}`);
    assert.equal(post.category, '📈 Digital Marketing');
    assert.ok(post.metaDescription && post.metaDescription.trim().length > 20);
    assert.ok(post.summary && post.summary.trim().length > 20);
    assert.ok(post.sections && post.sections.length >= 6, `Expected structured sections on ${id}`);
    for (const sec of post.sections!) {
      assert.equal(sec.imageUrl, '', `Expected blank section imageUrl for later admin upload on ${sec.id}`);
      assert.equal(sec.imageCaption, '', `Expected blank section imageCaption for later admin upload on ${sec.id}`);
      assert.ok(sec.heading.trim().length > 0);
      assert.ok(sec.paragraphs.length > 0);
      for (const p of sec.paragraphs) {
        assert.equal(p.includes('**'), false, `Section ${sec.id} should not contain raw markdown bold markers`);
        assert.equal(p.includes('](https://'), false, `Section ${sec.id} should not contain raw markdown link markers`);
      }
    }
  }
});

test('blogsData includes all 12 curated Social Media Management articles ready for admin section images', () => {
  assert.equal(CURATED_SOCIAL_MEDIA_BLOG_IDS.length, 12);

  for (const id of CURATED_SOCIAL_MEDIA_BLOG_IDS) {
    const post = blogsData.find((b) => b.id === id);
    assert.ok(post, `Expected built-in Social Media blog ${id}`);
    assert.equal(post.category, '📲 Social Media Management');
    assert.ok(post.metaDescription && post.metaDescription.trim().length > 20);
    assert.ok(post.summary && post.summary.trim().length > 20);
    assert.ok(post.sections && post.sections.length >= 6, `Expected structured sections on ${id}`);
    for (const sec of post.sections!) {
      assert.equal(sec.imageUrl, '', `Expected blank section imageUrl for later admin upload on ${sec.id}`);
      assert.equal(sec.imageCaption, '', `Expected blank section imageCaption for later admin upload on ${sec.id}`);
      assert.ok(sec.heading.trim().length > 0);
      assert.ok(sec.paragraphs.length > 0);
      for (const p of sec.paragraphs) {
        assert.equal(p.includes('**'), false, `Section ${sec.id} should not contain raw markdown bold markers`);
        assert.equal(p.includes('](https://'), false, `Section ${sec.id} should not contain raw markdown link markers`);
      }
    }
  }
});

test('blogsData includes all 10 curated Digital Products & SaaS articles ready for admin section images', () => {
  assert.equal(CURATED_DIGITAL_PRODUCTS_SAAS_BLOG_IDS.length, 10);

  for (const id of CURATED_DIGITAL_PRODUCTS_SAAS_BLOG_IDS) {
    const post = blogsData.find((b) => b.id === id);
    assert.ok(post, `Expected built-in Digital Products & SaaS blog ${id}`);
    assert.equal(post.category, '💻 Digital Products & SaaS');
    assert.ok(post.metaDescription && post.metaDescription.trim().length > 20);
    assert.ok(post.summary && post.summary.trim().length > 20);
    assert.ok(post.sections && post.sections.length >= 6, `Expected structured sections on ${id}`);
    for (const sec of post.sections!) {
      assert.equal(sec.imageUrl, '', `Expected blank section imageUrl for later admin upload on ${sec.id}`);
      assert.equal(sec.imageCaption, '', `Expected blank section imageCaption for later admin upload on ${sec.id}`);
      assert.ok(sec.heading.trim().length > 0);
      assert.ok(sec.paragraphs.length > 0);
      for (const p of sec.paragraphs) {
        assert.equal(p.includes('**'), false, `Section ${sec.id} should not contain raw markdown bold markers`);
        assert.equal(p.includes('](https://'), false, `Section ${sec.id} should not contain raw markdown link markers`);
      }
    }
  }
});

test('blogsData includes all 10 curated E-Commerce articles ready for admin section images', () => {
  assert.equal(CURATED_ECOMMERCE_BLOG_IDS.length, 10);

  for (const id of CURATED_ECOMMERCE_BLOG_IDS) {
    const post = blogsData.find((b) => b.id === id);
    assert.ok(post, `Expected built-in E-Commerce blog ${id}`);
    assert.equal(post.category, '🛒 E-Commerce');
    assert.ok(post.metaDescription && post.metaDescription.trim().length > 20);
    assert.ok(post.summary && post.summary.trim().length > 20);
    assert.ok(post.sections && post.sections.length >= 6, `Expected structured sections on ${id}`);
    for (const sec of post.sections!) {
      assert.equal(sec.imageUrl, '', `Expected blank section imageUrl for later admin upload on ${sec.id}`);
      assert.equal(sec.imageCaption, '', `Expected blank section imageCaption for later admin upload on ${sec.id}`);
      assert.ok(sec.heading.trim().length > 0);
      assert.ok(sec.paragraphs.length > 0);
      for (const p of sec.paragraphs) {
        assert.equal(p.includes('**'), false, `Section ${sec.id} should not contain raw markdown bold markers`);
        assert.equal(p.includes('](https://'), false, `Section ${sec.id} should not contain raw markdown link markers`);
      }
    }
  }
});

test('blogsData includes all 10 curated Authority/Expertise Content articles ready for admin section images', () => {
  assert.equal(CURATED_AUTHORITY_BLOG_IDS.length, 10);

  for (const id of CURATED_AUTHORITY_BLOG_IDS) {
    const post = blogsData.find((b) => b.id === id);
    assert.ok(post, `Expected built-in Authority/Expertise blog ${id}`);
    assert.equal(post.category, '🧠 Authority/Expertise Content');
    assert.ok(post.metaDescription && post.metaDescription.trim().length > 20);
    assert.ok(post.summary && post.summary.trim().length > 20);
    assert.ok(post.sections && post.sections.length >= 6, `Expected structured sections on ${id}`);
    for (const sec of post.sections!) {
      assert.equal(sec.imageUrl, '', `Expected blank section imageUrl for later admin upload on ${sec.id}`);
      assert.equal(sec.imageCaption, '', `Expected blank section imageCaption for later admin upload on ${sec.id}`);
      assert.ok(sec.heading.trim().length > 0);
      assert.ok(sec.paragraphs.length > 0);
      for (const p of sec.paragraphs) {
        assert.equal(p.includes('**'), false, `Section ${sec.id} should not contain raw markdown bold markers`);
        assert.equal(p.includes('](https://'), false, `Section ${sec.id} should not contain raw markdown link markers`);
      }
    }
  }
});

test('prepareBlogForPublish allows collections larger than 850 KB within the 10 MB sharded cloud budget', () => {
  const bigImage = `data:image/webp;base64,${'W'.repeat(160_000)}`;
  const res = prepareBlogForPublish({
    editingBlog: {
      id: 'blog-expanded-storage',
      title: 'Expanded Cloud Storage Test',
      slug: 'expanded-cloud-storage-test',
      imageUrl: bigImage,
      summary: 'Verifies publishing succeeds when total blogs data exceeds 850 KB under the 10 MB sharded budget.',
      paragraphs: [],
      sections: [
        {
          id: 's1',
          heading: '1. Visual Walkthrough',
          paragraphs: ['Detailed technical walkthrough with embedded screenshot.'],
          imageUrl: `data:image/webp;base64,${'X'.repeat(160_000)}`
        }
      ]
    },
    currentSections: [
      {
        id: 's1',
        heading: '1. Visual Walkthrough',
        paragraphs: ['Detailed technical walkthrough with embedded screenshot.'],
        imageUrl: `data:image/webp;base64,${'X'.repeat(160_000)}`
      }
    ],
    existingBlogs: blogsData,
    isCreating: true
  });

  assert.equal(res.ok, true);
  if (res.ok) {
    assert.ok(res.bytes > 850_000, `Expected combined payload > 850 KB, got ${res.bytes}`);
  }
});
