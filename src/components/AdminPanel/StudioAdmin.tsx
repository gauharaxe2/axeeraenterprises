import React, { useEffect, useState } from 'react';
import type {
  AgencyGeneralInfo,
  BlogPost,
  FaqItem,
  PartnerLogo,
  PartnershipItem,
  Project,
  ServiceItem,
  TeamMemberData,
  Testimonial
} from '../../types';
import type { CatalogData } from '../../hooks/useCatalog';
import { catalogErrorMessage } from '../../hooks/useCatalog';
import { uniqueDocId } from '../../utils/catalog';
import {
  subscribeToNewsletterList,
  subscribeToSubmissions,
  type EnquiryRecord,
  type NewsletterRecord
} from '../../utils/firebase';
import { ImageUploadField } from './ImageUploadField';
import { SERVICE_IMAGE_MAX_DIMENSION } from '../../utils/imageUpload';
import { CaseStudyEditor, FaqEditor, PostEditor, TeamEditor, TestimonialEditor } from './CatalogEditors';

type Tab = 'leads' | 'projects' | 'blogs' | 'team' | 'testimonials' | 'faqs' | 'services' | 'general' | 'partnerships' | 'logos';

interface Actions {
  saveGeneral: (info: AgencyGeneralInfo) => Promise<void>;
  saveService: (item: ServiceItem) => Promise<void>;
  deleteService: (id: string) => Promise<void>;
  saveProject: (item: Project) => Promise<void>;
  deleteProject: (id: string) => Promise<void>;
  saveBlog: (item: BlogPost) => Promise<void>;
  deleteBlog: (id: string) => Promise<void>;
  saveTeamMember: (item: TeamMemberData) => Promise<void>;
  deleteTeamMember: (id: string) => Promise<void>;
  saveTestimonial: (item: Testimonial) => Promise<void>;
  deleteTestimonial: (id: string) => Promise<void>;
  saveFaq: (item: FaqItem) => Promise<void>;
  deleteFaq: (id: string) => Promise<void>;
  savePartnership: (item: PartnershipItem) => Promise<void>;
  deletePartnership: (id: string) => Promise<void>;
  savePartnerLogo: (item: PartnerLogo) => Promise<void>;
  deletePartnerLogo: (id: string) => Promise<void>;
  seedCatalog: () => Promise<void>;
}

interface StudioAdminProps {
  data: CatalogData;
  syncStatus: 'connected' | 'syncing' | 'offline';
  rulesBlocked: boolean;
  onNavigate: (url: string) => void;
  onLogout: () => void;
  onNotify: (message: string, type: 'success' | 'error' | 'info') => void;
  actions: Actions;
}

const TABS: Array<{ id: Tab; label: string }> = [
  { id: 'leads', label: 'Leads' },
  { id: 'projects', label: 'Case studies' },
  { id: 'blogs', label: 'Blog' },
  { id: 'team', label: 'Team' },
  { id: 'testimonials', label: 'Testimonials' },
  { id: 'faqs', label: 'FAQs' },
  { id: 'services', label: 'Services' },
  { id: 'general', label: 'Studio' },
  { id: 'partnerships', label: 'Partnerships' },
  { id: 'logos', label: 'Technology logos' }
];

