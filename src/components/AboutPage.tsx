import React from 'react';
import {
  ArrowLeft,
  ArrowRight,
  Award,
  CheckCircle2,
  Globe2,
  ShieldCheck,
  Sparkles,
  Users2,
  Zap,
  Clock,
  Building2,
  ExternalLink
} from 'lucide-react';
import { AgencyGeneralInfo } from '../types';

interface AboutPageProps {
  generalInfo: AgencyGeneralInfo;
  onBackToHome: () => void;
  onContactClick: () => void;
}

export const AboutPage: React.FC<AboutPageProps> = ({
  generalInfo,
  onBackToHome,
  onContactClick
}) => {
  const { stats, aboutTitle, aboutParagraph1, aboutParagraph2, aboutImageUrl } = generalInfo;

  const corePillars = [
    {
      icon: Zap,
      title: 'Architectural Performance',
      description:
        'We engineer systems for sub-second edge response times, sub-50ms database queries, and Lighthouse 95+ performance benchmarks across every device.'
    },
    {
      icon: ShieldCheck,
      title: 'Zero Vendor Lock-in & Full IP Rights',
      description:
        'Upon project milestone sign-off, 100% of the proprietary source code, design assets, and cloud deployment pipelines are transferred directly to your organization.'
    },
    {
      icon: Award,
      title: 'Measurable Conversion Velocity',
      description:
        'Every UI interaction, funnel layout, and typography scale is crafted with conversion rate optimization (CRO) principles to maximize revenue and qualified client inquiries.'
    },
    {
      icon: Globe2,
      title: 'Global Delivery & Enterprise Standards',
      description:
        'Headquartered in Multan, Pakistan, we serve international clients across North America, Europe, the Middle East, and Asia with modern multi-cloud agility.'
    }
  ];

  const milestones = [
    {
      year: '2023',
      headline: 'Agency Inception & Boutique Engineering',
      detail:
        'Founded by Gauhar Axe (Gauhar Nadeem) with an unwavering commitment to craftsmanship in custom web platforms, typography systems, and high-impact brand identities.'
    },
    {
      year: '2024',
      headline: 'SaaS & Enterprise Systems Expansion',
      detail:
        'Scaled capabilities into full-stack SaaS dashboards, headless Shopify architectures, and high-conversion e-commerce engines with automated cloud pipelines.'
    },
    {
      year: '2025',
      headline: 'Strategic Technology Alliances',
      detail:
        'Formed technology ecosystem alliances with Google Cloud Platform, Stripe, Cloudflare, and Cursor to offer enterprise-grade cloud hosting and security.'
    },
    {
      year: '2026',
      headline: 'Enterprise Digital Modernization',
      detail:
        'Now delivering bespoke enterprise digital products, real estate operating systems, and multi-platform solutions backed by a 30-day post-launch warranty.'
    }
  ];

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 pt-24 pb-20 selection:bg-blue-600 selection:text-white">
      {/* Top Header & Breadcrumbs */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-10">
        <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-800 pb-6">
          <div className="flex items-center gap-3">
            <button
              onClick={onBackToHome}
              className="inline-flex items-center gap-2 text-sm font-medium text-slate-400 hover:text-white transition-colors group cursor-pointer"
            >
              <ArrowLeft className="w-4 h-4 transition-transform group-hover:-translate-x-1" />
              <span>Back to Home</span>
            </button>
            <span className="text-slate-700">/</span>
            <span className="text-sm font-medium text-blue-400">About Us</span>
          </div>

          <button
            onClick={onContactClick}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold tracking-wide transition-colors cursor-pointer"
          >
            <span>Book Consultation</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Hero Showcase Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-20">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          <div className="lg:col-span-7">
            <div className="inline-flex items-center gap-2 text-xs font-semibold text-blue-400 tracking-wider uppercase mb-4">
              <Sparkles className="w-4 h-4" />
              <span>About Axe's Era Enterprise</span>
            </div>

            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight text-white mb-6 text-balance leading-tight">
              {aboutTitle || 'Your Digital Transformation Partner'}
            </h1>

            <p className="text-base sm:text-lg text-slate-300 leading-relaxed mb-6">
              {aboutParagraph1 ||
                "Founded by Gauhar Axe, Axe's Era Enterprise has grown into a leading digital agency with over 3+ years of experience. We've helped hundreds of businesses establish their digital presence and achieve their goals. Our team combines creativity with technical expertise to deliver exceptional results."}
            </p>

            <p className="text-base sm:text-lg text-slate-400 leading-relaxed mb-8">
              {aboutParagraph2 ||
                'We believe in building long-term partnerships with our clients, understanding their unique challenges, and crafting tailored solutions that drive real business impact.'}
            </p>

            <div className="flex flex-wrap items-center gap-4 text-xs text-slate-400 border-t border-slate-800/80 pt-6">
              <div className="flex items-center gap-2">
                <Building2 className="w-4 h-4 text-blue-400" />
                <span>Headquarters: Multan, Pakistan</span>
              </div>
              <span className="text-slate-700">·</span>
              <div className="flex items-center gap-2">
                <Users2 className="w-4 h-4 text-emerald-400" />
                <span>Founder & CEO: Gauhar Axe</span>
              </div>
              <span className="text-slate-700">·</span>
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-amber-400" />
                <span>Established 2023</span>
              </div>
            </div>
          </div>

          <div className="lg:col-span-5">
            <div className="relative rounded-2xl overflow-hidden border border-slate-800 bg-slate-900 shadow-2xl group">
              <img
                src={aboutImageUrl || 'https://i.postimg.cc/64KnkhQJ/Picsart-26-08-08-06-41-12-297.jpg'}
                alt="Axe's Era Enterprise Leadership"
                className="w-full h-auto max-h-[500px] object-cover transition-transform duration-500 group-hover:scale-105"
                referrerPolicy="no-referrer"
                onError={(e) => {
                  (e.target as HTMLImageElement).src =
                    'https://images.unsplash.com/photo-1522071820081-009f0129c71c?auto=format&fit=crop&w=1200&q=80';
                }}
              />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/20 to-transparent opacity-80" />
              <div className="absolute bottom-6 left-6 right-6">
                <p className="text-sm font-semibold text-white">Gauhar Nadeem (Gauhar Axe)</p>
                <p className="text-xs text-slate-400">Founder & Chief Executive Officer</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Key Numbers / Metric Strip */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-20">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 p-8 rounded-2xl bg-slate-900/60 border border-slate-800">
          <div className="border-r border-slate-800 last:border-0 pr-4">
            <p className="text-3xl sm:text-4xl font-extrabold text-blue-400 font-mono tabular-nums mb-2">
              {stats.years}+
            </p>
            <p className="text-xs sm:text-sm font-medium text-slate-300">Years of Experience</p>
            <p className="text-xs text-slate-500 mt-1">Continuous digital innovation</p>
          </div>

          <div className="border-r border-slate-800 last:border-0 pr-4">
            <p className="text-3xl sm:text-4xl font-extrabold text-emerald-400 font-mono tabular-nums mb-2">
              {stats.experts}
            </p>
            <p className="text-xs sm:text-sm font-medium text-slate-300">Visionary Leadership</p>
            <p className="text-xs text-slate-500 mt-1">Dedicated senior oversight</p>
          </div>

          <div className="border-r border-slate-800 last:border-0 pr-4">
            <p className="text-3xl sm:text-4xl font-extrabold text-indigo-400 font-mono tabular-nums mb-2">
              {stats.projects}+
            </p>
            <p className="text-xs sm:text-sm font-medium text-slate-300">Live Deployments</p>
            <p className="text-xs text-slate-500 mt-1">Global production systems</p>
          </div>

          <div>
            <p className="text-3xl sm:text-4xl font-extrabold text-amber-400 font-mono tabular-nums mb-2">
              {stats.retention}%
            </p>
            <p className="text-xs sm:text-sm font-medium text-slate-300">Client Retention</p>
            <p className="text-xs text-slate-500 mt-1">High-trust long-term partnerships</p>
          </div>
        </div>
      </div>

      {/* Core Values & Pillars */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-20">
        <div className="text-center max-w-3xl mx-auto mb-12">
          <p className="text-xs font-semibold text-blue-400 uppercase tracking-widest mb-2">
            Our Guiding Philosophy
          </p>
          <h2 className="text-2xl sm:text-3xl font-bold text-white text-balance">
            The Principles That Define How We Engineer Software
          </h2>
          <p className="text-slate-400 text-sm mt-3">
            Every digital system we build adheres to enterprise standards designed to eliminate
            technical debt and maximize long-term client independence.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {corePillars.map((pillar, idx) => {
            const Icon = pillar.icon;
            return (
              <div
                key={idx}
                className="p-8 rounded-xl bg-slate-900/40 border border-slate-800/80 hover:border-slate-700 transition-colors"
              >
                <div className="w-12 h-12 rounded-lg bg-blue-950/60 border border-blue-800/50 flex items-center justify-center text-blue-400 mb-6">
                  <Icon className="w-6 h-6" />
                </div>
                <h3 className="text-lg font-semibold text-white mb-3">{pillar.title}</h3>
                <p className="text-sm text-slate-400 leading-relaxed">{pillar.description}</p>
              </div>
            );
          })}
        </div>
      </div>

      {/* Evolution Milestones */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-20">
        <div className="border border-slate-800 rounded-2xl bg-slate-900/40 p-8 sm:p-12">
          <div className="max-w-2xl mb-10">
            <p className="text-xs font-semibold text-blue-400 uppercase tracking-widest mb-2">
              Our Journey
            </p>
            <h2 className="text-2xl sm:text-3xl font-bold text-white">
              Agency Milestones (2023–2026)
            </h2>
            <p className="text-slate-400 text-sm mt-2">
              From crafting bespoke headless websites to architecting complete digital operating
              ecosystems for international businesses.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {milestones.map((m, idx) => (
              <div
                key={idx}
                className="p-6 rounded-xl bg-slate-950/60 border border-slate-800/80 flex flex-col justify-between"
              >
                <div>
                  <span className="text-2xl font-black text-blue-400 font-mono tracking-tight">
                    {m.year}
                  </span>
                  <h4 className="text-base font-semibold text-white mt-3 mb-2">{m.headline}</h4>
                  <p className="text-xs text-slate-400 leading-relaxed">{m.detail}</p>
                </div>
                <div className="mt-6 pt-4 border-t border-slate-900 flex items-center gap-2 text-xs text-slate-500">
                  <CheckCircle2 className="w-3.5 h-3.5 text-blue-400" />
                  <span>Verified milestone</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Bottom Consultation CTA */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="p-8 sm:p-12 rounded-2xl bg-gradient-to-br from-blue-950/40 via-slate-900 to-slate-950 border border-blue-900/40 text-center max-w-4xl mx-auto">
          <h2 className="text-2xl sm:text-3xl font-bold text-white mb-4 text-balance">
            Ready to Architect Your Digital Transformation?
          </h2>
          <p className="text-slate-300 text-sm sm:text-base max-w-2xl mx-auto mb-8">
            Schedule a confidential technical discovery call directly with founder Gauhar Axe. We
            will review your current architecture and chart a high-velocity roadmap.
          </p>
          <div className="flex flex-wrap items-center justify-center gap-4">
            <button
              onClick={onContactClick}
              className="px-6 py-3 rounded-lg bg-blue-600 hover:bg-blue-500 text-white font-semibold text-sm transition-colors cursor-pointer"
            >
              Start Your Project Consultation
            </button>
            <a
              href={`https://wa.me/${generalInfo.whatsappNumber || '923157338694'}`}
              target="_blank"
              rel="noopener noreferrer"
              className="px-6 py-3 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold text-sm transition-colors inline-flex items-center gap-2"
            >
              <span>Instant WhatsApp Discussion</span>
              <ExternalLink className="w-4 h-4" />
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};
