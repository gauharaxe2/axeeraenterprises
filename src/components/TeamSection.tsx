import React from 'react';
import { ArrowRight } from 'lucide-react';
import { TeamMemberData } from '../types';
import { useLanguage } from '../context/LanguageContext';
import { collectTeamSocialLinks } from '../utils/teamSocials';
import { resolveMemberBiography } from '../utils/teamProfile';
import { SocialPlatformIcon } from './SocialPlatformIcon';

interface TeamSectionProps {
  team: TeamMemberData[];
  onOpenTeamPage?: (memberId?: string) => void;
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
          {team.map((member, index) => {
            const links = collectTeamSocialLinks(member);
            const targetHref =
              index > 0 && member.id ? `/team#member-${encodeURIComponent(member.id)}` : '/team';

            return (
              <div
                key={member.id || member.name}
                className={onOpenTeamPage ? 'team-member team-member-clickable' : 'team-member'}
              >
                <div className="member-image">
                  <img src={member.imageUrl} alt={`${member.name} - ${member.title}`} />
                </div>

                <div className="member-info">
                  <h3>
                    {onOpenTeamPage ? (
                      <a
                        href={targetHref}
                        className="team-member-card-link"
                        aria-label={`${member.name} — ${member.title}. View team member page`}
                        onClick={(event) => {
                          if (
                            event.metaKey ||
                            event.ctrlKey ||
                            event.shiftKey ||
                            event.altKey ||
                            event.button !== 0
                          ) {
                            return;
                          }
                          event.preventDefault();
                          onOpenTeamPage(member.id);
                        }}
                      >
                        {member.name}
                      </a>
                    ) : (
                      member.name
                    )}
                  </h3>
                  <p>{member.title}</p>
                  <p style={{ color: 'var(--text-light)', fontSize: '0.95rem', fontWeight: 400 }}>
                    {resolveMemberBiography(member)}
                  </p>

                  {onOpenTeamPage && (
                    <span className="team-member-more" aria-hidden="true">
                      View Team Profile <ArrowRight size={15} />
                    </span>
                  )}

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
              onClick={() => onOpenTeamPage()}
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
