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
        description: 'Architectural breakdowns, engineering blueprints, design systems, and conversion growth strategies published by Gauhar Axe and the Axe\'s Era Enterprise team.'
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
    <div style={{ paddingTop: '70px', minHeight: '100vh', background: 'var(--bg-primary, #0b1120)', color: '#f8fafc' }}>
      {/* Blog Hub Hero - Matches image_cae85f6a.png closely */}
      <section
        style={{
          padding: '90px 20px 60px',
          background: 'radial-gradient(ellipse at top, rgba(30, 41, 59, 0.7) 0%, rgba(11, 17, 32, 1) 75%)',
          borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
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
                background: 'rgba(15, 23, 42, 0.85)',
                border: '1px solid rgba(212, 175, 55, 0.4)',
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
                e.currentTarget.style.background = 'rgba(212, 175, 55, 0.12)';
                e.currentTarget.style.transform = 'translateY(-1px)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.borderColor = 'rgba(212, 175, 55, 0.4)';
                e.currentTarget.style.background = 'rgba(15, 23, 42, 0.85)';
                e.currentTarget.style.transform = 'translateY(0)';
              }}
            >
              <ArrowLeft size={16} /> Back to Agency Home
            </button>
          </div>

          {/* Main Title - Matches "Web Development Insights" typography */}
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
              color: '#94a3b8',
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
                border: '1px solid rgba(255, 255, 255, 0.15)',
                background: 'rgba(19, 27, 46, 0.9)',
                color: '#ffffff',
                fontSize: '1rem',
                outline: 'none',
                boxShadow: '0 8px 30px rgba(0, 0, 0, 0.4)',
                transition: 'all 0.2s ease'
              }}
              onFocus={(e) => {
                e.target.style.borderColor = 'var(--primary-color, #d4af37)';
                e.target.style.boxShadow = '0 0 0 3px rgba(212, 175, 55, 0.2)';
              }}
              onBlur={(e) => {
                e.target.style.borderColor = 'rgba(255, 255, 255, 0.15)';
                e.target.style.boxShadow = '0 8px 30px rgba(0, 0, 0, 0.4)';
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
                  color: '#94a3b8',
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
          background: 'rgba(15, 23, 42, 0.75)',
          borderBottom: '1px solid rgba(255, 255, 255, 0.05)',
          padding: '24px 20px',
          position: 'sticky',
          top: '70px',
          zIndex: 30,
          backdropFilter: 'blur(12px)'
        }}
      >
        <div className="container" style={{ maxWidth: '1280px', margin: '0 auto' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
            <Layers size={16} color="var(--primary-color, #d4af37)" />
            <span style={{ fontSize: '0.85rem', textTransform: 'uppercase', letterSpacing: '1px', color: '#94a3b8', fontWeight: 600 }}>
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
                    borderColor: isSelected ? 'var(--primary-color, #d4af37)' : 'rgba(255, 255, 255, 0.12)',
                    background: isSelected
                      ? 'linear-gradient(135deg, #d4af37 0%, #b8860b 100%)'
                      : 'rgba(30, 41, 59, 0.6)',
                    color: isSelected ? '#0b1120' : '#e2e8f0',
                    fontWeight: isSelected ? 700 : 500,
                    fontSize: '0.88rem',
                    cursor: 'pointer',
                    whiteSpace: 'nowrap',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '8px',
                    transition: 'all 0.2s ease',
                    boxShadow: isSelected ? '0 4px 15px rgba(212, 175, 55, 0.3)' : 'none'
                  }}
                  onMouseEnter={(e) => {
                    if (!isSelected) {
                      e.currentTarget.style.borderColor = 'rgba(212, 175, 55, 0.5)';
                      e.currentTarget.style.background = 'rgba(30, 41, 59, 0.9)';
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (!isSelected) {
                      e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.12)';
                      e.currentTarget.style.background = 'rgba(30, 41, 59, 0.6)';
                    }
                  }}
                >
                  <span>{cat}</span>
                  <span
                    style={{
                      fontSize: '0.75rem',
                      padding: '2px 7px',
                      borderRadius: '10px',
                      background: isSelected ? 'rgba(0, 0, 0, 0.2)' : 'rgba(255, 255, 255, 0.1)',
                      color: isSelected ? '#0b1120' : '#94a3b8',
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
            <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', alignItems: 'center', marginTop: '12px', paddingTop: '10px', borderTop: '1px solid rgba(255,255,255,0.05)' }}>
              <span style={{ fontSize: '0.78rem', color: '#64748b', display: 'flex', alignItems: 'center', gap: '4px' }}>
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
                    borderColor: activeTag === tag ? 'var(--primary-color, #d4af37)' : 'rgba(255, 255, 255, 0.08)',
                    background: activeTag === tag ? 'rgba(212, 175, 55, 0.2)' : 'transparent',
                    color: activeTag === tag ? 'var(--primary-color, #d4af37)' : '#94a3b8',
                    fontSize: '0.75rem',
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
                    color: '#f87171',
                    fontSize: '0.75rem',
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
      <section style={{ padding: '48px 20px 100px' }}>
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
              borderBottom: '1px solid rgba(255, 255, 255, 0.06)'
            }}
          >
            <div>
              <span style={{ fontSize: '0.95rem', color: '#94a3b8' }}>
                Showing <strong style={{ color: '#ffffff' }}>{filteredBlogs.length}</strong> {filteredBlogs.length === 1 ? 'publication' : 'publications'}
                {selectedCategory !== 'All' && <span> in <strong style={{ color: 'var(--primary-color, #d4af37)' }}>{selectedCategory}</strong></span>}
                {activeTag && <span> tagged with <strong style={{ color: 'var(--primary-color, #d4af37)' }}>#{activeTag}</strong></span>}
              </span>
            </div>

            {/* AdSense / Publication Badge */}
            <div
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px',
                background: 'rgba(212, 175, 55, 0.08)',
                border: '1px solid rgba(212, 175, 55, 0.25)',
                padding: '4px 14px',
                borderRadius: '9999px',
                fontSize: '0.8rem',
                color: 'var(--primary-color, #d4af37)'
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
                background: 'rgba(15, 23, 42, 0.5)',
                borderRadius: '16px',
                border: '1px dashed rgba(255, 255, 255, 0.15)',
                margin: '2rem 0'
              }}
            >
              <BookOpen size={48} style={{ color: '#64748b', margin: '0 auto 1rem' }} />
              <h3 style={{ fontSize: '1.4rem', color: '#ffffff', marginBottom: '0.5rem' }}>No articles found</h3>
              <p style={{ color: '#94a3b8', maxWidth: '460px', margin: '0 auto 1.5rem' }}>
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
                    background: 'rgba(19, 27, 46, 0.75)',
                    border: '1px solid rgba(255, 255, 255, 0.08)',
                    borderRadius: '16px',
                    overflow: 'hidden',
                    display: 'flex',
                    flexDirection: 'column',
                    transition: 'all 0.3s ease',
                    boxShadow: '0 10px 25px rgba(0, 0, 0, 0.35)',
                    position: 'relative'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.borderColor = 'rgba(212, 175, 55, 0.4)';
                    e.currentTarget.style.transform = 'translateY(-4px)';
                    e.currentTarget.style.boxShadow = '0 16px 36px rgba(0, 0, 0, 0.5), 0 0 20px rgba(212, 175, 55, 0.15)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.08)';
                    e.currentTarget.style.transform = 'translateY(0)';
                    e.currentTarget.style.boxShadow = '0 10px 25px rgba(0, 0, 0, 0.35)';
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
                      background: '#0f172a'
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
                        background: 'rgba(11, 17, 32, 0.85)',
                        backdropFilter: 'blur(8px)',
                        border: '1px solid rgba(212, 175, 55, 0.35)',
                        color: 'var(--primary-color, #d4af37)',
                        padding: '4px 12px',
                        borderRadius: '9999px',
                        fontSize: '0.78rem',
                        fontWeight: 700,
                        letterSpacing: '0.3px',
                        boxShadow: '0 4px 10px rgba(0, 0, 0, 0.4)'
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
                          background: 'rgba(15, 23, 42, 0.9)',
                          backdropFilter: 'blur(8px)',
                          border: '1px solid rgba(255, 255, 255, 0.2)',
                          color: '#ffffff',
                          padding: '4px 10px',
                          borderRadius: '9999px',
                          fontSize: '0.75rem',
                          fontWeight: 600,
                          display: 'flex',
                          alignItems: 'center',
                          gap: '5px',
                          boxShadow: '0 4px 10px rgba(0,0,0,0.5)'
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
                          color: '#94a3b8',
                          marginBottom: '0.75rem',
                          flexWrap: 'wrap'
                        }}
                      >
                        <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                          <Clock size={13} color="var(--primary-color, #d4af37)" />
                          {blog.readTime || '5 min read'}
                        </span>
                        <span>•</span>
                        <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                          <Calendar size={13} color="#94a3b8" />
                          {blog.date || '2026 Insights'}
                        </span>
                        {blog.author && (
                          <>
                            <span>•</span>
                            <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                              <User size={13} color="#94a3b8" />
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
                          color: '#ffffff',
                          marginBottom: '0.75rem',
                          lineHeight: 1.35,
                          cursor: 'pointer',
                          transition: 'color 0.2s ease'
                        }}
                        onMouseEnter={(e) => (e.currentTarget.style.color = 'var(--primary-color, #d4af37)')}
                        onMouseLeave={(e) => (e.currentTarget.style.color = '#ffffff')}
                      >
                        {blog.title}
                      </h3>

                      {/* Summary */}
                      <p
                        style={{
                          fontSize: '0.92rem',
                          color: '#94a3b8',
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
                                color: '#cbd5e1',
                                background: 'rgba(255, 255, 255, 0.05)',
                                padding: '2px 8px',
                                borderRadius: '4px',
                                border: '1px solid rgba(255, 255, 255, 0.06)'
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
                        borderTop: '1px solid rgba(255, 255, 255, 0.06)',
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
                          color: 'var(--primary-color, #d4af37)',
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
                            color: '#64748b'
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
