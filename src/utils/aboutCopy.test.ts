import test from 'node:test';
import assert from 'node:assert/strict';
import {
  DEFAULT_ABOUT_HERO_SUBTITLE,
  DEFAULT_ABOUT_HERO_TITLE,
  DEFAULT_ABOUT_STORY_PARAGRAPH_1,
  DEFAULT_ABOUT_STORY_PARAGRAPH_2,
  normalizeAboutStoryParagraph1,
  normalizeAboutStoryParagraph2
} from './aboutCopy';

test('About Us hero constants match expected brand headline and subtitle', () => {
  assert.equal(DEFAULT_ABOUT_HERO_TITLE, "AXE'S ERA ENTERPRISES");
  assert.equal(DEFAULT_ABOUT_HERO_SUBTITLE, 'Your Digital Transformation Partner');
});

test('normalizeAboutStoryParagraph1 upgrades legacy Gauhar Axe default lead to Gauhar Nadeem', () => {
  const legacy =
    "Founded by Gauhar Axe, Axe's Era Enterprises has grown into a leading digital agency with over 3+ years of experience.";
  assert.equal(
    normalizeAboutStoryParagraph1(legacy),
    "Founded by Gauhar Nadeem, Axe's Era Enterprises has grown into a leading digital agency with over 3+ years of experience."
  );
  assert.equal(normalizeAboutStoryParagraph1(''), DEFAULT_ABOUT_STORY_PARAGRAPH_1);
  assert.equal(normalizeAboutStoryParagraph1(undefined), DEFAULT_ABOUT_STORY_PARAGRAPH_1);
});

test('normalizeAboutStoryParagraph1 and Paragraph2 preserve custom admin overrides', () => {
  assert.equal(
    normalizeAboutStoryParagraph1('Custom agency story written by the team.'),
    'Custom agency story written by the team.'
  );
  assert.equal(normalizeAboutStoryParagraph2('Custom second paragraph.'), 'Custom second paragraph.');
  assert.equal(normalizeAboutStoryParagraph2('   '), DEFAULT_ABOUT_STORY_PARAGRAPH_2);
});
