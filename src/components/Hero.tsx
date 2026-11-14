import React from 'react';
import { Rocket } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';

interface HeroProps {
  title?: string;
  subtitle?: string;
  onStartProject: () => void;
  onExploreCaseStudies: () => void;
}

export const Hero: React.FC<HeroProps> = ({
  title,
  subtitle,
  onStartProject,
  onExploreCaseStudies
}) => {
  const { strings } = useLanguage();
  const displayTitle = title || strings.hero.title;
  const displaySubtitle = subtitle || strings.hero.subtitle;

  const scrollToNext = () => {
    document.getElementById('about')?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <section id="home" className="hero">
      <div className="hero-bg-image" aria-hidden="true" />
      <div className="hero-bg-overlay" aria-hidden="true" />
      <div className="hero-content">
        <div className="hero-text">
          <h1>{displayTitle}</h1>
          <p>{displaySubtitle}</p>
          <div className="hero-buttons">
            <button type="button" onClick={onStartProject} className="btn btn-primary">
              {strings.hero.startProject}
            </button>
            <button type="button" onClick={onExploreCaseStudies} className="btn btn-outline">
              {strings.hero.exploreCaseStudies}
            </button>
          </div>
        </div>

        <div className="hero-graphic" aria-hidden="true">
          <Rocket size={92} strokeWidth={1.6} />
        </div>
      </div>

      <div
        className="scroll-indicator"
        onClick={scrollToNext}
        role="button"
        tabIndex={0}
        aria-label="Scroll to next section"
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') scrollToNext();
        }}
      >
        <div className="scroll-arrow" />
      </div>
    </section>
  );
};
