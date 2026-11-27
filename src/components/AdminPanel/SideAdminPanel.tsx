import React, { useState, useEffect } from 'react';
import {
  X,
  Settings,
  LayoutTemplate,
  Briefcase,
  FolderGit2,
  BookOpen,
  Users,
  Star,
  Handshake,
  Image as ImageIcon,
  HelpCircle,
  Database,
  Plus,
  Trash2,
  Edit2,
  Save,
  RotateCcw,
  Check,
  Maximize2,
  Minimize2,
  ExternalLink,
  LogOut,
  ChevronUp,
  ChevronDown,
  FileText,
  Mail,
  UploadCloud,
  Copy,
  Search,
  Sparkles,
  Eye
} from 'lucide-react';
import {
  AdminTab,
  AgencyGeneralInfo,
  ServiceItem,
  Project,
  ProjectStatus,
  ProjectType,
  BlogPost,
  BlogSection,
  TeamMemberData,
  Testimonial,
  PartnershipItem,
  PartnerLogo,
  FaqItem,
  BLOG_CATEGORIES
} from '../../types';
import {
  normalizeBlogSections,
  collectArticleImages,
  extractExtraArticleImages,
  prepareBlogForPublish,
  mergeMissingBuiltinBlogs
} from '../../utils/blogUtils';
import {
  blogsData,
  CURATED_WEB_DEV_BLOG_IDS,
  CURATED_MOBILE_APP_BLOG_IDS,
  CURATED_BRANDING_BLOG_IDS
} from '../../data/blogs';
import {
  ACCOUNT_LINK_PRESETS,
  type AccountLinkPreset,
  type EditableAccountLink,
  collectTeamSocialLinks,
  createEditableAccountLink,
  editableLinksToMemberSocials,
  getAccountPresetMeta,
  memberToEditableLinks,
  removeEditableAccountLink
} from '../../utils/teamSocials';
import {
  DEFAULT_MEMBER_SKILLS,
  addMemberSkill,
  removeMemberSkill,
  resolveMemberSkills,
  sanitizeMemberSkills
} from '../../utils/teamProfile';
import {
  FIRESTORE_SAFE_SECTION_BYTES,
  PROJECT_IMAGE_MAX_DIMENSION,
  REVIEW_AVATAR_MAX_DIMENSION,
  SERVICE_IMAGE_MAX_DIMENSION,
  TEAM_PHOTO_MAX_DIMENSION,
  deriveInitials,
  estimateJsonSectionBytes,
  filterSupportedImageFiles,
  isUploadedDataUrl,
  isWithinFirestoreDocBudget,
  processImageFileToDataUrl,
  sanitizeDisplayImageUrl
} from '../../utils/imageUpload';
import {
  createDuplicatedProject,
  filterAdminProjects,
  getProjectStatusLabel,
  getProjectTypeLabel,
  reorderProjectList,
  resolveProjectDetails,
  resolveProjectStatus,
  resolveProjectType,
  sanitizeProjectOutcomes,
  sanitizeStringList,
  slugifyProjectTitle
} from '../../utils/projectUtils';
import {
  BUILTIN_FAQ_CATEGORIES,
  DEFAULT_FAQ_CATEGORY_ID,
  collectFaqCategories,
  filterFaqs,
  getFaqCategoryLabel,
  isBuiltinFaqCategory,
  resolveFaqCategory
} from '../../utils/faqCategories';
import { ClientAvatar } from '../ClientAvatar';
import { ImageUploadField } from './ImageUploadField';
import { QueriesPanel } from './QueriesPanel';

interface SideAdminPanelProps {
  isOpen: boolean;
  onClose: () => void;
  onLogout?: () => void;
  data: {
    generalInfo: AgencyGeneralInfo;
    services: ServiceItem[];
    projects: Project[];
    blogs: BlogPost[];
    team: TeamMemberData[];
    testimonials: Testimonial[];
    partnerships: PartnershipItem[];
    partnerLogos: PartnerLogo[];
    faqs: FaqItem[];
  };
  onUpdateGeneral: (info: AgencyGeneralInfo) => void;
  onAddService: (item: ServiceItem) => void;
  onUpdateService: (item: ServiceItem) => void;
  onDeleteService: (id: string) => void;
  onAddProject: (project: Project) => void;
  onUpdateProject: (project: Project) => void;
  onDeleteProject: (id: string) => void;
  onReorderProjects?: (projects: Project[]) => void;
  onPreviewProject?: (project: Project) => void;
  onAddBlog: (blog: BlogPost) => Promise<boolean> | void;
  onUpdateBlog: (blog: BlogPost) => Promise<boolean> | void;
  onDeleteBlog: (id: string) => Promise<boolean> | void;
  onImportBuiltinBlogs?: (blogIds?: string[]) => Promise<{ ok: boolean; addedCount: number }>;
  onAddTeamMember: (member: TeamMemberData) => void;
  onUpdateTeamMember: (member: TeamMemberData) => void;
  onDeleteTeamMember: (id: string) => void;
  onAddTestimonial: (item: Testimonial) => void;
  onUpdateTestimonial: (item: Testimonial) => void;
  onDeleteTestimonial: (id: string) => void;
  onUpdatePartnership: (item: PartnershipItem) => void;
  onAddPartnership: (item: PartnershipItem) => void;
  onDeletePartnership: (id: string) => void;
  onAddPartnerLogo: (logo: PartnerLogo) => void;
  onUpdatePartnerLogo: (logo: PartnerLogo) => void;
  onDeletePartnerLogo: (id: string) => void;
  onAddFaq: (faq: FaqItem) => void;
  onUpdateFaq: (faq: FaqItem) => void;
  onDeleteFaq: (id: string) => void;
  onResetDefaults: () => void;
  onExportJson: () => string;
  onImportJson: (json: string) => boolean;
  onPublishAll?: () => Promise<boolean>;
  onShowToast: (message: string, type: 'success' | 'error' | 'info') => void;
  onUnauthorized?: () => void;
  syncStatus?: 'connected' | 'syncing' | 'offline';
}

