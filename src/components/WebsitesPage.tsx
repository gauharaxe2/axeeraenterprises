import React, { useMemo, useState } from 'react';
import {
  ArrowRight,
  Award,
  Briefcase,
  Code2,
  ExternalLink,
  Globe2,
  Layers,
  ShieldCheck,
  Sparkles,
  TrendingUp
} from 'lucide-react';
import { Project, ProjectType } from '../types';
import {
  EditorialCta,
  EditorialEmpty,
  EditorialHero,
  EditorialImage,
  EditorialPage,
  EditorialPills,
  EditorialSearch,
  EditorialSection,
  EditorialTopbar,
  openInApp
} from './editorial/Editorial';
import {
  buildCaseStudyHash,
  getProjectStatusLabel,
  getProjectTypeLabel,
  resolveProjectDetails,
  resolveProjectType
} from '../utils/projectUtils';

interface WebsitesPageProps {
  projects: Project[];
  onBackToHome: () => void;
  onSelectProject: (project: Project) => void;
  onContactClick: () => void;
}

const categories = [
  { id: 'all', label: 'All Deployments' },
  { id: 'ecommerce', label: 'E-Commerce Stores' },
  { id: 'saas', label: 'SaaS & Enterprise Systems' },
  { id: 'web', label: 'Web Platforms & Marketplaces' }
];

const typeOptions: Array<{ id: 'all' | ProjectType; label: string }> = [
  { id: 'all', label: 'All Showcase' },
  { id: 'case-study', label: 'Client Case Studies' },
  { id: 'digital-product', label: 'Digital Products' }
];

