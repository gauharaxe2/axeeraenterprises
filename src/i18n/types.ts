export type Language =
  | 'en'
  | 'ur'
  | 'ar'
  | 'es'
  | 'zh'
  | 'ru'
  | 'de'
  | 'ja'
  | 'fr'
  | 'it';

export interface LanguageOption {
  code: Language;
  shortCode: string;
  nativeLabel: string;
  englishName: string;
  dir: 'ltr' | 'rtl';
}

export interface LocalizedGeneralInfo {
  heroTitle: string;
  heroSubtitle: string;
  aboutTitle: string;
  aboutParagraph1: string;
  aboutParagraph2: string;
  statsLabels: {
    years: string;
    experts: string;
    projects: string;
    retention: string;
  };
  urgentNotice: string;
  partnershipNotice: string;
}

export interface LocalizedStrings {
  brand: {
    name: string;
    tagline: string;
  };
  nav: {
    home: string;
    about: string;
    services: string;
    websites: string;
    blogs: string;
    team: string;
    testimonials: string;
    partnership: string;
    contact: string;
    location: string;
    faq: string;
    policies: string;
  };
  hero: {
    title: string;
    subtitle: string;
    startProject: string;
    exploreCaseStudies: string;
  };
  trustSignals: {
    title: string;
  };
  about: {
    sectionTitle: string;
    sectionSubtitle: string;
    heading: string;
    paragraph1: string;
    paragraph2: string;
    yearsLabel: string;
    expertsLabel: string;
    projectsLabel: string;
    retentionLabel: string;
    cta: string;
  };
  services: {
    sectionTitle: string;
    sectionSubtitle: string;
    learnMore: string;
    exploreAll: string;
    items: Record<string, { title: string; shortDesc: string; fullDesc?: string }>;
  };
  caseStudies: {
    sectionTitle: string;
    sectionSubtitle: string;
    filterAll: string;
    filterEcommerce: string;
    filterSaas: string;
    filterMarketplaces: string;
    viewLiveSite: string;
    exploreAll: string;
    items: Record<string, { title: string; subtitle: string; description: string; metric?: string }>;
  };
  blogs: {
    sectionTitle: string;
    sectionSubtitle: string;
    readArticle: string;
    exploreAll: string;
    photosLabel: string;
    readTimeLabel: string;
  };
  team: {
    sectionTitle: string;
    sectionSubtitle: string;
    founderRole: string;
    founderBio: string;
    cta: string;
  };
  testimonials: {
    sectionTitle: string;
    sectionSubtitle: string;
    cta: string;
  };
  partnerships: {
    sectionTitle: string;
    sectionSubtitle: string;
    ecosystemBadge: string;
    partnersHeading: string;
    notice: string;
    visitPartner: string;
    cta: string;
  };
  contact: {
    sectionTitle: string;
    sectionSubtitle: string;
    getInTouch: string;
    description: string;
    urgentNotice: string;
    addressLabel: string;
    phoneLabel: string;
    emailLabel: string;
    namePlaceholder: string;
    emailPlaceholder: string;
    companyPlaceholder: string;
    servicePlaceholder: string;
    messagePlaceholder: string;
    sendButton: string;
    sendingButton: string;
  };
  policies: {
    badge: string;
    sectionTitle: string;
    sectionSubtitle: string;
    legalNoticeTitle: string;
    legalNoticeDesc: string;
    privacyPolicyTitle: string;
    privacyPolicyDesc: string;
    termsOfServiceTitle: string;
    termsOfServiceDesc: string;
    readNotice: string;
    readPrivacy: string;
    readTerms: string;
  };
  faq: {
    sectionTitle: string;
    sectionSubtitle: string;
    cta: string;
    items?: Record<string, { question: string; answer: string }>;
  };
  footer: {
    brandDesc: string;
    founderInfo: string;
    servicesHeading: string;
    companyHeading: string;
    policiesHeading: string;
    connectHeading: string;
    allServicesCta: string;
    newsletterHeading: string;
    newsletterDesc: string;
    newsletterPlaceholder: string;
    newsletterButton: string;
    newsletterSubscribing: string;
    newsletterSuccess: string;
    newsletterEmailRequired: string;
    newsletterError: string;
    copyright: string;
  };
  common: {
    backToHome: string;
    bookConsultation: string;
    instantWhatsapp: string;
  };
}
