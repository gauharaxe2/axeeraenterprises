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
import { PoliciesView } from './components/PoliciesView';
import { HomePoliciesBlock } from './components/HomePoliciesBlock';
import { NotFound } from './components/NotFound';
import { AdminGate } from './components/AdminGate';
import { PageView, BlogPost, ServiceItem, PolicyType } from './types';
import { useAdminData } from './hooks/useAdminData';
import { logoutAdmin } from './utils/adminClient';
import { AppRoute, isAdminLocation, resolveRoute } from './routing';

const AdminPanel = lazy(() =>
  import('./components/AdminPanel/SideAdminPanel').then((mod) => ({ default: mod.SideAdminPanel }))
);

const DEFAULT_TITLE = "Axe's Era Enterprise by Gauhar Axe - Digital Solutions";

function pageFromRoute(route: AppRoute): PageView {
  switch (route.page) {
    case 'policies':
      return 'policies';
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
  const [isAdminOpen, setIsAdminOpen] = useState(false);

  const showNotification = useCallback((message: string, type: 'success' | 'error' | 'info') => {
    setNotification({
      id: Date.now().toString(),
      message,
      type
    });
  }, []);

  const applyLocation = useCallback(() => {
    if (isAdminLocation(window.location.pathname, window.location.hash)) {
      setAdminGate((current) => (current === 'open' ? 'open' : 'gate'));
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
      setAdminGate((current) => (current === 'open' ? 'open' : 'gate'));
      setCurrentPage('home');
      return;
    }

    setCurrentPage('home');
    setPendingSection(route.section && route.section !== 'home' ? route.section : null);
    if (!route.section || route.section === 'home') {
      window.scrollTo({ top: 0, behavior: 'smooth' });
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
    const robots = document.querySelector('meta[name="robots"]');
    const noindex = (content: string) => {
      const meta = robots ?? document.createElement('meta');
      meta.setAttribute('name', 'robots');
      meta.setAttribute('content', content);
      if (!robots) document.head.appendChild(meta);
    };
    if (adminGate !== 'off') {
      document.title = "Admin | Axe's Era Enterprise";
      noindex('noindex, nofollow');
      return;
    }
    if (currentPage === 'not-found') {
      document.title = "Page not found | Axe's Era Enterprise";
      noindex('noindex');
      return;
    }
    document.title = DEFAULT_TITLE;
    robots?.remove();
  }, [currentPage, adminGate]);

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
    setCurrentPage(page);
  };

  const handleAdminSuccess = useCallback(() => {
    setAdminGate('open');
    setIsAdminOpen(true);
    setCurrentPage('home');
  }, []);

  const handleAdminClose = () => {
    setIsAdminOpen(false);
    setAdminGate('off');
    if (isAdminLocation(window.location.pathname, window.location.hash)) {
      pushUrl('/');
      setCurrentPage('home');
    }
  };

  const handleAdminLogout = async () => {
    try {
      await logoutAdmin();
    } catch {
      // Leave the editor even if the network call fails. The cookie clear is retried on the next visit.
    }
    setIsAdminOpen(false);
    setAdminGate('off');
    pushUrl('/');
    setCurrentPage('home');
    setPendingSection(null);
  };

  const handleAdminExpired = () => {
    setIsAdminOpen(false);
    setAdminGate('gate');
    if (!isAdminLocation(window.location.pathname, window.location.hash)) {
      pushUrl('/admin');
    }
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

  return (
    <div className="app-container">
      {adminGate === 'gate' ? (
        <AdminGate onSuccess={handleAdminSuccess} />
      ) : (
      <>
      <Navbar
        currentPage={currentPage}
        setCurrentPage={handleSetCurrentPage}
        onNavigateSection={handleNavigateSection}
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
          onContactClick={() => handleNavigateSection('contact')}
        />
      )}

      {currentPage === 'service-detail' && selectedService && (
        <ServiceDetailView
          service={selectedService}
          onBackToHome={handleBackToHome}
          onContactClick={() => handleNavigateSection('contact')}
        />
      )}

      {currentPage === 'policies' && (
        <PoliciesView
          initialPolicy={selectedPolicy}
          onBackToHome={handleBackToHome}
          onContactClick={() => handleNavigateSection('contact')}
          onPolicyChange={(policy) => setSelectedPolicy(policy)}
        />
      )}

      {currentPage === 'not-found' && (
        <NotFound onHome={handleBackToHome} onContact={() => handleNavigateSection('contact')} />
      )}

      <Footer
        onNavigateSection={handleNavigateSection}
        onOpenBlogs={handleOpenBlogHub}
        onOpenService={handleOpenServiceBySlug}
        onOpenPolicy={handleOpenPolicy}
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
            onUnauthorized={handleAdminExpired}
            data={data}
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
            onShowToast={showNotification}
          />
        </Suspense>
      )}
      </>
      )}
    </div>
  );
};

export default App;
