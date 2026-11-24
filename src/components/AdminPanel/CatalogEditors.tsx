import { useState, type ReactNode } from 'react';
import type { BlogPost, BlogSection, FaqItem, Project, TeamMemberData, Testimonial } from '../../types';
import { BLOG_CATEGORIES } from '../../types';
import { aggregateParagraphs } from '../../utils/blogUtils';
import { isPublished, slugify, uniqueDocId } from '../../utils/catalog';

type Run = (work: () => Promise<void>, success: string) => Promise<void>;

function Field({ label, children }: { label: string; children: ReactNode }) {
  return (
    <label className="studio-field">
      <span>{label}</span>
      {children}
    </label>
  );
}

function PublishField({ checked, onChange }: { checked: boolean; onChange: (next: boolean) => void }) {
  return (
    <label className="studio-field" style={{ gridTemplateColumns: 'auto 1fr', alignItems: 'center' }}>
      <input type="checkbox" checked={checked} onChange={(event) => onChange(event.target.checked)} />
      <span>Published on the site</span>
    </label>
  );
}

function RowActions({
  busy,
  published,
  onEdit,
  onToggle,
  onDelete
}: {
  busy: boolean;
  published: boolean;
  onEdit: () => void;
  onToggle: () => void;
  onDelete: () => void;
}) {
  const [confirming, setConfirming] = useState(false);
  return (
    <div className="studio-row-actions">
      <button type="button" className="studio-btn studio-btn-line" disabled={busy} onClick={onEdit}>Edit</button>
      <button type="button" className="studio-btn studio-btn-line" disabled={busy} onClick={onToggle}>
        {published ? 'Unpublish' : 'Publish'}
      </button>
      {confirming ? (
        <>
          <button type="button" className="studio-danger" disabled={busy} onClick={onDelete}>Confirm delete</button>
          <button type="button" className="studio-btn studio-btn-line" disabled={busy} onClick={() => setConfirming(false)}>Cancel</button>
        </>
      ) : (
        <button type="button" className="studio-danger" disabled={busy} onClick={() => setConfirming(true)}>Delete</button>
      )}
    </div>
  );
}

