import React, { useState, useMemo } from 'react';
import {
  ArrowLeft,
  ArrowRight,
  Search,
  ChevronDown,
  HelpCircle,
  MessageSquare,
  ShieldCheck,
  ExternalLink,
  Sparkles,
  CheckCircle2
} from 'lucide-react';
import { FaqItem } from '../types';
import { WhatsAppIcon } from './WhatsAppIcon';

interface FaqPageProps {
  faqs: FaqItem[];
  onBackToHome: () => void;
  onContactClick: () => void;
}

export const FaqPage: React.FC<FaqPageProps> = ({
  faqs,
  onBackToHome,
  onContactClick
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState<'all' | 'engineering' | 'ownership' | 'billing' | 'support'>('all');
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  const categories = [
    { id: 'all', label: 'All Questions' },
    { id: 'engineering', label: 'Architecture & Tech' },
    { id: 'ownership', label: 'IP & Code Ownership' },
    { id: 'billing', label: 'Billing & Milestones' },
    { id: 'support', label: 'Warranties & Support' }
  ];

  const enrichedFaqs = useMemo(() => {
    return faqs.map((faq, idx) => {
      const q = faq.question.toLowerCase();
      let category: 'engineering' | 'ownership' | 'billing' | 'support' = 'engineering';

      if (q.includes('own') || q.includes('source code') || q.includes('intellectual property') || q.includes('ip')) {
        category = 'ownership';
      } else if (q.includes('payment') || q.includes('billing') || q.includes('cost') || q.includes('price')) {
        category = 'billing';
      } else if (q.includes('maintenance') || q.includes('support') || q.includes('warranty') || q.includes('post-launch')) {
        category = 'support';
      }

      return {
        ...faq,
        index: idx,
        category
      };
    });
  }, [faqs]);

  const filteredFaqs = useMemo(() => {
    return enrichedFaqs.filter((faq) => {
      const matchesCat = activeCategory === 'all' || faq.category === activeCategory;
      const q = searchQuery.trim().toLowerCase();
      const matchesSearch =
        !q ||
        faq.question.toLowerCase().includes(q) ||
        faq.answer.toLowerCase().includes(q);

      return matchesCat && matchesSearch;
    });
  }, [enrichedFaqs, activeCategory, searchQuery]);

  const toggleAccordion = (idx: number) => {
    setOpenIndex(openIndex === idx ? null : idx);
  };

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
            <span className="text-sm font-medium text-blue-400">Knowledge Base & FAQ</span>
          </div>

          <button
            onClick={onContactClick}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold tracking-wide transition-colors cursor-pointer"
          >
            <span>Ask a Custom Question</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Hero Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-16">
        <div className="max-w-3xl">
          <div className="inline-flex items-center gap-2 text-xs font-semibold text-blue-400 tracking-wider uppercase mb-4">
            <HelpCircle className="w-4 h-4" />
            <span>Comprehensive Client Knowledge Base</span>
          </div>
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight text-white mb-6 text-balance">
            Everything You Need to Know Before Partnering
          </h1>
          <p className="text-base sm:text-lg text-slate-400 leading-relaxed">
            Transparent answers about our engineering process, intellectual property rights, milestone-based
            billing structures, and 30-day post-launch warranty commitments.
          </p>
        </div>
      </div>

      {/* Search and Category Filter Bar */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 mb-12">
        <div className="space-y-4">
          {/* Search Box */}
          <div className="relative">
            <Search className="w-5 h-5 text-slate-500 absolute left-4 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search questions by keyword (e.g. source code, pricing, warranty, mobile apps)..."
              className="w-full pl-12 pr-4 py-3.5 rounded-xl bg-slate-900 border border-slate-800 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 transition-colors shadow-lg"
            />
          </div>

          {/* Category Tabs */}
          <div className="flex flex-wrap gap-2 pt-2">
            {categories.map((cat) => (
              <button
                key={cat.id}
                onClick={() => setActiveCategory(cat.id as any)}
                className={`px-3.5 py-1.5 rounded-lg text-xs font-medium transition-colors cursor-pointer ${
                  activeCategory === cat.id
                    ? 'bg-blue-600 text-white shadow-sm'
                    : 'bg-slate-900/80 text-slate-400 hover:text-white border border-slate-800'
                }`}
              >
                {cat.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Accordion FAQ List */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 mb-20">
        {filteredFaqs.length === 0 ? (
          <div className="text-center py-16 px-4 border border-dashed border-slate-800 rounded-2xl bg-slate-900/20">
            <HelpCircle className="w-10 h-10 text-slate-600 mx-auto mb-3" />
            <h3 className="text-base font-semibold text-white mb-1">No matching questions found</h3>
            <p className="text-xs text-slate-400 max-w-sm mx-auto mb-4">
              Try a different keyword or reach out directly to founder Gauhar Axe on WhatsApp.
            </p>
            <button
              onClick={() => {
                setSearchQuery('');
                setActiveCategory('all');
              }}
              className="px-4 py-2 rounded-lg bg-slate-800 text-slate-200 text-xs font-medium hover:bg-slate-700 transition-colors cursor-pointer"
            >
              Clear Search
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredFaqs.map((faq) => {
              const isOpen = openIndex === faq.index;
              return (
                <div
                  key={faq.index}
                  className={`rounded-xl border transition-all duration-200 overflow-hidden ${
                    isOpen
                      ? 'bg-slate-900/90 border-blue-500/50 shadow-md'
                      : 'bg-slate-900/40 border-slate-800/80 hover:border-slate-700'
                  }`}
                >
                  <button
                    onClick={() => toggleAccordion(faq.index)}
                    aria-expanded={isOpen}
                    className="w-full p-5 text-left flex items-center justify-between gap-4 cursor-pointer"
                  >
                    <span className="text-sm sm:text-base font-semibold text-white">
                      {faq.question}
                    </span>
                    <ChevronDown
                      className={`w-5 h-5 text-slate-400 shrink-0 transition-transform duration-200 ${
                        isOpen ? 'rotate-180 text-blue-400' : ''
                      }`}
                    />
                  </button>

                  {isOpen && (
                    <div className="px-5 pb-5 pt-1 text-xs sm:text-sm text-slate-300 leading-relaxed border-t border-slate-800/60 mt-1">
                      {faq.answer}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Still Have Questions CTA */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="p-8 sm:p-10 rounded-2xl bg-gradient-to-br from-blue-950/40 via-slate-900 to-slate-950 border border-blue-900/40 text-center">
          <h2 className="text-xl sm:text-2xl font-bold text-white mb-3">
            Still Have an Unanswered Question?
          </h2>
          <p className="text-slate-300 text-xs sm:text-sm max-w-lg mx-auto mb-6">
            We are here to provide full clarity before entering any engagement. Reach out directly for an immediate answer.
          </p>
          <div className="flex flex-wrap items-center justify-center gap-4">
            <button
              onClick={onContactClick}
              className="px-5 py-2.5 rounded-lg bg-blue-600 hover:bg-blue-500 text-white font-semibold text-xs transition-colors cursor-pointer"
            >
              Contact Support & Consultation
            </button>
            <a
              href="https://wa.me/923157338694"
              target="_blank"
              rel="noopener noreferrer"
              className="px-5 py-2.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-xs transition-colors inline-flex items-center gap-2"
            >
              <WhatsAppIcon className="w-3.5 h-3.5 fill-white" />
              <span>Ask Directly on WhatsApp</span>
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};
