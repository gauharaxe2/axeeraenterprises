import React, { useState } from 'react';
import {
  ArrowLeft,
  ArrowRight,
  MapPin,
  Phone,
  Mail,
  Send,
  Clock,
  ShieldCheck,
  CheckCircle2,
  ExternalLink,
  MessageSquare,
  Sparkles,
  Building2
} from 'lucide-react';
import { ContactFormData, ServiceItem } from '../types';
import { CONTACT_FORM_ACTION, CONTACT_FORM_NAME, encodeContactForm, isNetlifyFormAccepted } from '../utils/netlifyForm';
import { saveSubmissionToFirestore } from '../utils/firebase';
import { WhatsAppIcon } from './WhatsAppIcon';

interface ContactPageProps {
  address?: string;
  phone?: string;
  email?: string;
  whatsappNumber?: string;
  urgentNotice?: string;
  servicesList?: ServiceItem[];
  onShowNotification: (message: string, type: 'success' | 'error' | 'info') => void;
  onBackToHome: () => void;
}

function phoneHref(display: string): string {
  const compact = display.replace(/[^\d+]/g, '');
  return compact ? `tel:${compact}` : 'tel:+923157338694';
}

export const ContactPage: React.FC<ContactPageProps> = ({
  address = 'D-26, Wahdat Colony, Multan, 66000',
  phone = '+92-315-7338694 / +92-339-0096853',
  email = 'gauharaxe@outlook.com',
  whatsappNumber = '923157338694',
  urgentNotice = "NOTE: If you don't get our response back via e-mail sooner, tap the WhatsApp button for an immediate live response!",
  servicesList = [],
  onShowNotification,
  onBackToHome
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

    setIsSubmitting(true);

    try {
      const response = await fetch(CONTACT_FORM_ACTION, {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: encodeContactForm({
          name: formData.name.trim(),
          email: formData.email.trim(),
          company: formData.company.trim(),
          service: formData.service,
          message: formData.message.trim() + (budget ? ` [Budget: ${budget}]` : '') + (timeline ? ` [Timeline: ${timeline}]` : ''),
          botField
        })
      });
      const body = await response.text();
      if (!isNetlifyFormAccepted(response.status, body)) {
        throw new Error('Form was not accepted');
      }

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

      // Persist to Firebase Firestore
      saveSubmissionToFirestore({
        fullName: formData.name.trim(),
        email: formData.email.trim(),
        service: formData.service || undefined,
        message: formData.message.trim(),
        budget: budget ? `${budget}${formData.company ? ` | Company: ${formData.company}` : ''}` : (formData.company ? `Company: ${formData.company}` : undefined)
      }).catch((err) => {
        console.warn('Firestore submission backup:', err);
      });

      onShowNotification(
        "Thank you! Your consultation inquiry has been submitted. Gauhar Axe will review your request within 2–4 hours.",
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
            <span className="text-sm font-medium text-blue-400">Contact & Consultation Portal</span>
          </div>

          <a
            href={`https://wa.me/${whatsappNumber}`}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold tracking-wide transition-colors"
          >
            <WhatsAppIcon className="w-3.5 h-3.5 fill-white" />
            <span>Instant WhatsApp Chat</span>
          </a>
        </div>
      </div>

      {/* Hero Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-16">
        <div className="max-w-3xl">
          <div className="inline-flex items-center gap-2 text-xs font-semibold text-blue-400 tracking-wider uppercase mb-4">
            <MessageSquare className="w-4 h-4" />
            <span>Direct Executive Consultation</span>
          </div>
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight text-white mb-6 text-balance">
            Let's Engineer Your Digital Growth Engine
          </h1>
          <p className="text-base sm:text-lg text-slate-400 leading-relaxed">
            Partner with Axe's Era Enterprise. Schedule a technical discovery session directly with founder
            Gauhar Axe to map your platform architecture, project scope, and deployment timeline.
          </p>
        </div>
      </div>

      {/* Main Form & Contact Information Grid */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-20">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
          {/* Left Column: Direct Channels & Office Info */}
          <div className="lg:col-span-5 space-y-6">
            {/* Urgent Notice Banner */}
            <div className="p-6 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-amber-300">
              <div className="flex items-start gap-3">
                <WhatsAppIcon className="w-5 h-5 fill-amber-400 shrink-0 mt-0.5" />
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wider mb-1 text-amber-400">
                    Immediate WhatsApp Response
                  </p>
                  <p className="text-xs leading-relaxed text-amber-200">
                    {urgentNotice}
                  </p>
                </div>
              </div>
            </div>

            {/* Contact Details Cards */}
            <div className="p-8 rounded-2xl bg-slate-900/40 border border-slate-800 space-y-6">
              <h3 className="text-lg font-bold text-white border-b border-slate-800 pb-4">
                Headquarters & Communications
              </h3>

              <div className="flex items-start gap-4">
                <div className="w-10 h-10 rounded-lg bg-blue-950/60 border border-blue-800/50 flex items-center justify-center text-blue-400 shrink-0">
                  <MapPin className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                    Office Address
                  </h4>
                  <p className="text-sm font-medium text-white mt-1">{address}</p>
                  <p className="text-xs text-slate-500 mt-0.5">Registered Headquarters, Pakistan</p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="w-10 h-10 rounded-lg bg-emerald-950/60 border border-emerald-800/50 flex items-center justify-center text-emerald-400 shrink-0">
                  <Phone className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                    Official Telephone
                  </h4>
                  <p className="text-sm font-medium text-white mt-1">
                    <a href={phoneHref(phone)} className="hover:text-blue-400 transition-colors">
                      {phone}
                    </a>
                  </p>
                  <p className="text-xs text-slate-500 mt-0.5">Mon–Sat: 9:00 AM – 7:00 PM PKT</p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="w-10 h-10 rounded-lg bg-indigo-950/60 border border-indigo-800/50 flex items-center justify-center text-indigo-400 shrink-0">
                  <Mail className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                    Executive E-Mail
                  </h4>
                  <p className="text-sm font-medium text-white mt-1">
                    <a href={`mailto:${email}`} className="hover:text-blue-400 transition-colors">
                      {email}
                    </a>
                  </p>
                  <p className="text-xs text-slate-500 mt-0.5">Direct inbox reviewed by leadership</p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="w-10 h-10 rounded-lg bg-emerald-950/60 border border-emerald-800/50 flex items-center justify-center text-emerald-400 shrink-0">
                  <WhatsAppIcon className="w-5 h-5 fill-emerald-400" />
                </div>
                <div>
                  <h4 className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                    WhatsApp Direct Line
                  </h4>
                  <p className="text-sm font-medium text-white mt-1">
                    <a
                      href={`https://wa.me/${whatsappNumber}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="hover:text-emerald-400 transition-colors inline-flex items-center gap-1.5"
                    >
                      <span>+{whatsappNumber}</span>
                      <ExternalLink className="w-3.5 h-3.5" />
                    </a>
                  </p>
                  <p className="text-xs text-slate-500 mt-0.5">Immediate live messaging & voice note sync</p>
                </div>
              </div>
            </div>

            {/* Operating Hours */}
            <div className="p-6 rounded-2xl bg-slate-900/30 border border-slate-800/80">
              <div className="flex items-center gap-3 mb-2">
                <Clock className="w-4 h-4 text-blue-400" />
                <h4 className="text-xs font-semibold text-white uppercase tracking-wider">
                  Engagement Hours
                </h4>
              </div>
              <p className="text-xs text-slate-400 leading-relaxed">
                Headquarters operating hours: 09:00 - 19:00 (PKT). For active client emergencies and SLA
                subscribers, infrastructure monitoring runs 24/7/365.
              </p>
            </div>
          </div>

          {/* Right Column: Full Discovery Consultation Form */}
          <div className="lg:col-span-7">
            <div className="p-8 sm:p-10 rounded-2xl bg-slate-900/50 border border-slate-800 shadow-2xl">
              <h3 className="text-xl sm:text-2xl font-bold text-white mb-2">
                Request a Technical Discovery Session
              </h3>
              <p className="text-xs sm:text-sm text-slate-400 mb-8">
                Tell us about your project, target business goals, and timeline. All inquiries receive a confidential
                review within 2–4 hours.
              </p>

              {isSubmitted ? (
                <div className="p-8 rounded-xl bg-emerald-950/40 border border-emerald-800/50 text-center">
                  <div className="w-12 h-12 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center mx-auto mb-4">
                    <CheckCircle2 className="w-6 h-6" />
                  </div>
                  <h4 className="text-lg font-bold text-white mb-2">Message Successfully Transmitted</h4>
                  <p className="text-xs sm:text-sm text-slate-300 max-w-md mx-auto mb-6 leading-relaxed">
                    Thank you for contacting Axe's Era Enterprise. Gauhar Axe will analyze your requirements and reach out via email or WhatsApp shortly.
                  </p>
                  <button
                    onClick={() => setIsSubmitted(false)}
                    className="px-4 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-white transition-colors cursor-pointer"
                  >
                    Send Another Inquiry
                  </button>
                </div>
              ) : (
                <form
                  name={CONTACT_FORM_NAME}
                  method="POST"
                  action={CONTACT_FORM_ACTION}
                  data-netlify="true"
                  data-netlify-honeypot="bot-field"
                  onSubmit={handleSubmit}
                  className="space-y-5"
                >
                  <input type="hidden" name="form-name" value={CONTACT_FORM_NAME} />
                  <p className="hidden" aria-hidden="true">
                    <label>
                      Don't fill this out if you're human:
                      <input
                        name="bot-field"
                        value={botField}
                        onChange={(e) => setBotField(e.target.value)}
                        tabIndex={-1}
                        autoComplete="off"
                      />
                    </label>
                  </p>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                    <div>
                      <label htmlFor="contact-name" className="block text-xs font-medium text-slate-300 mb-2">
                        Your Full Name *
                      </label>
                      <input
                        type="text"
                        id="contact-name"
                        name="name"
                        value={formData.name}
                        onChange={handleChange}
                        required
                        placeholder="e.g. Alex Morgan"
                        className="w-full px-4 py-2.5 rounded-lg bg-slate-950 border border-slate-800 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 transition-colors"
                      />
                    </div>

                    <div>
                      <label htmlFor="contact-email" className="block text-xs font-medium text-slate-300 mb-2">
                        Business E-Mail *
                      </label>
                      <input
                        type="email"
                        id="contact-email"
                        name="email"
                        value={formData.email}
                        onChange={handleChange}
                        required
                        placeholder="alex@company.com"
                        className="w-full px-4 py-2.5 rounded-lg bg-slate-950 border border-slate-800 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 transition-colors"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                    <div>
                      <label htmlFor="contact-company" className="block text-xs font-medium text-slate-300 mb-2">
                        Company or Organization
                      </label>
                      <input
                        type="text"
                        id="contact-company"
                        name="company"
                        value={formData.company}
                        onChange={handleChange}
                        placeholder="e.g. Apex Global"
                        className="w-full px-4 py-2.5 rounded-lg bg-slate-950 border border-slate-800 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 transition-colors"
                      />
                    </div>

                    <div>
                      <label htmlFor="contact-service" className="block text-xs font-medium text-slate-300 mb-2">
                        Primary Capability Needed
                      </label>
                      <select
                        id="contact-service"
                        name="service"
                        value={formData.service}
                        onChange={handleChange}
                        className="w-full px-4 py-2.5 rounded-lg bg-slate-950 border border-slate-800 text-sm text-white focus:outline-none focus:border-blue-500 transition-colors"
                      >
                        <option value="">Select Service (Optional)</option>
                        {servicesList.map((s) => (
                          <option key={s.id} value={s.title}>
                            {s.title}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                    <div>
                      <label htmlFor="contact-budget" className="block text-xs font-medium text-slate-300 mb-2">
                        Estimated Budget Range
                      </label>
                      <select
                        id="contact-budget"
                        value={budget}
                        onChange={(e) => setBudget(e.target.value)}
                        className="w-full px-4 py-2.5 rounded-lg bg-slate-950 border border-slate-800 text-sm text-white focus:outline-none focus:border-blue-500 transition-colors"
                      >
                        <option value="">Select Budget (Optional)</option>
                        <option value="$1,000 – $3,000">$1,000 – $3,000 (MVP / Sprint)</option>
                        <option value="$3,000 – $10,000">$3,000 – $10,000 (Full Platform / App)</option>
                        <option value="$10,000+">$10,000+ (Enterprise Custom System)</option>
                        <option value="Flexible / Retainer">Monthly Retainer</option>
                      </select>
                    </div>

                    <div>
                      <label htmlFor="contact-timeline" className="block text-xs font-medium text-slate-300 mb-2">
                        Target Launch Timeline
                      </label>
                      <select
                        id="contact-timeline"
                        value={timeline}
                        onChange={(e) => setTimeline(e.target.value)}
                        className="w-full px-4 py-2.5 rounded-lg bg-slate-950 border border-slate-800 text-sm text-white focus:outline-none focus:border-blue-500 transition-colors"
                      >
                        <option value="">Select Timeline (Optional)</option>
                        <option value="Immediate (< 2 Weeks)">Immediate (&lt; 2 Weeks)</option>
                        <option value="1 Month">1 Month</option>
                        <option value="2–3 Months">2–3 Months</option>
                        <option value="Flexible">Flexible Planning</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <label htmlFor="contact-message" className="block text-xs font-medium text-slate-300 mb-2">
                      Project Goals, Scope & Specifications *
                    </label>
                    <textarea
                      id="contact-message"
                      name="message"
                      value={formData.message}
                      onChange={handleChange}
                      required
                      rows={5}
                      placeholder="Describe your project, current bottlenecks, target deliverables, or provide relevant reference links..."
                      className="w-full px-4 py-3 rounded-lg bg-slate-950 border border-slate-800 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 transition-colors resize-y"
                    />
                  </div>

                  <div className="pt-2">
                    <button
                      type="submit"
                      disabled={isSubmitting}
                      className="w-full py-3.5 px-6 rounded-lg bg-blue-600 hover:bg-blue-500 disabled:bg-blue-800 text-white font-semibold text-sm transition-all flex items-center justify-center gap-2 shadow-lg cursor-pointer"
                    >
                      {isSubmitting ? (
                        <>
                          <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                          <span>Encrypting & Transmitting...</span>
                        </>
                      ) : (
                        <>
                          <span>Submit Discovery Request</span>
                          <Send className="w-4 h-4" />
                        </>
                      )}
                    </button>
                  </div>
                </form>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* 3-Step Consultation Journey */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="p-8 sm:p-12 rounded-2xl bg-slate-900/30 border border-slate-800">
          <div className="text-center max-w-2xl mx-auto mb-10">
            <p className="text-xs font-semibold text-blue-400 uppercase tracking-widest mb-1">
              What Happens Next
            </p>
            <h3 className="text-xl font-bold text-white">Our 3-Step Consultation Process</h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {consultationRoadmap.map((item, idx) => (
              <div key={idx} className="p-6 rounded-xl bg-slate-950/60 border border-slate-800/80">
                <span className="text-2xl font-black text-blue-400 font-mono mb-2 block">{item.step}</span>
                <h4 className="text-sm font-semibold text-white mb-2">{item.title}</h4>
                <p className="text-xs text-slate-400 leading-relaxed">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