export function CaseStudyEditor({
  items,
  busy,
  run,
  onSave,
  onDelete
}: {
  items: Project[];
  busy: boolean;
  run: Run;
  onSave: (item: Project) => Promise<void>;
  onDelete: (id: string) => Promise<void>;
}) {
  const blank = (): Project => ({
    id: '',
    title: '',
    subtitle: '',
    category: 'web',
    metric: '',
    link: '',
    imageUrl: '',
    description: '',
    tags: [],
    published: false
  });
  const [draft, setDraft] = useState<Project | null>(null);
  const [tags, setTags] = useState('');

  const open = (item: Project | null) => {
    const next = item ? { ...item, tags: item.tags || [], published: isPublished(item) } : blank();
    setDraft(next);
    setTags((next.tags || []).join(', '));
  };

  return (
    <section>
      <div className="studio-section-head">
        <h2>Case studies</h2>
        <button type="button" className="studio-btn studio-btn-primary" onClick={() => open(null)}>New</button>
      </div>
      {items.map((item) => (
        <div className="studio-row" key={item.id}>
          <div>
            <strong>{item.title}</strong>
            <div className="studio-meta">{item.id}</div>
          </div>
          <span className={`studio-pill ${isPublished(item) ? 'live' : 'draft'}`}>{isPublished(item) ? 'Published' : 'Draft'}</span>
          <RowActions
            busy={busy}
            published={isPublished(item)}
            onEdit={() => open(item)}
            onToggle={() => void run(() => onSave({ ...item, published: !isPublished(item) }), 'Case study updated.')}
            onDelete={() => void run(() => onDelete(item.id), 'Case study deleted.')}
          />
        </div>
      ))}
      {draft && (
        <form
          className="studio-form"
          style={{ marginTop: '1rem' }}
          onSubmit={(event) => {
            event.preventDefault();
            const title = draft.title.trim();
            if (!title) return;
            const id = draft.id || uniqueDocId(title, items.map((item) => item.id));
            void run(
              () => onSave({
                ...draft,
                id,
                title,
                tags: tags.split(',').map((tag) => tag.trim()).filter(Boolean)
              }),
              'Case study saved.'
            ).then(() => setDraft(null));
          }}
        >
          <h3>{draft.id ? 'Edit case study' : 'New case study'}</h3>
          <Field label="Title"><input value={draft.title} onChange={(event) => setDraft({ ...draft, title: event.target.value })} required /></Field>
          <Field label="Subtitle"><input value={draft.subtitle} onChange={(event) => setDraft({ ...draft, subtitle: event.target.value })} /></Field>
          <Field label="Category">
            <select value={draft.category} onChange={(event) => setDraft({ ...draft, category: event.target.value as Project['category'] })}>
              <option value="web">Web</option>
              <option value="ecommerce">E-commerce</option>
              <option value="saas">SaaS</option>
            </select>
          </Field>
          <Field label="Result metric"><input value={draft.metric} onChange={(event) => setDraft({ ...draft, metric: event.target.value })} /></Field>
          <Field label="Live URL"><input value={draft.link} onChange={(event) => setDraft({ ...draft, link: event.target.value })} placeholder="https://" /></Field>
          <Field label="Image URL"><input value={draft.imageUrl} onChange={(event) => setDraft({ ...draft, imageUrl: event.target.value })} placeholder="https://" /></Field>
          <Field label="Description"><textarea value={draft.description || ''} onChange={(event) => setDraft({ ...draft, description: event.target.value })} /></Field>
          <Field label="Tags, comma separated"><input value={tags} onChange={(event) => setTags(event.target.value)} /></Field>
          <PublishField checked={Boolean(draft.published)} onChange={(published) => setDraft({ ...draft, published })} />
          <div className="studio-actions">
            <button className="studio-btn studio-btn-primary" type="submit" disabled={busy}>Save case study</button>
            <button className="studio-btn studio-btn-line" type="button" onClick={() => setDraft(null)}>Cancel</button>
          </div>
        </form>
      )}
    </section>
  );
}

interface SectionDraft {
  id: string;
  heading: string;
  body: string;
  imageUrl: string;
  imageCaption: string;
}

function sectionDrafts(post: BlogPost): SectionDraft[] {
  if (post.sections && post.sections.length > 0) {
    return post.sections.map((section) => ({
      id: section.id,
      heading: section.heading,
      body: section.paragraphs.join('\n\n'),
      imageUrl: section.imageUrl || '',
      imageCaption: section.imageCaption || ''
    }));
  }
  return [{
    id: 'sec-1',
    heading: '',
    body: (post.paragraphs || []).join('\n\n'),
    imageUrl: '',
    imageCaption: ''
  }];
}

