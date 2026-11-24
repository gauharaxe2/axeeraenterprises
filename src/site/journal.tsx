import { useMemo, useState } from 'react';
import type { BlogPost } from '../types';
import { BLOG_CATEGORY_METAS } from '../data/blogs';
import { useLanguage } from '../context/LanguageContext';
import { EmptyState, Media, SiteNavigate, usePlainClick } from './chrome';

export function JournalIndex({ posts, navigate }: { posts: BlogPost[]; navigate: SiteNavigate }) {
  const { strings } = useLanguage();
  const click = usePlainClick(navigate);
  const [query, setQuery] = useState('');
  const [category, setCategory] = useState('all');
  const visible = useMemo(() => {
    const needle = query.trim().toLowerCase();
    return posts.filter((post) => {
      const categoryOk = category === 'all' || post.category === category;
      const haystack = `${post.title} ${post.summary} ${(post.tags || []).join(' ')}`.toLowerCase();
      return categoryOk && (!needle || haystack.includes(needle));
    });
  }, [posts, query, category]);

  return (
    <section className="studio-section">
      <div className="studio-wrap">
        <p className="studio-kicker">{strings.blogs.sectionTitle}</p>
        <div className="studio-section-head">
          <h1>Blog</h1>
          <p>{strings.blogs.sectionSubtitle}</p>
        </div>
        <div className="studio-filters">
          <button type="button" className="studio-btn studio-btn-line" aria-pressed={category === 'all'} onClick={() => setCategory('all')}>All</button>
          {BLOG_CATEGORY_METAS.map((item) => (
            <button key={item.slug} type="button" className="studio-btn studio-btn-line" aria-pressed={category === item.name} onClick={() => setCategory(item.name)}>
              {item.name}
            </button>
          ))}
        </div>
        <div className="studio-field" style={{ marginBottom: '1rem' }}>
          <label htmlFor="blog-search">Search articles</label>
          <input id="blog-search" value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search titles and summaries" />
        </div>
        {posts.length === 0 ? (
          <EmptyState title="Blog" body="No articles are published yet." />
        ) : visible.length === 0 ? (
          <EmptyState title="No matching articles" body="Try another category or a shorter search." />
        ) : (
          <div className="studio-grid">
            {visible.map((post) => (
              <a key={post.id} className="studio-card" href={`/blog/${post.slug}`} onClick={(event) => click(event, `/blog/${post.slug}`)}>
                <Media src={post.imageUrl} alt="" />
                <span className="studio-meta">{[post.category, post.date, post.readTime].filter(Boolean).join(' · ')}</span>
                <h2>{post.title}</h2>
                <p>{post.summary}</p>
                <span className="studio-linkish">{strings.blogs.readArticle}</span>
              </a>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}

export function JournalPost({ post, navigate }: { post: BlogPost | null; navigate: SiteNavigate }) {
  const click = usePlainClick(navigate);
  if (!post) {
    return (
      <section className="studio-section">
        <div className="studio-wrap">
          <EmptyState title="Article not published" body="That post is not on the public site." />
          <p><a href="/blog" onClick={(event) => click(event, '/blog')}>Back to the blog</a></p>
        </div>
      </section>
    );
  }
  const sections = post.sections && post.sections.length > 0 ? post.sections : null;
  return (
    <article className="studio-section">
      <div className="studio-wrap studio-prose">
        <p className="studio-kicker"><a href="/blog" onClick={(event) => click(event, '/blog')}>Blog</a></p>
        <h1>{post.title}</h1>
        <p className="studio-meta">{[post.author, post.date, post.readTime, post.category].filter(Boolean).join(' · ')}</p>
        <p className="studio-lede">{post.summary}</p>
        {post.imageUrl && <Media src={post.imageUrl} alt="" />}
        {sections
          ? sections.map((section) => (
            <section key={section.id}>
              {section.heading && <h2>{section.heading}</h2>}
              {section.paragraphs.map((paragraph) => <p key={paragraph}>{paragraph}</p>)}
              {section.imageUrl && <Media src={section.imageUrl} alt={section.imageCaption || ''} />}
              {section.imageCaption && <p className="studio-meta">{section.imageCaption}</p>}
            </section>
          ))
          : post.paragraphs.map((paragraph) => <p key={paragraph}>{paragraph}</p>)}
        {post.tags && post.tags.length > 0 && (
          <div className="studio-tags">{post.tags.map((tag) => <span key={tag}>{tag}</span>)}</div>
        )}
      </div>
    </article>
  );
}
