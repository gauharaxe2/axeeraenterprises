import React, { useState, useEffect } from 'react';
import { useLanguage } from '../context/LanguageContext';

interface AboutProps {
  title?: string;
  paragraph1?: string;
  paragraph2?: string;
  imageUrl?: string;
  stats?: {
    years: number;
    experts: number;
    projects: number;
    retention: number;
  };
  onOpenAboutPage?: () => void;
}

export const About: React.FC<AboutProps> = ({
  title,
  paragraph1,
  paragraph2,
  imageUrl = "https://i.postimg.cc/64KnkhQJ/Picsart-26-08-08-06-41-12-297.jpg",
  stats = {
    years: 3,
    experts: 1,
    projects: 10,
    retention: 99
  },
  onOpenAboutPage
}) => {
  const { strings } = useLanguage();
  const displayTitle = title || strings.about.heading;
  const displayParagraph1 = paragraph1 || strings.about.paragraph1;
  const displayParagraph2 = paragraph2 || strings.about.paragraph2;
  const [counts, setCounts] = useState({
    years: 0,
    experts: 0,
    projects: 0,
    retention: 0
  });

  useEffect(() => {
    const timer = setTimeout(() => {
      setCounts({
        years: stats.years,
        experts: stats.experts,
        projects: stats.projects,
        retention: stats.retention
      });
    }, 300);

    return () => clearTimeout(timer);
  }, [stats]);

  return (
    <section id="about" className="about">
      <div className="container">
        <div className="section-header">
          <h2>{strings.about.sectionTitle}</h2>
          <p>{strings.about.sectionSubtitle}</p>
        </div>

        <div className="about-content">
          <div className="about-text">
            <h3>{displayTitle}</h3>
            <p>{displayParagraph1}</p>
            <p>{displayParagraph2}</p>

            <div className="about-stats">
              <div className="stat-item">
                <h4>{counts.years}</h4>
                <p>{strings.about.yearsLabel}</p>
              </div>
              <div className="stat-item">
                <h4>{counts.experts}</h4>
                <p>{strings.about.expertsLabel}</p>
              </div>
              <div className="stat-item">
                <h4>{counts.projects}+</h4>
                <p>{strings.about.projectsLabel}</p>
              </div>
              <div className="stat-item">
                <h4>{counts.retention}%</h4>
                <p>{strings.about.retentionLabel}</p>
              </div>
            </div>

            {onOpenAboutPage && (
              <div style={{ marginTop: '2rem' }}>
                <button
                  type="button"
                  onClick={onOpenAboutPage}
                  className="btn btn-primary"
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '0.5rem',
                    fontSize: '0.9rem',
                    padding: '0.65rem 1.4rem'
                  }}
                >
                  {strings.about.cta}
                </button>
              </div>
            )}
          </div>

          <div className="about-image">
            <img
              src={imageUrl}
              alt="About Axe's Era Enterprise"
            />
          </div>
        </div>
      </div>
    </section>
  );
};
