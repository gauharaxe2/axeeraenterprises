import React, { useState, useEffect } from 'react';
import { Menu, X } from 'lucide-react';
import { PageView } from '../types';

const NAV_LINKS: { page: PageView; href: string; label: string }[] = [
  { page: 'home', href: '/', label: 'Home' },
  { page: 'about', href: '/about', label: 'About' },
  { page: 'services', href: '/services', label: 'Services' },
  { page: 'websites', href: '/websites', label: 'Websites' },
  { page: 'blogs', href: '/#blog-hub', label: 'Our Blogs' },
  { page: 'team', href: '/team', label: 'Team' },
  { page: 'testimonials', href: '/testimonials', label: 'Testimonials' },
  { page: 'partnership', href: '/partnership', label: 'Partnership' },
  { page: 'contact', href: '/contact', label: 'Contact' },
  { page: 'faq', href: '/faq', label: 'FAQ' },
  { page: 'policies', href: '/policies', label: 'Our Policies' }
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
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 40);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const navigateToPage = (page: PageView) => {
    setMobileMenuOpen(false);
    if (onOpenPage) {
      onOpenPage(page);
    } else {
      setCurrentPage(page);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const handleServicesClick = () => {
    setMobileMenuOpen(false);
    if (onOpenServicesPage) {
      onOpenServicesPage();
    } else {
      navigateToPage('services');
    }
  };

  return (
    <nav className={`navbar ${isScrolled ? 'scrolled' : ''}`} id="navbar">
      <div className="nav-container">
        <a href="/" className="nav-brand" onClick={(event) => {
          if (isModifiedClick(event)) return;
          event.preventDefault();
          navigateToPage('home');
        }}>
          <img
            src="https://i.postimg.cc/q62QnRNR/Axe-s-Era-company-logo-20260808-065813-0000.png"
            alt="Axe's Era Logo"
          />
          <div>
            <h1>Axe's Era Enterprise</h1>
            <p>by Gauhar Axe</p>
          </div>
        </a>

        <div className={`nav-menu ${mobileMenuOpen ? 'open' : ''}`} id="nav-menu">
          {NAV_LINKS.map((link) => {
            const active =
              link.page === 'services'
                ? currentPage === 'services' || currentPage === 'service-detail'
                : link.page === 'blogs'
                  ? currentPage === 'blogs' || currentPage === 'blog-detail'
                  : currentPage === link.page;
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
                {link.label}
              </a>
            );
          })}
        </div>

        <button
          className="nav-toggle"
          id="nav-toggle"
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          aria-label="Toggle navigation menu"
          aria-expanded={mobileMenuOpen}
          aria-controls="nav-menu"
        >
          {mobileMenuOpen ? <X size={26} /> : <Menu size={26} />}
        </button>
      </div>
    </nav>
  );
};
