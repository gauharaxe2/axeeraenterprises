import { useState } from 'react';
import type { Project } from '../types';
import { useLanguage } from '../context/LanguageContext';
import { EmptyState, Media, SiteNavigate, usePlainClick } from './chrome';

const FILTERS = [
  { id: 'all', label: '' },
  { id: 'ecommerce', label: '' },
  { id: 'saas', label: '' },
  { id: 'web', label: 'Web' }
] as const;

export function WorkIndex({ projects, navigate }: { projects: Project[]; navigate: SiteNavigate }) {
  const { strings } = useLanguage();
  const click = usePlainClick(navigate);
  const [filter, setFilter] = useState<(typeof FILTERS)[number]['id']>('all');
  const labels = strings.caseStudies;
  const visible = projects.filter((project) => filter === 'all' || project.category === filter);
  return (
    <section className="studio-section">
      <div className="studio-wrap">
        <p className="studio-kicker">{labels.sectionTitle}</p>
        <div className="studio-section-head">
          <h1>Case studies</h1>
          <p>{labels.sectionSubtitle}</p>
        </div>
        <div className="studio-filters">
          {FILTERS.map((item) => (
            <button key={item.id} type="button" className="studio-btn studio-btn-line" aria-pressed={filter === item.id} onClick={() => setFilter(item.id)}>
              {item.id === 'all' ? labels.filterAll : item.id === 'ecommerce' ? labels.filterEcommerce : item.id === 'saas' ? labels.filterSaas : item.label}
            </button>
          ))}
        </div>
        {projects.length === 0 ? (
          <EmptyState title="Case studies" body="No case studies are published yet." />
        ) : visible.length === 0 ? (
          <EmptyState title="Nothing in this filter" body="Published work is in the other categories." />
        ) : (
          <div className="studio-work">
            {visible.map((project) => (
              <a key={project.id} className="studio-case" href={`/case-studies/${project.id}`} onClick={(event) => click(event, `/case-studies/${project.id}`)}>
                <Media src={project.imageUrl} alt={project.title} />
                <div>
                  {project.metric && <span className="studio-metric">{project.metric}</span>}
                  <h2>{project.title}</h2>
                  <p>{project.subtitle}</p>
                  {project.description && <p>{project.description}</p>}
                </div>
              </a>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}

export function WorkDetail({ project, navigate }: { project: Project | null; navigate: SiteNavigate }) {
  const { strings } = useLanguage();
  const click = usePlainClick(navigate);
  if (!project) {
    return (
      <section className="studio-section">
        <div className="studio-wrap">
          <EmptyState title="Case study not published" body="That project is not on the public site." />
          <p><a href="/case-studies" onClick={(event) => click(event, '/case-studies')}>Back to case studies</a></p>
        </div>
      </section>
    );
  }
  return (
    <article className="studio-section">
      <div className="studio-wrap">
        <p className="studio-kicker"><a href="/case-studies" onClick={(event) => click(event, '/case-studies')}>Case studies</a></p>
        <h1>{project.title}</h1>
        <p className="studio-lede">{project.subtitle}</p>
        {project.metric && <p><span className="studio-metric">{project.metric}</span></p>}
        <Media src={project.imageUrl} alt={project.title} />
        {project.description && <p className="studio-prose" style={{ marginTop: '1.2rem' }}>{project.description}</p>}
        {project.tags && project.tags.length > 0 && (
          <div className="studio-tags">{project.tags.map((tag) => <span key={tag}>{tag}</span>)}</div>
        )}
        <div className="studio-actions">
          {project.link && (
            <a className="studio-btn studio-btn-ink" href={project.link} target="_blank" rel="noopener noreferrer">
              {strings.caseStudies.viewLiveSite}
            </a>
          )}
          <a className="studio-btn studio-btn-primary" href="/contact" onClick={(event) => click(event, '/contact')}>{strings.hero.startProject}</a>
        </div>
      </div>
    </article>
  );
}
