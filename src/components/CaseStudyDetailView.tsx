import React, { useEffect, useState } from 'react';
import {
  ArrowLeft,
  ArrowRight,
  Award,
  Briefcase,
  Building2,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  Clock,
  Code2,
  ExternalLink,
  Layers,
  Maximize2,
  ShieldCheck,
  Sparkles,
  Target,
  TrendingUp,
  X
} from 'lucide-react';
import { Project } from '../types';
import {
  EditorialCta,
  EditorialImage,
  EditorialPage,
  EditorialSection,
  openInApp
} from './editorial/Editorial';
import {
  buildCaseStudyHash,
  getProjectStatusLabel,
  getProjectTypeLabel,
  resolveProjectDetails
} from '../utils/projectUtils';

interface CaseStudyDetailViewProps {
  project: Project;
  allProjects: Project[];
  onBackToWebsites: () => void;
  onSelectProject: (project: Project) => void;
  onContactClick: () => void;
}

export const CaseStudyDetailView: React.FC<CaseStudyDetailViewProps> = ({
  project,
  allProjects,
  onBackToWebsites,
  onSelectProject,
  onContactClick
}) => {
  const details = resolveProjectDetails(project);
  const [activeGalleryIdx, setActiveGalleryIdx] = useState(0);
  const [lightboxOpen, setLightboxOpen] = useState(false);

  useEffect(() => {
    setActiveGalleryIdx(0);
    setLightboxOpen(false);
  }, [project.id, project.slug]);

  const relatedProjects = allProjects
    .filter((item) => item.id !== project.id)
    .sort((a, b) => {
      const aSameType = resolveProjectDetails(a).projectType === details.projectType ? 0 : 1;
      const bSameType = resolveProjectDetails(b).projectType === details.projectType ? 0 : 1;
      if (aSameType !== bSameType) return aSameType - bSameType;
      const aSameCat = a.category === project.category ? 0 : 1;
      const bSameCat = b.category === project.category ? 0 : 1;
      return aSameCat - bSameCat;
    })
    .slice(0, 3);

  const hasSafeLiveLink = /^https?:\/\/.+/i.test((project.link || '').trim());
  const hasSafeDemoLink = /^https?:\/\/.+/i.test((project.demoUrl || '').trim());
  const activeGallerySrc = details.gallery[activeGalleryIdx] || details.gallery[0] || '';
  const typeLabel = getProjectTypeLabel(details.projectType);
  const statusLabel = getProjectStatusLabel(details.status);

  return (
    <EditorialPage page="case-study-detail">
      {/* Sticky Topbar */}
      <div className="editorial-topbar">
        <div className="editorial-topbar-inner">
          <a
            href="/websites"
            className="editorial-back"
            onClick={(event) => openInApp(event, onBackToWebsites)}
          >
            <ArrowLeft size={16} aria-hidden="true" /> Back to Websites & Showcase
          </a>
          <nav className="editorial-crumbs" aria-label="Breadcrumb">
            <span>Websites</span>
            <span aria-hidden="true">/</span>
            <span>{typeLabel}</span>
            <span aria-hidden="true">/</span>
            <span aria-current="page">{project.title}</span>
          </nav>
          <a
            href="/contact"
            className="btn btn-primary editorial-top-action"
            onClick={(event) => openInApp(event, onContactClick)}
          >
            Discuss Similar Build <ArrowRight size={16} aria-hidden="true" />
          </a>
        </div>
      </div>

      {/* Obsidian Black Editorial Hero */}
      <header className="editorial-hero" style={{ textAlign: 'left', padding: '3.25rem 0 3.5rem' }}>
        <div className="editorial-wrap">
          <div className="case-detail-hero-grid">
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', alignItems: 'flex-start' }}>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem', alignItems: 'center' }}>
                <span className="editorial-kicker">
                  {details.projectType === 'digital-product' ? (
                    <Sparkles size={14} aria-hidden="true" />
                  ) : (
                    <Briefcase size={14} aria-hidden="true" />
                  )}
                  {typeLabel}
                </span>
                <span
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '6px',
                    padding: '5px 12px',
                    borderRadius: '9999px',
                    background: 'rgba(255,255,255,0.08)',
                    border: '1px solid rgba(255,255,255,0.2)',
                    color: '#e5e5e5',
                    fontSize: '0.78rem',
                    fontWeight: 600,
                    textTransform: 'uppercase',
                    letterSpacing: '0.04em'
                  }}
                >
                  {project.category}
                </span>
                <span
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '6px',
                    padding: '5px 12px',
                    borderRadius: '9999px',
                    background:
                      details.status === 'live'
                        ? 'rgba(16, 185, 129, 0.16)'
                        : 'rgba(212, 175, 55, 0.16)',
                    border:
                      details.status === 'live'
                        ? '1px solid rgba(16, 185, 129, 0.45)'
                        : '1px solid rgba(212, 175, 55, 0.45)',
                    color: details.status === 'live' ? '#6ee7b7' : '#f5d061',
                    fontSize: '0.78rem',
                    fontWeight: 700
                  }}
                >
                  {statusLabel}
                </span>
                {project.featured && (
                  <span
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '5px',
                      padding: '5px 12px',
                      borderRadius: '9999px',
                      background: 'linear-gradient(135deg, #d4af37, #b8860b)',
                      color: '#0a0a0a',
                      fontSize: '0.78rem',
                      fontWeight: 800
                    }}
                  >
                    <Award size={13} aria-hidden="true" /> Featured Flagship
                  </span>
                )}
              </div>

              <h1 style={{ margin: 0 }}>{project.title}</h1>
              <p className="editorial-lead" style={{ margin: 0 }}>
                {project.subtitle}
              </p>

              <ul className="editorial-facts" style={{ justifyContent: 'flex-start', marginTop: '0.25rem' }}>
                <li>
                  <Building2 size={15} aria-hidden="true" color="#d4af37" /> {details.clientName}
                </li>
                <li>
                  <Layers size={15} aria-hidden="true" color="#d4af37" /> {details.industry}
                </li>
                <li>
                  <Clock size={15} aria-hidden="true" color="#d4af37" /> {details.timeline}
                </li>
              </ul>

              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.75rem', marginTop: '0.5rem' }}>
                {hasSafeLiveLink && (
                  <a
                    href={project.link}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="btn btn-primary"
                  >
                    Launch Live Website <ExternalLink size={16} aria-hidden="true" />
                  </a>
                )}
                {hasSafeDemoLink && (
                  <a
                    href={project.demoUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="btn btn-outline"
                    style={{ color: '#f5d061', borderColor: 'rgba(212, 175, 55, 0.55)' }}
                  >
                    Interactive Demo / Docs <ExternalLink size={15} aria-hidden="true" />
                  </a>
                )}
                <button
                  type="button"
                  onClick={onContactClick}
                  className="btn btn-outline"
                  style={{ color: '#ffffff', borderColor: 'rgba(255,255,255,0.35)' }}
                >
                  Request Similar Architecture
                </button>
              </div>
            </div>

            <div className="case-detail-hero-media">
              <div className="case-detail-cover-frame">
                <EditorialImage src={activeGallerySrc || project.imageUrl} alt={project.title} loading="eager" />
                {details.gallery.length > 0 && (
                  <button
                    type="button"
                    className="case-detail-zoom-btn"
                    onClick={() => setLightboxOpen(true)}
                    aria-label={`Inspect ${project.title} preview full screen`}
                  >
                    <Maximize2 size={15} aria-hidden="true" /> Preview
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* Measured ROI Outcomes Strip */}
          <div className="editorial-metrics" style={{ marginTop: '2.25rem' }}>
            {details.outcomes.map((outcome, idx) => (
              <div key={`${outcome.label}-${idx}`} className="editorial-metric">
                <strong>{outcome.value}</strong>
                <span>{outcome.label}</span>
                <small>{idx === 0 ? 'Headline impact metric' : 'Verified production benchmark'}</small>
              </div>
            ))}
            <div className="editorial-metric">
              <strong style={{ fontSize: '1.15rem', lineHeight: 1.35, paddingTop: '0.2rem' }}>
                {details.pricingModel}
              </strong>
              <span>Engagement & Licensing</span>
              <small>{details.role}</small>
            </div>
          </div>
        </div>
      </header>

      {/* Introduction & Product Overview */}
      <EditorialSection
        id="case-overview"
        eyebrow={details.projectType === 'digital-product' ? 'Product Introduction' : 'Engagement Overview'}
        title={`Introducing ${project.title}`}
        narrow
      >
        <div className="editorial-panel padded">
          <div className="editorial-copy" style={{ maxWidth: '100%' }}>
            <p style={{ fontSize: '1.08rem', color: 'var(--text-strong)', fontWeight: 500 }}>{details.overview}</p>
            {project.description && project.description.trim() !== details.overview.trim() && (
              <p>{project.description}</p>
            )}
          </div>
          {details.tags.length > 0 && (
            <div className="editorial-tags" style={{ marginTop: '1.25rem' }}>
              {details.tags.map((tag) => (
                <span key={tag} className="editorial-tag">
                  {tag}
                </span>
              ))}
            </div>
          )}
        </div>
      </EditorialSection>

      {/* Challenge vs Solution Breakdown */}
      <EditorialSection
        id="case-challenge-solution"
        eyebrow="Engineering Breakdown"
        title="The Challenge & Our Engineered Solution"
        description="How Axe's Era Enterprises translated business bottlenecks into resilient production software."
      >
        <div className="case-detail-split-grid">
          <article className="editorial-card accent">
            <div className="editorial-card-body">
              <span className="editorial-icon">
                <Target size={22} aria-hidden="true" />
              </span>
              <h3>The Business & Technical Challenge</h3>
              <p className="editorial-muted" style={{ fontSize: '1rem', lineHeight: 1.7 }}>
                {details.challenge}
              </p>
            </div>
          </article>

          <article className="editorial-card accent">
            <div className="editorial-card-body">
              <span className="editorial-icon">
                <TrendingUp size={22} aria-hidden="true" />
              </span>
              <h3>Our Solution & Execution</h3>
              <p className="editorial-muted" style={{ fontSize: '1rem', lineHeight: 1.7 }}>
                {details.solution}
              </p>
            </div>
          </article>
        </div>
      </EditorialSection>

      {/* Key Features, Deliverables & Architecture */}
      <EditorialSection
        id="case-capabilities"
        eyebrow="Architecture & Capabilities"
        title="Core Features, Deliverables & Technical Stack"
      >
        <div className="case-detail-three-grid">
          <article className="editorial-card">
            <div className="editorial-card-body">
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <span className="editorial-icon">
                  <Sparkles size={20} aria-hidden="true" />
                </span>
                <h3 style={{ margin: 0 }}>Key Features</h3>
              </div>
              <ul className="editorial-list" style={{ marginTop: '0.5rem' }}>
                {details.keyFeatures.map((feature, idx) => (
                  <li key={idx}>
                    <CheckCircle2 size={16} aria-hidden="true" />
                    <span>{feature}</span>
                  </li>
                ))}
              </ul>
            </div>
          </article>

          <article className="editorial-card">
            <div className="editorial-card-body">
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <span className="editorial-icon">
                  <ShieldCheck size={20} aria-hidden="true" />
                </span>
                <h3 style={{ margin: 0 }}>Project Deliverables</h3>
              </div>
              <ul className="editorial-list" style={{ marginTop: '0.5rem' }}>
                {details.deliverables.map((item, idx) => (
                  <li key={idx}>
                    <CheckCircle2 size={16} aria-hidden="true" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          </article>

          <article className="editorial-card">
            <div className="editorial-card-body">
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <span className="editorial-icon">
                  <Code2 size={20} aria-hidden="true" />
                </span>
                <h3 style={{ margin: 0 }}>Architecture Highlights</h3>
              </div>
              <ul className="editorial-list" style={{ marginTop: '0.5rem' }}>
                {details.architectureHighlights.map((highlight, idx) => (
                  <li key={idx}>
                    <CheckCircle2 size={16} aria-hidden="true" />
                    <span>{highlight}</span>
                  </li>
                ))}
              </ul>
            </div>
          </article>
        </div>
      </EditorialSection>

      {/* Multi-Screenshot Gallery (when multiple images exist) */}
      {details.gallery.length > 1 && (
        <EditorialSection
          id="case-gallery"
          eyebrow="Visual Walkthrough"
          title="Interface & Screen Showcase"
          description="Click any screen preview below to inspect full resolution."
        >
          <div className="editorial-grid" style={{ ['--card-min' as string]: '260px' }}>
            {details.gallery.map((imgUrl, idx) => (
              <article
                key={`${imgUrl}-${idx}`}
                className="editorial-card"
                style={{
                  borderColor: idx === activeGalleryIdx ? 'var(--primary-color)' : undefined
                }}
              >
                <button
                  type="button"
                  onClick={() => {
                    setActiveGalleryIdx(idx);
                    setLightboxOpen(true);
                  }}
                  style={{
                    background: 'none',
                    border: 'none',
                    padding: 0,
                    cursor: 'pointer',
                    textAlign: 'left',
                    width: '100%'
                  }}
                  aria-label={`Open screen ${idx + 1} of ${project.title}`}
                >
                  <div className="editorial-media" style={{ height: '210px' }}>
                    <EditorialImage src={imgUrl} alt={`${project.title} screen ${idx + 1}`} />
                    <span className="editorial-badge">Screen {idx + 1}</span>
                  </div>
                </button>
              </article>
            ))}
          </div>
        </EditorialSection>
      )}

      {/* Related Case Studies & Digital Products */}
      {relatedProjects.length > 0 && (
        <EditorialSection
          id="related-projects"
          eyebrow="Continue Exploring"
          title="More Websites, Case Studies & Digital Products"
        >
          <div className="editorial-grid" style={{ ['--card-min' as string]: '280px' }}>
            {relatedProjects.map((rel) => {
              const relDetails = resolveProjectDetails(rel);
              return (
                <article key={rel.id} className="editorial-card">
                  <div className="editorial-media">
                    <EditorialImage src={rel.imageUrl} alt={rel.title} />
                    <span className="editorial-badge">{getProjectTypeLabel(relDetails.projectType)}</span>
                    <span className="editorial-badge right">{rel.metric}</span>
                  </div>
                  <div className="editorial-card-body">
                    <h3>
                      <a
                        href={buildCaseStudyHash(rel)}
                        onClick={(event) => openInApp(event, () => onSelectProject(rel))}
                      >
                        {rel.title}
                      </a>
                    </h3>
                    <p className="editorial-muted">{rel.subtitle}</p>
                    <a
                      href={buildCaseStudyHash(rel)}
                      className="editorial-link"
                      onClick={(event) => openInApp(event, () => onSelectProject(rel))}
                    >
                      Explore {getProjectTypeLabel(relDetails.projectType)} <ArrowRight size={15} aria-hidden="true" />
                    </a>
                  </div>
                </article>
              );
            })}
          </div>
        </EditorialSection>
      )}

      {/* Bottom CTA */}
      <EditorialCta
        title={`Want Results Like ${project.title} For Your Business?`}
        description="Schedule an engineering architecture session with Gauhar Nadeem (Gauhar Axe) to scope your custom website, e-commerce store, or digital SaaS product."
      >
        <a
          href="/contact"
          className="btn btn-primary"
          onClick={(event) => openInApp(event, onContactClick)}
        >
          Start Your Project
        </a>
        <a
          href="/websites"
          className="btn btn-outline"
          onClick={(event) => openInApp(event, onBackToWebsites)}
        >
          View All Case Studies & Products
        </a>
      </EditorialCta>

      {/* Interactive Lightbox */}
      {lightboxOpen && details.gallery.length > 0 && (
        <div
          className="case-lightbox-backdrop"
          role="dialog"
          aria-modal="true"
          aria-label={`${project.title} full screen preview`}
          onClick={() => setLightboxOpen(false)}
        >
          <div className="case-lightbox-content" onClick={(e) => e.stopPropagation()}>
            <button
              type="button"
              className="case-lightbox-close"
              onClick={() => setLightboxOpen(false)}
              aria-label="Close image preview"
            >
              <X size={20} />
            </button>
            <img src={activeGallerySrc} alt={`${project.title} preview ${activeGalleryIdx + 1}`} />
            {details.gallery.length > 1 && (
              <div className="case-lightbox-nav">
                <button
                  type="button"
                  onClick={() =>
                    setActiveGalleryIdx((prev) => (prev - 1 + details.gallery.length) % details.gallery.length)
                  }
                  aria-label="Previous image"
                >
                  <ChevronLeft size={18} /> Previous
                </button>
                <span>
                  {activeGalleryIdx + 1} / {details.gallery.length}
                </span>
                <button
                  type="button"
                  onClick={() => setActiveGalleryIdx((prev) => (prev + 1) % details.gallery.length)}
                  aria-label="Next image"
                >
                  Next <ChevronRight size={18} />
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </EditorialPage>
  );
};
