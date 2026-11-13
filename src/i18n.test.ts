import test from 'node:test';
import assert from 'node:assert/strict';
import { TRANSLATIONS } from './i18n/translations.ts';
import {
  LANGUAGE_OPTIONS,
  SUPPORTED_LANGUAGES,
  isSupportedLanguage,
  isRtlLanguage,
  getLanguageMeta
} from './i18n/languages.ts';
import type { AgencyGeneralInfo, ServiceItem, Project } from './types.ts';

const REQUIRED_LANGUAGES = ['en', 'ur', 'ar', 'es', 'zh', 'ru', 'de', 'ja', 'fr', 'it'] as const;

const REQUIRED_NAV_KEYS = [
  'home',
  'about',
  'services',
  'websites',
  'blogs',
  'team',
  'testimonials',
  'partnership',
  'contact',
  'location',
  'faq',
  'policies'
] as const;

const REQUIRED_SERVICES = [
  'web-development',
  'brand-design',
  'digital-marketing',
  'mobile-apps',
  'seo-optimization',
  'social-media',
  'digital-products'
] as const;

const REQUIRED_FAQ_KEYS = [
  'services',
  'process',
  'ownership',
  'seo',
  'timeline',
  'support',
  'redesign',
  'payment',
  'mobile',
  'consultation'
] as const;

test('language registry exposes all 10 supported languages with accurate RTL metadata', () => {
  assert.equal(LANGUAGE_OPTIONS.length, 10);
  for (const code of REQUIRED_LANGUAGES) {
    assert.ok(SUPPORTED_LANGUAGES.includes(code), `Missing language in registry: ${code}`);
    assert.equal(isSupportedLanguage(code), true);
    const meta = getLanguageMeta(code);
    assert.ok(meta.nativeLabel.length > 0);
    assert.ok(meta.shortCode.length > 0);
  }

  assert.equal(isRtlLanguage('ur'), true);
  assert.equal(isRtlLanguage('ar'), true);
  for (const ltrCode of ['en', 'es', 'zh', 'ru', 'de', 'ja', 'fr', 'it'] as const) {
    assert.equal(isRtlLanguage(ltrCode), false, `${ltrCode} should be LTR`);
  }
  assert.equal(isSupportedLanguage('xx'), false);
});

test('all 10 languages have complete dictionaries across nav, hero, services, case studies, policies, and footer', () => {
  for (const lang of REQUIRED_LANGUAGES) {
    const dict = TRANSLATIONS[lang];
    assert.ok(dict, `Missing translations for ${lang}`);
    assert.ok(dict.brand.name, `${lang} missing brand.name`);
    assert.ok(dict.brand.tagline, `${lang} missing brand.tagline`);
    assert.ok(dict.hero.title, `${lang} missing hero.title`);
    assert.ok(dict.hero.subtitle, `${lang} missing hero.subtitle`);
    assert.ok(dict.about.sectionTitle, `${lang} missing about.sectionTitle`);
    assert.ok(dict.contact.sendButton, `${lang} missing contact.sendButton`);
    assert.ok(dict.policies.legalNoticeTitle, `${lang} missing policies.legalNoticeTitle`);
    assert.ok(dict.footer.newsletterButton, `${lang} missing footer.newsletterButton`);
    assert.ok(dict.footer.copyright, `${lang} missing footer.copyright`);

    for (const navKey of REQUIRED_NAV_KEYS) {
      const val = (dict.nav as Record<string, string>)[navKey];
      assert.ok(val && val.trim().length > 0, `${lang}.nav missing ${navKey}`);
    }

    for (const sId of REQUIRED_SERVICES) {
      const s = dict.services.items[sId];
      assert.ok(s, `${lang}.services.items missing ${sId}`);
      assert.ok(s.title && s.shortDesc, `${lang}.services.items.${sId} incomplete`);
    }

    for (const pId of ['1', '2', '3', '4', '5', '6']) {
      const p = dict.caseStudies.items[pId];
      assert.ok(p && p.title && p.subtitle && p.description, `${lang}.caseStudies.items.${pId} incomplete`);
    }

    if (lang !== 'en') {
      assert.ok(dict.faq.items, `${lang} missing faq.items`);
      for (const fKey of REQUIRED_FAQ_KEYS) {
        const item = dict.faq.items?.[fKey];
        assert.ok(item?.question && item?.answer, `${lang}.faq.items.${fKey} incomplete`);
      }
      // Hero title should differ from English baseline in all non-English locales
      assert.notEqual(dict.hero.title, TRANSLATIONS.en.hero.title, `${lang} hero.title should be localized`);
    }
  }
});

test('service and project mappers translate known entities cleanly across new locales and preserve custom ones', () => {
  const sampleServices: ServiceItem[] = [
    {
      id: 'web-development',
      slug: 'web-development',
      title: 'Web Development',
      shortDesc: 'Build scalable websites and apps',
      fullDesc: 'English full desc',
      icon: 'Laptop',
      features: [],
      pricing: '$2,500'
    },
    {
      id: 'custom-ai-service',
      slug: 'custom-ai-service',
      title: 'Custom AI Automation',
      shortDesc: 'Unique custom service',
      fullDesc: 'Custom desc',
      icon: 'Cpu',
      features: [],
      pricing: '$5,000'
    }
  ];

  const arMapping = TRANSLATIONS.ar.services.items;
  const translatedAr = sampleServices.map((s) => {
    const m = arMapping[s.id] || (s.slug ? arMapping[s.slug] : undefined);
    return m ? { ...s, title: m.title, shortDesc: m.shortDesc } : s;
  });
  assert.equal(translatedAr[0].title, 'تطوير الويب');
  assert.equal(translatedAr[1].title, 'Custom AI Automation');

  const jaMapping = TRANSLATIONS.ja.caseStudies.items;
  const sampleProject: Project = {
    id: '1',
    title: 'Global Trade Hub',
    subtitle: 'Modern B2B E-commerce Platform',
    category: 'ecommerce',
    description: 'desc',
    tags: [],
    imageUrl: '',
    liveUrl: ''
  };
  const localizedJa = jaMapping[sampleProject.id];
  assert.ok(localizedJa.subtitle.includes('Eコマース'));

  const mockInfo: AgencyGeneralInfo = {
    heroTitle: 'Hero',
    heroSubtitle: 'Sub',
    aboutTitle: 'About',
    aboutParagraph1: 'P1',
    aboutParagraph2: 'P2',
    contactAddress: 'Multan, Pakistan',
    contactPhone: '+92 300 0000000',
    contactEmail: 'gauharaxe@outlook.com',
    whatsappNumber: '+923000000000',
    mapLatitude: 30.1575,
    mapLongitude: 71.5249,
    urgentNotice: 'Urgent',
    partnershipNotice: 'Partner'
  };

  const frInfo: AgencyGeneralInfo = {
    ...mockInfo,
    heroTitle: TRANSLATIONS.fr.hero.title,
    heroSubtitle: TRANSLATIONS.fr.hero.subtitle,
    aboutTitle: TRANSLATIONS.fr.about.heading
  };
  assert.equal(frInfo.heroTitle, TRANSLATIONS.fr.hero.title);
  assert.equal(frInfo.contactAddress, 'Multan, Pakistan');
});
