import React from 'react';
import { Rocket } from 'lucide-react';

interface HeroProps {
  title?: string;
  subtitle?: string;
  onStartProject: () => void;
  onExploreCaseStudies: () => void;
}

export const Hero: React.FC<HeroProps> = ({
  title = "Elevate Your Brand with Premium Digital Solutions",
  subtitle = "Axe's Era Enterprise is an award-winning digital agency specializing in high-performance web development, mobile apps, and brand design. We don't just build websites; we engineer digital growth for forward-thinking organizations.",
  onStartProject,
  onExploreCaseStudies
}) => {
  return (
    <section id="home" className="hero">
      <div className="hero-content">
        <div className="hero-text">
          <h1>{title}</h1>
          <p>{subtitle}</p>
          <div className="hero-buttons">
            <button onClick={onStartProject} className="btn btn-primary">
              Start a Project
            </button>
            <button onClick={onExploreCaseStudies} className="btn btn-outline">
              Explore Case Studies
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
