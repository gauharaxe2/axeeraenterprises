import React, { useState, useMemo } from 'react';
import {
  ArrowLeft,
  ArrowRight,
  ExternalLink,
  Search,
  Globe2,
  TrendingUp,
  Layers,
  ShieldCheck,
  Code2
} from 'lucide-react';
import { Project } from '../types';

interface WebsitesPageProps {
  projects: Project[];
  onBackToHome: () => void;
  onContactClick: () => void;
}

export const WebsitesPage: React.FC<WebsitesPageProps> = ({
  projects,
  onBackToHome,
  onContactClick
}) => {
  const [activeCategory, setActiveCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');

  const categories = [
    { id: 'all', label: 'All Deployments' },
    { id: 'ecommerce', label: 'E-Commerce Stores' },
    { id: 'saas', label: 'SaaS & Enterprise Systems' },
    { id: 'web', label: 'Web Platforms & Marketplaces' }
  ];

  const filteredProjects = useMemo(() => {
    return projects.filter((project) => {
      const matchesCategory =
        activeCategory === 'all' || project.category === activeCategory;
      const q = searchQuery.trim().toLowerCase();
      const matchesSearch =
        !q ||
        project.title.toLowerCase().includes(q) ||
        project.subtitle.toLowerCase().includes(q) ||
        (project.description && project.description.toLowerCase().includes(q)) ||
        (project.tags && project.tags.some((t) => t.toLowerCase().includes(q)));

      return matchesCategory && matchesSearch;
    });
  }, [projects, activeCategory, searchQuery]);

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
            <span className="text-sm font-medium text-blue-400">Websites & Case Studies</span>
          </div>

          <button
            onClick={onContactClick}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold tracking-wide transition-colors cursor-pointer"
          >
            <span>Discuss a Project</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Hero Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-16">
        <div className="max-w-3xl">
          <div className="inline-flex items-center gap-2 text-xs font-semibold text-blue-400 tracking-wider uppercase mb-4">
            <Globe2 className="w-4 h-4" />
            <span>Proven Enterprise Deployments</span>
          </div>
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight text-white mb-6 text-balance">
            Production Websites, High-Growth SaaS & E-Commerce Platforms
          </h1>
          <p className="text-base sm:text-lg text-slate-400 leading-relaxed">
            Explore our curated portfolio of live digital platforms. Each project is custom-engineered
            for measurable conversion velocity, resilient cloud scalability, and exceptional user experience.
          </p>
        </div>
      </div>

      {/* Interactive Filter & Search Controls */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-12">
        <div className="flex flex-col md:flex-row gap-4 items-stretch md:items-center justify-between p-4 rounded-xl bg-slate-900/60 border border-slate-800">
          {/* Category Tabs */}
          <div className="flex flex-wrap gap-2">
            {categories.map((cat) => (
              <button
                key={cat.id}
                onClick={() => setActiveCategory(cat.id)}
                className={`px-3.5 py-2 rounded-lg text-xs font-medium transition-colors cursor-pointer whitespace-nowrap ${
                  activeCategory === cat.id
                    ? 'bg-blue-600 text-white shadow-sm'
                    : 'bg-slate-950 text-slate-400 hover:text-white border border-slate-800'
                }`}
              >
                {cat.label}
              </button>
            ))}
          </div>

          {/* Search Input */}
          <div className="relative min-w-[260px] max-w-md">
            <Search className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by title, tech stack, or outcome..."
              className="w-full pl-9 pr-4 py-2 rounded-lg bg-slate-950 border border-slate-800 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 transition-colors"
            />
          </div>
        </div>
      </div>

      {/* Projects Grid */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-20">
        {filteredProjects.length === 0 ? (
          <div className="text-center py-16 px-4 border border-dashed border-slate-800 rounded-2xl bg-slate-900/20">
            <Layers className="w-10 h-10 text-slate-600 mx-auto mb-3" />
            <h3 className="text-base font-semibold text-white mb-1">No case studies found</h3>
            <p className="text-xs text-slate-400 max-w-sm mx-auto mb-4">
              Try adjusting your search criteria or select "All Deployments" to browse all projects.
            </p>
            <button
              onClick={() => {
                setActiveCategory('all');
                setSearchQuery('');
              }}
              className="px-4 py-2 rounded-lg bg-slate-800 text-slate-200 text-xs font-medium hover:bg-slate-700 transition-colors cursor-pointer"
            >
              Reset Filters
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {filteredProjects.map((project) => (
              <div
                key={project.id}
                className="group rounded-2xl bg-slate-900/40 border border-slate-800/80 hover:border-slate-700 overflow-hidden flex flex-col justify-between transition-all duration-300 hover:-translate-y-1 shadow-lg"
              >
                <div>
                  {/* Project Image */}
                  <div className="relative aspect-video w-full overflow-hidden bg-slate-950 border-b border-slate-800/60">
                    <img
                      src={project.imageUrl}
                      alt={project.title}
                      className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                      referrerPolicy="no-referrer"
                      onError={(e) => {
                        (e.target as HTMLImageElement).src =
                          'https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&w=800&q=80';
                      }}
                    />
                    <div className="absolute top-3 right-3 bg-blue-600/90 text-white text-[11px] font-semibold px-2.5 py-1 rounded shadow-sm">
                      {project.metric}
                    </div>
                  </div>

                  {/* Project Body */}
                  <div className="p-6">
                    <div className="text-[11px] font-semibold text-blue-400 uppercase tracking-wider mb-2">
                      {project.category}
                    </div>
                    <h3 className="text-lg font-bold text-white mb-2 group-hover:text-blue-400 transition-colors">
                      {project.title}
                    </h3>
                    <p className="text-xs text-slate-400 mb-4 line-clamp-2">
                      {project.subtitle}
                    </p>

                    {project.description && (
                      <p className="text-xs text-slate-300 mb-4 line-clamp-3 leading-relaxed">
                        {project.description}
                      </p>
                    )}

                    {/* Tags */}
                    {project.tags && project.tags.length > 0 && (
                      <div className="flex flex-wrap gap-1.5 mb-6">
                        {project.tags.map((tag, tIdx) => (
                          <span
                            key={tIdx}
                            className="text-[11px] text-slate-400 bg-slate-950 px-2 py-0.5 rounded border border-slate-800/70"
                          >
                            {tag}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                </div>

                {/* Footer Action */}
                <div className="p-6 pt-0 border-t border-slate-800/40 mt-auto">
                  <a
                    href={project.link}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-full py-2.5 px-4 rounded-lg bg-slate-800 hover:bg-blue-600 text-white text-xs font-semibold flex items-center justify-center gap-2 transition-colors cursor-pointer group-hover:shadow-md"
                  >
                    <span>Open Live Link</span>
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Engineering Standards */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-20">
        <div className="p-8 sm:p-12 rounded-2xl bg-slate-900/40 border border-slate-800">
          <div className="max-w-2xl mb-8">
            <p className="text-xs font-semibold text-blue-400 uppercase tracking-widest mb-2">
              Enterprise Quality Assurance
            </p>
            <h2 className="text-2xl font-bold text-white">Every Platform Engineered For Success</h2>
            <p className="text-slate-400 text-sm mt-2">
              We uphold strict architectural criteria across every web deployment we deliver.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="p-6 rounded-xl bg-slate-950/60 border border-slate-800/80">
              <Code2 className="w-6 h-6 text-blue-400 mb-3" />
              <h4 className="text-sm font-semibold text-white mb-2">Clean TypeScript Codebase</h4>
              <p className="text-xs text-slate-400 leading-relaxed">
                Zero arbitrary dependencies, strict typing, automated tests, and modular architecture.
              </p>
            </div>

            <div className="p-6 rounded-xl bg-slate-950/60 border border-slate-800/80">
              <TrendingUp className="w-6 h-6 text-emerald-400 mb-3" />
              <h4 className="text-sm font-semibold text-white mb-2">Sub-Second Global Edge</h4>
              <p className="text-xs text-slate-400 leading-relaxed">
                Deployed across Cloudflare Edge & Vercel networks for instant global TTFB.
              </p>
            </div>

            <div className="p-6 rounded-xl bg-slate-950/60 border border-slate-800/80">
              <ShieldCheck className="w-6 h-6 text-amber-400 mb-3" />
              <h4 className="text-sm font-semibold text-white mb-2">30-Day Post-Launch Warranty</h4>
              <p className="text-xs text-slate-400 leading-relaxed">
                Dedicated hypercare with bug remediation, performance monitoring, and DNS handoff.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom CTA */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="p-8 sm:p-12 rounded-2xl bg-gradient-to-br from-blue-950/40 via-slate-900 to-slate-950 border border-blue-900/40 text-center max-w-4xl mx-auto">
          <h2 className="text-2xl sm:text-3xl font-bold text-white mb-4 text-balance">
            Ready to Build Your Next Digital Flagship?
          </h2>
          <p className="text-slate-300 text-sm sm:text-base max-w-2xl mx-auto mb-8">
            Whether you need a high-converting e-commerce web store, a multi-tenant SaaS dashboard, or
            a bespoke corporate portal, we deliver with speed and technical excellence.
          </p>
          <div className="flex flex-wrap items-center justify-center gap-4">
            <button
              onClick={onContactClick}
              className="px-6 py-3 rounded-lg bg-blue-600 hover:bg-blue-500 text-white font-semibold text-sm transition-colors cursor-pointer"
            >
              Request Architecture Consultation
            </button>
            <button
              onClick={onBackToHome}
              className="px-6 py-3 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold text-sm transition-colors cursor-pointer"
            >
              Explore Homepage
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
