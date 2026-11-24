import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import type {
  AgencyGeneralInfo,
  FaqItem,
  PartnerLogo,
  PartnershipItem,
  Project,
  ServiceItem,
  BlogPost,
  TeamMemberData,
  Testimonial
} from '../types';
import { initialGeneralInfo } from '../data/generalInfo';
import { servicesData } from '../data/services';
import { projectsData } from '../data/projects';
import { blogsData } from '../data/blogs';
import { initialTeamMembers } from '../data/team';
import { testimonialsData } from '../data/testimonials';
import { initialPartnerships, initialPartnerLogos } from '../data/partnerships';
import { faqsData } from '../data/faqs';
import { withOfficePin } from './useAdminData';
import {
  CATALOG_COLLECTIONS,
  CATALOG_SETTINGS_ID,
  GENERAL_SETTINGS_ID,
  PUBLISHED_COLLECTIONS,
  SETTINGS_COLLECTION,
  asRecordArray,
  resolveCatalogList,
  type CatalogCollection,
  type CatalogMarker
} from '../utils/catalog';
import { replaceCollection, saveSettingsDoc, watchCollection, watchDocument } from '../utils/catalogStore';

export interface CatalogData {
  generalInfo: AgencyGeneralInfo;
  services: ServiceItem[];
  projects: Project[];
  blogs: BlogPost[];
  team: TeamMemberData[];
  testimonials: Testimonial[];
  partnerships: PartnershipItem[];
  partnerLogos: PartnerLogo[];
  faqs: FaqItem[];
}

type ListKey = Exclude<keyof CatalogData, 'generalInfo'>;

const LIST_SOURCES: Record<ListKey, { legacy: string; collection: CatalogCollection }> = {
  services: { legacy: 'services', collection: CATALOG_COLLECTIONS.services },
  projects: { legacy: 'projects', collection: CATALOG_COLLECTIONS.caseStudies },
  blogs: { legacy: 'blogs', collection: CATALOG_COLLECTIONS.posts },
  team: { legacy: 'team', collection: CATALOG_COLLECTIONS.teamMembers },
  testimonials: { legacy: 'testimonials', collection: CATALOG_COLLECTIONS.testimonials },
  partnerships: { legacy: 'partnerships', collection: CATALOG_COLLECTIONS.partnerships },
  partnerLogos: { legacy: 'partnerLogos', collection: CATALOG_COLLECTIONS.partnerLogos },
  faqs: { legacy: 'faqs', collection: CATALOG_COLLECTIONS.faqs }
};

const BUNDLED: CatalogData = {
  generalInfo: initialGeneralInfo,
  services: servicesData,
  projects: projectsData,
  blogs: blogsData,
  team: initialTeamMembers,
  testimonials: testimonialsData,
  partnerships: initialPartnerships,
  partnerLogos: initialPartnerLogos,
  faqs: faqsData
};

function permissionDenied(error: unknown): boolean {
  return Boolean(error && typeof error === 'object' && 'code' in error && (error as { code?: string }).code === 'permission-denied');
}

export function catalogErrorMessage(error: unknown): string {
  if (permissionDenied(error)) {
    return 'Firestore refused this change. The updated security rules are in the pull request and have not been deployed.';
  }
  return error instanceof Error ? error.message : 'Firestore request failed.';
}

function parseLegacy(section: string, raw: unknown): unknown {
  if (typeof raw !== 'string' || !raw.trim()) return null;
  try {
    const parsed = JSON.parse(raw) as unknown;
    if (section === 'team' && parsed && !Array.isArray(parsed) && typeof parsed === 'object') {
      const member = parsed as TeamMemberData;
      return [{ ...member, id: member.id || 'gauhar-nadeem' }];
    }
    if (section === 'generalInfo' && parsed && typeof parsed === 'object') {
      return withOfficePin(parsed as AgencyGeneralInfo);
    }
    return parsed;
  } catch {
    return null;
  }
}

function upsert<T extends { id: string }>(items: T[], item: T): T[] {
  if (!items.some((entry) => entry.id === item.id)) return [item, ...items];
  return items.map((entry) => (entry.id === item.id ? item : entry));
}

