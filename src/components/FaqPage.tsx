import React, { useMemo, useState } from 'react';
import { ArrowRight, ChevronDown, HelpCircle } from 'lucide-react';
import { FaqItem } from '../types';
import { WhatsAppIcon } from './WhatsAppIcon';
import {
  collectFaqCategories,
  filterFaqs
} from '../utils/faqCategories';
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

export const FaqPage: React.FC<FaqPageProps> = ({ faqs, onBackToHome, onContactClick }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState<string>('all');
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  const categoryOptions = useMemo(() => collectFaqCategories(faqs), [faqs]);

  const filteredFaqs = useMemo(
    () => filterFaqs(faqs, { category: activeCategory, search: searchQuery }),
    [faqs, activeCategory, searchQuery]
  );

  const ownershipCount = categoryOptions.find((c) => c.id === 'ownership')?.count ?? 0;
  const billingCount = categoryOptions.find((c) => c.id === 'billing')?.count ?? 0;

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
            onChange={(id) => setActiveCategory(id)}
            options={categoryOptions}
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

        {billingCount === 0 || ownershipCount === 0 ? (
          <p className="editorial-todo" style={{ marginTop: '1.25rem' }}>
            TODO: The published FAQ list has no entries filed under{' '}
            {[ownershipCount === 0 ? 'IP & Code Ownership' : null, billingCount === 0 ? 'Billing & Milestones' : null]
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
