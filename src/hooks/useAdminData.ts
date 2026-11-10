import { useState, useEffect, useRef } from 'react';
import {
  AgencyGeneralInfo,
  ServiceItem,
  Project,
  BlogPost,
  TeamMemberData,
  Testimonial,
  PartnershipItem,
  PartnerLogo,
  FaqItem
} from '../types';
import { initialGeneralInfo } from '../data/generalInfo';
import { servicesData } from '../data/services';
import { projectsData } from '../data/projects';
import { blogsData } from '../data/blogs';
import { initialTeamMembers } from '../data/team';
import { testimonialsData } from '../data/testimonials';
import { initialPartnerships, initialPartnerLogos } from '../data/partnerships';
import { faqsData } from '../data/faqs';
import { db, testConnection, saveSectionToFirestore } from '../utils/firebase';
import { mergeProjectsWithDefaults } from '../utils/mergeProjects';
import { isValidMapPin, WAHDAT_COLONY_PIN } from '../utils/maps';
import { collection, onSnapshot } from 'firebase/firestore';

const STORAGE_KEY = 'axes_era_admin_data_v3';

const PREVIOUS_OFFICE_ADDRESS = 'D-26, Wahdat Colony, Multan, 66000';
const OFFICE_ADDRESS = 'D-26, Wahdat Colony, Multan, Punjab, 66000, Pakistan';

function withOfficePin(info: AgencyGeneralInfo): AgencyGeneralInfo {
  const contactAddress =
    info.contactAddress.trim() === PREVIOUS_OFFICE_ADDRESS ? OFFICE_ADDRESS : info.contactAddress;
  if (isValidMapPin(info.mapLatitude, info.mapLongitude) && contactAddress === info.contactAddress) return info;
  return {
    ...info,
    contactAddress,
    mapLatitude: isValidMapPin(info.mapLatitude, info.mapLongitude) ? info.mapLatitude : WAHDAT_COLONY_PIN.lat,
    mapLongitude: isValidMapPin(info.mapLatitude, info.mapLongitude) ? info.mapLongitude : WAHDAT_COLONY_PIN.lng
  };
}

