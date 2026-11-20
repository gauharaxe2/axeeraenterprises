import React from 'react';
import { BookOpen, ArrowRight, Images, Clock } from 'lucide-react';
import { BlogPost } from '../types';
import { useLanguage } from '../context/LanguageContext';
import { estimateReadingTime } from '../utils/blogUtils';

interface HomeBlogsPreviewProps {
  blogs: BlogPost[];
  onOpenBlogHub: () => void;
  onOpenArticle: (blog: BlogPost) => void;
}

export const HomeBlogsPreview: React.FC<HomeBlogsPreviewProps> = ({
  blogs,
  onOpenBlogHub,
  onOpenArticle
}) => {
  const { strings } = useLanguage();
  const featured = blogs.slice(0, 3);

  return (
    <section id="blogs" className="blogs">
      <div className="container">
        <div className="section-header">
          <h2>{strings.blogs.sectionTitle}</h2>
          <p>{strings.blogs.sectionSubtitle}</p>
        </div>

        <div className="services-grid">
          {featured.map((blog) => {
            const { minutes } = estimateReadingTime(blog);
            const photoCount =
              1 +
              (blog.images ? blog.images.length : 0) +
              (blog.sections ? blog.sections.filter((s) => s.imageUrl).length : 0);

            return (
              <div
                key={blog.id}
                className="blog-card"
                style={{ cursor: 'pointer' }}
                onClick={() => onOpenArticle(blog)}
              >
                <div style={{ position: 'relative' }}>
                  <img src={blog.imageUrl} alt={blog.title} />
                  {blog.category && (
                    <span
                      style={{
                        position: 'absolute',
                        top: '12px',
                        left: '12px',
                        background: 'rgba(10, 10, 10, 0.9)',
                        color: 'var(--primary-color)',
                        border: '1px solid rgba(212, 175, 55, 0.5)',
                        fontSize: '0.75rem',
                        fontWeight: 700,
                        padding: '4px 10px',
                        borderRadius: '9999px'
                      }}
                    >
                      {blog.category}
                    </span>
                  )}
                  {photoCount > 1 && (
                    <span
                      style={{
                        position: 'absolute',
                        bottom: '10px',
                        right: '10px',
                        background: 'rgba(0, 0, 0, 0.72)',
                        color: '#fff',
                        fontSize: '0.72rem',
                        fontWeight: 600,
                        padding: '3px 8px',
                        borderRadius: '6px',
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '4px'
                      }}
                    >
                      <Images size={12} /> {photoCount} {strings.blogs.photosLabel}
                    </span>
                  )}
                </div>

                <div className="blog-content">
                  <span
                    className="blog-date"
                    style={{ display: 'inline-flex', alignItems: 'center', gap: '8px' }}
                  >
                    <span>{blog.date || '2026 Insights'}</span>
                    <span>•</span>
                    <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                      <Clock size={13} /> {minutes} {strings.blogs.readTimeLabel}
                    </span>
                  </span>
                  <h3>{blog.title}</h3>
                  <p>{blog.summary}</p>
                  <button
                    type="button"
                    className="service-link"
                    onClick={(e) => {
                      e.stopPropagation();
                      onOpenArticle(blog);
                    }}
                  >
                    {strings.blogs.readArticle} <ArrowRight size={15} />
                  </button>
                </div>
              </div>
            );
          })}
        </div>

        <div style={{ textAlign: 'center', marginTop: '3rem' }}>
          <button
            type="button"
            onClick={onOpenBlogHub}
            className="btn btn-outline"
            style={{ display: 'inline-flex', alignItems: 'center', gap: '0.6rem' }}
          >
            <BookOpen size={18} /> {strings.blogs.exploreAll}
          </button>
        </div>
      </div>
    </section>
  );
};
