import React from 'react';
import { Linkedin, Twitter, Youtube, Facebook, Instagram, Github } from 'lucide-react';
import { TeamMemberData } from '../types';

interface TeamSectionProps {
  team: TeamMemberData[];
  onOpenTeamPage?: () => void;
}

export const TeamSection: React.FC<TeamSectionProps> = ({ team, onOpenTeamPage }) => {
  const isSingle = team.length <= 1;

  return (
    <section id="team" className="team">
      <div className="container">
        <div className="section-header">
          <h2>{isSingle ? 'Meet Our Founder' : 'Meet Our Team'}</h2>
          <p>
            {isSingle
              ? 'Visionary leadership driving digital excellence'
              : 'Our world-class team of designers, engineers, and digital strategists'}
          </p>
        </div>

        <div
          className={isSingle ? 'team-grid single-member' : 'team-grid'}
          style={
            !isSingle
              ? {
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
                  gap: '2rem'
                }
              : undefined
          }
        >
          {team.map((member) => (
            <div key={member.id || member.name} className="team-member">
              <div className="member-image">
                <img src={member.imageUrl} alt={`${member.name} - ${member.title}`} />
              </div>

              <div className="member-info">
                <h3>{member.name}</h3>
                <p>{member.title}</p>
                <p
                  style={{
                    color: 'var(--text-light)',
                    fontSize: '0.95rem',
                    margin: '0 auto',
                    maxWidth: '360px',
                    lineHeight: '1.6'
                  }}
                >
                  {member.bio}
                </p>

                {/* Social links positioned directly after introduction paragraph */}
                <div className="member-social">
                  {member.socials.linkedin && (
                    <a
                      href={member.socials.linkedin}
                      target="_blank"
                      rel="noopener noreferrer"
                      aria-label="LinkedIn Profile"
                      title="LinkedIn"
                    >
                      <Linkedin size={18} />
                    </a>
                  )}
                  {member.socials.twitter && (
                    <a
                      href={member.socials.twitter}
                      target="_blank"
                      rel="noopener noreferrer"
                      aria-label="X (Twitter)"
                      title="X (Twitter)"
                    >
                      <Twitter size={18} />
                    </a>
                  )}
                  {member.socials.upwork && (
                    <a
                      href={member.socials.upwork}
                      target="_blank"
                      rel="noopener noreferrer"
                      aria-label="Upwork"
                      title="Upwork Profile"
                    >
                      <svg
                        width="18"
                        height="18"
                        viewBox="0 0 24 24"
                        fill="currentColor"
                        style={{ display: 'block' }}
                      >
                        <path d="M18.561 13.158c-1.102 0-2.135-.467-3.074-1.227l.228-1.076.008-.042c.207-1.143.849-3.06 2.839-3.06 1.492 0 2.703 1.212 2.703 2.703-.001 1.489-1.212 2.677-2.676 2.677zm0-8.974c-3.238 0-5.467 2.062-6.19 4.887-.974-1.789-1.579-3.926-1.761-5.071H7.22v7.71c0 2.012-1.637 3.649-3.649 3.649s-3.649-1.637-3.649-3.649V4H0v7.71c0 3.877 3.155 7.032 7.032 7.032 2.025 0 3.864-.863 5.163-2.247.962 1.096 2.228 1.83 3.674 2.102l-1.006 4.729 3.308.704 1.393-6.551c.003 0 .006.001.009.001 3.236 0 5.438-2.428 5.438-6.079 0-3.651-2.203-6.151-5.449-6.151z" />
                      </svg>
                    </a>
                  )}
                  {member.socials.youtube && (
                    <a
                      href={member.socials.youtube}
                      target="_blank"
                      rel="noopener noreferrer"
                      aria-label="YouTube"
                      title="YouTube Channel"
                    >
                      <Youtube size={18} />
                    </a>
                  )}
                  {member.socials.github && (
                    <a
                      href={member.socials.github}
                      target="_blank"
                      rel="noopener noreferrer"
                      aria-label="GitHub Profile"
                      title="GitHub"
                    >
                      <Github size={18} />
                    </a>
                  )}
                  {member.socials.facebook && (
                    <a
                      href={member.socials.facebook}
                      target="_blank"
                      rel="noopener noreferrer"
                      aria-label="Facebook"
                      title="Facebook"
                    >
                      <Facebook size={18} />
                    </a>
                  )}
                  {member.socials.instagram && (
                    <a
                      href={member.socials.instagram}
                      target="_blank"
                      rel="noopener noreferrer"
                      aria-label="Instagram"
                      title="Instagram"
                    >
                      <Instagram size={18} />
                    </a>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>

        {onOpenTeamPage && (
          <div style={{ textAlign: 'center', marginTop: '3rem' }}>
            <button
              type="button"
              onClick={onOpenTeamPage}
              className="btn btn-primary"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.5rem',
                fontSize: '0.95rem',
                padding: '0.75rem 1.75rem'
              }}
            >
              Meet Founder & Engineering Leadership (Team Page) →
            </button>
          </div>
        )}
      </div>
    </section>
  );
};