export interface AdminStoreData {
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

export type FirebaseSyncStatus = 'connected' | 'syncing' | 'offline';

export const useAdminData = () => {
  const [syncStatus, setSyncStatus] = useState<FirebaseSyncStatus>('syncing');
  const [data, setData] = useState<AdminStoreData>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY) || localStorage.getItem('axes_era_admin_data_v1');
      if (saved) {
        const parsed = JSON.parse(saved);
        let teamMembers: TeamMemberData[] = initialTeamMembers;
        if (Array.isArray(parsed.team)) {
          teamMembers = parsed.team;
        } else if (parsed.team && typeof parsed.team === 'object') {
          teamMembers = [{ ...parsed.team, id: parsed.team.id || 'gauhar-nadeem' }];
        }

        const rawBlogs = parsed.blogs || blogsData;
        const loadedBlogs: BlogPost[] = rawBlogs.map((b: BlogPost) => {
          if (!b.sections || b.sections.length === 0) {
            const defaultBlog = blogsData.find((db) => db.id === b.id);
            if (defaultBlog?.sections && defaultBlog.sections.length > 0) {
              return { ...b, sections: defaultBlog.sections };
            }
            const paras = b.paragraphs && b.paragraphs.length > 0 ? b.paragraphs : ['Article content and industry insights.'];
            const sections = paras.map((p, idx) => ({
              id: `sec-${idx + 1}`,
              heading: idx === 0 ? '1. Strategic Industry Overview' : `${idx + 1}. Key Technical Architecture`,
              paragraphs: [p],
              imageUrl: b.images && b.images[idx + 1] ? b.images[idx + 1] : undefined,
              imageCaption: `Visual architecture ${idx + 1}`
            }));
            return { ...b, sections };
          }
          return b;
        });

        return {
          generalInfo: withOfficePin(parsed.generalInfo || initialGeneralInfo),
          services: parsed.services || servicesData,
          projects: mergeProjectsWithDefaults(parsed.projects),
          blogs: loadedBlogs,
          team: teamMembers,
          testimonials: parsed.testimonials || testimonialsData,
          partnerships: parsed.partnerships || initialPartnerships,
          partnerLogos: parsed.partnerLogos || initialPartnerLogos,
          faqs: parsed.faqs || faqsData
        };
      }
    } catch (e) {
      console.error('Failed to load admin data from localStorage:', e);
    }
    return {
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
  });

  const dataRef = useRef(data);
  dataRef.current = data;

  // Local storage backup persistence
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    } catch (e) {
      console.error('Failed to persist admin data to localStorage:', e);
    }
  }, [data]);

  // Firestore real-time synchronization between Admin and Front UI
  useEffect(() => {
    let isMounted = true;

    // Test connection on boot
    testConnection().then((ok) => {
      if (isMounted) {
        setSyncStatus(ok ? 'connected' : 'offline');
      }
    });

    // Real-time listener for all site content sections
    const unsubscribe = onSnapshot(
      collection(db, 'site_content'),
      (snapshot) => {
        if (!isMounted) return;

        if (snapshot.empty) {
          // If Firestore is empty on first run, seed all sections from initial data
          const current = dataRef.current;
          saveSectionToFirestore('generalInfo', current.generalInfo).catch(() => {});
          saveSectionToFirestore('services', current.services).catch(() => {});
          saveSectionToFirestore('projects', current.projects).catch(() => {});
          saveSectionToFirestore('blogs', current.blogs).catch(() => {});
          saveSectionToFirestore('team', current.team).catch(() => {});
          saveSectionToFirestore('testimonials', current.testimonials).catch(() => {});
          saveSectionToFirestore('partnerships', current.partnerships).catch(() => {});
          saveSectionToFirestore('partnerLogos', current.partnerLogos).catch(() => {});
          saveSectionToFirestore('faqs', current.faqs).catch(() => {});
          setSyncStatus('connected');
          return;
        }

        setSyncStatus('connected');
        const incomingUpdates: Partial<AdminStoreData> = {};

        snapshot.docs.forEach((docSnap) => {
          const docData = docSnap.data();
          const sectionId = docSnap.id;
          if (!docData || typeof docData.data !== 'string') return;

          try {
            const parsed = JSON.parse(docData.data);
            switch (sectionId) {
              case 'generalInfo':
                incomingUpdates.generalInfo = withOfficePin(parsed);
                break;
              case 'services':
                incomingUpdates.services = parsed;
                break;
              case 'projects':
                incomingUpdates.projects = mergeProjectsWithDefaults(parsed);
                break;
              case 'blogs':
                incomingUpdates.blogs = parsed;
                break;
              case 'team':
                incomingUpdates.team = parsed;
                break;
              case 'testimonials':
                incomingUpdates.testimonials = parsed;
                break;
              case 'partnerships':
                incomingUpdates.partnerships = parsed;
                break;
              case 'partnerLogos':
                incomingUpdates.partnerLogos = parsed;
                break;
              case 'faqs':
                incomingUpdates.faqs = parsed;
                break;
            }
          } catch (err) {
            console.warn(`Error parsing incoming Firestore data for ${sectionId}:`, err);
          }
        });

        if (Object.keys(incomingUpdates).length > 0) {
          setData((prev) => ({ ...prev, ...incomingUpdates }));
        }
      },
      (error) => {
        console.warn('Firestore live listener warning:', error);
        if (isMounted) setSyncStatus('offline');
      }
    );

    return () => {
      isMounted = false;
      unsubscribe();
    };
  }, []);

  // General Info
  const updateGeneralInfo = (info: AgencyGeneralInfo) => {
    setData((prev) => ({ ...prev, generalInfo: info }));
    saveSectionToFirestore('generalInfo', info).catch((err) => {
      console.warn('Firestore sync failed for generalInfo:', err);
    });
  };

  // Services
  const addService = (item: ServiceItem) => {
    const currentServices = dataRef.current.services;
    const nextServices = [item, ...currentServices.filter((s) => s.id !== item.id)];
    setData((prev) => ({ ...prev, services: nextServices }));
    saveSectionToFirestore('services', nextServices).catch((err) => {
      console.warn('Firestore sync failed for services:', err);
    });
  };

  const updateService = (item: ServiceItem) => {
    const currentServices = dataRef.current.services;
    const nextServices = currentServices.map((s) => (s.id === item.id ? item : s));
    setData((prev) => ({ ...prev, services: nextServices }));
    saveSectionToFirestore('services', nextServices).catch((err) => {
      console.warn('Firestore sync failed for services:', err);
    });
  };

  const deleteService = (id: string) => {
    const currentServices = dataRef.current.services;
    const nextServices = currentServices.filter((s) => s.id !== id);
    setData((prev) => ({ ...prev, services: nextServices }));
    saveSectionToFirestore('services', nextServices).catch((err) => {
      console.warn('Firestore sync failed for services:', err);
    });
  };

  // Projects / Case Studies
  const addProject = (project: Project) => {
    const currentProjects = dataRef.current.projects;
    const nextProjects = [project, ...currentProjects.filter((p) => p.id !== project.id)];
    setData((prev) => ({ ...prev, projects: nextProjects }));
    saveSectionToFirestore('projects', nextProjects).catch((err) => {
      console.warn('Firestore sync failed for projects:', err);
    });
  };

  const updateProject = (project: Project) => {
    const currentProjects = dataRef.current.projects;
    const nextProjects = currentProjects.map((p) => (p.id === project.id ? project : p));
    setData((prev) => ({ ...prev, projects: nextProjects }));
    saveSectionToFirestore('projects', nextProjects).catch((err) => {
      console.warn('Firestore sync failed for projects:', err);
    });
  };

  const deleteProject = (id: string) => {
    const currentProjects = dataRef.current.projects;
    const nextProjects = currentProjects.filter((p) => p.id !== id);
    setData((prev) => ({ ...prev, projects: nextProjects }));
    saveSectionToFirestore('projects', nextProjects).catch((err) => {
      console.warn('Firestore sync failed for projects:', err);
    });
  };

  // Blogs
  const addBlog = (blog: BlogPost) => {
    const currentBlogs = dataRef.current.blogs;
    const nextBlogs = [blog, ...currentBlogs.filter((b) => b.id !== blog.id)];
    setData((prev) => ({ ...prev, blogs: nextBlogs }));
    saveSectionToFirestore('blogs', nextBlogs).catch((err) => {
      console.warn('Firestore sync failed for blogs:', err);
    });
  };

  const updateBlog = (blog: BlogPost) => {
    const currentBlogs = dataRef.current.blogs;
    const nextBlogs = currentBlogs.map((b) => (b.id === blog.id ? blog : b));
    setData((prev) => ({ ...prev, blogs: nextBlogs }));
    saveSectionToFirestore('blogs', nextBlogs).catch((err) => {
      console.warn('Firestore sync failed for blogs:', err);
    });
  };

  const deleteBlog = (id: string) => {
    const currentBlogs = dataRef.current.blogs;
    const nextBlogs = currentBlogs.filter((b) => b.id !== id);
    setData((prev) => ({ ...prev, blogs: nextBlogs }));
    saveSectionToFirestore('blogs', nextBlogs).catch((err) => {
      console.warn('Firestore sync failed for blogs:', err);
    });
  };

  // Team Members
  const addTeamMember = (member: TeamMemberData) => {
    const currentTeam = dataRef.current.team;
    const nextTeam = [...currentTeam.filter((m) => m.id !== member.id), member];
    setData((prev) => ({ ...prev, team: nextTeam }));
    saveSectionToFirestore('team', nextTeam).catch((err) => {
      console.warn('Firestore sync failed for team:', err);
    });
  };

  const updateTeamMember = (member: TeamMemberData) => {
    const currentTeam = dataRef.current.team;
    const nextTeam = currentTeam.map((m) => (m.id === member.id ? member : m));
    setData((prev) => ({ ...prev, team: nextTeam }));
    saveSectionToFirestore('team', nextTeam).catch((err) => {
      console.warn('Firestore sync failed for team:', err);
    });
  };

  const deleteTeamMember = (id: string) => {
    const currentTeam = dataRef.current.team;
    const nextTeam = currentTeam.filter((m) => m.id !== id);
    setData((prev) => ({ ...prev, team: nextTeam }));
    saveSectionToFirestore('team', nextTeam).catch((err) => {
      console.warn('Firestore sync failed for team:', err);
    });
  };

  // Testimonials
  const addTestimonial = (testimonial: Testimonial) => {
    const currentTestimonials = dataRef.current.testimonials;
    const nextTestimonials = [...currentTestimonials.filter((t) => t.id !== testimonial.id), testimonial];
    setData((prev) => ({ ...prev, testimonials: nextTestimonials }));
    saveSectionToFirestore('testimonials', nextTestimonials).catch((err) => {
      console.warn('Firestore sync failed for testimonials:', err);
    });
  };

  const updateTestimonial = (testimonial: Testimonial) => {
    const currentTestimonials = dataRef.current.testimonials;
    const nextTestimonials = currentTestimonials.map((t) =>
      t.id === testimonial.id ? testimonial : t
    );
    setData((prev) => ({ ...prev, testimonials: nextTestimonials }));
    saveSectionToFirestore('testimonials', nextTestimonials).catch((err) => {
      console.warn('Firestore sync failed for testimonials:', err);
    });
  };

  const deleteTestimonial = (id: string) => {
    const currentTestimonials = dataRef.current.testimonials;
    const nextTestimonials = currentTestimonials.filter((t) => t.id !== id);
    setData((prev) => ({ ...prev, testimonials: nextTestimonials }));
    saveSectionToFirestore('testimonials', nextTestimonials).catch((err) => {
      console.warn('Firestore sync failed for testimonials:', err);
    });
  };

  // Partnerships Cards
  const updatePartnership = (item: PartnershipItem) => {
    const currentPartnerships = dataRef.current.partnerships;
    const nextPartnerships = currentPartnerships.map((p) => (p.id === item.id ? item : p));
    setData((prev) => ({ ...prev, partnerships: nextPartnerships }));
    saveSectionToFirestore('partnerships', nextPartnerships).catch((err) => {
      console.warn('Firestore sync failed for partnerships:', err);
    });
  };

  const addPartnership = (item: PartnershipItem) => {
    const currentPartnerships = dataRef.current.partnerships;
    const nextPartnerships = [...currentPartnerships.filter((p) => p.id !== item.id), item];
    setData((prev) => ({ ...prev, partnerships: nextPartnerships }));
    saveSectionToFirestore('partnerships', nextPartnerships).catch((err) => {
      console.warn('Firestore sync failed for partnerships:', err);
    });
  };

  const deletePartnership = (id: string) => {
    const currentPartnerships = dataRef.current.partnerships;
    const nextPartnerships = currentPartnerships.filter((p) => p.id !== id);
    setData((prev) => ({ ...prev, partnerships: nextPartnerships }));
    saveSectionToFirestore('partnerships', nextPartnerships).catch((err) => {
      console.warn('Firestore sync failed for partnerships:', err);
    });
  };

  // Partner Logos
  const addPartnerLogo = (logo: PartnerLogo) => {
    const currentLogos = dataRef.current.partnerLogos;
    const nextLogos = [...currentLogos.filter((l) => l.id !== logo.id), logo];
    setData((prev) => ({ ...prev, partnerLogos: nextLogos }));
    saveSectionToFirestore('partnerLogos', nextLogos).catch((err) => {
      console.warn('Firestore sync failed for partnerLogos:', err);
    });
  };

  const updatePartnerLogo = (logo: PartnerLogo) => {
    const currentLogos = dataRef.current.partnerLogos;
    const nextLogos = currentLogos.map((l) => (l.id === logo.id ? logo : l));
    setData((prev) => ({ ...prev, partnerLogos: nextLogos }));
    saveSectionToFirestore('partnerLogos', nextLogos).catch((err) => {
      console.warn('Firestore sync failed for partnerLogos:', err);
    });
  };

  const deletePartnerLogo = (id: string) => {
    const currentLogos = dataRef.current.partnerLogos;
    const nextLogos = currentLogos.filter((l) => l.id !== id);
    setData((prev) => ({ ...prev, partnerLogos: nextLogos }));
    saveSectionToFirestore('partnerLogos', nextLogos).catch((err) => {
      console.warn('Firestore sync failed for partnerLogos:', err);
    });
  };

  // FAQs
  const addFaq = (faq: FaqItem) => {
    const newItem = {
      ...faq,
      id: faq.id || `faq-${Date.now()}`
    };
    const currentFaqs = dataRef.current.faqs;
    const nextFaqs = [...currentFaqs.filter((f) => f.id !== newItem.id), newItem];
    setData((prev) => ({ ...prev, faqs: nextFaqs }));
    saveSectionToFirestore('faqs', nextFaqs).catch((err) => {
      console.warn('Firestore sync failed for faqs:', err);
    });
  };

  const updateFaq = (faq: FaqItem) => {
    const currentFaqs = dataRef.current.faqs;
    const nextFaqs = currentFaqs.map((f) => (f.id === faq.id ? faq : f));
    setData((prev) => ({ ...prev, faqs: nextFaqs }));
    saveSectionToFirestore('faqs', nextFaqs).catch((err) => {
      console.warn('Firestore sync failed for faqs:', err);
    });
  };

  const deleteFaq = (id: string) => {
    const currentFaqs = dataRef.current.faqs;
    const nextFaqs = currentFaqs.filter((f) => f.id !== id);
    setData((prev) => ({ ...prev, faqs: nextFaqs }));
    saveSectionToFirestore('faqs', nextFaqs).catch((err) => {
      console.warn('Firestore sync failed for faqs:', err);
    });
  };

  // Full Cloud Publish (guarantees all 9 collections are synced to Firestore)
  const publishAllToCloud = async (): Promise<boolean> => {
    try {
      setSyncStatus('syncing');
      const current = dataRef.current;
      await Promise.all([
        saveSectionToFirestore('generalInfo', current.generalInfo),
        saveSectionToFirestore('services', current.services),
        saveSectionToFirestore('projects', current.projects),
        saveSectionToFirestore('blogs', current.blogs),
        saveSectionToFirestore('team', current.team),
        saveSectionToFirestore('testimonials', current.testimonials),
        saveSectionToFirestore('partnerships', current.partnerships),
        saveSectionToFirestore('partnerLogos', current.partnerLogos),
        saveSectionToFirestore('faqs', current.faqs)
      ]);
      setSyncStatus('connected');
      return true;
    } catch (err) {
      console.error('Failed to publish all data to cloud:', err);
      setSyncStatus('connected');
      return false;
    }
  };

  // Reset to Defaults
  const resetToDefaults = () => {
    const defaultData: AdminStoreData = {
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
    setData(defaultData);
    localStorage.removeItem(STORAGE_KEY);
    localStorage.removeItem('axes_era_admin_data_v1');

    // Sync reset defaults to Firestore
    Object.entries(defaultData).forEach(([sec, val]) => {
      saveSectionToFirestore(sec, val).catch(() => {});
    });
  };

  // Export & Import
  const exportDataJson = () => {
    return JSON.stringify(data, null, 2);
  };

  const importDataJson = (jsonString: string): boolean => {
    try {
      const parsed = JSON.parse(jsonString);
      if (parsed && typeof parsed === 'object') {
        let teamMembers: TeamMemberData[] = initialTeamMembers;
        if (Array.isArray(parsed.team)) {
          teamMembers = parsed.team;
        } else if (parsed.team && typeof parsed.team === 'object') {
          teamMembers = [{ ...parsed.team, id: parsed.team.id || 'gauhar-nadeem' }];
        }

        const importedData: AdminStoreData = {
          generalInfo: withOfficePin(parsed.generalInfo || initialGeneralInfo),
          services: parsed.services || servicesData,
          projects: parsed.projects || projectsData,
          blogs: parsed.blogs || blogsData,
          team: teamMembers,
          testimonials: parsed.testimonials || testimonialsData,
          partnerships: parsed.partnerships || initialPartnerships,
          partnerLogos: parsed.partnerLogos || initialPartnerLogos,
          faqs: parsed.faqs || faqsData
        };
        setData(importedData);
        Object.entries(importedData).forEach(([sec, val]) => {
          saveSectionToFirestore(sec, val).catch(() => {});
        });
        return true;
      }
    } catch (e) {
      console.error('Invalid JSON provided to importDataJson:', e);
    }
    return false;
  };

  return {
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
  };
};
