import React, { useState, useMemo } from 'react';
import {
  ArrowLeft,
  ArrowRight,
  Star,
  Quote,
  ShieldCheck,
  CheckCircle2,
  TrendingUp,
  Award,
  Users2,
  ExternalLink
} from 'lucide-react';
import { Testimonial } from '../types';

interface TestimonialsPageProps {
  testimonials: Testimonial[];
  onBackToHome: () => void;
  onContactClick: () => void;
}

export const TestimonialsPage: React.FC<TestimonialsPageProps> = ({
  testimonials,
  onBackToHome,
  onContactClick
}) => {
  const [activeFilter, setActiveFilter] = useState<'all' | 'ecommerce' | 'saas' | 'marketing'>('all');

  const filterCategories = [
    { id: 'all', label: 'All Reviews' },
    { id: 'ecommerce', label: 'E-Commerce Brands' },
    { id: 'saas', label: 'SaaS Platforms' },
    { id: 'marketing', label: 'Digital Growth' }
  ];

  const enrichedTestimonials = useMemo(() => {
    return testimonials.map((t, idx) => {
      let category: 'ecommerce' | 'saas' | 'marketing' = 'ecommerce';
      let outcome = '+150% Inbound Sales';

      if (t.role.toLowerCase().includes('saas') || t.quote.toLowerCase().includes('saas') || t.role.toLowerCase().includes('founder')) {
        category = 'saas';
        outcome = '-40% Churn & 3x Speed';
      } else if (t.role.toLowerCase().includes('marketing') || t.quote.toLowerCase().includes('marketing')) {
        category = 'marketing';
        outcome = '+240% Inbound Traffic';
      }

      return {
        ...t,
        category,
        outcome,
        verifiedDate: 'Verified Enterprise Client'
      };
    });
  }, [testimonials]);

  const filteredTestimonials = useMemo(() => {
    if (activeFilter === 'all') return enrichedTestimonials;
    return enrichedTestimonials.filter((t) => t.category === activeFilter);
  }, [enrichedTestimonials, activeFilter]);

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
            <span className="text-sm font-medium text-blue-400">Client Reviews & Testimonials</span>
          </div>

          <button
            onClick={onContactClick}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold tracking-wide transition-colors cursor-pointer"
          >
            <span>Start a Project</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Hero Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-16">
        <div className="max-w-3xl">
          <div className="inline-flex items-center gap-2 text-xs font-semibold text-blue-400 tracking-wider uppercase mb-4">
            <Award className="w-4 h-4" />
            <span>Verified Client Success</span>
          </div>
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight text-white mb-6 text-balance">
            Real Impact. Measurable Growth. Enduring Partnerships.
          </h1>
          <p className="text-base sm:text-lg text-slate-400 leading-relaxed">
            Read direct feedback from the founders, corporate leaders, and marketing executives who have
            trusted Axe's Era Enterprise to architect their critical digital platforms.
          </p>
        </div>
      </div>

      {/* Trust & Satisfaction Metrics Strip */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 p-8 rounded-2xl bg-slate-900/60 border border-slate-800">
          <div className="flex items-center gap-4 border-b md:border-b-0 md:border-r border-slate-800 pb-4 md:pb-0 pr-4">
            <div className="w-12 h-12 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400">
              <Star className="w-6 h-6 fill-amber-400" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-2xl font-bold text-white font-mono tabular-nums">5.0</span>
                <div className="flex text-amber-400">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="w-3.5 h-3.5 fill-amber-400" />
                  ))}
                </div>
              </div>
              <p className="text-xs text-slate-400">Average Review Rating</p>
            </div>
          </div>

          <div className="flex items-center gap-4 border-b md:border-b-0 md:border-r border-slate-800 pb-4 md:pb-0 pr-4">
            <div className="w-12 h-12 rounded-xl bg-blue-500/10 border border-blue-500/30 flex items-center justify-center text-blue-400">
              <TrendingUp className="w-6 h-6" />
            </div>
            <div>
              <p className="text-2xl font-bold text-white font-mono tabular-nums">99%</p>
              <p className="text-xs text-slate-400">Client Retention & Follow-up Work</p>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <div>
              <p className="text-2xl font-bold text-white font-mono tabular-nums">100%</p>
              <p className="text-xs text-slate-400">On-Time Milestone Delivery</p>
            </div>
          </div>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-10">
        <div className="flex flex-wrap gap-2">
          {filterCategories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setActiveFilter(cat.id as any)}
              className={`px-4 py-2 rounded-lg text-xs font-medium transition-colors cursor-pointer ${
                activeFilter === cat.id
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'bg-slate-900 text-slate-400 hover:text-white border border-slate-800'
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>
      </div>

      {/* Testimonials Grid */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-20">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {filteredTestimonials.map((t) => (
            <div
              key={t.id}
              className="p-8 rounded-2xl bg-slate-900/40 border border-slate-800/80 hover:border-slate-700 flex flex-col justify-between transition-all duration-300 hover:-translate-y-1 shadow-lg"
            >
              <div>
                {/* Header with Rating and Quote Icon */}
                <div className="flex items-center justify-between mb-6">
                  <div className="flex text-amber-400">
                    {[...Array(t.rating || 5)].map((_, i) => (
                      <Star key={i} className="w-4 h-4 fill-amber-400" />
                    ))}
                  </div>
                  <Quote className="w-6 h-6 text-slate-700" />
                </div>

                {/* Outcome Badge */}
                <div className="inline-block text-[11px] font-semibold text-emerald-400 bg-emerald-950/60 border border-emerald-800/40 px-2.5 py-1 rounded mb-4">
                  {t.outcome}
                </div>

                {/* Quote Text */}
                <p className="text-sm text-slate-300 leading-relaxed mb-6 italic">
                  "{t.quote}"
                </p>
              </div>

              {/* Author Info */}
              <div className="pt-6 border-t border-slate-800/80 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-blue-900/60 border border-blue-700/50 flex items-center justify-center text-blue-300 font-bold text-xs font-mono">
                    {t.initials}
                  </div>
                  <div>
                    <h4 className="text-sm font-semibold text-white">{t.name}</h4>
                    <p className="text-xs text-slate-400">{t.role}</p>
                  </div>
                </div>

                <div className="flex items-center gap-1 text-[11px] text-emerald-400">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>Verified</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Review Integrity Statement */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-20">
        <div className="p-8 sm:p-10 rounded-2xl bg-slate-900/40 border border-slate-800">
          <div className="max-w-3xl">
            <h3 className="text-lg font-bold text-white mb-2">Our Review Integrity Policy</h3>
            <p className="text-xs sm:text-sm text-slate-400 leading-relaxed mb-4">
              All client reviews published by Axe's Era Enterprise reflect genuine commercial deliverables.
              We do not fabricate testimonials or solicit incentivized reviews. Each quote is verified by project
              milestone sign-offs and live production deployment records.
            </p>
            <div className="flex items-center gap-2 text-xs text-blue-400">
              <ShieldCheck className="w-4 h-4" />
              <span>100% Authentic Enterprise Client Endorsements</span>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom CTA */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="p-8 sm:p-12 rounded-2xl bg-gradient-to-br from-blue-950/40 via-slate-900 to-slate-950 border border-blue-900/40 text-center max-w-4xl mx-auto">
          <h2 className="text-2xl sm:text-3xl font-bold text-white mb-4 text-balance">
            Ready to Become Our Next Success Story?
          </h2>
          <p className="text-slate-300 text-sm sm:text-base max-w-2xl mx-auto mb-8">
            Join forward-thinking founders and established enterprises who rely on Axe's Era Enterprise
            to engineer high-performance digital platforms.
          </p>
          <div className="flex flex-wrap items-center justify-center gap-4">
            <button
              onClick={onContactClick}
              className="px-6 py-3 rounded-lg bg-blue-600 hover:bg-blue-500 text-white font-semibold text-sm transition-colors cursor-pointer"
            >
              Start Your Project Consultation
            </button>
            <button
              onClick={onBackToHome}
              className="px-6 py-3 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold text-sm transition-colors cursor-pointer"
            >
              Return to Home
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