export function PostEditor({
  items,
  busy,
  run,
  onSave,
  onDelete
}: {
  items: BlogPost[];
  busy: boolean;
  run: Run;
  onSave: (item: BlogPost) => Promise<void>;
  onDelete: (id: string) => Promise<void>;
}) {
  const [draft, setDraft] = useState<BlogPost | null>(null);
  const [sections, setSections] = useState<SectionDraft[]>([]);
  const [tags, setTags] = useState('');

  const open = (item: BlogPost | null) => {
    const next: BlogPost = item || {
      id: '',
      title: '',
      slug: '',
      imageUrl: '',
      summary: '',
      paragraphs: [],
      published: false,
      author: '',
      category: BLOG_CATEGORIES[0],
      date: '',
      readTime: ''
    };
    setDraft({ ...next, published: item ? isPublished(item) : false });
    setSections(sectionDrafts(next));
    setTags((next.tags || []).join(', '));
  };

  const updateSection = (id: string, patch: Partial<SectionDraft>) => {
    setSections((current) => current.map((section) => (section.id === id ? { ...section, ...patch } : section)));
  };

  return (
    <section>
      <div className="studio-section-head">
        <h2>Blog</h2>
        <button type="button" className="studio-btn studio-btn-primary" onClick={() => open(null)}>New</button>
      </div>
      {items.map((item) => (
        <div className="studio-row" key={item.id}>
          <div>
            <strong>{item.title}</strong>
            <div className="studio-meta">{item.slug}</div>
          </div>
          <span className={`studio-pill ${isPublished(item) ? 'live' : 'draft'}`}>{isPublished(item) ? 'Published' : 'Draft'}</span>
          <RowActions
            busy={busy}
            published={isPublished(item)}
            onEdit={() => open(item)}
            onToggle={() => void run(() => onSave({ ...item, published: !isPublished(item) }), 'Article updated.')}
            onDelete={() => void run(() => onDelete(item.id), 'Article deleted.')}
          />
        </div>
      ))}
      {draft && (
        <form
          className="studio-form"
          style={{ marginTop: '1rem' }}
          onSubmit={(event) => {
            event.preventDefault();
            const title = draft.title.trim();
            if (!title) return;
            const slug = (draft.slug || slugify(title)).trim();
            const id = draft.id || uniqueDocId(slug, items.map((item) => item.id));
            const nextSections: BlogSection[] = sections
              .filter((section) => section.heading.trim() || section.body.trim())
              .map((section, index) => ({
                id: section.id || `sec-${index + 1}`,
                heading: section.heading.trim(),
                paragraphs: section.body.split(/\n\n+/).map((part) => part.trim()).filter(Boolean),
                imageUrl: section.imageUrl.trim() || undefined,
                imageCaption: section.imageCaption.trim() || undefined
              }));
            void run(
              () => onSave({
                ...draft,
                id,
                title,
                slug,
                tags: tags.split(',').map((tag) => tag.trim()).filter(Boolean),
                sections: nextSections,
                paragraphs: aggregateParagraphs(nextSections)
              }),
              'Article saved.'
            ).then(() => setDraft(null));
          }}
        >
          <h3>{draft.id ? 'Edit article' : 'New article'}</h3>
          <Field label="Title"><input value={draft.title} onChange={(event) => setDraft({ ...draft, title: event.target.value })} required /></Field>
          <Field label="Slug"><input value={draft.slug} onChange={(event) => setDraft({ ...draft, slug: event.target.value })} placeholder="Generated from the title if empty" /></Field>
          <Field label="Summary"><textarea value={draft.summary} onChange={(event) => setDraft({ ...draft, summary: event.target.value })} /></Field>
          <Field label="Category">
            <select value={draft.category || BLOG_CATEGORIES[0]} onChange={(event) => setDraft({ ...draft, category: event.target.value })}>
              {BLOG_CATEGORIES.map((category) => <option key={category} value={category}>{category}</option>)}
            </select>
          </Field>
          <div className="studio-form-grid">
            <Field label="Author"><input value={draft.author || ''} onChange={(event) => setDraft({ ...draft, author: event.target.value })} /></Field>
            <Field label="Date"><input value={draft.date || ''} onChange={(event) => setDraft({ ...draft, date: event.target.value })} /></Field>
            <Field label="Read time"><input value={draft.readTime || ''} onChange={(event) => setDraft({ ...draft, readTime: event.target.value })} /></Field>
          </div>
          <Field label="Image URL"><input value={draft.imageUrl} onChange={(event) => setDraft({ ...draft, imageUrl: event.target.value })} placeholder="https://" /></Field>
          <Field label="Tags, comma separated"><input value={tags} onChange={(event) => setTags(event.target.value)} /></Field>
          {sections.map((section, index) => (
            <fieldset key={section.id} className="studio-card">
              <legend>Section {index + 1}</legend>
              <Field label="Heading"><input value={section.heading} onChange={(event) => updateSection(section.id, { heading: event.target.value })} /></Field>
              <Field label="Paragraphs, separated by a blank line">
                <textarea value={section.body} onChange={(event) => updateSection(section.id, { body: event.target.value })} />
              </Field>
              <Field label="Section image URL"><input value={section.imageUrl} onChange={(event) => updateSection(section.id, { imageUrl: event.target.value })} placeholder="https://" /></Field>
              <Field label="Image caption"><input value={section.imageCaption} onChange={(event) => updateSection(section.id, { imageCaption: event.target.value })} /></Field>
              {sections.length > 1 && (
                <button type="button" className="studio-danger" onClick={() => setSections((current) => current.filter((item) => item.id !== section.id))}>
                  Remove section
                </button>
              )}
            </fieldset>
          ))}
          <button
            type="button"
            className="studio-btn studio-btn-line"
            onClick={() => setSections((current) => [...current, { id: `sec-${Date.now()}`, heading: '', body: '', imageUrl: '', imageCaption: '' }])}
          >
            Add section
          </button>
          <PublishField checked={Boolean(draft.published)} onChange={(published) => setDraft({ ...draft, published })} />
          <div className="studio-actions">
            <button className="studio-btn studio-btn-primary" type="submit" disabled={busy}>Save article</button>
            <button className="studio-btn studio-btn-line" type="button" onClick={() => setDraft(null)}>Cancel</button>
          </div>
        </form>
      )}
    </section>
  );
}

