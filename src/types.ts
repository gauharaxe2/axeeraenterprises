export interface Project {
  id: string;
  title: string;
  subtitle: string;
  category: 'ecommerce' | 'saas' | 'web';
  metric: string;
  link: string;
  imageUrl: string;
  description?: string;
  tags?: string[];
}

export interface ServiceItem {
  id: string;
  title: string;
  shortDesc: string;
  icon: string;
  slug?: string;
  features?: string[];
  fullDesc?: string;
}

export const BLOG_CATEGORIES = [
  '🌐 Web Development',
  '📱 Mobile App Development',
  '🎨 Branding & Design',
  '🔍 SEO & Organic Traffic',
  '📈 Digital Marketing',
  '📲 Social Media Management',
  '💻 Digital Products & SaaS',
  '🛒 E-Commerce',
  '🧠 Authority/Expertise Content'
] as const;

export type BlogCategory = (typeof BLOG_CATEGORIES)[number] | string;

export interface BlogSection {
  id: string;
  heading: string;
  paragraphs: string[];
  imageUrl?: string;
  imageCaption?: string;
}

export interface BlogPost {
  id: string;
  title: string;
  slug: string;
  imageUrl: string;
  images?: string[];
  summary: string;
  paragraphs: string[];
  sections?: BlogSection[];
  date?: string;
  category?: BlogCategory;
  readTime?: string;
  author?: string;
  tags?: string[];
}

export interface Testimonial {
  id: string;
  name: string;
  role: string;
  initials: string;
  quote: string;
  rating: number;
}

export interface FaqItem {
  id?: string;
  question: string;
  answer: string;
}

export interface PartnershipItem {
  id: string;
  title: string;
  description: string;
  icon: 'Handshake' | 'Network' | 'Globe';
}

export interface PartnerLogo {
  id: string;
  name: string;
  logoUrl: string;
  websiteUrl?: string;
}

export interface TeamMemberData {
  id: string;
  name: string;
  title: string;
  bio: string;
  imageUrl: string;
  socials: {
    linkedin?: string;
    twitter?: string;
    upwork?: string;
    youtube?: string;
    facebook?: string;
    instagram?: string;
    github?: string;
  };
}

export interface AgencyGeneralInfo {
  heroTitle: string;
  heroSubtitle: string;
  aboutTitle: string;
  aboutParagraph1: string;
  aboutParagraph2: string;
  aboutImageUrl: string;
  stats: {
    years: number;
    experts: number;
    projects: number;
    retention: number;
  };
  contactAddress: string;
  contactPhone: string;
  contactEmail: string;
  whatsappNumber: string;
  urgentNotice: string;
  partnershipNotice: string;
}

export interface ContactFormData {
  name: string;
  email: string;
  company: string;
  service: string;
  message: string;
}

export type PolicyType = 'legal-notice' | 'privacy-policy' | 'terms-of-service';

export type PageView =
  | 'home'
  | 'blogs'
  | 'blog-detail'
  | 'service-detail'
  | 'policies'
  | 'not-found';

export type AdminTab =
  | 'queries'
  | 'general'
  | 'services'
  | 'projects'
  | 'blogs'
  | 'team'
  | 'testimonials'
  | 'partnerships'
  | 'partner-logos'
  | 'faqs'
  | 'backup';

