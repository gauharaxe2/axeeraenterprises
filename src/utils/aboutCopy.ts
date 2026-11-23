export const DEFAULT_ABOUT_HERO_TITLE = "AXE'S ERA ENTERPRISES";
export const DEFAULT_ABOUT_HERO_SUBTITLE = 'Your Digital Transformation Partner';

export const DEFAULT_ABOUT_STORY_PARAGRAPH_1 =
  "Founded by Gauhar Nadeem, Axe's Era Enterprises has grown into a leading digital agency with over 3+ years of experience. We've helped hundreds of businesses establish their digital presence and achieve their goals. Our team combines creativity with technical expertise to deliver exceptional results.";

export const DEFAULT_ABOUT_STORY_PARAGRAPH_2 =
  'We believe in building long-term partnerships with our clients, understanding their unique challenges, and crafting tailored solutions that drive real business impact.';

const LEGACY_GAUHAR_AXE_LEAD = "Founded by Gauhar Axe, Axe's Era Enterprises";
const UPDATED_GAUHAR_NADEEM_LEAD = "Founded by Gauhar Nadeem, Axe's Era Enterprises";

export function normalizeAboutStoryParagraph1(value?: string): string {
  const trimmed = (value ?? '').trim();
  if (!trimmed) {
    return DEFAULT_ABOUT_STORY_PARAGRAPH_1;
  }
  if (trimmed.startsWith(LEGACY_GAUHAR_AXE_LEAD)) {
    return UPDATED_GAUHAR_NADEEM_LEAD + trimmed.slice(LEGACY_GAUHAR_AXE_LEAD.length);
  }
  return trimmed;
}

export function normalizeAboutStoryParagraph2(value?: string): string {
  const trimmed = (value ?? '').trim();
  return trimmed || DEFAULT_ABOUT_STORY_PARAGRAPH_2;
}
