import React, { useMemo, useState } from 'react';
import { ArrowRight, Code2, ExternalLink, Globe2, ShieldCheck, TrendingUp } from 'lucide-react';
import { Project } from '../types';
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

interface WebsitesPageProps {
  projects: Project[];
  onBackToHome: () => void;
  onContactClick: () => void;
}

const categories = [
  { id: 'all', label: 'All Deployments' },
  { id: 'ecommerce', label: 'E-Commerce Stores' },
  { id: 'saas', label: 'SaaS & Enterprise Systems' },
  { id: 'web', label: 'Web Platforms & Marketplaces' }
];

export const WebsitesPage: React.FC<WebsitesPageProps> = ({ projects, onBackToHome, onContactClick }) => {
  const [activeCategory, setActiveCategory] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');

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
      const matchesCategory = activeCategory === 'all' || project.category === activeCategory;
      const matchesSearch =
        !query ||
        project.title.toLowerCase().includes(query) ||
        project.subtitle.toLowerCase().includes(query) ||
        (project.description && project.description.toLowerCase().includes(query)) ||
        (project.tags && project.tags.some((tag) => tag.toLowerCase().includes(query)));
      return matchesCategory && matchesSearch;
    });
  }, [projects, activeCategory, searchQuery]);

  return (
    <EditorialPage page="websites">
      <EditorialTopbar
        crumb="Websites & Case Studies"
        onBack={onBackToHome}
        action={
          <a href="/contact" className="btn btn-primary editorial-top-action" onClick={(event) => openInApp(event, onContactClick)}>
            Discuss a Project <ArrowRight size={16} aria-hidden="true" />
          </a>
        }
      />

      <EditorialHero
        eyebrow="Proven Enterprise Deployments"
        title="Production Websites, High-Growth SaaS & E-Commerce Platforms"
        description="Explore our curated portfolio of live digital platforms. Each project is custom-engineered for measurable conversion velocity, resilient cloud scalability, and exceptional user experience."
      />

      <div className="editorial-toolbar">
        <div className="editorial-wrap editorial-toolbar-stack">
          <EditorialPills
            label="Project categories"
            value={activeCategory}
            onChange={setActiveCategory}
            options={categories.map((category) => ({ ...category, count: counts[category.id] || 0 }))}
          />
          <EditorialSearch
            id="websites-search"
            label="Search websites"
            value={searchQuery}
            onChange={setSearchQuery}
            placeholder="Search by title, tech stack, or outcome..."
          />
        </div>
      </div>

      <EditorialSection id="websites-grid">
        <p className="editorial-countline" aria-live="polite">
          <span>
            Showing <strong>{filteredProjects.length}</strong> {filteredProjects.length === 1 ? 'deployment' : 'deployments'}
          </span>
          <span className="editorial-chip">
            <Globe2 size={14} aria-hidden="true" /> Live project records
          </span>
        </p>

        {filteredProjects.length === 0 ? (
          <EditorialEmpty
            title="No case studies found"
            description='Try adjusting your search criteria or select "All Deployments" to browse all projects.'
            action={
              <button
                type="button"
                className="btn btn-outline"
                onClick={() => {
                  setActiveCategory('all');
                  setSearchQuery('');
                }}
              >
                Reset Filters
              </button>
            }
          />
        ) : (
          <div className="editorial-grid" style={{ ['--card-min' as string]: '300px' }}>
            {filteredProjects.map((project) => (
              <article key={project.id} className="editorial-card">
                <div className="editorial-media">
                  <EditorialImage src={project.imageUrl} alt={project.title} />
                  <span className="editorial-badge">{project.category}</span>
                  <span className="editorial-badge right">{project.metric}</span>
                </div>
                <div className="editorial-card-body">
                  <h3>
                    <a href={project.link} target="_blank" rel="noopener noreferrer">
                      {project.title}
                    </a>
                  </h3>
                  <p className="editorial-muted">{project.subtitle}</p>
                  {project.description ? <p className="editorial-muted">{project.description}</p> : null}
                  {project.tags && project.tags.length > 0 ? (
                    <div className="editorial-tags">
                      {project.tags.map((tag) => (
                        <span key={tag} className="editorial-tag">
                          {tag}
                        </span>
                      ))}
                    </div>
                  ) : null}
                  <a className="editorial-link" href={project.link} target="_blank" rel="noopener noreferrer">
                    Open Live Link <ExternalLink size={15} aria-hidden="true" />
                  </a>
                </div>
              </article>
            ))}
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
