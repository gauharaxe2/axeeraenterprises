import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  ArrowLeft,
  Calendar,
  Clock,
  User,
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
import { SITE_LOGO_SRC } from '../brand';
import { WhatsAppIcon } from './WhatsAppIcon';
import { calculateReadingProgress, estimateReadingTime, collectArticleImages } from '../utils/blogUtils';

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
  const [readingProgress, setReadingProgress] = useState(0);
  const articleContentRef = useRef<HTMLElement | null>(null);

  const readingStats = useMemo(() => estimateReadingTime(blog), [blog]);

  const updateReadingProgress = useCallback(() => {
    const contentEl = articleContentRef.current;
    if (!contentEl) {
      setReadingProgress(0);
      return;
    }

    const rect = contentEl.getBoundingClientRect();
    const nextProgress = calculateReadingProgress({
      scrollY: window.scrollY,
      articleTop: rect.top + window.scrollY,
      articleHeight: rect.height,
      viewportHeight: window.innerHeight,
      documentHeight: document.documentElement.scrollHeight
    });
    setReadingProgress(nextProgress);
  }, []);

  useEffect(() => {
    setActiveImageIndex(0);
    updateReadingProgress();

    let rafId: number | null = null;
    const handleScrollOrResize = () => {
      if (rafId !== null) return;
      rafId = window.requestAnimationFrame(() => {
        rafId = null;
        updateReadingProgress();
      });
    };

    window.addEventListener('scroll', handleScrollOrResize, { passive: true });
    window.addEventListener('resize', handleScrollOrResize, { passive: true });

    let resizeObserver: ResizeObserver | null = null;
    if (typeof ResizeObserver !== 'undefined' && articleContentRef.current) {
      resizeObserver = new ResizeObserver(handleScrollOrResize);
      resizeObserver.observe(articleContentRef.current);
    }

    return () => {
      window.removeEventListener('scroll', handleScrollOrResize);
      window.removeEventListener('resize', handleScrollOrResize);
      if (rafId !== null) {
        window.cancelAnimationFrame(rafId);
      }
      if (resizeObserver) {
        resizeObserver.disconnect();
      }
    };
  }, [blog.id, blog.slug, updateReadingProgress]);

  // Combine primary cover image, section images, and additional gallery images without duplicates
  const allImages = useMemo(
    () => collectArticleImages(blog.imageUrl, blog.sections, blog.images),
    [blog.imageUrl, blog.sections, blog.images]
  );

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
    const text = encodeURIComponent(`Check out this insightful article "${blog.title}" by Axe's Era Enterprises:\n${window.location.href}`);
    window.open(`https://api.whatsapp.com/send?text=${text}`, '_blank');
  };

  const isWhatIsWebDev = blog.slug === 'what-is-web-development';

  return (
    <div style={{ paddingTop: '70px', minHeight: '100vh', background: 'var(--bg-light)', color: '#0a0a0a' }}>
      {/* Fixed Top Reading Progress Bar */}
      <div
        className="reading-progress-track"
        role="progressbar"
        aria-label="Article reading progress"
        aria-valuemin={0}
        aria-valuemax={100}
        aria-valuenow={Math.round(readingProgress)}
        data-testid="reading-progress-bar"
        data-progress={Math.round(readingProgress)}
      >
        <div
          className="reading-progress-fill"
          style={{ transform: `scaleX(${readingProgress / 100})` }}
        />
      </div>

      {/* Article Header Hero */}
      <section
        className="dark-surface"
        style={{
          padding: '80px 20px 50px',
          background: 'radial-gradient(ellipse at top, rgba(212, 175, 55, 0.14) 0%, #0a0a0a 75%)',
          borderBottom: '1px solid rgba(212, 175, 55, 0.25)',
          color: '#ffffff',
          textAlign: 'center'
        }}
      >
        <div className="container" style={{ maxWidth: '960px', margin: '0 auto' }}>
          {/* Back Pill Button */}
          <div style={{ marginBottom: '1.5rem' }}>
            <button
              onClick={onBackToBlogs}
              style={{
                background: 'rgba(20, 20, 20, 0.9)',
                border: '1px solid rgba(212, 175, 55, 0.45)',
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
                e.currentTarget.style.background = 'rgba(212, 175, 55, 0.14)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.borderColor = 'rgba(212, 175, 55, 0.45)';
                e.currentTarget.style.background = 'rgba(20, 20, 20, 0.9)';
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
              color: '#d6d3d1',
              flexWrap: 'wrap',
              marginBottom: '1.5rem'
            }}
          >
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', color: '#ffffff' }}>
              <User size={15} color="var(--primary-color, #d4af37)" />
              {blog.author || 'Gauhar Axe'}
            </span>
            <span>•</span>
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
              <Calendar size={15} />
              {blog.date || '2026 Insights'}
            </span>
            <span>•</span>
            <span
              data-testid="time-to-read"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
                fontVariantNumeric: 'tabular-nums',
                color: '#e7e5e4'
              }}
            >
              <Clock size={15} color="var(--primary-color, #d4af37)" aria-hidden="true" />
              Time to Read: {readingStats.minutes} min ({readingStats.wordCount.toLocaleString()} words)
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
              color: '#e7e5e4',
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
                background: 'rgba(28, 28, 28, 0.9)',
                border: '1px solid rgba(212, 175, 55, 0.35)',
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
                border: '1px solid rgba(37, 211, 102, 0.45)',
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
              <WhatsAppIcon size={16} color="#25D366" /> Share on WhatsApp
            </button>
          </div>
        </div>
      </section>

      {/* Main Article Content */}
      <section ref={articleContentRef} style={{ padding: '60px 20px 100px' }}>
        <div className="container" style={{ maxWidth: '960px', margin: '0 auto' }}>
          <div
            style={{
              background: '#ffffff',
              border: '1px solid var(--border-color)',
              borderRadius: '20px',
              padding: 'clamp(1.5rem, 4vw, 3.5rem)',
              boxShadow: 'var(--shadow-lg)'
            }}
          >
            {/* Primary Cover Image with Zoom Lightbox Trigger */}
            <div style={{ position: 'relative', borderRadius: '14px', overflow: 'hidden', marginBottom: '2.5rem', background: '#0a0a0a' }}>
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
                  background: 'rgba(10, 10, 10, 0.88)',
                  border: '1px solid rgba(212, 175, 55, 0.4)',
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
                <Maximize2 size={13} color="var(--primary-color)" /> View Full Photo ({activeImageIndex + 1}/{allImages.length})
              </button>
            </div>

            {/* Multiple Images Interactive Photo Gallery Showcase */}
            {allImages.length > 1 && (
              <div
                style={{
                  background: 'var(--bg-light)',
                  border: '1px solid rgba(184, 134, 11, 0.3)',
                  borderRadius: '14px',
                  padding: '1.25rem',
                  marginBottom: '2.5rem'
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px', flexWrap: 'wrap', gap: '8px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <Images size={18} color="var(--gold-ink)" />
                    <h4 style={{ margin: 0, fontSize: '0.95rem', color: '#0a0a0a' }}>
                      Article Image Gallery ({allImages.length} Visual Assets)
                    </h4>
                  </div>
                  <span style={{ fontSize: '0.8rem', color: '#57534e' }}>
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
                          border: isCurrent ? '2px solid #b8860b' : '1px solid var(--border-color)',
                          position: 'relative',
                          transition: 'all 0.2s ease',
                          opacity: isCurrent ? 1 : 0.78
                        }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.opacity = '1';
                          e.currentTarget.style.transform = 'scale(1.02)';
                        }}
                        onMouseLeave={(e) => {
                          if (!isCurrent) e.currentTarget.style.opacity = '0.78';
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
                            background: 'rgba(10, 10, 10, 0.82)',
                            color: '#f5d061',
                            fontSize: '0.65rem',
                            fontWeight: 700,
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
                      background: 'var(--bg-light)',
                      border: '1px solid var(--border-color)',
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
                          background: 'linear-gradient(to bottom, var(--primary-color, #d4af37), var(--primary-dark, #b8860b))',
                          borderRadius: '2px',
                          display: 'inline-block'
                        }}
                      />
                      <h2
                        style={{
                          color: '#0a0a0a',
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
                          background: '#ffffff',
                          border: '1px solid var(--border-color)'
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
                              background: 'rgba(10, 10, 10, 0.88)',
                              border: '1px solid rgba(212, 175, 55, 0.4)',
                              color: '#ffffff',
                              padding: '5px 10px',
                              borderRadius: '6px',
                              fontSize: '0.74rem',
                              display: 'flex',
                              alignItems: 'center',
                              gap: '5px'
                            }}
                          >
                            <Maximize2 size={12} color="var(--primary-color)" /> Click to Enlarge
                          </div>
                        </div>
                        {section.imageCaption && (
                          <figcaption
                            style={{
                              padding: '8px 14px',
                              fontSize: '0.82rem',
                              color: '#44403c',
                              background: '#ffffff',
                              borderTop: '1px solid var(--border-color)',
                              fontStyle: 'italic',
                              display: 'flex',
                              alignItems: 'center',
                              gap: '6px'
                            }}
                          >
                            <span style={{ color: 'var(--gold-ink)' }}>📷</span>
                            {section.imageCaption}
                          </figcaption>
                        )}
                      </figure>
                    )}

                    {/* Section Paragraphs */}
                    <div style={{ color: '#292524', fontSize: '1.08rem', lineHeight: 1.85 }}>
                      {section.paragraphs.map((para, pIdx) => (
                        <p key={pIdx} style={{ color: '#292524', marginBottom: pIdx === section.paragraphs.length - 1 ? 0 : '1.25rem' }}>
                          {para}
                        </p>
                      ))}
                    </div>
                  </article>
                ))}
              </div>
            ) : (
              /* Fallback for legacy paragraphs */
              <div style={{ color: '#292524', fontSize: '1.12rem', lineHeight: 1.85, marginBottom: '2.5rem' }}>
                {blog.paragraphs.map((para, idx) => (
                  <p key={idx} style={{ color: '#292524', marginBottom: '1.5rem' }}>
                    {para}
                  </p>
                ))}
              </div>
            )}

            {/* Special Technical Breakdown (for "What is Web Development?") */}
            {isWhatIsWebDev && (
              <div style={{ marginTop: '2rem', paddingTop: '2rem', borderTop: '1px solid var(--border-color)' }}>
                <h2 style={{ color: '#0a0a0a', fontSize: '1.85rem', borderBottom: '2px solid var(--primary-color, #d4af37)', paddingBottom: '0.75rem', marginBottom: '2rem' }}>
                  Core Web Development Pillars In 2026
                </h2>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '20px', marginBottom: '2.5rem' }}>
                  <div style={{ background: 'var(--bg-light)', padding: '1.5rem', borderRadius: '12px', border: '1px solid var(--border-color)' }}>
                    <h3 style={{ color: '#0a0a0a', display: 'flex', alignItems: 'center', gap: '8px', fontSize: '1.15rem', marginBottom: '0.75rem' }}>
                      <Code2 size={20} color="var(--gold-ink)" /> Frontend Engineering
                    </h3>
                    <p style={{ color: '#44403c', fontSize: '0.92rem', lineHeight: 1.6 }}>
                      Building high-performance user interfaces with React, Next.js, and TypeScript. Ensures fluid touch responsiveness and sub-second rendering.
                    </p>
                  </div>

                  <div style={{ background: 'var(--bg-light)', padding: '1.5rem', borderRadius: '12px', border: '1px solid var(--border-color)' }}>
                    <h3 style={{ color: '#0a0a0a', display: 'flex', alignItems: 'center', gap: '8px', fontSize: '1.15rem', marginBottom: '0.75rem' }}>
                      <Server size={20} color="var(--gold-ink)" /> Backend & Cloud APIs
                    </h3>
                    <p style={{ color: '#44403c', fontSize: '0.92rem', lineHeight: 1.6 }}>
                      Microservices, automated queue processors, serverless functions, and third-party API orchestration with enterprise-grade uptime.
                    </p>
                  </div>

                  <div style={{ background: 'var(--bg-light)', padding: '1.5rem', borderRadius: '12px', border: '1px solid var(--border-color)' }}>
                    <h3 style={{ color: '#0a0a0a', display: 'flex', alignItems: 'center', gap: '8px', fontSize: '1.15rem', marginBottom: '0.75rem' }}>
                      <Database size={20} color="var(--gold-ink)" /> Database Architecture
                    </h3>
                    <p style={{ color: '#44403c', fontSize: '0.92rem', lineHeight: 1.6 }}>
                      Relational PostgreSQL schemas, distributed caches with Redis, and NoSQL stores engineered for rapid query execution under high traffic.
                    </p>
                  </div>

                  <div style={{ background: 'var(--bg-light)', padding: '1.5rem', borderRadius: '12px', border: '1px solid var(--border-color)' }}>
                    <h3 style={{ color: '#0a0a0a', display: 'flex', alignItems: 'center', gap: '8px', fontSize: '1.15rem', marginBottom: '0.75rem' }}>
                      <Shield size={20} color="var(--gold-ink)" /> Cybersecurity & Compliance
                    </h3>
                    <p style={{ color: '#44403c', fontSize: '0.92rem', lineHeight: 1.6 }}>
                      Automated rate limiting, SSL encryption, CSRF/XSS defense shields, and secure OAuth/JWT token workflows protecting client data.
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Author Attribution Card */}
            <div
              className="dark-surface"
              style={{
                background: 'linear-gradient(135deg, #0a0a0a 0%, #1c1917 100%)',
                border: '1px solid rgba(212, 175, 55, 0.45)',
                borderRadius: '14px',
                padding: '2rem',
                margin: '3rem 0',
                display: 'flex',
                alignItems: 'center',
                gap: '20px',
                flexWrap: 'wrap',
                color: '#ffffff'
              }}
            >
              <img
                src={SITE_LOGO_SRC}
                alt="Axe's Era"
                style={{ width: '70px', height: '70px', borderRadius: '50%', objectFit: 'cover', background: '#000', border: '1px solid var(--primary-color)' }}
              />
              <div style={{ flex: 1 }}>
                <h4 style={{ margin: '0 0 4px', fontSize: '1.1rem', color: '#ffffff' }}>
                  Published by {blog.author || 'Gauhar Axe'}
                </h4>
                <p style={{ margin: 0, fontSize: '0.88rem', color: '#d6d3d1', lineHeight: 1.5 }}>
                  CEO & Founder at Axe's Era Enterprises. Leading digital transformation, high-velocity web engineering, and brand positioning for high-growth global businesses.
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
                borderTop: '1px solid var(--border-color)',
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
            background: 'rgba(10, 10, 10, 0.96)',
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
              background: 'rgba(255, 255, 255, 0.12)',
              border: '1px solid rgba(212, 175, 55, 0.35)',
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
                    background: 'rgba(10, 10, 10, 0.92)',
                    border: '1px solid rgba(212, 175, 55, 0.45)',
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
                    background: 'rgba(10, 10, 10, 0.92)',
                    border: '1px solid rgba(212, 175, 55, 0.45)',
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
