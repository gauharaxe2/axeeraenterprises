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
  UploadCloud
} from 'lucide-react';
import {
  AdminTab,
  AgencyGeneralInfo,
  ServiceItem,
  Project,
  BlogPost,
  BlogSection,
  TeamMemberData,
  Testimonial,
  PartnershipItem,
  PartnerLogo,
  FaqItem,
  BLOG_CATEGORIES
} from '../../types';
import { normalizeBlogSections, aggregateParagraphs, collectArticleImages } from '../../utils/blogUtils';
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
  onAddBlog: (blog: BlogPost) => void;
  onUpdateBlog: (blog: BlogPost) => void;
  onDeleteBlog: (id: string) => void;
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
  onAddBlog,
  onUpdateBlog,
  onDeleteBlog,
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

  const [editingBlog, setEditingBlog] = useState<BlogPost | null>(null);
  const [isCreatingBlog, setIsCreatingBlog] = useState(false);
  const [blogSearch, setBlogSearch] = useState('');
  const [newGalleryImageUrl, setNewGalleryImageUrl] = useState('');
  const [blogCategoryFilter, setBlogCategoryFilter] = useState('All');

  // Team state for multiple team members
  const [editingTeamMember, setEditingTeamMember] = useState<TeamMemberData | null>(null);
  const [isCreatingTeamMember, setIsCreatingTeamMember] = useState(false);

  const [editingTestimonial, setEditingTestimonial] = useState<Testimonial | null>(null);
  const [isCreatingTestimonial, setIsCreatingTestimonial] = useState(false);

  const [editingFaq, setEditingFaq] = useState<FaqItem | null>(null);
  const [isCreatingFaq, setIsCreatingFaq] = useState(false);

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
        onDeleteBlog(target.id);
        onShowToast(`Deleted article: ${target.title}`, 'info');
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
      style={{
        position: 'fixed',
        top: 0,
        right: 0,
        bottom: 0,
        width: isExpanded ? '92vw' : '580px',
        maxWidth: '100vw',
        background: '#0d1527',
        color: '#f8fafc',
        boxShadow: '-10px 0 35px rgba(0, 0, 0, 0.7)',
        zIndex: 10001,
        display: 'flex',
        flexDirection: 'column',
        transition: 'width 0.3s ease',
        borderLeft: '1px solid rgba(212, 175, 55, 0.3)'
      }}
    >
      {/* Top Header */}
      <div
        style={{
          padding: '1.25rem 1.5rem',
          background: '#0a0f1d',
          borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
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
              color: '#fff'
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
                  color: syncStatus === 'connected' ? '#34d399' : syncStatus === 'syncing' ? '#fbbf24' : '#94a3b8',
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
                    background: syncStatus === 'connected' ? '#10b981' : syncStatus === 'syncing' ? '#f59e0b' : '#94a3b8',
                    boxShadow: syncStatus === 'connected' ? '0 0 6px #10b981' : undefined
                  }}
                />
                {syncStatus === 'connected' ? 'Firebase Live Synced' : syncStatus === 'syncing' ? 'Syncing Firestore...' : 'Offline Local Storage'}
              </span>
              <span style={{ fontSize: '0.72rem', color: '#94a3b8' }}>
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
              color: '#cbd5e1',
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
          background: '#090d19',
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
          { id: 'projects', label: `Case Studies (${data.projects.length})`, icon: <FolderGit2 size={15} /> },
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
              color: activeTab === tab.id ? '#0f172a' : 'var(--text-light)',
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
          background: '#0d1527'
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
                style={{ width: '100%', padding: '10px 14px', borderRadius: '8px', background: '#1e293b', border: '1px solid #334155', color: '#fff' }}
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
                style={{ width: '100%', padding: '10px 14px', borderRadius: '8px', background: '#1e293b', border: '1px solid #334155', color: '#fff' }}
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
                  style={{ width: '100%', padding: '8px', borderRadius: '6px', background: '#1e293b', border: '1px solid #334155', color: '#fff' }}
                />
              </div>
              <div>
                <label style={{ fontSize: '0.75rem', color: 'var(--text-light)', display: 'block' }}>Digital Experts</label>
                <input
                  type="number"
                  value={generalForm.stats.experts}
                  onChange={(e) => setGeneralForm({ ...generalForm, stats: { ...generalForm.stats, experts: parseInt(e.target.value) || 0 } })}
                  style={{ width: '100%', padding: '8px', borderRadius: '6px', background: '#1e293b', border: '1px solid #334155', color: '#fff' }}
                />
              </div>
              <div>
                <label style={{ fontSize: '0.75rem', color: 'var(--text-light)', display: 'block' }}>Projects (e.g. 10)</label>
                <input
                  type="number"
                  value={generalForm.stats.projects}
                  onChange={(e) => setGeneralForm({ ...generalForm, stats: { ...generalForm.stats, projects: parseInt(e.target.value) || 0 } })}
                  style={{ width: '100%', padding: '8px', borderRadius: '6px', background: '#1e293b', border: '1px solid #334155', color: '#fff' }}
                />
              </div>
              <div>
                <label style={{ fontSize: '0.75rem', color: 'var(--text-light)', display: 'block' }}>Retention %</label>
                <input
                  type="number"
                  value={generalForm.stats.retention}
                  onChange={(e) => setGeneralForm({ ...generalForm, stats: { ...generalForm.stats, retention: parseInt(e.target.value) || 0 } })}
                  style={{ width: '100%', padding: '8px', borderRadius: '6px', background: '#1e293b', border: '1px solid #334155', color: '#fff' }}
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
                style={{ width: '100%', padding: '10px 14px', borderRadius: '8px', background: '#1e293b', border: '1px solid #334155', color: '#fff' }}
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
                style={{ width: '100%', padding: '10px 14px', borderRadius: '8px', background: '#1e293b', border: '1px solid #334155', color: '#fff' }}
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
                style={{ width: '100%', padding: '10px 14px', borderRadius: '8px', background: '#1e293b', border: '1px solid #334155', color: '#fff' }}
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
                style={{ width: '100%', padding: '10px 14px', borderRadius: '8px', background: '#1e293b', border: '1px solid #334155', color: '#fff' }}
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
                style={{ width: '100%', padding: '10px 14px', borderRadius: '8px', background: '#1e293b', border: '1px solid #334155', color: '#fff' }}
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
                style={{ width: '100%', padding: '10px 14px', borderRadius: '8px', background: '#1e293b', border: '1px solid #334155', color: '#fff' }}
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
                style={{ width: '100%', padding: '10px 14px', borderRadius: '8px', background: '#1e293b', border: '1px solid #334155', color: '#fff' }}
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
                style={{ width: '100%', padding: '10px 14px', borderRadius: '8px', background: '#1e293b', border: '1px solid #334155', color: '#fff' }}
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
                style={{ width: '100%', padding: '10px 14px', borderRadius: '8px', background: '#1e293b', border: '1px solid #334155', color: '#fff' }}
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
              <div style={{ background: '#151d32', padding: '1.25rem', borderRadius: '10px', marginBottom: '1.5rem', border: '1px solid var(--primary-color)' }}>
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
                    style={{ width: '100%', padding: '8px 12px', borderRadius: '6px', background: '#1e293b', border: '1px solid #334155', color: '#fff' }}
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
                      style={{ width: '100%', padding: '8px 12px', borderRadius: '6px', background: '#1e293b', border: '1px solid #334155', color: '#fff' }}
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
                      style={{ width: '100%', padding: '8px 12px', borderRadius: '6px', background: '#1e293b', border: '1px solid #334155', color: '#fff' }}
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
                    style={{ width: '100%', padding: '8px 12px', borderRadius: '6px', background: '#1e293b', border: '1px solid #334155', color: '#fff' }}
                  />
                </div>

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
                    style={{ width: '100%', padding: '8px 12px', borderRadius: '6px', background: '#1e293b', border: '1px solid #334155', color: '#fff' }}
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
                      if (isCreatingService) {
                        onAddService(editingService);
                        onShowToast('New service added successfully!', 'success');
                      } else {
                        onUpdateService(editingService);
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
                    background: '#151d32',
                    padding: '1rem',
                    borderRadius: '8px',
                    border: '1px solid rgba(255, 255, 255, 0.08)',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center'
                  }}
                >
                  <div>
                    <h4 style={{ margin: '0 0 4px', color: '#fff', fontSize: '0.95rem' }}>{svc.title}</h4>
                    <p style={{ margin: 0, fontSize: '0.8rem', color: 'var(--text-light)', maxWidth: '380px' }}>
                      {svc.shortDesc}
                    </p>
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

        {/* TAB 3: CASE STUDIES */}
        {activeTab === 'projects' && (
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
              <div>
                <h3 style={{ margin: 0, color: 'var(--primary-color)', fontSize: '1.15rem' }}>
                  Manage Case Studies
                </h3>
                <p style={{ margin: 0, color: 'var(--text-light)', fontSize: '0.8rem' }}>
                  Client projects, live URLs, and ROI badges
                </p>
              </div>
              {!isCreatingProject && !editingProject && (
                <button
                  onClick={() => {
                    setIsCreatingProject(true);
                    setEditingProject({
                      id: `project-${Date.now()}`,
                      title: '',
                      subtitle: '',
                      category: 'ecommerce',
                      metric: '+100% Growth',
                      link: 'https://',
                      imageUrl: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&w=1200&q=80',
                      description: '',
                      tags: ['React', 'Custom']
                    });
                  }}
                  className="btn btn-primary"
                  style={{ padding: '6px 14px', fontSize: '0.8rem' }}
                >
                  <Plus size={16} /> Add Case Study
                </button>
              )}
            </div>

            {/* Project Form */}
            {(isCreatingProject || editingProject) && (
              <div style={{ background: '#151d32', padding: '1.25rem', borderRadius: '10px', marginBottom: '1.5rem', border: '1px solid var(--primary-color)' }}>
                <h4 style={{ color: '#fff', marginBottom: '1rem', fontSize: '1rem' }}>
                  {isCreatingProject ? 'Add New Case Study' : `Edit: ${editingProject?.title}`}
                </h4>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', marginBottom: '1rem' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.8rem', color: 'var(--text-light)', marginBottom: '4px' }}>
                      Project Title
                    </label>
                    <input
                      type="text"
                      value={editingProject?.title || ''}
                      onChange={(e) => setEditingProject(editingProject ? { ...editingProject, title: e.target.value } : null)}
                      style={{ width: '100%', padding: '8px 12px', borderRadius: '6px', background: '#1e293b', border: '1px solid #334155', color: '#fff' }}
                    />
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.8rem', color: 'var(--text-light)', marginBottom: '4px' }}>
                      Category
                    </label>
                    <select
                      value={editingProject?.category || 'ecommerce'}
                      onChange={(e) => setEditingProject(editingProject ? { ...editingProject, category: e.target.value as any } : null)}
                      style={{ width: '100%', padding: '8px 12px', borderRadius: '6px', background: '#1e293b', border: '1px solid #334155', color: '#fff' }}
                    >
                      <option value="ecommerce">E-Commerce</option>
                      <option value="saas">SaaS & Analytics</option>
                      <option value="web">Marketplace / Web Apps</option>
                    </select>
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', marginBottom: '1rem' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.8rem', color: 'var(--text-light)', marginBottom: '4px' }}>
                      Subtitle
                    </label>
                    <input
                      type="text"
                      value={editingProject?.subtitle || ''}
                      onChange={(e) => setEditingProject(editingProject ? { ...editingProject, subtitle: e.target.value } : null)}
                      style={{ width: '100%', padding: '8px 12px', borderRadius: '6px', background: '#1e293b', border: '1px solid #334155', color: '#fff' }}
                    />
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.8rem', color: 'var(--text-light)', marginBottom: '4px' }}>
                      ROI Metric (e.g. +150% Online Sales)
                    </label>
                    <input
                      type="text"
                      value={editingProject?.metric || ''}
                      onChange={(e) => setEditingProject(editingProject ? { ...editingProject, metric: e.target.value } : null)}
                      style={{ width: '100%', padding: '8px 12px', borderRadius: '6px', background: '#1e293b', border: '1px solid #334155', color: '#fff' }}
                    />
                  </div>
                </div>

                <div style={{ marginBottom: '1rem' }}>
                  <label style={{ display: 'block', fontSize: '0.8rem', color: 'var(--text-light)', marginBottom: '4px' }}>
                    Live URL
                  </label>
                  <input
                    type="url"
                    value={editingProject?.link || ''}
                    onChange={(e) => setEditingProject(editingProject ? { ...editingProject, link: e.target.value } : null)}
                    style={{ width: '100%', padding: '8px 12px', borderRadius: '6px', background: '#1e293b', border: '1px solid #334155', color: '#fff' }}
                  />
                </div>

                <div style={{ marginBottom: '1rem' }}>
                  <label style={{ display: 'block', fontSize: '0.8rem', color: 'var(--text-light)', marginBottom: '4px' }}>
                    Thumbnail Image URL
                  </label>
                  <input
                    type="text"
                    value={editingProject?.imageUrl || ''}
                    onChange={(e) => setEditingProject(editingProject ? { ...editingProject, imageUrl: e.target.value } : null)}
                    style={{ width: '100%', padding: '8px 12px', borderRadius: '6px', background: '#1e293b', border: '1px solid #334155', color: '#fff' }}
                  />
                </div>

                <div style={{ marginBottom: '1rem' }}>
                  <label style={{ display: 'block', fontSize: '0.8rem', color: 'var(--text-light)', marginBottom: '4px' }}>
                    Tags (comma-separated)
                  </label>
                  <input
                    type="text"
                    value={editingProject?.tags?.join(', ') || ''}
                    onChange={(e) => {
                      const tags = e.target.value.split(',').map((t) => t.trim()).filter(Boolean);
                      setEditingProject(editingProject ? { ...editingProject, tags } : null);
                    }}
                    style={{ width: '100%', padding: '8px 12px', borderRadius: '6px', background: '#1e293b', border: '1px solid #334155', color: '#fff' }}
                  />
                </div>

                <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
                  <button
                    type="button"
                    onClick={() => {
                      setEditingProject(null);
                      setIsCreatingProject(false);
                    }}
                    className="btn btn-outline"
                    style={{ padding: '6px 14px', fontSize: '0.85rem' }}
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      if (!editingProject?.title.trim()) {
                        onShowToast('Please enter a project title', 'error');
                        return;
                      }
                      if (isCreatingProject) {
                        onAddProject(editingProject);
                        onShowToast('New project added!', 'success');
                      } else {
                        onUpdateProject(editingProject);
                        onShowToast('Project updated successfully!', 'success');
                      }
                      setEditingProject(null);
                      setIsCreatingProject(false);
                    }}
                    className="btn btn-primary"
                    style={{ padding: '6px 16px', fontSize: '0.85rem' }}
                  >
                    <Save size={14} /> Save Case Study
                  </button>
                </div>
              </div>
            )}

            {/* List */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {data.projects.map((proj) => (
                <div
                  key={proj.id}
                  style={{
                    background: '#151d32',
                    padding: '1rem',
                    borderRadius: '8px',
                    border: '1px solid rgba(255, 255, 255, 0.08)',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '12px'
                  }}
                >
                  <img
                    src={proj.imageUrl}
                    alt={proj.title}
                    style={{ width: '60px', height: '45px', objectFit: 'cover', borderRadius: '4px' }}
                  />
                  <div style={{ flex: 1 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <h4 style={{ margin: 0, color: '#fff', fontSize: '0.95rem' }}>{proj.title}</h4>
                      <span style={{ fontSize: '0.75rem', color: 'var(--primary-color)', background: 'rgba(212, 175, 55, 0.1)', padding: '2px 8px', borderRadius: '10px' }}>
                        {proj.metric}
                      </span>
                    </div>
                    <p style={{ margin: '2px 0 0', fontSize: '0.8rem', color: 'var(--text-light)' }}>
                      {proj.subtitle} • {proj.category}
                    </p>
                  </div>
                  <div style={{ display: 'flex', gap: '6px' }}>
                    <a
                      href={proj.link}
                      target="_blank"
                      rel="noopener noreferrer"
                      style={{
                        background: 'rgba(255, 255, 255, 0.08)',
                        color: '#cbd5e1',
                        padding: '6px',
                        borderRadius: '6px',
                        display: 'flex',
                        alignItems: 'center'
                      }}
                      title="Open Live Link"
                    >
                      <ExternalLink size={16} />
                    </a>
                    <button
                      onClick={() => {
                        setEditingProject(proj);
                        setIsCreatingProject(false);
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
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TAB 4: BLOGS */}
        {activeTab === 'blogs' && (
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem', flexWrap: 'wrap', gap: '10px' }}>
              <div>
                <h3 style={{ margin: 0, color: 'var(--primary-color)', fontSize: '1.15rem' }}>
                  Manage Blog Articles & Knowledge Hub
                </h3>
                <p style={{ margin: 0, color: 'var(--text-light)', fontSize: '0.8rem' }}>
                  Full blog creation with 9 official categories and multiple image gallery support
                </p>
              </div>
              {!isCreatingBlog && !editingBlog && (
                <button
                  onClick={() => {
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
                      images: [
                        'https://images.unsplash.com/photo-1498050108023-c5249f4df085?auto=format&fit=crop&w=1200&q=80',
                        'https://images.unsplash.com/photo-1555066931-4365d14bab8c?auto=format&fit=crop&w=1200&q=80'
                      ],
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
              )}
            </div>

            {/* Blog Form */}
            {(isCreatingBlog || editingBlog) && editingBlog && (() => {
              const currentSections: BlogSection[] = editingBlog.sections && editingBlog.sections.length > 0
                ? editingBlog.sections
                : ensureBlogSections(editingBlog);

              return (
                <div style={{ background: '#151d32', padding: '1.25rem', borderRadius: '12px', marginBottom: '1.5rem', border: '1px solid var(--primary-color)' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem', borderBottom: '1px solid rgba(255,255,255,0.08)', paddingBottom: '0.75rem' }}>
                    <div>
                      <h4 style={{ color: '#fff', margin: 0, fontSize: '1.05rem', fontWeight: 700 }}>
                        {isCreatingBlog ? '✨ Create New Blog Article' : `✏️ Edit: ${editingBlog.title || 'Untitled'}`}
                      </h4>
                      <p style={{ margin: '2px 0 0', color: 'var(--text-light)', fontSize: '0.76rem' }}>
                        Configure Title, Cover Image URL, Summary, and structured Headings/Paragraphs/Images
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
                        setEditingBlog({ ...editingBlog, title, slug: isCreatingBlog ? slug : editingBlog.slug });
                      }}
                      style={{ width: '100%', padding: '9px 12px', borderRadius: '6px', background: '#1e293b', border: '1px solid #334155', color: '#fff', fontSize: '0.95rem' }}
                    />
                  </div>

                  {/* 2. PRIMARY COVER IMAGE URL OPTION WITH LIVE PREVIEW */}
                  <div style={{ marginBottom: '1rem', background: '#0b1120', padding: '12px', borderRadius: '8px', border: '1px solid rgba(255, 255, 255, 0.08)' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                      <label style={{ fontSize: '0.82rem', color: 'var(--primary-color)', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <ImageIcon size={15} /> Primary Cover Image URL *
                      </label>
                      <span style={{ fontSize: '0.72rem', color: '#94a3b8' }}>
                        Main featured banner image for article header
                      </span>
                    </div>
                    <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                      <input
                        type="text"
                        value={editingBlog.imageUrl || ''}
                        placeholder="https://images.unsplash.com/photo-1498050108023-c5249f4df085?auto=format&fit=crop&w=1200&q=80"
                        onChange={(e) => setEditingBlog({ ...editingBlog, imageUrl: e.target.value })}
                        style={{ flex: 1, padding: '8px 12px', borderRadius: '6px', background: '#1e293b', border: '1px solid #334155', color: '#fff', fontSize: '0.85rem' }}
                      />
                      {editingBlog.imageUrl ? (
                        <div style={{ position: 'relative', width: '56px', height: '42px', borderRadius: '4px', overflow: 'hidden', border: '1px solid var(--primary-color)', flexShrink: 0, background: '#1e293b' }}>
                          <img
                            src={editingBlog.imageUrl}
                            alt="Cover Preview"
                            style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                            onError={(e) => {
                              (e.currentTarget as HTMLElement).style.opacity = '0.3';
                            }}
                          />
                        </div>
                      ) : (
                        <div style={{ width: '56px', height: '42px', borderRadius: '4px', background: '#1e293b', border: '1px dashed #475569', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#64748b', fontSize: '0.68rem', flexShrink: 0 }}>
                          No image
                        </div>
                      )}
                    </div>
                  </div>

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
                      onChange={(e) => setEditingBlog({ ...editingBlog, summary: e.target.value })}
                      style={{ width: '100%', padding: '8px 12px', borderRadius: '6px', background: '#1e293b', border: '1px solid #334155', color: '#fff', fontSize: '0.88rem', lineHeight: 1.5 }}
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
                        style={{ width: '100%', padding: '8px 12px', borderRadius: '6px', background: '#1e293b', border: '1px solid #334155', color: '#fff', fontSize: '0.85rem' }}
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
                        style={{ width: '100%', padding: '8px 12px', borderRadius: '6px', background: '#1e293b', border: '1px solid #334155', color: '#fff', fontSize: '0.85rem' }}
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
                        style={{ width: '100%', padding: '7px 10px', borderRadius: '6px', background: '#1e293b', border: '1px solid #334155', color: '#fff', fontSize: '0.82rem' }}
                      />
                    </div>
                    <div>
                      <label style={{ display: 'block', fontSize: '0.78rem', color: 'var(--text-light)', marginBottom: '4px' }}>Read Time</label>
                      <input
                        type="text"
                        value={editingBlog.readTime || '5 min read'}
                        onChange={(e) => setEditingBlog({ ...editingBlog, readTime: e.target.value })}
                        style={{ width: '100%', padding: '7px 10px', borderRadius: '6px', background: '#1e293b', border: '1px solid #334155', color: '#fff', fontSize: '0.82rem' }}
                      />
                    </div>
                    <div>
                      <label style={{ display: 'block', fontSize: '0.78rem', color: 'var(--text-light)', marginBottom: '4px' }}>Publish Date</label>
                      <input
                        type="text"
                        value={editingBlog.date || 'March 2026'}
                        onChange={(e) => setEditingBlog({ ...editingBlog, date: e.target.value })}
                        style={{ width: '100%', padding: '7px 10px', borderRadius: '6px', background: '#1e293b', border: '1px solid #334155', color: '#fff', fontSize: '0.82rem' }}
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
                      style={{ width: '100%', padding: '8px 12px', borderRadius: '6px', background: '#1e293b', border: '1px solid #334155', color: '#fff', fontSize: '0.85rem' }}
                    />
                  </div>

                  {/* 4. MULTIPLE HEADINGS, THEIR PARAGRAPHS, THEIR IMAGES OPTIONS */}
                  <div style={{ background: '#090e1c', padding: '1.25rem', borderRadius: '10px', border: '1px solid rgba(212, 175, 55, 0.35)', marginBottom: '1.25rem' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px', flexWrap: 'wrap', gap: '8px' }}>
                      <div>
                        <h5 style={{ margin: 0, color: 'var(--primary-color)', fontSize: '0.98rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <FileText size={17} /> Article Sections: Headings, Paragraphs & Images ({currentSections.length})
                        </h5>
                        <p style={{ margin: '3px 0 0', color: '#94a3b8', fontSize: '0.75rem' }}>
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
                            background: '#131b2e',
                            border: '1px solid rgba(255, 255, 255, 0.1)',
                            borderRadius: '8px',
                            padding: '1rem'
                          }}
                        >
                          {/* Section Header Controls */}
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px', paddingBottom: '6px', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                              <span style={{ background: 'var(--primary-color)', color: '#0f172a', fontWeight: 800, fontSize: '0.75rem', padding: '2px 7px', borderRadius: '4px' }}>
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
                                  color: sIdx === 0 ? '#475569' : '#cbd5e1',
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
                                  color: sIdx === currentSections.length - 1 ? '#475569' : '#cbd5e1',
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
                              style={{ width: '100%', padding: '7px 10px', borderRadius: '5px', background: '#1e293b', border: '1px solid #334155', color: '#fff', fontSize: '0.85rem' }}
                            />
                          </div>

                          {/* Section Image Option & Caption */}
                          <div style={{ background: '#0b1120', padding: '10px', borderRadius: '6px', marginBottom: '10px', border: '1px solid rgba(255,255,255,0.06)' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '5px' }}>
                              <label style={{ fontSize: '0.76rem', color: '#93c5fd', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '5px' }}>
                                <ImageIcon size={13} /> Section Image URL (Optional visual asset for this heading)
                              </label>
                              {sec.imageUrl && (
                                <button
                                  type="button"
                                  onClick={() => {
                                    const updated = [...currentSections];
                                    updated[sIdx] = { ...updated[sIdx], imageUrl: '', imageCaption: '' };
                                    setEditingBlog({ ...editingBlog, sections: updated });
                                  }}
                                  style={{ background: 'transparent', border: 'none', color: '#94a3b8', fontSize: '0.7rem', cursor: 'pointer', padding: 0 }}
                                >
                                  Clear Image
                                </button>
                              )}
                            </div>
                            <div style={{ display: 'grid', gridTemplateColumns: sec.imageUrl ? '1fr 1fr 60px' : '1fr 1fr', gap: '8px', alignItems: 'center' }}>
                              <input
                                type="text"
                                value={sec.imageUrl || ''}
                                placeholder="Section Image URL (https://...)"
                                onChange={(e) => {
                                  const updated = [...currentSections];
                                  updated[sIdx] = { ...updated[sIdx], imageUrl: e.target.value };
                                  setEditingBlog({ ...editingBlog, sections: updated });
                                }}
                                style={{ padding: '6px 9px', borderRadius: '5px', background: '#1e293b', border: '1px solid #334155', color: '#fff', fontSize: '0.8rem' }}
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
                                style={{ padding: '6px 9px', borderRadius: '5px', background: '#1e293b', border: '1px solid #334155', color: '#fff', fontSize: '0.8rem' }}
                              />
                              {sec.imageUrl && (
                                <div style={{ width: '60px', height: '36px', borderRadius: '4px', overflow: 'hidden', border: '1px solid rgba(59,130,246,0.5)', background: '#1e293b' }}>
                                  <img src={sec.imageUrl} alt="preview" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
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
                              style={{ width: '100%', padding: '8px 10px', borderRadius: '5px', background: '#1e293b', border: '1px solid #334155', color: '#fff', fontSize: '0.85rem', lineHeight: 1.5 }}
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
                  <div style={{ background: '#0f172a', padding: '1rem', borderRadius: '8px', border: '1px solid rgba(255, 255, 255, 0.1)', marginBottom: '1.25rem' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                      <label style={{ fontSize: '0.85rem', color: 'var(--primary-color)', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <ImageIcon size={15} /> Extra Article Showcase Photos ({editingBlog.images?.length || 0})
                      </label>
                      <span style={{ fontSize: '0.75rem', color: 'var(--text-light)' }}>
                        Add supplementary visuals to display in the article showcase
                      </span>
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
                              background: '#1e293b'
                            }}
                          >
                            <img src={imgUrl} alt={`gallery ${idx + 1}`} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
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
                        style={{ flex: 1, padding: '7px 12px', borderRadius: '6px', background: '#1e293b', border: '1px solid #334155', color: '#fff', fontSize: '0.85rem' }}
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
                        + Add Image
                      </button>
                    </div>
                  </div>

                  {/* Form Action Buttons */}
                  <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end', paddingTop: '8px', borderTop: '1px solid rgba(255,255,255,0.08)' }}>
                    <button
                      type="button"
                      onClick={() => {
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
                      onClick={() => {
                        if (!editingBlog.title?.trim()) {
                          onShowToast('Please enter an article title', 'error');
                          return;
                        }
                        if (!editingBlog.summary?.trim()) {
                          onShowToast('Please enter an article summary', 'error');
                          return;
                        }

                        // Validate sections
                        const cleanSections = currentSections.map((sec, idx) => ({
                          ...sec,
                          id: sec.id || `sec-${idx + 1}`,
                          heading: sec.heading.trim() || `Section ${idx + 1}`,
                          paragraphs: sec.paragraphs.map(p => p.trim()).filter(Boolean)
                        }));

                        if (cleanSections.length === 0 || cleanSections.every(s => s.paragraphs.length === 0)) {
                          onShowToast('Please write content in at least one section', 'error');
                          return;
                        }

                        // Aggregate all paragraphs for flat compatibility
                        const aggregatedParagraphs = aggregateParagraphs(cleanSections);

                        // Ensure cover image and section images are collected
                        const combinedImages = collectArticleImages(
                          editingBlog.imageUrl?.trim() || '',
                          cleanSections,
                          editingBlog.images || []
                        );

                        const finalizedBlog: BlogPost = {
                          ...editingBlog,
                          title: editingBlog.title.trim(),
                          summary: editingBlog.summary.trim(),
                          imageUrl: editingBlog.imageUrl?.trim() || 'https://images.unsplash.com/photo-1498050108023-c5249f4df085?auto=format&fit=crop&w=1200&q=80',
                          images: combinedImages,
                          category: editingBlog.category || '🌐 Web Development',
                          paragraphs: aggregatedParagraphs.length > 0 ? aggregatedParagraphs : [editingBlog.summary],
                          sections: cleanSections
                        };

                        if (isCreatingBlog) {
                          onAddBlog(finalizedBlog);
                          onShowToast('🎉 Complete blog article with headings & images published successfully!', 'success');
                        } else {
                          onUpdateBlog(finalizedBlog);
                          onShowToast('Article updated with multiple headings, paragraphs & images!', 'success');
                        }
                        setEditingBlog(null);
                        setIsCreatingBlog(false);
                        setNewGalleryImageUrl('');
                      }}
                      className="btn btn-primary"
                      style={{ padding: '7px 18px', fontSize: '0.85rem' }}
                    >
                      <Save size={14} /> {isCreatingBlog ? 'Publish Complete Blog' : 'Save Changes'}
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
                        borderColor: isSelected ? 'var(--primary-color)' : '#334155',
                        background: isSelected ? 'rgba(212, 175, 55, 0.2)' : '#1e293b',
                        color: isSelected ? 'var(--primary-color)' : '#94a3b8',
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
                  background: '#151d32',
                  border: '1px solid #334155',
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
                  const imageCount = blog.images?.length || 1;
                  return (
                    <div
                      key={blog.id}
                      style={{
                        background: '#151d32',
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
                            setEditingBlog({
                              ...blog,
                              sections: ensureBlogSections(blog)
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
                      imageUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80',
                      socials: {
                        linkedin: 'https://linkedin.com',
                        twitter: 'https://twitter.com',
                        github: 'https://github.com'
                      }
                    });
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
              <div style={{ background: '#151d32', padding: '1.25rem', borderRadius: '10px', marginBottom: '1.5rem', border: '1px solid var(--primary-color)' }}>
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
                      style={{ width: '100%', padding: '8px 12px', borderRadius: '6px', background: '#1e293b', border: '1px solid #334155', color: '#fff' }}
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
                      style={{ width: '100%', padding: '8px 12px', borderRadius: '6px', background: '#1e293b', border: '1px solid #334155', color: '#fff' }}
                      required
                    />
                  </div>
                </div>

                <div style={{ marginBottom: '1rem' }}>
                  <label style={{ display: 'block', fontSize: '0.8rem', color: 'var(--text-light)', marginBottom: '4px' }}>
                    Photo URL
                  </label>
                  <input
                    type="text"
                    value={editingTeamMember?.imageUrl || ''}
                    onChange={(e) => setEditingTeamMember(editingTeamMember ? { ...editingTeamMember, imageUrl: e.target.value } : null)}
                    style={{ width: '100%', padding: '8px 12px', borderRadius: '6px', background: '#1e293b', border: '1px solid #334155', color: '#fff' }}
                  />
                </div>

                <div style={{ marginBottom: '1rem' }}>
                  <label style={{ display: 'block', fontSize: '0.8rem', color: 'var(--text-light)', marginBottom: '4px' }}>
                    Short Biography
                  </label>
                  <textarea
                    rows={3}
                    value={editingTeamMember?.bio || ''}
                    onChange={(e) => setEditingTeamMember(editingTeamMember ? { ...editingTeamMember, bio: e.target.value } : null)}
                    style={{ width: '100%', padding: '8px 12px', borderRadius: '6px', background: '#1e293b', border: '1px solid #334155', color: '#fff' }}
                  />
                </div>

                <h5 style={{ color: 'var(--primary-color)', fontSize: '0.85rem', marginBottom: '0.5rem' }}>
                  Social & Portfolio Profiles
                </h5>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', marginBottom: '1.25rem' }}>
                  <div>
                    <label style={{ fontSize: '0.75rem', color: 'var(--text-light)' }}>LinkedIn URL</label>
                    <input
                      type="url"
                      value={editingTeamMember?.socials?.linkedin || ''}
                      onChange={(e) => setEditingTeamMember(editingTeamMember ? { ...editingTeamMember, socials: { ...editingTeamMember.socials, linkedin: e.target.value } } : null)}
                      style={{ width: '100%', padding: '6px 10px', borderRadius: '6px', background: '#1e293b', border: '1px solid #334155', color: '#fff' }}
                    />
                  </div>
                  <div>
                    <label style={{ fontSize: '0.75rem', color: 'var(--text-light)' }}>Twitter / X URL</label>
                    <input
                      type="url"
                      value={editingTeamMember?.socials?.twitter || ''}
                      onChange={(e) => setEditingTeamMember(editingTeamMember ? { ...editingTeamMember, socials: { ...editingTeamMember.socials, twitter: e.target.value } } : null)}
                      style={{ width: '100%', padding: '6px 10px', borderRadius: '6px', background: '#1e293b', border: '1px solid #334155', color: '#fff' }}
                    />
                  </div>
                  <div>
                    <label style={{ fontSize: '0.75rem', color: 'var(--text-light)' }}>Upwork URL</label>
                    <input
                      type="url"
                      value={editingTeamMember?.socials?.upwork || ''}
                      onChange={(e) => setEditingTeamMember(editingTeamMember ? { ...editingTeamMember, socials: { ...editingTeamMember.socials, upwork: e.target.value } } : null)}
                      style={{ width: '100%', padding: '6px 10px', borderRadius: '6px', background: '#1e293b', border: '1px solid #334155', color: '#fff' }}
                    />
                  </div>
                  <div>
                    <label style={{ fontSize: '0.75rem', color: 'var(--text-light)' }}>GitHub / Portfolio URL</label>
                    <input
                      type="url"
                      value={editingTeamMember?.socials?.github || ''}
                      onChange={(e) => setEditingTeamMember(editingTeamMember ? { ...editingTeamMember, socials: { ...editingTeamMember.socials, github: e.target.value } } : null)}
                      style={{ width: '100%', padding: '6px 10px', borderRadius: '6px', background: '#1e293b', border: '1px solid #334155', color: '#fff' }}
                    />
                  </div>
                </div>

                <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
                  <button
                    type="button"
                    onClick={() => {
                      setEditingTeamMember(null);
                      setIsCreatingTeamMember(false);
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
                      if (isCreatingTeamMember) {
                        onAddTeamMember(editingTeamMember);
                        onShowToast(`Added ${editingTeamMember.name} to the team!`, 'success');
                      } else {
                        onUpdateTeamMember(editingTeamMember);
                        onShowToast(`Updated ${editingTeamMember.name}!`, 'success');
                      }
                      setEditingTeamMember(null);
                      setIsCreatingTeamMember(false);
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
              {data.team.map((member) => (
                <div
                  key={member.id}
                  style={{
                    background: '#151d32',
                    padding: '1rem',
                    borderRadius: '8px',
                    border: '1px solid rgba(255, 255, 255, 0.08)',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '12px'
                  }}
                >
                  <img
                    src={member.imageUrl}
                    alt={member.name}
                    style={{ width: '50px', height: '50px', borderRadius: '50%', objectFit: 'cover', border: '2px solid var(--primary-color)' }}
                  />
                  <div style={{ flex: 1 }}>
                    <h4 style={{ margin: 0, color: '#fff', fontSize: '0.95rem' }}>{member.name}</h4>
                    <p style={{ margin: '2px 0 0', fontSize: '0.8rem', color: 'var(--primary-color)', fontWeight: 600 }}>
                      {member.title}
                    </p>
                    <p style={{ margin: '2px 0 0', fontSize: '0.75rem', color: 'var(--text-light)', maxWidth: '380px' }}>
                      {member.bio}
                    </p>
                  </div>
                  <div style={{ display: 'flex', gap: '6px' }}>
                    <button
                      onClick={() => {
                        setEditingTeamMember(member);
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
              ))}
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
              <div style={{ background: '#151d32', padding: '1.25rem', borderRadius: '10px', marginBottom: '1.5rem', border: '1px solid var(--primary-color)' }}>
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
                      style={{ width: '100%', padding: '8px 12px', borderRadius: '6px', background: '#1e293b', border: '1px solid #334155', color: '#fff' }}
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
                      style={{ width: '100%', padding: '8px 12px', borderRadius: '6px', background: '#1e293b', border: '1px solid #334155', color: '#fff' }}
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
                      style={{ width: '100%', padding: '8px 12px', borderRadius: '6px', background: '#1e293b', border: '1px solid #334155', color: '#fff' }}
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
                      style={{ width: '100%', padding: '8px 12px', borderRadius: '6px', background: '#1e293b', border: '1px solid #334155', color: '#fff' }}
                    />
                  </div>
                </div>

                <div style={{ marginBottom: '1.25rem' }}>
                  <label style={{ display: 'block', fontSize: '0.8rem', color: 'var(--text-light)', marginBottom: '4px' }}>
                    Client Quote
                  </label>
                  <textarea
                    rows={3}
                    value={editingTestimonial?.quote || ''}
                    onChange={(e) => setEditingTestimonial(editingTestimonial ? { ...editingTestimonial, quote: e.target.value } : null)}
                    style={{ width: '100%', padding: '8px 12px', borderRadius: '6px', background: '#1e293b', border: '1px solid #334155', color: '#fff' }}
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
                      if (isCreatingTestimonial) {
                        onAddTestimonial(editingTestimonial);
                        onShowToast('Testimonial added!', 'success');
                      } else {
                        onUpdateTestimonial(editingTestimonial);
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
                    background: '#151d32',
                    padding: '1rem',
                    borderRadius: '8px',
                    border: '1px solid rgba(255, 255, 255, 0.08)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between'
                  }}
                >
                  <div style={{ maxWidth: '420px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
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
            <div style={{ background: '#151d32', padding: '1rem', borderRadius: '8px', marginBottom: '1.5rem', border: '1px solid #334155' }}>
              <label style={{ display: 'block', fontSize: '0.8rem', color: 'var(--text-light)', marginBottom: '4px' }}>
                Alliance Status Announcement Message
              </label>
              <textarea
                rows={2}
                value={generalForm.partnershipNotice}
                onChange={(e) => setGeneralForm({ ...generalForm, partnershipNotice: e.target.value })}
                style={{ width: '100%', padding: '8px', borderRadius: '6px', background: '#1e293b', border: '1px solid #334155', color: '#fff', fontSize: '0.85rem' }}
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
              <div style={{ background: '#151d32', padding: '1rem', borderRadius: '8px', marginBottom: '1.5rem', border: '1px solid var(--primary-color)' }}>
                <h4 style={{ color: '#fff', marginBottom: '0.75rem', fontSize: '0.95rem' }}>
                  {isCreatingPartnership ? 'Add Partnership Card' : 'Edit Partnership Card'}
                </h4>
                <div style={{ marginBottom: '0.75rem' }}>
                  <label style={{ fontSize: '0.75rem', color: 'var(--text-light)', display: 'block' }}>Title</label>
                  <input
                    type="text"
                    value={editingPartnership?.title || ''}
                    onChange={(e) => setEditingPartnership(editingPartnership ? { ...editingPartnership, title: e.target.value } : null)}
                    style={{ width: '100%', padding: '8px', borderRadius: '6px', background: '#1e293b', border: '1px solid #334155', color: '#fff' }}
                  />
                </div>
                <div style={{ marginBottom: '0.75rem' }}>
                  <label style={{ fontSize: '0.75rem', color: 'var(--text-light)', display: 'block' }}>Description</label>
                  <textarea
                    rows={2}
                    value={editingPartnership?.description || ''}
                    onChange={(e) => setEditingPartnership(editingPartnership ? { ...editingPartnership, description: e.target.value } : null)}
                    style={{ width: '100%', padding: '8px', borderRadius: '6px', background: '#1e293b', border: '1px solid #334155', color: '#fff' }}
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
                    background: '#151d32',
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
              <div style={{ background: '#151d32', padding: '1.25rem', borderRadius: '10px', marginBottom: '1.5rem', border: '1px solid var(--primary-color)' }}>
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
                    style={{ width: '100%', padding: '8px 12px', borderRadius: '6px', background: '#1e293b', border: '1px solid #334155', color: '#fff' }}
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
                    style={{ width: '100%', padding: '8px 12px', borderRadius: '6px', background: '#1e293b', border: '1px solid #334155', color: '#fff' }}
                    required
                  />
                  {editingPartnerLogo?.logoUrl && (
                    <div style={{ marginTop: '8px', background: '#0f172a', padding: '10px', borderRadius: '6px', display: 'inline-flex', alignItems: 'center', gap: '8px' }}>
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
                    style={{ width: '100%', padding: '8px 12px', borderRadius: '6px', background: '#1e293b', border: '1px solid #334155', color: '#fff' }}
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
                    background: '#151d32',
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
        {activeTab === 'faqs' && (
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
              <div>
                <h3 style={{ margin: 0, color: 'var(--primary-color)', fontSize: '1.15rem' }}>
                  Frequently Asked Questions
                </h3>
                <p style={{ margin: 0, color: 'var(--text-light)', fontSize: '0.8rem' }}>
                  Questions and expandable answers
                </p>
              </div>
              {!isCreatingFaq && !editingFaq && (
                <button
                  onClick={() => {
                    setIsCreatingFaq(true);
                    setEditingFaq({
                      id: `faq-${Date.now()}`,
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
              <div style={{ background: '#151d32', padding: '1.25rem', borderRadius: '10px', marginBottom: '1.5rem', border: '1px solid var(--primary-color)' }}>
                <h4 style={{ color: '#fff', marginBottom: '1rem', fontSize: '1rem' }}>
                  {isCreatingFaq ? 'Add Question' : 'Edit Question'}
                </h4>
                <div style={{ marginBottom: '1rem' }}>
                  <label style={{ display: 'block', fontSize: '0.8rem', color: 'var(--text-light)', marginBottom: '4px' }}>
                    Question
                  </label>
                  <input
                    type="text"
                    value={editingFaq?.question || ''}
                    onChange={(e) => setEditingFaq(editingFaq ? { ...editingFaq, question: e.target.value } : null)}
                    style={{ width: '100%', padding: '8px 12px', borderRadius: '6px', background: '#1e293b', border: '1px solid #334155', color: '#fff' }}
                  />
                </div>
                <div style={{ marginBottom: '1.25rem' }}>
                  <label style={{ display: 'block', fontSize: '0.8rem', color: 'var(--text-light)', marginBottom: '4px' }}>
                    Answer
                  </label>
                  <textarea
                    rows={3}
                    value={editingFaq?.answer || ''}
                    onChange={(e) => setEditingFaq(editingFaq ? { ...editingFaq, answer: e.target.value } : null)}
                    style={{ width: '100%', padding: '8px 12px', borderRadius: '6px', background: '#1e293b', border: '1px solid #334155', color: '#fff' }}
                  />
                </div>
                <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
                  <button
                    type="button"
                    onClick={() => {
                      setEditingFaq(null);
                      setIsCreatingFaq(false);
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
                      if (isCreatingFaq) {
                        onAddFaq(editingFaq);
                        onShowToast('FAQ added!', 'success');
                      } else {
                        onUpdateFaq(editingFaq);
                        onShowToast('FAQ updated!', 'success');
                      }
                      setEditingFaq(null);
                      setIsCreatingFaq(false);
                    }}
                    className="btn btn-primary"
                    style={{ padding: '6px 16px', fontSize: '0.85rem' }}
                  >
                    <Save size={14} /> Save FAQ
                  </button>
                </div>
              </div>
            )}

            {/* List */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {data.faqs.map((faq, index) => (
                <div
                  key={faq.id || index}
                  style={{
                    background: '#151d32',
                    padding: '1rem',
                    borderRadius: '8px',
                    border: '1px solid rgba(255, 255, 255, 0.08)'
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '6px' }}>
                    <h4 style={{ margin: 0, color: '#fff', fontSize: '0.95rem' }}>{faq.question}</h4>
                    <div style={{ display: 'flex', gap: '6px' }}>
                      <button
                        onClick={() => {
                          setEditingFaq(faq);
                          setIsCreatingFaq(false);
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
                        <Edit2 size={15} />
                      </button>
                      <button
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
                      >
                        <Trash2 size={15} />
                      </button>
                    </div>
                  </div>
                  <p style={{ margin: 0, fontSize: '0.85rem', color: 'var(--text-light)', lineHeight: 1.5 }}>
                    {faq.answer}
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}

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

            <div style={{ background: '#151d32', padding: '1.25rem', borderRadius: '10px', marginBottom: '1.5rem', border: '1px solid #334155' }}>
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

            <div style={{ background: '#151d32', padding: '1.25rem', borderRadius: '10px', marginBottom: '1.5rem', border: '1px solid #334155' }}>
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
                style={{ width: '100%', padding: '8px 12px', borderRadius: '6px', background: '#1e293b', border: '1px solid #334155', color: '#fff', fontSize: '0.8rem', marginBottom: '0.75rem' }}
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
          background: '#090d19',
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
          <span style={{ color: syncStatus === 'connected' ? '#94a3b8' : '#f59e0b' }}>
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
            color: '#0f172a',
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
            background: 'rgba(5, 8, 16, 0.85)',
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
              background: '#151d32',
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
            <p style={{ margin: '0 0 1.25rem', color: '#94a3b8', fontSize: '0.88rem', lineHeight: 1.5 }}>
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
