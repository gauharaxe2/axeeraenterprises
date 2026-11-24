import type { AgencyGeneralInfo, BlogPost, FaqItem, PartnerLogo, PartnershipItem, Project, ServiceItem, TeamMemberData, Testimonial } from '../types';
import { useLanguage } from '../context/LanguageContext';
import { visibleItems } from '../utils/catalog';
import { EmptyState, Media, SiteNavigate, usePlainClick } from './chrome';
import { ContactBand } from './pages';

interface HomeProps {
  info: AgencyGeneralInfo;
  services: ServiceItem[];
  projects: Project[];
  blogs: BlogPost[];
  team: TeamMemberData[];
  testimonials: Testimonial[];
  partnerships: PartnershipItem[];
  logos: PartnerLogo[];
  faqs: FaqItem[];
  navigate: SiteNavigate;
  onShowNotification: (message: string, type: 'success' | 'error' | 'info') => void;
}

export function HomePage(props: HomeProps) {
  const { strings } = useLanguage();
  const click = usePlainClick(props.navigate);
  const services = visibleItems(props.services);
  const projects = visibleItems(props.projects);
  const blogs = visibleItems(props.blogs);
  const team = visibleItems(props.team);
  const testimonials = visibleItems(props.testimonials);
  const faqs = visibleItems(props.faqs);
  const founder = team[0];
  const alliance = props.partnerships.find((item) => item.id === 'technology-alliances') || props.partnerships[0];
  const stats = [
    { value: props.info.stats.years, label: strings.about.yearsLabel },
    { value: props.info.stats.experts, label: strings.about.expertsLabel },
    { value: props.info.stats.projects, label: strings.about.projectsLabel },
    { value: `${props.info.stats.retention}%`, label: strings.about.retentionLabel }
  ];

  return (
    <>
      <section className="studio-hero" id="home">
        <div className="studio-wrap studio-hero-grid">
          <div>
            <p className="studio-kicker">{strings.brand.name} · Multan</p>
            <h1>{props.info.heroTitle}</h1>
            <p className="studio-lede">{props.info.heroSubtitle}</p>
            <div className="studio-actions">
              <a className="studio-btn studio-btn-primary" href="/contact" onClick={(event) => click(event, '/contact')}>
                {strings.hero.startProject}
              </a>
              <a className="studio-btn studio-btn-line" href="/case-studies" onClick={(event) => click(event, '/case-studies')}>
                {strings.hero.exploreCaseStudies}
              </a>
            </div>
          </div>
          {props.info.aboutImageUrl && (
            <figure className="studio-frame">
              <Media src={props.info.aboutImageUrl} alt={props.info.aboutTitle} />
              <figcaption>{props.info.aboutTitle}</figcaption>
            </figure>
          )}
        </div>
      </section>

      <div className="studio-wrap">
        <div className="studio-stats" aria-label="Studio figures">
          {stats.map((stat) => (
            <div className="studio-stat" key={stat.label}>
              <b>{stat.value}</b>
              <span>{stat.label}</span>
            </div>
          ))}
        </div>
      </div>

      <section className="studio-section" id="about">
        <div className="studio-wrap studio-split">
          <div>
            <p className="studio-kicker">{strings.about.sectionTitle}</p>
            <h2>{props.info.aboutTitle}</h2>
          </div>
          <div>
            <p>{props.info.aboutParagraph1}</p>
            <p>{props.info.aboutParagraph2}</p>
            <a className="studio-linkish" href="/about" onClick={(event) => click(event, '/about')}>{strings.nav.about}</a>
          </div>
        </div>
      </section>

      <section className="studio-section" id="services">
        <div className="studio-wrap">
          <div className="studio-section-head">
            <h2>{strings.services.sectionTitle}</h2>
            <p>{strings.services.sectionSubtitle}</p>
          </div>
          {services.length === 0 ? (
            <EmptyState title="Services" body="No services are published yet." />
          ) : (
            <div className="studio-grid">
              {services.slice(0, 6).map((service, index) => (
                <a key={service.id} className="studio-card" href={`/services/${service.id}`} onClick={(event) => click(event, `/services/${service.id}`)}>
                  <span className="studio-index">0{index + 1}</span>
                  <h3>{service.title}</h3>
                  <p>{service.shortDesc}</p>
                  <span className="studio-linkish">{strings.services.learnMore}</span>
                </a>
              ))}
            </div>
          )}
        </div>
      </section>

      <section className="studio-section" id="websites">
        <div className="studio-wrap">
          <div className="studio-section-head">
            <h2>{strings.caseStudies.sectionTitle}</h2>
            <a href="/case-studies" onClick={(event) => click(event, '/case-studies')}>{strings.caseStudies.exploreAll}</a>
          </div>
          {projects.length === 0 ? (
            <EmptyState title="Case studies" body="No case studies are published yet." />
          ) : (
            <div className="studio-work">
              {projects.slice(0, 3).map((project) => (
                <a key={project.id} className="studio-case" href={`/case-studies/${project.id}`} onClick={(event) => click(event, `/case-studies/${project.id}`)}>
                  <Media src={project.imageUrl} alt={project.title} />
                  <div>
                    {project.metric && <span className="studio-metric">{project.metric}</span>}
                    <h3>{project.title}</h3>
                    <p>{project.subtitle}</p>
                  </div>
                </a>
              ))}
            </div>
          )}
        </div>
      </section>

      <section className="studio-section" id="blogs">
        <div className="studio-wrap">
          <div className="studio-section-head">
            <h2>{strings.blogs.sectionTitle}</h2>
            <a href="/blog" onClick={(event) => click(event, '/blog')}>{strings.blogs.exploreAll}</a>
          </div>
          {blogs.length === 0 ? (
            <EmptyState title="Blog" body="No articles are published yet." />
          ) : (
            <div className="studio-grid">
              {blogs.slice(0, 3).map((post) => (
                <a key={post.id} className="studio-card" href={`/blog/${post.slug}`} onClick={(event) => click(event, `/blog/${post.slug}`)}>
                  <span className="studio-meta">{[post.category, post.date].filter(Boolean).join(' · ')}</span>
                  <h3>{post.title}</h3>
                  <p>{post.summary}</p>
                  <span className="studio-linkish">{strings.blogs.readArticle}</span>
                </a>
              ))}
            </div>
          )}
        </div>
      </section>

      {founder && (
        <section className="studio-section" id="team">
          <div className="studio-wrap studio-person">
            <Media src={founder.imageUrl} alt={founder.name} />
            <div>
              <p className="studio-kicker">{strings.team.sectionTitle}</p>
              <h2>{founder.name}</h2>
              <p>{founder.title}</p>
              <p>{founder.bio}</p>
              <a className="studio-linkish" href="/team" onClick={(event) => click(event, '/team')}>{strings.nav.team}</a>
            </div>
          </div>
        </section>
      )}

      <section className="studio-section" id="testimonials">
        <div className="studio-wrap">
          <div className="studio-section-head">
            <h2>{strings.testimonials.sectionTitle}</h2>
            <a href="/testimonials" onClick={(event) => click(event, '/testimonials')}>{strings.nav.testimonials}</a>
          </div>
          {testimonials.length === 0 ? (
            <EmptyState title="Testimonials" body="No testimonials are published yet." />
          ) : (
            <div className="studio-grid">
              {testimonials.slice(0, 3).map((item) => (
                <article key={item.id} className="studio-card">
                  <div className="studio-stars" aria-label={`${item.rating} of 5`}>{`${'★'.repeat(item.rating)}${'☆'.repeat(Math.max(0, 5 - item.rating))}`}</div>
                  <p className="studio-quote">{item.quote}</p>
                  <p><strong>{item.name}</strong><br />{item.role}</p>
                </article>
              ))}
            </div>
          )}
        </div>
      </section>

      {(alliance || props.logos.length > 0) && (
        <section className="studio-section" id="partnership">
          <div className="studio-wrap">
            <div className="studio-section-head">
              <div>
                <h2>{alliance?.title || strings.partnerships.sectionTitle}</h2>
                <p>{alliance?.description}</p>
              </div>
              <a href="/partnership" onClick={(event) => click(event, '/partnership')}>{strings.nav.partnership}</a>
            </div>
            {props.logos.length > 0 && (
              <div className="studio-logos">
                {props.logos.map((logo) => {
                  const inner = logo.logoUrl ? <img src={logo.logoUrl} alt={logo.name} /> : <span>{logo.name}</span>;
                  return logo.websiteUrl ? (
                    <a key={logo.id} href={logo.websiteUrl} target="_blank" rel="noopener noreferrer">{inner}</a>
                  ) : (
                    <span key={logo.id}>{inner}</span>
                  );
                })}
              </div>
            )}
            {props.info.partnershipNotice && <p style={{ marginTop: '1rem' }}>{props.info.partnershipNotice}</p>}
          </div>
        </section>
      )}

      <section className="studio-section" id="faq">
        <div className="studio-wrap">
          <div className="studio-section-head">
            <h2>{strings.faq.sectionTitle}</h2>
            <a href="/faq" onClick={(event) => click(event, '/faq')}>{strings.nav.faq}</a>
          </div>
          {faqs.length === 0 ? (
            <EmptyState title="FAQs" body="No questions are published yet." />
          ) : (
            <div className="studio-faq">
              {faqs.slice(0, 4).map((faq) => (
                <details key={faq.id || faq.question}>
                  <summary>{faq.question}</summary>
                  <p>{faq.answer}</p>
                </details>
              ))}
            </div>
          )}
        </div>
      </section>

      <ContactBand
        info={props.info}
        services={services.map((service) => ({ id: service.id, title: service.title }))}
        onShowNotification={props.onShowNotification}
      />
    </>
  );
}