const SOCIAL_FIELDS: Array<{ key: keyof TeamMemberData['socials']; label: string }> = [
  { key: 'linkedin', label: 'LinkedIn URL' },
  { key: 'linkedinCompany', label: 'LinkedIn company URL' },
  { key: 'twitter', label: 'X (Twitter) URL' },
  { key: 'youtube', label: 'YouTube URL' },
  { key: 'facebook', label: 'Facebook URL' },
  { key: 'instagram', label: 'Instagram URL' },
  { key: 'instagramCompany', label: 'Instagram company URL' },
  { key: 'upwork', label: 'Upwork URL' },
  { key: 'github', label: 'GitHub URL' }
];

export function TeamEditor({
  items,
  busy,
  run,
  onSave,
  onDelete
}: {
  items: TeamMemberData[];
  busy: boolean;
  run: Run;
  onSave: (item: TeamMemberData) => Promise<void>;
  onDelete: (id: string) => Promise<void>;
}) {
  const [draft, setDraft] = useState<TeamMemberData | null>(null);
  const [skills, setSkills] = useState('');

  const open = (item: TeamMemberData | null) => {
    const next: TeamMemberData = item || {
      id: '',
      name: '',
      title: '',
      bio: '',
      imageUrl: '',
      skills: [],
      socials: {},
      published: false
    };
    setDraft({ ...next, socials: { ...next.socials }, published: item ? isPublished(item) : false });
    setSkills((next.skills || []).join('\n'));
  };

  return (
    <section>
      <div className="studio-section-head">
        <h2>Team</h2>
        <button type="button" className="studio-btn studio-btn-primary" onClick={() => open(null)}>New</button>
      </div>
      {items.map((item) => (
        <div className="studio-row" key={item.id}>
          <div>
            <strong>{item.name}</strong>
            <div className="studio-meta">{item.title}</div>
          </div>
          <span className={`studio-pill ${isPublished(item) ? 'live' : 'draft'}`}>{isPublished(item) ? 'Published' : 'Draft'}</span>
          <RowActions
            busy={busy}
            published={isPublished(item)}
            onEdit={() => open(item)}
            onToggle={() => void run(() => onSave({ ...item, published: !isPublished(item) }), 'Profile updated.')}
            onDelete={() => void run(() => onDelete(item.id), 'Profile deleted.')}
          />
        </div>
      ))}
      {draft && (
        <form
          className="studio-form"
          style={{ marginTop: '1rem' }}
          onSubmit={(event) => {
            event.preventDefault();
            const name = draft.name.trim();
            if (!name) return;
            const id = draft.id || uniqueDocId(name, items.map((item) => item.id));
            void run(
              () => onSave({
                ...draft,
                id,
                name,
                skills: skills.split(/[\n,]+/).map((skill) => skill.trim()).filter(Boolean)
              }),
              'Profile saved.'
            ).then(() => setDraft(null));
          }}
        >
          <h3>{draft.id ? 'Edit profile' : 'New profile'}</h3>
          <Field label="Name"><input value={draft.name} onChange={(event) => setDraft({ ...draft, name: event.target.value })} required /></Field>
          <Field label="Title"><input value={draft.title} onChange={(event) => setDraft({ ...draft, title: event.target.value })} /></Field>
          <Field label="Bio"><textarea value={draft.bio} onChange={(event) => setDraft({ ...draft, bio: event.target.value })} /></Field>
          <Field label="Image URL"><input value={draft.imageUrl} onChange={(event) => setDraft({ ...draft, imageUrl: event.target.value })} placeholder="https://" /></Field>
          <Field label="Skills, one per line"><textarea value={skills} onChange={(event) => setSkills(event.target.value)} /></Field>
          {SOCIAL_FIELDS.map((field) => (
            <Field key={field.key} label={field.label}>
              <input
                value={draft.socials[field.key] || ''}
                onChange={(event) => setDraft({ ...draft, socials: { ...draft.socials, [field.key]: event.target.value } })}
                placeholder="https://"
              />
            </Field>
          ))}
          <PublishField checked={Boolean(draft.published)} onChange={(published) => setDraft({ ...draft, published })} />
          <div className="studio-actions">
            <button className="studio-btn studio-btn-primary" type="submit" disabled={busy}>Save profile</button>
            <button className="studio-btn studio-btn-line" type="button" onClick={() => setDraft(null)}>Cancel</button>
          </div>
        </form>
      )}
    </section>
  );
}

