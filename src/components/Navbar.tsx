import React, { useState, useEffect, useRef } from 'react';
import { Menu, X, Globe, ChevronDown, Check, Sun, Moon } from 'lucide-react';
import { PageView } from '../types';
import { SITE_LOGO_SRC } from '../brand';
import { useLanguage } from '../context/LanguageContext';
import { useTheme } from '../context/ThemeContext';
import { LANGUAGE_OPTIONS, getLanguageMeta } from '../i18n/languages';
import type { Language } from '../i18n/types';

const NAV_LINKS: { page: PageView; href: string; navKey: string }[] = [
  { page: 'home', href: '/', navKey: 'home' },
  { page: 'about', href: '/about', navKey: 'about' },
  { page: 'services', href: '/services', navKey: 'services' },
  { page: 'websites', href: '/websites', navKey: 'websites' },
  { page: 'blogs', href: '/#blog-hub', navKey: 'blogs' },
  { page: 'team', href: '/team', navKey: 'team' },
  { page: 'testimonials', href: '/testimonials', navKey: 'testimonials' },
  { page: 'partnership', href: '/partnership', navKey: 'partnership' },
  { page: 'contact', href: '/contact', navKey: 'contact' },
  { page: 'location', href: '/location', navKey: 'location' },
  { page: 'faq', href: '/faq', navKey: 'faq' },
  { page: 'policies', href: '/policies', navKey: 'policies' }
];

function isModifiedClick(event: React.MouseEvent<HTMLAnchorElement>) {
  return event.metaKey || event.ctrlKey || event.shiftKey || event.altKey || event.button !== 0;
}

