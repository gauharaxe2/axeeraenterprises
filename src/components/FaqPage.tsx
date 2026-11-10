import React, { useMemo, useState } from 'react';
import { ArrowRight, ChevronDown, HelpCircle } from 'lucide-react';
import { FaqItem } from '../types';
import { WhatsAppIcon } from './WhatsAppIcon';
import {
  EditorialCta,
  EditorialEmpty,
  EditorialHero,
  EditorialPage,
  EditorialPills,
  EditorialSearch,
  EditorialSection,
  EditorialTopbar,
  openInApp
} from './editorial/Editorial';

interface FaqPageProps {
  faqs: FaqItem[];
  onBackToHome: () => void;
  onContactClick: () => void;
}

type FaqCategory = 'all' | 'engineering' | 'ownership' | 'billing' | 'support';

const categories: { id: FaqCategory; label: string }[] = [
  { id: 'all', label: 'All Questions' },
  { id: 'engineering', label: 'Architecture & Tech' },
  { id: 'ownership', label: 'IP & Code Ownership' },
  { id: 'billing', label: 'Billing & Milestones' },
  { id: 'support', label: 'Warranties & Support' }
];

export const FaqPage: React.FC<FaqPageProps> = ({ faqs, onBackToHome, onContactClick }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState<FaqCategory>('all');
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  const enrichedFaqs = useMemo(() => {
    return faqs.map((faq, index) => {
      const question = faq.question.toLowerCase();
      let category: Exclude<FaqCategory, 'all'> = 'engineering';

      if (
        question.includes('own') ||
        question.includes('source code') ||
        question.includes('intellectual property') ||
        question.includes('ip')
      ) {
        category = 'ownership';
      } else if (
        question.includes('payment') ||
        question.includes('billing') ||
        question.includes('cost') ||
        question.includes('price')
      ) {
        category = 'billing';
      } else if (
        question.includes('maintenance') ||
        question.includes('support') ||
        question.includes('warranty') ||
        question.includes('post-launch')
      ) {
        category = 'support';
      }

      return { ...faq, index, category };
    });
  }, [faqs]);

  const filteredFaqs = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();
    return enrichedFaqs.filter((faq) => {
      const matchesCategory = activeCategory === 'all' || faq.category === activeCategory;
      const matchesSearch =
        !query || faq.question.toLowerCase().includes(query) || faq.answer.toLowerCase().includes(query);
      return matchesCategory && matchesSearch;
    });
  }, [enrichedFaqs, activeCategory, searchQuery]);

  const counts = useMemo(() => {
    return {
      all: enrichedFaqs.length,
      engineering: enrichedFaqs.filter((faq) => faq.category === 'engineering').length,
      ownership: enrichedFaqs.filter((faq) => faq.category === 'ownership').length,
      billing: enrichedFaqs.filter((faq) => faq.category === 'billing').length,
      support: enrichedFaqs.filter((faq) => faq.category === 'support').length
    };
  }, [enrichedFaqs]);

  return (
    <EditorialPage page="faq">
      <EditorialTopbar
        crumb="Knowledge Base & FAQ"
        onBack={onBackToHome}
        action={
          <a href="/contact" className="btn btn-primary editorial-top-action" onClick={(event) => openInApp(event, onContactClick)}>
            Ask a Custom Question <ArrowRight size={16} aria-hidden="true" />
          </a>
        }
      />

      <EditorialHero
        eyebrow="Comprehensive Client Knowledge Base"
        title="Everything You Need to Know Before Partnering"
        description="Transparent answers about our engineering process, intellectual property rights, milestone-based billing structures, and 30-day post-launch warranty commitments."
      />

      <div className="editorial-toolbar">
        <div className="editorial-wrap editorial-toolbar-stack">
          <EditorialSearch
            id="faq-search"
            label="Search frequently asked questions"
            value={searchQuery}
            onChange={setSearchQuery}
            placeholder="Search questions by keyword (e.g. source code, pricing, warranty, mobile apps)..."
          />
          <EditorialPills
            label="FAQ categories"
            value={activeCategory}
            onChange={(id) => setActiveCategory(id as FaqCategory)}
            options={categories.map((category) => ({ ...category, count: counts[category.id] }))}
          />
        </div>
      </div>

      <EditorialSection id="faq-list" narrow>
        <p className="editorial-countline" aria-live="polite">
          <span>
            Showing <strong>{filteredFaqs.length}</strong> {filteredFaqs.length === 1 ? 'question' : 'questions'}
          </span>
          <span className="editorial-chip">
            <HelpCircle size={14} aria-hidden="true" /> Published answers
          </span>
        </p>

        {filteredFaqs.length === 0 ? (
          <EditorialEmpty
            title="No matching questions found"
            description="Try a different keyword or reach out directly to founder Gauhar Axe on WhatsApp."
            action={
              <button
                type="button"
                className="btn btn-outline"
                onClick={() => {
                  setSearchQuery('');
                  setActiveCategory('all');
                }}
              >
                Clear Search
              </button>
            }
          />
        ) : (
          <div className="editorial-faq">
            {filteredFaqs.map((faq) => {
              const isOpen = openIndex === faq.index;
              const panelId = `faq-panel-${faq.id || faq.index}`;
              const buttonId = `faq-button-${faq.id || faq.index}`;
              return (
                <div key={faq.id || faq.index} className={`editorial-panel editorial-faq-item${isOpen ? ' is-open' : ''}`}>
                  <h3 style={{ fontSize: '1rem', fontWeight: 600 }}>
                    <button
                      id={buttonId}
                      type="button"
                      className="editorial-faq-toggle"
                      aria-expanded={isOpen}
                      aria-controls={panelId}
                      onClick={() => setOpenIndex(isOpen ? null : faq.index)}
                    >
                      <span>{faq.question}</span>
                      <ChevronDown size={18} aria-hidden="true" />
                    </button>
                  </h3>
                  {isOpen ? (
                    <div id={panelId} role="region" aria-labelledby={buttonId} className="editorial-faq-body">
                      {faq.answer}
                    </div>
                  ) : null}
                </div>
              );
            })}
          </div>
        )}

        {counts.billing === 0 || counts.ownership === 0 ? (
          <p className="editorial-todo" style={{ marginTop: '1.25rem' }}>
            TODO: The published FAQ list has no entries filed under{' '}
            {[counts.ownership === 0 ? 'IP & Code Ownership' : null, counts.billing === 0 ? 'Billing & Milestones' : null]
              .filter(Boolean)
              .join(' or ')}
            . Those filters stay empty until matching questions are added in admin.
          </p>
        ) : null}
      </EditorialSection>

      <EditorialCta
        title="Still Have an Unanswered Question?"
        description="We are here to provide full clarity before entering any engagement. Reach out directly for an immediate answer."
      >
        <a href="/contact" className="btn btn-primary" onClick={(event) => openInApp(event, onContactClick)}>
          Contact Support & Consultation
        </a>
        <a
          href="https://wa.me/923157338694"
          className="btn btn-outline editorial-whatsapp"
          target="_blank"
          rel="noopener noreferrer"
        >
          <WhatsAppIcon size={16} color="currentColor" /> Ask Directly on WhatsApp
        </a>
      </EditorialCta>
    </EditorialPage>
  );
};
