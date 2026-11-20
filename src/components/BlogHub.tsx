import React, { useState, useMemo } from 'react';
import { ArrowLeft, ArrowRight, Search, Clock, Calendar, User, Images, Sparkles, Tag, BookOpen, Layers } from 'lucide-react';
import { BlogPost, BLOG_CATEGORIES } from '../types';
import { BLOG_CATEGORY_METAS } from '../data/blogs';

interface BlogHubProps {
  blogs: BlogPost[];
  onBackToHome: () => void;
  onSelectArticle: (blog: BlogPost) => void;
}

export const BlogHub: React.FC<BlogHubProps> = ({ blogs, onBackToHome, onSelectArticle }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [activeTag, setActiveTag] = useState<string | null>(null);

  // Compute active category meta for dynamic heading and description
  const activeMeta = useMemo(() => {
    if (selectedCategory === 'All') {
      return {
        tagline: 'Agency Insights & Knowledge Hub',
        description: 'Architectural breakdowns, engineering blueprints, design systems, and conversion growth strategies published by Gauhar Axe and the Axe\'s Era Enterprises team.'
      };
    }
    const found = BLOG_CATEGORY_METAS.find((m) => m.name === selectedCategory);
    if (found) {
      return {
        tagline: found.tagline,
        description: found.description
      };
    }
    return {
      tagline: `${selectedCategory.replace(/^[^\w\s]+/, '').trim()} Insights`,
      description: 'Expert publications and actionable technical strategies engineered for high-converting, scalable digital growth.'
    };
  }, [selectedCategory]);

  // All 9 official categories
  const categoriesList = useMemo(() => {
    return ['All', ...BLOG_CATEGORIES];
  }, []);

  // Category counts mapping
  const categoryCounts = useMemo(() => {
    const counts: Record<string, number> = { All: blogs.length };
    BLOG_CATEGORIES.forEach((cat) => {
      counts[cat] = blogs.filter((b) => b.category === cat).length;
    });
    return counts;
  }, [blogs]);

  // Extract all unique tags
  const allTags = useMemo(() => {
    const tagSet = new Set<string>();
    blogs.forEach((b) => {
      if (b.tags && Array.isArray(b.tags)) {
        b.tags.forEach((t) => tagSet.add(t));
      }
    });
    return Array.from(tagSet).slice(0, 12);
  }, [blogs]);

  // Filtered blogs
  const filteredBlogs = useMemo(() => {
    return blogs.filter((blog) => {
      const q = searchQuery.toLowerCase().trim();
      const matchesSearch =
        !q ||
        blog.title.toLowerCase().includes(q) ||
        blog.summary.toLowerCase().includes(q) ||
        (blog.author && blog.author.toLowerCase().includes(q)) ||
        (blog.category && blog.category.toLowerCase().includes(q)) ||
        blog.paragraphs.some((p) => p.toLowerCase().includes(q)) ||
        (blog.tags && blog.tags.some((t) => t.toLowerCase().includes(q)));

      const matchesCategory =
        selectedCategory === 'All' || blog.category === selectedCategory;

      const matchesTag = !activeTag || (blog.tags && blog.tags.includes(activeTag));

      return matchesSearch && matchesCategory && matchesTag;
    });
  }, [blogs, searchQuery, selectedCategory, activeTag]);

  return (
    <div style={{ paddingTop: '70px', minHeight: '100vh', background: '#ffffff', color: '#0a0a0a' }}>
      {/* Blog Hub Hero */}
      <section
        className="dark-surface"
        style={{
          padding: '90px 20px 60px',
          background: 'radial-gradient(ellipse at top, rgba(212, 175, 55, 0.14) 0%, #0a0a0a 70%)',
          borderBottom: '1px solid rgba(212, 175, 55, 0.25)',
          color: '#ffffff',
          textAlign: 'center',
          position: 'relative'
        }}
      >
        <div className="container" style={{ maxWidth: '1080px', margin: '0 auto' }}>
          {/* Back to Agency Home Pill Button */}
          <div style={{ marginBottom: '2rem' }}>
            <button
              onClick={onBackToHome}
              style={{
                background: 'rgba(20, 20, 20, 0.9)',
                border: '1px solid rgba(212, 175, 55, 0.45)',
                color: 'var(--primary-color, #d4af37)',
                padding: '9px 22px',
                borderRadius: '9999px',
                cursor: 'pointer',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px',
                fontSize: '0.92rem',
                fontWeight: 600,
                boxShadow: '0 4px 14px rgba(0,0,0,0.4)',
                transition: 'all 0.25s ease'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.borderColor = 'var(--primary-color, #d4af37)';
                e.currentTarget.style.background = 'rgba(212, 175, 55, 0.14)';
                e.currentTarget.style.transform = 'translateY(-1px)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.borderColor = 'rgba(212, 175, 55, 0.45)';
                e.currentTarget.style.background = 'rgba(20, 20, 20, 0.9)';
                e.currentTarget.style.transform = 'translateY(0)';
              }}
            >
              <ArrowLeft size={16} /> Back to Agency Home
            </button>
          </div>

          {/* Main Title */}
          <h1
            style={{
              fontSize: 'clamp(2.4rem, 5vw, 3.8rem)',
              fontWeight: 800,
              lineHeight: 1.15,
              marginBottom: '1.25rem',
              color: '#ffffff',
              letterSpacing: '-0.02em',
              textShadow: '0 2px 20px rgba(0,0,0,0.5)'
            }}
          >
            {activeMeta.tagline}
          </h1>

          {/* Subtitle */}
          <p
            style={{
              fontSize: 'clamp(1.05rem, 2vw, 1.25rem)',
              color: '#d6d3d1',
              maxWidth: '820px',
              margin: '0 auto 2.5rem',
              lineHeight: 1.65,
              fontWeight: 400
            }}
          >
            {activeMeta.description}
          </p>

          {/* Centered Search Bar */}
          <div
            style={{
              maxWidth: '620px',
              margin: '0 auto 1.5rem',
              position: 'relative'
            }}
          >
            <div
              style={{
                position: 'absolute',
                left: '20px',
                top: '50%',
                transform: 'translateY(-50%)',
                color: 'var(--primary-color, #d4af37)',
                display: 'flex',
                alignItems: 'center',
                pointerEvents: 'none'
              }}
            >
              <Search size={20} />
            </div>
            <input
              type="text"
              placeholder="Search articles on development, architecture, security, design..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              style={{
                width: '100%',
                padding: '16px 20px 16px 54px',
                borderRadius: '9999px',
                border: '1px solid rgba(212, 175, 55, 0.35)',
                background: 'rgba(22, 22, 22, 0.94)',
                color: '#ffffff',
                fontSize: '1rem',
                outline: 'none',
                boxShadow: '0 8px 30px rgba(0, 0, 0, 0.45)',
                transition: 'all 0.2s ease'
              }}
              onFocus={(e) => {
                e.target.style.borderColor = 'var(--primary-color, #d4af37)';
                e.target.style.boxShadow = '0 0 0 3px rgba(212, 175, 55, 0.22)';
              }}
              onBlur={(e) => {
                e.target.style.borderColor = 'rgba(212, 175, 55, 0.35)';
                e.target.style.boxShadow = '0 8px 30px rgba(0, 0, 0, 0.45)';
              }}
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                style={{
                  position: 'absolute',
                  right: '18px',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  background: 'transparent',
                  border: 'none',
                  color: '#d6d3d1',
                  cursor: 'pointer',
                  fontSize: '0.9rem',
                  fontWeight: 600
                }}
              >
                Clear
              </button>
            )}
          </div>
        </div>
      </section>

      {/* 9 Categories Selector & Navigation */}
      <section
        style={{
          background: 'rgba(247, 245, 240, 0.95)',
          borderBottom: '1px solid var(--border-color)',
          padding: '24px 20px',
          position: 'sticky',
          top: '70px',
          zIndex: 30,
          backdropFilter: 'blur(12px)'
        }}
      >
        <div className="container" style={{ maxWidth: '1280px', margin: '0 auto' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
            <Layers size={16} color="var(--gold-ink)" />
            <span style={{ fontSize: '0.85rem', textTransform: 'uppercase', letterSpacing: '1px', color: '#44403c', fontWeight: 700 }}>
              Browse By Category (9 Official Pillars):
            </span>
          </div>

          <div
            style={{
              display: 'flex',
              gap: '10px',
              overflowX: 'auto',
              paddingBottom: '8px',
              scrollbarWidth: 'thin',
              alignItems: 'center'
            }}
          >
            {categoriesList.map((cat) => {
              const isSelected = selectedCategory === cat;
              const count = categoryCounts[cat] || 0;

              return (
                <button
                  key={cat}
                  onClick={() => {
                    setSelectedCategory(cat);
                    setActiveTag(null);
                  }}
                  style={{
                    padding: '8px 18px',
                    borderRadius: '9999px',
                    border: '1px solid',
                    borderColor: isSelected ? '#0a0a0a' : 'var(--border-color)',
                    background: isSelected
                      ? '#0a0a0a'
                      : '#ffffff',
                    color: isSelected ? '#d4af37' : '#292524',
                    fontWeight: isSelected ? 700 : 500,
                    fontSize: '0.88rem',
                    cursor: 'pointer',
                    whiteSpace: 'nowrap',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '8px',
                    transition: 'all 0.2s ease',
                    boxShadow: isSelected ? '0 4px 14px rgba(10, 10, 10, 0.16)' : 'none'
                  }}
                  onMouseEnter={(e) => {
                    if (!isSelected) {
                      e.currentTarget.style.borderColor = '#b8860b';
                      e.currentTarget.style.background = '#fdf8e6';
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (!isSelected) {
                      e.currentTarget.style.borderColor = 'var(--border-color)';
                      e.currentTarget.style.background = '#ffffff';
                    }
                  }}
                >
                  <span>{cat}</span>
                  <span
                    style={{
                      fontSize: '0.75rem',
                      padding: '2px 7px',
                      borderRadius: '10px',
                      background: isSelected ? 'rgba(212, 175, 55, 0.2)' : 'var(--bg-light)',
                      color: isSelected ? '#f5d061' : '#57534e',
                      fontWeight: 700
                    }}
                  >
                    {count}
                  </span>
                </button>
              );
            })}
          </div>

          {/* Quick Filter Tags (if available) */}
          {allTags.length > 0 && (
            <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', alignItems: 'center', marginTop: '12px', paddingTop: '10px', borderTop: '1px solid var(--border-color)' }}>
              <span style={{ fontSize: '0.78rem', color: '#57534e', display: 'flex', alignItems: 'center', gap: '4px', fontWeight: 600 }}>
                <Tag size={13} /> Trending Topics:
              </span>
              {allTags.map((tag) => (
                <button
                  key={tag}
                  onClick={() => setActiveTag(activeTag === tag ? null : tag)}
                  style={{
                    padding: '3px 10px',
                    borderRadius: '12px',
                    border: '1px solid',
                    borderColor: activeTag === tag ? '#0a0a0a' : 'var(--border-color)',
                    background: activeTag === tag ? '#0a0a0a' : '#ffffff',
                    color: activeTag === tag ? '#d4af37' : '#44403c',
                    fontSize: '0.75rem',
                    fontWeight: activeTag === tag ? 700 : 500,
                    cursor: 'pointer'
                  }}
                >
                  #{tag}
                </button>
              ))}
              {activeTag && (
                <button
                  onClick={() => setActiveTag(null)}
                  style={{
                    background: 'none',
                    border: 'none',
                    color: '#dc2626',
                    fontSize: '0.75rem',
                    fontWeight: 600,
                    cursor: 'pointer',
                    textDecoration: 'underline'
                  }}
                >
                  Reset tag
                </button>
              )}
            </div>
          )}
        </div>
      </section>

      {/* Main Blog Post Grid */}
      <section style={{ padding: '48px 20px 100px', background: '#ffffff' }}>
        <div className="container" style={{ maxWidth: '1280px', margin: '0 auto' }}>
          {/* Header Info & Result Count */}
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginBottom: '2rem',
              flexWrap: 'wrap',
              gap: '12px',
              paddingBottom: '1rem',
              borderBottom: '1px solid var(--border-color)'
            }}
          >
            <div>
              <span style={{ fontSize: '0.95rem', color: '#44403c' }}>
                Showing <strong style={{ color: '#0a0a0a' }}>{filteredBlogs.length}</strong> {filteredBlogs.length === 1 ? 'publication' : 'publications'}
                {selectedCategory !== 'All' && <span> in <strong style={{ color: 'var(--gold-ink)' }}>{selectedCategory}</strong></span>}
                {activeTag && <span> tagged with <strong style={{ color: 'var(--gold-ink)' }}>#{activeTag}</strong></span>}
              </span>
            </div>

            {/* Publication Badge */}
            <div
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px',
                background: '#fdf8e6',
                border: '1px solid rgba(184, 134, 11, 0.35)',
                padding: '4px 14px',
                borderRadius: '9999px',
                fontSize: '0.8rem',
                fontWeight: 600,
                color: 'var(--gold-ink)'
              }}
            >
              <Sparkles size={14} />
              <span>Verified Axe's Era Editorial Series</span>
            </div>
          </div>

          {/* Zero results state */}
          {filteredBlogs.length === 0 && (
            <div
              style={{
                textAlign: 'center',
                padding: '80px 20px',
                background: 'var(--bg-light)',
                borderRadius: '16px',
                border: '1px dashed #c8bfa8',
                margin: '2rem 0'
              }}
            >
              <BookOpen size={48} style={{ color: 'var(--gold-ink)', margin: '0 auto 1rem' }} />
              <h3 style={{ fontSize: '1.4rem', color: '#0a0a0a', marginBottom: '0.5rem' }}>No articles found</h3>
              <p style={{ color: '#44403c', maxWidth: '460px', margin: '0 auto 1.5rem' }}>
                We couldn't find any articles matching your search criteria. Try selecting another category or resetting the search filter.
              </p>
              <button
                onClick={() => {
                  setSearchQuery('');
                  setSelectedCategory('All');
                  setActiveTag(null);
                }}
                className="btn btn-primary"
                style={{ padding: '8px 24px', fontSize: '0.9rem' }}
              >
                Reset All Filters
              </button>
            </div>
          )}

          {/* High-Fidelity Responsive Blog Cards Grid */}
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(360px, 1fr))',
              gap: '30px'
            }}
          >
            {filteredBlogs.map((blog) => {
              const imageCount = blog.images && blog.images.length > 0 ? blog.images.length : 1;
              const hasMultipleImages = imageCount > 1;

              return (
                <article
                  key={blog.id}
                  style={{
                    background: '#ffffff',
                    border: '1px solid var(--border-color)',
                    borderRadius: '16px',
                    overflow: 'hidden',
                    display: 'flex',
                    flexDirection: 'column',
                    transition: 'all 0.3s ease',
                    boxShadow: 'var(--shadow-md)',
                    position: 'relative'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.borderColor = '#b8860b';
                    e.currentTarget.style.transform = 'translateY(-4px)';
                    e.currentTarget.style.boxShadow = 'var(--shadow-xl)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.borderColor = 'var(--border-color)';
                    e.currentTarget.style.transform = 'translateY(0)';
                    e.currentTarget.style.boxShadow = 'var(--shadow-md)';
                  }}
                >
                  {/* Card Image Container */}
                  <div
                    style={{
                      position: 'relative',
                      height: '220px',
                      width: '100%',
                      overflow: 'hidden',
                      cursor: 'pointer',
                      background: '#0a0a0a'
                    }}
                    onClick={() => onSelectArticle(blog)}
                  >
                    <img
                      src={blog.imageUrl}
                      alt={blog.title}
                      style={{
                        width: '100%',
                        height: '100%',
                        objectFit: 'cover',
                        transition: 'transform 0.5s ease'
                      }}
                      onMouseEnter={(e) => (e.currentTarget.style.transform = 'scale(1.05)')}
                      onMouseLeave={(e) => (e.currentTarget.style.transform = 'scale(1.0)')}
                    />

                    {/* Category Overlay Tag */}
                    <div
                      style={{
                        position: 'absolute',
                        top: '14px',
                        left: '14px',
                        background: 'rgba(10, 10, 10, 0.88)',
                        backdropFilter: 'blur(8px)',
                        border: '1px solid rgba(212, 175, 55, 0.45)',
                        color: '#f5d061',
                        padding: '4px 12px',
                        borderRadius: '9999px',
                        fontSize: '0.78rem',
                        fontWeight: 700,
                        letterSpacing: '0.3px',
                        boxShadow: '0 4px 10px rgba(0, 0, 0, 0.35)'
                      }}
                    >
                      {blog.category || '🌐 Web Development'}
                    </div>

                    {/* Multi-Image Badge if article has multiple images */}
                    {hasMultipleImages && (
                      <div
                        style={{
                          position: 'absolute',
                          top: '14px',
                          right: '14px',
                          background: 'rgba(10, 10, 10, 0.9)',
                          backdropFilter: 'blur(8px)',
                          border: '1px solid rgba(212, 175, 55, 0.4)',
                          color: '#ffffff',
                          padding: '4px 10px',
                          borderRadius: '9999px',
                          fontSize: '0.75rem',
                          fontWeight: 600,
                          display: 'flex',
                          alignItems: 'center',
                          gap: '5px',
                          boxShadow: '0 4px 10px rgba(0,0,0,0.4)'
                        }}
                        title={`${imageCount} images included in this article`}
                      >
                        <Images size={13} color="var(--primary-color, #d4af37)" />
                        <span>{imageCount} Photos</span>
                      </div>
                    )}
                  </div>

                  {/* Card Content Area */}
                  <div
                    style={{
                      padding: '1.5rem',
                      display: 'flex',
                      flexDirection: 'column',
                      flex: 1,
                      justifyContent: 'space-between'
                    }}
                  >
                    <div>
                      {/* Meta Date & Read Time */}
                      <div
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '12px',
                          fontSize: '0.8rem',
                          color: '#57534e',
                          marginBottom: '0.75rem',
                          flexWrap: 'wrap'
                        }}
                      >
                        <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                          <Clock size={13} color="var(--gold-ink)" />
                          {blog.readTime || '5 min read'}
                        </span>
                        <span>•</span>
                        <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                          <Calendar size={13} color="#57534e" />
                          {blog.date || '2026 Insights'}
                        </span>
                        {blog.author && (
                          <>
                            <span>•</span>
                            <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                              <User size={13} color="#57534e" />
                              {blog.author}
                            </span>
                          </>
                        )}
                      </div>

                      {/* Title */}
                      <h3
                        onClick={() => onSelectArticle(blog)}
                        style={{
                          fontSize: '1.25rem',
                          fontWeight: 700,
                          color: '#0a0a0a',
                          marginBottom: '0.75rem',
                          lineHeight: 1.35,
                          cursor: 'pointer',
                          transition: 'color 0.2s ease'
                        }}
                        onMouseEnter={(e) => (e.currentTarget.style.color = 'var(--gold-ink)')}
                        onMouseLeave={(e) => (e.currentTarget.style.color = '#0a0a0a')}
                      >
                        {blog.title}
                      </h3>

                      {/* Summary */}
                      <p
                        style={{
                          fontSize: '0.92rem',
                          color: '#44403c',
                          lineHeight: 1.6,
                          marginBottom: '1.25rem',
                          display: '-webkit-box',
                          WebkitLineClamp: 3,
                          WebkitBoxOrient: 'vertical',
                          overflow: 'hidden'
                        }}
                      >
                        {blog.summary}
                      </p>

                      {/* Tags */}
                      {blog.tags && blog.tags.length > 0 && (
                        <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap', marginBottom: '1.25rem' }}>
                          {blog.tags.map((t, idx) => (
                            <span
                              key={idx}
                              style={{
                                fontSize: '0.72rem',
                                color: '#292524',
                                background: 'var(--bg-light)',
                                padding: '2px 8px',
                                borderRadius: '4px',
                                border: '1px solid var(--border-color)'
                              }}
                            >
                              #{t}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>

                    {/* Bottom Action */}
                    <div
                      style={{
                        paddingTop: '1rem',
                        borderTop: '1px solid var(--border-color)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between'
                      }}
                    >
                      <button
                        onClick={() => onSelectArticle(blog)}
                        style={{
                          background: 'transparent',
                          border: 'none',
                          color: 'var(--gold-ink)',
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '6px',
                          fontSize: '0.9rem',
                          fontWeight: 700,
                          cursor: 'pointer',
                          padding: 0,
                          transition: 'gap 0.2s ease'
                        }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.gap = '10px';
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.gap = '6px';
                        }}
                      >
                        Read Full Article <ArrowRight size={15} />
                      </button>

                      {hasMultipleImages && (
                        <span
                          style={{
                            fontSize: '0.75rem',
                            color: '#57534e'
                          }}
                        >
                          Includes gallery
                        </span>
                      )}
                    </div>
                  </div>
                </article>
              );
            })}
          </div>
        </div>
      </section>
    </div>
  );
};
