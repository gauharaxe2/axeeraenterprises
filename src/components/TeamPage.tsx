import React from 'react';
import {
  ArrowLeft,
  ArrowRight,
  Award,
  CheckCircle2,
  ExternalLink,
  Github,
  Globe2,
  Linkedin,
  Mail,
  ShieldCheck,
  Sparkles,
  Twitter,
  Users2,
  Youtube,
  Facebook,
  Instagram
} from 'lucide-react';
import { TeamMemberData } from '../types';

interface TeamPageProps {
  team: TeamMemberData[];
  onBackToHome: () => void;
  onContactClick: () => void;
}

export const TeamPage: React.FC<TeamPageProps> = ({
  team,
  onBackToHome,
  onContactClick
}) => {
  const founder = team[0] || {
    id: 'gauhar-nadeem',
    name: 'Gauhar Nadeem',
    title: 'CEO & Founder',
    bio: "Visionary leadership driving digital excellence. Gauhar Axe founded Axe's Era Enterprise with a focus on crafting conversion-engineered web platforms, cutting-edge mobile apps, and iconic visual identities.",
    imageUrl: 'https://i.postimg.cc/PqjZ6d8q/Picsart-26-08-08-06-40-52-321.jpg',
    socials: {
      linkedin: 'https://www.linkedin.com/in/gauharaxe/',
      twitter: 'https://twitter.com/gauharaxe',
      upwork: 'https://www.upwork.com/freelancers/~0131edfc6b7fb25125',
      youtube: 'https://www.youtube.com/@gauharaxe',
      facebook: 'https://www.facebook.com/gauharaxe',
      instagram: 'https://www.instagram.com/gauharaxe'
    }
  };

  const disciplines = [
    {
      title: 'Full-Stack Architecture & Cloud',
      skills: ['Next.js 15 & React 19', 'TypeScript Strict Mode', 'PostgreSQL & Firestore', 'Cloudflare Edge CDN']
    },
    {
      title: 'UI/UX & Brand Identity Systems',
      skills: ['Figma Design Systems', 'Design Tokens & Scalable Grids', 'Vector Typography', 'Conversion Rate Optimization']
    },
    {
      title: 'Performance Marketing & SEO',
      skills: ['Technical Core Web Vitals', 'Intent-Driven Search Strategy', 'Full-Funnel Analytics', 'Attribution Modeling']
    },
    {
      title: 'Mobile & Headless Applications',
      skills: ['Progressive Web Apps (PWA)', 'Headless Shopify (Liquid/Storefront API)', 'REST & GraphQL APIs', 'Stripe Billing']
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
            <span className="text-sm font-medium text-blue-400">Our Leadership & Team</span>
          </div>

          <button
            onClick={onContactClick}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold tracking-wide transition-colors cursor-pointer"
          >
            <span>Connect with Founder</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Hero Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-16">
        <div className="max-w-3xl">
          <div className="inline-flex items-center gap-2 text-xs font-semibold text-blue-400 tracking-wider uppercase mb-4">
            <Users2 className="w-4 h-4" />
            <span>Visionary Leadership</span>
          </div>
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight text-white mb-6 text-balance">
            Meet the Architects Behind Axe's Era Enterprise
          </h1>
          <p className="text-base sm:text-lg text-slate-400 leading-relaxed">
            We operate with a high-density senior talent model. You collaborate directly with principal
            architects and designers who take personal ownership of your digital platform from day one.
          </p>
        </div>
      </div>

      {/* Featured Founder Spotlight Card */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-20">
        <div className="rounded-2xl bg-slate-900/40 border border-slate-800 overflow-hidden shadow-2xl">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center p-8 sm:p-12">
            {/* Portrait */}
            <div className="lg:col-span-5">
              <div className="relative rounded-xl overflow-hidden border border-slate-800 bg-slate-950 aspect-[4/5] max-h-[480px]">
                <img
                  src={founder.imageUrl || 'https://i.postimg.cc/PqjZ6d8q/Picsart-26-08-08-06-40-52-321.jpg'}
                  alt={founder.name}
                  className="w-full h-full object-cover object-top"
                  referrerPolicy="no-referrer"
                  onError={(e) => {
                    (e.target as HTMLImageElement).src =
                      'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=800&q=80';
                  }}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/20 to-transparent opacity-70" />
                <div className="absolute bottom-4 left-4 right-4">
                  <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded bg-blue-600/90 text-white text-[11px] font-semibold">
                    <Award className="w-3.5 h-3.5" />
                    <span>Top-Rated Digital Architect</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Content & Socials */}
            <div className="lg:col-span-7">
              <div className="flex flex-wrap items-center gap-3 mb-2">
                <span className="text-xs font-semibold text-blue-400 uppercase tracking-widest">
                  Founder & Principal Architect
                </span>
                <span className="text-slate-700">·</span>
                <span className="text-xs text-slate-400">Multan, Pakistan / Global Client Base</span>
              </div>

              <h2 className="text-2xl sm:text-3xl font-extrabold text-white mb-2">
                {founder.name} <span className="text-slate-400 font-medium text-lg">(Gauhar Axe)</span>
              </h2>

              <p className="text-sm font-semibold text-blue-400 mb-6">{founder.title}</p>

              <p className="text-sm sm:text-base text-slate-300 leading-relaxed mb-6">
                {founder.bio}
              </p>

              <p className="text-xs sm:text-sm text-slate-400 leading-relaxed mb-8">
                Gauhar brings extensive experience engineering bespoke enterprise platforms, high-converting
                commercial web stores, and custom software architectures. His philosophy centers on
                technical precision, eliminating unnecessary software bloat, and empowering clients with complete
                code sovereignty upon project handover.
              </p>

              {/* Direct Social Handles */}
              <div className="border-t border-slate-800/80 pt-6">
                <p className="text-xs font-semibold text-slate-400 mb-4 uppercase tracking-wider">
                  Verified Executive Channels
                </p>
                <div className="flex flex-wrap gap-2.5">
                  {founder.socials.linkedin && (
                    <a
                      href={founder.socials.linkedin}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-3 py-2 rounded-lg bg-slate-950 hover:bg-blue-600 hover:text-white text-slate-300 text-xs font-medium border border-slate-800 transition-colors inline-flex items-center gap-2"
                    >
                      <Linkedin className="w-3.5 h-3.5 text-blue-400" />
                      <span>LinkedIn Profile</span>
                    </a>
                  )}

                  {founder.socials.upwork && (
                    <a
                      href={founder.socials.upwork}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-3 py-2 rounded-lg bg-slate-950 hover:bg-emerald-600 hover:text-white text-slate-300 text-xs font-medium border border-slate-800 transition-colors inline-flex items-center gap-2"
                    >
                      <Award className="w-3.5 h-3.5 text-emerald-400" />
                      <span>Upwork Agency Profile</span>
                    </a>
                  )}

                  {founder.socials.twitter && (
                    <a
                      href={founder.socials.twitter}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-3 py-2 rounded-lg bg-slate-950 hover:bg-slate-800 text-slate-300 text-xs font-medium border border-slate-800 transition-colors inline-flex items-center gap-2"
                    >
                      <Twitter className="w-3.5 h-3.5 text-sky-400" />
                      <span>X (Twitter)</span>
                    </a>
                  )}

                  {founder.socials.youtube && (
                    <a
                      href={founder.socials.youtube}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-3 py-2 rounded-lg bg-slate-950 hover:bg-red-600 hover:text-white text-slate-300 text-xs font-medium border border-slate-800 transition-colors inline-flex items-center gap-2"
                    >
                      <Youtube className="w-3.5 h-3.5 text-red-500" />
                      <span>YouTube</span>
                    </a>
                  )}

                  {founder.socials.facebook && (
                    <a
                      href={founder.socials.facebook}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-3 py-2 rounded-lg bg-slate-950 hover:bg-blue-700 hover:text-white text-slate-300 text-xs font-medium border border-slate-800 transition-colors inline-flex items-center gap-2"
                    >
                      <Facebook className="w-3.5 h-3.5 text-blue-500" />
                      <span>Facebook</span>
                    </a>
                  )}

                  {founder.socials.instagram && (
                    <a
                      href={founder.socials.instagram}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-3 py-2 rounded-lg bg-slate-950 hover:bg-pink-600 hover:text-white text-slate-300 text-xs font-medium border border-slate-800 transition-colors inline-flex items-center gap-2"
                    >
                      <Instagram className="w-3.5 h-3.5 text-pink-500" />
                      <span>Instagram</span>
                    </a>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Engineering Competencies */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-20">
        <div className="text-center max-w-2xl mx-auto mb-12">
          <p className="text-xs font-semibold text-blue-400 uppercase tracking-widest mb-2">
            Core Capabilities
          </p>
          <h3 className="text-2xl font-bold text-white">Technical Disciplines Mastered</h3>
          <p className="text-slate-400 text-sm mt-2">
            Our team cross-pollinates technical engineering and visual design to deliver unified results.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {disciplines.map((d, idx) => (
            <div
              key={idx}
              className="p-6 rounded-xl bg-slate-900/40 border border-slate-800/80 hover:border-slate-700 transition-colors flex flex-col justify-between"
            >
              <div>
                <h4 className="text-sm font-semibold text-white mb-4">{d.title}</h4>
                <ul className="space-y-2.5">
                  {d.skills.map((s, sIdx) => (
                    <li key={sIdx} className="flex items-center gap-2 text-xs text-slate-400">
                      <CheckCircle2 className="w-3.5 h-3.5 text-blue-400 shrink-0" />
                      <span>{s}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Talent Ecosystem / Join Us */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-20">
        <div className="p-8 sm:p-10 rounded-2xl bg-slate-900/40 border border-slate-800">
          <div className="max-w-3xl">
            <h3 className="text-xl sm:text-2xl font-bold text-white mb-3">
              Partner With Our Extended Engineering Network
            </h3>
            <p className="text-sm text-slate-400 leading-relaxed mb-6">
              Axe's Era Enterprise regularly partners with specialized backend engineers, cloud architects,
              and motion designers for mission-critical enterprise engagements. If you build at the highest
              level, we welcome collaborations on global client projects.
            </p>
            <button
              onClick={onContactClick}
              className="px-5 py-2.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold border border-slate-700 transition-colors cursor-pointer"
            >
              Inquire About Technical Collaboration
            </button>
          </div>
        </div>
      </div>

      {/* Bottom CTA */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="p-8 sm:p-12 rounded-2xl bg-gradient-to-br from-blue-950/40 via-slate-900 to-slate-950 border border-blue-900/40 text-center max-w-4xl mx-auto">
          <h2 className="text-2xl sm:text-3xl font-bold text-white mb-4 text-balance">
            Collaborate Directly With Gauhar Axe
          </h2>
          <p className="text-slate-300 text-sm sm:text-base max-w-2xl mx-auto mb-8">
            Skip the middle management. Speak directly with the engineering lead who will build, oversee,
            and guarantee your digital product delivery.
          </p>
          <div className="flex flex-wrap items-center justify-center gap-4">
            <button
              onClick={onContactClick}
              className="px-6 py-3 rounded-lg bg-blue-600 hover:bg-blue-500 text-white font-semibold text-sm transition-colors cursor-pointer"
            >
              Schedule Strategy Discussion
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
