import React, { useState } from 'react';
import { Plus, Minus } from 'lucide-react';
import { FaqItem } from '../types';

interface FaqSectionProps {
  faqs: FaqItem[];
  onOpenFaqPage?: () => void;
}

export const FaqSection: React.FC<FaqSectionProps> = ({ faqs, onOpenFaqPage }) => {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  const toggleFaq = (index: number) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  return (
    <section id="faq" className="faq">
      <div className="container">
        <div className="section-header">
          <h2>Frequently Asked Questions</h2>
          <p>Find answers to common questions about our services and digital processes.</p>
        </div>

        <div className="faq-grid">
          {faqs.map((faq, index) => {
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
              Browse Complete Knowledge Base & FAQs (FAQ Page) →
            </button>
          </div>
        )}
      </div>
    </section>
  );
};
