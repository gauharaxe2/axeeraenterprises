import React from 'react';
import {
  ArrowLeft,
  ArrowRight,
  ExternalLink,
  Handshake,
  Network,
  Globe,
  ShieldCheck,
  CheckCircle2,
  Sparkles,
  Layers,
  Building2,
  Users2
} from 'lucide-react';
import { PartnershipItem, PartnerLogo } from '../types';

interface PartnershipPageProps {
  partnerships: PartnershipItem[];
  partnerLogos: PartnerLogo[];
  notice?: string;
  onBackToHome: () => void;
  onContactClick: () => void;
}

export const PartnershipPage: React.FC<PartnershipPageProps> = ({
  partnerships,
  partnerLogos,
  notice = 'We are currently expanding our strategic partner network. Check back soon for new enterprise announcements!',
  onBackToHome,
  onContactClick
}) => {
  const getIcon = (iconName: string) => {
    switch (iconName) {
      case 'Handshake':
        return Handshake;
      case 'Network':
        return Network;
      case 'Globe':
        return Globe;
      default:
        return Handshake;
    }
  };

  const partnerPrograms = [
    {
      title: 'Cloud & Infrastructure Alliances',
      audience: 'Cloud Providers, Security Platforms & SaaS Tooling',
      perks: [
        'Direct architectural integration into client enterprise deployments',
        'Featured placement across Axe\'s Era official client documentation',
        'Joint case studies and co-marketing case breakdowns'
      ]
    },
    {
      title: 'Agency Referral & Co-Selling',
      audience: 'Specialized Agencies, Consultancies & Freelancers',
      perks: [
        'Lucrative 15% recurring referral commissions on signed enterprise retainers',
        'Access to our specialized engineering squad for complex builds',
        'Co-pitching support and architecture blueprints provided'
      ]
    },
    {
      title: 'Enterprise Vendor Integration',
      audience: 'FinTech, Logistics, CRM & E-Commerce APIs',
      perks: [
        'Certified production connectors for Next.js and headless apps',
        'Sub-second edge caching for third-party API payloads',
        'Dedicated SLA monitoring and priority bug reporting'
      ]
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
            <span className="text-sm font-medium text-blue-400">Enterprise Partnerships</span>
          </div>

          <button
            onClick={onContactClick}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold tracking-wide transition-colors cursor-pointer"
          >
            <span>Apply to Partner</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Hero Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-16">
        <div className="max-w-3xl">
          <div className="inline-flex items-center gap-2 text-xs font-semibold text-blue-400 tracking-wider uppercase mb-4">
            <Handshake className="w-4 h-4" />
            <span>Strategic Enterprise Alliances</span>
          </div>
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight text-white mb-6 text-balance">
            Collaborating With World-Class Technology Leaders
          </h1>
          <p className="text-base sm:text-lg text-slate-400 leading-relaxed">
            We partner with industry-leading cloud providers, payment rails, and software vendors to engineer
            scalable, resilient, and enterprise-grade digital systems for our global clients.
          </p>
        </div>
      </div>

      {/* Partnership Pillars */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-20">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {partnerships.map((p) => {
            const IconComponent = getIcon(p.icon);
            return (
              <div
                key={p.id}
                className="p-8 rounded-2xl bg-slate-900/40 border border-slate-800/80 hover:border-slate-700 transition-colors flex flex-col justify-between"
              >
                <div>
                  <div className="w-12 h-12 rounded-xl bg-blue-950/60 border border-blue-800/50 flex items-center justify-center text-blue-400 mb-6">
                    <IconComponent className="w-6 h-6" />
                  </div>
                  <h3 className="text-lg font-bold text-white mb-3">{p.title}</h3>
                  <p className="text-sm text-slate-400 leading-relaxed">{p.description}</p>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Official Technology Ecosystem (All Logos) */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-20">
        <div className="p-8 sm:p-12 rounded-2xl bg-slate-900/40 border border-slate-800">
          <div className="max-w-2xl mb-10">
            <p className="text-xs font-semibold text-blue-400 uppercase tracking-widest mb-2">
              Official Technology Ecosystem
            </p>
            <h2 className="text-2xl sm:text-3xl font-bold text-white">
              Enterprise & Solution Partners
            </h2>
            <p className="text-slate-400 text-sm mt-2">
              Our applications are built on and powered by the world's most trusted developer tools and cloud infrastructures.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {partnerLogos.map((logo) => (
              <div
                key={logo.id}
                className="p-6 rounded-xl bg-slate-950/60 border border-slate-800/80 hover:border-slate-700 transition-all flex flex-col justify-between group"
              >
                <div>
                  <div className="h-16 flex items-center justify-start mb-4">
                    <img
                      src={logo.logoUrl}
                      alt={logo.name}
                      className="max-h-12 max-w-[140px] object-contain filter grayscale group-hover:grayscale-0 transition-all duration-300"
                      referrerPolicy="no-referrer"
                      onError={(e) => {
                        (e.target as HTMLImageElement).src =
                          'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=200&q=80';
                      }}
                    />
                  </div>
                  <h4 className="text-sm font-semibold text-white mb-1 group-hover:text-blue-400 transition-colors">
                    {logo.name}
                  </h4>
                  <p className="text-xs text-slate-400">
                    Verified Technology Ecosystem Partner
                  </p>
                </div>

                {logo.websiteUrl && (
                  <div className="mt-6 pt-4 border-t border-slate-900">
                    <a
                      href={logo.websiteUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 text-xs text-blue-400 hover:text-blue-300 font-medium"
                    >
                      <span>Visit Partner Platform</span>
                      <ExternalLink className="w-3.5 h-3.5" />
                    </a>
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* Network Expansion Notice */}
          <div className="mt-10 p-4 rounded-xl bg-slate-950 border border-slate-800/80 text-center">
            <p className="text-xs text-slate-400">{notice}</p>
          </div>
        </div>
      </div>

      {/* Partner Programs & Tiers */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-20">
        <div className="text-center max-w-2xl mx-auto mb-12">
          <p className="text-xs font-semibold text-blue-400 uppercase tracking-widest mb-2">
            Collaboration Models
          </p>
          <h2 className="text-2xl font-bold text-white">How We Partner With Organizations</h2>
          <p className="text-slate-400 text-sm mt-2">
            Structured engagement frameworks designed for mutual growth and enterprise delivery excellence.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {partnerPrograms.map((program, idx) => (
            <div
              key={idx}
              className="p-8 rounded-2xl bg-slate-900/40 border border-slate-800 flex flex-col justify-between"
            >
              <div>
                <span className="text-xs font-semibold text-blue-400 uppercase tracking-wider block mb-2">
                  Track 0{idx + 1}
                </span>
                <h3 className="text-lg font-bold text-white mb-2">{program.title}</h3>
                <p className="text-xs text-slate-400 mb-6">{program.audience}</p>

                <div className="space-y-3 border-t border-slate-800/80 pt-6">
                  {program.perks.map((perk, pIdx) => (
                    <div key={pIdx} className="flex items-start gap-2.5 text-xs text-slate-300">
                      <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                      <span>{perk}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Bottom CTA */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="p-8 sm:p-12 rounded-2xl bg-gradient-to-br from-blue-950/40 via-slate-900 to-slate-950 border border-blue-900/40 text-center max-w-4xl mx-auto">
          <h2 className="text-2xl sm:text-3xl font-bold text-white mb-4 text-balance">
            Explore a Strategic Alliance With Axe's Era
          </h2>
          <p className="text-slate-300 text-sm sm:text-base max-w-2xl mx-auto mb-8">
            Are you a technology provider, design agency, or enterprise vendor looking to partner? Let's connect
            and discuss how we can create mutual value.
          </p>
          <div className="flex flex-wrap items-center justify-center gap-4">
            <button
              onClick={onContactClick}
              className="px-6 py-3 rounded-lg bg-blue-600 hover:bg-blue-500 text-white font-semibold text-sm transition-colors cursor-pointer"
            >
              Submit Partnership Inquiry
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
