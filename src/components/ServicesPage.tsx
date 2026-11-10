import React, { useState, useMemo } from 'react';
import {
  ArrowLeft,
  ArrowRight,
  Laptop,
  Palette,
  TrendingUp,
  Smartphone,
  Search,
  Megaphone,
  Box,
  CheckCircle2,
  ShieldCheck,
  Zap,
  Clock,
  Layers,
  Code2,
  Sparkles,
  HelpCircle,
  MessageSquare,
  FileCheck
} from 'lucide-react';
import { ServiceItem } from '../types';

interface ServicesPageProps {
  services: ServiceItem[];
  onBackToHome: () => void;
  onSelectService: (service: ServiceItem) => void;
  onContactClick: (serviceName?: string) => void;
}

// Category mapping helper
const SERVICE_CATEGORIES = [
  'All Capabilities',
  'Web & Cloud Systems',
  'Brand & Design',
  'Growth & Marketing',
  'Mobile Applications',
  'Digital Products & SaaS'
] as const;

type ServiceCategory = (typeof SERVICE_CATEGORIES)[number];

const SERVICE_META: Record<
  string,
  {
    category: ServiceCategory;
    timeline: string;
    techStack: string[];
    deliverables: string[];
    highlight: string;
  }
> = {
  'web-development': {
    category: 'Web & Cloud Systems',
    timeline: '2–6 Weeks Sprint Delivery',
    techStack: ['React 19', 'Next.js', 'TypeScript', 'Node.js', 'Tailwind CSS', 'PostgreSQL', 'Cloudflare Edge'],
    deliverables: [
      'Custom Web Applications & Enterprise Portals',
      'High-Concurrency Headless Architectures',
      'E-Commerce & Global Payment Gateway Integrations (Stripe)',
      'Progressive Web Apps (PWA) with Offline-First Caching',
      'REST & GraphQL APIs with Comprehensive OpenAPI Docs',
      'CI/CD Automated Deployment Pipelines & Cloud Monitoring'
    ],
    highlight: 'Engineered for sub-second page loads and Lighthouse 95+ performance scores.'
  },
  'brand-design': {
    category: 'Brand & Design',
    timeline: '1–3 Weeks Iterative Sprints',
    techStack: ['Figma', 'Adobe Creative Cloud', 'Design Systems', 'Vector Tooling', 'Typography Grids'],
    deliverables: [
      'Iconic Brand Mark & Logo Vector Systems',
      'Full Design Tokens & Typography Hierarchies',
      'Comprehensive Enterprise Brand Style Guidelines',
      'Multi-Format Marketing Collateral & Presentation Decks',
      'Responsive Web & Mobile Component Library in Figma',
      'Social Media Avatar Suites & Vector Digital Assets'
    ],
    highlight: 'Crafting authoritative identities that command premium market positioning.'
  },
  'digital-marketing': {
    category: 'Growth & Marketing',
    timeline: 'Continuous Monthly Retainers & Sprints',
    techStack: ['Google Ads', 'GA4 & BigQuery', 'Hotjar Heatmaps', 'Conversion Funnels', 'HubSpot / Klaviyo'],
    deliverables: [
      'Full-Funnel Conversion Rate Optimization (CRO)',
      'High-Intent Google Ads & Pay-Per-Click Campaigns',
      'Multi-Channel Attribution Modeling & ROI Dashboards',
      'Automated Email Lifecycle Flows & Lead Nurturing',
      'Behavioral Heatmap & Drop-off Funnel Analysis',
      'Actionable Monthly Growth Strategy & Executive Briefings'
    ],
    highlight: 'Data-driven growth engines built for measurable customer acquisition.'
  },
  'mobile-apps': {
    category: 'Mobile Applications',
    timeline: '3–8 Weeks Agile Production',
    techStack: ['React Native', 'Flutter', 'Swift / SwiftUI', 'Kotlin', 'Firebase / Supabase', 'App Store Connect'],
    deliverables: [
      'Cross-Platform iOS & Android Deployments',
      'Native Swift & Kotlin High-Performance Modules',
      'Offline-First Local Storage & Real-Time Cloud Sync',
      'Push Notification Pipelines & Deep Linking',
      'Biometric Authentication & In-App Subscriptions',
      'App Store Optimization (ASO) & Launch Submission Support'
    ],
    highlight: 'Ergonomically tuned mobile experiences that users love to engage with daily.'
  },
  'seo-optimization': {
    category: 'Growth & Marketing',
    timeline: '3–6 Month Compounding Authority Campaigns',
    techStack: ['Ahrefs', 'SEMrush', 'Screaming Frog', 'Google Search Console', 'Schema.org JSON-LD'],
    deliverables: [
      'Technical Core Web Vitals & Speed Optimization Audits',
      'High-Commercial Intent Keyword Architecture',
      'Structured Data / Rich Snippets (Schema.org) Integration',
      'Content Gap Analysis & Topic Clustering Strategy',
      'White-Hat Editorial Backlink Acquisition',
      'Competitor Keyword Dominance & Organic Rank Tracking'
    ],
    highlight: 'Building long-term organic equity that outranks legacy market competitors.'
  },
  'social-media': {
    category: 'Growth & Marketing',
    timeline: 'Bi-Weekly Content Cadences',
    techStack: ['CapCut Pro', 'Canva Enterprise', 'Sprout Social', 'Meta Business Suite', 'LinkedIn Creator'],
    deliverables: [
      'Custom Content Calendars & Editorial Brand Messaging',
      'Short-Form Video Production (Reels, TikTok, Shorts)',
      'Carousel Infographics & Thought Leadership Graphic Suites',
      'Proactive Community Engagement & Comment Moderation',
      'Paid Social Ad Creative Testing & Hook Optimization',
      'Audience Sentiment & Viral Engagement Analytics'
    ],
    highlight: 'Turning social channels into active client trust accelerators.'
  },
  'digital-products': {
    category: 'Digital Products & SaaS',
    timeline: '4–10 Weeks MVP to Production',
    techStack: ['Next.js App Router', 'Serverless Edge', 'Stripe Billing', 'PostgreSQL / Supabase', 'Docker'],
    deliverables: [
      'Multi-Tenant SaaS Architecture & User Management',
      'Recurring Subscription Billing & Tiered Pricing Gates',
      'Interactive Customer Analytics & Self-Service Dashboards',
      'Automated Background Jobs & Webhook Processors',
      'Role-Based Access Control (RBAC) & Team Workspaces',
      'Comprehensive User Onboarding & Product Tour Flows'
    ],
    highlight: 'Transforming domain expertise into scalable, high-margin software revenues.'
  }
};

