import React, { useState } from 'react';
import { MapPin, Phone, Mail, Send } from 'lucide-react';
import { ContactFormData, ServiceItem } from '../types';
import { saveSubmissionToFirestore } from '../utils/firebase';
import { WhatsAppIcon } from './WhatsAppIcon';

const WHATSAPP_URL = 'https://wa.me/923157338694';

function phoneHref(display: string): string {
  const compact = display.replace(/[^\d+]/g, '');
  return compact ? `tel:${compact}` : 'tel:+923157338694';
}

interface ContactSectionProps {
  address?: string;
  phone?: string;
  email?: string;
  urgentNotice?: string;
  servicesList?: ServiceItem[];
  onShowNotification: (message: string, type: 'success' | 'error' | 'info') => void;
}

export const ContactSection: React.FC<ContactSectionProps> = ({
  address = "D-26, Wahdat Colony, Multan, 66000",
  phone = "+92-315-7338694 / +92-339-0096853",
  email = "gauharaxe@outlook.com",
  urgentNotice = "NOTE: If you don't get our response back via e-mail sooner, tap the WhatsApp button for an immediate live response!",
  servicesList = [],
  onShowNotification
}) => {
  const [formData, setFormData] = useState<ContactFormData>({
    name: '',
    email: '',
    company: '',
    service: '',
    message: ''
  });
  const [botField, setBotField] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState(false);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.name.trim() || !formData.email.trim() || !formData.message.trim()) {
      onShowNotification('Please fill in all required fields.', 'error');
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      onShowNotification('Please enter a valid email address.', 'error');
      return;
    }

    if (botField.trim()) {
      onShowNotification('Message blocked.', 'error');
      return;
    }

    setIsSubmitting(true);
    setSubmitError(false);

    const payload = {
      fullName: formData.name.trim(),
      email: formData.email.trim(),
      company: formData.company.trim() || undefined,
      service: formData.service || undefined,
      message: formData.message.trim()
    };

    try {
      const id = await saveSubmissionToFirestore(payload);
      if (!id) throw new Error('Form was not accepted');

      setFormData({
        name: '',
        email: '',
        company: '',
        service: '',
        message: ''
      });
      setBotField('');

      onShowNotification(
        "Thank you for your message! Axe's Era Enterprise will review your request and get back to you shortly.",
        'success'
      );
    } catch {
      setSubmitError(true);
      onShowNotification(
        `We couldn't send your message, so it was not delivered. Use WhatsApp or call ${phone}.`,
        'error'
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const phoneNumbers = phone
    .split('/')
    .map((part) => part.trim())
    .filter(Boolean);

  return (
    <section id="contact" className="contact">
      <div className="container">
        <div className="section-header">
          <h2>Let's Build Something Extraordinary Together</h2>
          <p>
            Ready to transform your digital presence? Book a strategic consultation with our experts.
          </p>
        </div>

        <div className="contact-content">
          <div className="contact-info">
            <h3>Get In Touch</h3>
            <p style={{ color: 'var(--text-light)', lineHeight: 1.7, marginBottom: '1.25rem' }}>
              Partner with Axe's Era Enterprise to architect your next digital success story. We are ready to listen, strategize, and execute with technical precision.
            </p>

            <div className="urgent-note">
              {urgentNotice}
            </div>

            <div className="contact-details">
              <div className="contact-item">
                <div className="contact-icon">
                  <MapPin size={22} />
                </div>
                <div className="contact-text">
                  <h4>Address</h4>
                  <p>{address}</p>
                </div>
              </div>

              <div className="contact-item">
                <div className="contact-icon">
                  <Phone size={22} />
                </div>
                <div className="contact-text">
                  <h4>Phone</h4>
                  <p>{phone}</p>
                </div>
              </div>

              <div className="contact-item">
                <div className="contact-icon">
                  <Mail size={22} />
                </div>
                <div className="contact-text">
                  <h4>Email</h4>
                  <p>{email}</p>
                </div>
              </div>
            </div>
          </div>

          <div className="contact-form">
            <form onSubmit={handleSubmit} noValidate>
              <p hidden>
                <label>
                  Don’t fill this out if you're human:
                  <input
                    name="bot-field"
                    value={botField}
                    onChange={(event) => setBotField(event.target.value)}
                    tabIndex={-1}
                    autoComplete="off"
                  />
                </label>
              </p>
              <div className="form-group">
                <input
                  type="text"
                  id="name"
                  name="name"
                  placeholder="Your Name *"
                  value={formData.name}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="form-group">
                <input
                  type="email"
                  id="email"
                  name="email"
                  placeholder="Your Email *"
                  value={formData.email}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="form-group">
                <input
                  type="text"
                  id="company"
                  name="company"
                  placeholder="Company Name"
                  value={formData.company}
                  onChange={handleChange}
                />
              </div>

              <div className="form-group">
                <select
                  id="service"
                  name="service"
                  value={formData.service}
                  onChange={handleChange}
                >
                  <option value="">Select Service (Optional)</option>
                  {servicesList.length > 0 ? (
                    servicesList.map((s) => (
                      <option key={s.id} value={s.id}>
                        {s.title}
                      </option>
                    ))
                  ) : (
                    <>
                      <option value="web">Web Development</option>
                      <option value="brand">Brand Design</option>
                      <option value="marketing">Digital Marketing</option>
                      <option value="mobile">Mobile Apps</option>
                      <option value="seo">SEO Optimization</option>
                      <option value="social">Social Media</option>
                      <option value="digital-products">Digital Products</option>
                    </>
                  )}
                </select>
              </div>

              <div className="form-group">
                <textarea
                  id="message"
                  name="message"
                  placeholder="Tell us about your project, goals, and timeline *"
                  rows={5}
                  value={formData.message}
                  onChange={handleChange}
                  required
                ></textarea>
              </div>

              {submitError && (
                <div
                  role="alert"
                  style={{
                    background: 'rgba(239, 68, 68, 0.12)',
                    border: '1px solid rgba(239, 68, 68, 0.45)',
                    color: '#fecaca',
                    borderRadius: '8px',
                    padding: '12px 14px',
                    marginBottom: '1rem',
                    fontSize: '0.92rem',
                    lineHeight: 1.55
                  }}
                >
                  <p style={{ margin: '0 0 0.5rem', color: '#fecaca' }}>
                    We couldn't send your message, so it was not delivered. Your text is still here.
                  </p>
                  <p style={{ margin: 0, color: '#fecaca' }}>
                    Please try again, or reach us on{' '}
                    <a
                      href={WHATSAPP_URL}
                      target="_blank"
                      rel="noopener noreferrer"
                      style={{
                        color: '#25D366',
                        fontWeight: 700,
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '4px'
                      }}
                    >
                      <WhatsAppIcon size={15} color="#25D366" /> WhatsApp
                    </a>
                    {phoneNumbers.length > 0 ? ' or call ' : '.'}
                    {phoneNumbers.map((number, index) => (
                      <React.Fragment key={number}>
                        {index > 0 ? ' / ' : ''}
                        <a
                          href={phoneHref(number)}
                          style={{ color: 'var(--primary-color)', fontWeight: 700 }}
                        >
                          {number}
                        </a>
                      </React.Fragment>
                    ))}
                    {phoneNumbers.length > 0 ? '.' : null}
                  </p>
                </div>
              )}

              <button
                type="submit"
                className="btn btn-primary"
                disabled={isSubmitting}
                style={{ width: '100%', opacity: isSubmitting ? 0.7 : 1 }}
              >
                {isSubmitting ? (
                  'Sending Inquiry...'
                ) : (
                  <>
                    <Send size={18} /> Send Message
                  </>
                )}
              </button>
            </form>
          </div>
        </div>
      </div>
    </section>
  );
};