export function useCatalog(scope: 'public' | 'editor') {
  const [legacy, setLegacy] = useState<Partial<CatalogData>>({});
  const [remote, setRemote] = useState<Partial<Record<CatalogCollection, Array<{ id: string }>>>>({});
  const [marker, setMarker] = useState<CatalogMarker>({ authoritative: {} });
  const [generalDoc, setGeneralDoc] = useState<AgencyGeneralInfo | null>(null);
  const [syncStatus, setSyncStatus] = useState<'connected' | 'syncing' | 'offline'>('syncing');
  const [rulesBlocked, setRulesBlocked] = useState(false);
  const markerRef = useRef(marker);
  markerRef.current = marker;

  useEffect(() => {
    const unsubs = [
      watchDocument(
        'site_content',
        'generalInfo',
        (data) => {
          const parsed = parseLegacy('generalInfo', data?.data);
          if (parsed && typeof parsed === 'object') {
            setLegacy((prev) => ({ ...prev, generalInfo: parsed as AgencyGeneralInfo }));
          }
          setSyncStatus('connected');
        },
        () => setSyncStatus('offline')
      ),
      watchDocument(
        SETTINGS_COLLECTION,
        GENERAL_SETTINGS_ID,
        (data) => {
          if (data && typeof data === 'object') setGeneralDoc(withOfficePin(data as unknown as AgencyGeneralInfo));
        },
        (error) => {
          if (permissionDenied(error)) setRulesBlocked(true);
        }
      ),
      watchDocument(
        SETTINGS_COLLECTION,
        CATALOG_SETTINGS_ID,
        (data) => {
          const authoritative = data && typeof data.authoritative === 'object' && data.authoritative
            ? (data.authoritative as CatalogMarker['authoritative'])
            : {};
          setMarker({
            authoritative,
            seededAt: typeof data?.seededAt === 'string' ? data.seededAt : undefined
          });
        },
        (error) => {
          if (permissionDenied(error)) setRulesBlocked(true);
        }
      )
    ];

    (Object.keys(LIST_SOURCES) as ListKey[]).forEach((key) => {
      const source = LIST_SOURCES[key];
      unsubs.push(
        watchDocument(
          'site_content',
          source.legacy,
          (data) => {
            const parsed = parseLegacy(source.legacy, data?.data);
            const rows = asRecordArray<{ id: string }>(parsed);
            if (rows && rows.length > 0) {
              setLegacy((prev) => ({ ...prev, [key]: rows }));
            }
            setSyncStatus('connected');
          },
          () => setSyncStatus('offline')
        )
      );
    });

    return () => unsubs.forEach((stop) => stop());
  }, []);

  useEffect(() => {
    const unsubs = (Object.keys(LIST_SOURCES) as ListKey[]).map((key) => {
      const name = LIST_SOURCES[key].collection;
      const publishedOnly = scope === 'public' && (PUBLISHED_COLLECTIONS as readonly string[]).includes(name);
      return watchCollection(
        name,
        publishedOnly,
        (rows) => {
          setRemote((prev) => ({ ...prev, [name]: rows }));
          setRulesBlocked(false);
          setSyncStatus('connected');
        },
        (error) => {
          if (permissionDenied(error)) setRulesBlocked(true);
          else setSyncStatus('offline');
        }
      );
    });
    return () => unsubs.forEach((stop) => stop());
  }, [scope]);

  const data = useMemo<CatalogData>(() => {
    const generalInfo = generalDoc || legacy.generalInfo || BUNDLED.generalInfo;
    const list = <T extends { id: string }>(key: ListKey, fallback: T[]): T[] => {
      const name = LIST_SOURCES[key].collection;
      const base = (legacy[key] as T[] | undefined) || fallback;
      return resolveCatalogList({
        fallback: base,
        remote: (remote[name] as T[] | undefined) ?? null,
        authoritative: Boolean(marker.authoritative[name])
      });
    };
    return {
      generalInfo,
      services: list<ServiceItem>('services', BUNDLED.services),
      projects: list<Project>('projects', BUNDLED.projects),
      blogs: list<BlogPost>('blogs', BUNDLED.blogs),
      team: list<TeamMemberData>('team', BUNDLED.team),
      testimonials: list<Testimonial>('testimonials', BUNDLED.testimonials),
      partnerships: list<PartnershipItem>('partnerships', BUNDLED.partnerships),
      partnerLogos: list<PartnerLogo>('partnerLogos', BUNDLED.partnerLogos),
      faqs: list<FaqItem & { id: string }>('faqs', BUNDLED.faqs.filter((item): item is FaqItem & { id: string } => Boolean(item.id)))
    };
  }, [generalDoc, legacy, marker, remote]);

  const dataRef = useRef(data);
  dataRef.current = data;

  const commitList = useCallback(async (key: ListKey, items: Array<{ id: string }>, removedIds: string[] = []) => {
    const name = LIST_SOURCES[key].collection;
    await replaceCollection(name, items, removedIds);
    const authoritative = { ...markerRef.current.authoritative, [name]: true };
    const nextMarker: CatalogMarker = { authoritative, seededAt: new Date().toISOString() };
    await saveSettingsDoc(CATALOG_SETTINGS_ID, { ...nextMarker });
    setMarker(nextMarker);
    setRemote((prev) => ({ ...prev, [name]: items }));
    setRulesBlocked(false);
  }, []);

  const saveGeneral = useCallback(async (info: AgencyGeneralInfo) => {
    const next = withOfficePin(info);
    await saveSettingsDoc(GENERAL_SETTINGS_ID, { ...next });
    setGeneralDoc(next);
  }, []);

  const saveService = useCallback(async (item: ServiceItem) => {
    await commitList('services', upsert(dataRef.current.services, item));
  }, [commitList]);

  const deleteService = useCallback(async (id: string) => {
    await commitList('services', dataRef.current.services.filter((item) => item.id !== id), [id]);
  }, [commitList]);

  const saveProject = useCallback(async (item: Project) => {
    await commitList('projects', upsert(dataRef.current.projects, item));
  }, [commitList]);

  const deleteProject = useCallback(async (id: string) => {
    await commitList('projects', dataRef.current.projects.filter((item) => item.id !== id), [id]);
  }, [commitList]);

  const saveBlog = useCallback(async (item: BlogPost) => {
    await commitList('blogs', upsert(dataRef.current.blogs, item));
  }, [commitList]);

  const deleteBlog = useCallback(async (id: string) => {
    await commitList('blogs', dataRef.current.blogs.filter((item) => item.id !== id), [id]);
  }, [commitList]);

  const saveTeamMember = useCallback(async (item: TeamMemberData) => {
    await commitList('team', upsert(dataRef.current.team, item));
  }, [commitList]);

  const deleteTeamMember = useCallback(async (id: string) => {
    await commitList('team', dataRef.current.team.filter((item) => item.id !== id), [id]);
  }, [commitList]);

  const saveTestimonial = useCallback(async (item: Testimonial) => {
    await commitList('testimonials', upsert(dataRef.current.testimonials, item));
  }, [commitList]);

  const deleteTestimonial = useCallback(async (id: string) => {
    await commitList('testimonials', dataRef.current.testimonials.filter((item) => item.id !== id), [id]);
  }, [commitList]);

  const saveFaq = useCallback(async (item: FaqItem) => {
    if (!item.id) throw new Error('A FAQ needs an id before it can be saved.');
    await commitList('faqs', upsert(dataRef.current.faqs.filter((entry) => entry.id) as Array<FaqItem & { id: string }>, item as FaqItem & { id: string }));
  }, [commitList]);

  const deleteFaq = useCallback(async (id: string) => {
    await commitList('faqs', dataRef.current.faqs.filter((item) => item.id && item.id !== id) as Array<FaqItem & { id: string }>, [id]);
  }, [commitList]);

  const savePartnership = useCallback(async (item: PartnershipItem) => {
    await commitList('partnerships', upsert(dataRef.current.partnerships, item));
  }, [commitList]);

  const deletePartnership = useCallback(async (id: string) => {
    await commitList('partnerships', dataRef.current.partnerships.filter((item) => item.id !== id), [id]);
  }, [commitList]);

  const savePartnerLogo = useCallback(async (item: PartnerLogo) => {
    await commitList('partnerLogos', upsert(dataRef.current.partnerLogos, item));
  }, [commitList]);

  const deletePartnerLogo = useCallback(async (id: string) => {
    await commitList('partnerLogos', dataRef.current.partnerLogos.filter((item) => item.id !== id), [id]);
  }, [commitList]);

  const seedCatalog = useCallback(async () => {
    const current = dataRef.current;
    const published = <T extends { published?: boolean }>(items: T[]) =>
      items.map((item) => ({ ...item, published: item.published !== false }));
    await saveGeneral(current.generalInfo);
    await commitList('services', current.services);
    await commitList('projects', published(current.projects));
    await commitList('blogs', published(current.blogs));
    await commitList('team', published(current.team));
    await commitList('testimonials', published(current.testimonials));
    await commitList('faqs', published(current.faqs.filter((item) => item.id) as Array<FaqItem & { id: string }>));
    await commitList('partnerships', current.partnerships);
    await commitList('partnerLogos', current.partnerLogos);
  }, [commitList, saveGeneral]);

  return {
    data,
    syncStatus,
    rulesBlocked,
    marker,
    saveGeneral,
    saveService,
    deleteService,
    saveProject,
    deleteProject,
    saveBlog,
    deleteBlog,
    saveTeamMember,
    deleteTeamMember,
    saveTestimonial,
    deleteTestimonial,
    saveFaq,
    deleteFaq,
    savePartnership,
    deletePartnership,
    savePartnerLogo,
    deletePartnerLogo,
    seedCatalog
  };
}
