import { useEffect } from 'react';
import type {
  AgencyGeneralInfo,
  BlogPost,
  FaqItem,
  PartnerLogo,
  PartnershipItem,
  PolicyType,
  Project,
  ServiceItem,
  TeamMemberData,
  Testimonial,
  PageView
} from '../types';
import { visibleItems } from '../utils/catalog';
import { SiteFooter, SiteHeader, SiteNavigate, WhatsAppFloat } from './chrome';
import { HomePage } from './home';
import { ServiceDetail, ServicesIndex } from './services';
import { WorkDetail, WorkIndex } from './work';
import { JournalIndex, JournalPost } from './journal';
import {
  AboutPage,
  FaqPage,
  LocationPage,
  NotFoundPage,
  PartnershipPage,
  PoliciesPage,
  TeamPage,
  TestimonialsPage
} from './pages';
import { ContactPage } from '../components/ContactPage';

export interface PublicSiteProps {
  page: PageView;
  info: AgencyGeneralInfo;
  services: ServiceItem[];
  projects: Project[];
  blogs: BlogPost[];
  team: TeamMemberData[];
  testimonials: Testimonial[];
  partnerships: PartnershipItem[];
  logos: PartnerLogo[];
  faqs: FaqItem[];
  service: ServiceItem | null;
  project: Project | null;
  post: BlogPost | null;
  policy: PolicyType;
  navigate: SiteNavigate;
  onPolicy: (policy: PolicyType) => void;
  onShowNotification: (message: string, type: 'success' | 'error' | 'info') => void;
  section?: string | null;
}

export function PublicSite(props: PublicSiteProps) {
  const services = visibleItems(props.services);
  const projects = visibleItems(props.projects);
  const blogs = visibleItems(props.blogs);
  const team = visibleItems(props.team);
  const testimonials = visibleItems(props.testimonials);
  const faqs = visibleItems(props.faqs);

  useEffect(() => {
    if (props.page !== 'home' || !props.section) return;
    const timer = window.setTimeout(() => {
      document.getElementById(props.section || '')?.scrollIntoView({ behavior: 'smooth' });
    }, 60);
    return () => window.clearTimeout(timer);
  }, [props.page, props.section]);

  return (
    <div className="studio">
      <SiteHeader page={props.page} navigate={props.navigate} />
      <main id="content">
        {props.page === 'home' && (
          <HomePage
            info={props.info}
            services={services}
            projects={projects}
            blogs={blogs}
            team={team}
            testimonials={testimonials}
            partnerships={props.partnerships}
            logos={props.logos}
            faqs={faqs}
            navigate={props.navigate}
            onShowNotification={props.onShowNotification}
          />
        )}
        {props.page === 'services' && <ServicesIndex services={services} navigate={props.navigate} />}
        {props.page === 'service-detail' && <ServiceDetail service={props.service && services.some((item) => item.id === props.service?.id) ? props.service : null} navigate={props.navigate} />}
        {(props.page === 'websites') && <WorkIndex projects={projects} navigate={props.navigate} />}
        {props.page === 'project-detail' && <WorkDetail project={props.project && projects.some((item) => item.id === props.project?.id) ? props.project : null} navigate={props.navigate} />}
        {props.page === 'blogs' && <JournalIndex posts={blogs} navigate={props.navigate} />}
        {props.page === 'blog-detail' && <JournalPost post={props.post && blogs.some((item) => item.slug === props.post?.slug) ? props.post : null} navigate={props.navigate} />}
        {props.page === 'about' && <AboutPage info={props.info} navigate={props.navigate} />}
        {props.page === 'team' && <TeamPage team={team} navigate={props.navigate} />}
        {props.page === 'testimonials' && <TestimonialsPage items={testimonials} navigate={props.navigate} />}
        {props.page === 'partnership' && (
          <PartnershipPage items={props.partnerships} logos={props.logos} notice={props.info.partnershipNotice} navigate={props.navigate} />
        )}
        {props.page === 'faq' && <FaqPage faqs={faqs} navigate={props.navigate} />}
        {props.page === 'location' && <LocationPage info={props.info} navigate={props.navigate} />}
        {props.page === 'contact' && (
          <ContactPage
            address={props.info.contactAddress}
            phone={props.info.contactPhone}
            email={props.info.contactEmail}
            whatsappNumber={props.info.whatsappNumber}
            urgentNotice={props.info.urgentNotice}
            mapLatitude={props.info.mapLatitude}
            mapLongitude={props.info.mapLongitude}
            servicesList={services}
            onShowNotification={props.onShowNotification}
            navigate={props.navigate}
          />
        )}
        {props.page === 'policies' && <PoliciesPage policy={props.policy} navigate={props.navigate} onPolicy={props.onPolicy} />}
        {props.page === 'not-found' && <NotFoundPage navigate={props.navigate} />}
      </main>
      <SiteFooter
        navigate={props.navigate}
        services={services}
        address={props.info.contactAddress}
        email={props.info.contactEmail}
        phone={props.info.contactPhone}
      />
      <WhatsAppFloat number={props.info.whatsappNumber} />
    </div>
  );
}
