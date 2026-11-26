import { Project, ProjectOutcome, ProjectStatus, ProjectType } from '../types';
import { projectsData } from '../data/projects';
import { sanitizeDisplayImageUrl } from './imageUpload';

export function getProjectSlug(project: Pick<Project, 'id' | 'slug' | 'title'>): string {
  const explicit = (project.slug || '').trim().toLowerCase();
  if (explicit) return explicit;
  const fromId = (project.id || '').trim().toLowerCase();
  if (fromId) return fromId;
  return slugifyProjectTitle(project.title);
}

export function slugifyProjectTitle(title: string): string {
  return (title || 'website-project')
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '') || 'website-project';
}

export function buildCaseStudyHash(project: Pick<Project, 'id' | 'slug' | 'title'>): string {
  return `/#case-study-${encodeURIComponent(getProjectSlug(project))}`;
}

export function resolveProjectType(project: Pick<Project, 'projectType' | 'category' | 'id'>): ProjectType {
  if (project.projectType === 'digital-product' || project.projectType === 'case-study') {
    return project.projectType;
  }
  if (project.category === 'saas' || project.id === 'global-softwares-marketplace') {
    return 'digital-product';
  }
  return 'case-study';
}

export function resolveProjectStatus(status?: ProjectStatus): ProjectStatus {
  if (status === 'live' || status === 'beta' || status === 'in-development' || status === 'archived') {
    return status;
  }
  return 'live';
}

export function getProjectTypeLabel(type: ProjectType): string {
  return type === 'digital-product' ? 'Digital Product' : 'Case Study';
}

export function getProjectStatusLabel(status: ProjectStatus): string {
  switch (status) {
    case 'beta':
      return 'Public Beta';
    case 'in-development':
      return 'In Development';
    case 'archived':
      return 'Archived';
    default:
      return 'Live Production';
  }
}

export function sanitizeStringList(list: string[] | undefined): string[] {
  if (!Array.isArray(list)) return [];
  const seen = new Set<string>();
  const out: string[] = [];
  for (const item of list) {
    const trimmed = typeof item === 'string' ? item.trim() : '';
    if (!trimmed) continue;
    const key = trimmed.toLowerCase();
    if (!seen.has(key)) {
      seen.add(key);
      out.push(trimmed);
    }
  }
  return out;
}

export function sanitizeProjectOutcomes(outcomes: ProjectOutcome[] | undefined): ProjectOutcome[] {
  if (!Array.isArray(outcomes)) return [];
  return outcomes
    .map((o) => ({
      label: typeof o?.label === 'string' ? o.label.trim() : '',
      value: typeof o?.value === 'string' ? o.value.trim() : ''
    }))
    .filter((o) => Boolean(o.label && o.value));
}

export function collectProjectGallery(project: Pick<Project, 'imageUrl' | 'galleryImages'>): string[] {
  const images: string[] = [];
  const seen = new Set<string>();
  const push = (raw?: string) => {
    const safe = sanitizeDisplayImageUrl(raw);
    if (safe && !seen.has(safe)) {
      seen.add(safe);
      images.push(safe);
    }
  };
  push(project.imageUrl);
  if (Array.isArray(project.galleryImages)) {
    project.galleryImages.forEach(push);
  }
  return images;
}

export function findProjectByRouteId(projects: Project[], routeId: string): Project | undefined {
  const target = (routeId || '').trim().toLowerCase();
  if (!target) return undefined;
  return projects.find(
    (p) => p.id.toLowerCase() === target || (p.slug && p.slug.toLowerCase() === target)
  );
}

export interface ResolvedProjectDetails {
  projectType: ProjectType;
  status: ProjectStatus;
  slug: string;
  clientName: string;
  industry: string;
  timeline: string;
  role: string;
  pricingModel: string;
  overview: string;
  challenge: string;
  solution: string;
  keyFeatures: string[];
  deliverables: string[];
  outcomes: ProjectOutcome[];
  architectureHighlights: string[];
  gallery: string[];
  tags: string[];
}