export const WebsitesPage: React.FC<WebsitesPageProps> = ({
  projects,
  onBackToHome,
  onSelectProject,
  onContactClick
}) => {
  const [activeCategory, setActiveCategory] = useState('all');
  const [activeType, setActiveType] = useState<'all' | ProjectType>('all');
  const [searchQuery, setSearchQuery] = useState('');

  const typeCounts = useMemo(() => {
    const caseStudyCount = projects.filter((p) => resolveProjectType(p) === 'case-study').length;
    const productCount = projects.filter((p) => resolveProjectType(p) === 'digital-product').length;
    return {
      all: projects.length,
      'case-study': caseStudyCount,
      'digital-product': productCount
    };
  }, [projects]);

  const counts = useMemo(() => {
    const next: Record<string, number> = { all: projects.length };
    categories.forEach((category) => {
      if (category.id === 'all') return;
      next[category.id] = projects.filter((project) => project.category === category.id).length;
    });
    return next;
  }, [projects]);

  const filteredProjects = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();
    return projects.filter((project) => {
      const resolvedType = resolveProjectType(project);
      const matchesType = activeType === 'all' || resolvedType === activeType;
      const matchesCategory = activeCategory === 'all' || project.category === activeCategory;
      const matchesSearch =
        !query ||
        project.title.toLowerCase().includes(query) ||
        project.subtitle.toLowerCase().includes(query) ||
        (project.clientName && project.clientName.toLowerCase().includes(query)) ||
        (project.industry && project.industry.toLowerCase().includes(query)) ||
        (project.description && project.description.toLowerCase().includes(query)) ||
        (project.tags && project.tags.some((tag) => tag.toLowerCase().includes(query)));
      return matchesType && matchesCategory && matchesSearch;
    });
  }, [projects, activeCategory, activeType, searchQuery]);

  return (
    <EditorialPage page="websites">
      <EditorialTopbar
        crumb="Websites, Case Studies & Digital Products"
        onBack={onBackToHome}
        action={
          <a href="/contact" className="btn btn-primary editorial-top-action" onClick={(event) => openInApp(event, onContactClick)}>
            Discuss a Project <ArrowRight size={16} aria-hidden="true" />
          </a>
        }
      />

      <EditorialHero
        eyebrow="Proven Enterprise Deployments & Digital Products"
        title="Websites, Client Case Studies & Proprietary Digital Products"
        description="Explore both our bespoke client engagements and our flagship SaaS digital products. Select any deployment below to open its full case study—covering the business challenge, engineered architecture, key features, and measured ROI."
      >
        <div className="editorial-metrics">
          <div className="editorial-metric">
            <strong>{typeCounts.all}</strong>
            <span>Live Showcase Builds</span>
            <small>Production websites & software suites</small>
          </div>
          <div className="editorial-metric">
            <strong>{typeCounts['case-study']}</strong>
            <span>Client Case Studies</span>
            <small>Custom architecture & CRO builds</small>
          </div>
          <div className="editorial-metric">
            <strong>{typeCounts['digital-product']}</strong>
            <span>Digital Products</span>
            <small>SaaS, CRM & marketplace platforms</small>
          </div>
          <div className="editorial-metric">
            <strong>95+</strong>
            <span>Lighthouse Benchmark</span>
            <small>Sub-second global CDN velocity</small>
          </div>
        </div>
      </EditorialHero>

      {/* Introducing Case Studies vs Digital Products */}
      <EditorialSection
        id="showcase-tracks"
        eyebrow="How We Build"
        title="Two Specialized Engagement Tracks"
        description="Click any track below to filter the portfolio or inspect dedicated deep-dive breakdowns."
      >
        <div className="case-detail-split-grid">
          <article className="editorial-card accent">
            <div className="editorial-card-body">
              <span className="editorial-icon">
                <Briefcase size={22} aria-hidden="true" />
              </span>
              <h3>Client Case Studies</h3>
              <p className="editorial-muted">
                Bespoke commerce storefronts, Shopify Liquid implementations, and high-converting web systems engineered for measurable client revenue lift. Each case study explains the bottleneck, solution architecture, and deliverables.
              </p>
              <button
                type="button"
                className="editorial-link"
                style={{ background: 'none', border: 'none', padding: 0, cursor: 'pointer' }}
                onClick={() => {
                  setActiveType('case-study');
                  document.getElementById('websites-grid')?.scrollIntoView({ behavior: 'smooth' });
                }}
              >
                Filter Client Case Studies ({typeCounts['case-study']}) <ArrowRight size={15} aria-hidden="true" />
              </button>
            </div>
          </article>

          <article className="editorial-card accent">
            <div className="editorial-card-body">
              <span className="editorial-icon">
                <Sparkles size={22} aria-hidden="true" />
              </span>
              <h3>Proprietary Digital Products</h3>
              <p className="editorial-muted">
                Scalable SaaS dashboards, vertical CRM operating systems, and multi-vendor software marketplaces incubated by Axe's Era Enterprises—ready for white-label licensing or custom enterprise onboarding.
              </p>
              <button
                type="button"
                className="editorial-link"
                style={{ background: 'none', border: 'none', padding: 0, cursor: 'pointer' }}
                onClick={() => {
                  setActiveType('digital-product');
                  document.getElementById('websites-grid')?.scrollIntoView({ behavior: 'smooth' });
                }}
              >
                Filter Digital Products ({typeCounts['digital-product']}) <ArrowRight size={15} aria-hidden="true" />
              </button>
            </div>
          </article>
        </div>
      </EditorialSection>

      <div className="editorial-toolbar">
        <div className="editorial-wrap editorial-toolbar-stack">
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.65rem', justifyContent: 'space-between', width: '100%' }}>
            <EditorialPills
              label="Showcase track"
              value={activeType}
              onChange={(val) => setActiveType(val as 'all' | ProjectType)}
              options={typeOptions.map((opt) => ({ ...opt, count: typeCounts[opt.id] || 0 }))}
            />
            <EditorialPills
              label="Project categories"
              value={activeCategory}
              onChange={setActiveCategory}
              options={categories.map((category) => ({ ...category, count: counts[category.id] || 0 }))}
            />
          </div>
          <EditorialSearch
            id="websites-search"
            label="Search websites"
            value={searchQuery}
            onChange={setSearchQuery}
            placeholder="Search by title, industry, client, tech stack, or outcome..."
          />
        </div>
      </div>

      <EditorialSection id="websites-grid">
        <p className="editorial-countline" aria-live="polite">
          <span>
            Showing <strong>{filteredProjects.length}</strong> {filteredProjects.length === 1 ? 'deployment' : 'deployments'}
          </span>
          <span className="editorial-chip">
            <Globe2 size={14} aria-hidden="true" /> Click any title for full Case Study & Product Specs
          </span>
        </p>

        {filteredProjects.length === 0 ? (
          <EditorialEmpty
            title="No case studies or digital products found"
            description='Try adjusting your search criteria or reset filters to browse all deployments.'
            action={
              <button
                type="button"
                className="btn btn-outline"
                onClick={() => {
                  setActiveCategory('all');
                  setActiveType('all');
                  setSearchQuery('');
                }}
              >
                Reset Filters
              </button>
            }
          />
        ) : (
          <div className="editorial-grid" style={{ ['--card-min' as string]: '300px' }}>
            {filteredProjects.map((project) => {
              const details = resolveProjectDetails(project);
              const detailHref = buildCaseStudyHash(project);
              const hasLiveUrl = /^https?:\/\/.+/i.test((project.link || '').trim());
              return (
                <article key={project.id} className="editorial-card">
                  <div className="editorial-media">
                    <EditorialImage src={project.imageUrl} alt={project.title} />
                    <span className="editorial-badge">{getProjectTypeLabel(details.projectType)}</span>
                    <span className="editorial-badge right">{project.metric}</span>
                  </div>
                  <div className="editorial-card-body">
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.45rem', alignItems: 'center', fontSize: '0.76rem', fontWeight: 700 }}>
                      <span style={{ color: 'var(--gold-ink)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                        {project.category}
                      </span>
                      <span aria-hidden="true" style={{ color: '#a8a29e' }}>•</span>
                      <span style={{ color: '#44403c' }}>{getProjectStatusLabel(details.status)}</span>
                      {project.featured && (
                        <>
                          <span aria-hidden="true" style={{ color: '#a8a29e' }}>•</span>
                          <span style={{ color: 'var(--gold-ink)', display: 'inline-flex', alignItems: 'center', gap: '3px' }}>
                            <Award size={12} aria-hidden="true" /> Featured
                          </span>
                        </>
                      )}
                    </div>
                    <h3>
                      <a
                        href={detailHref}
                        onClick={(event) => openInApp(event, () => onSelectProject(project))}
                      >
                        {project.title}
                      </a>
                    </h3>
                    <p className="editorial-muted" style={{ fontWeight: 600, color: '#1c1917' }}>
                      {project.subtitle}
                    </p>
                    <p className="editorial-muted" style={{ fontSize: '0.84rem' }}>
                      <Layers size={13} aria-hidden="true" style={{ verticalAlign: '-2px', marginRight: '5px', color: 'var(--gold-ink)' }} />
                      {details.industry}
                    </p>
                    {project.description ? <p className="editorial-muted">{project.description}</p> : null}
                    {details.tags.length > 0 ? (
                      <div className="editorial-tags">
                        {details.tags.map((tag) => (
                          <span key={tag} className="editorial-tag">
                            {tag}
                          </span>
                        ))}
                      </div>
                    ) : null}
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.85rem', alignItems: 'center', marginTop: 'auto', paddingTop: '0.35rem' }}>
                      <a
                        className="editorial-link"
                        href={detailHref}
                        onClick={(event) => openInApp(event, () => onSelectProject(project))}
                      >
                        {details.projectType === 'digital-product' ? 'Explore Product' : 'Read Case Study'}{' '}
                        <ArrowRight size={15} aria-hidden="true" />
                      </a>
                      {hasLiveUrl && (
                        <a
                          className="editorial-link"
                          href={project.link}
                          target="_blank"
                          rel="noopener noreferrer"
                          style={{ color: '#44403c' }}
                        >
                          Live Site <ExternalLink size={14} aria-hidden="true" />
                        </a>
                      )}
                    </div>
                  </div>
                </article>
              );
            })}
          </div>
        )}
      </EditorialSection>

      <EditorialSection
        id="website-standards"
        eyebrow="Enterprise Quality Assurance"
        title="Every Platform Engineered For Success"
        description="We uphold strict architectural criteria across every web deployment we deliver."
      >
        <div className="editorial-grid">
          <article className="editorial-card accent">
            <div className="editorial-card-body">
              <Code2 size={22} aria-hidden="true" color="var(--primary-color)" />
              <h3>Clean TypeScript Codebase</h3>
              <p className="editorial-muted">
                Zero arbitrary dependencies, strict typing, automated tests, and modular architecture.
              </p>
            </div>
          </article>
          <article className="editorial-card accent">
            <div className="editorial-card-body">
              <TrendingUp size={22} aria-hidden="true" color="#34d399" />
              <h3>Sub-Second Global Edge</h3>
              <p className="editorial-muted">
                Deployed across Cloudflare Edge & Vercel networks for instant global TTFB.
              </p>
            </div>
          </article>
          <article className="editorial-card accent">
            <div className="editorial-card-body">
              <ShieldCheck size={22} aria-hidden="true" color="var(--primary-color)" />
              <h3>30-Day Post-Launch Warranty</h3>
              <p className="editorial-muted">
                Dedicated hypercare with bug remediation, performance monitoring, and DNS handoff.
              </p>
            </div>
          </article>
        </div>
      </EditorialSection>

      <EditorialCta
        title="Ready to Build Your Next Digital Flagship?"
        description="Whether you need a high-converting e-commerce web store, a multi-tenant SaaS dashboard, or a bespoke corporate portal, we deliver with speed and technical excellence."
      >
        <a href="/contact" className="btn btn-primary" onClick={(event) => openInApp(event, onContactClick)}>
          Request Architecture Consultation
        </a>
        <a href="/" className="btn btn-outline" onClick={(event) => openInApp(event, onBackToHome)}>
          Explore Homepage
        </a>
      </EditorialCta>
    </EditorialPage>
  );
};
