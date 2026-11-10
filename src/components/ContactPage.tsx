import React, { useState } from 'react';
import { CheckCircle2, Clock, ExternalLink, Mail, MapPin, MessageSquare, Phone, Send } from 'lucide-react';
import { ContactFormData, ServiceItem } from '../types';
import { saveSubmissionToFirestore } from '../utils/firebase';
import { buildContactEnquiry } from '../utils/contactEnquiry';
import { WhatsAppIcon } from './WhatsAppIcon';
import { EditorialHero, EditorialPage, EditorialSection, EditorialTopbar, openInApp } from './editorial/Editorial';

interface ContactPageProps {
  address?: string;
  phone?: string;
  email?: string;
  whatsappNumber?: string;
  urgentNotice?: string;
  servicesList?: ServiceItem[];
  onShowNotification: (message: string, type: 'success' | 'error' | 'info') => void;
  onBackToHome: () => void;
  onOpenLocation?: () => void;
}

function phoneHref(display: string): string {
  const compact = display.replace(/[^\d+]/g, '');
  return compact ? `tel:${compact}` : 'tel:+923157338694';
}

const consultationRoadmap = [
  {
    step: '01',
    title: 'Technical Review',
    desc: 'Our principal architects review your requirements, target goals, and existing codebases.'
  },
  {
    step: '02',
    title: 'Discovery Session',
    desc: 'A 30-minute discovery call directly with Gauhar Axe to nail architecture and deliverables.'
  },
  {
    step: '03',
    title: 'Fixed Proposal & SLA',
    desc: 'You receive an exact milestone breakdown, sprint timeline, and guaranteed quote.'
  }
];

