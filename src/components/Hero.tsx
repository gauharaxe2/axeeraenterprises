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

  return (
    <section id="home" className="hero">
      <div className="hero-content">
        <div className="hero-text">
          <h1>{displayTitle}</h1>
          <p>{displaySubtitle}</p>
          <div className="hero-buttons">
            <button onClick={onStartProject} className="btn btn-primary">
              {strings.hero.startProject}
            </button>
            <button onClick={onExploreCaseStudies} className="btn btn-outline">
              {strings.hero.exploreCaseStudies}
            </button>
          </div>
        </div>
        <div className="hero-image">
          <div className="hero-graphic">
            <Rocket size={100} />
          </div>
        </div>
      </div>
      <div
        className="scroll-indicator"
        onClick={() => {
          const el = document.getElementById('about');
          el?.scrollIntoView({ behavior: 'smooth' });
        }}
      >
        <div className="scroll-arrow"></div>
      </div>
    </section>
  );
};