export function TestimonialEditor({
  items,
  busy,
  run,
  onSave,
  onDelete
}: {
  items: Testimonial[];
  busy: boolean;
  run: Run;
  onSave: (item: Testimonial) => Promise<void>;
  onDelete: (id: string) => Promise<void>;
}) {
  const [draft, setDraft] = useState<Testimonial | null>(null);
  const open = (item: Testimonial | null) => {
    setDraft(item ? { ...item, published: isPublished(item) } : { id: '', name: '', role: '', initials: '', quote: '', rating: 5, imageUrl: '', published: false });
  };
  return (
    <section>
      <div className="studio-section-head">
        <h2>Testimonials</h2>
        <button type="button" className="studio-btn studio-btn-primary" onClick={() => open(null)}>New</button>
      </div>
      {items.map((item) => (
        <div className="studio-row" key={item.id}>
          <div>
            <strong>{item.name}</strong>
            <div className="studio-meta">{item.role}</div>
          </div>
          <span className={`studio-pill ${isPublished(item) ? 'live' : 'draft'}`}>{isPublished(item) ? 'Published' : 'Draft'}</span>
          <RowActions
            busy={busy}
            published={isPublished(item)}
            onEdit={() => open(item)}
            onToggle={() => void run(() => onSave({ ...item, published: !isPublished(item) }), 'Testimonial updated.')}
            onDelete={() => void run(() => onDelete(item.id), 'Testimonial deleted.')}
          />
        </div>
      ))}
      {draft && (
        <form
          className="studio-form"
          style={{ marginTop: '1rem' }}
          onSubmit={(event) => {
            event.preventDefault();
            const name = draft.name.trim();
            if (!name) return;
            const id = draft.id || uniqueDocId(name, items.map((item) => item.id));
            const initials = draft.initials.trim() || name.split(/\s+/).map((part) => part[0] || '').join('.').slice(0, 4);
            void run(() => onSave({ ...draft, id, name, initials, rating: Math.min(5, Math.max(1, Number(draft.rating) || 5)) }), 'Testimonial saved.').then(() => setDraft(null));
          }}
        >
          <h3>{draft.id ? 'Edit testimonial' : 'New testimonial'}</h3>
          <Field label="Name"><input value={draft.name} onChange={(event) => setDraft({ ...draft, name: event.target.value })} required /></Field>
          <Field label="Role"><input value={draft.role} onChange={(event) => setDraft({ ...draft, role: event.target.value })} /></Field>
          <Field label="Quote"><textarea value={draft.quote} onChange={(event) => setDraft({ ...draft, quote: event.target.value })} required /></Field>
          <Field label="Rating">
            <select value={draft.rating} onChange={(event) => setDraft({ ...draft, rating: Number(event.target.value) })}>
              {[5, 4, 3, 2, 1].map((rating) => <option key={rating} value={rating}>{rating}</option>)}
            </select>
          </Field>
          <Field label="Initials"><input value={draft.initials} onChange={(event) => setDraft({ ...draft, initials: event.target.value })} /></Field>
          <Field label="Image URL"><input value={draft.imageUrl || ''} onChange={(event) => setDraft({ ...draft, imageUrl: event.target.value })} placeholder="https://" /></Field>
          <PublishField checked={Boolean(draft.published)} onChange={(published) => setDraft({ ...draft, published })} />
          <div className="studio-actions">
            <button className="studio-btn studio-btn-primary" type="submit" disabled={busy}>Save testimonial</button>
            <button className="studio-btn studio-btn-line" type="button" onClick={() => setDraft(null)}>Cancel</button>
          </div>
        </form>
      )}
    </section>
  );
}

