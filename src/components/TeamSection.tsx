import React from 'react';
import { TeamMemberData } from '../types';
import { useLanguage } from '../context/LanguageContext';
import { collectTeamSocialLinks } from '../utils/teamSocials';
import { SocialPlatformIcon } from './SocialPlatformIcon';

interface TeamSectionProps {
  team: TeamMemberData[];
  onOpenTeamPage?: () => void;
}

export const TeamSection: React.FC<TeamSectionProps> = ({ team, onOpenTeamPage }) => {
  const { strings } = useLanguage();
  const isSingle = team.length <= 1;

  return (
    <section id="team" className="team">
      <div className="container">
        <div className="section-header">
          <h2>{strings.team.sectionTitle}</h2>
          <p>{strings.team.sectionSubtitle}</p>
        </div>

        <div className={isSingle ? 'single-member' : 'services-grid'}>
          {team.map((member) => {
            const links = collectTeamSocialLinks(member);
            return (
              <div key={member.id || member.name} className="team-member">
                <div className="member-image">
                  <img src={member.imageUrl} alt={`${member.name} - ${member.title}`} />
                </div>

                <div className="member-info">
                  <h3>{member.name}</h3>
                  <p>{member.title}</p>
                  <p style={{ color: 'var(--text-light)', fontSize: '0.95rem', fontWeight: 400 }}>
                    {member.bio}
                  </p>

                  {links.length > 0 && (
                    <div className="member-social">
                      {links.map((item) => (
                        <a
                          key={item.id}
                          href={item.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          aria-label={item.label}
                          title={item.label}
                        >
                          <SocialPlatformIcon platform={item.platform} size={18} />
                          {item.badge && (
                            <span className="member-social-badge" aria-hidden="true">
                              {item.badge}
                            </span>
                          )}
                        </a>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {onOpenTeamPage && (
          <div style={{ textAlign: 'center', marginTop: '3rem' }}>
            <button
              type="button"
              onClick={onOpenTeamPage}
              className="btn btn-outline"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.5rem',
                fontSize: '0.95rem',
                padding: '0.75rem 1.75rem'
              }}
            >
              {strings.team.cta}
            </button>
          </div>
        )}
      </div>
    </section>
  );
};
