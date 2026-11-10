import React, { lazy, Suspense, useCallback, useEffect, useRef, useState } from 'react';
import { Navbar } from './components/Navbar';
import { Hero } from './components/Hero';
import { TrustSignals } from './components/TrustSignals';
import { About } from './components/About';
import { ServicesGrid } from './components/ServicesGrid';
import { CaseStudies } from './components/CaseStudies';
import { HomeBlogsPreview } from './components/HomeBlogsPreview';
import { TeamSection } from './components/TeamSection';
import { TestimonialsSection } from './components/TestimonialsSection';
import { PartnershipSection } from './components/PartnershipSection';
import { ContactSection } from './components/ContactSection';
import { FaqSection } from './components/FaqSection';
import { Footer } from './components/Footer';
import { WhatsAppButton } from './components/WhatsAppButton';
import { NotificationToast, NotificationState } from './components/NotificationToast';
import { BlogHub } from './components/BlogHub';
import { BlogArticleDetail } from './components/BlogArticleDetail';
import { ServiceDetailView } from './components/ServiceDetailView';
import { ServicesPage } from './components/ServicesPage';
import { AboutPage } from './components/AboutPage';
import { WebsitesPage } from './components/WebsitesPage';
import { TeamPage } from './components/TeamPage';
import { TestimonialsPage } from './components/TestimonialsPage';
import { PartnershipPage } from './components/PartnershipPage';
import { ContactPage } from './components/ContactPage';
import { LocationPage } from './components/LocationPage';
import { FaqPage } from './components/FaqPage';
import { PoliciesView } from './components/PoliciesView';
import { HomePoliciesBlock } from './components/HomePoliciesBlock';
import { NotFound } from './components/NotFound';
import { PageView, BlogPost, ServiceItem, PolicyType } from './types';
import { useAdminData } from './hooks/useAdminData';
import { AppRoute, isAdminLocation, resolveRoute } from './routing';
import { AdminGate, clearAdminSession } from './components/AdminGate';
import { isAdminSessionActive } from './utils/adminAuth';
import { applyPrivateMeta, applyPublicMeta, DEFAULT_DESCRIPTION, DEFAULT_TITLE, metaForPage } from './pageMeta';
import { Preloader } from './components/Preloader';

const AdminPanel = lazy(() =>
  import('./components/AdminPanel/SideAdminPanel').then((mod) => ({ default: mod.SideAdminPanel }))
);

function pageFromRoute(route: AppRoute): PageView {
  switch (route.page) {
    case 'about':
    case 'services':
    case 'websites':
    case 'team':
    case 'testimonials':
    case 'partnership':
    case 'contact':
    case 'location':
    case 'faq':
    case 'policies':
      return route.page;
    case 'service-detail':
      return 'service-detail';
    case 'blog-hub':
      return 'blogs';
    case 'blog-detail':
      return 'blog-detail';
    case 'not-found':
      return 'not-found';
    default:
      return 'home';
  }
}

function pushUrl(url: string) {
  const current = `${window.location.pathname}${window.location.search}${window.location.hash}`;
  if (current !== url) {
    window.history.pushState(null, '', url);
  }
}