export function FaqEditor({
  items,
  busy,
  run,
  onSave,
  onDelete
}: {
  items: FaqItem[];
  busy: boolean;
  run: Run;
  onSave: (item: FaqItem) => Promise<void>;
  onDelete: (id: string) => Promise<void>;
}) {
  const [draft, setDraft] = useState<FaqItem | null>(null);
  const rows = items.filter((item) => item.id);
  return (
    <section>
      <div className="studio-section-head">
        <h2>FAQs</h2>
        <button type="button" className="studio-btn studio-btn-primary" onClick={() => setDraft({ id: '', question: '', answer: '', published: false })}>New</button>
      </div>
      {rows.map((item) => (
        <div className="studio-row" key={item.id}>
          <div>
            <strong>{item.question}</strong>
          </div>
          <span className={`studio-pill ${isPublished(item) ? 'live' : 'draft'}`}>{isPublished(item) ? 'Published' : 'Draft'}</span>
          <RowActions
            busy={busy}
            published={isPublished(item)}
            onEdit={() => setDraft({ ...item, published: isPublished(item) })}
            onToggle={() => void run(() => onSave({ ...item, published: !isPublished(item) }), 'FAQ updated.')}
            onDelete={() => void run(() => onDelete(item.id || ''), 'FAQ deleted.')}
          />
        </div>
      ))}
      {draft && (
        <form
          className="studio-form"
          style={{ marginTop: '1rem' }}
          onSubmit={(event) => {
            event.preventDefault();
            const question = draft.question.trim();
            if (!question) return;
            const id = draft.id || uniqueDocId(question, rows.map((item) => item.id || ''));
            void run(() => onSave({ ...draft, id, question }), 'FAQ saved.').then(() => setDraft(null));
          }}
        >
          <h3>{draft.id ? 'Edit FAQ' : 'New FAQ'}</h3>
          <Field label="Question"><input value={draft.question} onChange={(event) => setDraft({ ...draft, question: event.target.value })} required /></Field>
          <Field label="Answer"><textarea value={draft.answer} onChange={(event) => setDraft({ ...draft, answer: event.target.value })} required /></Field>
          <PublishField checked={Boolean(draft.published)} onChange={(published) => setDraft({ ...draft, published })} />
          <div className="studio-actions">
            <button className="studio-btn studio-btn-primary" type="submit" disabled={busy}>Save FAQ</button>
            <button className="studio-btn studio-btn-line" type="button" onClick={() => setDraft(null)}>Cancel</button>
          </div>
        </form>
      )}
    </section>
  );
}
