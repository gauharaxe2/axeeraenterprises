import { useState, useEffect } from 'react';
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

const STORAGE_KEY = 'axes_era_admin_data_v3';

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

export const useAdminData = () => {
  const [data, setData] = useState<AdminStoreData>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY) || localStorage.getItem('axes_era_admin_data_v1');
      if (saved) {
        const parsed = JSON.parse(saved);
        // Handle team array conversion if legacy was single object
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
          generalInfo: parsed.generalInfo || initialGeneralInfo,
          services: parsed.services || servicesData,
          projects: parsed.projects || projectsData,
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

  // Save to localStorage whenever data changes
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    } catch (e) {
      console.error('Failed to persist admin data to localStorage:', e);
    }
  }, [data]);

  // General Info
  const updateGeneralInfo = (info: AgencyGeneralInfo) => {
    setData((prev) => ({ ...prev, generalInfo: info }));
  };

  // Services
  const addService = (item: ServiceItem) => {
    setData((prev) => ({ ...prev, services: [item, ...prev.services] }));
  };

  const updateService = (item: ServiceItem) => {
    setData((prev) => ({
      ...prev,
      services: prev.services.map((s) => (s.id === item.id ? item : s))
    }));
  };

  const deleteService = (id: string) => {
    setData((prev) => ({
      ...prev,
      services: prev.services.filter((s) => s.id !== id)
    }));
  };

  // Projects / Case Studies
  const addProject = (project: Project) => {
    setData((prev) => ({ ...prev, projects: [project, ...prev.projects] }));
  };

  const updateProject = (project: Project) => {
    setData((prev) => ({
      ...prev,
      projects: prev.projects.map((p) => (p.id === project.id ? project : p))
    }));
  };

  const deleteProject = (id: string) => {
    setData((prev) => ({
      ...prev,
      projects: prev.projects.filter((p) => p.id !== id)
    }));
  };

  // Blogs
  const addBlog = (blog: BlogPost) => {
    setData((prev) => ({ ...prev, blogs: [blog, ...prev.blogs] }));
  };

  const updateBlog = (blog: BlogPost) => {
    setData((prev) => ({
      ...prev,
      blogs: prev.blogs.map((b) => (b.id === blog.id ? blog : b))
    }));
  };

  const deleteBlog = (id: string) => {
    setData((prev) => ({
      ...prev,
      blogs: prev.blogs.filter((b) => b.id !== id)
    }));
  };

  // Team Members
  const addTeamMember = (member: TeamMemberData) => {
    setData((prev) => ({ ...prev, team: [...prev.team, member] }));
  };

  const updateTeamMember = (member: TeamMemberData) => {
    setData((prev) => ({
      ...prev,
      team: prev.team.map((m) => (m.id === member.id ? member : m))
    }));
  };

  const deleteTeamMember = (id: string) => {
    setData((prev) => ({
      ...prev,
      team: prev.team.filter((m) => m.id !== id)
    }));
  };

  // Testimonials
  const addTestimonial = (testimonial: Testimonial) => {
    setData((prev) => ({
      ...prev,
      testimonials: [...prev.testimonials, testimonial]
    }));
  };

  const updateTestimonial = (testimonial: Testimonial) => {
    setData((prev) => ({
      ...prev,
      testimonials: prev.testimonials.map((t) =>
        t.id === testimonial.id ? testimonial : t
      )
    }));
  };

  const deleteTestimonial = (id: string) => {
    setData((prev) => ({
      ...prev,
      testimonials: prev.testimonials.filter((t) => t.id !== id)
    }));
  };

  // Partnerships Cards
  const updatePartnership = (item: PartnershipItem) => {
    setData((prev) => ({
      ...prev,
      partnerships: prev.partnerships.map((p) => (p.id === item.id ? item : p))
    }));
  };

  const addPartnership = (item: PartnershipItem) => {
    setData((prev) => ({
      ...prev,
      partnerships: [...prev.partnerships, item]
    }));
  };

  const deletePartnership = (id: string) => {
    setData((prev) => ({
      ...prev,
      partnerships: prev.partnerships.filter((p) => p.id !== id)
    }));
  };

  // Partner Logos
  const addPartnerLogo = (logo: PartnerLogo) => {
    setData((prev) => ({
      ...prev,
      partnerLogos: [...prev.partnerLogos, logo]
    }));
  };

  const updatePartnerLogo = (logo: PartnerLogo) => {
    setData((prev) => ({
      ...prev,
      partnerLogos: prev.partnerLogos.map((l) => (l.id === logo.id ? logo : l))
    }));
  };

  const deletePartnerLogo = (id: string) => {
    setData((prev) => ({
      ...prev,
      partnerLogos: prev.partnerLogos.filter((l) => l.id !== id)
    }));
  };

  // FAQs
  const addFaq = (faq: FaqItem) => {
    const newItem = {
      ...faq,
      id: faq.id || `faq-${Date.now()}`
    };
    setData((prev) => ({ ...prev, faqs: [...prev.faqs, newItem] }));
  };

  const updateFaq = (faq: FaqItem) => {
    setData((prev) => ({
      ...prev,
      faqs: prev.faqs.map((f) => (f.id === faq.id ? faq : f))
    }));
  };

  const deleteFaq = (id: string) => {
    setData((prev) => ({
      ...prev,
      faqs: prev.faqs.filter((f) => f.id !== id)
    }));
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

        setData({
          generalInfo: parsed.generalInfo || initialGeneralInfo,
          services: parsed.services || servicesData,
          projects: parsed.projects || projectsData,
          blogs: parsed.blogs || blogsData,
          team: teamMembers,
          testimonials: parsed.testimonials || testimonialsData,
          partnerships: parsed.partnerships || initialPartnerships,
          partnerLogos: parsed.partnerLogos || initialPartnerLogos,
          faqs: parsed.faqs || faqsData
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
