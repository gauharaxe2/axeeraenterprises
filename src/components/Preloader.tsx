import React from 'react';
import { SITE_LOGO_SRC } from '../brand';

interface PreloaderProps {
  phase: 'on' | 'out' | 'off';
  durationMs: number;
}

export const Preloader: React.FC<PreloaderProps> = ({ phase, durationMs }) => {
  if (phase === 'off') return null;

  return (
    <div
      className={`site-preloader${phase === 'out' ? ' is-leaving' : ''}`}
      role="status"
      aria-live="polite"
      aria-label="Loading Axe's Era Enterprise"
    >
      <div className="site-preloader-mark">
        <span className="site-preloader-ring" aria-hidden="true" />
        <img src={SITE_LOGO_SRC} alt="" />
      </div>
      <p className="site-preloader-name">
        Axe's Era <span>Enterprise</span>
      </p>
      <p className="site-preloader-sub">by Gauhar Axe</p>
      <div className="site-preloader-bar" aria-hidden="true">
        <span style={{ animationDuration: `${durationMs}ms` }} />
      </div>
    </div>
  );
};