export const SideAdminPanel: React.FC<SideAdminPanelProps> = ({
  isOpen,
  onClose,
  onLogout,
  data,
  syncStatus = 'connected',
  onUpdateGeneral,
  onAddService,
  onUpdateService,
  onDeleteService,
  onAddProject,
  onUpdateProject,
  onDeleteProject,
  onReorderProjects,
  onPreviewProject,
  onAddBlog,
  onUpdateBlog,
  onDeleteBlog,
  onImportBuiltinBlogs,
  onAddTeamMember,
  onUpdateTeamMember,
  onDeleteTeamMember,
  onAddTestimonial,
  onUpdateTestimonial,
  onDeleteTestimonial,
  onUpdatePartnership,
  onAddPartnership,
  onDeletePartnership,
  onAddPartnerLogo,
  onUpdatePartnerLogo,
  onDeletePartnerLogo,
  onAddFaq,
  onUpdateFaq,
  onDeleteFaq,
  onResetDefaults,
  onExportJson,
  onImportJson,
  onPublishAll,
  onShowToast,
  onUnauthorized
}) => {
  const [activeTab, setActiveTab] = useState<AdminTab>('queries');
  const [queriesUnread, setQueriesUnread] = useState(0);
  const [isExpanded, setIsExpanded] = useState(false);

  // States for sub-form editing
  const [editingService, setEditingService] = useState<ServiceItem | null>(null);
  const [isCreatingService, setIsCreatingService] = useState(false);

  const [editingProject, setEditingProject] = useState<Project | null>(null);
  const [isCreatingProject, setIsCreatingProject] = useState(false);
  const [projectSearch, setProjectSearch] = useState('');
  const [projectTypeFilter, setProjectTypeFilter] = useState<'all' | ProjectType>('all');
  const [newProjectFeature, setNewProjectFeature] = useState('');
  const [newProjectDeliverable, setNewProjectDeliverable] = useState('');
  const [newProjectArchHighlight, setNewProjectArchHighlight] = useState('');
  const [newOutcomeValue, setNewOutcomeValue] = useState('');
  const [newOutcomeLabel, setNewOutcomeLabel] = useState('');
  const [newProjectGalleryUrl, setNewProjectGalleryUrl] = useState('');
  const [isUploadingProjectGallery, setIsUploadingProjectGallery] = useState(false);

  const [editingBlog, setEditingBlog] = useState<BlogPost | null>(null);
  const [isCreatingBlog, setIsCreatingBlog] = useState(false);
  const [blogSearch, setBlogSearch] = useState('');
  const [newGalleryImageUrl, setNewGalleryImageUrl] = useState('');
  const [blogCategoryFilter, setBlogCategoryFilter] = useState('All');
  const [uploadingBlogSectionIdx, setUploadingBlogSectionIdx] = useState<number | null>(null);
  const [draggingBlogSectionIdx, setDraggingBlogSectionIdx] = useState<number | null>(null);
  const [isUploadingBlogGallery, setIsUploadingBlogGallery] = useState(false);
  const [isDraggingBlogGallery, setIsDraggingBlogGallery] = useState(false);
  const [isPublishingBlog, setIsPublishingBlog] = useState(false);
  const [isSyncingBuiltinBlogs, setIsSyncingBuiltinBlogs] = useState(false);
  const [blogFormError, setBlogFormError] = useState('');

  // Team state for multiple team members
  const [editingTeamMember, setEditingTeamMember] = useState<TeamMemberData | null>(null);
  const [isCreatingTeamMember, setIsCreatingTeamMember] = useState(false);
  const [editingTeamSkills, setEditingTeamSkills] = useState<string[]>([]);
  const [newSkillInput, setNewSkillInput] = useState('');
  const [editingTeamLinks, setEditingTeamLinks] = useState<EditableAccountLink[]>([]);
  const [newAccountPreset, setNewAccountPreset] = useState<AccountLinkPreset>('instagramCompany');
  const [newAccountLabel, setNewAccountLabel] = useState('');
  const [newAccountUrl, setNewAccountUrl] = useState('');

  const [editingTestimonial, setEditingTestimonial] = useState<Testimonial | null>(null);
  const [isCreatingTestimonial, setIsCreatingTestimonial] = useState(false);

  const [editingFaq, setEditingFaq] = useState<FaqItem | null>(null);
  const [isCreatingFaq, setIsCreatingFaq] = useState(false);
  const [faqCategoryFilter, setFaqCategoryFilter] = useState<string>('all');
  const [faqSearch, setFaqSearch] = useState<string>('');
  const [customFaqCategoryMode, setCustomFaqCategoryMode] = useState<boolean>(false);

  const [editingPartnership, setEditingPartnership] = useState<PartnershipItem | null>(null);
  const [isCreatingPartnership, setIsCreatingPartnership] = useState(false);

  // Partner Logo state
  const [editingPartnerLogo, setEditingPartnerLogo] = useState<PartnerLogo | null>(null);
  const [isCreatingPartnerLogo, setIsCreatingPartnerLogo] = useState(false);

  // General info state
  const [generalForm, setGeneralForm] = useState<AgencyGeneralInfo>(data.generalInfo);

  // Sync generalForm if data.generalInfo updates from Firestore
  useEffect(() => {
    setGeneralForm(data.generalInfo);
  }, [data.generalInfo]);

  // Cloud Publish state
  const [isPublishingAll, setIsPublishingAll] = useState(false);

  const handlePublishAllToCloud = async () => {
    if (!onPublishAll) return;
    setIsPublishingAll(true);
    try {
      const ok = await onPublishAll();
      if (ok) {
        onShowToast('All 9 content sections published live to cloud! Visitors will see your updates.', 'success');
      } else {
        onShowToast('Cloud sync completed with warnings. Check connection.', 'info');
      }
    } catch {
      onShowToast('Cloud synchronization encountered an error.', 'error');
    } finally {
      setIsPublishingAll(false);
    }
  };

  const handleBlogSectionImageFile = async (sIdx: number, file: File | undefined | null) => {
    if (!file || !editingBlog) return;
    setUploadingBlogSectionIdx(sIdx);
    try {
      const dataUrl = await processImageFileToDataUrl(file, {
        maxDimension: SERVICE_IMAGE_MAX_DIMENSION,
        maxEncodedLength: 160_000
      });
      const baseSections =
        editingBlog.sections && editingBlog.sections.length > 0
          ? editingBlog.sections
          : ensureBlogSections(editingBlog);
      const updated = [...baseSections];
      if (!updated[sIdx]) return;
      updated[sIdx] = { ...updated[sIdx], imageUrl: dataUrl };
      const candidate = { ...editingBlog, sections: updated };
      const nextBlogs = isCreatingBlog
        ? [candidate, ...data.blogs.filter((b) => b.id !== candidate.id)]
        : data.blogs.map((b) => (b.id === candidate.id ? candidate : b));
      if (!isWithinFirestoreDocBudget(nextBlogs)) {
        onShowToast('Adding this section image exceeds the 850 KB cloud budget. Use external URLs or fewer uploads.', 'error');
        return;
      }
      setEditingBlog(candidate);
      onShowToast('Section image uploaded!', 'success');
    } catch (err) {
      onShowToast(err instanceof Error ? err.message : 'Unable to upload section image.', 'error');
    } finally {
      setUploadingBlogSectionIdx(null);
    }
  };

  const handleBlogGalleryFiles = async (fileList: FileList | File[] | null | undefined) => {
    if (!fileList || fileList.length === 0 || !editingBlog) return;
    const { accepted, rejected } = filterSupportedImageFiles(fileList);
    if (rejected.length > 0 && accepted.length === 0) {
      onShowToast(rejected[0].error, 'error');
      return;
    }

    setIsUploadingBlogGallery(true);
    try {
      let workingBlog = editingBlog;
      let addedCount = 0;

      for (const file of accepted) {
        const dataUrl = await processImageFileToDataUrl(file, {
          maxDimension: SERVICE_IMAGE_MAX_DIMENSION,
          maxEncodedLength: 160_000
        });
        const nextImages = [...(workingBlog.images || []), dataUrl];
        const candidate = { ...workingBlog, images: nextImages };
        const nextBlogs = isCreatingBlog
          ? [candidate, ...data.blogs.filter((b) => b.id !== candidate.id)]
          : data.blogs.map((b) => (b.id === candidate.id ? candidate : b));
        if (!isWithinFirestoreDocBudget(nextBlogs)) {
          onShowToast(
            addedCount > 0
              ? `Uploaded ${addedCount} photo(s); remaining file(s) would exceed the 850 KB cloud budget.`
              : 'Adding this gallery photo exceeds the 850 KB cloud budget. Use external URLs or fewer uploads.',
            'error'
          );
          if (addedCount > 0) {
            setEditingBlog(workingBlog);
          }
          return;
        }
        workingBlog = candidate;
        addedCount += 1;
      }

      if (addedCount > 0) {
        setEditingBlog(workingBlog);
        onShowToast(
          addedCount === 1
            ? 'Photo uploaded to article gallery!'
            : `${addedCount} photos uploaded to article gallery!`,
          'success'
        );
      }
      if (rejected.length > 0) {
        onShowToast(rejected[0].error, 'error');
      }
    } catch (err) {
      onShowToast(err instanceof Error ? err.message : 'Unable to upload gallery photo.', 'error');
    } finally {
      setIsUploadingBlogGallery(false);
    }
  };

  // Backup state
  const [importText, setImportText] = useState('');

  // Safe in-app Delete Confirmation state (works in iFrames without window.confirm)
  const [deleteConfirmTarget, setDeleteConfirmTarget] = useState<{
    type: 'service' | 'project' | 'blog' | 'team' | 'testimonial' | 'partnership' | 'partner-logo' | 'faq' | 'reset-defaults';
    id: string;
    title: string;
  } | null>(null);

  const handleExecuteDelete = (target: {
    type: 'service' | 'project' | 'blog' | 'team' | 'testimonial' | 'partnership' | 'partner-logo' | 'faq' | 'reset-defaults';
    id: string;
    title: string;
  }) => {
    switch (target.type) {
      case 'service':
        onDeleteService(target.id);
        onShowToast(`Deleted service: ${target.title}`, 'info');
        break;
      case 'project':
        onDeleteProject(target.id);
        onShowToast(`Deleted project: ${target.title}`, 'info');
        break;
      case 'blog':
        void (async () => {
          const ok = await onDeleteBlog(target.id);
          if (ok !== false) {
            onShowToast(`Deleted article: ${target.title}`, 'info');
          }
        })();
        break;
      case 'team':
        onDeleteTeamMember(target.id);
        onShowToast(`Removed team member: ${target.title}`, 'info');
        break;
      case 'testimonial':
        onDeleteTestimonial(target.id);
        onShowToast(`Deleted review from: ${target.title}`, 'info');
        break;
      case 'partnership':
        onDeletePartnership(target.id);
        onShowToast(`Deleted partnership: ${target.title}`, 'info');
        break;
      case 'partner-logo':
        onDeletePartnerLogo(target.id);
        onShowToast(`Deleted partner logo: ${target.title}`, 'info');
        break;
      case 'faq':
        onDeleteFaq(target.id);
        onShowToast(`Deleted FAQ item`, 'info');
        break;
      case 'reset-defaults':
        onResetDefaults();
        setGeneralForm(data.generalInfo);
        onShowToast('All data reset to factory defaults!', 'info');
        break;
    }
  };

  // Helper to ensure blogs have structured sections
  const ensureBlogSections = normalizeBlogSections;

  if (!isOpen) return null;

  const handleSaveGeneral = (e: React.FormEvent) => {
    e.preventDefault();
    onUpdateGeneral(generalForm);
    onShowToast('Agency general information updated successfully!', 'success');
  };

  return (
    <div
      className="dark-surface"
      style={{
        position: 'fixed',
        top: 0,
        right: 0,
        bottom: 0,
        width: isExpanded ? '92vw' : '580px',
        maxWidth: '100vw',
        background: '#0a0a0a',
        color: '#fafafa',
        boxShadow: '-10px 0 35px rgba(0, 0, 0, 0.75)',
        zIndex: 10001,
        display: 'flex',
        flexDirection: 'column',
        transition: 'width 0.3s ease',
        borderLeft: '1px solid rgba(212, 175, 55, 0.35)'
      }}
    >
      {/* Top Header */}
      <div
        style={{
          padding: '1.25rem 1.5rem',
          background: '#050505',
          borderBottom: '1px solid rgba(212, 175, 55, 0.2)',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center'
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <div
            style={{
              width: '36px',
              height: '36px',
              borderRadius: '8px',
              background: 'var(--gradient-primary)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#0a0a0a'
            }}
          >
            <Settings size={20} />
          </div>
          <div>
            <h2 style={{ fontSize: '1.2rem', margin: 0, color: '#fff', fontWeight: 700 }}>
              Axe's Era Admin Portal
            </h2>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '3px', flexWrap: 'wrap' }}>
              <span
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '5px',
                  fontSize: '0.72rem',
                  fontWeight: 600,
                  color: syncStatus === 'connected' ? '#34d399' : syncStatus === 'syncing' ? '#fbbf24' : '#a3a3a3',
                  background: 'rgba(255, 255, 255, 0.06)',
                  padding: '2px 8px',
                  borderRadius: '9999px',
                  border: '1px solid rgba(255, 255, 255, 0.12)'
                }}
              >
                <span
                  style={{
                    width: '6px',
                    height: '6px',
                    borderRadius: '50%',
                    background: syncStatus === 'connected' ? '#10b981' : syncStatus === 'syncing' ? '#f59e0b' : '#a3a3a3',
                    boxShadow: syncStatus === 'connected' ? '0 0 6px #10b981' : undefined
                  }}
                />
                {syncStatus === 'connected' ? 'Firebase Live Synced' : syncStatus === 'syncing' ? 'Syncing Firestore...' : 'Offline Local Storage'}
              </span>
              <span style={{ fontSize: '0.72rem', color: '#a3a3a3' }}>
                All edits synchronize instantly to public site & cloud
              </span>
            </div>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          {onPublishAll && (
            <button
              onClick={handlePublishAllToCloud}
              disabled={isPublishingAll}
              style={{
                background: isPublishingAll ? 'rgba(16, 185, 129, 0.3)' : 'rgba(16, 185, 129, 0.15)',
                border: '1px solid rgba(16, 185, 129, 0.4)',
                color: '#34d399',
                padding: '6px 12px',
                borderRadius: '6px',
                cursor: isPublishingAll ? 'wait' : 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                fontSize: '0.8rem',
                fontWeight: 600
              }}
              title="Force publish all 9 sections live to Firebase Firestore for all visitors"
            >
              <UploadCloud size={15} />
              <span>{isPublishingAll ? 'Publishing...' : 'Publish to Cloud'}</span>
            </button>
          )}

          <button
            onClick={() => setIsExpanded(!isExpanded)}
            style={{
              background: 'rgba(255, 255, 255, 0.08)',
              border: '1px solid rgba(255, 255, 255, 0.15)',
              color: '#fff',
              padding: '6px 10px',
              borderRadius: '6px',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '4px',
              fontSize: '0.8rem'
            }}
            title={isExpanded ? 'Collapse width' : 'Expand width for deep editing'}
          >
            {isExpanded ? <Minimize2 size={16} /> : <Maximize2 size={16} />}
            <span style={{ display: isExpanded ? 'inline' : 'none' }}>Compact</span>
          </button>

          {onLogout && (
            <button
              onClick={onLogout}
              style={{
                background: 'rgba(239, 68, 68, 0.15)',
                border: '1px solid rgba(239, 68, 68, 0.3)',
                color: '#f87171',
                padding: '6px 10px',
                borderRadius: '6px',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '4px',
                fontSize: '0.85rem',
                fontWeight: 600
              }}
              title="Lock Admin and Exit to Site"
            >
              <LogOut size={16} /> Log Out
            </button>
          )}

          <button
            onClick={onClose}
            style={{
              background: 'rgba(255, 255, 255, 0.08)',
              border: '1px solid rgba(255, 255, 255, 0.15)',
              color: '#e5e5e5',
              padding: '6px 10px',
              borderRadius: '6px',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '4px',
              fontSize: '0.85rem'
            }}
          >
            <X size={18} />
          </button>
        </div>
      </div>

      {/* Tabs Bar */}
      <div
        style={{
          display: 'flex',
          overflowX: 'auto',
          background: '#050505',
          borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
          padding: '0.5rem 0.75rem',
          gap: '6px'
        }}
      >
        {[
          {
            id: 'queries',
            label: queriesUnread > 0 ? `Queries (${queriesUnread})` : 'Queries',
            icon: <Mail size={15} />
          },
          { id: 'general', label: 'General & Hero', icon: <LayoutTemplate size={15} /> },
          { id: 'services', label: `Services (${data.services.length})`, icon: <Briefcase size={15} /> },
          { id: 'projects', label: `Websites (${data.projects.length})`, icon: <FolderGit2 size={15} /> },
          { id: 'blogs', label: `Blogs (${data.blogs.length})`, icon: <BookOpen size={15} /> },
          { id: 'team', label: `Team (${data.team.length})`, icon: <Users size={15} /> },
          { id: 'testimonials', label: `Reviews (${data.testimonials.length})`, icon: <Star size={15} /> },
          { id: 'partnerships', label: 'Partnership Pillars', icon: <Handshake size={15} /> },
          { id: 'partner-logos', label: `Partner Logos (${data.partnerLogos.length})`, icon: <ImageIcon size={15} /> },
          { id: 'faqs', label: `FAQs (${data.faqs.length})`, icon: <HelpCircle size={15} /> },
          { id: 'backup', label: 'Backup / Reset', icon: <Database size={15} /> }
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => {
              setActiveTab(tab.id as AdminTab);
              setEditingService(null);
              setIsCreatingService(false);
              setEditingProject(null);
              setIsCreatingProject(false);
              setEditingBlog(null);
              setIsCreatingBlog(false);
              setEditingTeamMember(null);
              setIsCreatingTeamMember(false);
              setEditingTestimonial(null);
              setIsCreatingTestimonial(false);
              setEditingFaq(null);
              setIsCreatingFaq(false);
              setEditingPartnership(null);
              setIsCreatingPartnership(false);
              setEditingPartnerLogo(null);
              setIsCreatingPartnerLogo(false);
            }}
            style={{
              padding: '8px 12px',
              borderRadius: '6px',
              border: 'none',
              background: activeTab === tab.id ? 'var(--primary-color)' : 'transparent',
              color: activeTab === tab.id ? '#0a0a0a' : 'var(--text-light)',
              fontWeight: 600,
              fontSize: '0.8rem',
              cursor: 'pointer',
              whiteSpace: 'nowrap',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              transition: 'all 0.2s'
            }}
          >
            {tab.icon} {tab.label}
          </button>
        ))}
      </div>

      {/* Main Tab Content Body */}
      <div
        style={{
          flex: 1,
          overflowY: 'auto',
          padding: '1.5rem',
          background: '#0a0a0a'
        }}
      >
        <div style={{ display: activeTab === 'queries' ? 'block' : 'none' }}>
          <QueriesPanel
            onShowToast={onShowToast}
            onUnauthorized={onUnauthorized}
            onUnreadCountChange={setQueriesUnread}
          />
        </div>

        {/* TAB 1: GENERAL & HERO */}
        {activeTab === 'general' && (
          <form onSubmit={handleSaveGeneral}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
              <h3 style={{ margin: 0, color: 'var(--primary-color)', fontSize: '1.15rem' }}>
                Agency Identity & Core Copy
              </h3>
              <button
                type="submit"
                className="btn btn-primary"
                style={{ padding: '8px 18px', fontSize: '0.85rem' }}
              >
                <Save size={16} /> Save Changes
              </button>
            </div>

            <div style={{ marginBottom: '1.25rem' }}>
              <label style={{ display: 'block', fontSize: '0.85rem', color: 'var(--text-light)', marginBottom: '4px' }}>
                Hero Main Headline
              </label>
              <input
                type="text"
                value={generalForm.heroTitle}
                onChange={(e) => setGeneralForm({ ...generalForm, heroTitle: e.target.value })}
                style={{ width: '100%', padding: '10px 14px', borderRadius: '8px', background: '#1c1c1c', border: '1px solid #2e2e2e', color: '#fff' }}
                required
              />
            </div>

            <div style={{ marginBottom: '1.25rem' }}>
              <label style={{ display: 'block', fontSize: '0.85rem', color: 'var(--text-light)', marginBottom: '4px' }}>
                Hero Subtitle & Pitch
              </label>
              <textarea
                rows={3}
                value={generalForm.heroSubtitle}
                onChange={(e) => setGeneralForm({ ...generalForm, heroSubtitle: e.target.value })}
                style={{ width: '100%', padding: '10px 14px', borderRadius: '8px', background: '#1c1c1c', border: '1px solid #2e2e2e', color: '#fff' }}
                required
              />
            </div>

            <hr style={{ borderColor: 'rgba(255, 255, 255, 0.1)', margin: '1.5rem 0' }} />

            <h4 style={{ color: '#fff', fontSize: '1rem', marginBottom: '1rem' }}>
              Statistics Counters
            </h4>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(110px, 1fr))', gap: '10px', marginBottom: '1.5rem' }}>
              <div>
                <label style={{ fontSize: '0.75rem', color: 'var(--text-light)', display: 'block' }}>Years Exp</label>
                <input
                  type="number"
                  value={generalForm.stats.years}
                  onChange={(e) => setGeneralForm({ ...generalForm, stats: { ...generalForm.stats, years: parseInt(e.target.value) || 0 } })}
                  style={{ width: '100%', padding: '8px', borderRadius: '6px', background: '#1c1c1c', border: '1px solid #2e2e2e', color: '#fff' }}
                />
              </div>
              <div>
                <label style={{ fontSize: '0.75rem', color: 'var(--text-light)', display: 'block' }}>Digital Experts</label>
                <input
                  type="number"
                  value={generalForm.stats.experts}
                  onChange={(e) => setGeneralForm({ ...generalForm, stats: { ...generalForm.stats, experts: parseInt(e.target.value) || 0 } })}
                  style={{ width: '100%', padding: '8px', borderRadius: '6px', background: '#1c1c1c', border: '1px solid #2e2e2e', color: '#fff' }}
                />
              </div>
              <div>
                <label style={{ fontSize: '0.75rem', color: 'var(--text-light)', display: 'block' }}>Projects (e.g. 10)</label>
                <input
                  type="number"
                  value={generalForm.stats.projects}
                  onChange={(e) => setGeneralForm({ ...generalForm, stats: { ...generalForm.stats, projects: parseInt(e.target.value) || 0 } })}
                  style={{ width: '100%', padding: '8px', borderRadius: '6px', background: '#1c1c1c', border: '1px solid #2e2e2e', color: '#fff' }}
                />
              </div>
              <div>
                <label style={{ fontSize: '0.75rem', color: 'var(--text-light)', display: 'block' }}>Retention %</label>
                <input
                  type="number"
                  value={generalForm.stats.retention}
                  onChange={(e) => setGeneralForm({ ...generalForm, stats: { ...generalForm.stats, retention: parseInt(e.target.value) || 0 } })}
                  style={{ width: '100%', padding: '8px', borderRadius: '6px', background: '#1c1c1c', border: '1px solid #2e2e2e', color: '#fff' }}
                />
              </div>
            </div>

            <hr style={{ borderColor: 'rgba(255, 255, 255, 0.1)', margin: '1.5rem 0' }} />

            <h4 style={{ color: '#fff', fontSize: '1rem', marginBottom: '1rem' }}>
              About Section Story & Image
            </h4>
            <div style={{ marginBottom: '1.25rem' }}>
              <label style={{ display: 'block', fontSize: '0.85rem', color: 'var(--text-light)', marginBottom: '4px' }}>
                About Title
              </label>
              <input
                type="text"
                value={generalForm.aboutTitle}
                onChange={(e) => setGeneralForm({ ...generalForm, aboutTitle: e.target.value })}
                style={{ width: '100%', padding: '10px 14px', borderRadius: '8px', background: '#1c1c1c', border: '1px solid #2e2e2e', color: '#fff' }}
              />
            </div>
            <div style={{ marginBottom: '1.25rem' }}>
              <label style={{ display: 'block', fontSize: '0.85rem', color: 'var(--text-light)', marginBottom: '4px' }}>
                About Paragraph 1
              </label>
              <textarea
                rows={3}
                value={generalForm.aboutParagraph1}
                onChange={(e) => setGeneralForm({ ...generalForm, aboutParagraph1: e.target.value })}
                style={{ width: '100%', padding: '10px 14px', borderRadius: '8px', background: '#1c1c1c', border: '1px solid #2e2e2e', color: '#fff' }}
              />
            </div>
            <div style={{ marginBottom: '1.25rem' }}>
              <label style={{ display: 'block', fontSize: '0.85rem', color: 'var(--text-light)', marginBottom: '4px' }}>
                About Paragraph 2
              </label>
              <textarea
                rows={2}
                value={generalForm.aboutParagraph2}
                onChange={(e) => setGeneralForm({ ...generalForm, aboutParagraph2: e.target.value })}
                style={{ width: '100%', padding: '10px 14px', borderRadius: '8px', background: '#1c1c1c', border: '1px solid #2e2e2e', color: '#fff' }}
              />
            </div>
            <div style={{ marginBottom: '1.25rem' }}>
              <label style={{ display: 'block', fontSize: '0.85rem', color: 'var(--text-light)', marginBottom: '4px' }}>
                About Showcase Image URL
              </label>
              <input
                type="text"
                value={generalForm.aboutImageUrl}
                onChange={(e) => setGeneralForm({ ...generalForm, aboutImageUrl: e.target.value })}
                style={{ width: '100%', padding: '10px 14px', borderRadius: '8px', background: '#1c1c1c', border: '1px solid #2e2e2e', color: '#fff' }}
              />
            </div>

            <hr style={{ borderColor: 'rgba(255, 255, 255, 0.1)', margin: '1.5rem 0' }} />

            <h4 style={{ color: '#fff', fontSize: '1rem', marginBottom: '1rem' }}>
              Contact Details & Direct WhatsApp
            </h4>
            <div style={{ marginBottom: '1.25rem' }}>
              <label style={{ display: 'block', fontSize: '0.85rem', color: 'var(--text-light)', marginBottom: '4px' }}>
                Office Address
              </label>
              <input
                type="text"
                value={generalForm.contactAddress}
                onChange={(e) => setGeneralForm({ ...generalForm, contactAddress: e.target.value })}
                style={{ width: '100%', padding: '10px 14px', borderRadius: '8px', background: '#1c1c1c', border: '1px solid #2e2e2e', color: '#fff' }}
              />
            </div>
            <div style={{ marginBottom: '1.25rem' }}>
              <label style={{ display: 'block', fontSize: '0.85rem', color: 'var(--text-light)', marginBottom: '4px' }}>
                Phone Numbers
              </label>
              <input
                type="text"
                value={generalForm.contactPhone}
                onChange={(e) => setGeneralForm({ ...generalForm, contactPhone: e.target.value })}
                style={{ width: '100%', padding: '10px 14px', borderRadius: '8px', background: '#1c1c1c', border: '1px solid #2e2e2e', color: '#fff' }}
              />
            </div>
            <div style={{ marginBottom: '1.25rem' }}>
              <label style={{ display: 'block', fontSize: '0.85rem', color: 'var(--text-light)', marginBottom: '4px' }}>
                Official Email
              </label>
              <input
                type="email"
                value={generalForm.contactEmail}
                onChange={(e) => setGeneralForm({ ...generalForm, contactEmail: e.target.value })}
                style={{ width: '100%', padding: '10px 14px', borderRadius: '8px', background: '#1c1c1c', border: '1px solid #2e2e2e', color: '#fff' }}
              />
            </div>
            <div style={{ marginBottom: '1.25rem' }}>
              <label style={{ display: 'block', fontSize: '0.85rem', color: 'var(--text-light)', marginBottom: '4px' }}>
                WhatsApp Direct Number (digits only, e.g. 923157338694)
              </label>
              <input
                type="text"
                value={generalForm.whatsappNumber}
                onChange={(e) => setGeneralForm({ ...generalForm, whatsappNumber: e.target.value })}
                style={{ width: '100%', padding: '10px 14px', borderRadius: '8px', background: '#1c1c1c', border: '1px solid #2e2e2e', color: '#fff' }}
              />
            </div>
            <div style={{ marginBottom: '1.5rem' }}>
              <label style={{ display: 'block', fontSize: '0.85rem', color: 'var(--text-light)', marginBottom: '4px' }}>
                Urgent Response Banner Note
              </label>
              <textarea
                rows={2}
                value={generalForm.urgentNotice}
                onChange={(e) => setGeneralForm({ ...generalForm, urgentNotice: e.target.value })}
                style={{ width: '100%', padding: '10px 14px', borderRadius: '8px', background: '#1c1c1c', border: '1px solid #2e2e2e', color: '#fff' }}
              />
            </div>

            <button type="submit" className="btn btn-primary" style={{ width: '100%', padding: '12px' }}>
              <Check size={18} /> Apply General Info Changes
            </button>
          </form>
        )}

        {/* TAB 2: SERVICES */}
        {activeTab === 'services' && (
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
              <div>
                <h3 style={{ margin: 0, color: 'var(--primary-color)', fontSize: '1.15rem' }}>
                  Manage Services
                </h3>
                <p style={{ margin: 0, color: 'var(--text-light)', fontSize: '0.8rem' }}>
                  Add, update, or reorganize agency services
                </p>
              </div>
              {!isCreatingService && !editingService && (
                <button
                  onClick={() => {
                    setIsCreatingService(true);
                    setEditingService({
                      id: `service-${Date.now()}`,
                      title: '',
                      slug: 'web-development',
                      shortDesc: '',
                      icon: 'Laptop',
                      imageUrl: '',
                      features: ['Custom Solutions', 'Fast Delivery'],
                      fullDesc: ''
                    });
                  }}
                  className="btn btn-primary"
                  style={{ padding: '6px 14px', fontSize: '0.8rem' }}
                >
                  <Plus size={16} /> Add Service
                </button>
              )}
            </div>

            {/* Service Form */}
            {(isCreatingService || editingService) && (
              <div style={{ background: '#141414', padding: '1.25rem', borderRadius: '10px', marginBottom: '1.5rem', border: '1px solid var(--primary-color)' }}>
                <h4 style={{ color: '#fff', marginBottom: '1rem', fontSize: '1rem' }}>
                  {isCreatingService ? 'Add New Service' : `Edit: ${editingService?.title}`}
                </h4>
                <div style={{ marginBottom: '1rem' }}>
                  <label style={{ display: 'block', fontSize: '0.8rem', color: 'var(--text-light)', marginBottom: '4px' }}>
                    Service Title
                  </label>
                  <input
                    type="text"
                    value={editingService?.title || ''}
                    onChange={(e) => setEditingService(editingService ? { ...editingService, title: e.target.value } : null)}
                    style={{ width: '100%', padding: '8px 12px', borderRadius: '6px', background: '#1c1c1c', border: '1px solid #2e2e2e', color: '#fff' }}
                  />
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', marginBottom: '1rem' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.8rem', color: 'var(--text-light)', marginBottom: '4px' }}>
                      Slug
                    </label>
                    <select
                      value={editingService?.slug || 'web-development'}
                      onChange={(e) => setEditingService(editingService ? { ...editingService, slug: e.target.value } : null)}
                      style={{ width: '100%', padding: '8px 12px', borderRadius: '6px', background: '#1c1c1c', border: '1px solid #2e2e2e', color: '#fff' }}
                    >
                      <option value="web-development">web-development</option>
                      <option value="brand-design">brand-design</option>
                      <option value="digital-marketing">digital-marketing</option>
                      <option value="mobile-apps">mobile-apps</option>
                    </select>
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.8rem', color: 'var(--text-light)', marginBottom: '4px' }}>
                      Icon
                    </label>
                    <select
                      value={editingService?.icon || 'Laptop'}
                      onChange={(e) => setEditingService(editingService ? { ...editingService, icon: e.target.value } : null)}
                      style={{ width: '100%', padding: '8px 12px', borderRadius: '6px', background: '#1c1c1c', border: '1px solid #2e2e2e', color: '#fff' }}
                    >
                      <option value="Laptop">Laptop (Code/Web)</option>
                      <option value="Palette">Palette (Brand/Design)</option>
                      <option value="TrendingUp">TrendingUp (Marketing/SEO)</option>
                      <option value="Smartphone">Smartphone (Mobile)</option>
                      <option value="Search">Search (SEO)</option>
                      <option value="Megaphone">Megaphone (Social Media)</option>
                      <option value="Box">Box (Digital Products)</option>
                    </select>
                  </div>
                </div>

                <div style={{ marginBottom: '1rem' }}>
                  <label style={{ display: 'block', fontSize: '0.8rem', color: 'var(--text-light)', marginBottom: '4px' }}>
                    Short Summary (Card Preview)
                  </label>
                  <textarea
                    rows={2}
                    value={editingService?.shortDesc || ''}
                    onChange={(e) => setEditingService(editingService ? { ...editingService, shortDesc: e.target.value } : null)}
                    style={{ width: '100%', padding: '8px 12px', borderRadius: '6px', background: '#1c1c1c', border: '1px solid #2e2e2e', color: '#fff' }}
                  />
                </div>

                <ImageUploadField
                  id="service-cover-image"
                  label="Service Image (Optional)"
                  value={editingService?.imageUrl || ''}
                  onChange={(nextUrl) =>
                    setEditingService(
                      editingService ? { ...editingService, imageUrl: nextUrl } : null
                    )
                  }
                  onError={(msg) => onShowToast(msg, 'error')}
                  shape="rounded"
                  previewFallbackText={deriveInitials(editingService?.title || 'Service')}
                  maxDimension={SERVICE_IMAGE_MAX_DIMENSION}
                  urlPlaceholder="https://example.com/service-cover.jpg"
                  helperText="Upload an optional service image from your device or paste an image URL. Leave empty to display the service icon."
                  uploadButtonLabel="Upload Service Image"
                />

                <div style={{ marginBottom: '1rem' }}>
                  <label style={{ display: 'block', fontSize: '0.8rem', color: 'var(--text-light)', marginBottom: '4px' }}>
                    Features & Deliverables (Comma-separated)
                  </label>
                  <input
                    type="text"
                    value={editingService?.features?.join(', ') || ''}
                    onChange={(e) => {
                      const feats = e.target.value.split(',').map((f) => f.trim()).filter(Boolean);
                      setEditingService(editingService ? { ...editingService, features: feats } : null);
                    }}
                    style={{ width: '100%', padding: '8px 12px', borderRadius: '6px', background: '#1c1c1c', border: '1px solid #2e2e2e', color: '#fff' }}
                  />
                </div>

                <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
                  <button
                    type="button"
                    onClick={() => {
                      setEditingService(null);
                      setIsCreatingService(false);
                    }}
                    className="btn btn-outline"
                    style={{ padding: '6px 14px', fontSize: '0.85rem' }}
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      if (!editingService?.title.trim()) {
                        onShowToast('Please enter a service title', 'error');
                        return;
                      }
                      const sanitizedService: ServiceItem = {
                        ...editingService,
                        title: editingService.title.trim(),
                        shortDesc: editingService.shortDesc.trim(),
                        imageUrl: sanitizeDisplayImageUrl(editingService.imageUrl)
                      };
                      const nextServicesPreview = isCreatingService
                        ? [...data.services.filter((s) => s.id !== sanitizedService.id), sanitizedService]
                        : data.services.map((s) => (s.id === sanitizedService.id ? sanitizedService : s));
                      if (!isWithinFirestoreDocBudget(nextServicesPreview)) {
                        onShowToast('Services storage limit reached. Please use smaller images or external URLs.', 'error');
                        return;
                      }
                      if (isCreatingService) {
                        onAddService(sanitizedService);
                        onShowToast('New service added successfully!', 'success');
                      } else {
                        onUpdateService(sanitizedService);
                        onShowToast('Service updated successfully!', 'success');
                      }
                      setEditingService(null);
                      setIsCreatingService(false);
                    }}
                    className="btn btn-primary"
                    style={{ padding: '6px 16px', fontSize: '0.85rem' }}
                  >
                    <Save size={14} /> Save Service
                  </button>
                </div>
              </div>
            )}

            {/* List */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {data.services.map((svc) => (
                <div
                  key={svc.id}
                  style={{
                    background: '#141414',
                    padding: '1rem',
                    borderRadius: '8px',
                    border: '1px solid rgba(255, 255, 255, 0.08)',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center'
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    {sanitizeDisplayImageUrl(svc.imageUrl) ? (
                      <img
                        src={sanitizeDisplayImageUrl(svc.imageUrl)}
                        alt={svc.title}
                        style={{
                          width: '54px',
                          height: '42px',
                          objectFit: 'cover',
                          borderRadius: '6px',
                          border: '1px solid rgba(212, 175, 55, 0.35)',
                          flexShrink: 0
                        }}
                      />
                    ) : (
                      <div
                        style={{
                          width: '42px',
                          height: '42px',
                          borderRadius: '8px',
                          background: '#0a0a0a',
                          border: '1px solid rgba(212, 175, 55, 0.35)',
                          color: 'var(--primary-color)',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          flexShrink: 0
                        }}
                      >
                        <Briefcase size={16} />
                      </div>
                    )}
                    <div>
                      <h4 style={{ margin: '0 0 4px', color: '#fff', fontSize: '0.95rem' }}>{svc.title}</h4>
                      <p style={{ margin: 0, fontSize: '0.8rem', color: 'var(--text-light)', maxWidth: '340px' }}>
                        {svc.shortDesc}
                      </p>
                    </div>
                  </div>
                  <div style={{ display: 'flex', gap: '6px' }}>
                    <button
                      onClick={() => {
                        setEditingService(svc);
                        setIsCreatingService(false);
                      }}
                      style={{
                        background: 'rgba(212, 175, 55, 0.15)',
                        border: '1px solid rgba(212, 175, 55, 0.3)',
                        color: 'var(--primary-color)',
                        padding: '6px',
                        borderRadius: '6px',
                        cursor: 'pointer'
                      }}
                      title="Edit Service"
                    >
                      <Edit2 size={16} />
                    </button>
                    <button
                      onClick={() => setDeleteConfirmTarget({ type: 'service', id: svc.id, title: svc.title })}
                      style={{
                        background: 'rgba(239, 68, 68, 0.15)',
                        border: '1px solid rgba(239, 68, 68, 0.3)',
                        color: '#f87171',
                        padding: '6px',
                        borderRadius: '6px',
                        cursor: 'pointer'
                      }}
                      title="Delete Service"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TAB 3: WEBSITES, CASE STUDIES & DIGITAL PRODUCTS */}
        {activeTab === 'projects' && (() => {
          const projectStorageBytes = estimateJsonSectionBytes(data.projects);
          const storagePct = Math.min(100, Math.round((projectStorageBytes / FIRESTORE_SAFE_SECTION_BYTES) * 100));
          const caseStudyTotal = data.projects.filter((p) => resolveProjectType(p) === 'case-study').length;
          const productTotal = data.projects.filter((p) => resolveProjectType(p) === 'digital-product').length;
          const filteredProjectsList = filterAdminProjects(data.projects, {
            query: projectSearch,
            typeFilter: projectTypeFilter
          });
          const canReorder = Boolean(onReorderProjects) && !projectSearch.trim() && projectTypeFilter === 'all';

          const resetProjectScratchInputs = () => {
            setNewProjectFeature('');
            setNewProjectDeliverable('');
            setNewProjectArchHighlight('');
            setNewOutcomeValue('');
            setNewOutcomeLabel('');
            setNewProjectGalleryUrl('');
          };

          const openProjectForCreate = () => {
            const now = Date.now();
            setIsCreatingProject(true);
            setEditingProject({
              id: `project-${now}`,
              slug: `website-${String(now).slice(-6)}`,
              title: '',
              subtitle: '',
              category: 'ecommerce',
              projectType: 'case-study',
              status: 'live',
              featured: false,
              metric: '+100% Growth',
              link: 'https://',
              demoUrl: '',
              imageUrl: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&w=1200&q=80',
              galleryImages: [],
              description: '',
              overview: '',
              clientName: '',
              industry: '',
              timeline: '6 Weeks Sprint',
              role: 'Architecture, UI/UX Design & Full-Stack Engineering',
              pricingModel: 'Bespoke Enterprise Build',
              challenge: '',
              solution: '',
              keyFeatures: ['Responsive High-Conversion UI', 'Sub-Second Edge Performance'],
              deliverables: ['Design System & Frontend Architecture', 'Production Launch & 30-Day Hypercare'],
              architectureHighlights: ['TypeScript + React Modular Architecture', 'Global CDN Caching'],
              outcomes: [{ value: '+100%', label: 'Primary Growth Target' }],
              tags: ['React', 'TypeScript']
            });
            resetProjectScratchInputs();
          };

          const openProjectForEdit = (proj: Project) => {
            const resolved = resolveProjectDetails(proj);
            setIsCreatingProject(false);
            setEditingProject({
              ...proj,
              slug: proj.slug || resolved.slug,
              projectType: proj.projectType || resolved.projectType,
              status: proj.status || resolved.status,
              featured: Boolean(proj.featured),
              demoUrl: proj.demoUrl || '',
              clientName: proj.clientName ?? resolved.clientName,
              industry: proj.industry ?? resolved.industry,
              timeline: proj.timeline ?? resolved.timeline,
              role: proj.role ?? resolved.role,
              pricingModel: proj.pricingModel ?? resolved.pricingModel,
              overview: proj.overview ?? resolved.overview,
              challenge: proj.challenge ?? resolved.challenge,
              solution: proj.solution ?? resolved.solution,
              keyFeatures: proj.keyFeatures ? [...proj.keyFeatures] : [...resolved.keyFeatures],
              deliverables: proj.deliverables ? [...proj.deliverables] : [...resolved.deliverables],
              architectureHighlights: proj.architectureHighlights
                ? [...proj.architectureHighlights]
                : [...resolved.architectureHighlights],
              outcomes: proj.outcomes ? proj.outcomes.map((o) => ({ ...o })) : resolved.outcomes.map((o) => ({ ...o })),
              galleryImages: Array.isArray(proj.galleryImages) ? [...proj.galleryImages] : []
            });
            resetProjectScratchInputs();
          };

          const handleUploadGalleryFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
            const file = e.target.files?.[0];
            e.target.value = '';
            if (!file || !editingProject) return;
            setIsUploadingProjectGallery(true);
            try {
              const dataUrl = await processImageFileToDataUrl(file, {
                maxDimension: PROJECT_IMAGE_MAX_DIMENSION
              });
              const nextGallery = [...(editingProject.galleryImages || []), dataUrl];
              const candidateProject = { ...editingProject, galleryImages: nextGallery };
              const nextPreview = isCreatingProject
                ? [candidateProject, ...data.projects.filter((p) => p.id !== candidateProject.id)]
                : data.projects.map((p) => (p.id === candidateProject.id ? candidateProject : p));
              if (!isWithinFirestoreDocBudget(nextPreview)) {
                onShowToast('Adding this screenshot exceeds the 850 KB cloud budget. Use external URLs or fewer uploads.', 'error');
                return;
              }
              setEditingProject(candidateProject);
              onShowToast('Screenshot added to gallery.', 'success');
            } catch (err) {
              onShowToast(err instanceof Error ? err.message : 'Unable to upload gallery image.', 'error');
            } finally {
              setIsUploadingProjectGallery(false);
            }
          };

          return (
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem', flexWrap: 'wrap', gap: '10px' }}>
                <div>
                  <h3 style={{ margin: 0, color: 'var(--primary-color)', fontSize: '1.15rem' }}>
                    Manage Websites, Case Studies & Digital Products
                  </h3>
                  <p style={{ margin: '2px 0 0', color: 'var(--text-light)', fontSize: '0.8rem' }}>
                    Full portfolio builds, case study narratives, KPI outcomes & SaaS product specifications
                  </p>
                </div>
                {!isCreatingProject && !editingProject && (
                  <button
                    type="button"
                    onClick={openProjectForCreate}
                    className="btn btn-primary"
                    style={{ padding: '7px 14px', fontSize: '0.8rem' }}
                  >
                    <Plus size={16} /> Add Website / Product
                  </button>
                )}
              </div>

              {/* Firestore Storage Meter */}
              <div
                style={{
                  background: '#141414',
                  border: '1px solid rgba(255,255,255,0.08)',
                  borderRadius: '8px',
                  padding: '0.65rem 0.9rem',
                  marginBottom: '1.15rem'
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.74rem', color: '#a3a3a3', marginBottom: '5px' }}>
                  <span>Cloud Document Budget (Websites & Media)</span>
                  <span style={{ color: storagePct > 90 ? '#f87171' : storagePct > 75 ? '#fbbf24' : '#34d399', fontWeight: 700 }}>
                    {Math.round(projectStorageBytes / 1024)} KB / {Math.round(FIRESTORE_SAFE_SECTION_BYTES / 1024)} KB ({storagePct}%)
                  </span>
                </div>
                <div style={{ height: '6px', borderRadius: '9999px', background: '#262626', overflow: 'hidden' }}>
                  <div
                    style={{
                      width: `${storagePct}%`,
                      height: '100%',
                      background: storagePct > 90 ? '#ef4444' : storagePct > 75 ? '#f59e0b' : 'var(--primary-color)',
                      transition: 'width 0.25s ease'
                    }}
                  />
                </div>
              </div>

              {/* Rich Add / Edit Website, Case Study & Digital Product Form */}
              {(isCreatingProject || editingProject) && editingProject && (
                <div style={{ background: '#141414', padding: '1.25rem', borderRadius: '10px', marginBottom: '1.5rem', border: '1px solid var(--primary-color)' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem', flexWrap: 'wrap', gap: '8px' }}>
                    <h4 style={{ color: '#fff', margin: 0, fontSize: '1rem' }}>
                      {isCreatingProject ? 'Add Website / Case Study / Digital Product' : `Edit: ${editingProject.title}`}
                    </h4>
                    <label
                      style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '6px',
                        padding: '4px 10px',
                        borderRadius: '9999px',
                        background: editingProject.featured ? 'rgba(212, 175, 55, 0.2)' : 'rgba(255,255,255,0.06)',
                        border: editingProject.featured ? '1px solid var(--primary-color)' : '1px solid #333',
                        color: editingProject.featured ? 'var(--primary-color)' : '#d4d4d4',
                        fontSize: '0.78rem',
                        fontWeight: 600,
                        cursor: 'pointer'
                      }}
                    >
                      <input
                        type="checkbox"
                        checked={Boolean(editingProject.featured)}
                        onChange={(e) => setEditingProject({ ...editingProject, featured: e.target.checked })}
                      />
                      Featured Flagship
                    </label>
                  </div>

                  {/* Row 1: Title & Slug */}
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(210px, 1fr))', gap: '10px', marginBottom: '0.9rem' }}>
                    <div>
                      <label style={{ display: 'block', fontSize: '0.78rem', color: 'var(--text-light)', marginBottom: '4px' }}>
                        Project / Product Title *
                      </label>
                      <input
                        type="text"
                        value={editingProject.title}
                        onChange={(e) => setEditingProject({ ...editingProject, title: e.target.value })}
                        placeholder="e.g. EstateCRM Real Estate SaaS"
                        style={{ width: '100%', padding: '8px 12px', borderRadius: '6px', background: '#1c1c1c', border: '1px solid #2e2e2e', color: '#fff' }}
                      />
                    </div>
                    <div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
                        <label style={{ fontSize: '0.78rem', color: 'var(--text-light)' }}>
                          URL Slug (/#case-study-...)
                        </label>
                        <button
                          type="button"
                          onClick={() =>
                            setEditingProject({
                              ...editingProject,
                              slug: slugifyProjectTitle(editingProject.title)
                            })
                          }
                          style={{ background: 'none', border: 'none', color: 'var(--primary-color)', fontSize: '0.72rem', fontWeight: 700, cursor: 'pointer', padding: 0 }}
                        >
                          Generate from Title
                        </button>
                      </div>
                      <input
                        type="text"
                        value={editingProject.slug || ''}
                        onChange={(e) => setEditingProject({ ...editingProject, slug: e.target.value })}
                        placeholder="estate-crm"
                        style={{ width: '100%', padding: '8px 12px', borderRadius: '6px', background: '#1c1c1c', border: '1px solid #2e2e2e', color: '#fff' }}
                      />
                    </div>
                  </div>

                  {/* Row 2: Track Type, Category, Deployment Status */}
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: '10px', marginBottom: '0.9rem' }}>
                    <div>
                      <label style={{ display: 'block', fontSize: '0.78rem', color: 'var(--text-light)', marginBottom: '4px' }}>
                        Showcase Track
                      </label>
                      <select
                        value={editingProject.projectType || resolveProjectType(editingProject)}
                        onChange={(e) => setEditingProject({ ...editingProject, projectType: e.target.value as ProjectType })}
                        style={{ width: '100%', padding: '8px 12px', borderRadius: '6px', background: '#1c1c1c', border: '1px solid #2e2e2e', color: '#fff' }}
                      >
                        <option value="case-study">Client Case Study</option>
                        <option value="digital-product">Digital Product / SaaS</option>
                      </select>
                    </div>
                    <div>
                      <label style={{ display: 'block', fontSize: '0.78rem', color: 'var(--text-light)', marginBottom: '4px' }}>
                        Category
                      </label>
                      <select
                        value={editingProject.category}
                        onChange={(e) => setEditingProject({ ...editingProject, category: e.target.value as Project['category'] })}
                        style={{ width: '100%', padding: '8px 12px', borderRadius: '6px', background: '#1c1c1c', border: '1px solid #2e2e2e', color: '#fff' }}
                      >
                        <option value="ecommerce">E-Commerce</option>
                        <option value="saas">SaaS & Analytics</option>
                        <option value="web">Marketplace / Web Apps</option>
                      </select>
                    </div>
                    <div>
                      <label style={{ display: 'block', fontSize: '0.78rem', color: 'var(--text-light)', marginBottom: '4px' }}>
                        Release Status
                      </label>
                      <select
                        value={editingProject.status || resolveProjectStatus(editingProject.status)}
                        onChange={(e) => setEditingProject({ ...editingProject, status: e.target.value as ProjectStatus })}
                        style={{ width: '100%', padding: '8px 12px', borderRadius: '6px', background: '#1c1c1c', border: '1px solid #2e2e2e', color: '#fff' }}
                      >
                        <option value="live">Live Production</option>
                        <option value="beta">Public Beta</option>
                        <option value="in-development">In Development</option>
                        <option value="archived">Archived</option>
                      </select>
                    </div>
                  </div>

                  {/* Row 3: Subtitle & Headline ROI Metric */}
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(210px, 1fr))', gap: '10px', marginBottom: '0.9rem' }}>
                    <div>
                      <label style={{ display: 'block', fontSize: '0.78rem', color: 'var(--text-light)', marginBottom: '4px' }}>
                        Subtitle
                      </label>
                      <input
                        type="text"
                        value={editingProject.subtitle}
                        onChange={(e) => setEditingProject({ ...editingProject, subtitle: e.target.value })}
                        placeholder="Real Estate Operations & CRM Suite"
                        style={{ width: '100%', padding: '8px 12px', borderRadius: '6px', background: '#1c1c1c', border: '1px solid #2e2e2e', color: '#fff' }}
                      />
                    </div>
                    <div>
                      <label style={{ display: 'block', fontSize: '0.78rem', color: 'var(--text-light)', marginBottom: '4px' }}>
                        Headline ROI / KPI Badge
                      </label>
                      <input
                        type="text"
                        value={editingProject.metric}
                        onChange={(e) => setEditingProject({ ...editingProject, metric: e.target.value })}
                        placeholder="+240% Qualified Leads"
                        style={{ width: '100%', padding: '8px 12px', borderRadius: '6px', background: '#1c1c1c', border: '1px solid #2e2e2e', color: '#fff' }}
                      />
                    </div>
                  </div>

                  {/* Row 4: Client, Industry, Timeline, Pricing/Licensing, Role */}
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(170px, 1fr))', gap: '10px', marginBottom: '0.9rem' }}>
                    <div>
                      <label style={{ display: 'block', fontSize: '0.78rem', color: 'var(--text-light)', marginBottom: '4px' }}>
                        Client / Division
                      </label>
                      <input
                        type="text"
                        value={editingProject.clientName || ''}
                        onChange={(e) => setEditingProject({ ...editingProject, clientName: e.target.value })}
                        placeholder="Global Trade Enterprises"
                        style={{ width: '100%', padding: '8px 12px', borderRadius: '6px', background: '#1c1c1c', border: '1px solid #2e2e2e', color: '#fff' }}
                      />
                    </div>
                    <div>
                      <label style={{ display: 'block', fontSize: '0.78rem', color: 'var(--text-light)', marginBottom: '4px' }}>
                        Industry Vertical
                      </label>
                      <input
                        type="text"
                        value={editingProject.industry || ''}
                        onChange={(e) => setEditingProject({ ...editingProject, industry: e.target.value })}
                        placeholder="PropTech & Brokerage CRM"
                        style={{ width: '100%', padding: '8px 12px', borderRadius: '6px', background: '#1c1c1c', border: '1px solid #2e2e2e', color: '#fff' }}
                      />
                    </div>
                    <div>
                      <label style={{ display: 'block', fontSize: '0.78rem', color: 'var(--text-light)', marginBottom: '4px' }}>
                        Delivery Timeline
                      </label>
                      <input
                        type="text"
                        value={editingProject.timeline || ''}
                        onChange={(e) => setEditingProject({ ...editingProject, timeline: e.target.value })}
                        placeholder="8 Weeks Sprint"
                        style={{ width: '100%', padding: '8px 12px', borderRadius: '6px', background: '#1c1c1c', border: '1px solid #2e2e2e', color: '#fff' }}
                      />
                    </div>
                    <div>
                      <label style={{ display: 'block', fontSize: '0.78rem', color: 'var(--text-light)', marginBottom: '4px' }}>
                        Engagement / Pricing Model
                      </label>
                      <input
                        type="text"
                        value={editingProject.pricingModel || ''}
                        onChange={(e) => setEditingProject({ ...editingProject, pricingModel: e.target.value })}
                        placeholder="SaaS Licensing / Custom Build"
                        style={{ width: '100%', padding: '8px 12px', borderRadius: '6px', background: '#1c1c1c', border: '1px solid #2e2e2e', color: '#fff' }}
                      />
                    </div>
                  </div>

                  <div style={{ marginBottom: '0.9rem' }}>
                    <label style={{ display: 'block', fontSize: '0.78rem', color: 'var(--text-light)', marginBottom: '4px' }}>
                      Agency Role & Scope
                    </label>
                    <input
                      type="text"
                      value={editingProject.role || ''}
                      onChange={(e) => setEditingProject({ ...editingProject, role: e.target.value })}
                      placeholder="Architecture, UI/UX Design & Full-Stack Engineering"
                      style={{ width: '100%', padding: '8px 12px', borderRadius: '6px', background: '#1c1c1c', border: '1px solid #2e2e2e', color: '#fff' }}
                    />
                  </div>

                  {/* Row 5: URLs */}
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(210px, 1fr))', gap: '10px', marginBottom: '0.9rem' }}>
                    <div>
                      <label style={{ display: 'block', fontSize: '0.78rem', color: 'var(--text-light)', marginBottom: '4px' }}>
                        Live Website URL
                      </label>
                      <input
                        type="url"
                        value={editingProject.link}
                        onChange={(e) => setEditingProject({ ...editingProject, link: e.target.value })}
                        placeholder="https://example.com"
                        style={{ width: '100%', padding: '8px 12px', borderRadius: '6px', background: '#1c1c1c', border: '1px solid #2e2e2e', color: '#fff' }}
                      />
                    </div>
                    <div>
                      <label style={{ display: 'block', fontSize: '0.78rem', color: 'var(--text-light)', marginBottom: '4px' }}>
                        Interactive Demo / Docs URL (Optional)
                      </label>
                      <input
                        type="url"
                        value={editingProject.demoUrl || ''}
                        onChange={(e) => setEditingProject({ ...editingProject, demoUrl: e.target.value })}
                        placeholder="https://demo.example.com"
                        style={{ width: '100%', padding: '8px 12px', borderRadius: '6px', background: '#1c1c1c', border: '1px solid #2e2e2e', color: '#fff' }}
                      />
                    </div>
                  </div>

                  {/* Primary Image */}
                  <ImageUploadField
                    id="project-cover-image"
                    label="Primary Cover Image"
                    value={editingProject.imageUrl || ''}
                    onChange={(nextUrl) => setEditingProject({ ...editingProject, imageUrl: nextUrl })}
                    onError={(msg) => onShowToast(msg, 'error')}
                    shape="rounded"
                    previewFallbackText={deriveInitials(editingProject.title || 'CS')}
                    maxDimension={PROJECT_IMAGE_MAX_DIMENSION}
                    urlPlaceholder="https://example.com/project-screenshot.jpg"
                    helperText="Upload the main showcase image or paste an external URL."
                    uploadButtonLabel="Upload Cover Image"
                  />

                  {/* Multi-Screenshot Gallery Manager */}
                  <div style={{ marginBottom: '1rem', padding: '0.85rem', borderRadius: '8px', background: '#101010', border: '1px solid #262626' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.6rem', flexWrap: 'wrap', gap: '8px' }}>
                      <label style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--primary-color)' }}>
                        Additional Gallery Screenshots ({editingProject.galleryImages?.length || 0})
                      </label>
                      <label
                        style={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '6px',
                          padding: '5px 11px',
                          borderRadius: '6px',
                          background: 'rgba(212, 175, 55, 0.16)',
                          border: '1px solid rgba(212, 175, 55, 0.45)',
                          color: 'var(--primary-color)',
                          fontSize: '0.76rem',
                          fontWeight: 600,
                          cursor: isUploadingProjectGallery ? 'wait' : 'pointer'
                        }}
                      >
                        <UploadCloud size={14} />
                        {isUploadingProjectGallery ? 'Processing...' : 'Upload Gallery Screenshot'}
                        <input
                          type="file"
                          accept="image/png,image/jpeg,image/webp,image/gif,image/avif"
                          disabled={isUploadingProjectGallery}
                          onChange={handleUploadGalleryFile}
                          style={{ display: 'none' }}
                        />
                      </label>
                    </div>
                    <div style={{ display: 'flex', gap: '6px', marginBottom: '0.65rem' }}>
                      <input
                        type="url"
                        value={newProjectGalleryUrl}
                        onChange={(e) => setNewProjectGalleryUrl(e.target.value)}
                        placeholder="Or paste screenshot URL (https://...)"
                        style={{ flex: 1, padding: '7px 10px', borderRadius: '6px', background: '#1c1c1c', border: '1px solid #2e2e2e', color: '#fff', fontSize: '0.8rem' }}
                      />
                      <button
                        type="button"
                        onClick={() => {
                          const safeUrl = sanitizeDisplayImageUrl(newProjectGalleryUrl);
                          if (!safeUrl) {
                            onShowToast('Enter a valid https:// screenshot URL.', 'error');
                            return;
                          }
                          setEditingProject({
                            ...editingProject,
                            galleryImages: [...(editingProject.galleryImages || []), safeUrl]
                          });
                          setNewProjectGalleryUrl('');
                        }}
                        style={{
                          padding: '7px 12px',
                          borderRadius: '6px',
                          border: '1px solid rgba(212,175,55,0.4)',
                          background: 'rgba(212,175,55,0.12)',
                          color: 'var(--primary-color)',
                          fontWeight: 700,
                          fontSize: '0.78rem',
                          cursor: 'pointer'
                        }}
                      >
                        Add URL
                      </button>
                    </div>
                    {editingProject.galleryImages && editingProject.galleryImages.length > 0 && (
                      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(96px, 1fr))', gap: '8px' }}>
                        {editingProject.galleryImages.map((imgUrl, idx) => (
                          <div key={`${imgUrl}-${idx}`} style={{ position: 'relative', borderRadius: '6px', overflow: 'hidden', border: '1px solid #333', height: '66px', background: '#0a0a0a' }}>
                            <img src={imgUrl} alt={`Gallery ${idx + 1}`} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                            <button
                              type="button"
                              onClick={() =>
                                setEditingProject({
                                  ...editingProject,
                                  galleryImages: (editingProject.galleryImages || []).filter((_, i) => i !== idx)
                                })
                              }
                              aria-label={`Remove screenshot ${idx + 1}`}
                              style={{
                                position: 'absolute',
                                top: '4px',
                                right: '4px',
                                width: '20px',
                                height: '20px',
                                borderRadius: '50%',
                                border: 'none',
                                background: 'rgba(0,0,0,0.8)',
                                color: '#f87171',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                cursor: 'pointer'
                              }}
                            >
                              <X size={12} />
                            </button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Narrative Fields */}
                  <div style={{ marginBottom: '0.9rem' }}>
                    <label style={{ display: 'block', fontSize: '0.78rem', color: 'var(--text-light)', marginBottom: '4px' }}>
                      Short Card Summary
                    </label>
                    <textarea
                      rows={2}
                      value={editingProject.description}
                      onChange={(e) => setEditingProject({ ...editingProject, description: e.target.value })}
                      placeholder="Concise summary shown on grid cards..."
                      style={{ width: '100%', padding: '8px 12px', borderRadius: '6px', background: '#1c1c1c', border: '1px solid #2e2e2e', color: '#fff' }}
                    />
                  </div>

                  <div style={{ marginBottom: '0.9rem' }}>
                    <label style={{ display: 'block', fontSize: '0.78rem', color: 'var(--text-light)', marginBottom: '4px' }}>
                      Extended Product / Case Study Introduction
                    </label>
                    <textarea
                      rows={3}
                      value={editingProject.overview || ''}
                      onChange={(e) => setEditingProject({ ...editingProject, overview: e.target.value })}
                      placeholder="Detailed introduction explaining the project vision, target users, and market fit..."
                      style={{ width: '100%', padding: '8px 12px', borderRadius: '6px', background: '#1c1c1c', border: '1px solid #2e2e2e', color: '#fff' }}
                    />
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '10px', marginBottom: '0.9rem' }}>
                    <div>
                      <label style={{ display: 'block', fontSize: '0.78rem', color: 'var(--text-light)', marginBottom: '4px' }}>
                        Business & Technical Challenge
                      </label>
                      <textarea
                        rows={3}
                        value={editingProject.challenge || ''}
                        onChange={(e) => setEditingProject({ ...editingProject, challenge: e.target.value })}
                        placeholder="What problem or bottleneck did this solve?"
                        style={{ width: '100%', padding: '8px 12px', borderRadius: '6px', background: '#1c1c1c', border: '1px solid #2e2e2e', color: '#fff' }}
                      />
                    </div>
                    <div>
                      <label style={{ display: 'block', fontSize: '0.78rem', color: 'var(--text-light)', marginBottom: '4px' }}>
                        Engineered Solution
                      </label>
                      <textarea
                        rows={3}
                        value={editingProject.solution || ''}
                        onChange={(e) => setEditingProject({ ...editingProject, solution: e.target.value })}
                        placeholder="How did Axe's Era Enterprises solve it?"
                        style={{ width: '100%', padding: '8px 12px', borderRadius: '6px', background: '#1c1c1c', border: '1px solid #2e2e2e', color: '#fff' }}
                      />
                    </div>
                  </div>

                  {/* Interactive Outcomes KPI Builder */}
                  <div style={{ marginBottom: '0.9rem', padding: '0.85rem', borderRadius: '8px', background: '#101010', border: '1px solid #262626' }}>
                    <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, color: 'var(--primary-color)', marginBottom: '0.5rem' }}>
                      Measured Outcomes & KPI Benchmarks ({editingProject.outcomes?.length || 0})
                    </label>
                    <div style={{ display: 'grid', gridTemplateColumns: '130px 1fr auto', gap: '6px', marginBottom: '0.6rem' }}>
                      <input
                        type="text"
                        value={newOutcomeValue}
                        onChange={(e) => setNewOutcomeValue(e.target.value)}
                        placeholder="+240%"
                        style={{ padding: '7px 10px', borderRadius: '6px', background: '#1c1c1c', border: '1px solid #2e2e2e', color: '#fff', fontSize: '0.8rem' }}
                      />
                      <input
                        type="text"
                        value={newOutcomeLabel}
                        onChange={(e) => setNewOutcomeLabel(e.target.value)}
                        placeholder="Outcome label (e.g. Qualified Lead Volume)"
                        style={{ padding: '7px 10px', borderRadius: '6px', background: '#1c1c1c', border: '1px solid #2e2e2e', color: '#fff', fontSize: '0.8rem' }}
                      />
                      <button
                        type="button"
                        onClick={() => {
                          if (!newOutcomeValue.trim() || !newOutcomeLabel.trim()) {
                            onShowToast('Provide both an outcome value and label.', 'error');
                            return;
                          }
                          setEditingProject({
                            ...editingProject,
                            outcomes: [
                              ...(editingProject.outcomes || []),
                              { value: newOutcomeValue.trim(), label: newOutcomeLabel.trim() }
                            ]
                          });
                          setNewOutcomeValue('');
                          setNewOutcomeLabel('');
                        }}
                        style={{
                          padding: '7px 12px',
                          borderRadius: '6px',
                          border: '1px solid rgba(212,175,55,0.4)',
                          background: 'rgba(212,175,55,0.12)',
                          color: 'var(--primary-color)',
                          fontWeight: 700,
                          fontSize: '0.78rem',
                          cursor: 'pointer'
                        }}
                      >
                        Add KPI
                      </button>
                    </div>
                    {editingProject.outcomes && editingProject.outcomes.length > 0 && (
                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                        {editingProject.outcomes.map((o, idx) => (
                          <span
                            key={`${o.label}-${idx}`}
                            style={{
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: '6px',
                              padding: '4px 10px',
                              borderRadius: '6px',
                              background: '#1c1c1c',
                              border: '1px solid rgba(212,175,55,0.35)',
                              color: '#fafafa',
                              fontSize: '0.78rem'
                            }}
                          >
                            <strong style={{ color: 'var(--primary-color)' }}>{o.value}</strong>
                            <span>{o.label}</span>
                            <button
                              type="button"
                              onClick={() =>
                                setEditingProject({
                                  ...editingProject,
                                  outcomes: (editingProject.outcomes || []).filter((_, i) => i !== idx)
                                })
                              }
                              aria-label={`Remove outcome ${o.label}`}
                              style={{ background: 'none', border: 'none', color: '#f87171', cursor: 'pointer', padding: 0, display: 'flex' }}
                            >
                              <X size={13} />
                            </button>
                          </span>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Key Features / Deliverables / Architecture Highlights List Builders */}
                  {[
                    {
                      label: 'Key Features',
                      field: 'keyFeatures' as const,
                      draft: newProjectFeature,
                      setDraft: setNewProjectFeature,
                      placeholder: 'Add feature (e.g. Role-based lead routing & pipeline)'
                    },
                    {
                      label: 'Project Deliverables',
                      field: 'deliverables' as const,
                      draft: newProjectDeliverable,
                      setDraft: setNewProjectDeliverable,
                      placeholder: 'Add deliverable (e.g. Custom Shopify Liquid theme)'
                    },
                    {
                      label: 'Architecture Highlights',
                      field: 'architectureHighlights' as const,
                      draft: newProjectArchHighlight,
                      setDraft: setNewProjectArchHighlight,
                      placeholder: 'Add architecture highlight (e.g. Edge CDN + Firebase sync)'
                    }
                  ].map((builder) => {
                    const list = editingProject[builder.field] || [];
                    const handleAdd = () => {
                      const trimmed = builder.draft.trim();
                      if (!trimmed) return;
                      if (!list.some((item) => item.toLowerCase() === trimmed.toLowerCase())) {
                        setEditingProject({
                          ...editingProject,
                          [builder.field]: [...list, trimmed]
                        });
                      }
                      builder.setDraft('');
                    };
                    return (
                      <div key={builder.field} style={{ marginBottom: '0.85rem', padding: '0.8rem', borderRadius: '8px', background: '#101010', border: '1px solid #262626' }}>
                        <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 700, color: '#e5e5e5', marginBottom: '0.45rem' }}>
                          {builder.label} ({list.length})
                        </label>
                        <div style={{ display: 'flex', gap: '6px', marginBottom: list.length > 0 ? '0.5rem' : 0 }}>
                          <input
                            type="text"
                            value={builder.draft}
                            onChange={(e) => builder.setDraft(e.target.value)}
                            onKeyDown={(e) => {
                              if (e.key === 'Enter') {
                                e.preventDefault();
                                handleAdd();
                              }
                            }}
                            placeholder={builder.placeholder}
                            style={{ flex: 1, padding: '7px 10px', borderRadius: '6px', background: '#1c1c1c', border: '1px solid #2e2e2e', color: '#fff', fontSize: '0.8rem' }}
                          />
                          <button
                            type="button"
                            onClick={handleAdd}
                            style={{
                              padding: '7px 12px',
                              borderRadius: '6px',
                              border: '1px solid rgba(212,175,55,0.4)',
                              background: 'rgba(212,175,55,0.12)',
                              color: 'var(--primary-color)',
                              fontWeight: 700,
                              fontSize: '0.78rem',
                              cursor: 'pointer'
                            }}
                          >
                            Add
                          </button>
                        </div>
                        {list.length > 0 && (
                          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                            {list.map((item, idx) => (
                              <span
                                key={`${item}-${idx}`}
                                style={{
                                  display: 'inline-flex',
                                  alignItems: 'center',
                                  gap: '5px',
                                  padding: '4px 9px',
                                  borderRadius: '6px',
                                  background: '#1c1c1c',
                                  border: '1px solid #333',
                                  color: '#e5e5e5',
                                  fontSize: '0.76rem'
                                }}
                              >
                                <span>{item}</span>
                                <button
                                  type="button"
                                  onClick={() =>
                                    setEditingProject({
                                      ...editingProject,
                                      [builder.field]: list.filter((_, i) => i !== idx)
                                    })
                                  }
                                  aria-label={`Remove ${item}`}
                                  style={{ background: 'none', border: 'none', color: '#f87171', cursor: 'pointer', padding: 0, display: 'flex' }}
                                >
                                  <X size={12} />
                                </button>
                              </span>
                            ))}
                          </div>
                        )}
                      </div>
                    );
                  })}

                  <div style={{ marginBottom: '1rem' }}>
                    <label style={{ display: 'block', fontSize: '0.78rem', color: 'var(--text-light)', marginBottom: '4px' }}>
                      Technology Stack Tags (comma-separated)
                    </label>
                    <input
                      type="text"
                      value={editingProject.tags?.join(', ') || ''}
                      onChange={(e) => {
                        const tags = e.target.value.split(',').map((t) => t.trim()).filter(Boolean);
                        setEditingProject({ ...editingProject, tags });
                      }}
                      placeholder="React, TypeScript, Cloud Edge, CRM"
                      style={{ width: '100%', padding: '8px 12px', borderRadius: '6px', background: '#1c1c1c', border: '1px solid #2e2e2e', color: '#fff' }}
                    />
                  </div>

                  <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
                    <button
                      type="button"
                      onClick={() => {
                        setEditingProject(null);
                        setIsCreatingProject(false);
                        resetProjectScratchInputs();
                      }}
                      className="btn btn-outline"
                      style={{ padding: '6px 14px', fontSize: '0.85rem' }}
                    >
                      Cancel
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        if (!editingProject.title.trim()) {
                          onShowToast('Please enter a project title', 'error');
                          return;
                        }
                        const normalizedSlug = slugifyProjectTitle(editingProject.slug || editingProject.title);
                        const sanitizedProject: Project = {
                          ...editingProject,
                          slug: normalizedSlug,
                          title: editingProject.title.trim(),
                          subtitle: editingProject.subtitle.trim(),
                          projectType: editingProject.projectType || resolveProjectType(editingProject),
                          status: editingProject.status || 'live',
                          featured: Boolean(editingProject.featured),
                          link: (editingProject.link || '').trim(),
                          demoUrl: (editingProject.demoUrl || '').trim() || undefined,
                          imageUrl: sanitizeDisplayImageUrl(editingProject.imageUrl),
                          galleryImages: (editingProject.galleryImages || [])
                            .map((u) => sanitizeDisplayImageUrl(u))
                            .filter(Boolean),
                          description: (editingProject.description || '').trim(),
                          overview: (editingProject.overview || '').trim() || undefined,
                          clientName: (editingProject.clientName || '').trim() || undefined,
                          industry: (editingProject.industry || '').trim() || undefined,
                          timeline: (editingProject.timeline || '').trim() || undefined,
                          role: (editingProject.role || '').trim() || undefined,
                          pricingModel: (editingProject.pricingModel || '').trim() || undefined,
                          challenge: (editingProject.challenge || '').trim() || undefined,
                          solution: (editingProject.solution || '').trim() || undefined,
                          keyFeatures: sanitizeStringList(editingProject.keyFeatures),
                          deliverables: sanitizeStringList(editingProject.deliverables),
                          architectureHighlights: sanitizeStringList(editingProject.architectureHighlights),
                          outcomes: sanitizeProjectOutcomes(editingProject.outcomes),
                          tags: sanitizeStringList(editingProject.tags)
                        };
                        const nextProjectsPreview = isCreatingProject
                          ? [sanitizedProject, ...data.projects.filter((p) => p.id !== sanitizedProject.id)]
                          : data.projects.map((p) => (p.id === sanitizedProject.id ? sanitizedProject : p));
                        if (!isWithinFirestoreDocBudget(nextProjectsPreview)) {
                          onShowToast('Websites storage limit reached (850 KB). Please use smaller images or external URLs.', 'error');
                          return;
                        }
                        if (isCreatingProject) {
                          onAddProject(sanitizedProject);
                          onShowToast('Website / product published successfully!', 'success');
                        } else {
                          onUpdateProject(sanitizedProject);
                          onShowToast('Website / product updated successfully!', 'success');
                        }
                        setEditingProject(null);
                        setIsCreatingProject(false);
                        resetProjectScratchInputs();
                      }}
                      className="btn btn-primary"
                      style={{ padding: '6px 16px', fontSize: '0.85rem' }}
                    >
                      <Save size={14} /> Save Website / Product
                    </button>
                  </div>
                </div>
              )}

              {/* Search & Filter Toolbar */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginBottom: '1rem' }}>
                <div style={{ position: 'relative' }}>
                  <Search size={15} style={{ position: 'absolute', left: '11px', top: '50%', transform: 'translateY(-50%)', color: '#737373', pointerEvents: 'none' }} />
                  <input
                    type="text"
                    value={projectSearch}
                    onChange={(e) => setProjectSearch(e.target.value)}
                    placeholder="Search websites, clients, industries, or stack..."
                    style={{ width: '100%', padding: '8px 12px 8px 34px', borderRadius: '8px', background: '#141414', border: '1px solid #262626', color: '#fff', fontSize: '0.84rem' }}
                  />
                </div>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                  {[
                    { id: 'all' as const, label: `All (${data.projects.length})` },
                    { id: 'case-study' as const, label: `Case Studies (${caseStudyTotal})` },
                    { id: 'digital-product' as const, label: `Digital Products (${productTotal})` }
                  ].map((pill) => {
                    const selected = projectTypeFilter === pill.id;
                    return (
                      <button
                        key={pill.id}
                        type="button"
                        onClick={() => setProjectTypeFilter(pill.id)}
                        style={{
                          padding: '5px 11px',
                          borderRadius: '9999px',
                          border: selected ? '1px solid var(--primary-color)' : '1px solid #2e2e2e',
                          background: selected ? 'rgba(212, 175, 55, 0.16)' : '#141414',
                          color: selected ? 'var(--primary-color)' : '#d4d4d4',
                          fontSize: '0.76rem',
                          fontWeight: 600,
                          cursor: 'pointer'
                        }}
                      >
                        {pill.label}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Websites / Case Studies / Products List */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                {filteredProjectsList.length === 0 ? (
                  <div style={{ padding: '1.5rem', textAlign: 'center', borderRadius: '8px', background: '#141414', border: '1px dashed #333', color: '#a3a3a3', fontSize: '0.85rem' }}>
                    No websites or digital products match your search filter.
                  </div>
                ) : (
                  filteredProjectsList.map((proj, idx) => {
                    const projType = resolveProjectType(proj);
                    const projStatus = resolveProjectStatus(proj.status);
                    const hasSafeLiveUrl = /^https?:\/\/.+/i.test((proj.link || '').trim());
                    return (
                      <div
                        key={proj.id}
                        style={{
                          background: '#141414',
                          padding: '0.9rem 1rem',
                          borderRadius: '8px',
                          border: proj.featured ? '1px solid rgba(212, 175, 55, 0.35)' : '1px solid rgba(255, 255, 255, 0.08)',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '12px',
                          flexWrap: 'wrap'
                        }}
                      >
                        {sanitizeDisplayImageUrl(proj.imageUrl) ? (
                          <img
                            src={sanitizeDisplayImageUrl(proj.imageUrl)}
                            alt={proj.title}
                            style={{
                              width: '62px',
                              height: '46px',
                              objectFit: 'cover',
                              borderRadius: '6px',
                              border: '1px solid rgba(212, 175, 55, 0.3)',
                              flexShrink: 0
                            }}
                          />
                        ) : (
                          <div
                            style={{
                              width: '62px',
                              height: '46px',
                              borderRadius: '6px',
                              background: '#0a0a0a',
                              border: '1px solid rgba(212, 175, 55, 0.35)',
                              color: 'var(--primary-color)',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              flexShrink: 0
                            }}
                          >
                            {projType === 'digital-product' ? <Sparkles size={18} /> : <FolderGit2 size={18} />}
                          </div>
                        )}
                        <div style={{ flex: 1, minWidth: '180px' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flexWrap: 'wrap' }}>
                            <h4 style={{ margin: 0, color: '#fff', fontSize: '0.94rem' }}>{proj.title}</h4>
                            <span
                              style={{
                                fontSize: '0.7rem',
                                fontWeight: 700,
                                color: projType === 'digital-product' ? '#f5d061' : '#e5e5e5',
                                background: projType === 'digital-product' ? 'rgba(212, 175, 55, 0.16)' : 'rgba(255,255,255,0.08)',
                                padding: '2px 7px',
                                borderRadius: '9999px'
                              }}
                            >
                              {getProjectTypeLabel(projType)}
                            </span>
                            <span
                              style={{
                                fontSize: '0.68rem',
                                color: projStatus === 'live' ? '#6ee7b7' : '#fbbf24',
                                background: projStatus === 'live' ? 'rgba(16,185,129,0.14)' : 'rgba(245,158,11,0.14)',
                                padding: '2px 7px',
                                borderRadius: '9999px'
                              }}
                            >
                              {getProjectStatusLabel(projStatus)}
                            </span>
                            <span style={{ fontSize: '0.72rem', color: 'var(--primary-color)', background: 'rgba(212, 175, 55, 0.1)', padding: '2px 7px', borderRadius: '10px' }}>
                              {proj.metric}
                            </span>
                          </div>
                          <p style={{ margin: '3px 0 0', fontSize: '0.78rem', color: 'var(--text-light)' }}>
                            {proj.subtitle} • {proj.category}
                            {proj.galleryImages && proj.galleryImages.length > 0 ? ` • ${proj.galleryImages.length} extra screenshot(s)` : ''}
                          </p>
                        </div>

                        <div style={{ display: 'flex', gap: '5px', alignItems: 'center' }}>
                          <button
                            type="button"
                            onClick={() =>
                              onUpdateProject({
                                ...proj,
                                featured: !proj.featured
                              })
                            }
                            style={{
                              background: proj.featured ? 'rgba(212, 175, 55, 0.22)' : 'rgba(255, 255, 255, 0.06)',
                              border: proj.featured ? '1px solid var(--primary-color)' : '1px solid transparent',
                              color: proj.featured ? 'var(--primary-color)' : '#a3a3a3',
                              padding: '6px',
                              borderRadius: '6px',
                              cursor: 'pointer'
                            }}
                            title={proj.featured ? 'Unfeature flagship' : 'Mark as Featured Flagship'}
                          >
                            <Star size={15} fill={proj.featured ? 'currentColor' : 'none'} />
                          </button>

                          {canReorder && (
                            <>
                              <button
                                type="button"
                                disabled={idx === 0}
                                onClick={() => onReorderProjects && onReorderProjects(reorderProjectList(data.projects, proj.id, 'up'))}
                                style={{
                                  background: 'rgba(255,255,255,0.06)',
                                  border: 'none',
                                  color: idx === 0 ? '#525252' : '#e5e5e5',
                                  padding: '6px',
                                  borderRadius: '6px',
                                  cursor: idx === 0 ? 'default' : 'pointer'
                                }}
                                title="Move Up"
                              >
                                <ChevronUp size={15} />
                              </button>
                              <button
                                type="button"
                                disabled={idx === filteredProjectsList.length - 1}
                                onClick={() => onReorderProjects && onReorderProjects(reorderProjectList(data.projects, proj.id, 'down'))}
                                style={{
                                  background: 'rgba(255,255,255,0.06)',
                                  border: 'none',
                                  color: idx === filteredProjectsList.length - 1 ? '#525252' : '#e5e5e5',
                                  padding: '6px',
                                  borderRadius: '6px',
                                  cursor: idx === filteredProjectsList.length - 1 ? 'default' : 'pointer'
                                }}
                                title="Move Down"
                              >
                                <ChevronDown size={15} />
                              </button>
                            </>
                          )}

                          {onPreviewProject && (
                            <button
                              type="button"
                              onClick={() => onPreviewProject(proj)}
                              style={{
                                background: 'rgba(255, 255, 255, 0.08)',
                                border: 'none',
                                color: '#e5e5e5',
                                padding: '6px',
                                borderRadius: '6px',
                                cursor: 'pointer',
                                display: 'flex',
                                alignItems: 'center'
                              }}
                              title="Open Detail Page"
                            >
                              <Eye size={15} />
                            </button>
                          )}

                          {hasSafeLiveUrl && (
                            <a
                              href={proj.link}
                              target="_blank"
                              rel="noopener noreferrer"
                              style={{
                                background: 'rgba(255, 255, 255, 0.08)',
                                color: '#e5e5e5',
                                padding: '6px',
                                borderRadius: '6px',
                                display: 'flex',
                                alignItems: 'center'
                              }}
                              title="Open Live Link"
                            >
                              <ExternalLink size={15} />
                            </a>
                          )}

                          <button
                            type="button"
                            onClick={() => {
                              const duplicated = createDuplicatedProject(proj);
                              const nextPreview = [duplicated, ...data.projects];
                              if (!isWithinFirestoreDocBudget(nextPreview)) {
                                onShowToast('Cannot duplicate: cloud budget reached.', 'error');
                                return;
                              }
                              onAddProject(duplicated);
                              onShowToast(`Duplicated: ${proj.title}`, 'success');
                            }}
                            style={{
                              background: 'rgba(255, 255, 255, 0.08)',
                              border: 'none',
                              color: '#e5e5e5',
                              padding: '6px',
                              borderRadius: '6px',
                              cursor: 'pointer'
                            }}
                            title="Duplicate"
                          >
                            <Copy size={15} />
                          </button>

                          <button
                            type="button"
                            onClick={() => openProjectForEdit(proj)}
                            style={{
                              background: 'rgba(212, 175, 55, 0.15)',
                              border: '1px solid rgba(212, 175, 55, 0.3)',
                              color: 'var(--primary-color)',
                              padding: '6px',
                              borderRadius: '6px',
                              cursor: 'pointer'
                            }}
                            title="Edit"
                          >
                            <Edit2 size={15} />
                          </button>

                          <button
                            type="button"
                            onClick={() => setDeleteConfirmTarget({ type: 'project', id: proj.id, title: proj.title })}
                            style={{
                              background: 'rgba(239, 68, 68, 0.15)',
                              border: '1px solid rgba(239, 68, 68, 0.3)',
                              color: '#f87171',
                              padding: '6px',
                              borderRadius: '6px',
                              cursor: 'pointer'
                            }}
                            title="Delete"
                          >
                            <Trash2 size={15} />
                          </button>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          );
        })()}

        {/* TAB 4: BLOGS */}
        {activeTab === 'blogs' && (
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem', flexWrap: 'wrap', gap: '10px' }}>
              <div>
                <h3 style={{ margin: 0, color: 'var(--primary-color)', fontSize: '1.15rem' }}>
                  Manage Blog Articles & Knowledge Hub ({data.blogs.length})
                </h3>
                <p style={{ margin: '2px 0 0', color: 'var(--text-light)', fontSize: '0.8rem' }}>
                  Full blog creation with 9 official categories and multiple image gallery support • Cloud storage:{' '}
                  <strong style={{ color: isWithinFirestoreDocBudget(data.blogs) ? '#34d399' : '#f87171' }}>
                    {Math.round(estimateJsonSectionBytes(data.blogs) / 1024)} KB / {Math.round(FIRESTORE_SAFE_SECTION_BYTES / 1024)} KB
                  </strong>
                </p>
              </div>
              {!isCreatingBlog && !editingBlog && (() => {
                const { addedCount: missingWebDevCount } = mergeMissingBuiltinBlogs(data.blogs, blogsData, CURATED_WEB_DEV_BLOG_IDS);
                const { addedCount: missingMobileAppCount } = mergeMissingBuiltinBlogs(data.blogs, blogsData, CURATED_MOBILE_APP_BLOG_IDS);
                const { addedCount: missingBrandingCount } = mergeMissingBuiltinBlogs(data.blogs, blogsData, CURATED_BRANDING_BLOG_IDS);
                const { addedCount: missingBuiltinCount } = mergeMissingBuiltinBlogs(data.blogs, blogsData);
                return (
                  <div style={{ display: 'flex', gap: '8px', alignItems: 'center', flexWrap: 'wrap' }}>
                    {missingWebDevCount > 0 && onImportBuiltinBlogs && (
                      <button
                        type="button"
                        disabled={isSyncingBuiltinBlogs}
                        onClick={() => {
                          void (async () => {
                            setIsSyncingBuiltinBlogs(true);
                            try {
                              const res = await onImportBuiltinBlogs(CURATED_WEB_DEV_BLOG_IDS);
                              if (!res.ok) {
                                onShowToast('Failed to sync new Web Dev articles to cloud. Verify admin login and try again.', 'error');
                              } else if (res.addedCount > 0) {
                                onShowToast(`Synced ${res.addedCount} new Web Development article${res.addedCount === 1 ? '' : 's'} to cloud!`, 'success');
                              } else {
                                onShowToast('New Web Development articles are already present.', 'info');
                              }
                            } finally {
                              setIsSyncingBuiltinBlogs(false);
                            }
                          })();
                        }}
                        className="btn btn-outline"
                        style={{
                          padding: '7px 14px',
                          fontSize: '0.82rem',
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '6px',
                          cursor: isSyncingBuiltinBlogs ? 'wait' : 'pointer'
                        }}
                      >
                        <UploadCloud size={15} />
                        {isSyncingBuiltinBlogs
                          ? 'Syncing...'
                          : `Sync ${missingWebDevCount} New Web Dev Article${missingWebDevCount === 1 ? '' : 's'} to Cloud`}
                      </button>
                    )}
                    {missingMobileAppCount > 0 && onImportBuiltinBlogs && (
                      <button
                        type="button"
                        disabled={isSyncingBuiltinBlogs}
                        onClick={() => {
                          void (async () => {
                            setIsSyncingBuiltinBlogs(true);
                            try {
                              const res = await onImportBuiltinBlogs(CURATED_MOBILE_APP_BLOG_IDS);
                              if (!res.ok) {
                                onShowToast('Failed to sync new Mobile App articles to cloud. Verify admin login and try again.', 'error');
                              } else if (res.addedCount > 0) {
                                onShowToast(`Synced ${res.addedCount} new Mobile App Development article${res.addedCount === 1 ? '' : 's'} to cloud!`, 'success');
                              } else {
                                onShowToast('New Mobile App Development articles are already present.', 'info');
                              }
                            } finally {
                              setIsSyncingBuiltinBlogs(false);
                            }
                          })();
                        }}
                        className="btn btn-outline"
                        style={{
                          padding: '7px 14px',
                          fontSize: '0.82rem',
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '6px',
                          cursor: isSyncingBuiltinBlogs ? 'wait' : 'pointer'
                        }}
                      >
                        <UploadCloud size={15} />
                        {isSyncingBuiltinBlogs
                          ? 'Syncing...'
                          : `Sync ${missingMobileAppCount} New Mobile App Article${missingMobileAppCount === 1 ? '' : 's'} to Cloud`}
                      </button>
                    )}
                    {missingBrandingCount > 0 && onImportBuiltinBlogs && (
                      <button
                        type="button"
                        disabled={isSyncingBuiltinBlogs}
                        onClick={() => {
                          void (async () => {
                            setIsSyncingBuiltinBlogs(true);
                            try {
                              const res = await onImportBuiltinBlogs(CURATED_BRANDING_BLOG_IDS);
                              if (!res.ok) {
                                onShowToast('Failed to sync new Branding & Design articles to cloud. Verify admin login and try again.', 'error');
                              } else if (res.addedCount > 0) {
                                onShowToast(`Synced ${res.addedCount} new Branding & Design article${res.addedCount === 1 ? '' : 's'} to cloud!`, 'success');
                              } else {
                                onShowToast('New Branding & Design articles are already present.', 'info');
                              }
                            } finally {
                              setIsSyncingBuiltinBlogs(false);
                            }
                          })();
                        }}
                        className="btn btn-outline"
                        style={{
                          padding: '7px 14px',
                          fontSize: '0.82rem',
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '6px',
                          cursor: isSyncingBuiltinBlogs ? 'wait' : 'pointer'
                        }}
                      >
                        <UploadCloud size={15} />
                        {isSyncingBuiltinBlogs
                          ? 'Syncing...'
                          : `Sync ${missingBrandingCount} New Branding Article${missingBrandingCount === 1 ? '' : 's'} to Cloud`}
                      </button>
                    )}
                    {missingWebDevCount === 0 && missingMobileAppCount === 0 && missingBrandingCount === 0 && missingBuiltinCount > 0 && onImportBuiltinBlogs && (
                      <button
                        type="button"
                        disabled={isSyncingBuiltinBlogs}
                        onClick={() => {
                          void (async () => {
                            setIsSyncingBuiltinBlogs(true);
                            try {
                              const res = await onImportBuiltinBlogs();
                              if (!res.ok) {
                                onShowToast('Failed to sync built-in articles to cloud. Verify admin login and try again.', 'error');
                              } else if (res.addedCount > 0) {
                                onShowToast(`Synced ${res.addedCount} built-in article${res.addedCount === 1 ? '' : 's'} to cloud!`, 'success');
                              }
                            } finally {
                              setIsSyncingBuiltinBlogs(false);
                            }
                          })();
                        }}
                        className="btn btn-outline"
                        style={{
                          padding: '7px 14px',
                          fontSize: '0.82rem',
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '6px',
                          cursor: isSyncingBuiltinBlogs ? 'wait' : 'pointer'
                        }}
                      >
                        <UploadCloud size={15} />
                        {isSyncingBuiltinBlogs
                          ? 'Syncing...'
                          : `Sync ${missingBuiltinCount} Built-in Article${missingBuiltinCount === 1 ? '' : 's'}`}
                      </button>
                    )}
                    <button
                      onClick={() => {
                        setBlogFormError('');
                        setIsCreatingBlog(true);
                        setEditingBlog({
                          id: `blog-${Date.now()}`,
                          title: '',
                          slug: `article-${Date.now()}`,
                          imageUrl: 'https://images.unsplash.com/photo-1498050108023-c5249f4df085?auto=format&fit=crop&w=1200&q=80',
                          summary: '',
                          category: '🌐 Web Development',
                          date: 'March 2026',
                          readTime: '5 min read',
                          author: 'Gauhar Axe',
                          tags: ['Web Dev', 'Tech'],
                          paragraphs: [],
                          images: [],
                          sections: [
                            {
                              id: `sec-${Date.now()}-1`,
                              heading: '1. Strategic Overview & Industry Insights',
                              paragraphs: ['Write the first comprehensive paragraph exploring industry trends, architecture patterns, and enterprise execution.'],
                              imageUrl: 'https://images.unsplash.com/photo-1555066931-4365d14bab8c?auto=format&fit=crop&w=1200&q=80',
                              imageCaption: 'High-performance digital engineering workflow'
                            },
                            {
                              id: `sec-${Date.now()}-2`,
                              heading: '2. Technical Architecture & Core Benchmarks',
                              paragraphs: ['Explain the technical implementation details, security safeguards, and responsive benchmarks achieved.'],
                              imageUrl: 'https://images.unsplash.com/photo-1517694712202-14dd9538aa97?auto=format&fit=crop&w=1200&q=80',
                              imageCaption: 'Responsive architecture & Core Web Vitals optimization'
                            }
                          ]
                        });
                        setNewGalleryImageUrl('');
                      }}
                      className="btn btn-primary"
                      style={{ padding: '7px 16px', fontSize: '0.85rem', display: 'inline-flex', alignItems: 'center', gap: '6px' }}
                    >
                      <Plus size={16} /> Create Complete Blog
                    </button>
                  </div>
                );
              })()}
            </div>

            {/* Blog Form */}
            {(isCreatingBlog || editingBlog) && editingBlog && (() => {
              const currentSections: BlogSection[] = editingBlog.sections && editingBlog.sections.length > 0
                ? editingBlog.sections
                : ensureBlogSections(editingBlog);

              return (
                <div style={{ background: '#141414', padding: '1.25rem', borderRadius: '12px', marginBottom: '1.5rem', border: '1px solid var(--primary-color)' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem', borderBottom: '1px solid rgba(255,255,255,0.08)', paddingBottom: '0.75rem' }}>
                    <div>
                      <h4 style={{ color: '#fff', margin: 0, fontSize: '1.05rem', fontWeight: 700 }}>
                        {isCreatingBlog ? '✨ Create New Blog Article' : `✏️ Edit: ${editingBlog.title || 'Untitled'}`}
                      </h4>
                      <p style={{ margin: '2px 0 0', color: 'var(--text-light)', fontSize: '0.76rem' }}>
                        Configure Title, Cover Image Upload / URL, Summary, and structured Headings/Paragraphs/Images
                      </p>
                    </div>
                    <span style={{ fontSize: '0.75rem', color: 'var(--primary-color)', background: 'rgba(212, 175, 55, 0.12)', padding: '2px 8px', borderRadius: '8px' }}>
                      {currentSections.length} Sections
                    </span>
                  </div>

                  {/* 1. ARTICLE TITLE */}
                  <div style={{ marginBottom: '1rem' }}>
                    <label style={{ display: 'block', fontSize: '0.82rem', color: '#f1f5f9', marginBottom: '5px', fontWeight: 600 }}>
                      Article Title *
                    </label>
                    <input
                      type="text"
                      value={editingBlog.title || ''}
                      placeholder="e.g. Next-Gen Web Development Architecture in 2026"
                      onChange={(e) => {
                        const title = e.target.value;
                        const slug = title
                          .toLowerCase()
                          .replace(/[^\w\s-]/g, '')
                          .replace(/\s+/g, '-');
                        if (blogFormError) setBlogFormError('');
                        setEditingBlog({ ...editingBlog, title, slug: isCreatingBlog ? slug : editingBlog.slug });
                      }}
                      style={{ width: '100%', padding: '9px 12px', borderRadius: '6px', background: '#1c1c1c', border: '1px solid #2e2e2e', color: '#fff', fontSize: '0.95rem' }}
                    />
                  </div>

                  {/* 2. PRIMARY COVER IMAGE UPLOAD & URL WITH LIVE PREVIEW */}
                  <ImageUploadField
                    id="blog-cover-image"
                    label="Primary Cover Image *"
                    value={editingBlog.imageUrl || ''}
                    onChange={(nextUrl) => {
                      const candidate = { ...editingBlog, imageUrl: nextUrl };
                      const nextBlogs = isCreatingBlog
                        ? [candidate, ...data.blogs.filter((b) => b.id !== candidate.id)]
                        : data.blogs.map((b) => (b.id === candidate.id ? candidate : b));
                      if (nextUrl.startsWith('data:image/') && !isWithinFirestoreDocBudget(nextBlogs)) {
                        onShowToast('Adding this uploaded image exceeds the 850 KB cloud budget. Use an external image URL or smaller images.', 'error');
                        return;
                      }
                      setEditingBlog(candidate);
                    }}
                    onError={(msg) => onShowToast(msg, 'error')}
                    shape="rounded"
                    previewFallbackText={deriveInitials(editingBlog.title || 'BL')}
                    maxDimension={SERVICE_IMAGE_MAX_DIMENSION}
                    urlPlaceholder="https://images.unsplash.com/photo-1498050108023-c5249f4df085?auto=format&fit=crop&w=1200&q=80"
                    helperText="Drag & drop or upload PNG, JPG, or WebP from your device, or paste an image URL below."
                    uploadButtonLabel="Upload Cover Image"
                  />

                  {/* 3. SUMMARY / EXCERPT OPTION */}
                  <div style={{ marginBottom: '1rem' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '5px' }}>
                      <label style={{ fontSize: '0.82rem', color: '#f1f5f9', fontWeight: 600 }}>
                        Summary / Excerpt *
                      </label>
                      <span style={{ fontSize: '0.72rem', color: 'var(--primary-color)' }}>
                        Displayed on article cards & header
                      </span>
                    </div>
                    <textarea
                      rows={2}
                      value={editingBlog.summary || ''}
                      placeholder="Brief 2-3 sentence overview explaining what this article covers and why it matters..."
                      onChange={(e) => {
                        if (blogFormError) setBlogFormError('');
                        setEditingBlog({ ...editingBlog, summary: e.target.value });
                      }}
                      style={{ width: '100%', padding: '8px 12px', borderRadius: '6px', background: '#1c1c1c', border: '1px solid #2e2e2e', color: '#fff', fontSize: '0.88rem', lineHeight: 1.5 }}
                    />
                  </div>

                  {/* 3b. SEO META DESCRIPTION */}
                  <div style={{ marginBottom: '1rem' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '5px' }}>
                      <label style={{ fontSize: '0.82rem', color: '#f1f5f9', fontWeight: 600 }}>
                        SEO Meta Description
                      </label>
                      <span style={{ fontSize: '0.72rem', color: '#a3a3a3' }}>
                        {(editingBlog.metaDescription || '').length}/160 chars (defaults to Summary if blank)
                      </span>
                    </div>
                    <textarea
                      rows={2}
                      value={editingBlog.metaDescription || ''}
                      placeholder="Concise search-engine meta description (140-160 characters)..."
                      onChange={(e) => setEditingBlog({ ...editingBlog, metaDescription: e.target.value })}
                      style={{ width: '100%', padding: '8px 12px', borderRadius: '6px', background: '#1c1c1c', border: '1px solid #2e2e2e', color: '#fff', fontSize: '0.85rem', lineHeight: 1.5 }}
                    />
                  </div>

                  {/* Slug and Category (9 Official Pillars) */}
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', marginBottom: '1rem' }}>
                    <div>
                      <label style={{ display: 'block', fontSize: '0.8rem', color: 'var(--text-light)', marginBottom: '4px', fontWeight: 600 }}>
                        Category (9 Official Pillars) *
                      </label>
                      <select
                        value={editingBlog.category || '🌐 Web Development'}
                        onChange={(e) => setEditingBlog({ ...editingBlog, category: e.target.value })}
                        style={{ width: '100%', padding: '8px 12px', borderRadius: '6px', background: '#1c1c1c', border: '1px solid #2e2e2e', color: '#fff', fontSize: '0.85rem' }}
                      >
                        {BLOG_CATEGORIES.map((cat) => (
                          <option key={cat} value={cat}>
                            {cat}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label style={{ display: 'block', fontSize: '0.8rem', color: 'var(--text-light)', marginBottom: '4px', fontWeight: 600 }}>
                        URL Slug
                      </label>
                      <input
                        type="text"
                        value={editingBlog.slug || ''}
                        onChange={(e) => setEditingBlog({ ...editingBlog, slug: e.target.value })}
                        style={{ width: '100%', padding: '8px 12px', borderRadius: '6px', background: '#1c1c1c', border: '1px solid #2e2e2e', color: '#fff', fontSize: '0.85rem' }}
                      />
                    </div>
                  </div>

                  {/* Author, Date, Read Time */}
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '10px', marginBottom: '1rem' }}>
                    <div>
                      <label style={{ display: 'block', fontSize: '0.78rem', color: 'var(--text-light)', marginBottom: '4px' }}>Author</label>
                      <input
                        type="text"
                        value={editingBlog.author || 'Gauhar Axe'}
                        onChange={(e) => setEditingBlog({ ...editingBlog, author: e.target.value })}
                        style={{ width: '100%', padding: '7px 10px', borderRadius: '6px', background: '#1c1c1c', border: '1px solid #2e2e2e', color: '#fff', fontSize: '0.82rem' }}
                      />
                    </div>
                    <div>
                      <label style={{ display: 'block', fontSize: '0.78rem', color: 'var(--text-light)', marginBottom: '4px' }}>Read Time</label>
                      <input
                        type="text"
                        value={editingBlog.readTime || '5 min read'}
                        onChange={(e) => setEditingBlog({ ...editingBlog, readTime: e.target.value })}
                        style={{ width: '100%', padding: '7px 10px', borderRadius: '6px', background: '#1c1c1c', border: '1px solid #2e2e2e', color: '#fff', fontSize: '0.82rem' }}
                      />
                    </div>
                    <div>
                      <label style={{ display: 'block', fontSize: '0.78rem', color: 'var(--text-light)', marginBottom: '4px' }}>Publish Date</label>
                      <input
                        type="text"
                        value={editingBlog.date || 'March 2026'}
                        onChange={(e) => setEditingBlog({ ...editingBlog, date: e.target.value })}
                        style={{ width: '100%', padding: '7px 10px', borderRadius: '6px', background: '#1c1c1c', border: '1px solid #2e2e2e', color: '#fff', fontSize: '0.82rem' }}
                      />
                    </div>
                  </div>

                  {/* Tags */}
                  <div style={{ marginBottom: '1.25rem' }}>
                    <label style={{ display: 'block', fontSize: '0.8rem', color: 'var(--text-light)', marginBottom: '4px' }}>
                      Topic Tags (comma-separated, e.g. Web Dev, Full-Stack, Architecture)
                    </label>
                    <input
                      type="text"
                      value={editingBlog.tags?.join(', ') || ''}
                      placeholder="React, Next.js, SEO, Cloud"
                      onChange={(e) => {
                        const tags = e.target.value.split(',').map((t) => t.trim()).filter(Boolean);
                        setEditingBlog({ ...editingBlog, tags });
                      }}
                      style={{ width: '100%', padding: '8px 12px', borderRadius: '6px', background: '#1c1c1c', border: '1px solid #2e2e2e', color: '#fff', fontSize: '0.85rem' }}
                    />
                  </div>

                  {/* 4. MULTIPLE HEADINGS, THEIR PARAGRAPHS, THEIR IMAGES OPTIONS */}
                  <div style={{ background: '#050505', padding: '1.25rem', borderRadius: '10px', border: '1px solid rgba(212, 175, 55, 0.35)', marginBottom: '1.25rem' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px', flexWrap: 'wrap', gap: '8px' }}>
                      <div>
                        <h5 style={{ margin: 0, color: 'var(--primary-color)', fontSize: '0.98rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <FileText size={17} /> Article Sections: Headings, Paragraphs & Images ({currentSections.length})
                        </h5>
                        <p style={{ margin: '3px 0 0', color: '#a3a3a3', fontSize: '0.75rem' }}>
                          Build structured content with multiple headings, dedicated section images, and rich body paragraphs.
                        </p>
                      </div>
                      <button
                        type="button"
                        onClick={() => {
                          const newSec: BlogSection = {
                            id: `sec-${Date.now()}`,
                            heading: `${currentSections.length + 1}. `,
                            paragraphs: ['Write paragraph content for this section...'],
                            imageUrl: '',
                            imageCaption: ''
                          };
                          setEditingBlog({ ...editingBlog, sections: [...currentSections, newSec] });
                        }}
                        className="btn btn-outline"
                        style={{ padding: '5px 12px', fontSize: '0.78rem', display: 'inline-flex', alignItems: 'center', gap: '5px' }}
                      >
                        <Plus size={14} /> Add Heading Section
                      </button>
                    </div>

                    {/* Section Cards List */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                      {currentSections.map((sec, sIdx) => (
                        <div
                          key={sec.id || sIdx}
                          style={{
                            background: '#141414',
                            border: '1px solid rgba(255, 255, 255, 0.1)',
                            borderRadius: '8px',
                            padding: '1rem'
                          }}
                        >
                          {/* Section Header Controls */}
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px', paddingBottom: '6px', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                              <span style={{ background: 'var(--primary-color)', color: '#0a0a0a', fontWeight: 800, fontSize: '0.75rem', padding: '2px 7px', borderRadius: '4px' }}>
                                #{sIdx + 1}
                              </span>
                              <span style={{ color: '#fff', fontSize: '0.85rem', fontWeight: 600 }}>
                                {sec.heading || `Heading Section ${sIdx + 1}`}
                              </span>
                            </div>
                            <div style={{ display: 'flex', gap: '4px', alignItems: 'center' }}>
                              {/* Move Up */}
                              <button
                                type="button"
                                disabled={sIdx === 0}
                                onClick={() => {
                                  if (sIdx === 0) return;
                                  const updated = [...currentSections];
                                  const temp = updated[sIdx - 1];
                                  updated[sIdx - 1] = updated[sIdx];
                                  updated[sIdx] = temp;
                                  setEditingBlog({ ...editingBlog, sections: updated });
                                }}
                                style={{
                                  background: 'rgba(255, 255, 255, 0.08)',
                                  border: 'none',
                                  color: sIdx === 0 ? '#525252' : '#e5e5e5',
                                  padding: '4px',
                                  borderRadius: '4px',
                                  cursor: sIdx === 0 ? 'not-allowed' : 'pointer'
                                }}
                                title="Move Section Up"
                              >
                                <ChevronUp size={15} />
                              </button>
                              {/* Move Down */}
                              <button
                                type="button"
                                disabled={sIdx === currentSections.length - 1}
                                onClick={() => {
                                  if (sIdx === currentSections.length - 1) return;
                                  const updated = [...currentSections];
                                  const temp = updated[sIdx + 1];
                                  updated[sIdx + 1] = updated[sIdx];
                                  updated[sIdx] = temp;
                                  setEditingBlog({ ...editingBlog, sections: updated });
                                }}
                                style={{
                                  background: 'rgba(255, 255, 255, 0.08)',
                                  border: 'none',
                                  color: sIdx === currentSections.length - 1 ? '#525252' : '#e5e5e5',
                                  padding: '4px',
                                  borderRadius: '4px',
                                  cursor: sIdx === currentSections.length - 1 ? 'not-allowed' : 'pointer'
                                }}
                                title="Move Section Down"
                              >
                                <ChevronDown size={15} />
                              </button>
                              {/* Delete Section */}
                              <button
                                type="button"
                                onClick={() => {
                                  if (currentSections.length <= 1) {
                                    onShowToast('Article must have at least one section', 'error');
                                    return;
                                  }
                                  const updated = currentSections.filter((_, i) => i !== sIdx);
                                  setEditingBlog({ ...editingBlog, sections: updated });
                                }}
                                style={{
                                  background: 'rgba(239, 68, 68, 0.15)',
                                  border: '1px solid rgba(239, 68, 68, 0.3)',
                                  color: '#f87171',
                                  padding: '4px',
                                  borderRadius: '4px',
                                  cursor: 'pointer'
                                }}
                                title="Remove Section"
                              >
                                <Trash2 size={14} />
                              </button>
                            </div>
                          </div>

                          {/* Heading Input */}
                          <div style={{ marginBottom: '10px' }}>
                            <label style={{ display: 'block', fontSize: '0.78rem', color: '#f1f5f9', marginBottom: '3px', fontWeight: 600 }}>
                              Section Heading / Subtitle *
                            </label>
                            <input
                              type="text"
                              value={sec.heading}
                              placeholder={`e.g. ${sIdx + 1}. Key Technical Architecture & Strategy`}
                              onChange={(e) => {
                                const updated = [...currentSections];
                                updated[sIdx] = { ...updated[sIdx], heading: e.target.value };
                                setEditingBlog({ ...editingBlog, sections: updated });
                              }}
                              style={{ width: '100%', padding: '7px 10px', borderRadius: '5px', background: '#1c1c1c', border: '1px solid #2e2e2e', color: '#fff', fontSize: '0.85rem' }}
                            />
                          </div>

                          {/* Section Image Drag & Drop / URL & Caption */}
                          <div
                            onDragEnter={(e) => {
                              e.preventDefault();
                              e.stopPropagation();
                              setDraggingBlogSectionIdx(sIdx);
                            }}
                            onDragOver={(e) => {
                              e.preventDefault();
                              e.stopPropagation();
                              if (e.dataTransfer) {
                                e.dataTransfer.dropEffect = 'copy';
                              }
                              setDraggingBlogSectionIdx(sIdx);
                            }}
                            onDragLeave={(e) => {
                              const related = e.relatedTarget as Node | null;
                              if (!related || !e.currentTarget.contains(related)) {
                                setDraggingBlogSectionIdx((prev) => (prev === sIdx ? null : prev));
                              }
                            }}
                            onDrop={(e) => {
                              e.preventDefault();
                              e.stopPropagation();
                              setDraggingBlogSectionIdx(null);
                              const droppedFile = e.dataTransfer?.files?.[0];
                              void handleBlogSectionImageFile(sIdx, droppedFile);
                            }}
                            style={{
                              background: draggingBlogSectionIdx === sIdx ? 'rgba(212, 175, 55, 0.12)' : '#0a0a0a',
                              padding: '10px',
                              borderRadius: '6px',
                              marginBottom: '10px',
                              border: `1.5px dashed ${
                                draggingBlogSectionIdx === sIdx ? 'var(--primary-color)' : 'rgba(212, 175, 55, 0.35)'
                              }`,
                              transition: 'border-color 0.2s ease, background 0.2s ease'
                            }}
                          >
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px', flexWrap: 'wrap', gap: '8px' }}>
                              <label style={{ fontSize: '0.76rem', color: '#93c5fd', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '5px' }}>
                                <ImageIcon size={13} />
                                {draggingBlogSectionIdx === sIdx
                                  ? `Drop image here for Section #${sIdx + 1}`
                                  : 'Section Image (Drag & Drop, Upload, or URL)'}
                              </label>
                              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                <label
                                  style={{
                                    display: 'inline-flex',
                                    alignItems: 'center',
                                    gap: '5px',
                                    padding: '4px 10px',
                                    borderRadius: '5px',
                                    background: 'rgba(212, 175, 55, 0.16)',
                                    border: '1px solid rgba(212, 175, 55, 0.45)',
                                    color: 'var(--primary-color)',
                                    fontSize: '0.72rem',
                                    fontWeight: 600,
                                    cursor: uploadingBlogSectionIdx === sIdx ? 'wait' : 'pointer'
                                  }}
                                >
                                  <UploadCloud size={13} />
                                  {uploadingBlogSectionIdx === sIdx ? 'Processing...' : sec.imageUrl ? 'Replace Image' : 'Upload Image'}
                                  <input
                                    type="file"
                                    accept="image/png,image/jpeg,image/webp,image/gif,image/avif"
                                    aria-label={`Upload image for section ${sIdx + 1}`}
                                    disabled={uploadingBlogSectionIdx === sIdx}
                                    onChange={(e) => {
                                      const file = e.target.files?.[0];
                                      e.target.value = '';
                                      void handleBlogSectionImageFile(sIdx, file);
                                    }}
                                    style={{ display: 'none' }}
                                  />
                                </label>
                                {sec.imageUrl && (
                                  <button
                                    type="button"
                                    onClick={() => {
                                      const updated = [...currentSections];
                                      updated[sIdx] = { ...updated[sIdx], imageUrl: '', imageCaption: '' };
                                      setEditingBlog({ ...editingBlog, sections: updated });
                                    }}
                                    style={{ background: 'transparent', border: 'none', color: '#a3a3a3', fontSize: '0.7rem', cursor: 'pointer', padding: 0 }}
                                  >
                                    Clear Image
                                  </button>
                                )}
                              </div>
                            </div>
                            <p style={{ margin: '0 0 8px', fontSize: '0.71rem', color: '#a3a3a3' }}>
                              Drag & drop a PNG, JPG, or WebP file anywhere in this box, click Upload Image, or paste a URL.
                            </p>
                            <div style={{ display: 'grid', gridTemplateColumns: sec.imageUrl ? '1fr 1fr 60px' : '1fr 1fr', gap: '8px', alignItems: 'center' }}>
                              <input
                                type="text"
                                value={isUploadedDataUrl(sec.imageUrl) ? '' : (sec.imageUrl || '')}
                                placeholder={isUploadedDataUrl(sec.imageUrl) ? 'Uploaded image active (or paste URL to replace)' : 'Section Image URL (https://...)'}
                                onChange={(e) => {
                                  const updated = [...currentSections];
                                  updated[sIdx] = { ...updated[sIdx], imageUrl: e.target.value };
                                  setEditingBlog({ ...editingBlog, sections: updated });
                                }}
                                style={{ padding: '6px 9px', borderRadius: '5px', background: '#1c1c1c', border: '1px solid #2e2e2e', color: '#fff', fontSize: '0.8rem' }}
                              />
                              <input
                                type="text"
                                value={sec.imageCaption || ''}
                                placeholder="Image Caption (e.g. Architecture benchmark)"
                                onChange={(e) => {
                                  const updated = [...currentSections];
                                  updated[sIdx] = { ...updated[sIdx], imageCaption: e.target.value };
                                  setEditingBlog({ ...editingBlog, sections: updated });
                                }}
                                style={{ padding: '6px 9px', borderRadius: '5px', background: '#1c1c1c', border: '1px solid #2e2e2e', color: '#fff', fontSize: '0.8rem' }}
                              />
                              {sec.imageUrl && sanitizeDisplayImageUrl(sec.imageUrl) && (
                                <div style={{ width: '60px', height: '36px', borderRadius: '4px', overflow: 'hidden', border: '1px solid rgba(59,130,246,0.5)', background: '#1c1c1c' }}>
                                  <img src={sanitizeDisplayImageUrl(sec.imageUrl)} alt="preview" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                </div>
                              )}
                            </div>
                          </div>

                          {/* Section Paragraphs */}
                          <div>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
                              <label style={{ fontSize: '0.78rem', color: '#f1f5f9', fontWeight: 600 }}>
                                Section Paragraphs * (Separate paragraphs with blank line / double Enter)
                              </label>
                              <span style={{ fontSize: '0.72rem', color: 'var(--primary-color)' }}>
                                {sec.paragraphs.filter(p => p.trim()).length} paragraphs
                              </span>
                            </div>
                            <textarea
                              rows={4}
                              value={sec.paragraphs.join('\n\n')}
                              placeholder="Write paragraph content under this heading...\n\nPress Enter twice to start another paragraph."
                              onChange={(e) => {
                                const paras = e.target.value.split('\n\n');
                                const updated = [...currentSections];
                                updated[sIdx] = { ...updated[sIdx], paragraphs: paras };
                                setEditingBlog({ ...editingBlog, sections: updated });
                              }}
                              style={{ width: '100%', padding: '8px 10px', borderRadius: '5px', background: '#1c1c1c', border: '1px solid #2e2e2e', color: '#fff', fontSize: '0.85rem', lineHeight: 1.5 }}
                            />
                          </div>
                        </div>
                      ))}

                      {/* Add Another Section Button */}
                      <button
                        type="button"
                        onClick={() => {
                          const newSec: BlogSection = {
                            id: `sec-${Date.now()}`,
                            heading: `${currentSections.length + 1}. `,
                            paragraphs: ['Write paragraph content for this section...'],
                            imageUrl: '',
                            imageCaption: ''
                          };
                          setEditingBlog({ ...editingBlog, sections: [...currentSections, newSec] });
                        }}
                        style={{
                          background: 'rgba(212, 175, 55, 0.08)',
                          border: '1px dashed var(--primary-color)',
                          color: 'var(--primary-color)',
                          padding: '9px',
                          borderRadius: '8px',
                          cursor: 'pointer',
                          fontSize: '0.82rem',
                          fontWeight: 600,
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          gap: '6px'
                        }}
                      >
                        <Plus size={15} /> + Add Another Heading & Content Section
                      </button>
                    </div>
                  </div>

                  {/* 5. ADDITIONAL GALLERY PHOTOS MANAGER */}
                  <div
                    onDragEnter={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      setIsDraggingBlogGallery(true);
                    }}
                    onDragOver={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      if (e.dataTransfer) {
                        e.dataTransfer.dropEffect = 'copy';
                      }
                      setIsDraggingBlogGallery(true);
                    }}
                    onDragLeave={(e) => {
                      const related = e.relatedTarget as Node | null;
                      if (!related || !e.currentTarget.contains(related)) {
                        setIsDraggingBlogGallery(false);
                      }
                    }}
                    onDrop={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      setIsDraggingBlogGallery(false);
                      void handleBlogGalleryFiles(e.dataTransfer?.files);
                    }}
                    style={{
                      background: isDraggingBlogGallery ? 'rgba(212, 175, 55, 0.12)' : '#0a0a0a',
                      padding: '1rem',
                      borderRadius: '8px',
                      border: `1.5px dashed ${isDraggingBlogGallery ? 'var(--primary-color)' : 'rgba(212, 175, 55, 0.35)'}`,
                      marginBottom: '1.25rem',
                      transition: 'border-color 0.2s ease, background 0.2s ease'
                    }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px', flexWrap: 'wrap', gap: '8px' }}>
                      <label style={{ fontSize: '0.85rem', color: 'var(--primary-color)', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <ImageIcon size={15} /> Extra Article Showcase Photos ({editingBlog.images?.length || 0})
                      </label>
                      <label
                        style={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '6px',
                          padding: '5px 11px',
                          borderRadius: '6px',
                          background: 'rgba(212, 175, 55, 0.16)',
                          border: '1px solid rgba(212, 175, 55, 0.45)',
                          color: 'var(--primary-color)',
                          fontSize: '0.76rem',
                          fontWeight: 600,
                          cursor: isUploadingBlogGallery ? 'wait' : 'pointer'
                        }}
                      >
                        <UploadCloud size={14} />
                        {isUploadingBlogGallery ? 'Processing...' : 'Upload Photos'}
                        <input
                          type="file"
                          multiple
                          accept="image/png,image/jpeg,image/webp,image/gif,image/avif"
                          aria-label="Upload extra article gallery photos"
                          disabled={isUploadingBlogGallery}
                          onChange={(e) => {
                            const files = e.target.files ? Array.from(e.target.files) : [];
                            e.target.value = '';
                            void handleBlogGalleryFiles(files);
                          }}
                          style={{ display: 'none' }}
                        />
                      </label>
                    </div>

                    <div
                      style={{
                        padding: '0.85rem',
                        borderRadius: '6px',
                        background: isDraggingBlogGallery ? 'rgba(212, 175, 55, 0.16)' : '#141414',
                        border: `1px dashed ${isDraggingBlogGallery ? 'var(--primary-color)' : 'rgba(255, 255, 255, 0.16)'}`,
                        textAlign: 'center',
                        marginBottom: '12px',
                        color: isDraggingBlogGallery ? 'var(--primary-color)' : '#a8a29e',
                        fontSize: '0.76rem',
                        fontWeight: isDraggingBlogGallery ? 700 : 500
                      }}
                    >
                      {isDraggingBlogGallery
                        ? 'Drop photos here to add them to this blog gallery'
                        : 'Drag & drop one or more PNG, JPG, or WebP photos here, or click Upload Photos above.'}
                    </div>

                    {/* Existing gallery images list */}
                    {editingBlog.images && editingBlog.images.length > 0 && (
                      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(110px, 1fr))', gap: '8px', marginBottom: '12px' }}>
                        {editingBlog.images.map((imgUrl, idx) => (
                          <div
                            key={idx}
                            style={{
                              position: 'relative',
                              height: '75px',
                              borderRadius: '6px',
                              overflow: 'hidden',
                              border: '1px solid rgba(255,255,255,0.15)',
                              background: '#1c1c1c'
                            }}
                          >
                            <img src={sanitizeDisplayImageUrl(imgUrl) || imgUrl} alt={`gallery ${idx + 1}`} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                            <button
                              type="button"
                              onClick={() => {
                                const updated = editingBlog.images?.filter((_, i) => i !== idx);
                                setEditingBlog({ ...editingBlog, images: updated });
                              }}
                              style={{
                                position: 'absolute',
                                top: '2px',
                                right: '2px',
                                background: 'rgba(239, 68, 68, 0.9)',
                                border: 'none',
                                color: '#fff',
                                borderRadius: '4px',
                                width: '20px',
                                height: '20px',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                cursor: 'pointer'
                              }}
                              title="Remove photo"
                            >
                              <X size={12} />
                            </button>
                            <span style={{ position: 'absolute', bottom: '2px', left: '2px', background: 'rgba(0,0,0,0.6)', color: '#fff', fontSize: '0.65rem', padding: '1px 4px', borderRadius: '2px' }}>
                              #{idx + 1}
                            </span>
                          </div>
                        ))}
                      </div>
                    )}

                    {/* Add Image input */}
                    <div style={{ display: 'flex', gap: '8px' }}>
                      <input
                        type="text"
                        placeholder="Paste additional image URL (e.g. Unsplash, postimg, CDN)..."
                        value={newGalleryImageUrl}
                        onChange={(e) => setNewGalleryImageUrl(e.target.value)}
                        style={{ flex: 1, padding: '7px 12px', borderRadius: '6px', background: '#1c1c1c', border: '1px solid #2e2e2e', color: '#fff', fontSize: '0.85rem' }}
                      />
                      <button
                        type="button"
                        onClick={() => {
                          if (!newGalleryImageUrl.trim()) {
                            onShowToast('Please enter an image URL', 'error');
                            return;
                          }
                          const current = editingBlog.images || [];
                          setEditingBlog({
                            ...editingBlog,
                            images: [...current, newGalleryImageUrl.trim()]
                          });
                          setNewGalleryImageUrl('');
                          onShowToast('Image added to gallery!', 'success');
                        }}
                        className="btn btn-outline"
                        style={{ padding: '6px 14px', fontSize: '0.8rem', whiteSpace: 'nowrap' }}
                      >
                        + Add URL
                      </button>
                    </div>
                  </div>

                  {/* Inline Validation / Cloud Sync Error Banner */}
                  {blogFormError && (
                    <div
                      role="alert"
                      style={{
                        background: 'rgba(239, 68, 68, 0.14)',
                        border: '1px solid rgba(239, 68, 68, 0.55)',
                        color: '#fecaca',
                        padding: '10px 12px',
                        borderRadius: '8px',
                        marginBottom: '12px',
                        fontSize: '0.82rem',
                        fontWeight: 600,
                        lineHeight: 1.45
                      }}
                    >
                      {blogFormError}
                    </div>
                  )}

                  {/* Form Action Buttons */}
                  <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end', paddingTop: '8px', borderTop: '1px solid rgba(255,255,255,0.08)' }}>
                    <button
                      type="button"
                      disabled={isPublishingBlog}
                      onClick={() => {
                        setBlogFormError('');
                        setEditingBlog(null);
                        setIsCreatingBlog(false);
                        setNewGalleryImageUrl('');
                      }}
                      className="btn btn-outline"
                      style={{ padding: '7px 16px', fontSize: '0.85rem' }}
                    >
                      Cancel
                    </button>
                    <button
                      type="button"
                      disabled={isPublishingBlog}
                      onClick={() => {
                        void (async () => {
                          const prep = prepareBlogForPublish({
                            editingBlog,
                            currentSections,
                            existingBlogs: data.blogs,
                            isCreating: isCreatingBlog
                          });

                          if (!prep.ok) {
                            setBlogFormError(prep.error);
                            onShowToast(prep.error, 'error');
                            return;
                          }

                          setBlogFormError('');
                          setIsPublishingBlog(true);
                          try {
                            const saved = isCreatingBlog
                              ? await onAddBlog(prep.finalizedBlog)
                              : await onUpdateBlog(prep.finalizedBlog);

                            if (saved === false) {
                              setBlogFormError(
                                'Cloud save failed — your article draft is still open above. Check your authorized admin login or image budget and try publishing again.'
                              );
                              return;
                            }

                            setBlogCategoryFilter('All');
                            setBlogSearch('');
                            setEditingBlog(null);
                            setIsCreatingBlog(false);
                            setNewGalleryImageUrl('');
                            onShowToast(
                              isCreatingBlog
                                ? '🎉 Complete blog article published live to cloud!'
                                : 'Article changes published live to cloud!',
                              'success'
                            );
                          } finally {
                            setIsPublishingBlog(false);
                          }
                        })();
                      }}
                      className="btn btn-primary"
                      style={{
                        padding: '7px 18px',
                        fontSize: '0.85rem',
                        opacity: isPublishingBlog ? 0.75 : 1,
                        cursor: isPublishingBlog ? 'wait' : 'pointer'
                      }}
                    >
                      <Save size={14} />{' '}
                      {isPublishingBlog
                        ? 'Publishing...'
                        : isCreatingBlog
                          ? 'Publish Complete Blog'
                          : 'Save Changes'}
                    </button>
                  </div>
                </div>
              );
            })()}

            {/* Category Filter Pills in Admin Panel */}
            <div style={{ marginBottom: '1rem' }}>
              <div style={{ fontSize: '0.78rem', color: 'var(--text-light)', marginBottom: '6px', fontWeight: 600 }}>
                Filter by Category:
              </div>
              <div style={{ display: 'flex', gap: '6px', overflowX: 'auto', paddingBottom: '6px' }}>
                {['All', ...BLOG_CATEGORIES].map((cat) => {
                  const isSelected = blogCategoryFilter === cat;
                  return (
                    <button
                      key={cat}
                      type="button"
                      onClick={() => setBlogCategoryFilter(cat)}
                      style={{
                        padding: '4px 10px',
                        borderRadius: '12px',
                        border: '1px solid',
                        borderColor: isSelected ? 'var(--primary-color)' : '#2e2e2e',
                        background: isSelected ? 'rgba(212, 175, 55, 0.2)' : '#1c1c1c',
                        color: isSelected ? 'var(--primary-color)' : '#a3a3a3',
                        fontSize: '0.75rem',
                        cursor: 'pointer',
                        whiteSpace: 'nowrap'
                      }}
                    >
                      {cat}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Blog Search Filter */}
            <div style={{ marginBottom: '1rem' }}>
              <input
                type="text"
                placeholder="Search articles by title, keyword, or author..."
                value={blogSearch}
                onChange={(e) => setBlogSearch(e.target.value)}
                style={{
                  width: '100%',
                  padding: '9px 12px',
                  borderRadius: '6px',
                  background: '#141414',
                  border: '1px solid #2e2e2e',
                  color: '#fff',
                  fontSize: '0.85rem'
                }}
              />
            </div>

            {/* Blog List with category badges and image indicators */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {data.blogs
                .filter((b) => {
                  const matchesSearch = b.title.toLowerCase().includes(blogSearch.toLowerCase()) ||
                    (b.category && b.category.toLowerCase().includes(blogSearch.toLowerCase()));
                  const matchesCategory = blogCategoryFilter === 'All' || b.category === blogCategoryFilter;
                  return matchesSearch && matchesCategory;
                })
                .map((blog) => {
                  const imageCount = collectArticleImages(blog.imageUrl, blog.sections, blog.images).length || 1;
                  return (
                    <div
                      key={blog.id}
                      style={{
                        background: '#141414',
                        padding: '0.85rem 1rem',
                        borderRadius: '8px',
                        border: '1px solid rgba(255, 255, 255, 0.08)',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '12px'
                      }}
                    >
                      <img
                        src={blog.imageUrl}
                        alt={blog.title}
                        style={{ width: '56px', height: '42px', objectFit: 'cover', borderRadius: '4px' }}
                      />
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <h4 style={{ margin: 0, color: '#fff', fontSize: '0.92rem', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                          {blog.title}
                        </h4>
                        <div style={{ display: 'flex', gap: '8px', alignItems: 'center', marginTop: '3px', flexWrap: 'wrap' }}>
                          <span style={{ fontSize: '0.74rem', color: 'var(--primary-color)', background: 'rgba(212, 175, 55, 0.1)', padding: '1px 6px', borderRadius: '4px' }}>
                            {blog.category || '🌐 Web Development'}
                          </span>
                          <span style={{ fontSize: '0.74rem', color: 'var(--text-light)' }}>
                            {blog.readTime || '5 min'}
                          </span>
                          {imageCount > 1 && (
                            <span style={{ fontSize: '0.72rem', color: '#93c5fd', background: 'rgba(59, 130, 246, 0.15)', padding: '1px 6px', borderRadius: '4px' }}>
                              📷 {imageCount} photos
                            </span>
                          )}
                        </div>
                      </div>
                      <div style={{ display: 'flex', gap: '6px' }}>
                        <button
                          onClick={() => {
                            const normalizedSections = ensureBlogSections(blog);
                            setBlogFormError('');
                            setEditingBlog({
                              ...blog,
                              sections: normalizedSections,
                              images: extractExtraArticleImages(blog.imageUrl, normalizedSections, blog.images || [])
                            });
                            setIsCreatingBlog(false);
                            setNewGalleryImageUrl('');
                          }}
                          style={{
                            background: 'rgba(212, 175, 55, 0.15)',
                            border: '1px solid rgba(212, 175, 55, 0.3)',
                            color: 'var(--primary-color)',
                            padding: '6px',
                            borderRadius: '6px',
                            cursor: 'pointer'
                          }}
                          title="Edit Article, Headings & Images"
                        >
                          <Edit2 size={15} />
                        </button>
                        <button
                          onClick={() => setDeleteConfirmTarget({ type: 'blog', id: blog.id, title: blog.title })}
                          style={{
                            background: 'rgba(239, 68, 68, 0.15)',
                            border: '1px solid rgba(239, 68, 68, 0.3)',
                            color: '#f87171',
                            padding: '6px',
                            borderRadius: '6px',
                            cursor: 'pointer'
                          }}
                          title="Delete Article"
                        >
                          <Trash2 size={15} />
                        </button>
                      </div>
                    </div>
                  );
                })}
            </div>
          </div>
        )}

        {/* TAB 5: TEAM MEMBERS - FULL MULTI-MEMBER CRUD */}
        {activeTab === 'team' && (
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
              <div>
                <h3 style={{ margin: 0, color: 'var(--primary-color)', fontSize: '1.15rem' }}>
                  Team Members ({data.team.length})
                </h3>
                <p style={{ margin: 0, color: 'var(--text-light)', fontSize: '0.8rem' }}>
                  Add team members, leadership, and developers to front panel
                </p>
              </div>
              {!isCreatingTeamMember && !editingTeamMember && (
                <button
                  onClick={() => {
                    setIsCreatingTeamMember(true);
                    setEditingTeamMember({
                      id: `team-${Date.now()}`,
                      name: '',
                      title: 'Senior Software Engineer',
                      bio: 'Experienced technologist driving high performance web and app solutions.',
                      skills: [...DEFAULT_MEMBER_SKILLS],
                      imageUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80',
                      socials: {},
                      extraLinks: []
                    });
                    setEditingTeamSkills([...DEFAULT_MEMBER_SKILLS]);
                    setNewSkillInput('');
                    setEditingTeamLinks([
                      createEditableAccountLink('linkedin', '', ''),
                      createEditableAccountLink('instagram', '', '')
                    ]);
                    setNewAccountPreset('instagramCompany');
                    setNewAccountLabel('');
                    setNewAccountUrl('');
                  }}
                  className="btn btn-primary"
                  style={{ padding: '6px 14px', fontSize: '0.8rem' }}
                >
                  <Plus size={16} /> Add Team Member
                </button>
              )}
            </div>

            {/* Team Member Form */}
            {(isCreatingTeamMember || editingTeamMember) && (
              <div style={{ background: '#141414', padding: '1.25rem', borderRadius: '10px', marginBottom: '1.5rem', border: '1px solid var(--primary-color)' }}>
                <h4 style={{ color: '#fff', marginBottom: '1rem', fontSize: '1rem' }}>
                  {isCreatingTeamMember ? 'Add New Team Member' : `Edit: ${editingTeamMember?.name}`}
                </h4>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', marginBottom: '1rem' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.8rem', color: 'var(--text-light)', marginBottom: '4px' }}>
                      Full Name *
                    </label>
                    <input
                      type="text"
                      value={editingTeamMember?.name || ''}
                      onChange={(e) => setEditingTeamMember(editingTeamMember ? { ...editingTeamMember, name: e.target.value } : null)}
                      style={{ width: '100%', padding: '8px 12px', borderRadius: '6px', background: '#1c1c1c', border: '1px solid #2e2e2e', color: '#fff' }}
                      required
                    />
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.8rem', color: 'var(--text-light)', marginBottom: '4px' }}>
                      Title / Role *
                    </label>
                    <input
                      type="text"
                      value={editingTeamMember?.title || ''}
                      onChange={(e) => setEditingTeamMember(editingTeamMember ? { ...editingTeamMember, title: e.target.value } : null)}
                      style={{ width: '100%', padding: '8px 12px', borderRadius: '6px', background: '#1c1c1c', border: '1px solid #2e2e2e', color: '#fff' }}
                      required
                    />
                  </div>
                </div>

                <ImageUploadField
                  id="team-member-photo"
                  label="Team Member Photo"
                  value={editingTeamMember?.imageUrl || ''}
                  onChange={(nextUrl) =>
                    setEditingTeamMember(
                      editingTeamMember ? { ...editingTeamMember, imageUrl: nextUrl } : null
                    )
                  }
                  onError={(msg) => onShowToast(msg, 'error')}
                  previewFallbackText={deriveInitials(editingTeamMember?.name || 'Team Member')}
                  maxDimension={TEAM_PHOTO_MAX_DIMENSION}
                  urlPlaceholder="https://example.com/team-portrait.jpg"
                  helperText="Upload a portrait from your device or paste an image URL. Automatically optimized for fast loading."
                  uploadButtonLabel="Upload Photo"
                />

                <div style={{ marginBottom: '1rem' }}>
                  <label style={{ display: 'block', fontSize: '0.8rem', color: 'var(--text-light)', marginBottom: '4px' }}>
                    Short Biography
                  </label>
                  <textarea
                    rows={3}
                    value={editingTeamMember?.bio || ''}
                    onChange={(e) => setEditingTeamMember(editingTeamMember ? { ...editingTeamMember, bio: e.target.value } : null)}
                    style={{ width: '100%', padding: '8px 12px', borderRadius: '6px', background: '#1c1c1c', border: '1px solid #2e2e2e', color: '#fff' }}
                  />
                </div>

                {/* Skills & Technical Specializations Editor */}
                <div style={{ marginBottom: '1rem', padding: '0.9rem', borderRadius: '8px', background: 'rgba(20, 20, 20, 0.85)', border: '1px solid rgba(255, 255, 255, 0.1)' }}>
                  <h5 style={{ color: 'var(--primary-color)', fontSize: '0.88rem', margin: '0 0 4px' }}>
                    Skills &amp; Technical Specializations ({editingTeamSkills.length})
                  </h5>
                  <p style={{ margin: '0 0 0.65rem', fontSize: '0.72rem', color: 'var(--text-light)' }}>
                    Add core technical skills or specializations shown on the team member profile view.
                  </p>

                  {editingTeamSkills.length > 0 && (
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', marginBottom: '0.75rem' }}>
                      {editingTeamSkills.map((skill) => (
                        <span
                          key={skill}
                          style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '6px',
                            padding: '4px 8px',
                            borderRadius: '6px',
                            background: '#1c1c1c',
                            border: '1px solid rgba(212, 175, 55, 0.35)',
                            color: '#e2e8f0',
                            fontSize: '0.74rem',
                            fontWeight: 600
                          }}
                        >
                          <span>{skill}</span>
                          <button
                            type="button"
                            aria-label={`Remove skill ${skill}`}
                            onClick={() => setEditingTeamSkills((prev) => removeMemberSkill(prev, skill))}
                            style={{
                              background: 'none',
                              border: 'none',
                              color: '#f87171',
                              cursor: 'pointer',
                              padding: 0,
                              display: 'inline-flex',
                              alignItems: 'center'
                            }}
                          >
                            <X size={13} />
                          </button>
                        </span>
                      ))}
                    </div>
                  )}

                  <div style={{ display: 'flex', gap: '6px' }}>
                    <input
                      type="text"
                      aria-label="Add skill or specialization"
                      placeholder="e.g. Next.js 15, Shopify Liquid, Cloud Architecture (comma-separated)"
                      value={newSkillInput}
                      onChange={(e) => setNewSkillInput(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          e.preventDefault();
                          if (!newSkillInput.trim()) return;
                          setEditingTeamSkills((prev) => addMemberSkill(prev, newSkillInput));
                          setNewSkillInput('');
                        }
                      }}
                      style={{ flex: 1, padding: '6px 10px', borderRadius: '6px', background: '#1c1c1c', border: '1px solid #2e2e2e', color: '#fff', fontSize: '0.78rem' }}
                    />
                    <button
                      type="button"
                      onClick={() => {
                        if (!newSkillInput.trim()) {
                          onShowToast('Please enter a skill or specialization', 'error');
                          return;
                        }
                        setEditingTeamSkills((prev) => addMemberSkill(prev, newSkillInput));
                        setNewSkillInput('');
                      }}
                      className="btn btn-primary"
                      style={{ padding: '6px 12px', fontSize: '0.78rem', display: 'inline-flex', alignItems: 'center', gap: '4px', whiteSpace: 'nowrap' }}
                    >
                      <Plus size={14} /> Add Skill
                    </button>
                  </div>
                </div>

                {/* Unified Create & Delete Account Links Editor */}
                <div style={{ marginBottom: '1.25rem', padding: '0.9rem', borderRadius: '8px', background: 'rgba(20, 20, 20, 0.85)', border: '1px solid rgba(255, 255, 255, 0.1)' }}>
                  <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', alignItems: 'center', gap: '8px', marginBottom: '0.75rem' }}>
                    <div>
                      <h5 style={{ color: 'var(--primary-color)', fontSize: '0.88rem', margin: 0 }}>
                        Account &amp; Social Links ({editingTeamLinks.length})
                      </h5>
                      <p style={{ margin: '2px 0 0', fontSize: '0.72rem', color: 'var(--text-light)' }}>
                        Create new links (CEO accounts, Company pages, Facebook, Instagram, etc.) or delete any existing link.
                      </p>
                    </div>
                  </div>

                  {/* Quick Create Buttons */}
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', marginBottom: '0.85rem' }}>
                    {(
                      [
                        ['instagram', 'Instagram (CEO)'],
                        ['instagramCompany', 'Instagram (Company)'],
                        ['linkedin', 'LinkedIn (CEO)'],
                        ['linkedinCompany', 'LinkedIn (Company)'],
                        ['facebook', 'Facebook'],
                        ['youtube', 'YouTube'],
                        ['website', 'Custom Link']
                      ] as Array<[AccountLinkPreset, string]>
                    ).map(([presetKey, shortLabel]) => (
                      <button
                        key={presetKey}
                        type="button"
                        onClick={() => {
                          setEditingTeamLinks((prev) => [
                            ...prev,
                            createEditableAccountLink(presetKey)
                          ]);
                        }}
                        className="btn btn-outline"
                        style={{ padding: '4px 9px', fontSize: '0.72rem', display: 'inline-flex', alignItems: 'center', gap: '4px' }}
                      >
                        <Plus size={12} /> {shortLabel}
                      </button>
                    ))}
                  </div>

                  {/* Active Account Links List (each row editable & deletable) */}
                  {editingTeamLinks.length === 0 ? (
                    <p style={{ margin: '0 0 0.85rem', fontSize: '0.78rem', color: '#a3a3a3' }}>
                      No account links attached yet. Use the quick buttons above or the form below to create a link.
                    </p>
                  ) : (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginBottom: '0.9rem' }}>
                      {editingTeamLinks.map((linkItem, index) => {
                        const presetMeta = getAccountPresetMeta(linkItem.preset);
                        return (
                          <div
                            key={linkItem.id}
                            style={{
                              display: 'flex',
                              flexDirection: 'column',
                              gap: '6px',
                              background: '#1c1c1c',
                              padding: '8px 10px',
                              borderRadius: '8px',
                              border: '1px solid #2e2e2e'
                            }}
                          >
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr auto', gap: '6px', alignItems: 'center' }}>
                              <select
                                aria-label={`Account link ${index + 1} type`}
                                value={linkItem.preset}
                                onChange={(e) => {
                                  const nextPreset = e.target.value as AccountLinkPreset;
                                  const nextMeta = getAccountPresetMeta(nextPreset);
                                  setEditingTeamLinks((prev) =>
                                    prev.map((item) =>
                                      item.id === linkItem.id
                                        ? {
                                            ...item,
                                            preset: nextMeta.preset,
                                            platform: nextMeta.platform,
                                            label:
                                              !item.label || item.label === presetMeta.label
                                                ? nextMeta.label
                                                : item.label
                                          }
                                        : item
                                    )
                                  );
                                }}
                                style={{ padding: '6px 8px', borderRadius: '6px', background: '#0a0a0a', border: '1px solid #404040', color: '#fff', fontSize: '0.76rem' }}
                              >
                                {ACCOUNT_LINK_PRESETS.map((opt) => (
                                  <option key={opt.preset} value={opt.preset}>
                                    {opt.label}
                                  </option>
                                ))}
                              </select>

                              <input
                                type="text"
                                aria-label={`Account link ${index + 1} label`}
                                placeholder="Display label"
                                value={linkItem.label}
                                onChange={(e) => {
                                  const nextVal = e.target.value;
                                  setEditingTeamLinks((prev) =>
                                    prev.map((item) => (item.id === linkItem.id ? { ...item, label: nextVal } : item))
                                  );
                                }}
                                style={{ padding: '6px 8px', borderRadius: '6px', background: '#0a0a0a', border: '1px solid #404040', color: '#fff', fontSize: '0.76rem' }}
                              />

                              <button
                                type="button"
                                aria-label={`Delete ${linkItem.label || presetMeta.label} link`}
                                title={`Delete ${linkItem.label || presetMeta.label} link`}
                                onClick={() => setEditingTeamLinks((prev) => removeEditableAccountLink(prev, linkItem.id))}
                                style={{
                                  background: 'rgba(239, 68, 68, 0.15)',
                                  border: '1px solid rgba(239, 68, 68, 0.35)',
                                  color: '#f87171',
                                  padding: '5px 8px',
                                  borderRadius: '6px',
                                  cursor: 'pointer',
                                  display: 'inline-flex',
                                  alignItems: 'center',
                                  gap: '4px',
                                  fontSize: '0.72rem',
                                  fontWeight: 600
                                }}
                              >
                                <Trash2 size={13} /> Delete
                              </button>
                            </div>

                            <input
                              type="url"
                              aria-label={`Account link ${index + 1} URL`}
                              placeholder={presetMeta.placeholder}
                              value={linkItem.url}
                              onChange={(e) => {
                                const nextUrl = e.target.value;
                                setEditingTeamLinks((prev) =>
                                  prev.map((item) => (item.id === linkItem.id ? { ...item, url: nextUrl } : item))
                                );
                              }}
                              style={{ width: '100%', padding: '6px 10px', borderRadius: '6px', background: '#0a0a0a', border: '1px solid #404040', color: '#fff', fontSize: '0.78rem' }}
                            />
                          </div>
                        );
                      })}
                    </div>
                  )}

                  {/* Explicit Create New Account Link Bar */}
                  <div style={{ paddingTop: '0.75rem', borderTop: '1px solid rgba(255, 255, 255, 0.08)' }}>
                    <p style={{ margin: '0 0 6px', fontSize: '0.75rem', color: 'var(--primary-color)', fontWeight: 600 }}>
                      Create New Account Link
                    </p>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '6px', marginBottom: '6px' }}>
                      <select
                        aria-label="New account link type"
                        value={newAccountPreset}
                        onChange={(e) => setNewAccountPreset(e.target.value as AccountLinkPreset)}
                        style={{ padding: '6px 8px', borderRadius: '6px', background: '#1c1c1c', border: '1px solid #2e2e2e', color: '#fff', fontSize: '0.78rem' }}
                      >
                        {ACCOUNT_LINK_PRESETS.map((opt) => (
                          <option key={opt.preset} value={opt.preset}>
                            {opt.label}
                          </option>
                        ))}
                      </select>
                      <input
                        type="text"
                        aria-label="New account link label"
                        placeholder={`Label (default: ${getAccountPresetMeta(newAccountPreset).label})`}
                        value={newAccountLabel}
                        onChange={(e) => setNewAccountLabel(e.target.value)}
                        style={{ padding: '6px 8px', borderRadius: '6px', background: '#1c1c1c', border: '1px solid #2e2e2e', color: '#fff', fontSize: '0.78rem' }}
                      />
                    </div>
                    <div style={{ display: 'flex', gap: '6px' }}>
                      <input
                        type="url"
                        aria-label="New account link URL"
                        placeholder={getAccountPresetMeta(newAccountPreset).placeholder}
                        value={newAccountUrl}
                        onChange={(e) => setNewAccountUrl(e.target.value)}
                        style={{ flex: 1, padding: '6px 10px', borderRadius: '6px', background: '#1c1c1c', border: '1px solid #2e2e2e', color: '#fff', fontSize: '0.78rem' }}
                      />
                      <button
                        type="button"
                        onClick={() => {
                          if (!newAccountUrl.trim()) {
                            onShowToast('Please enter a URL for the account link', 'error');
                            return;
                          }
                          setEditingTeamLinks((prev) => [
                            ...prev,
                            createEditableAccountLink(newAccountPreset, newAccountLabel, newAccountUrl)
                          ]);
                          setNewAccountLabel('');
                          setNewAccountUrl('');
                        }}
                        className="btn btn-primary"
                        style={{ padding: '6px 12px', fontSize: '0.78rem', display: 'inline-flex', alignItems: 'center', gap: '4px', whiteSpace: 'nowrap' }}
                      >
                        <Plus size={14} /> Create Link
                      </button>
                    </div>
                  </div>
                </div>

                <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
                  <button
                    type="button"
                    onClick={() => {
                      setEditingTeamMember(null);
                      setIsCreatingTeamMember(false);
                      setEditingTeamSkills([]);
                      setNewSkillInput('');
                      setEditingTeamLinks([]);
                    }}
                    className="btn btn-outline"
                    style={{ padding: '6px 14px', fontSize: '0.85rem' }}
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      if (!editingTeamMember?.name.trim() || !editingTeamMember?.title.trim()) {
                        onShowToast('Please provide member name and title', 'error');
                        return;
                      }
                      const { socials, extraLinks } = editableLinksToMemberSocials(editingTeamLinks);
                      const pendingSkills = newSkillInput.trim()
                        ? addMemberSkill(editingTeamSkills, newSkillInput)
                        : editingTeamSkills;
                      const sanitizedSkills = sanitizeMemberSkills(pendingSkills);
                      const sanitizedMember: TeamMemberData = {
                        ...editingTeamMember,
                        name: editingTeamMember.name.trim(),
                        title: editingTeamMember.title.trim(),
                        imageUrl: sanitizeDisplayImageUrl(editingTeamMember.imageUrl),
                        skills: sanitizedSkills,
                        socials,
                        extraLinks
                      };
                      if (isCreatingTeamMember) {
                        onAddTeamMember(sanitizedMember);
                        onShowToast(`Added ${sanitizedMember.name} to the team!`, 'success');
                      } else {
                        onUpdateTeamMember(sanitizedMember);
                        onShowToast(`Updated ${sanitizedMember.name}!`, 'success');
                      }
                      setEditingTeamMember(null);
                      setIsCreatingTeamMember(false);
                      setEditingTeamSkills([]);
                      setNewSkillInput('');
                      setEditingTeamLinks([]);
                    }}
                    className="btn btn-primary"
                    style={{ padding: '6px 16px', fontSize: '0.85rem' }}
                  >
                    <Save size={14} /> Save Team Member
                  </button>
                </div>
              </div>
            )}

            {/* Team Members List */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {data.team.map((member) => {
                const configuredLinks = collectTeamSocialLinks(member);
                return (
                <div
                  key={member.id}
                  style={{
                    background: '#141414',
                    padding: '1rem',
                    borderRadius: '8px',
                    border: '1px solid rgba(255, 255, 255, 0.08)',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '12px'
                  }}
                >
                  <ClientAvatar name={member.name} imageUrl={member.imageUrl} size={50} />
                  <div style={{ flex: 1 }}>
                    <h4 style={{ margin: 0, color: '#fff', fontSize: '0.95rem' }}>{member.name}</h4>
                    <p style={{ margin: '2px 0 0', fontSize: '0.8rem', color: 'var(--primary-color)', fontWeight: 600 }}>
                      {member.title}
                    </p>
                    <p style={{ margin: '2px 0 0', fontSize: '0.75rem', color: 'var(--text-light)', maxWidth: '380px' }}>
                      {member.bio}
                    </p>
                    <p style={{ margin: '4px 0 0', fontSize: '0.72rem', color: '#a3a3a3' }}>
                      {resolveMemberSkills(member).length} specializations &bull; {configuredLinks.length} profile {configuredLinks.length === 1 ? 'link' : 'links'} active
                      {configuredLinks.length > 0 ? `: ${configuredLinks.map((l) => l.label).slice(0, 4).join(', ')}${configuredLinks.length > 4 ? ` +${configuredLinks.length - 4} more` : ''}` : ''}
                    </p>
                  </div>
                  <div style={{ display: 'flex', gap: '6px' }}>
                    <button
                      onClick={() => {
                        const resolvedSkills = resolveMemberSkills(member);
                        setEditingTeamMember({
                          ...member,
                          skills: resolvedSkills,
                          socials: member.socials || {},
                          extraLinks: member.extraLinks || []
                        });
                        setEditingTeamSkills(resolvedSkills);
                        setNewSkillInput('');
                        setEditingTeamLinks(memberToEditableLinks(member));
                        setNewAccountPreset('instagramCompany');
                        setNewAccountLabel('');
                        setNewAccountUrl('');
                        setIsCreatingTeamMember(false);
                      }}
                      style={{
                        background: 'rgba(212, 175, 55, 0.15)',
                        border: '1px solid rgba(212, 175, 55, 0.3)',
                        color: 'var(--primary-color)',
                        padding: '6px',
                        borderRadius: '6px',
                        cursor: 'pointer'
                      }}
                      title="Edit Member"
                    >
                      <Edit2 size={16} />
                    </button>
                    {data.team.length > 1 && (
                      <button
                        onClick={() => setDeleteConfirmTarget({ type: 'team', id: member.id, title: member.name })}
                        style={{
                          background: 'rgba(239, 68, 68, 0.15)',
                          border: '1px solid rgba(239, 68, 68, 0.3)',
                          color: '#f87171',
                          padding: '6px',
                          borderRadius: '6px',
                          cursor: 'pointer'
                        }}
                        title="Delete Member"
                      >
                        <Trash2 size={16} />
                      </button>
                    )}
                  </div>
                </div>
                );
              })}
            </div>
          </div>
        )}

        {/* TAB 6: TESTIMONIALS */}
        {activeTab === 'testimonials' && (
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
              <div>
                <h3 style={{ margin: 0, color: 'var(--primary-color)', fontSize: '1.15rem' }}>
                  Client Testimonials
                </h3>
                <p style={{ margin: 0, color: 'var(--text-light)', fontSize: '0.8rem' }}>
                  Manage verified reviews and star ratings
                </p>
              </div>
              {!isCreatingTestimonial && !editingTestimonial && (
                <button
                  onClick={() => {
                    setIsCreatingTestimonial(true);
                    setEditingTestimonial({
                      id: `testimonial-${Date.now()}`,
                      name: '',
                      role: 'Director of Operations',
                      initials: 'D.O.',
                      imageUrl: '',
                      quote: "Axe's Era delivered exceptional results on time.",
                      rating: 5
                    });
                  }}
                  className="btn btn-primary"
                  style={{ padding: '6px 14px', fontSize: '0.8rem' }}
                >
                  <Plus size={16} /> Add Review
                </button>
              )}
            </div>

            {/* Testimonial Form */}
            {(isCreatingTestimonial || editingTestimonial) && (
              <div style={{ background: '#141414', padding: '1.25rem', borderRadius: '10px', marginBottom: '1.5rem', border: '1px solid var(--primary-color)' }}>
                <h4 style={{ color: '#fff', marginBottom: '1rem', fontSize: '1rem' }}>
                  {isCreatingTestimonial ? 'Add Review' : `Edit: ${editingTestimonial?.name}`}
                </h4>
                <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '10px', marginBottom: '1rem' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.8rem', color: 'var(--text-light)', marginBottom: '4px' }}>
                      Client Name
                    </label>
                    <input
                      type="text"
                      value={editingTestimonial?.name || ''}
                      onChange={(e) => setEditingTestimonial(editingTestimonial ? { ...editingTestimonial, name: e.target.value } : null)}
                      style={{ width: '100%', padding: '8px 12px', borderRadius: '6px', background: '#1c1c1c', border: '1px solid #2e2e2e', color: '#fff' }}
                    />
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.8rem', color: 'var(--text-light)', marginBottom: '4px' }}>
                      Initials (e.g. S.R.)
                    </label>
                    <input
                      type="text"
                      value={editingTestimonial?.initials || ''}
                      onChange={(e) => setEditingTestimonial(editingTestimonial ? { ...editingTestimonial, initials: e.target.value } : null)}
                      style={{ width: '100%', padding: '8px 12px', borderRadius: '6px', background: '#1c1c1c', border: '1px solid #2e2e2e', color: '#fff' }}
                    />
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '10px', marginBottom: '1rem' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.8rem', color: 'var(--text-light)', marginBottom: '4px' }}>
                      Company Title / Role
                    </label>
                    <input
                      type="text"
                      value={editingTestimonial?.role || ''}
                      onChange={(e) => setEditingTestimonial(editingTestimonial ? { ...editingTestimonial, role: e.target.value } : null)}
                      style={{ width: '100%', padding: '8px 12px', borderRadius: '6px', background: '#1c1c1c', border: '1px solid #2e2e2e', color: '#fff' }}
                    />
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.8rem', color: 'var(--text-light)', marginBottom: '4px' }}>
                      Stars (1-5)
                    </label>
                    <input
                      type="number"
                      min={1}
                      max={5}
                      value={editingTestimonial?.rating || 5}
                      onChange={(e) => setEditingTestimonial(editingTestimonial ? { ...editingTestimonial, rating: parseInt(e.target.value) || 5 } : null)}
                      style={{ width: '100%', padding: '8px 12px', borderRadius: '6px', background: '#1c1c1c', border: '1px solid #2e2e2e', color: '#fff' }}
                    />
                  </div>
                </div>

                <ImageUploadField
                  id="testimonial-client-photo"
                  label="Client Image / Avatar (Optional)"
                  value={editingTestimonial?.imageUrl || ''}
                  onChange={(nextUrl) =>
                    setEditingTestimonial(
                      editingTestimonial ? { ...editingTestimonial, imageUrl: nextUrl } : null
                    )
                  }
                  onError={(msg) => onShowToast(msg, 'error')}
                  previewFallbackText={deriveInitials(
                    editingTestimonial?.name || 'Client',
                    editingTestimonial?.initials
                  )}
                  maxDimension={REVIEW_AVATAR_MAX_DIMENSION}
                  urlPlaceholder="https://example.com/client-avatar.jpg"
                  helperText="Upload a client portrait or company avatar from your device, or leave empty to show initials."
                  uploadButtonLabel="Upload Client Image"
                />

                <div style={{ marginBottom: '1.25rem' }}>
                  <label style={{ display: 'block', fontSize: '0.8rem', color: 'var(--text-light)', marginBottom: '4px' }}>
                    Client Quote
                  </label>
                  <textarea
                    rows={3}
                    value={editingTestimonial?.quote || ''}
                    onChange={(e) => setEditingTestimonial(editingTestimonial ? { ...editingTestimonial, quote: e.target.value } : null)}
                    style={{ width: '100%', padding: '8px 12px', borderRadius: '6px', background: '#1c1c1c', border: '1px solid #2e2e2e', color: '#fff' }}
                  />
                </div>

                <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
                  <button
                    type="button"
                    onClick={() => {
                      setEditingTestimonial(null);
                      setIsCreatingTestimonial(false);
                    }}
                    className="btn btn-outline"
                    style={{ padding: '6px 14px', fontSize: '0.85rem' }}
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      if (!editingTestimonial?.name.trim()) {
                        onShowToast('Please enter client name', 'error');
                        return;
                      }
                      const sanitizedTestimonial: Testimonial = {
                        ...editingTestimonial,
                        name: editingTestimonial.name.trim(),
                        role: editingTestimonial.role.trim(),
                        initials: deriveInitials(editingTestimonial.name, editingTestimonial.initials),
                        imageUrl: sanitizeDisplayImageUrl(editingTestimonial.imageUrl),
                        quote: editingTestimonial.quote.trim()
                      };
                      if (isCreatingTestimonial) {
                        onAddTestimonial(sanitizedTestimonial);
                        onShowToast('Testimonial added!', 'success');
                      } else {
                        onUpdateTestimonial(sanitizedTestimonial);
                        onShowToast('Testimonial updated!', 'success');
                      }
                      setEditingTestimonial(null);
                      setIsCreatingTestimonial(false);
                    }}
                    className="btn btn-primary"
                    style={{ padding: '6px 16px', fontSize: '0.85rem' }}
                  >
                    <Save size={14} /> Save Review
                  </button>
                </div>
              </div>
            )}

            {/* List */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {data.testimonials.map((t) => (
                <div
                  key={t.id}
                  style={{
                    background: '#141414',
                    padding: '1rem',
                    borderRadius: '8px',
                    border: '1px solid rgba(255, 255, 255, 0.08)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between'
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px', maxWidth: '440px' }}>
                    <ClientAvatar
                      name={t.name}
                      initials={t.initials}
                      imageUrl={t.imageUrl}
                      size={42}
                    />
                    <div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                        <span style={{ color: 'var(--primary-color)', fontWeight: 700 }}>
                          {'★'.repeat(t.rating)}
                        </span>
                        <h4 style={{ margin: 0, color: '#fff', fontSize: '0.95rem' }}>{t.name}</h4>
                        <span style={{ fontSize: '0.75rem', color: 'var(--text-light)' }}>({t.role})</span>
                      </div>
                      <p style={{ margin: '4px 0 0', fontSize: '0.8rem', color: 'var(--text-light)', fontStyle: 'italic' }}>
                        "{t.quote}"
                      </p>
                    </div>
                  </div>
                  <div style={{ display: 'flex', gap: '6px' }}>
                    <button
                      onClick={() => {
                        setEditingTestimonial(t);
                        setIsCreatingTestimonial(false);
                      }}
                      style={{
                        background: 'rgba(212, 175, 55, 0.15)',
                        border: '1px solid rgba(212, 175, 55, 0.3)',
                        color: 'var(--primary-color)',
                        padding: '6px',
                        borderRadius: '6px',
                        cursor: 'pointer'
                      }}
                      title="Edit"
                    >
                      <Edit2 size={16} />
                    </button>
                    <button
                      onClick={() => setDeleteConfirmTarget({ type: 'testimonial', id: t.id, title: t.name })}
                      style={{
                        background: 'rgba(239, 68, 68, 0.15)',
                        border: '1px solid rgba(239, 68, 68, 0.3)',
                        color: '#f87171',
                        padding: '6px',
                        borderRadius: '6px',
                        cursor: 'pointer'
                      }}
                      title="Delete"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TAB 7: PARTNERSHIPS PILLARS */}
        {activeTab === 'partnerships' && (
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
              <div>
                <h3 style={{ margin: 0, color: 'var(--primary-color)', fontSize: '1.15rem' }}>
                  Partnership Pillars
                </h3>
                <p style={{ margin: 0, color: 'var(--text-light)', fontSize: '0.8rem' }}>
                  Strategic pillars and announcement banner
                </p>
              </div>
              {!isCreatingPartnership && !editingPartnership && (
                <button
                  onClick={() => {
                    setIsCreatingPartnership(true);
                    setEditingPartnership({
                      id: `partnership-${Date.now()}`,
                      title: '',
                      description: '',
                      icon: 'Handshake'
                    });
                  }}
                  className="btn btn-primary"
                  style={{ padding: '6px 14px', fontSize: '0.8rem' }}
                >
                  <Plus size={16} /> Add Pillar Card
                </button>
              )}
            </div>

            {/* Announcement text */}
            <div style={{ background: '#141414', padding: '1rem', borderRadius: '8px', marginBottom: '1.5rem', border: '1px solid #2e2e2e' }}>
              <label style={{ display: 'block', fontSize: '0.8rem', color: 'var(--text-light)', marginBottom: '4px' }}>
                Alliance Status Announcement Message
              </label>
              <textarea
                rows={2}
                value={generalForm.partnershipNotice}
                onChange={(e) => setGeneralForm({ ...generalForm, partnershipNotice: e.target.value })}
                style={{ width: '100%', padding: '8px', borderRadius: '6px', background: '#1c1c1c', border: '1px solid #2e2e2e', color: '#fff', fontSize: '0.85rem' }}
              />
              <button
                type="button"
                onClick={() => {
                  onUpdateGeneral({ ...data.generalInfo, partnershipNotice: generalForm.partnershipNotice });
                  onShowToast('Partnership announcement updated!', 'success');
                }}
                className="btn btn-primary"
                style={{ marginTop: '8px', padding: '6px 14px', fontSize: '0.8rem' }}
              >
                <Save size={14} /> Update Notice
              </button>
            </div>

            {/* Partnership Form */}
            {(isCreatingPartnership || editingPartnership) && (
              <div style={{ background: '#141414', padding: '1rem', borderRadius: '8px', marginBottom: '1.5rem', border: '1px solid var(--primary-color)' }}>
                <h4 style={{ color: '#fff', marginBottom: '0.75rem', fontSize: '0.95rem' }}>
                  {isCreatingPartnership ? 'Add Partnership Card' : 'Edit Partnership Card'}
                </h4>
                <div style={{ marginBottom: '0.75rem' }}>
                  <label style={{ fontSize: '0.75rem', color: 'var(--text-light)', display: 'block' }}>Title</label>
                  <input
                    type="text"
                    value={editingPartnership?.title || ''}
                    onChange={(e) => setEditingPartnership(editingPartnership ? { ...editingPartnership, title: e.target.value } : null)}
                    style={{ width: '100%', padding: '8px', borderRadius: '6px', background: '#1c1c1c', border: '1px solid #2e2e2e', color: '#fff' }}
                  />
                </div>
                <div style={{ marginBottom: '0.75rem' }}>
                  <label style={{ fontSize: '0.75rem', color: 'var(--text-light)', display: 'block' }}>Description</label>
                  <textarea
                    rows={2}
                    value={editingPartnership?.description || ''}
                    onChange={(e) => setEditingPartnership(editingPartnership ? { ...editingPartnership, description: e.target.value } : null)}
                    style={{ width: '100%', padding: '8px', borderRadius: '6px', background: '#1c1c1c', border: '1px solid #2e2e2e', color: '#fff' }}
                  />
                </div>
                <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
                  <button
                    onClick={() => {
                      setEditingPartnership(null);
                      setIsCreatingPartnership(false);
                    }}
                    className="btn btn-outline"
                    style={{ padding: '6px 12px', fontSize: '0.8rem' }}
                  >
                    Cancel
                  </button>
                  <button
                    onClick={() => {
                      if (!editingPartnership?.title.trim()) {
                        onShowToast('Please enter a partnership title', 'error');
                        return;
                      }
                      if (isCreatingPartnership) {
                        onAddPartnership(editingPartnership);
                        onShowToast('New partnership card added!', 'success');
                      } else {
                        onUpdatePartnership(editingPartnership);
                        onShowToast('Partnership card saved!', 'success');
                      }
                      setEditingPartnership(null);
                      setIsCreatingPartnership(false);
                    }}
                    className="btn btn-primary"
                    style={{ padding: '6px 14px', fontSize: '0.8rem' }}
                  >
                    <Save size={14} /> Save
                  </button>
                </div>
              </div>
            )}

            {/* Cards */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {data.partnerships.map((p) => (
                <div
                  key={p.id}
                  style={{
                    background: '#141414',
                    padding: '1rem',
                    borderRadius: '8px',
                    border: '1px solid rgba(255, 255, 255, 0.08)',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center'
                  }}
                >
                  <div>
                    <h4 style={{ margin: '0 0 4px', color: '#fff', fontSize: '0.95rem' }}>{p.title}</h4>
                    <p style={{ margin: 0, fontSize: '0.8rem', color: 'var(--text-light)', maxWidth: '400px' }}>
                      {p.description}
                    </p>
                  </div>
                  <div style={{ display: 'flex', gap: '6px' }}>
                    <button
                      onClick={() => {
                        setEditingPartnership(p);
                        setIsCreatingPartnership(false);
                      }}
                      style={{
                        background: 'rgba(212, 175, 55, 0.15)',
                        border: '1px solid rgba(212, 175, 55, 0.3)',
                        color: 'var(--primary-color)',
                        padding: '6px 10px',
                        borderRadius: '6px',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '4px',
                        fontSize: '0.8rem'
                      }}
                    >
                      <Edit2 size={14} /> Edit
                    </button>
                    <button
                      onClick={() => setDeleteConfirmTarget({ type: 'partnership', id: p.id, title: p.title })}
                      style={{
                        background: 'rgba(239, 68, 68, 0.15)',
                        border: '1px solid rgba(239, 68, 68, 0.3)',
                        color: '#f87171',
                        padding: '6px',
                        borderRadius: '6px',
                        cursor: 'pointer'
                      }}
                      title="Delete"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TAB 8: PARTNER LOGOS (SLIDER OPTIONS) */}
        {activeTab === 'partner-logos' && (
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
              <div>
                <h3 style={{ margin: 0, color: 'var(--primary-color)', fontSize: '1.15rem' }}>
                  Partner Logos Slider ({data.partnerLogos.length})
                </h3>
                <p style={{ margin: 0, color: 'var(--text-light)', fontSize: '0.8rem' }}>
                  Manage company logos featured in the interactive partners carousel
                </p>
              </div>
              {!isCreatingPartnerLogo && !editingPartnerLogo && (
                <button
                  onClick={() => {
                    setIsCreatingPartnerLogo(true);
                    setEditingPartnerLogo({
                      id: `partner-logo-${Date.now()}`,
                      name: '',
                      logoUrl: 'https://upload.wikimedia.org/wikipedia/commons/9/93/Amazon_Web_Services_Logo.svg',
                      websiteUrl: 'https://'
                    });
                  }}
                  className="btn btn-primary"
                  style={{ padding: '6px 14px', fontSize: '0.8rem' }}
                >
                  <Plus size={16} /> Add Partner Logo
                </button>
              )}
            </div>

            {/* Logo Form */}
            {(isCreatingPartnerLogo || editingPartnerLogo) && (
              <div style={{ background: '#141414', padding: '1.25rem', borderRadius: '10px', marginBottom: '1.5rem', border: '1px solid var(--primary-color)' }}>
                <h4 style={{ color: '#fff', marginBottom: '1rem', fontSize: '1rem' }}>
                  {isCreatingPartnerLogo ? 'Add Partner Logo' : `Edit: ${editingPartnerLogo?.name}`}
                </h4>

                <div style={{ marginBottom: '1rem' }}>
                  <label style={{ display: 'block', fontSize: '0.8rem', color: 'var(--text-light)', marginBottom: '4px' }}>
                    Partner / Brand Name *
                  </label>
                  <input
                    type="text"
                    value={editingPartnerLogo?.name || ''}
                    onChange={(e) => setEditingPartnerLogo(editingPartnerLogo ? { ...editingPartnerLogo, name: e.target.value } : null)}
                    style={{ width: '100%', padding: '8px 12px', borderRadius: '6px', background: '#1c1c1c', border: '1px solid #2e2e2e', color: '#fff' }}
                    required
                  />
                </div>

                <div style={{ marginBottom: '1rem' }}>
                  <label style={{ display: 'block', fontSize: '0.8rem', color: 'var(--text-light)', marginBottom: '4px' }}>
                    Logo Image URL (SVG or PNG recommended) *
                  </label>
                  <input
                    type="text"
                    value={editingPartnerLogo?.logoUrl || ''}
                    onChange={(e) => setEditingPartnerLogo(editingPartnerLogo ? { ...editingPartnerLogo, logoUrl: e.target.value } : null)}
                    style={{ width: '100%', padding: '8px 12px', borderRadius: '6px', background: '#1c1c1c', border: '1px solid #2e2e2e', color: '#fff' }}
                    required
                  />
                  {editingPartnerLogo?.logoUrl && (
                    <div style={{ marginTop: '8px', background: '#0a0a0a', padding: '10px', borderRadius: '6px', display: 'inline-flex', alignItems: 'center', gap: '8px' }}>
                      <span style={{ fontSize: '0.75rem', color: 'var(--text-light)' }}>Preview:</span>
                      <img src={editingPartnerLogo.logoUrl} alt="Preview" style={{ maxHeight: '35px', maxWidth: '100px' }} />
                    </div>
                  )}
                </div>

                <div style={{ marginBottom: '1.25rem' }}>
                  <label style={{ display: 'block', fontSize: '0.8rem', color: 'var(--text-light)', marginBottom: '4px' }}>
                    Official Website URL (Optional)
                  </label>
                  <input
                    type="url"
                    value={editingPartnerLogo?.websiteUrl || ''}
                    onChange={(e) => setEditingPartnerLogo(editingPartnerLogo ? { ...editingPartnerLogo, websiteUrl: e.target.value } : null)}
                    style={{ width: '100%', padding: '8px 12px', borderRadius: '6px', background: '#1c1c1c', border: '1px solid #2e2e2e', color: '#fff' }}
                  />
                </div>

                <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
                  <button
                    type="button"
                    onClick={() => {
                      setEditingPartnerLogo(null);
                      setIsCreatingPartnerLogo(false);
                    }}
                    className="btn btn-outline"
                    style={{ padding: '6px 14px', fontSize: '0.85rem' }}
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      if (!editingPartnerLogo?.name.trim() || !editingPartnerLogo?.logoUrl.trim()) {
                        onShowToast('Please provide partner name and logo URL', 'error');
                        return;
                      }
                      if (isCreatingPartnerLogo) {
                        onAddPartnerLogo(editingPartnerLogo);
                        onShowToast(`Added ${editingPartnerLogo.name} logo to slider!`, 'success');
                      } else {
                        onUpdatePartnerLogo(editingPartnerLogo);
                        onShowToast(`Updated ${editingPartnerLogo.name} logo!`, 'success');
                      }
                      setEditingPartnerLogo(null);
                      setIsCreatingPartnerLogo(false);
                    }}
                    className="btn btn-primary"
                    style={{ padding: '6px 16px', fontSize: '0.85rem' }}
                  >
                    <Save size={14} /> Save Partner Logo
                  </button>
                </div>
              </div>
            )}

            {/* Logos Grid */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '12px' }}>
              {data.partnerLogos.map((logo) => (
                <div
                  key={logo.id}
                  style={{
                    background: '#141414',
                    padding: '1rem',
                    borderRadius: '8px',
                    border: '1px solid rgba(255, 255, 255, 0.08)',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    textAlign: 'center'
                  }}
                >
                  <div style={{ height: '45px', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '0.75rem', width: '100%' }}>
                    <img
                      src={logo.logoUrl}
                      alt={logo.name}
                      style={{ maxHeight: '40px', maxWidth: '120px', objectFit: 'contain' }}
                      onError={(e) => {
                        e.currentTarget.style.display = 'none';
                      }}
                    />
                  </div>
                  <h4 style={{ margin: '0 0 4px', color: '#fff', fontSize: '0.9rem' }}>{logo.name}</h4>
                  {logo.websiteUrl && (
                    <a
                      href={logo.websiteUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      style={{ fontSize: '0.75rem', color: 'var(--primary-color)', textDecoration: 'none', marginBottom: '8px' }}
                    >
                      {logo.websiteUrl.replace('https://', '')}
                    </a>
                  )}
                  <div style={{ display: 'flex', gap: '6px', marginTop: 'auto' }}>
                    <button
                      onClick={() => {
                        setEditingPartnerLogo(logo);
                        setIsCreatingPartnerLogo(false);
                      }}
                      style={{
                        background: 'rgba(212, 175, 55, 0.15)',
                        border: '1px solid rgba(212, 175, 55, 0.3)',
                        color: 'var(--primary-color)',
                        padding: '4px 8px',
                        borderRadius: '4px',
                        cursor: 'pointer',
                        fontSize: '0.75rem',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '3px'
                      }}
                    >
                      <Edit2 size={13} /> Edit
                    </button>
                    <button
                      onClick={() => setDeleteConfirmTarget({ type: 'partner-logo', id: logo.id, title: logo.name })}
                      style={{
                        background: 'rgba(239, 68, 68, 0.15)',
                        border: '1px solid rgba(239, 68, 68, 0.3)',
                        color: '#f87171',
                        padding: '4px 8px',
                        borderRadius: '4px',
                        cursor: 'pointer',
                        fontSize: '0.75rem',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '3px'
                      }}
                    >
                      <Trash2 size={13} /> Delete
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TAB 9: FAQS */}
        {activeTab === 'faqs' && (() => {
          const faqCategoryOptions = collectFaqCategories(data.faqs);
          const filteredAdminFaqs = filterFaqs(data.faqs, {
            category: faqCategoryFilter,
            search: faqSearch
          });
          const editingFaqCategory = editingFaq ? resolveFaqCategory(editingFaq) : DEFAULT_FAQ_CATEGORY_ID;

          return (
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem', flexWrap: 'wrap', gap: '10px' }}>
              <div>
                <h3 style={{ margin: 0, color: 'var(--primary-color)', fontSize: '1.15rem' }}>
                  Frequently Asked Questions ({data.faqs.length})
                </h3>
                <p style={{ margin: 0, color: 'var(--text-light)', fontSize: '0.8rem' }}>
                  Organize questions and answers by category (synced to the public FAQ page)
                </p>
              </div>
              {!isCreatingFaq && !editingFaq && (
                <button
                  type="button"
                  onClick={() => {
                    const initialCategory = faqCategoryFilter !== 'all' ? faqCategoryFilter : DEFAULT_FAQ_CATEGORY_ID;
                    setIsCreatingFaq(true);
                    setCustomFaqCategoryMode(!isBuiltinFaqCategory(initialCategory));
                    setEditingFaq({
                      id: `faq-${Date.now()}`,
                      category: initialCategory,
                      question: '',
                      answer: ''
                    });
                  }}
                  className="btn btn-primary"
                  style={{ padding: '6px 14px', fontSize: '0.8rem' }}
                >
                  <Plus size={16} /> Add FAQ
                </button>
              )}
            </div>

            {/* FAQ Form */}
            {(isCreatingFaq || editingFaq) && (
              <div style={{ background: '#141414', padding: '1.25rem', borderRadius: '10px', marginBottom: '1.5rem', border: '1px solid var(--primary-color)' }}>
                <h4 style={{ color: '#fff', marginBottom: '1rem', fontSize: '1rem' }}>
                  {isCreatingFaq ? 'Add Question' : 'Edit Question'}
                </h4>
                <div style={{ marginBottom: '1rem' }}>
                  <label htmlFor="admin-faq-category" style={{ display: 'block', fontSize: '0.8rem', color: 'var(--text-light)', marginBottom: '4px', fontWeight: 600 }}>
                    Category
                  </label>
                  <select
                    id="admin-faq-category"
                    value={customFaqCategoryMode ? '__custom__' : (isBuiltinFaqCategory(editingFaqCategory) ? editingFaqCategory : '__custom__')}
                    onChange={(e) => {
                      const val = e.target.value;
                      if (val === '__custom__') {
                        setCustomFaqCategoryMode(true);
                        setEditingFaq(
                          editingFaq
                            ? {
                                ...editingFaq,
                                category: isBuiltinFaqCategory(editingFaq.category) ? '' : (editingFaq.category || '')
                              }
                            : null
                        );
                      } else {
                        setCustomFaqCategoryMode(false);
                        setEditingFaq(editingFaq ? { ...editingFaq, category: val } : null);
                      }
                    }}
                    style={{ width: '100%', padding: '8px 12px', borderRadius: '6px', background: '#1c1c1c', border: '1px solid #2e2e2e', color: '#fff', fontSize: '0.88rem' }}
                  >
                    {BUILTIN_FAQ_CATEGORIES.map((cat) => (
                      <option key={cat.id} value={cat.id}>
                        {cat.label}
                      </option>
                    ))}
                    <option value="__custom__">Custom Category...</option>
                  </select>
                  {customFaqCategoryMode && (
                    <input
                      id="admin-faq-custom-category"
                      type="text"
                      placeholder="Enter custom category name (e.g. Security & Compliance)"
                      value={editingFaq?.category || ''}
                      onChange={(e) => setEditingFaq(editingFaq ? { ...editingFaq, category: e.target.value } : null)}
                      style={{ width: '100%', padding: '8px 12px', borderRadius: '6px', background: '#1c1c1c', border: '1px solid var(--primary-color)', color: '#fff', fontSize: '0.85rem', marginTop: '8px' }}
                    />
                  )}
                </div>
                <div style={{ marginBottom: '1rem' }}>
                  <label htmlFor="admin-faq-question" style={{ display: 'block', fontSize: '0.8rem', color: 'var(--text-light)', marginBottom: '4px' }}>
                    Question
                  </label>
                  <input
                    id="admin-faq-question"
                    type="text"
                    value={editingFaq?.question || ''}
                    onChange={(e) => setEditingFaq(editingFaq ? { ...editingFaq, question: e.target.value } : null)}
                    style={{ width: '100%', padding: '8px 12px', borderRadius: '6px', background: '#1c1c1c', border: '1px solid #2e2e2e', color: '#fff' }}
                  />
                </div>
                <div style={{ marginBottom: '1.25rem' }}>
                  <label htmlFor="admin-faq-answer" style={{ display: 'block', fontSize: '0.8rem', color: 'var(--text-light)', marginBottom: '4px' }}>
                    Answer
                  </label>
                  <textarea
                    id="admin-faq-answer"
                    rows={3}
                    value={editingFaq?.answer || ''}
                    onChange={(e) => setEditingFaq(editingFaq ? { ...editingFaq, answer: e.target.value } : null)}
                    style={{ width: '100%', padding: '8px 12px', borderRadius: '6px', background: '#1c1c1c', border: '1px solid #2e2e2e', color: '#fff' }}
                  />
                </div>
                <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
                  <button
                    type="button"
                    onClick={() => {
                      setEditingFaq(null);
                      setIsCreatingFaq(false);
                      setCustomFaqCategoryMode(false);
                    }}
                    className="btn btn-outline"
                    style={{ padding: '6px 14px', fontSize: '0.85rem' }}
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      if (!editingFaq?.question.trim() || !editingFaq?.answer.trim()) {
                        onShowToast('Please fill question and answer', 'error');
                        return;
                      }
                      const cleanCategory = (editingFaq.category || '').trim();
                      if (customFaqCategoryMode && !cleanCategory) {
                        onShowToast('Please enter a custom category name or select a preset category', 'error');
                        return;
                      }
                      const finalizedFaq: FaqItem = {
                        ...editingFaq,
                        question: editingFaq.question.trim(),
                        answer: editingFaq.answer.trim(),
                        category: cleanCategory || resolveFaqCategory(editingFaq)
                      };
                      if (isCreatingFaq) {
                        onAddFaq(finalizedFaq);
                        onShowToast('FAQ added!', 'success');
                      } else {
                        onUpdateFaq(finalizedFaq);
                        onShowToast('FAQ updated!', 'success');
                      }
                      setEditingFaq(null);
                      setIsCreatingFaq(false);
                      setCustomFaqCategoryMode(false);
                    }}
                    className="btn btn-primary"
                    style={{ padding: '6px 16px', fontSize: '0.85rem' }}
                  >
                    <Save size={14} /> Save FAQ
                  </button>
                </div>
              </div>
            )}

            {/* Category Filter Pills & Search */}
            <div style={{ marginBottom: '1rem' }}>
              <div style={{ fontSize: '0.78rem', color: 'var(--text-light)', marginBottom: '6px', fontWeight: 600 }}>
                Filter by Category:
              </div>
              <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap', paddingBottom: '4px', marginBottom: '10px' }}>
                {faqCategoryOptions.map((cat) => {
                  const isSelected = faqCategoryFilter === cat.id;
                  return (
                    <button
                      key={cat.id}
                      type="button"
                      onClick={() => setFaqCategoryFilter(cat.id)}
                      style={{
                        padding: '5px 11px',
                        borderRadius: '12px',
                        border: '1px solid',
                        borderColor: isSelected ? 'var(--primary-color)' : '#2e2e2e',
                        background: isSelected ? 'rgba(212, 175, 55, 0.2)' : '#1c1c1c',
                        color: isSelected ? 'var(--primary-color)' : '#a3a3a3',
                        fontSize: '0.75rem',
                        fontWeight: isSelected ? 600 : 500,
                        cursor: 'pointer',
                        whiteSpace: 'nowrap'
                      }}
                    >
                      {cat.label} ({cat.count})
                    </button>
                  );
                })}
              </div>
              <input
                type="text"
                aria-label="Search FAQs"
                placeholder="Search FAQs by question, answer, or category..."
                value={faqSearch}
                onChange={(e) => setFaqSearch(e.target.value)}
                style={{
                  width: '100%',
                  padding: '9px 12px',
                  borderRadius: '6px',
                  background: '#141414',
                  border: '1px solid #2e2e2e',
                  color: '#fff',
                  fontSize: '0.85rem'
                }}
              />
            </div>

            {/* List */}
            {filteredAdminFaqs.length === 0 ? (
              <div style={{ background: '#141414', padding: '1.25rem', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.08)', textAlign: 'center' }}>
                <p style={{ margin: '0 0 10px', color: 'var(--text-light)', fontSize: '0.85rem' }}>
                  No FAQs match the selected category or search query.
                </p>
                <button
                  type="button"
                  className="btn btn-outline"
                  style={{ padding: '5px 12px', fontSize: '0.8rem' }}
                  onClick={() => {
                    setFaqCategoryFilter('all');
                    setFaqSearch('');
                  }}
                >
                  Show All FAQs
                </button>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                {filteredAdminFaqs.map((faq) => {
                  const categoryLabel = getFaqCategoryLabel(faq.resolvedCategory);
                  return (
                  <div
                    key={faq.id || faq.index}
                    style={{
                      background: '#141414',
                      padding: '1rem',
                      borderRadius: '8px',
                      border: '1px solid rgba(255, 255, 255, 0.08)'
                    }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '10px', marginBottom: '6px' }}>
                      <div>
                        <span
                          style={{
                            display: 'inline-block',
                            fontSize: '0.72rem',
                            color: 'var(--primary-color)',
                            background: 'rgba(212, 175, 55, 0.12)',
                            border: '1px solid rgba(212, 175, 55, 0.25)',
                            padding: '2px 8px',
                            borderRadius: '6px',
                            fontWeight: 600,
                            marginBottom: '6px'
                          }}
                        >
                          {categoryLabel}
                        </span>
                        <h4 style={{ margin: 0, color: '#fff', fontSize: '0.95rem' }}>{faq.question}</h4>
                      </div>
                      <div style={{ display: 'flex', gap: '6px', flexShrink: 0 }}>
                        <button
                          type="button"
                          onClick={() => {
                            const resolvedCat = resolveFaqCategory(faq);
                            setEditingFaq({ ...faq, category: resolvedCat });
                            setIsCreatingFaq(false);
                            setCustomFaqCategoryMode(!isBuiltinFaqCategory(resolvedCat));
                          }}
                          style={{
                            background: 'rgba(212, 175, 55, 0.15)',
                            border: '1px solid rgba(212, 175, 55, 0.3)',
                            color: 'var(--primary-color)',
                            padding: '6px',
                            borderRadius: '6px',
                            cursor: 'pointer'
                          }}
                          title="Edit"
                          aria-label={`Edit "${faq.question}"`}
                        >
                          <Edit2 size={15} />
                        </button>
                        <button
                          type="button"
                          onClick={() => setDeleteConfirmTarget({ type: 'faq', id: faq.id || faq.question, title: faq.question })}
                          style={{
                            background: 'rgba(239, 68, 68, 0.15)',
                            border: '1px solid rgba(239, 68, 68, 0.3)',
                            color: '#f87171',
                            padding: '6px',
                            borderRadius: '6px',
                            cursor: 'pointer'
                          }}
                          title="Delete"
                          aria-label={`Delete "${faq.question}"`}
                        >
                          <Trash2 size={15} />
                        </button>
                      </div>
                    </div>
                    <p style={{ margin: 0, fontSize: '0.85rem', color: 'var(--text-light)', lineHeight: 1.5 }}>
                      {faq.answer}
                    </p>
                  </div>
                  );
                })}
              </div>
            )}
          </div>
          );
        })()}

        {/* TAB 10: BACKUP & RESTORE */}
        {activeTab === 'backup' && (
          <div>
            <div style={{ marginBottom: '1.5rem' }}>
              <h3 style={{ margin: '0 0 4px', color: 'var(--primary-color)', fontSize: '1.15rem' }}>
                Cloud Sync, Backup & Restore
              </h3>
              <p style={{ margin: 0, color: 'var(--text-light)', fontSize: '0.85rem' }}>
                Force-sync your content to Firebase Firestore for all public visitors, export JSON snapshots, or reset to original defaults.
              </p>
            </div>

            {/* Cloud Sync Section */}
            <div style={{ background: 'rgba(16, 185, 129, 0.08)', padding: '1.25rem', borderRadius: '10px', marginBottom: '1.5rem', border: '1px solid rgba(16, 185, 129, 0.3)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                <h4 style={{ color: '#34d399', fontSize: '0.95rem', margin: 0, display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <UploadCloud size={18} /> Firebase Live Cloud Sync
                </h4>
                <span style={{ fontSize: '0.75rem', padding: '2px 8px', borderRadius: '4px', background: syncStatus === 'connected' ? 'rgba(16, 185, 129, 0.2)' : 'rgba(239, 68, 68, 0.2)', color: syncStatus === 'connected' ? '#34d399' : '#f87171', fontWeight: 600 }}>
                  {syncStatus === 'connected' ? 'Connected' : syncStatus === 'syncing' ? 'Syncing...' : 'Offline'}
                </span>
              </div>
              <p style={{ color: 'var(--text-light)', fontSize: '0.8rem', marginBottom: '0.75rem', lineHeight: 1.5 }}>
                All 9 site sections (services, case studies, blogs, team, testimonials, partnerships, partner logos, FAQs, and general info) are connected to Firestore. Click below to immediately push all current edits across the web to every visitor.
              </p>
              {onPublishAll && (
                <button
                  onClick={handlePublishAllToCloud}
                  disabled={isPublishingAll}
                  className="btn btn-primary"
                  style={{ padding: '8px 18px', fontSize: '0.85rem', display: 'inline-flex', alignItems: 'center', gap: '6px' }}
                >
                  <UploadCloud size={16} /> {isPublishingAll ? 'Publishing to Cloud...' : 'Publish All Content to Cloud Now'}
                </button>
              )}
            </div>

            <div style={{ background: '#141414', padding: '1.25rem', borderRadius: '10px', marginBottom: '1.5rem', border: '1px solid #2e2e2e' }}>
              <h4 style={{ color: '#fff', fontSize: '0.95rem', marginBottom: '0.5rem' }}>
                1. Export Current Data (JSON)
              </h4>
              <p style={{ color: 'var(--text-light)', fontSize: '0.8rem', marginBottom: '0.75rem' }}>
                Copy the entire database snapshot to clipboard for safe keeping or transfer.
              </p>
              <button
                onClick={() => {
                  const json = onExportJson();
                  navigator.clipboard.writeText(json);
                  onShowToast('Complete JSON snapshot copied to clipboard!', 'success');
                }}
                className="btn btn-outline"
                style={{ padding: '8px 18px', fontSize: '0.85rem' }}
              >
                Copy JSON to Clipboard
              </button>
            </div>

            <div style={{ background: '#141414', padding: '1.25rem', borderRadius: '10px', marginBottom: '1.5rem', border: '1px solid #2e2e2e' }}>
              <h4 style={{ color: '#fff', fontSize: '0.95rem', marginBottom: '0.5rem' }}>
                2. Import Data (JSON)
              </h4>
              <p style={{ color: 'var(--text-light)', fontSize: '0.8rem', marginBottom: '0.75rem' }}>
                Paste a valid JSON export to replace the active front panel content.
              </p>
              <textarea
                rows={4}
                placeholder="Paste JSON here..."
                value={importText}
                onChange={(e) => setImportText(e.target.value)}
                style={{ width: '100%', padding: '8px 12px', borderRadius: '6px', background: '#1c1c1c', border: '1px solid #2e2e2e', color: '#fff', fontSize: '0.8rem', marginBottom: '0.75rem' }}
              />
              <button
                onClick={() => {
                  if (!importText.trim()) return;
                  const success = onImportJson(importText);
                  if (success) {
                    onShowToast('Data imported and front panel updated!', 'success');
                    setImportText('');
                  } else {
                    onShowToast('Failed to import JSON: Invalid syntax', 'error');
                  }
                }}
                className="btn btn-primary"
                style={{ padding: '8px 18px', fontSize: '0.85rem' }}
              >
                Apply Imported JSON
              </button>
            </div>

            <div style={{ background: 'rgba(239, 68, 68, 0.1)', padding: '1.25rem', borderRadius: '10px', border: '1px solid rgba(239, 68, 68, 0.3)' }}>
              <h4 style={{ color: '#f87171', fontSize: '0.95rem', marginBottom: '0.5rem' }}>
                3. Factory Reset to Original Data
              </h4>
              <p style={{ color: 'var(--text-light)', fontSize: '0.8rem', marginBottom: '0.75rem' }}>
                Revert all services, case studies, blogs, team members, partner logos, stats, and text back to original agency defaults.
              </p>
              <button
                onClick={() => setDeleteConfirmTarget({ type: 'reset-defaults', id: 'reset', title: 'All Custom Data' })}
                style={{
                  background: '#ef4444',
                  color: '#fff',
                  border: 'none',
                  padding: '8px 18px',
                  borderRadius: '6px',
                  fontWeight: 600,
                  fontSize: '0.85rem',
                  cursor: 'pointer',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '6px'
                }}
              >
                <RotateCcw size={16} /> Reset Everything to Defaults
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Bottom Footer Info */}
      <div
        style={{
          padding: '0.75rem 1.5rem',
          background: '#050505',
          borderTop: '1px solid rgba(255, 255, 255, 0.08)',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          fontSize: '0.75rem',
          color: 'var(--text-light)'
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span
            style={{
              display: 'inline-block',
              width: '8px',
              height: '8px',
              borderRadius: '50%',
              backgroundColor: syncStatus === 'connected' ? '#10b981' : syncStatus === 'syncing' ? '#f59e0b' : '#ef4444',
              boxShadow: syncStatus === 'connected' ? '0 0 6px #10b981' : undefined
            }}
          />
          <span style={{ color: syncStatus === 'connected' ? '#a3a3a3' : '#f59e0b' }}>
            {activeTab === 'queries'
              ? 'Visitor contact messages sync live from Firebase.'
              : syncStatus === 'connected'
              ? 'Live Cloud Synced: Changes publish immediately to all public visitors across the web.'
              : syncStatus === 'syncing'
              ? 'Syncing changes to cloud...'
              : 'Offline: Changes saved in browser; will automatically sync when connection returns.'}
          </span>
        </div>
        <button
          onClick={onClose}
          style={{
            background: 'var(--primary-color)',
            color: '#0a0a0a',
            border: 'none',
            padding: '4px 12px',
            borderRadius: '4px',
            fontWeight: 700,
            cursor: 'pointer'
          }}
        >
          Done Viewing
        </button>
      </div>

      {/* Safe In-App Delete Confirmation Modal (100% reliable in iFrames) */}
      {deleteConfirmTarget && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(10, 10, 10, 0.88)',
            backdropFilter: 'blur(4px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 999999,
            padding: '20px'
          }}
          onClick={() => setDeleteConfirmTarget(null)}
        >
          <div
            style={{
              background: '#141414',
              border: '1px solid rgba(239, 68, 68, 0.4)',
              boxShadow: '0 20px 40px rgba(0, 0, 0, 0.8)',
              borderRadius: '12px',
              maxWidth: '420px',
              width: '100%',
              padding: '1.5rem',
              textAlign: 'center',
              color: '#fff'
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div
              style={{
                width: '48px',
                height: '48px',
                borderRadius: '50%',
                background: 'rgba(239, 68, 68, 0.15)',
                color: '#f87171',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '0 auto 1rem'
              }}
            >
              <Trash2 size={24} />
            </div>
            <h3 style={{ margin: '0 0 0.5rem', fontSize: '1.15rem', color: '#fff', fontWeight: 700 }}>
              {deleteConfirmTarget.type === 'reset-defaults' ? 'Reset All Data?' : 'Confirm Deletion'}
            </h3>
            <p style={{ margin: '0 0 1.25rem', color: '#a3a3a3', fontSize: '0.88rem', lineHeight: 1.5 }}>
              {deleteConfirmTarget.type === 'reset-defaults'
                ? 'Are you sure you want to revert all changes and restore original agency data? All custom edits will be reset.'
                : `Are you sure you want to delete "${deleteConfirmTarget.title}"? This item will be removed immediately.`}
            </p>
            <div style={{ display: 'flex', gap: '10px', justifyContent: 'center' }}>
              <button
                type="button"
                onClick={() => setDeleteConfirmTarget(null)}
                className="btn btn-outline"
                style={{ padding: '8px 18px', fontSize: '0.85rem' }}
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => {
                  const target = deleteConfirmTarget;
                  setDeleteConfirmTarget(null);
                  handleExecuteDelete(target);
                }}
                style={{
                  background: '#dc2626',
                  border: 'none',
                  color: '#fff',
                  padding: '8px 20px',
                  borderRadius: '6px',
                  fontSize: '0.85rem',
                  fontWeight: 600,
                  cursor: 'pointer',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '6px'
                }}
              >
                <Trash2 size={14} /> Yes, Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