const DEFAULT_META = {
  category: 'Web & Cloud Systems' as ServiceCategory,
  timeline: '2–4 Weeks Delivery',
  techStack: ['Modern Cloud Architecture', 'TypeScript', 'Secure APIs', 'Edge Deployment'],
  deliverables: [
    'Custom Technical Architecture',
    'High-Security Code Standards',
    'Comprehensive Documentation',
    'Complete IP Ownership Transfer'
  ],
  highlight: 'Bespoke enterprise engineering designed for scalable digital performance.'
};

export const ServicesPage: React.FC<ServicesPageProps> = ({
  services,
  onBackToHome,
  onSelectService,
  onContactClick
}) => {
  const [selectedCategory, setSelectedCategory] = useState<ServiceCategory>('All Capabilities');
  const [searchQuery, setSearchQuery] = useState('');
  const [openFaqIndex, setOpenFaqIndex] = useState<number | null>(0);

  const getIcon = (iconName: string) => {
    switch (iconName) {
      case 'Laptop':
        return <Laptop size={28} />;
      case 'Palette':
        return <Palette size={28} />;
      case 'TrendingUp':
        return <TrendingUp size={28} />;
      case 'Smartphone':
        return <Smartphone size={28} />;
      case 'Search':
        return <Search size={28} />;
      case 'Megaphone':
        return <Megaphone size={28} />;
      case 'Box':
        return <Box size={28} />;
      default:
        return <Laptop size={28} />;
    }
  };

  const filteredServices = useMemo(() => {
    return services.filter((service) => {
      const meta = SERVICE_META[service.id] || DEFAULT_META;
      const q = searchQuery.toLowerCase().trim();

      const matchesCategory =
        selectedCategory === 'All Capabilities' || meta.category === selectedCategory;

      const matchesSearch =
        !q ||
        service.title.toLowerCase().includes(q) ||
        service.shortDesc.toLowerCase().includes(q) ||
        (service.fullDesc && service.fullDesc.toLowerCase().includes(q)) ||
        meta.deliverables.some((d) => d.toLowerCase().includes(q)) ||
        meta.techStack.some((t) => t.toLowerCase().includes(q));

      return matchesCategory && matchesSearch;
    });
  }, [services, selectedCategory, searchQuery]);

  const faqs = [
    {
      q: 'How does Axe\'s Era Enterprise handle intellectual property (IP) and code ownership?',
      a: 'We transfer 100% full intellectual property rights, repository access, and design assets to you immediately upon final project sign-off and milestone completion. You own your code completely with zero vendor lock-in.'
    },
    {
      q: 'Can we combine multiple services into a single integrated digital engagement?',
      a: 'Absolutely. Many of our clients begin with a joint Brand Design + Web Development sprint, followed by ongoing SEO & Digital Marketing. We structure unified milestones and seamless handoffs across our entire engineering lifecycle.'
    },
    {
      q: 'What is your standard post-launch warranty and hypercare period?',
      a: 'Every custom build includes our 30-day post-launch warranty covering bug triage, performance tuning, and edge deployment verification at no additional cost. We also provide ongoing SLA maintenance retainers for continuous peace of mind.'
    },
    {
      q: 'How quickly can we kick off a new custom project or MVP?',
      a: 'Following our initial strategy call and architectural scope approval, we typically initialize repository environments and design sprints within 3 to 5 business days.'
    }
  ];

  return (
    <div className="services-page-view" style={{ minHeight: '100vh', background: '#0a0f1d', color: '#f8fafc' }}>
      {/* Top Breadcrumb & Return Nav */}
      <div
        style={{
          borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
          background: 'rgba(15, 23, 42, 0.85)',
          backdropFilter: 'blur(12px)',
          position: 'sticky',
          top: 0,
          zIndex: 40
        }}
      >
        <div
          className="container"
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            padding: '1rem 1.5rem'
          }}
        >
          <button
            onClick={onBackToHome}
            style={{
              background: 'transparent',
              border: 'none',
              color: 'var(--primary-color)',
              fontWeight: 600,
              fontSize: '0.95rem',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '8px',
              cursor: 'pointer'
            }}
          >
            <ArrowLeft size={18} /> Return to Home
          </button>

          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.85rem', color: 'var(--text-light)' }}>
            <span>Home</span>
            <span>/</span>
            <span style={{ color: '#fff', fontWeight: 600 }}>Enterprise Services</span>
          </div>

          <button
            onClick={() => onContactClick()}
            className="btn btn-primary"
            style={{ padding: '6px 16px', fontSize: '0.85rem', fontWeight: 700 }}
          >
            Start a Project
          </button>
        </div>
      </div>

      {/* Hero Section */}
      <section style={{ padding: '4rem 0 3rem', background: 'radial-gradient(circle at 50% 20%, rgba(212, 175, 55, 0.08), transparent 70%)' }}>
        <div className="container" style={{ textAlign: 'center', maxWidth: '900px', margin: '0 auto' }}>
          <div
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '8px',
              background: 'rgba(212, 175, 55, 0.12)',
              border: '1px solid rgba(212, 175, 55, 0.3)',
              padding: '6px 14px',
              borderRadius: '20px',
              color: 'var(--primary-color)',
              fontSize: '0.85rem',
              fontWeight: 700,
              letterSpacing: '0.5px',
              marginBottom: '1.5rem'
            }}
          >
            <Sparkles size={16} /> Elite Digital Solutions & Engineering Capabilities
          </div>

          <h1
            style={{
              fontSize: 'clamp(2.2rem, 4.5vw, 3.4rem)',
              fontWeight: 800,
              lineHeight: 1.2,
              marginBottom: '1.25rem',
              color: '#fff',
              letterSpacing: '-0.5px'
            }}
          >
            Architecting Scalable Systems & High-Growth Digital Experiences
          </h1>

          <p
            style={{
              fontSize: '1.1rem',
              lineHeight: 1.7,
              color: 'var(--text-light)',
              marginBottom: '2.5rem'
            }}
          >
            We partner with forward-thinking enterprises, high-growth startups, and visionary founders to engineer custom web platforms, native mobile applications, iconic visual identities, and revenue-accelerating marketing systems.
          </p>

          {/* Quick Pillar Value Badges */}
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
              gap: '1rem',
              textAlign: 'left',
              marginTop: '1.5rem'
            }}
          >
            <div style={{ background: 'rgba(15, 23, 42, 0.7)', border: '1px solid rgba(255, 255, 255, 0.08)', borderRadius: '10px', padding: '1rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#10b981', fontWeight: 700, fontSize: '0.9rem', marginBottom: '4px' }}>
                <ShieldCheck size={18} /> 100% IP Ownership
              </div>
              <p style={{ margin: 0, fontSize: '0.8rem', color: 'var(--text-light)', lineHeight: 1.4 }}>
                All source code, design files, and deployment keys transfer unconditionally to you.
              </p>
            </div>

            <div style={{ background: 'rgba(15, 23, 42, 0.7)', border: '1px solid rgba(255, 255, 255, 0.08)', borderRadius: '10px', padding: '1rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#38bdf8', fontWeight: 700, fontSize: '0.9rem', marginBottom: '4px' }}>
                <Zap size={18} /> Lighthouse 95+ Speed
              </div>
              <p style={{ margin: 0, fontSize: '0.8rem', color: 'var(--text-light)', lineHeight: 1.4 }}>
                Performance-first engineering delivering sub-second edge loads and pristine Core Web Vitals.
              </p>
            </div>

            <div style={{ background: 'rgba(15, 23, 42, 0.7)', border: '1px solid rgba(255, 255, 255, 0.08)', borderRadius: '10px', padding: '1rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--primary-color)', fontWeight: 700, fontSize: '0.9rem', marginBottom: '4px' }}>
                <Clock size={18} /> 30-Day Hypercare
              </div>
              <p style={{ margin: 0, fontSize: '0.8rem', color: 'var(--text-light)', lineHeight: 1.4 }}>
                Free post-launch warranty, uptime oversight, and critical bug triage included.
              </p>
            </div>

            <div style={{ background: 'rgba(15, 23, 42, 0.7)', border: '1px solid rgba(255, 255, 255, 0.08)', borderRadius: '10px', padding: '1rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#a855f7', fontWeight: 700, fontSize: '0.9rem', marginBottom: '4px' }}>
                <Layers size={18} /> Direct Tech Leadership
              </div>
              <p style={{ margin: 0, fontSize: '0.8rem', color: 'var(--text-light)', lineHeight: 1.4 }}>
                Work directly with Gauhar Axe and senior architects—zero junior middleman friction.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Filter and Search Controls */}
      <section style={{ padding: '2rem 0', borderTop: '1px solid rgba(255, 255, 255, 0.06)', borderBottom: '1px solid rgba(255, 255, 255, 0.06)', background: '#0e1424' }}>
        <div className="container">
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            {/* Category Pills */}
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', alignItems: 'center' }}>
              {SERVICE_CATEGORIES.map((cat) => {
                const isActive = selectedCategory === cat;
                return (
                  <button
                    key={cat}
                    onClick={() => setSelectedCategory(cat)}
                    style={{
                      padding: '8px 16px',
                      borderRadius: '8px',
                      fontSize: '0.85rem',
                      fontWeight: 600,
                      cursor: 'pointer',
                      transition: 'all 0.2s ease',
                      border: isActive
                        ? '1px solid var(--primary-color)'
                        : '1px solid rgba(255, 255, 255, 0.1)',
                      background: isActive
                        ? 'rgba(212, 175, 55, 0.15)'
                        : 'rgba(255, 255, 255, 0.03)',
                      color: isActive ? 'var(--primary-color)' : 'var(--text-light)'
                    }}
                  >
                    {cat}
                  </button>
                );
              })}
            </div>

            {/* Search Input */}
            <div style={{ position: 'relative', maxWidth: '480px' }}>
              <Search
                size={18}
                style={{
                  position: 'absolute',
                  left: '14px',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  color: 'var(--text-light)'
                }}
              />
              <input
                type="text"
                placeholder="Search capabilities, deliverables, or tech stacks..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                style={{
                  width: '100%',
                  padding: '10px 14px 10px 42px',
                  borderRadius: '8px',
                  background: '#151d32',
                  border: '1px solid rgba(255, 255, 255, 0.12)',
                  color: '#fff',
                  fontSize: '0.9rem'
                }}
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  style={{
                    position: 'absolute',
                    right: '12px',
                    top: '50%',
                    transform: 'translateY(-50%)',
                    background: 'transparent',
                    border: 'none',
                    color: 'var(--text-light)',
                    fontSize: '0.8rem',
                    cursor: 'pointer'
                  }}
                >
                  Clear
                </button>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Main Services List */}
      <section style={{ padding: '4rem 0' }}>
        <div className="container">
          <div style={{ marginBottom: '2rem', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', flexWrap: 'wrap', gap: '1rem' }}>
            <div>
              <h2 style={{ fontSize: '1.8rem', fontWeight: 800, color: '#fff', margin: '0 0 6px' }}>
                Enterprise Service Catalog ({filteredServices.length})
              </h2>
              <p style={{ margin: 0, color: 'var(--text-light)', fontSize: '0.95rem' }}>
                Showing full technical deliverables, timelines, and architectural specs.
              </p>
            </div>
            <div style={{ color: 'var(--primary-color)', fontSize: '0.85rem', fontWeight: 600 }}>
              Live Synced via Firestore
            </div>
          </div>

          {filteredServices.length === 0 ? (
            <div
              style={{
                textAlign: 'center',
                padding: '4rem 2rem',
                background: '#111827',
                borderRadius: '12px',
                border: '1px dashed rgba(255, 255, 255, 0.15)'
              }}
            >
              <HelpCircle size={40} style={{ color: 'var(--primary-color)', margin: '0 auto 1rem' }} />
              <h3 style={{ color: '#fff', margin: '0 0 8px' }}>No services match your search</h3>
              <p style={{ color: 'var(--text-light)', fontSize: '0.9rem', marginBottom: '1.5rem' }}>
                Try adjusting your search terms or selecting a different category.
              </p>
              <button
                onClick={() => {
                  setSearchQuery('');
                  setSelectedCategory('All Capabilities');
                }}
                className="btn btn-outline"
                style={{ padding: '8px 20px', fontSize: '0.85rem' }}
              >
                Reset Filters
              </button>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
              {filteredServices.map((service, index) => {
                const meta = SERVICE_META[service.id] || DEFAULT_META;
                const features =
                  service.features && service.features.length > 0
                    ? service.features
                    : meta.deliverables;

                return (
                  <div
                    key={service.id}
                    id={`service-card-${service.id}`}
                    style={{
                      background: 'rgba(17, 24, 39, 0.8)',
                      border: '1px solid rgba(255, 255, 255, 0.09)',
                      borderRadius: '16px',
                      padding: '2.5rem',
                      display: 'grid',
                      gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
                      gap: '2.5rem',
                      position: 'relative',
                      overflow: 'hidden',
                      boxShadow: '0 10px 30px rgba(0, 0, 0, 0.3)'
                    }}
                  >
                    {/* Top ambient glow accent */}
                    <div
                      style={{
                        position: 'absolute',
                        top: 0,
                        left: 0,
                        right: 0,
                        height: '3px',
                        background:
                          index % 2 === 0
                            ? 'linear-gradient(90deg, var(--primary-color), #f59e0b)'
                            : 'linear-gradient(90deg, #38bdf8, #818cf8)'
                      }}
                    />

                    {/* Column 1: Core Value & Overview */}
                    <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                      <div>
                        {/* Category & Timeline Header */}
                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '1.25rem', flexWrap: 'wrap' }}>
                          <span
                            style={{
                              padding: '4px 10px',
                              borderRadius: '6px',
                              background: 'rgba(212, 175, 55, 0.12)',
                              color: 'var(--primary-color)',
                              fontSize: '0.75rem',
                              fontWeight: 700,
                              textTransform: 'uppercase',
                              letterSpacing: '0.5px'
                            }}
                          >
                            {meta.category}
                          </span>
                          <span
                            style={{
                              padding: '4px 10px',
                              borderRadius: '6px',
                              background: 'rgba(255, 255, 255, 0.05)',
                              color: 'var(--text-light)',
                              fontSize: '0.75rem',
                              fontWeight: 600,
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: '4px'
                            }}
                          >
                            <Clock size={12} /> {meta.timeline}
                          </span>
                        </div>

                        {/* Service Icon & Title */}
                        <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '1rem' }}>
                          <div
                            style={{
                              width: '54px',
                              height: '54px',
                              borderRadius: '12px',
                              background: 'rgba(212, 175, 55, 0.15)',
                              border: '1px solid rgba(212, 175, 55, 0.3)',
                              color: 'var(--primary-color)',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              flexShrink: 0
                            }}
                          >
                            {getIcon(service.icon)}
                          </div>
                          <div>
                            <h3 style={{ margin: 0, fontSize: '1.5rem', fontWeight: 800, color: '#fff' }}>
                              {service.title}
                            </h3>
                            <p style={{ margin: '2px 0 0', fontSize: '0.85rem', color: 'var(--text-light)' }}>
                              Pillar ID: <code style={{ color: '#38bdf8' }}>{service.id}</code>
                            </p>
                          </div>
                        </div>

                        {/* Short & Full Descriptions */}
                        <p style={{ fontSize: '1rem', color: '#e2e8f0', lineHeight: 1.6, marginBottom: '1rem', fontWeight: 500 }}>
                          {service.shortDesc}
                        </p>
                        {service.fullDesc && (
                          <p style={{ fontSize: '0.9rem', color: 'var(--text-light)', lineHeight: 1.6, marginBottom: '1.5rem' }}>
                            {service.fullDesc}
                          </p>
                        )}

                        {/* Architectural Highlight */}
                        <div
                          style={{
                            background: 'rgba(16, 185, 129, 0.08)',
                            borderLeft: '3px solid #10b981',
                            padding: '10px 14px',
                            borderRadius: '0 8px 8px 0',
                            fontSize: '0.85rem',
                            color: '#34d399',
                            marginBottom: '1.5rem',
                            fontWeight: 500
                          }}
                        >
                          {meta.highlight}
                        </div>
                      </div>

                      {/* Action CTAs */}
                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '12px', marginTop: '1rem' }}>
                        <button
                          onClick={() => onSelectService(service)}
                          className="btn btn-primary"
                          style={{
                            padding: '10px 20px',
                            fontSize: '0.9rem',
                            fontWeight: 700,
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '8px'
                          }}
                        >
                          Deep Specs & Architecture <ArrowRight size={16} />
                        </button>
                        <button
                          onClick={() => onContactClick(service.title)}
                          className="btn btn-outline"
                          style={{
                            padding: '10px 18px',
                            fontSize: '0.9rem',
                            fontWeight: 600
                          }}
                        >
                          Book Consultation
                        </button>
                      </div>
                    </div>

                    {/* Column 2: Deliverables & Tech Stack */}
                    <div
                      style={{
                        background: 'rgba(15, 23, 42, 0.6)',
                        border: '1px solid rgba(255, 255, 255, 0.06)',
                        borderRadius: '12px',
                        padding: '1.5rem',
                        display: 'flex',
                        flexDirection: 'column',
                        justifyContent: 'space-between'
                      }}
                    >
                      <div>
                        <h4
                          style={{
                            margin: '0 0 1rem',
                            fontSize: '0.9rem',
                            color: '#fff',
                            textTransform: 'uppercase',
                            letterSpacing: '0.5px',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '8px'
                          }}
                        >
                          <FileCheck size={16} style={{ color: 'var(--primary-color)' }} /> Included Deliverables & Capabilities
                        </h4>

                        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginBottom: '1.5rem' }}>
                          {features.map((feat, idx) => (
                            <div key={idx} style={{ display: 'flex', alignItems: 'flex-start', gap: '10px' }}>
                              <CheckCircle2 size={16} style={{ color: '#10b981', flexShrink: 0, marginTop: '3px' }} />
                              <span style={{ fontSize: '0.85rem', color: '#cbd5e1', lineHeight: 1.5 }}>
                                {feat}
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Tech Stack Tags */}
                      <div>
                        <div
                          style={{
                            fontSize: '0.75rem',
                            textTransform: 'uppercase',
                            letterSpacing: '0.5px',
                            color: 'var(--text-light)',
                            marginBottom: '8px',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '6px'
                          }}
                        >
                          <Code2 size={14} /> Technology Ecosystem
                        </div>
                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                          {meta.techStack.map((tech, tIdx) => (
                            <span
                              key={tIdx}
                              style={{
                                fontSize: '0.75rem',
                                padding: '3px 8px',
                                borderRadius: '4px',
                                background: 'rgba(255, 255, 255, 0.06)',
                                border: '1px solid rgba(255, 255, 255, 0.08)',
                                color: '#e2e8f0',
                                fontWeight: 500
                              }}
                            >
                              {tech}
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </section>

      {/* 4-Step Engineering Lifecycle */}
      <section style={{ padding: '4rem 0', background: '#0e1424', borderTop: '1px solid rgba(255, 255, 255, 0.06)' }}>
        <div className="container">
          <div style={{ textAlign: 'center', maxWidth: '700px', margin: '0 auto 3.5rem' }}>
            <span style={{ color: 'var(--primary-color)', fontSize: '0.85rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '1px' }}>
              Our Execution Framework
            </span>
            <h2 style={{ fontSize: '2rem', fontWeight: 800, color: '#fff', margin: '6px 0 12px' }}>
              How We Deliver Enterprise Digital Systems
            </h2>
            <p style={{ color: 'var(--text-light)', fontSize: '0.95rem', margin: 0, lineHeight: 1.6 }}>
              A battle-tested 4-phase agile methodology designed to maximize velocity while eliminating technical debt and security risks.
            </p>
          </div>

          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
              gap: '1.5rem'
            }}
          >
            {[
              {
                step: '01',
                title: 'Discovery & Blueprinting',
                desc: 'Technical requirements gathering, database schema modeling, user journey mapping, and comprehensive scope locking.'
              },
              {
                step: '02',
                title: 'High-Fidelity Prototyping',
                desc: 'Interactive Figma design systems, responsive component libraries, and client stakeholder design sign-off.'
              },
              {
                step: '03',
                title: 'Agile Engineering & QA',
                desc: 'Modern TypeScript development, strict security rule audits, automated unit tests, and cross-browser stress testing.'
              },
              {
                step: '04',
                title: 'Edge Launch & Hypercare',
                desc: 'Global cloud edge propagation, production DNS rollout, analytics verification, and 30-day warranty hypercare.'
              }
            ].map((st, i) => (
              <div
                key={i}
                style={{
                  background: 'rgba(15, 23, 42, 0.7)',
                  border: '1px solid rgba(255, 255, 255, 0.08)',
                  borderRadius: '12px',
                  padding: '1.75rem',
                  position: 'relative'
                }}
              >
                <div
                  style={{
                    fontSize: '2.5rem',
                    fontWeight: 900,
                    color: 'rgba(212, 175, 55, 0.25)',
                    lineHeight: 1,
                    marginBottom: '1rem',
                    fontFamily: 'monospace'
                  }}
                >
                  {st.step}
                </div>
                <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: '#fff', margin: '0 0 8px' }}>
                  {st.title}
                </h3>
                <p style={{ margin: 0, fontSize: '0.85rem', color: 'var(--text-light)', lineHeight: 1.6 }}>
                  {st.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Services FAQ Accordion */}
      <section style={{ padding: '4rem 0', borderTop: '1px solid rgba(255, 255, 255, 0.06)' }}>
        <div className="container" style={{ maxWidth: '800px', margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: '2.5rem' }}>
            <h2 style={{ fontSize: '1.8rem', fontWeight: 800, color: '#fff', margin: '0 0 8px' }}>
              Frequently Asked Engagement Questions
            </h2>
            <p style={{ color: 'var(--text-light)', fontSize: '0.9rem', margin: 0 }}>
              Direct answers about how we collaborate, bill, deliver, and support your systems.
            </p>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {faqs.map((faq, fIdx) => {
              const isOpen = openFaqIndex === fIdx;
              return (
                <div
                  key={fIdx}
                  style={{
                    background: '#151d32',
                    border: '1px solid rgba(255, 255, 255, 0.08)',
                    borderRadius: '8px',
                    overflow: 'hidden'
                  }}
                >
                  <button
                    onClick={() => setOpenFaqIndex(isOpen ? null : fIdx)}
                    style={{
                      width: '100%',
                      padding: '1.25rem',
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      background: 'transparent',
                      border: 'none',
                      color: '#fff',
                      fontSize: '0.95rem',
                      fontWeight: 600,
                      textAlign: 'left',
                      cursor: 'pointer'
                    }}
                  >
                    <span>{faq.q}</span>
                    <span style={{ color: 'var(--primary-color)', fontSize: '1.2rem', marginLeft: '1rem' }}>
                      {isOpen ? '−' : '+'}
                    </span>
                  </button>
                  {isOpen && (
                    <div
                      style={{
                        padding: '0 1.25rem 1.25rem',
                        fontSize: '0.85rem',
                        color: 'var(--text-light)',
                        lineHeight: 1.6,
                        borderTop: '1px solid rgba(255, 255, 255, 0.04)'
                      }}
                    >
                      {faq.a}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Strategic Call to Action */}
      <section
        style={{
          padding: '4rem 0',
          background: 'linear-gradient(135deg, rgba(15, 23, 42, 0.95), rgba(30, 41, 59, 0.95))',
          borderTop: '1px solid rgba(212, 175, 55, 0.2)',
          textAlign: 'center'
        }}
      >
        <div className="container" style={{ maxWidth: '700px', margin: '0 auto' }}>
          <h2 style={{ fontSize: '2rem', fontWeight: 800, color: '#fff', marginBottom: '1rem' }}>
            Ready to Architect Your Digital Solution?
          </h2>
          <p style={{ color: 'var(--text-light)', fontSize: '1rem', lineHeight: 1.6, marginBottom: '2rem' }}>
            Partner with Axe\'s Era Enterprise. Schedule a technical discovery session directly with founder Gauhar Axe and receive a comprehensive architecture roadmap.
          </p>
          <div style={{ display: 'flex', justifyContent: 'center', flexWrap: 'wrap', gap: '1rem' }}>
            <button
              onClick={() => onContactClick()}
              className="btn btn-primary"
              style={{ padding: '12px 28px', fontSize: '1rem', fontWeight: 700 }}
            >
              Book Strategy Consultation
            </button>
            <a
              href="https://wa.me/923157338694"
              target="_blank"
              rel="noopener noreferrer"
              className="btn btn-outline"
              style={{
                padding: '12px 24px',
                fontSize: '1rem',
                fontWeight: 600,
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px',
                color: '#25D366',
                borderColor: '#25D366'
              }}
            >
              <MessageSquare size={18} /> Instant WhatsApp Response
            </a>
          </div>
        </div>
      </section>
    </div>
  );
};
