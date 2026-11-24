import React, { useCallback, useEffect, useMemo, useState } from 'react';
import type { User } from 'firebase/auth';
import { LanguageProvider, useLanguage } from './context/LanguageContext';
import { NotificationToast, type NotificationState } from './components/NotificationToast';
import { AdminGate, clearAdminSession } from './components/AdminGate';
import { StudioAdmin } from './components/AdminPanel/StudioAdmin';
import { PublicSite } from './site/PublicSite';
import { useCatalog } from './hooks/useCatalog';
import { visibleItems } from './utils/catalog';
import { finishAdminRedirect, watchAdminAuth } from './utils/adminAuth';
import { resolveRoute, type AppRoute } from './routing';
import { applyPrivateMeta, applyPublicMeta, metaForView } from './pageMeta';
import { POLICIES_DATA } from './data/policiesData';
import type { PageView, PolicyType } from './types';

function pageOf(route: AppRoute): PageView {
  if (route.page === 'blog-hub') return 'blogs';
  if (route.page === 'admin') return 'home';
  return route.page;
}

function AppContent() {
  const [route, setRoute] = useState<AppRoute>(() => resolveRoute(window.location.pathname, window.location.hash));
  const [adminUser, setAdminUser] = useState<User | null>(null);
  const [authReady, setAuthReady] = useState(false);
  const [notification, setNotification] = useState<NotificationState | null>(null);
  const { translateGeneralInfo, translateServices, translateProjects, translateFaqs } = useLanguage();
  const editor = route.page === 'admin';
  const live = useCatalog(editor ? 'editor' : 'public');
  const showAdminGate = useCallback(() => setAuthReady(true), []);

  useEffect(() => {
    let active = true;
    const unsubscribe = watchAdminAuth((user) => {
      if (!active) return;
      setAdminUser(user);
      setAuthReady(true);
    });
    finishAdminRedirect()
      .then((user) => {
        if (active && user) {
          setAdminUser(user);
          setAuthReady(true);
        }
      })
      .catch(() => {
        if (active) setAuthReady(true);
      });
    return () => {
      active = false;
      unsubscribe();
    };
  }, []);

  useEffect(() => {
    const sync = () => setRoute(resolveRoute(window.location.pathname, window.location.hash));
    window.addEventListener('popstate', sync);
    window.addEventListener('hashchange', sync);
    return () => {
      window.removeEventListener('popstate', sync);
      window.removeEventListener('hashchange', sync);
    };
  }, []);

  const navigate = useCallback((url: string) => {
    const next = new URL(url, window.location.origin);
    const target = `${next.pathname}${next.search}${next.hash}`;
    const current = `${window.location.pathname}${window.location.search}${window.location.hash}`;
    if (current !== target) window.history.pushState(null, '', target);
    setRoute(resolveRoute(next.pathname, next.hash));
    if (!next.hash) window.scrollTo({ top: 0, behavior: 'smooth' });
  }, []);

  const showNotification = useCallback((message: string, type: 'success' | 'error' | 'info') => {
    setNotification({ id: Date.now().toString(), message, type });
  }, []);

  const data = live.data;
  const page = pageOf(route);
  const services = useMemo(() => translateServices(visibleItems(data.services)), [translateServices, data.services]);
  const projects = useMemo(() => translateProjects(visibleItems(data.projects)), [translateProjects, data.projects]);
  const faqs = useMemo(() => translateFaqs(visibleItems(data.faqs)), [translateFaqs, data.faqs]);
  const info = useMemo(() => translateGeneralInfo(data.generalInfo), [translateGeneralInfo, data.generalInfo]);
  const service = route.page === 'service-detail' ? services.find((item) => item.id === route.serviceId) || null : null;
  const project = route.page === 'project-detail' ? projects.find((item) => item.id === route.projectId) || null : null;
  const post = route.page === 'blog-detail' ? visibleItems(data.blogs).find((item) => item.slug === route.slug) || null : null;
  const policy: PolicyType = route.page === 'policies' ? route.policy : 'legal-notice';

  useEffect(() => {
    if (route.page === 'admin') {
      applyPrivateMeta('admin');
      return;
    }
    if (route.page === 'not-found' || (route.page === 'service-detail' && !service) || (route.page === 'project-detail' && !project) || (route.page === 'blog-detail' && !post)) {
      applyPrivateMeta('not-found');
      return;
    }
    const policyDoc = POLICIES_DATA[policy];
    applyPublicMeta(metaForView({
      page: route.page,
      path: route.page === 'policies' ? (policy === 'legal-notice' ? '/policies' : `/policies`) : undefined,
      service,
      project,
      blog: post,
      policyTitle: policyDoc.title,
      policySummary: policyDoc.summary
    }));
  }, [route, service, project, post, policy]);

  const onPolicy = (next: PolicyType) => {
    navigate(next === 'legal-notice' ? '/policies' : `/policies#${next}`);
  };

  if (route.page === 'admin') {
    if (!authReady || !adminUser) {
      return <AdminGate onSuccess={showAdminGate} />;
    }
    return (
      <>
        <StudioAdmin
          data={live.data}
          syncStatus={live.syncStatus}
          rulesBlocked={live.rulesBlocked}
          onNavigate={navigate}
          onLogout={() => {
            void clearAdminSession().finally(() => navigate('/'));
          }}
          onNotify={showNotification}
          actions={live}
        />
        <NotificationToast notification={notification} onClose={() => setNotification(null)} />
      </>
    );
  }

  return (
    <>
      <PublicSite
        page={page}
        info={info}
        services={services}
        projects={projects}
        blogs={visibleItems(data.blogs)}
        team={visibleItems(data.team)}
        testimonials={visibleItems(data.testimonials)}
        partnerships={data.partnerships}
        logos={data.partnerLogos}
        faqs={faqs}
        service={service}
        project={project}
        post={post}
        policy={policy}
        navigate={navigate}
        onPolicy={onPolicy}
        onShowNotification={showNotification}
        section={route.page === 'home' ? route.section : null}
      />
      <NotificationToast notification={notification} onClose={() => setNotification(null)} />
    </>
  );
}

export const App: React.FC = () => (
  <LanguageProvider>
    <AppContent />
  </LanguageProvider>
);

export default App;
