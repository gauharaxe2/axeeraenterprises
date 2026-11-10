import React, { useState } from 'react';
import { ExternalLink } from 'lucide-react';
import { Project } from '../types';

interface CaseStudiesProps {
  projects: Project[];
  onOpenWebsitesPage?: () => void;
}

export const CaseStudies: React.FC<CaseStudiesProps> = ({ projects, onOpenWebsitesPage }) => {
  const [activeFilter, setActiveFilter] = useState<'all' | 'ecommerce' | 'saas' | 'web'>('all');

  const filteredProjects = projects.filter((item) => {
    if (activeFilter === 'all') return true;
    return item.category === activeFilter;
  });

  return (
    <section id="websites" className="portfolio">
      <div className="container">
        <div className="section-header">
          <h2>Featured Case Studies</h2>
          <p>
            Explore our proven track record of delivering scalable digital products with measurable ROI.
          </p>
        </div>

        <div className="portfolio-filter">
          <button
            className={`filter-btn ${activeFilter === 'all' ? 'active' : ''}`}
            onClick={() => setActiveFilter('all')}
          >
            All Projects ({projects.length})
          </button>
          <button
            className={`filter-btn ${activeFilter === 'ecommerce' ? 'active' : ''}`}
            onClick={() => setActiveFilter('ecommerce')}
          >
            E-Commerce
          </button>
          <button
            className={`filter-btn ${activeFilter === 'saas' ? 'active' : ''}`}
            onClick={() => setActiveFilter('saas')}
          >
            SaaS & Analytics
          </button>
          <button
            className={`filter-btn ${activeFilter === 'web' ? 'active' : ''}`}
            onClick={() => setActiveFilter('web')}
          >
            Marketplaces
          </button>
        </div>

        <div className="portfolio-grid">
          {filteredProjects.map((project) => (
            <div key={project.id} className="portfolio-item">
              <div className="portfolio-image">
                <img src={project.imageUrl} alt={project.title} />
                <div className="portfolio-overlay">
                  <h3>{project.title}</h3>
                  <p>{project.subtitle}</p>
                  <div className="case-study-metric">{project.metric}</div>
                  <a
                    href={project.link}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="portfolio-link"
                  >
                    View Live Site <ExternalLink size={16} />
                  </a>
                </div>
              </div>
              <div style={{ padding: '1.25rem 1.5rem' }}>
                <h4 style={{ color: '#fff', marginBottom: '0.4rem', fontSize: '1.15rem' }}>
                  {project.title}
                </h4>
                <p style={{ color: 'var(--text-light)', fontSize: '0.9rem', marginBottom: '0.75rem' }}>
                  {project.description}
                </p>
                {project.tags && project.tags.length > 0 && (
                  <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                    {project.tags.map((tag) => (
                      <span
                        key={tag}
                        style={{
                          fontSize: '0.75rem',
                          padding: '3px 10px',
                          borderRadius: '12px',
                          background: 'rgba(212, 175, 55, 0.12)',
                          color: 'var(--primary-color)',
                          border: '1px solid rgba(212, 175, 55, 0.25)'
                        }}
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>

        {onOpenWebsitesPage && (
          <div style={{ textAlign: 'center', marginTop: '3rem' }}>
            <button
              type="button"
              onClick={onOpenWebsitesPage}
              className="btn btn-primary"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.5rem',
                fontSize: '0.95rem',
                padding: '0.75rem 1.75rem'
              }}
            >
              Explore Complete Case Studies & Live Deployments (Websites Page) →
            </button>
          </div>
        )}
      </div>
    </section>
  );
};
