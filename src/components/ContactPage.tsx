import React, { useState } from 'react';
import { ContactFormData, ServiceItem } from '../types';
import { saveSubmissionToFirestore } from '../utils/firebase';
import { buildContactEnquiry } from '../utils/contactEnquiry';
import { useLanguage } from '../context/LanguageContext';
import { SiteNavigate, usePlainClick } from '../site/chrome';
import { googleMapsPlaceUrl } from '../utils/maps';

interface ContactEnquiryFormProps {
  idPrefix?: string;
  phone: string;
  servicesList: Array<Pick<ServiceItem, 'id' | 'title'>>;
  onShowNotification: (message: string, type: 'success' | 'error' | 'info') => void;
}

export function ContactEnquiryForm({
  idPrefix = 'contact',
  phone,
  servicesList,
  onShowNotification
}: ContactEnquiryFormProps) {
  const { strings } = useLanguage();
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

  const handleChange = (
    event: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    setFormData({ ...formData, [event.target.name]: event.target.value });
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
      setFormData({ name: '', email: '', company: '', service: '', message: '' });
      setBudget('');
      setTimeline('');
      setBotField('');
      setIsSubmitted(true);
      onShowNotification(
        "Thank you for your message! Axe's Era Enterprises will review your request and get back to you shortly.",
        'success'
      );
    } catch {
      onShowNotification(
        `We couldn't send your message, so it was not delivered. Use WhatsApp or call ${phone}.`,
        'error'
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isSubmitted) {
    return <p role="status">Your message is in the studio inbox.</p>;
  }

  return (
    <form className="studio-form" onSubmit={(event) => void handleSubmit(event)} noValidate>
      <p className="studio-hp" hidden>
        <label>
          Don’t fill this out if you're human:
          <input name="bot-field" value={botField} onChange={(event) => setBotField(event.target.value)} tabIndex={-1} autoComplete="off" />
        </label>
      </p>
      <div className="studio-form-grid">
        <div className="studio-field">
          <label htmlFor={`${idPrefix}-name`}>{strings.contact.namePlaceholder}</label>
          <input id={`${idPrefix}-name`} name="name" value={formData.name} onChange={handleChange} required autoComplete="name" />
        </div>
        <div className="studio-field">
          <label htmlFor={`${idPrefix}-email`}>{strings.contact.emailPlaceholder}</label>
          <input id={`${idPrefix}-email`} type="email" name="email" value={formData.email} onChange={handleChange} required autoComplete="email" />
        </div>
      </div>
      <div className="studio-form-grid">
        <div className="studio-field">
          <label htmlFor={`${idPrefix}-company`}>{strings.contact.companyPlaceholder}</label>
          <input id={`${idPrefix}-company`} name="company" value={formData.company} onChange={handleChange} autoComplete="organization" />
        </div>
        <div className="studio-field">
          <label htmlFor={`${idPrefix}-service`}>{strings.contact.servicePlaceholder}</label>
          <select id={`${idPrefix}-service`} name="service" value={formData.service} onChange={handleChange}>
            <option value="">{strings.contact.servicePlaceholder}</option>
            {servicesList.map((service) => (
              <option key={service.id} value={service.title}>{service.title}</option>
            ))}
          </select>
        </div>
      </div>
      <div className="studio-form-grid">
        <div className="studio-field">
          <label htmlFor={`${idPrefix}-budget`}>Estimated budget range</label>
          <select id={`${idPrefix}-budget`} value={budget} onChange={(event) => setBudget(event.target.value)}>
            <option value="">Select budget (optional)</option>
            <option value="$1,000 – $3,000">$1,000 – $3,000 (MVP / Sprint)</option>
            <option value="$3,000 – $10,000">$3,000 – $10,000 (Full Platform / App)</option>
            <option value="$10,000+">$10,000+ (Enterprise Custom System)</option>
            <option value="Flexible / Retainer">Monthly Retainer</option>
          </select>
        </div>
        <div className="studio-field">
          <label htmlFor={`${idPrefix}-timeline`}>Target launch timeline</label>
          <select id={`${idPrefix}-timeline`} value={timeline} onChange={(event) => setTimeline(event.target.value)}>
            <option value="">Select timeline (optional)</option>
            <option value="Immediate (< 2 Weeks)">Immediate (&lt; 2 Weeks)</option>
            <option value="1 Month">1 Month</option>
            <option value="2–3 Months">2–3 Months</option>
            <option value="Flexible">Flexible Planning</option>
          </select>
        </div>
      </div>
      <div className="studio-field">
        <label htmlFor={`${idPrefix}-message`}>{strings.contact.messagePlaceholder}</label>
        <textarea id={`${idPrefix}-message`} name="message" value={formData.message} onChange={handleChange} required rows={5} />
      </div>
      <button className="studio-btn studio-btn-primary" type="submit" disabled={isSubmitting}>
        {isSubmitting ? strings.contact.sendingButton : strings.contact.sendButton}
      </button>
    </form>
  );
}

interface ContactPageProps {
  address: string;
  phone: string;
  email: string;
  whatsappNumber?: string;
  urgentNotice?: string;
  mapLatitude?: number;
  mapLongitude?: number;
  servicesList: ServiceItem[];
  onShowNotification: (message: string, type: 'success' | 'error' | 'info') => void;
  navigate: SiteNavigate;
}

export const ContactPage: React.FC<ContactPageProps> = ({
  address,
  phone,
  email,
  whatsappNumber = '923157338694',
  urgentNotice,
  mapLatitude,
  mapLongitude,
  servicesList,
  onShowNotification,
  navigate
}) => {
  const { strings } = useLanguage();
  const click = usePlainClick(navigate);
  const numbers = phone.split('/').map((part) => part.trim()).filter(Boolean);
  const hasPin = typeof mapLatitude === 'number' && typeof mapLongitude === 'number';
  return (
    <section className="studio-section">
      <div className="studio-wrap studio-split">
        <div>
          <p className="studio-kicker">{strings.contact.sectionTitle}</p>
          <h1>{strings.contact.getInTouch}</h1>
          <p>{strings.contact.description}</p>
          {urgentNotice && <div className="studio-note">{urgentNotice}</div>}
          <h2>{strings.contact.addressLabel}</h2>
          <p>{address}</p>
          <p>
            <a href="/location" onClick={(event) => click(event, '/location')}>Map</a>
            {' · '}
            <a href={googleMapsPlaceUrl(address, hasPin ? { lat: mapLatitude as number, lng: mapLongitude as number } : null)} target="_blank" rel="noopener noreferrer">Google Maps</a>
          </p>
          <h2>{strings.contact.phoneLabel}</h2>
          {numbers.map((number) => (
            <p key={number}><a href={`tel:${number.replace(/[^\d+]/g, '')}`}>{number}</a></p>
          ))}
          <h2>{strings.contact.emailLabel}</h2>
          <p><a href={`mailto:${email}`}>{email}</a></p>
          <p>
            <a href={`https://wa.me/${whatsappNumber.replace(/[^0-9]/g, '')}`} target="_blank" rel="noopener noreferrer">WhatsApp</a>
          </p>
        </div>
        <ContactEnquiryForm phone={phone} servicesList={servicesList} onShowNotification={onShowNotification} />
      </div>
    </section>
  );
};
