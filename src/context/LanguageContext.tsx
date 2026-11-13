import React, { createContext, useContext, useEffect, useState, useMemo } from 'react';
import type { Language, LocalizedStrings } from '../i18n/types';
import { TRANSLATIONS } from '../i18n/translations';
import { LANGUAGE_OPTIONS, isSupportedLanguage, isRtlLanguage } from '../i18n/languages';
import type { AgencyGeneralInfo, ServiceItem, Project, FaqItem } from '../types';

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  toggleLanguage: () => void;
  strings: LocalizedStrings;
  t: (path: string, fallback?: string) => string;
  translateGeneralInfo: (info: AgencyGeneralInfo) => AgencyGeneralInfo;
  translateServices: (services: ServiceItem[]) => ServiceItem[];
  translateProjects: (projects: Project[]) => Project[];
  translateFaqs: (faqs: FaqItem[]) => FaqItem[];
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

const STORAGE_KEY = 'axes_era_lang';

const FAQ_KEY_MATCHERS: Array<{ key: string; patterns: string[] }> = [
  { key: 'services', patterns: ['What services do you offer', 'What services does'] },
  { key: 'process', patterns: ['custom web development process work'] },
  { key: 'ownership', patterns: ['fully own the source code'] },
  { key: 'seo', patterns: ['SEO and digital marketing services'] },
  { key: 'timeline', patterns: ['typical web project take', 'How long does it take'] },
  { key: 'support', patterns: ['ongoing support', 'ongoing website maintenance'] },
  { key: 'redesign', patterns: ['redesign'] },
  { key: 'payment', patterns: ['payment terms'] },
  { key: 'mobile', patterns: ['iOS and Android'] },
  { key: 'consultation', patterns: ['schedule a consultation with Gauhar Axe'] }
];

export const LanguageProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [language, setLanguageState] = useState<Language>(() => {
    if (typeof window !== 'undefined') {
      try {
        const saved = localStorage.getItem(STORAGE_KEY);
        if (isSupportedLanguage(saved)) return saved;
      } catch {
        // ignore localStorage access error
      }
    }
    return 'en';
  });

  const setLanguage = (lang: Language) => {
    const valid = isSupportedLanguage(lang) ? lang : 'en';
    setLanguageState(valid);
    try {
      localStorage.setItem(STORAGE_KEY, valid);
    } catch {
      // ignore
    }
  };

  const toggleLanguage = () => {
    const idx = LANGUAGE_OPTIONS.findIndex((opt) => opt.code === language);
    const next = LANGUAGE_OPTIONS[(idx + 1) % LANGUAGE_OPTIONS.length];
    setLanguage(next.code);
  };

  useEffect(() => {
    if (typeof document !== 'undefined') {
      const rtl = isRtlLanguage(language);
      document.documentElement.lang = language;
      document.documentElement.dir = rtl ? 'rtl' : 'ltr';
      document.body.classList.toggle('lang-rtl', rtl);
      document.body.classList.toggle('lang-ur', language === 'ur');
      document.body.classList.toggle('lang-ar', language === 'ar');
    }
  }, [language]);

  const strings = useMemo(() => TRANSLATIONS[language] || TRANSLATIONS.en, [language]);

  const t = (path: string, fallback?: string): string => {
    const parts = path.split('.');
    let current: any = strings;
    for (const part of parts) {
      if (current && typeof current === 'object' && part in current) {
        current = current[part];
      } else {
        return fallback !== undefined ? fallback : path;
      }
    }
    return typeof current === 'string' ? current : fallback || path;
  };

  const translateGeneralInfo = useMemo(() => {
    return (info: AgencyGeneralInfo): AgencyGeneralInfo => {
      if (language === 'en') return info;
      const s = strings;
      return {
        ...info,
        heroTitle: s.hero.title,
        heroSubtitle: s.hero.subtitle,
        aboutTitle: s.about.heading,
        aboutParagraph1: s.about.paragraph1,
        aboutParagraph2: s.about.paragraph2,
        urgentNotice: s.contact.urgentNotice,
        partnershipNotice: s.partnerships.notice
      };
    };
  }, [language, strings]);

  const translateServices = useMemo(() => {
    return (services: ServiceItem[]): ServiceItem[] => {
      if (language === 'en') return services;
      const mapping = strings.services.items;
      return services.map((service) => {
        const match = mapping[service.id] || (service.slug ? mapping[service.slug] : undefined);
        if (!match) return service;
        return {
          ...service,
          title: match.title,
          shortDesc: match.shortDesc,
          fullDesc: match.fullDesc || service.fullDesc
        };
      });
    };
  }, [language, strings]);

  const translateProjects = useMemo(() => {
    const slugKeyMap: Record<string, string> = {
      'global-trade-hub': '1',
      'global-softwares-marketplace': '2',
      'shopaxe-web-store': '3',
      'shopaxe-shopify-store': '4',
      'saas-dashboard': '5',
      'estate-crm': '6'
    };
    return (projects: Project[]): Project[] => {
      if (language === 'en') return projects;
      const mapping = strings.caseStudies.items;
      return projects.map((project) => {
        const match = mapping[project.id] || mapping[slugKeyMap[project.id]];
        if (!match) return project;
        return {
          ...project,
          title: match.title,
          subtitle: match.subtitle,
          description: match.description,
          metric: match.metric || project.metric
        };
      });
    };
  }, [language, strings]);

  const translateFaqs = useMemo(() => {
    return (faqs: FaqItem[]): FaqItem[] => {
      if (language === 'en') return faqs;
      const faqItems = strings.faq.items;
      if (!faqItems) return faqs;
      return faqs.map((faq) => {
        const matcher = FAQ_KEY_MATCHERS.find((m) =>
          m.patterns.some((pattern) => faq.question.includes(pattern))
        );
        if (!matcher) return faq;
        const localized = faqItems[matcher.key];
        if (!localized) return faq;
        return {
          ...faq,
          question: localized.question,
          answer: localized.answer
        };
      });
    };
  }, [language, strings]);

  const contextValue = useMemo<LanguageContextType>(
    () => ({
      language,
      setLanguage,
      toggleLanguage,
      strings,
      t,
      translateGeneralInfo,
      translateServices,
      translateProjects,
      translateFaqs
    }),
    [language, strings, translateGeneralInfo, translateServices, translateProjects, translateFaqs]
  );

  return (
    <LanguageContext.Provider value={contextValue}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = (): LanguageContextType => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};