export const ContactPage: React.FC<ContactPageProps> = ({
  address = 'D-26, Wahdat Colony, Multan, 66000',
  phone = '+92-315-7338694 / +92-339-0096853',
  email = 'gauharaxe@outlook.com',
  whatsappNumber = '923157338694',
  urgentNotice = "NOTE: If you don't get our response back via e-mail sooner, tap the WhatsApp button for an immediate live response!",
  servicesList = [],
  onShowNotification,
  onBackToHome,
  onOpenLocation
}) => {
  const [formData, setFormData] = useState<ContactFormData>({
    name: '',
    email: '',
    company: '',
    service: '',
    message: ''
  });
  const [budget, setBudget] = useState('');
  const [timeline, setTimeline] = useState('');
  const [botField, setBotField] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);

  const phoneNumbers = phone
    .split('/')
    .map((part) => part.trim())
    .filter(Boolean);

  const handleChange = (
    event: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    setFormData({
      ...formData,
      [event.target.name]: event.target.value
    });
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();

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

    try {
      const id = await saveSubmissionToFirestore(
        buildContactEnquiry({
          name: formData.name,
          email: formData.email,
          company: formData.company,
          service: formData.service,
          message: formData.message,
          budget,
          timeline
        })
      );
      if (!id) throw new Error('Form was not accepted');

      setFormData({
        name: '',
        email: '',
        company: '',
        service: '',
        message: ''
      });
      setBudget('');
      setTimeline('');
      setBotField('');
      setIsSubmitted(true);

      onShowNotification(
        'Thank you! Your consultation inquiry has been submitted. Gauhar Axe will review your request within 2–4 hours.',
        'success'
      );
    } catch {
      onShowNotification(
        `We couldn't submit your form directly. Please contact us via WhatsApp or call ${phone} for immediate assistance.`,
        'error'
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <EditorialPage page="contact">
      <EditorialTopbar
        crumb="Contact & Consultation Portal"
        onBack={onBackToHome}
        action={
          <a
            href={`https://wa.me/${whatsappNumber}`}
            className="btn btn-outline editorial-whatsapp editorial-top-action"
            target="_blank"
            rel="noopener noreferrer"
          >
            <WhatsAppIcon size={16} color="currentColor" /> Instant WhatsApp Chat
          </a>
        }
      />

      <EditorialHero
        eyebrow="Direct Executive Consultation"
        title="Let's Engineer Your Digital Growth Engine"
        description="Partner with Axe's Era Enterprise. Schedule a technical discovery session directly with founder Gauhar Axe to map your platform architecture, project scope, and deployment timeline."
      />

      <EditorialSection id="contact-desk">
        <div className="editorial-split contact-layout">
          <div className="editorial-stack">
            <div className="urgent-note">
              <p style={{ margin: '0 0 0.35rem', color: '#fef08a', fontWeight: 700 }}>
                <WhatsAppIcon size={16} color="#fef08a" /> Immediate WhatsApp Response
              </p>
              <p style={{ margin: 0, color: '#fef08a' }}>{urgentNotice}</p>
            </div>

            <div className="editorial-panel padded">
              <h2 style={{ marginBottom: '1.1rem' }}>Headquarters & Communications</h2>
              <div className="contact-item">
                <div className="contact-icon">
                  <MapPin size={22} aria-hidden="true" />
                </div>
                <div className="contact-text">
                  <h3>Office Address</h3>
                  <p>{address}</p>
                  <p>Registered Headquarters, Pakistan</p>
                  <p>
                    <a
                      href="/location"
                      onClick={(event) => {
                        if (onOpenLocation) openInApp(event, onOpenLocation);
                      }}
                    >
                      View the pinned Google Map
                    </a>
                  </p>
                </div>
              </div>
              <div className="contact-item">
                <div className="contact-icon">
                  <Phone size={22} aria-hidden="true" />
                </div>
                <div className="contact-text">
                  <h3>Official Telephone</h3>
                  <p>
                    {phoneNumbers.map((number, index) => (
                      <React.Fragment key={number}>
                        {index > 0 ? ' / ' : ''}
                        <a href={phoneHref(number)}>{number}</a>
                      </React.Fragment>
                    ))}
                  </p>
                  <p>Mon–Sat: 9:00 AM – 7:00 PM PKT</p>
                </div>
              </div>
              <div className="contact-item">
                <div className="contact-icon">
                  <Mail size={22} aria-hidden="true" />
                </div>
                <div className="contact-text">
                  <h3>Executive E-Mail</h3>
                  <p>
                    <a href={`mailto:${email}`}>{email}</a>
                  </p>
                  <p>Direct inbox reviewed by leadership</p>
                </div>
              </div>
              <div className="contact-item">
                <div className="contact-icon">
                  <WhatsAppIcon size={22} color="#ffffff" />
                </div>
                <div className="contact-text">
                  <h3>WhatsApp Direct Line</h3>
                  <p>
                    <a href={`https://wa.me/${whatsappNumber}`} target="_blank" rel="noopener noreferrer">
                      +{whatsappNumber} <ExternalLink size={14} aria-hidden="true" />
                    </a>
                  </p>
                  <p>Immediate live messaging & voice note sync</p>
                </div>
              </div>
            </div>

            <div className="editorial-panel padded">
              <h3 style={{ display: 'flex', alignItems: 'center', gap: '0.45rem' }}>
                <Clock size={16} aria-hidden="true" color="var(--primary-color)" /> Engagement Hours
              </h3>
              <p className="editorial-muted" style={{ marginTop: '0.55rem' }}>
                Headquarters operating hours: 09:00 - 19:00 (PKT). For active client emergencies and SLA subscribers,
                infrastructure monitoring runs 24/7/365.
              </p>
            </div>
          </div>

          <div className="contact-form" id="contact-form-panel">
            <h2 style={{ display: 'flex', alignItems: 'center', gap: '0.45rem' }}>
              <MessageSquare size={20} aria-hidden="true" color="var(--primary-color)" /> Request a Technical Discovery
              Session
            </h2>
            <p className="editorial-muted" style={{ margin: '0.45rem 0 1.2rem' }}>
              Tell us about your project, target business goals, and timeline. All inquiries receive a confidential review
              within 2–4 hours.
            </p>

            {isSubmitted ? (
              <div role="status" style={{ textAlign: 'center', padding: '1.5rem 0.5rem' }}>
                <div className="editorial-check">
                  <CheckCircle2 size={26} aria-hidden="true" />
                </div>
                <h3 style={{ marginTop: '0.8rem' }}>Message Successfully Transmitted</h3>
                <p className="editorial-muted" style={{ margin: '0.6rem auto 1rem', maxWidth: '420px' }}>
                  Thank you for contacting Axe's Era Enterprise. Gauhar Axe will analyze your requirements and reach out
                  via email or WhatsApp shortly.
                </p>
                <button type="button" className="btn btn-outline" onClick={() => setIsSubmitted(false)}>
                  Send Another Inquiry
                </button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} noValidate>
                <p hidden>
                  <label>
                    Don&apos;t fill this out if you&apos;re human:
                    <input
                      name="bot-field"
                      value={botField}
                      onChange={(event) => setBotField(event.target.value)}
                      tabIndex={-1}
                      autoComplete="off"
                    />
                  </label>
                </p>

                <div className="editorial-form-grid two">
                  <div className="form-group">
                    <label htmlFor="contact-name">Your Full Name *</label>
                    <input
                      type="text"
                      id="contact-name"
                      name="name"
                      value={formData.name}
                      onChange={handleChange}
                      required
                      autoComplete="name"
                      placeholder="e.g. Alex Morgan"
                    />
                  </div>
                  <div className="form-group">
                    <label htmlFor="contact-email">Business E-Mail *</label>
                    <input
                      type="email"
                      id="contact-email"
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      required
                      autoComplete="email"
                      placeholder="alex@company.com"
                    />
                  </div>
                </div>

                <div className="editorial-form-grid two">
                  <div className="form-group">
                    <label htmlFor="contact-company">Company or Organization</label>
                    <input
                      type="text"
                      id="contact-company"
                      name="company"
                      value={formData.company}
                      onChange={handleChange}
                      autoComplete="organization"
                      placeholder="e.g. Apex Global"
                    />
                  </div>
                  <div className="form-group">
                    <label htmlFor="contact-service">Primary Capability Needed</label>
                    <select id="contact-service" name="service" value={formData.service} onChange={handleChange}>
                      <option value="">Select Service (Optional)</option>
                      {servicesList.map((service) => (
                        <option key={service.id} value={service.title}>
                          {service.title}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="editorial-form-grid two">
                  <div className="form-group">
                    <label htmlFor="contact-budget">Estimated Budget Range</label>
                    <select id="contact-budget" value={budget} onChange={(event) => setBudget(event.target.value)}>
                      <option value="">Select Budget (Optional)</option>
                      <option value="$1,000 – $3,000">$1,000 – $3,000 (MVP / Sprint)</option>
                      <option value="$3,000 – $10,000">$3,000 – $10,000 (Full Platform / App)</option>
                      <option value="$10,000+">$10,000+ (Enterprise Custom System)</option>
                      <option value="Flexible / Retainer">Monthly Retainer</option>
                    </select>
                  </div>
                  <div className="form-group">
                    <label htmlFor="contact-timeline">Target Launch Timeline</label>
                    <select id="contact-timeline" value={timeline} onChange={(event) => setTimeline(event.target.value)}>
                      <option value="">Select Timeline (Optional)</option>
                      <option value="Immediate (< 2 Weeks)">Immediate (&lt; 2 Weeks)</option>
                      <option value="1 Month">1 Month</option>
                      <option value="2–3 Months">2–3 Months</option>
                      <option value="Flexible">Flexible Planning</option>
                    </select>
                  </div>
                </div>

                <div className="form-group">
                  <label htmlFor="contact-message">Project Goals, Scope & Specifications *</label>
                  <textarea
                    id="contact-message"
                    name="message"
                    value={formData.message}
                    onChange={handleChange}
                    required
                    rows={5}
                    placeholder="Describe your project, current bottlenecks, target deliverables, or provide relevant reference links..."
                  />
                </div>

                <button type="submit" className="btn btn-primary" disabled={isSubmitting} style={{ width: '100%' }}>
                  {isSubmitting ? (
                    <>
                      <span className="editorial-spinner" aria-hidden="true" /> Encrypting & Transmitting...
                    </>
                  ) : (
                    <>
                      Submit Discovery Request <Send size={16} aria-hidden="true" />
                    </>
                  )}
                </button>
              </form>
            )}
          </div>
        </div>
      </EditorialSection>

      <EditorialSection id="consultation-steps" eyebrow="What Happens Next" title="Our 3-Step Consultation Process">
        <div className="editorial-grid">
          {consultationRoadmap.map((item) => (
            <article key={item.step} className="editorial-card accent">
              <div className="editorial-card-body">
                <span className="editorial-step-index">{item.step}</span>
                <h3>{item.title}</h3>
                <p className="editorial-muted">{item.desc}</p>
              </div>
            </article>
          ))}
        </div>
      </EditorialSection>
    </EditorialPage>
  );
};
