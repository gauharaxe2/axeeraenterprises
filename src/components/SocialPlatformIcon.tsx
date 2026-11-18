import React from 'react';
import { Facebook, Github, Globe, Instagram, Linkedin, Twitter, Youtube } from 'lucide-react';
import type { SocialPlatform } from '../types';

interface SocialPlatformIconProps {
  platform: SocialPlatform;
  size?: number;
}

export const SocialPlatformIcon: React.FC<SocialPlatformIconProps> = ({ platform, size = 18 }) => {
  switch (platform) {
    case 'linkedin':
      return <Linkedin size={size} aria-hidden="true" />;
    case 'twitter':
      return <Twitter size={size} aria-hidden="true" />;
    case 'youtube':
      return <Youtube size={size} aria-hidden="true" />;
    case 'facebook':
      return <Facebook size={size} aria-hidden="true" />;
    case 'instagram':
      return <Instagram size={size} aria-hidden="true" />;
    case 'github':
      return <Github size={size} aria-hidden="true" />;
    case 'upwork':
      return (
        <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
          <path d="M18.561 13.158c-1.102 0-2.135-.467-3.074-1.227l.228-1.076.008-.042c.207-1.143.849-3.06 2.839-3.06 1.492 0 2.703 1.212 2.703 2.703-.001 1.489-1.212 2.677-2.676 2.677zm0-8.974c-3.238 0-5.467 2.062-6.19 4.887-.974-1.789-1.579-3.926-1.761-5.071H7.22v7.71c0 2.012-1.637 3.649-3.649 3.649s-3.649-1.637-3.649-3.649V4H0v7.71c0 3.877 3.155 7.032 7.032 7.032 2.025 0 3.864-.863 5.163-2.247.962 1.096 2.228 1.83 3.674 2.102l-1.006 4.729 3.308.704 1.393-6.551c.003 0 .006.001.009.001 3.236 0 5.438-2.428 5.438-6.079 0-3.651-2.203-6.151-5.449-6.151z" />
        </svg>
      );
    case 'website':
    default:
      return <Globe size={size} aria-hidden="true" />;
  }
};
