import type { Language, LanguageOption } from './types.ts';

export const LANGUAGE_OPTIONS: LanguageOption[] = [
  { code: 'en', shortCode: 'EN', nativeLabel: 'English', englishName: 'English', dir: 'ltr' },
  { code: 'ur', shortCode: 'اردو', nativeLabel: 'اردو', englishName: 'Urdu', dir: 'rtl' },
  { code: 'ar', shortCode: 'AR', nativeLabel: 'العربية', englishName: 'Arabic', dir: 'rtl' },
  { code: 'es', shortCode: 'ES', nativeLabel: 'Español', englishName: 'Spanish', dir: 'ltr' },
  { code: 'zh', shortCode: '中文', nativeLabel: '中文', englishName: 'Chinese', dir: 'ltr' },
  { code: 'ru', shortCode: 'RU', nativeLabel: 'Русский', englishName: 'Russian', dir: 'ltr' },
  { code: 'de', shortCode: 'DE', nativeLabel: 'Deutsch', englishName: 'German', dir: 'ltr' },
  { code: 'ja', shortCode: '日本語', nativeLabel: '日本語', englishName: 'Japanese', dir: 'ltr' },
  { code: 'fr', shortCode: 'FR', nativeLabel: 'Français', englishName: 'French', dir: 'ltr' },
  { code: 'it', shortCode: 'IT', nativeLabel: 'Italiano', englishName: 'Italian', dir: 'ltr' }
];

export const SUPPORTED_LANGUAGES: Language[] = LANGUAGE_OPTIONS.map((opt) => opt.code);

export function isSupportedLanguage(value: string | null | undefined): value is Language {
  return Boolean(value && SUPPORTED_LANGUAGES.includes(value as Language));
}

export function getLanguageMeta(lang: Language): LanguageOption {
  return LANGUAGE_OPTIONS.find((opt) => opt.code === lang) || LANGUAGE_OPTIONS[0];
}

export function isRtlLanguage(lang: Language): boolean {
  return getLanguageMeta(lang).dir === 'rtl';
}