export function resolveProjectDetails(project: Project): ResolvedProjectDetails {
  const seedMatch = projectsData.find((seed) => seed.id === project.id);
  const projectType = resolveProjectType(project);
  const status = resolveProjectStatus(project.status ?? seedMatch?.status);
  const slug = getProjectSlug(project);
  const tags = sanitizeStringList(project.tags && project.tags.length > 0 ? project.tags : seedMatch?.tags);

  const clientName =
    (project.clientName || '').trim() ||
    seedMatch?.clientName ||
    (projectType === 'digital-product' ? "Axe's Era Digital Products" : 'Enterprise Client Engagement');

  const industry =
    (project.industry || '').trim() ||
    seedMatch?.industry ||
    (project.category === 'ecommerce'
      ? 'E-Commerce & Retail'
      : project.category === 'saas'
        ? 'Cloud SaaS & Analytics'
        : 'Web Platforms & Marketplaces');

  const timeline = (project.timeline || '').trim() || seedMatch?.timeline || '4–8 Weeks Sprint';
  const role =
    (project.role || '').trim() ||
    seedMatch?.role ||
    'Architecture, UI/UX Design & Full-Stack Engineering';
  const pricingModel =
    (project.pricingModel || '').trim() ||
    seedMatch?.pricingModel ||
    (projectType === 'digital-product' ? 'SaaS & Enterprise Licensing' : 'Bespoke Enterprise Build');

  const overview =
    (project.overview || '').trim() ||
    seedMatch?.overview ||
    (project.description || '').trim() ||
    `${project.title} — ${project.subtitle}, engineered by Axe's Era Enterprises for global scalability, sub-second responsiveness, and measurable conversion growth.`;

  const challenge =
    (project.challenge || '').trim() ||
    seedMatch?.challenge ||
    `Building a resilient ${industry.toLowerCase()} system capable of sustaining high user concurrency, clean visual hierarchy, and frictionless conversion flows without legacy bottlenecks.`;

  const solution =
    (project.solution || '').trim() ||
    seedMatch?.solution ||
    `Engineered a modular full-stack architecture leveraging ${tags.slice(0, 4).join(', ') || 'modern TypeScript and cloud edge pipelines'}, complete with responsive UI, streamlined workflows, and global edge caching.`;

  const explicitFeatures = sanitizeStringList(project.keyFeatures);
  const keyFeatures =
    explicitFeatures.length > 0
      ? explicitFeatures
      : seedMatch?.keyFeatures || [
          'Responsive multi-device UI crafted for conversion speed',
          'Sub-second edge delivery and optimized Core Web Vitals',
          'Role-aware workflows and real-time operational visibility',
          'Clean extensible codebase with full documentation'
        ];

  const explicitDeliverables = sanitizeStringList(project.deliverables);
  const deliverables =
    explicitDeliverables.length > 0
      ? explicitDeliverables
      : seedMatch?.deliverables || [
          'Technical Architecture Blueprint & UI/UX System',
          'Production Web Deployment & Edge Optimization',
          '30-Day Post-Launch Monitoring & Hypercare'
        ];

  const explicitOutcomes = sanitizeProjectOutcomes(project.outcomes);
  const outcomes =
    explicitOutcomes.length > 0
      ? explicitOutcomes
      : seedMatch?.outcomes || [
          { value: project.metric || 'Production Live', label: 'Primary Impact' },
          { value: '95+', label: 'Lighthouse Score Target' },
          { value: '< 200ms', label: 'Global Edge Response' }
        ];

  const explicitArch = sanitizeStringList(project.architectureHighlights);
  const architectureHighlights =
    explicitArch.length > 0
      ? explicitArch
      : seedMatch?.architectureHighlights || [
          'Type-safe component architecture and modular state management',
          'Global CDN edge caching and automated asset optimization',
          'Security-first input validation and HTTPS transport'
        ];

  const gallery = collectProjectGallery({
    imageUrl: project.imageUrl || seedMatch?.imageUrl || '',
    galleryImages:
      project.galleryImages && project.galleryImages.length > 0
        ? project.galleryImages
        : seedMatch?.galleryImages
  });

  return {
    projectType,
    status,
    slug,
    clientName,
    industry,
    timeline,
    role,
    pricingModel,
    overview,
    challenge,
    solution,
    keyFeatures,
    deliverables,
    outcomes,
    architectureHighlights,
    gallery,
    tags
  };
}

export function reorderProjectList(
  projects: Project[],
  projectId: string,
  direction: 'up' | 'down'
): Project[] {
  const idx = projects.findIndex((p) => p.id === projectId);
  if (idx < 0) return projects;
  const targetIdx = direction === 'up' ? idx - 1 : idx + 1;
  if (targetIdx < 0 || targetIdx >= projects.length) return projects;
  const copy = [...projects];
  const [moved] = copy.splice(idx, 1);
  copy.splice(targetIdx, 0, moved);
  return copy;
}

export function createDuplicatedProject(source: Project, now: number = Date.now()): Project {
  const baseSlug = getProjectSlug(source);
  return {
    ...source,
    id: `project-${now}`,
    slug: `${baseSlug}-copy-${String(now).slice(-4)}`,
    title: `${source.title} (Copy)`,
    featured: false,
    keyFeatures: source.keyFeatures ? [...source.keyFeatures] : undefined,
    deliverables: source.deliverables ? [...source.deliverables] : undefined,
    architectureHighlights: source.architectureHighlights ? [...source.architectureHighlights] : undefined,
    outcomes: source.outcomes ? source.outcomes.map((o) => ({ ...o })) : undefined,
    galleryImages: source.galleryImages ? [...source.galleryImages] : undefined,
    tags: source.tags ? [...source.tags] : undefined
  };
}

export function filterAdminProjects(
  projects: Project[],
  options: { query?: string; typeFilter?: 'all' | ProjectType; categoryFilter?: 'all' | Project['category'] }
): Project[] {
  const query = (options.query || '').trim().toLowerCase();
  const typeFilter = options.typeFilter || 'all';
  const categoryFilter = options.categoryFilter || 'all';

  return projects.filter((project) => {
    if (typeFilter !== 'all' && resolveProjectType(project) !== typeFilter) return false;
    if (categoryFilter !== 'all' && project.category !== categoryFilter) return false;
    if (!query) return true;
    return (
      project.title.toLowerCase().includes(query) ||
      project.subtitle.toLowerCase().includes(query) ||
      (project.clientName && project.clientName.toLowerCase().includes(query)) ||
      (project.industry && project.industry.toLowerCase().includes(query)) ||
      (project.tags && project.tags.some((t) => t.toLowerCase().includes(query)))
    );
  });
}