interface NavbarProps {
  currentPage: PageView;
  setCurrentPage: (page: PageView) => void;
  onOpenServicesPage?: () => void;
  onOpenPage?: (page: PageView) => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentPage,
  setCurrentPage,
  onOpenServicesPage,
  onOpenPage
}) => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isLangMenuOpen, setIsLangMenuOpen] = useState(false);
  const langDropdownRef = useRef<HTMLDivElement>(null);
  const { language, setLanguage, strings } = useLanguage();
  const { isDark, toggleTheme } = useTheme();
  const activeLangMeta = getLanguageMeta(language);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    if (!isLangMenuOpen) return;

    const handleClickOutside = (event: MouseEvent) => {
      if (langDropdownRef.current && !langDropdownRef.current.contains(event.target as Node)) {
        setIsLangMenuOpen(false);
      }
    };

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setIsLangMenuOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isLangMenuOpen]);

  const navigateToPage = (page: PageView) => {
    setIsMenuOpen(false);
    setIsLangMenuOpen(false);
    if (onOpenPage) {
      onOpenPage(page);
    } else {
      setCurrentPage(page);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const handleServicesClick = () => {
    setIsMenuOpen(false);
    setIsLangMenuOpen(false);
    if (onOpenServicesPage) {
      onOpenServicesPage();
    } else {
      navigateToPage('services');
    }
  };

  const handleSelectLanguage = (code: Language) => {
    setLanguage(code);
    setIsLangMenuOpen(false);
  };

  const getNavLabel = (navKey: string): string => {
    const navStrings = strings.nav as Record<string, string>;
    return navStrings[navKey] || navKey;
  };

  const isLinkActive = (page: PageView): boolean => {
    if (page === 'services') return currentPage === 'services' || currentPage === 'service-detail';
    if (page === 'blogs') return currentPage === 'blogs' || currentPage === 'blog-detail';
    return currentPage === page;
  };

  return (
    <nav className={`navbar ${isScrolled ? 'scrolled' : ''}`} id="navbar">
      <div className="nav-container">
        <a
          href="/"
          className="nav-brand"
          onClick={(event) => {
            if (isModifiedClick(event)) return;
            event.preventDefault();
            navigateToPage('home');
          }}
        >
          <img src={SITE_LOGO_SRC} alt="" aria-hidden="true" />
          <div>
            <h1>{strings.brand.name}</h1>
            <p>{strings.brand.tagline}</p>
          </div>
        </a>

        <div className={`nav-menu ${isMenuOpen ? 'open' : ''}`} id="nav-menu">
          {NAV_LINKS.map((link) => {
            const active = isLinkActive(link.page);
            const label = getNavLabel(link.navKey);
            return (
              <a
                key={link.href}
                href={link.href}
                className={`nav-link ${active ? 'active' : ''}`}
                aria-current={active ? 'page' : undefined}
                onClick={(event) => {
                  if (isModifiedClick(event)) return;
                  event.preventDefault();
                  if (link.page === 'services') handleServicesClick();
                  else navigateToPage(link.page);
                }}
              >
                {label}
              </a>
            );
          })}

          <div className="nav-drawer-lang-wrap">
            <div className="nav-drawer-lang-grid" role="group" aria-label="Select Language">
              {LANGUAGE_OPTIONS.map((opt) => {
                const isSelected = opt.code === language;
                return (
                  <button
                    key={opt.code}
                    type="button"
                    onClick={() => handleSelectLanguage(opt.code)}
                    className={`nav-drawer-lang-chip ${isSelected ? 'active' : ''}`}
                    aria-pressed={isSelected}
                    aria-label={`Switch language to ${opt.englishName} (${opt.nativeLabel})`}
                  >
                    <span className="chip-native">{opt.nativeLabel}</span>
                    <span className="chip-code">{opt.code.toUpperCase()}</span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        <div className="nav-actions">
          <button
            type="button"
            id="theme-toggle-btn"
            role="switch"
            aria-checked={isDark}
            aria-label={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
            title={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
            className={`theme-toggle-btn ${isDark ? 'is-dark' : ''}`}
            onClick={() => {
              setIsLangMenuOpen(false);
              toggleTheme();
            }}
          >
            <span className="theme-switch-track" aria-hidden="true">
              <span className="theme-switch-thumb">
                {isDark ? <Moon size={10} /> : <Sun size={10} />}
              </span>
            </span>
            <span className="theme-toggle-label">{isDark ? 'Dark' : 'Light'}</span>
          </button>

          <div className="lang-dropdown" ref={langDropdownRef}>
            <button
              type="button"
              id="lang-toggle-btn"
              onClick={() => setIsLangMenuOpen((prev) => !prev)}
              className={`lang-toggle-btn ${isLangMenuOpen ? 'open' : ''}`}
              aria-haspopup="listbox"
              aria-expanded={isLangMenuOpen}
              aria-label={`Select language (current: ${activeLangMeta.englishName})`}
              title={`Language: ${activeLangMeta.nativeLabel}`}
            >
              <Globe size={15} className="lang-globe-icon" />
              <span className="lang-active-code">{activeLangMeta.shortCode}</span>
              <ChevronDown
                size={14}
                className={`lang-chevron ${isLangMenuOpen ? 'rotated' : ''}`}
              />
            </button>

            {isLangMenuOpen && (
              <div
                className="lang-dropdown-menu"
                role="listbox"
                aria-label="Available languages"
              >
                {LANGUAGE_OPTIONS.map((opt) => {
                  const isSelected = opt.code === language;
                  return (
                    <button
                      key={opt.code}
                      type="button"
                      role="option"
                      aria-selected={isSelected}
                      data-lang={opt.code}
                      onClick={() => handleSelectLanguage(opt.code)}
                      className={`lang-dropdown-item ${isSelected ? 'active' : ''}`}
                    >
                      <span className="lang-item-labels">
                        <span className="lang-item-native">{opt.nativeLabel}</span>
                        <span className="lang-item-english">{opt.englishName}</span>
                      </span>
                      <span className="lang-item-meta">
                        <span className="lang-item-code">{opt.code.toUpperCase()}</span>
                        {isSelected && <Check size={14} className="lang-item-check" />}
                      </span>
                    </button>
                  );
                })}
              </div>
            )}
          </div>

          <button
            className="nav-toggle"
            id="nav-toggle"
            onClick={() => {
              setIsLangMenuOpen(false);
              setIsMenuOpen((prev) => !prev);
            }}
            aria-label="Toggle navigation menu"
            aria-expanded={isMenuOpen}
            aria-controls="nav-menu"
          >
            {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </div>
    </nav>
  );
};
