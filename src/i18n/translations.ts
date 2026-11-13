import type { Language, LocalizedStrings } from './types.ts';
import { en } from './locales/en.ts';
import { ur } from './locales/ur.ts';
import { ar } from './locales/ar.ts';
import { es } from './locales/es.ts';
import { zh } from './locales/zh.ts';
import { ru } from './locales/ru.ts';
import { de } from './locales/de.ts';
import { ja } from './locales/ja.ts';
import { fr } from './locales/fr.ts';
import { it } from './locales/it.ts';

export const TRANSLATIONS: Record<Language, LocalizedStrings> = {
  en,
  ur,
  ar,
  es,
  zh,
  ru,
  de,
  ja,
  fr,
  it
};
