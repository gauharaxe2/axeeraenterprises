import React from 'react';
import { BookOpen, ArrowRight } from 'lucide-react';
import { BlogPost } from '../types';

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
  const featured = blogs.slice(0, 3);

  return (
    <section id="blogs" className="blogs">
      <div className="container">
        <div className="section-header">
          <h2>Our Blogs</h2>
          <p>
            The ultimate guide to web development, business websites, and digital growth in 2026.
          </p>
        </div>

        <div className="services-grid" style={{ marginBottom: '2.5rem' }}>
          {featured.map((blog) => (
            <div
              key={blog.id}
              className="blog-card"
              onClick={() => onOpenArticle(blog)}
              style={{ cursor: 'pointer' }}
            >
              <div style={{ position: 'relative' }}>
                <img src={blog.imageUrl} alt={blog.title} />
                <span
                  style={{
                    position: 'absolute',
                    top: '10px',
                    left: '10px',
                    background: 'rgba(11, 17, 32, 0.85)',
                    border: '1px solid rgba(212, 175, 55, 0.3)',
                    color: 'var(--primary-color, #d4af37)',
                    padding: '3px 10px',
                    borderRadius: '9999px',
                    fontSize: '0.75rem',
                    fontWeight: 700
                  }}
                >
                  {blog.category || '🌐 Web Development'}
                </span>
                {blog.images && blog.images.length > 1 && (
                  <span
                    style={{
                      position: 'absolute',
                      top: '10px',
                      right: '10px',
                      background: 'rgba(15, 23, 42, 0.85)',
                      border: '1px solid rgba(255, 255, 255, 0.2)',
                      color: '#ffffff',
                      padding: '3px 8px',
                      borderRadius: '9999px',
                      fontSize: '0.72rem',
                      fontWeight: 600
                    }}
                  >
                    📷 {blog.images.length} Photos
                  </span>
                )}
              </div>
              <div className="blog-content">
                <span className="blog-date">{blog.date || '2026 Insights'} • {blog.readTime || '5 min read'}</span>
                <h3>{blog.title}</h3>
                <p>{blog.summary}</p>
                <div style={{ marginTop: 'auto' }}>
                  <button
                    className="service-link"
                    onClick={(e) => {
                      e.stopPropagation();
                      onOpenArticle(blog);
                    }}
                  >
                    Read Article <ArrowRight size={16} />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div style={{ textAlign: 'center' }}>
          <button
            onClick={onOpenBlogHub}
            className="btn btn-outline"
            style={{ padding: '14px 36px', fontSize: '1.05rem' }}
          >
            <BookOpen size={18} style={{ marginRight: '8px' }} />
            Explore All {blogs.length} Articles Across 9 Categories
          </button>
        </div>
      </div>
    </section>
  );
};