function ConfirmDelete({ busy, label, onConfirm }: { busy: boolean; label: string; onConfirm: () => void }) {
  const [open, setOpen] = useState(false);
  if (!open) {
    return <button type="button" className="studio-danger" disabled={busy} onClick={() => setOpen(true)}>{label}</button>;
  }
  return (
    <>
      <button type="button" className="studio-danger" disabled={busy} onClick={onConfirm}>Confirm delete</button>
      <button type="button" className="studio-btn studio-btn-line" disabled={busy} onClick={() => setOpen(false)}>Cancel</button>
    </>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return <label className="studio-field"><span>{label}</span>{children}</label>;
}

export function StudioAdmin({ data, syncStatus, rulesBlocked, onNavigate, onLogout, onNotify, actions }: StudioAdminProps) {
  const [tab, setTab] = useState<Tab>('leads');
  const [busy, setBusy] = useState(false);
  const [leads, setLeads] = useState<EnquiryRecord[]>([]);
  const [news, setNews] = useState<NewsletterRecord[]>([]);
  const [leadError, setLeadError] = useState('');
  const [newsError, setNewsError] = useState('');
  const [confirmSeed, setConfirmSeed] = useState(false);

  useEffect(() => {
    const stopLeads = subscribeToSubmissions(
      (rows) => {
        setLeads(rows);
        setLeadError('');
      },
      (message) => setLeadError(message)
    );
    const stopNews = subscribeToNewsletterList(
      (rows) => {
        setNews(rows);
        setNewsError('');
      },
      (message) => setNewsError(message)
    );
    return () => {
      stopLeads();
      stopNews();
    };
  }, []);

  const run = async (work: () => Promise<void>, success: string) => {
    setBusy(true);
    try {
      await work();
      onNotify(success, 'success');
    } catch (error) {
      onNotify(catalogErrorMessage(error), 'error');
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="studio studio-admin">
      <div className="studio-wrap">
        <div className="studio-admin-bar">
          <div>
            <p className="studio-kicker">Admin</p>
            <h1>Studio desk</h1>
          </div>
          <div className="studio-actions">
            <button type="button" className="studio-btn studio-btn-line" onClick={() => onNavigate('/')}>View site</button>
            <button type="button" className="studio-btn studio-btn-line" onClick={onLogout}>Sign out</button>
          </div>
        </div>
        <div className="studio-banner">
          <p>
            Signed in with Google. Catalog status: {syncStatus}.
            {rulesBlocked
              ? ' Firestore is still on the previous rules, so saves to the new collections will be refused until those rules are deployed. This screen does not deploy them.'
              : ' Saves write to the shared Firebase project. They do not change the current production website until this redesign is merged.'}
          </p>
          {confirmSeed ? (
            <div className="studio-actions">
              <button
                type="button"
                className="studio-btn studio-btn-ink"
                disabled={busy}
                onClick={() => {
                  setConfirmSeed(false);
                  void run(() => actions.seedCatalog(), 'Existing catalog saved to Firestore.');
                }}
              >
                Confirm save to Firestore
              </button>
              <button type="button" className="studio-btn studio-btn-line" onClick={() => setConfirmSeed(false)}>Cancel</button>
            </div>
          ) : (
            <button type="button" className="studio-btn studio-btn-ink" disabled={busy} onClick={() => setConfirmSeed(true)}>
              Save existing catalog to Firestore
            </button>
          )}
        </div>
        <div className="studio-admin-layout">
          <nav className="studio-admin-nav" aria-label="Admin sections">
            {TABS.map((item) => (
              <button key={item.id} type="button" aria-current={tab === item.id ? 'page' : undefined} onClick={() => setTab(item.id)}>
                {item.label}
              </button>
            ))}
          </nav>
          <div>
            {tab === 'leads' && <Leads leads={leads} news={news} leadError={leadError} newsError={newsError} />}
            {tab === 'projects' && (
              <CaseStudyEditor items={data.projects} busy={busy} run={run} onSave={actions.saveProject} onDelete={actions.deleteProject} />
            )}
            {tab === 'blogs' && (
              <PostEditor items={data.blogs} busy={busy} run={run} onSave={actions.saveBlog} onDelete={actions.deleteBlog} />
            )}
            {tab === 'team' && (
              <TeamEditor items={data.team} busy={busy} run={run} onSave={actions.saveTeamMember} onDelete={actions.deleteTeamMember} />
            )}
            {tab === 'testimonials' && (
              <TestimonialEditor items={data.testimonials} busy={busy} run={run} onSave={actions.saveTestimonial} onDelete={actions.deleteTestimonial} />
            )}
            {tab === 'faqs' && (
              <FaqEditor items={data.faqs} busy={busy} run={run} onSave={actions.saveFaq} onDelete={actions.deleteFaq} />
            )}
            {tab === 'services' && <ServicesEditor data={data.services} busy={busy} run={run} actions={actions} onNotify={onNotify} />}
            {tab === 'general' && <GeneralEditor info={data.generalInfo} busy={busy} run={run} actions={actions} />}
            {tab === 'partnerships' && <PartnershipEditor items={data.partnerships} busy={busy} run={run} actions={actions} />}
            {tab === 'logos' && <LogoEditor items={data.partnerLogos} busy={busy} run={run} actions={actions} />}
          </div>
        </div>
      </div>
    </div>
  );

}

function Leads({
  leads,
  news,
  leadError,
  newsError
}: {
  leads: EnquiryRecord[];
  news: NewsletterRecord[];
  leadError: string;
  newsError: string;
}) {
  return (
    <section>
      <h2>Contact submissions</h2>
      <p>Read only. Status is stored on each Firestore submission.</p>
      {leadError && <p role="alert">{leadError}</p>}
      {leads.length === 0 ? <p>No contact submissions are visible.</p> : (
        <table className="studio-table">
          <thead>
            <tr><th>When</th><th>From</th><th>Service</th><th>Message</th><th>Status</th></tr>
          </thead>
          <tbody>
            {leads.map((row) => (
              <tr key={row.id}>
                <td>{row.createdAt}</td>
                <td>{row.name}<br />{row.email}{row.company ? <><br />{row.company}</> : null}</td>
                <td>{row.service || '—'}{row.budget ? <><br />{row.budget}</> : null}</td>
                <td>{row.message}</td>
                <td><span className={`studio-pill ${row.read ? 'live' : 'wait'}`}>{row.read ? 'Read' : 'Unread'}</span></td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
      <h2 style={{ marginTop: '2rem' }}>Newsletter</h2>
      {newsError && <p role="alert">{newsError}</p>}
      {news.length === 0 ? <p>No newsletter subscribers are visible.</p> : (
        <table className="studio-table">
          <thead><tr><th>When</th><th>Email</th><th>Source</th><th>Status</th></tr></thead>
          <tbody>
            {news.map((row) => (
              <tr key={row.id}>
                <td>{row.createdAt}</td>
                <td>{row.email}</td>
                <td>{row.source || '—'}</td>
                <td><span className="studio-pill live">{row.status || 'active'}</span></td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </section>
  );
}

function GeneralEditor({
  info,
  busy,
  run,
  actions
}: {
  info: AgencyGeneralInfo;
  busy: boolean;
  run: (work: () => Promise<void>, success: string) => Promise<void>;
  actions: Actions;
}) {
  const [draft, setDraft] = useState(info);
  useEffect(() => setDraft(info), [info]);
  const set = (key: keyof AgencyGeneralInfo, value: string) => setDraft((prev) => ({ ...prev, [key]: value }));
  return (
    <form className="studio-form" onSubmit={(event) => {
      event.preventDefault();
      void run(() => actions.saveGeneral(draft), 'Studio details saved.');
    }}>
      <h2>Studio copy and contact</h2>
      <Field label="Hero title"><input value={draft.heroTitle} onChange={(event) => set('heroTitle', event.target.value)} /></Field>
      <Field label="Hero subtitle"><textarea value={draft.heroSubtitle} onChange={(event) => set('heroSubtitle', event.target.value)} /></Field>
      <Field label="About title"><input value={draft.aboutTitle} onChange={(event) => set('aboutTitle', event.target.value)} /></Field>
      <Field label="About paragraph"><textarea value={draft.aboutParagraph1} onChange={(event) => set('aboutParagraph1', event.target.value)} /></Field>
      <Field label="About paragraph 2"><textarea value={draft.aboutParagraph2} onChange={(event) => set('aboutParagraph2', event.target.value)} /></Field>
      <Field label="About image URL"><input value={draft.aboutImageUrl} onChange={(event) => set('aboutImageUrl', event.target.value)} /></Field>
      <div className="studio-form-grid">
        <Field label="Years"><input type="number" value={draft.stats.years} onChange={(event) => setDraft((prev) => ({ ...prev, stats: { ...prev.stats, years: Number(event.target.value) } }))} /></Field>
        <Field label="Experts"><input type="number" value={draft.stats.experts} onChange={(event) => setDraft((prev) => ({ ...prev, stats: { ...prev.stats, experts: Number(event.target.value) } }))} /></Field>
        <Field label="Projects"><input type="number" value={draft.stats.projects} onChange={(event) => setDraft((prev) => ({ ...prev, stats: { ...prev.stats, projects: Number(event.target.value) } }))} /></Field>
        <Field label="Retention %"><input type="number" value={draft.stats.retention} onChange={(event) => setDraft((prev) => ({ ...prev, stats: { ...prev.stats, retention: Number(event.target.value) } }))} /></Field>
      </div>
      <Field label="Address"><input value={draft.contactAddress} onChange={(event) => set('contactAddress', event.target.value)} /></Field>
      <Field label="Phone"><input value={draft.contactPhone} onChange={(event) => set('contactPhone', event.target.value)} /></Field>
      <Field label="Email"><input value={draft.contactEmail} onChange={(event) => set('contactEmail', event.target.value)} /></Field>
      <Field label="WhatsApp number"><input value={draft.whatsappNumber} onChange={(event) => set('whatsappNumber', event.target.value)} /></Field>
      <Field label="Urgent notice"><textarea value={draft.urgentNotice} onChange={(event) => set('urgentNotice', event.target.value)} /></Field>
      <Field label="Partnership notice"><textarea value={draft.partnershipNotice} onChange={(event) => set('partnershipNotice', event.target.value)} /></Field>
      <button className="studio-btn studio-btn-primary" type="submit" disabled={busy}>Save studio details</button>
    </form>
  );
}

function ServicesEditor({
  data,
  busy,
  run,
  actions,
  onNotify
}: {
  data: ServiceItem[];
  busy: boolean;
  run: (work: () => Promise<void>, success: string) => Promise<void>;
  actions: Actions;
  onNotify: StudioAdminProps['onNotify'];
}) {
  const [current, setCurrent] = useState<ServiceItem | null>(null);
  return (
    <section>
      <div className="studio-section-head">
        <h2>Services</h2>
        <button type="button" className="studio-btn studio-btn-primary" onClick={() => setCurrent({ id: '', title: '', shortDesc: '', icon: 'Box', features: [], fullDesc: '' })}>New</button>
      </div>
      {data.map((item) => (
        <div className="studio-row" key={item.id}>
          <strong>{item.title}</strong>
          <span className="studio-meta">{item.id}</span>
          <div className="studio-row-actions">
            <button type="button" className="studio-btn studio-btn-line" onClick={() => setCurrent(item)}>Edit</button>
            <ConfirmDelete busy={busy} label="Delete" onConfirm={() => void run(() => actions.deleteService(item.id), 'Service deleted.')} />
          </div>
        </div>
      ))}
      {current && (
        <form className="studio-form" style={{ marginTop: '1rem' }} onSubmit={(event) => {
          event.preventDefault();
          const id = current.id || uniqueDocId(current.title, data.map((item) => item.id));
          void run(() => actions.saveService({ ...current, id, slug: current.slug || id }), 'Service saved.').then(() => setCurrent(null));
        }}>
          <Field label="Title"><input value={current.title} onChange={(event) => setCurrent({ ...current, title: event.target.value })} required /></Field>
          <Field label="Short description"><textarea value={current.shortDesc} onChange={(event) => setCurrent({ ...current, shortDesc: event.target.value })} /></Field>
          <Field label="Full description"><textarea value={current.fullDesc || ''} onChange={(event) => setCurrent({ ...current, fullDesc: event.target.value })} /></Field>
          <Field label="Features, one per line"><textarea value={(current.features || []).join('\n')} onChange={(event) => setCurrent({ ...current, features: event.target.value.split('\n').map((line) => line.trim()).filter(Boolean) })} /></Field>
          <ImageUploadField
            id="service-image"
            label="Service image"
            value={current.imageUrl || ''}
            onChange={(imageUrl) => setCurrent({ ...current, imageUrl })}
            onError={(message) => onNotify(message, 'error')}
            shape="rounded"
            maxDimension={SERVICE_IMAGE_MAX_DIMENSION}
          />
          <button className="studio-btn studio-btn-primary" disabled={busy} type="submit">Save service</button>
        </form>
      )}
    </section>
  );
}

function PartnershipEditor({
  items,
  busy,
  run,
  actions
}: {
  items: PartnershipItem[];
  busy: boolean;
  run: (work: () => Promise<void>, success: string) => Promise<void>;
  actions: Actions;
}) {
  const [current, setCurrent] = useState<PartnershipItem | null>(null);
  return (
    <section>
      <h2>Partnership notes</h2>
      {items.map((item) => (
        <div className="studio-row" key={item.id}>
          <strong>{item.title}</strong>
          <span />
          <div className="studio-row-actions">
            <button type="button" className="studio-btn studio-btn-line" onClick={() => setCurrent(item)}>Edit</button>
            <ConfirmDelete busy={busy} label="Delete" onConfirm={() => void run(() => actions.deletePartnership(item.id), 'Partnership note deleted.')} />
          </div>
        </div>
      ))}
      <button type="button" className="studio-btn studio-btn-line" onClick={() => setCurrent({ id: '', title: '', description: '', icon: 'Handshake' })}>New note</button>
      {current && (
        <form className="studio-form" onSubmit={(event) => {
          event.preventDefault();
          const id = current.id || uniqueDocId(current.title, items.map((item) => item.id));
          void run(() => actions.savePartnership({ ...current, id }), 'Partnership note saved.');
        }}>
          <Field label="Title"><input value={current.title} onChange={(event) => setCurrent({ ...current, title: event.target.value })} /></Field>
          <Field label="Description"><textarea value={current.description} onChange={(event) => setCurrent({ ...current, description: event.target.value })} /></Field>
          <Field label="Icon">
            <select value={current.icon} onChange={(event) => setCurrent({ ...current, icon: event.target.value as PartnershipItem['icon'] })}>
              <option value="Handshake">Handshake</option>
              <option value="Network">Network</option>
              <option value="Globe">Globe</option>
            </select>
          </Field>
          <button className="studio-btn studio-btn-primary" disabled={busy} type="submit">Save note</button>
        </form>
      )}
    </section>
  );
}

function LogoEditor({
  items,
  busy,
  run,
  actions
}: {
  items: PartnerLogo[];
  busy: boolean;
  run: (work: () => Promise<void>, success: string) => Promise<void>;
  actions: Actions;
}) {
  const [current, setCurrent] = useState<PartnerLogo | null>(null);
  return (
    <section>
      <h2>Technology logos</h2>
      <p>These are the technology marks already on the site, not client logos.</p>
      {items.map((item) => (
        <div className="studio-row" key={item.id}>
          <strong>{item.name}</strong>
          <span className="studio-meta">{item.websiteUrl}</span>
          <div className="studio-row-actions">
            <button type="button" className="studio-btn studio-btn-line" onClick={() => setCurrent(item)}>Edit</button>
            <ConfirmDelete busy={busy} label="Delete" onConfirm={() => void run(() => actions.deletePartnerLogo(item.id), 'Logo removed.')} />
          </div>
        </div>
      ))}
      <button type="button" className="studio-btn studio-btn-line" onClick={() => setCurrent({ id: '', name: '', logoUrl: '' })}>New logo</button>
      {current && (
        <form className="studio-form" onSubmit={(event) => {
          event.preventDefault();
          const id = current.id || uniqueDocId(current.name, items.map((item) => item.id));
          void run(() => actions.savePartnerLogo({ ...current, id }), 'Logo saved.');
        }}>
          <Field label="Name"><input value={current.name} onChange={(event) => setCurrent({ ...current, name: event.target.value })} /></Field>
          <Field label="Logo URL"><input value={current.logoUrl} onChange={(event) => setCurrent({ ...current, logoUrl: event.target.value })} /></Field>
          <Field label="Website"><input value={current.websiteUrl || ''} onChange={(event) => setCurrent({ ...current, websiteUrl: event.target.value })} /></Field>
          <button className="studio-btn studio-btn-primary" disabled={busy} type="submit">Save logo</button>
        </form>
      )}
    </section>
  );
}
