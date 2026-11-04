import React, { useState, useEffect } from 'react';
import { Menu, X } from 'lucide-react';
import { PageView } from '../types';

interface NavbarProps {
  currentPage: PageView;
  setCurrentPage: (page: PageView) => void;
  onNavigateSection?: (sectionId: string) => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentPage,
  setCurrentPage,
  onNavigateSection
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

  const handleLinkClick = (sectionId?: string) => {
    setMobileMenuOpen(false);
    if (currentPage !== 'home') {
      setCurrentPage('home');
      if (sectionId) {
        setTimeout(() => {
          const el = document.getElementById(sectionId);
          if (el) {
            el.scrollIntoView({ behavior: 'smooth' });
          }
        }, 100);
      } else {
        window.scrollTo({ top: 0, behavior: 'smooth' });
      }
    } else {
      if (sectionId && onNavigateSection) {
        onNavigateSection(sectionId);
      } else if (!sectionId) {
        window.scrollTo({ top: 0, behavior: 'smooth' });
      }
    }
  };

  const handleBlogsClick = () => {
    setMobileMenuOpen(false);
    setCurrentPage('blogs');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handlePoliciesClick = () => {
    setMobileMenuOpen(false);
    setCurrentPage('policies');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <nav className={`navbar ${isScrolled ? 'scrolled' : ''}`} id="navbar">
      <div className="nav-container">
        <div
          className="nav-brand"
          onClick={() => handleLinkClick()}
          role="button"
          tabIndex={0}
        >
          <img
            src="https://i.postimg.cc/q62QnRNR/Axe-s-Era-company-logo-20260808-065813-0000.png"
            alt="Axe's Era Logo"
          />
          <div>
            <h1>Axe's Era Enterprise</h1>
            <p>by Gauhar Axe</p>
          </div>
        </div>

        <div className={`nav-menu ${mobileMenuOpen ? 'open' : ''}`} id="nav-menu">
          <button
            className={`nav-link ${currentPage === 'home' ? 'active' : ''}`}
            onClick={() => handleLinkClick('home')}
          >
            Home
          </button>
          <button
            className="nav-link"
            onClick={() => handleLinkClick('about')}
          >
            About
          </button>
          <button
            className="nav-link"
            onClick={() => handleLinkClick('services')}
          >
            Services
          </button>
          <button
            className="nav-link"
            onClick={() => handleLinkClick('websites')}
          >
            Websites
          </button>
          <button
            className={`nav-link ${currentPage === 'blogs' || currentPage === 'blog-detail' ? 'active' : ''}`}
            onClick={handleBlogsClick}
          >
            Our Blogs
          </button>
          <button
            className="nav-link"
            onClick={() => handleLinkClick('team')}
          >
            Team
          </button>
          <button
            className="nav-link"
            onClick={() => handleLinkClick('testimonials')}
          >
            Testimonials
          </button>
          <button
            className="nav-link"
            onClick={() => handleLinkClick('partnership')}
          >
            Partnership
          </button>
          <button
            className="nav-link"
            onClick={() => handleLinkClick('contact')}
          >
            Contact
          </button>
          <button
            className="nav-link"
            onClick={() => handleLinkClick('faq')}
          >
            FAQ
          </button>
          <button
            className={`nav-link ${currentPage === 'policies' ? 'active' : ''}`}
            onClick={handlePoliciesClick}
          >
            Our Policies
          </button>
        </div>

        <button
          className="nav-toggle"
          id="nav-toggle"
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          aria-label="Toggle navigation menu"
        >
          {mobileMenuOpen ? <X size={26} /> : <Menu size={26} />}
        </button>
      </div>
    </nav>
  );
};
