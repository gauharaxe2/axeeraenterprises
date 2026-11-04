import React, { useState } from 'react';
import {
  ArrowLeft,
  Calendar,
  Clock,
  User,
  Share2,
  Check,
  Copy,
  ChevronLeft,
  ChevronRight,
  Maximize2,
  X,
  Shield,
  Code2,
  Database,
  Server,
  Layers,
  Images
} from 'lucide-react';
import { BlogPost } from '../types';

interface BlogArticleDetailProps {
  blog: BlogPost;
  onBackToBlogs: () => void;
  onContactClick: () => void;
}

export const BlogArticleDetail: React.FC<BlogArticleDetailProps> = ({
  blog,
  onBackToBlogs,
  onContactClick
}) => {
  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);

  // Combine primary cover image, section images, and additional gallery images without duplicates
  const allImages = React.useMemo(() => {
    const list: string[] = [];
    if (blog.imageUrl && !list.includes(blog.imageUrl)) list.push(blog.imageUrl);
    if (blog.sections && Array.isArray(blog.sections)) {
      blog.sections.forEach((sec) => {
        if (sec.imageUrl && !list.includes(sec.imageUrl)) {
          list.push(sec.imageUrl);
        }
      });
    }
    if (blog.images && Array.isArray(blog.images)) {
      blog.images.forEach((img) => {
        if (img && !list.includes(img)) {
          list.push(img);
        }
      });
    }
    return list;
  }, [blog.imageUrl, blog.sections, blog.images]);

  const handleCopyLink = () => {
    try {
      navigator.clipboard.writeText(window.location.href);
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 2500);
    } catch {
      // Ignore
    }
  };

  const handleShareWhatsApp = () => {
    const text = encodeURIComponent(`Check out this insightful article "${blog.title}" by Axe's Era Enterprise:\n${window.location.href}`);
    window.open(`https://api.whatsapp.com/send?text=${text}`, '_blank');
  };

  const isWhatIsWebDev = blog.slug === 'what-is-web-development';

  return (
    <div style={{ paddingTop: '70px', minHeight: '100vh', background: 'var(--bg-primary, #0b1120)', color: '#f8fafc' }}>
      {/* Article Header Hero */}
      <section
        style={{
          padding: '80px 20px 50px',
          background: 'radial-gradient(ellipse at top, rgba(30, 41, 59, 0.7) 0%, rgba(11, 17, 32, 1) 80%)',
          borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
          textAlign: 'center'
        }}
      >
        <div className="container" style={{ maxWidth: '960px', margin: '0 auto' }}>
          {/* Back Pill Button */}
          <div style={{ marginBottom: '1.5rem' }}>
            <button
              onClick={onBackToBlogs}
              style={{
                background: 'rgba(15, 23, 42, 0.85)',
                border: '1px solid rgba(212, 175, 55, 0.4)',
                color: 'var(--primary-color, #d4af37)',
                padding: '8px 20px',
                borderRadius: '9999px',
                cursor: 'pointer',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px',
                fontSize: '0.9rem',
                fontWeight: 600,
                transition: 'all 0.2s ease'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.borderColor = 'var(--primary-color, #d4af37)';
                e.currentTarget.style.background = 'rgba(212, 175, 55, 0.12)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.borderColor = 'rgba(212, 175, 55, 0.4)';
                e.currentTarget.style.background = 'rgba(15, 23, 42, 0.85)';
              }}
            >
              <ArrowLeft size={16} /> Back to All Articles
            </button>
          </div>

          {/* Category Badge */}
          <div style={{ marginBottom: '1rem' }}>
            <span
              style={{
                background: 'rgba(212, 175, 55, 0.15)',
                color: 'var(--primary-color, #d4af37)',
                border: '1px solid rgba(212, 175, 55, 0.35)',
                padding: '5px 16px',
                borderRadius: '9999px',
                fontSize: '0.85rem',
                fontWeight: 700,
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px'
              }}
            >
              <Layers size={14} />
              {blog.category || '🌐 Web Development'}
            </span>
          </div>

          {/* Main Title */}
          <h1
            style={{
              fontSize: 'clamp(2.2rem, 4.5vw, 3.4rem)',
              fontWeight: 800,
              lineHeight: 1.2,
              marginBottom: '1.25rem',
              color: '#ffffff',
              letterSpacing: '-0.02em'
            }}
          >
            {blog.title}
          </h1>

          {/* Meta Details: Author, Date, Read Time */}
          <div
            style={{
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
              gap: '16px',
              fontSize: '0.88rem',
              color: '#94a3b8',
              flexWrap: 'wrap',
              marginBottom: '1.5rem'
            }}
          >
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', color: '#e2e8f0' }}>
              <User size={15} color="var(--primary-color, #d4af37)" />
              {blog.author || 'Gauhar Axe'}
            </span>
            <span>•</span>
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
              <Calendar size={15} />
              {blog.date || '2026 Insights'}
            </span>
            <span>•</span>
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
              <Clock size={15} color="var(--primary-color, #d4af37)" />
              {blog.readTime || '5 min read'}
            </span>
            {allImages.length > 1 && (
              <>
                <span>•</span>
                <span style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', color: 'var(--primary-color, #d4af37)' }}>
                  <Images size={15} />
                  {allImages.length} Images in Article
                </span>
              </>
            )}
          </div>

          {/* Excerpt / Summary */}
          <p
            style={{
              fontSize: 'clamp(1.05rem, 1.8vw, 1.25rem)',
              color: '#cbd5e1',
              maxWidth: '820px',
              margin: '0 auto 1.5rem',
              lineHeight: 1.6,
              fontStyle: 'italic'
            }}
          >
            "{blog.summary}"
          </p>

          {/* Share Buttons */}
          <div style={{ display: 'flex', justifyContent: 'center', gap: '10px', flexWrap: 'wrap' }}>
            <button
              onClick={handleCopyLink}
              style={{
                background: 'rgba(30, 41, 59, 0.8)',
                border: '1px solid rgba(255, 255, 255, 0.15)',
                color: copiedLink ? '#4ade80' : '#ffffff',
                padding: '6px 14px',
                borderRadius: '8px',
                fontSize: '0.82rem',
                cursor: 'pointer',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
                transition: 'all 0.2s'
              }}
            >
              {copiedLink ? <Check size={14} /> : <Copy size={14} />}
              {copiedLink ? 'Link Copied!' : 'Copy Article Link'}
            </button>
            <button
              onClick={handleShareWhatsApp}
              style={{
                background: 'rgba(37, 211, 102, 0.15)',
                border: '1px solid rgba(37, 211, 102, 0.4)',
                color: '#25d366',
                padding: '6px 14px',
                borderRadius: '8px',
                fontSize: '0.82rem',
                cursor: 'pointer',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px'
              }}
            >
              <Share2 size={14} /> Share on WhatsApp
            </button>
          </div>
        </div>
      </section>

      {/* Main Article Content */}
      <section style={{ padding: '60px 20px 100px' }}>
        <div className="container" style={{ maxWidth: '960px', margin: '0 auto' }}>
          <div
            style={{
              background: 'rgba(19, 27, 46, 0.8)',
              border: '1px solid rgba(255, 255, 255, 0.08)',
              borderRadius: '20px',
              padding: 'clamp(1.5rem, 4vw, 3.5rem)',
              boxShadow: '0 20px 40px rgba(0, 0, 0, 0.4)'
            }}
          >
            {/* Primary Cover Image with Zoom Lightbox Trigger */}
            <div style={{ position: 'relative', borderRadius: '14px', overflow: 'hidden', marginBottom: '2.5rem', background: '#0f172a' }}>
              <img
                src={allImages[activeImageIndex] || blog.imageUrl}
                alt={blog.title}
                style={{
                  width: '100%',
                  maxHeight: '480px',
                  objectFit: 'cover',
                  display: 'block',
                  cursor: 'pointer'
                }}
                onClick={() => setLightboxOpen(true)}
              />
              <button
                onClick={() => setLightboxOpen(true)}
                style={{
                  position: 'absolute',
                  bottom: '16px',
                  right: '16px',
                  background: 'rgba(15, 23, 42, 0.85)',
                  border: '1px solid rgba(255, 255, 255, 0.2)',
                  color: '#ffffff',
                  padding: '6px 12px',
                  borderRadius: '6px',
                  fontSize: '0.75rem',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  cursor: 'pointer'
                }}
              >
                <Maximize2 size={13} /> View Full Photo ({activeImageIndex + 1}/{allImages.length})
              </button>
            </div>

            {/* Multiple Images Interactive Photo Gallery Showcase */}
            {allImages.length > 1 && (
              <div
                style={{
                  background: 'rgba(15, 23, 42, 0.7)',
                  border: '1px solid rgba(212, 175, 55, 0.25)',
                  borderRadius: '14px',
                  padding: '1.25rem',
                  marginBottom: '2.5rem'
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <Images size={18} color="var(--primary-color, #d4af37)" />
                    <h4 style={{ margin: 0, fontSize: '0.95rem', color: '#ffffff' }}>
                      Article Image Gallery ({allImages.length} Visual Assets)
                    </h4>
                  </div>
                  <span style={{ fontSize: '0.8rem', color: '#94a3b8' }}>
                    Click thumbnail to swap main preview
                  </span>
                </div>

                <div
                  style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fill, minmax(130px, 1fr))',
                    gap: '10px'
                  }}
                >
                  {allImages.map((imgUrl, idx) => {
                    const isCurrent = activeImageIndex === idx;
                    return (
                      <div
                        key={idx}
                        onClick={() => setActiveImageIndex(idx)}
                        style={{
                          height: '90px',
                          borderRadius: '8px',
                          overflow: 'hidden',
                          cursor: 'pointer',
                          border: isCurrent ? '2px solid var(--primary-color, #d4af37)' : '1px solid rgba(255, 255, 255, 0.1)',
                          position: 'relative',
                          transition: 'all 0.2s ease',
                          opacity: isCurrent ? 1 : 0.75
                        }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.opacity = '1';
                          e.currentTarget.style.transform = 'scale(1.02)';
                        }}
                        onMouseLeave={(e) => {
                          if (!isCurrent) e.currentTarget.style.opacity = '0.75';
                          e.currentTarget.style.transform = 'scale(1.0)';
                        }}
                      >
                        <img
                          src={imgUrl}
                          alt={`${blog.title} visual ${idx + 1}`}
                          style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                        />
                        <div
                          style={{
                            position: 'absolute',
                            bottom: '4px',
                            right: '4px',
                            background: 'rgba(0,0,0,0.7)',
                            color: '#fff',
                            fontSize: '0.65rem',
                            padding: '1px 5px',
                            borderRadius: '4px'
                          }}
                        >
                          #{idx + 1}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Structured Article Sections: Multiple Headings, Paragraphs & Section Images */}
            {blog.sections && blog.sections.length > 0 ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '2.5rem', marginBottom: '2.5rem' }}>
                {blog.sections.map((section, sIdx) => (
                  <article
                    key={section.id || sIdx}
                    style={{
                      background: 'rgba(15, 23, 42, 0.5)',
                      border: '1px solid rgba(255, 255, 255, 0.07)',
                      borderRadius: '16px',
                      padding: 'clamp(1.25rem, 3vw, 2.25rem)',
                      position: 'relative'
                    }}
                  >
                    {/* Heading / Subtitle */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '1.25rem' }}>
                      <span
                        style={{
                          width: '4px',
                          height: '24px',
                          background: 'linear-gradient(to bottom, var(--primary-color, #d4af37), #f59e0b)',
                          borderRadius: '2px',
                          display: 'inline-block'
                        }}
                      />
                      <h2
                        style={{
                          color: '#ffffff',
                          fontSize: 'clamp(1.25rem, 2.2vw, 1.65rem)',
                          fontWeight: 700,
                          margin: 0,
                          lineHeight: 1.3
                        }}
                      >
                        {section.heading}
                      </h2>
                    </div>

                    {/* Section Image Option (if provided) */}
                    {section.imageUrl && (
                      <figure
                        style={{
                          margin: '0 0 1.5rem',
                          borderRadius: '12px',
                          overflow: 'hidden',
                          background: '#0b1120',
                          border: '1px solid rgba(212, 175, 55, 0.25)'
                        }}
                      >
                        <div
                          style={{ position: 'relative', cursor: 'pointer' }}
                          onClick={() => {
                            const imgIdx = allImages.indexOf(section.imageUrl!);
                            if (imgIdx !== -1) setActiveImageIndex(imgIdx);
                            setLightboxOpen(true);
                          }}
                        >
                          <img
                            src={section.imageUrl}
                            alt={section.imageCaption || section.heading}
                            style={{
                              width: '100%',
                              maxHeight: '420px',
                              objectFit: 'cover',
                              display: 'block'
                            }}
                          />
                          <div
                            style={{
                              position: 'absolute',
                              bottom: '10px',
                              right: '10px',
                              background: 'rgba(15, 23, 42, 0.85)',
                              border: '1px solid rgba(255, 255, 255, 0.2)',
                              color: '#fff',
                              padding: '5px 10px',
                              borderRadius: '6px',
                              fontSize: '0.74rem',
                              display: 'flex',
                              alignItems: 'center',
                              gap: '5px'
                            }}
                          >
                            <Maximize2 size={12} /> Click to Enlarge
                          </div>
                        </div>
                        {section.imageCaption && (
                          <figcaption
                            style={{
                              padding: '8px 14px',
                              fontSize: '0.82rem',
                              color: '#94a3b8',
                              background: 'rgba(15, 23, 42, 0.95)',
                              borderTop: '1px solid rgba(255, 255, 255, 0.05)',
                              fontStyle: 'italic',
                              display: 'flex',
                              alignItems: 'center',
                              gap: '6px'
                            }}
                          >
                            <span style={{ color: 'var(--primary-color, #d4af37)' }}>📷</span>
                            {section.imageCaption}
                          </figcaption>
                        )}
                      </figure>
                    )}

                    {/* Section Paragraphs */}
                    <div style={{ color: '#cbd5e1', fontSize: '1.08rem', lineHeight: 1.85 }}>
                      {section.paragraphs.map((para, pIdx) => (
                        <p key={pIdx} style={{ marginBottom: pIdx === section.paragraphs.length - 1 ? 0 : '1.25rem' }}>
                          {para}
                        </p>
                      ))}
                    </div>
                  </article>
                ))}
              </div>
            ) : (
              /* Fallback for legacy paragraphs */
              <div style={{ color: '#cbd5e1', fontSize: '1.12rem', lineHeight: 1.85, marginBottom: '2.5rem' }}>
                {blog.paragraphs.map((para, idx) => (
                  <p key={idx} style={{ marginBottom: '1.5rem' }}>
                    {para}
                  </p>
                ))}
              </div>
            )}

            {/* Special Technical Breakdown (for "What is Web Development?") */}
            {isWhatIsWebDev && (
              <div style={{ marginTop: '2rem', paddingTop: '2rem', borderTop: '1px solid rgba(255, 255, 255, 0.08)' }}>
                <h2 style={{ color: '#fff', fontSize: '1.85rem', borderBottom: '2px solid var(--primary-color, #d4af37)', paddingBottom: '0.75rem', marginBottom: '2rem' }}>
                  Core Web Development Pillars In 2026
                </h2>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '20px', marginBottom: '2.5rem' }}>
                  <div style={{ background: 'rgba(15, 23, 42, 0.6)', padding: '1.5rem', borderRadius: '12px', border: '1px solid rgba(255, 255, 255, 0.06)' }}>
                    <h3 style={{ color: 'var(--primary-color, #d4af37)', display: 'flex', alignItems: 'center', gap: '8px', fontSize: '1.15rem', marginBottom: '0.75rem' }}>
                      <Code2 size={20} /> Frontend Engineering
                    </h3>
                    <p style={{ color: '#94a3b8', fontSize: '0.92rem', lineHeight: 1.6 }}>
                      Building high-performance user interfaces with React, Next.js, and TypeScript. Ensures fluid touch responsiveness and sub-second rendering.
                    </p>
                  </div>

                  <div style={{ background: 'rgba(15, 23, 42, 0.6)', padding: '1.5rem', borderRadius: '12px', border: '1px solid rgba(255, 255, 255, 0.06)' }}>
                    <h3 style={{ color: 'var(--primary-color, #d4af37)', display: 'flex', alignItems: 'center', gap: '8px', fontSize: '1.15rem', marginBottom: '0.75rem' }}>
                      <Server size={20} /> Backend & Cloud APIs
                    </h3>
                    <p style={{ color: '#94a3b8', fontSize: '0.92rem', lineHeight: 1.6 }}>
                      Microservices, automated queue processors, serverless functions, and third-party API orchestration with enterprise-grade uptime.
                    </p>
                  </div>

                  <div style={{ background: 'rgba(15, 23, 42, 0.6)', padding: '1.5rem', borderRadius: '12px', border: '1px solid rgba(255, 255, 255, 0.06)' }}>
                    <h3 style={{ color: 'var(--primary-color, #d4af37)', display: 'flex', alignItems: 'center', gap: '8px', fontSize: '1.15rem', marginBottom: '0.75rem' }}>
                      <Database size={20} /> Database Architecture
                    </h3>
                    <p style={{ color: '#94a3b8', fontSize: '0.92rem', lineHeight: 1.6 }}>
                      Relational PostgreSQL schemas, distributed caches with Redis, and NoSQL stores engineered for rapid query execution under high traffic.
                    </p>
                  </div>

                  <div style={{ background: 'rgba(15, 23, 42, 0.6)', padding: '1.5rem', borderRadius: '12px', border: '1px solid rgba(255, 255, 255, 0.06)' }}>
                    <h3 style={{ color: 'var(--primary-color, #d4af37)', display: 'flex', alignItems: 'center', gap: '8px', fontSize: '1.15rem', marginBottom: '0.75rem' }}>
                      <Shield size={20} /> Cybersecurity & Compliance
                    </h3>
                    <p style={{ color: '#94a3b8', fontSize: '0.92rem', lineHeight: 1.6 }}>
                      Automated rate limiting, SSL encryption, CSRF/XSS defense shields, and secure OAuth/JWT token workflows protecting client data.
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Author Attribution Card */}
            <div
              style={{
                background: 'linear-gradient(135deg, rgba(212, 175, 55, 0.1) 0%, rgba(15, 23, 42, 0.8) 100%)',
                border: '1px solid rgba(212, 175, 55, 0.3)',
                borderRadius: '14px',
                padding: '2rem',
                margin: '3rem 0',
                display: 'flex',
                alignItems: 'center',
                gap: '20px',
                flexWrap: 'wrap'
              }}
            >
              <img
                src="https://i.postimg.cc/q62QnRNR/Axe-s-Era-company-logo-20260808-065813-0000.png"
                alt="Axe's Era"
                style={{ width: '70px', height: '70px', borderRadius: '12px', objectFit: 'contain' }}
              />
              <div style={{ flex: 1 }}>
                <h4 style={{ margin: '0 0 4px', fontSize: '1.1rem', color: '#ffffff' }}>
                  Published by {blog.author || 'Gauhar Axe'}
                </h4>
                <p style={{ margin: 0, fontSize: '0.88rem', color: '#94a3b8', lineHeight: 1.5 }}>
                  CEO & Founder at Axe's Era Enterprise. Leading digital transformation, high-velocity web engineering, and brand positioning for high-growth global businesses.
                </p>
              </div>
              <button
                onClick={onContactClick}
                className="btn btn-primary"
                style={{ padding: '8px 18px', fontSize: '0.85rem' }}
              >
                Consult Gauhar Axe
              </button>
            </div>

            {/* Bottom Actions */}
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                paddingTop: '2rem',
                borderTop: '1px solid rgba(255, 255, 255, 0.08)',
                flexWrap: 'wrap',
                gap: '1rem'
              }}
            >
              <button
                onClick={onBackToBlogs}
                className="btn btn-outline"
                style={{ padding: '10px 22px' }}
              >
                <ArrowLeft size={16} /> Back to All Articles
              </button>

              <button
                onClick={onContactClick}
                className="btn btn-primary"
                style={{ padding: '10px 24px' }}
              >
                Start a Project with Us
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Lightbox Modal for Full Screen Image Inspection */}
      {lightboxOpen && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(5, 8, 16, 0.95)',
            zIndex: 9999,
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            alignItems: 'center',
            padding: '20px'
          }}
          onClick={() => setLightboxOpen(false)}
        >
          {/* Close button */}
          <button
            onClick={() => setLightboxOpen(false)}
            style={{
              position: 'absolute',
              top: '24px',
              right: '24px',
              background: 'rgba(255, 255, 255, 0.1)',
              border: 'none',
              color: '#ffffff',
              padding: '10px',
              borderRadius: '50%',
              cursor: 'pointer'
            }}
          >
            <X size={24} />
          </button>

          {/* Active Image */}
          <div
            style={{
              position: 'relative',
              maxWidth: '90vw',
              maxHeight: '80vh',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <img
              src={allImages[activeImageIndex]}
              alt={`${blog.title} lightbox visual`}
              style={{
                maxWidth: '100%',
                maxHeight: '80vh',
                objectFit: 'contain',
                borderRadius: '8px',
                boxShadow: '0 20px 50px rgba(0,0,0,0.8)'
              }}
            />

            {/* Navigation arrows if multiple images */}
            {allImages.length > 1 && (
              <>
                <button
                  onClick={() => setActiveImageIndex((prev) => (prev > 0 ? prev - 1 : allImages.length - 1))}
                  style={{
                    position: 'absolute',
                    left: '-20px',
                    top: '50%',
                    transform: 'translateY(-50%)',
                    background: 'rgba(15, 23, 42, 0.9)',
                    border: '1px solid rgba(255, 255, 255, 0.2)',
                    color: '#ffffff',
                    padding: '10px',
                    borderRadius: '50%',
                    cursor: 'pointer'
                  }}
                >
                  <ChevronLeft size={20} />
                </button>
                <button
                  onClick={() => setActiveImageIndex((prev) => (prev < allImages.length - 1 ? prev + 1 : 0))}
                  style={{
                    position: 'absolute',
                    right: '-20px',
                    top: '50%',
                    transform: 'translateY(-50%)',
                    background: 'rgba(15, 23, 42, 0.9)',
                    border: '1px solid rgba(255, 255, 255, 0.2)',
                    color: '#ffffff',
                    padding: '10px',
                    borderRadius: '50%',
                    cursor: 'pointer'
                  }}
                >
                  <ChevronRight size={20} />
                </button>
              </>
            )}
          </div>

          {/* Lightbox thumbnail track */}
          {allImages.length > 1 && (
            <div
              style={{
                display: 'flex',
                gap: '8px',
                marginTop: '16px',
                overflowX: 'auto',
                maxWidth: '90vw',
                padding: '8px'
              }}
              onClick={(e) => e.stopPropagation()}
            >
              {allImages.map((img, idx) => (
                <div
                  key={idx}
                  onClick={() => setActiveImageIndex(idx)}
                  style={{
                    width: '60px',
                    height: '45px',
                    borderRadius: '6px',
                    overflow: 'hidden',
                    cursor: 'pointer',
                    border: activeImageIndex === idx ? '2px solid var(--primary-color, #d4af37)' : '1px solid rgba(255,255,255,0.2)',
                    opacity: activeImageIndex === idx ? 1 : 0.5
                  }}
                >
                  <img src={img} alt="thumb" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};
