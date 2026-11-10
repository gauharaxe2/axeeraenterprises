import React, { useState, useEffect } from 'react';

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
  title = "Your Digital Transformation Partner",
  paragraph1 = "Founded by Gauhar Axe, Axe's Era Enterprise has grown into a leading digital agency with over 3+ years of experience. We've helped hundreds of businesses establish their digital presence and achieve their goals. Our team combines creativity with technical expertise to deliver exceptional results.",
  paragraph2 = "We believe in building long-term partnerships with our clients, understanding their unique challenges, and crafting tailored solutions that drive real business impact.",
  imageUrl = "https://i.postimg.cc/64KnkhQJ/Picsart-26-08-08-06-41-12-297.jpg",
  stats = {
    years: 3,
    experts: 1,
    projects: 10,
    retention: 99
  },
  onOpenAboutPage
}) => {
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
          <h2>About Our Agency</h2>
          <p>
            We're passionate about creating digital solutions that help businesses thrive in the modern world.
          </p>
        </div>

        <div className="about-content">
          <div className="about-text">
            <h3>{title}</h3>
            <p>{paragraph1}</p>
            <p>{paragraph2}</p>

            <div className="about-stats">
              <div className="stat-item">
                <h4>{counts.years}</h4>
                <p>Years of Experience</p>
              </div>
              <div className="stat-item">
                <h4>{counts.experts}</h4>
                <p>Digital Experts</p>
              </div>
              <div className="stat-item">
                <h4>{counts.projects}+</h4>
                <p>Projects Delivered</p>
              </div>
              <div className="stat-item">
                <h4>{counts.retention}%</h4>
                <p>Client Retention</p>
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
                  Explore Full Story, Vision & Milestones (About Page) →
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
