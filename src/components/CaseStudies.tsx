import React, { useEffect, useState } from 'react';
import { ExternalLink } from 'lucide-react';
import { Project } from '../types';
import { useLanguage } from '../context/LanguageContext';
import { sanitizeDisplayImageUrl } from '../utils/imageUpload';

const CaseStudyThumbnail: React.FC<{ imageUrl?: string; title: string }> = ({ imageUrl, title }) => {
  const safeSrc = sanitizeDisplayImageUrl(imageUrl);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    setFailed(false);
  }, [safeSrc]);

  if (!safeSrc || failed) {
    return <div className="portfolio-image-fallback">{title}</div>;
  }

  return <img src={safeSrc} alt={title} onError={() => setFailed(true)} />;
};

interface CaseStudiesProps {
  projects: Project[];
  onOpenWebsitesPage?: () => void;
}

export const CaseStudies: React.FC<CaseStudiesProps> = ({ projects, onOpenWebsitesPage }) => {
  const { strings } = useLanguage();
  const [activeFilter, setActiveFilter] = useState<'all' | 'ecommerce' | 'saas' | 'web'>('all');

  const filteredProjects = projects.filter((item) => {
    if (activeFilter === 'all') return true;
    return item.category === activeFilter;
  });

  return (
    <section id="websites" className="portfolio">
      <div className="container">
        <div className="section-header">
          <h2>{strings.caseStudies.sectionTitle}</h2>
          <p>{strings.caseStudies.sectionSubtitle}</p>
        </div>

        <div className="portfolio-filter">
          <button
            className={`filter-btn ${activeFilter === 'all' ? 'active' : ''}`}
            onClick={() => setActiveFilter('all')}
          >
            {strings.caseStudies.filterAll} ({projects.length})
          </button>
          <button
            className={`filter-btn ${activeFilter === 'ecommerce' ? 'active' : ''}`}
            onClick={() => setActiveFilter('ecommerce')}
          >
            {strings.caseStudies.filterEcommerce}
          </button>
          <button
            className={`filter-btn ${activeFilter === 'saas' ? 'active' : ''}`}
            onClick={() => setActiveFilter('saas')}
          >
            {strings.caseStudies.filterSaas}
          </button>
          <button
            className={`filter-btn ${activeFilter === 'web' ? 'active' : ''}`}
            onClick={() => setActiveFilter('web')}
          >
            {strings.caseStudies.filterMarketplaces}
          </button>
        </div>

        <div className="portfolio-grid">
          {filteredProjects.map((project) => (
            <div key={project.id} className="portfolio-item">
              <div className="portfolio-image">
                <CaseStudyThumbnail imageUrl={project.imageUrl} title={project.title} />
                <div className="portfolio-overlay">
                  <h3>{project.title}</h3>
                  <p>{project.subtitle}</p>
                  {project.metric && (
                    <div className="case-study-metric">{project.metric}</div>
                  )}
                  <a
                    href={project.link}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="portfolio-link"
                  >
                    {strings.caseStudies.viewLiveSite} <ExternalLink size={15} />
                  </a>
                </div>
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
              {strings.caseStudies.exploreAll}
            </button>
          </div>
        )}
      </div>
    </section>
  );
};