export const App: React.FC = () => {
  const {
    data,
    syncStatus,
    publishAllToCloud,
    updateGeneralInfo,
    addService,
    updateService,
    deleteService,
    addProject,
    updateProject,
    deleteProject,
    addBlog,
    updateBlog,
    deleteBlog,
    addTeamMember,
    updateTeamMember,
    deleteTeamMember,
    addTestimonial,
    updateTestimonial,
    deleteTestimonial,
    updatePartnership,
    addPartnership,
    deletePartnership,
    addPartnerLogo,
    updatePartnerLogo,
    deletePartnerLogo,
    addFaq,
    updateFaq,
    deleteFaq,
    resetToDefaults,
    exportDataJson,
    importDataJson
  } = useAdminData();

  const dataRef = useRef(data);
  dataRef.current = data;

  const [adminGate, setAdminGate] = useState<'off' | 'gate' | 'open'>(() =>
    isAdminLocation(window.location.pathname, window.location.hash) ? 'gate' : 'off'
  );
  const [isAdminOpen, setIsAdminOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState<PageView>(() => {
    const route = resolveRoute(window.location.pathname, window.location.hash);
    if (route.page === 'blog-detail' && !data.blogs.some((blog) => blog.slug === route.slug)) {
      return 'blogs';
    }
    if (route.page === 'service-detail' && !data.services.some((service) => service.id === route.serviceId)) {
      return 'home';
    }
    return pageFromRoute(route);
  });
  const [selectedBlog, setSelectedBlog] = useState<BlogPost | null>(() => {
    const route = resolveRoute(window.location.pathname, window.location.hash);
    if (route.page !== 'blog-detail') return null;
    return data.blogs.find((blog) => blog.slug === route.slug) ?? null;
  });
  const [selectedService, setSelectedService] = useState<ServiceItem | null>(() => {
    const route = resolveRoute(window.location.pathname, window.location.hash);
    if (route.page !== 'service-detail') return null;
    return data.services.find((service) => service.id === route.serviceId) ?? null;
  });
  const [selectedPolicy, setSelectedPolicy] = useState<PolicyType>(() => {
    const route = resolveRoute(window.location.pathname, window.location.hash);
    return route.page === 'policies' ? route.policy : 'legal-notice';
  });
  const [pendingSection, setPendingSection] = useState<string | null>(() => {
    const route = resolveRoute(window.location.pathname, window.location.hash);
    if (route.page === 'home') return route.section && route.section !== 'home' ? route.section : null;
    if (route.page === 'service-detail' && !data.services.some((service) => service.id === route.serviceId)) {
      return 'services';
    }
    return null;
  });
  const [notification, setNotification] = useState<NotificationState | null>(null);
  const [preloaderPhase, setPreloaderPhase] = useState<'on' | 'out' | 'off'>('on');

  // Keep selectedBlog and selectedService synchronized when live data updates from Firestore
  useEffect(() => {
    if (selectedBlog) {
      const refreshed = data.blogs.find((b) => b.id === selectedBlog.id || b.slug === selectedBlog.slug);
      if (refreshed && refreshed !== selectedBlog) {
        setSelectedBlog(refreshed);
      }
    }
  }, [data.blogs, selectedBlog]);

  useEffect(() => {
    if (selectedService) {
      const refreshed = data.services.find((s) => s.id === selectedService.id);
      if (refreshed && refreshed !== selectedService) {
        setSelectedService(refreshed);
      }
    }
  }, [data.services, selectedService]);

  const showNotification = useCallback((message: string, type: 'success' | 'error' | 'info') => {
    setNotification({
      id: Date.now().toString(),
      message,
      type
    });
  }, []);

  const applyLocation = useCallback(() => {
    if (isAdminLocation(window.location.pathname, window.location.hash)) {
      setAdminGate((current) => (current === 'open' || isAdminSessionActive() ? 'open' : 'gate'));
      setIsAdminOpen((current) => current || isAdminSessionActive());
      setCurrentPage('home');
      return;
    }
    setAdminGate('off');
    setIsAdminOpen(false);

    const route = resolveRoute(window.location.pathname, window.location.hash);
    const { services, blogs } = dataRef.current;

    if (route.page === 'not-found') {
      setCurrentPage('not-found');
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }

    if (route.page === 'services') {
      setCurrentPage('services');
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }

    if (route.page === 'policies') {
      setSelectedPolicy(route.policy);
      setCurrentPage('policies');
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }

    if (route.page === 'service-detail') {
      const service = services.find((item) => item.id === route.serviceId);
      if (!service) {
        setCurrentPage('home');
        setPendingSection('services');
        return;
      }
      setSelectedService(service);
      setCurrentPage('service-detail');
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }

    if (route.page === 'blog-hub') {
      setCurrentPage('blogs');
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }

    if (route.page === 'blog-detail') {
      const blog = blogs.find((item) => item.slug === route.slug);
      if (!blog) {
        setCurrentPage('blogs');
        window.scrollTo({ top: 0, behavior: 'smooth' });
        return;
      }
      setSelectedBlog(blog);
      setCurrentPage('blog-detail');
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }

    if (route.page === 'admin') {
      setAdminGate((current) => (current === 'open' || isAdminSessionActive() ? 'open' : 'gate'));
      setIsAdminOpen((current) => current || isAdminSessionActive());
      setCurrentPage('home');
      return;
    }

    if (
      route.page === 'about' ||
      route.page === 'websites' ||
      route.page === 'team' ||
      route.page === 'testimonials' ||
      route.page === 'partnership' ||
      route.page === 'contact' ||
      route.page === 'location' ||
      route.page === 'faq'
    ) {
      setCurrentPage(route.page);
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }

    if (route.page === 'home') {
      setCurrentPage('home');
      setPendingSection(route.section && route.section !== 'home' ? route.section : null);
      if (!route.section || route.section === 'home') {
        window.scrollTo({ top: 0, behavior: 'smooth' });
      }
    }
  }, []);

  useEffect(() => {
    window.addEventListener('popstate', applyLocation);
    window.addEventListener('hashchange', applyLocation);
    return () => {
      window.removeEventListener('popstate', applyLocation);
      window.removeEventListener('hashchange', applyLocation);
    };
  }, [applyLocation]);

  useEffect(() => {
    if (currentPage !== 'home' || !pendingSection) return;
    const sectionId = pendingSection;
    const timer = window.setTimeout(() => {
      document.getElementById(sectionId)?.scrollIntoView({ behavior: 'smooth' });
      setPendingSection(null);
    }, 80);
    return () => window.clearTimeout(timer);
  }, [currentPage, pendingSection]);

  useEffect(() => {
    if (adminGate !== 'off' || isAdminLocation(window.location.pathname, window.location.hash)) {
      applyPrivateMeta('admin');
      return;
    }
    if (currentPage === 'not-found') {
      applyPrivateMeta('not-found');
      return;
    }
    applyPublicMeta(
      metaForPage(currentPage) ?? {
        title: DEFAULT_TITLE,
        description: DEFAULT_DESCRIPTION,
        path: '/'
      }
    );
  }, [currentPage, adminGate]);

  const pageOpenKey = `${currentPage}|${selectedBlog?.slug ?? ''}|${selectedService?.id ?? ''}|${currentPage === 'policies' ? selectedPolicy : ''}`;
  const preloaderHoldMs = 1100;

  useEffect(() => {
    if (adminGate !== 'off') {
      setPreloaderPhase('off');
      document.body.style.overflow = '';
      return;
    }
    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const hold = reduceMotion ? 280 : preloaderHoldMs;
    const fade = reduceMotion ? 0 : 360;
    setPreloaderPhase('on');
    document.body.style.overflow = 'hidden';
    const holdTimer = window.setTimeout(() => setPreloaderPhase('out'), hold);
    const doneTimer = window.setTimeout(() => {
      setPreloaderPhase('off');
      document.body.style.overflow = '';
    }, hold + fade);
    return () => {
      window.clearTimeout(holdTimer);
      window.clearTimeout(doneTimer);
      document.body.style.overflow = '';
    };
  }, [pageOpenKey, adminGate]);

  const handleAdminSuccess = useCallback(() => {
    setAdminGate('open');
    setIsAdminOpen(true);
  }, []);

  const handleSetCurrentPage = (page: PageView) => {
    if (page === 'home') {
      pushUrl('/');
      setPendingSection(null);
      setCurrentPage('home');
      return;
    }
    if (page === 'blogs') {
      pushUrl('/#blog-hub');
      setCurrentPage('blogs');
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }
    if (page === 'policies') {
      pushUrl(`/policies#${selectedPolicy}`);
      setCurrentPage('policies');
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }
    const sectionPaths: Partial<Record<PageView, string>> = {
      about: '/about',
      services: '/services',
      websites: '/websites',
      team: '/team',
      testimonials: '/testimonials',
      partnership: '/partnership',
      contact: '/contact',
      location: '/location',
      faq: '/faq'
    };
    const path = sectionPaths[page];
    if (path) {
      pushUrl(path);
      setCurrentPage(page);
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }
    setCurrentPage(page);
  };

  const handleAdminClose = () => {
    setIsAdminOpen(false);
    setAdminGate('off');
    if (isAdminLocation(window.location.pathname, window.location.hash)) {
      pushUrl('/');
      setCurrentPage('home');
    }
  };

  const handleAdminLogout = () => {
    void clearAdminSession().finally(() => {
      setIsAdminOpen(false);
      setAdminGate('off');
      if (isAdminLocation(window.location.pathname, window.location.hash)) {
        pushUrl('/');
        setCurrentPage('home');
      }
    });
  };

  const handleNavigateSection = (sectionId: string) => {
    const url = !sectionId || sectionId === 'home' ? '/' : `/#${sectionId}`;
    pushUrl(url);
    if (currentPage !== 'home') {
      setCurrentPage('home');
      setPendingSection(sectionId && sectionId !== 'home' ? sectionId : null);
      return;
    }
    if (sectionId && sectionId !== 'home') {
      document.getElementById(sectionId)?.scrollIntoView({ behavior: 'smooth' });
    } else {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const handleSelectService = (service: ServiceItem) => {
    setSelectedService(service);
    setCurrentPage('service-detail');
    pushUrl(`/#service-${service.id}`);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleOpenServicesPage = () => {
    setCurrentPage('services');
    pushUrl('/services');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleOpenServiceBySlug = (slug: string) => {
    const service =
      data.services.find((item) => item.id === slug || item.slug === slug) || data.services[0];
    if (service) handleSelectService(service);
  };

  const handleSelectBlog = (blog: BlogPost) => {
    setSelectedBlog(blog);
    setCurrentPage('blog-detail');
    pushUrl(`/#blog-${blog.slug}`);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleOpenBlogHub = () => {
    setCurrentPage('blogs');
    pushUrl('/#blog-hub');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleOpenPolicy = (policyType: PolicyType) => {
    setSelectedPolicy(policyType);
    setCurrentPage('policies');
    pushUrl(`/policies#${policyType}`);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleBackToHome = () => {
    pushUrl('/');
    setPendingSection(null);
    setCurrentPage('home');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  if (adminGate === 'gate') {
    return <AdminGate onSuccess={handleAdminSuccess} />;
  }

  return (
    <>
    <div className="app-container" aria-hidden={preloaderPhase !== 'off'}>
      <Navbar
        currentPage={currentPage}
        setCurrentPage={handleSetCurrentPage}
        onOpenServicesPage={handleOpenServicesPage}
      />

      {currentPage === 'home' && (
        <main>
          <Hero
            title={data.generalInfo.heroTitle}
            subtitle={data.generalInfo.heroSubtitle}
            onStartProject={() => handleNavigateSection('contact')}
            onExploreCaseStudies={() => handleNavigateSection('websites')}
          />
          <TrustSignals />
          <About
            title={data.generalInfo.aboutTitle}
            paragraph1={data.generalInfo.aboutParagraph1}
            paragraph2={data.generalInfo.aboutParagraph2}
            imageUrl={data.generalInfo.aboutImageUrl}
            stats={data.generalInfo.stats}
          />
          <ServicesGrid
            services={data.services}
            onSelectService={handleSelectService}
            onContactClick={() => handleNavigateSection('contact')}
            onOpenServicesPage={handleOpenServicesPage}
          />
          <CaseStudies projects={data.projects} />
          <HomeBlogsPreview
            blogs={data.blogs}
            onOpenBlogHub={handleOpenBlogHub}
            onOpenArticle={handleSelectBlog}
          />
          <TeamSection team={data.team} />
          <TestimonialsSection testimonials={data.testimonials} />
          <PartnershipSection
            partnerships={data.partnerships}
            partnerLogos={data.partnerLogos}
            notice={data.generalInfo.partnershipNotice}
          />
          <ContactSection
            address={data.generalInfo.contactAddress}
            phone={data.generalInfo.contactPhone}
            email={data.generalInfo.contactEmail}
            urgentNotice={data.generalInfo.urgentNotice}
            servicesList={data.services}
            onShowNotification={showNotification}
          />
          <HomePoliciesBlock onOpenPolicy={handleOpenPolicy} />
          <FaqSection faqs={data.faqs} />
        </main>
      )}

      {currentPage === 'services' && (
        <ServicesPage
          services={data.services}
          onBackToHome={handleBackToHome}
          onSelectService={handleSelectService}
          onContactClick={() => {
            handleSetCurrentPage('contact');
          }}
        />
      )}

      {currentPage === 'about' && (
        <AboutPage
          generalInfo={data.generalInfo}
          onBackToHome={handleBackToHome}
          onContactClick={() => handleSetCurrentPage('contact')}
        />
      )}

      {currentPage === 'websites' && (
        <WebsitesPage
          projects={data.projects}
          onBackToHome={handleBackToHome}
          onContactClick={() => handleSetCurrentPage('contact')}
        />
      )}

      {currentPage === 'team' && (
        <TeamPage
          team={data.team}
          onBackToHome={handleBackToHome}
          onContactClick={() => handleSetCurrentPage('contact')}
        />
      )}

      {currentPage === 'testimonials' && (
        <TestimonialsPage
          testimonials={data.testimonials}
          onBackToHome={handleBackToHome}
          onContactClick={() => handleSetCurrentPage('contact')}
        />
      )}

      {currentPage === 'partnership' && (
        <PartnershipPage
          partnerships={data.partnerships}
          partnerLogos={data.partnerLogos}
          notice={data.generalInfo.partnershipNotice}
          onBackToHome={handleBackToHome}
          onContactClick={() => handleSetCurrentPage('contact')}
        />
      )}

      {currentPage === 'contact' && (
        <ContactPage
          address={data.generalInfo.contactAddress}
          phone={data.generalInfo.contactPhone}
          email={data.generalInfo.contactEmail}
          whatsappNumber={data.generalInfo.whatsappNumber}
          urgentNotice={data.generalInfo.urgentNotice}
          servicesList={data.services}
          onShowNotification={showNotification}
          onBackToHome={handleBackToHome}
          onOpenLocation={() => handleSetCurrentPage('location')}
        />
      )}

      {currentPage === 'location' && (
        <LocationPage
          address={data.generalInfo.contactAddress}
          phone={data.generalInfo.contactPhone}
          email={data.generalInfo.contactEmail}
          mapLatitude={data.generalInfo.mapLatitude}
          mapLongitude={data.generalInfo.mapLongitude}
          onBackToHome={handleBackToHome}
          onContactClick={() => handleSetCurrentPage('contact')}
        />
      )}

      {currentPage === 'faq' && (
        <FaqPage
          faqs={data.faqs}
          onBackToHome={handleBackToHome}
          onContactClick={() => handleSetCurrentPage('contact')}
        />
      )}

      {currentPage === 'blogs' && (
        <BlogHub
          blogs={data.blogs}
          onBackToHome={handleBackToHome}
          onSelectArticle={handleSelectBlog}
        />
      )}

      {currentPage === 'blog-detail' && selectedBlog && (
        <BlogArticleDetail
          blog={selectedBlog}
          onBackToBlogs={handleOpenBlogHub}
          onContactClick={() => handleSetCurrentPage('contact')}
        />
      )}

      {currentPage === 'service-detail' && selectedService && (
        <ServiceDetailView
          service={selectedService}
          onBackToHome={handleBackToHome}
          onContactClick={() => handleSetCurrentPage('contact')}
        />
      )}

      {currentPage === 'policies' && (
        <PoliciesView
          initialPolicy={selectedPolicy}
          onBackToHome={handleBackToHome}
          onContactClick={() => handleSetCurrentPage('contact')}
          onPolicyChange={(policy) => setSelectedPolicy(policy)}
        />
      )}

      {currentPage === 'not-found' && (
        <NotFound onHome={handleBackToHome} onContact={() => handleSetCurrentPage('contact')} />
      )}

      <Footer
        onNavigateSection={handleNavigateSection}
        onOpenBlogs={handleOpenBlogHub}
        onOpenService={handleOpenServiceBySlug}
        onOpenPolicy={handleOpenPolicy}
        onOpenServicesPage={handleOpenServicesPage}
        onOpenPage={handleSetCurrentPage}
      />

      <WhatsAppButton whatsappNumber={data.generalInfo.whatsappNumber} />

      <NotificationToast
        notification={notification}
        onClose={() => setNotification(null)}
      />

      {isAdminOpen && (
        <Suspense fallback={null}>
          <AdminPanel
            isOpen={isAdminOpen}
            onClose={handleAdminClose}
            onLogout={handleAdminLogout}
            data={data}
            syncStatus={syncStatus}
            onUpdateGeneral={updateGeneralInfo}
            onAddService={addService}
            onUpdateService={updateService}
            onDeleteService={deleteService}
            onAddProject={addProject}
            onUpdateProject={updateProject}
            onDeleteProject={deleteProject}
            onAddBlog={addBlog}
            onUpdateBlog={updateBlog}
            onDeleteBlog={deleteBlog}
            onAddTeamMember={addTeamMember}
            onUpdateTeamMember={updateTeamMember}
            onDeleteTeamMember={deleteTeamMember}
            onAddTestimonial={addTestimonial}
            onUpdateTestimonial={updateTestimonial}
            onDeleteTestimonial={deleteTestimonial}
            onUpdatePartnership={updatePartnership}
            onAddPartnership={addPartnership}
            onDeletePartnership={deletePartnership}
            onAddPartnerLogo={addPartnerLogo}
            onUpdatePartnerLogo={updatePartnerLogo}
            onDeletePartnerLogo={deletePartnerLogo}
            onAddFaq={addFaq}
            onUpdateFaq={updateFaq}
            onDeleteFaq={deleteFaq}
            onResetDefaults={resetToDefaults}
            onExportJson={exportDataJson}
            onImportJson={importDataJson}
            onPublishAll={publishAllToCloud}
            onShowToast={showNotification}
          />
        </Suspense>
      )}
    </div>
    <Preloader phase={preloaderPhase} durationMs={preloaderHoldMs} />
    </>
  );
};

export default App;
