import React, { useState } from 'react';
import { Plus, Minus } from 'lucide-react';
import { FaqItem } from '../types';
import { useLanguage } from '../context/LanguageContext';

interface FaqSectionProps {
  faqs: FaqItem[];
  onOpenFaqPage?: () => void;
}

export const FaqSection: React.FC<FaqSectionProps> = ({ faqs, onOpenFaqPage }) => {
  const { strings } = useLanguage();
  const [openIndex, setOpenIndex] = useState<number | null>(0);
  const visibleFaqs = faqs.slice(0, 5);

  const toggleFaq = (index: number) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  return (
    <section id="faq" className="faq">
      <div className="container">
        <div className="section-header">
          <h2>{strings.faq.sectionTitle}</h2>
          <p>{strings.faq.sectionSubtitle}</p>
        </div>

        <div className="faq-grid">
          {visibleFaqs.map((faq, index) => {
            const isOpen = openIndex === index;
            return (
              <div key={faq.id || index} className="faq-item">
                <div
                  className="faq-header"
                  onClick={() => toggleFaq(index)}
                  role="button"
                  tabIndex={0}
                >
                  <span>{faq.question}</span>
                  <span style={{ color: 'var(--primary-color)' }}>
                    {isOpen ? <Minus size={20} /> : <Plus size={20} />}
                  </span>
                </div>
                {isOpen && <div className="faq-body">{faq.answer}</div>}
              </div>
            );
          })}
        </div>

        {onOpenFaqPage && (
          <div style={{ textAlign: 'center', marginTop: '3rem' }}>
            <button
              type="button"
              onClick={onOpenFaqPage}
              className="btn btn-primary"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.5rem',
                fontSize: '0.95rem',
                padding: '0.75rem 1.75rem'
              }}
            >
              {strings.faq.cta}
            </button>
          </div>
        )}
      </div>
    </section>
  );
};
