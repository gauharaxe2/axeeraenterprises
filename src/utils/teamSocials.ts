import type { SocialPlatform, TeamExtraLink, TeamMemberData } from '../types';

export interface SocialPlatformOption {
  value: SocialPlatform;
  label: string;
  placeholder: string;
}

export const SOCIAL_PLATFORM_OPTIONS: SocialPlatformOption[] = [
  { value: 'facebook', label: 'Facebook', placeholder: 'https://www.facebook.com/your-page' },
  { value: 'instagram', label: 'Instagram', placeholder: 'https://www.instagram.com/your-handle' },
  { value: 'youtube', label: 'YouTube', placeholder: 'https://www.youtube.com/@your-channel' },
  { value: 'linkedin', label: 'LinkedIn', placeholder: 'https://www.linkedin.com/in/your-profile' },
  { value: 'twitter', label: 'X (Twitter)', placeholder: 'https://twitter.com/your-handle' },
  { value: 'upwork', label: 'Upwork', placeholder: 'https://www.upwork.com/freelancers/...' },
  { value: 'github', label: 'GitHub', placeholder: 'https://github.com/your-username' },
  { value: 'website', label: 'Website / Portfolio', placeholder: 'https://yourwebsite.com' }
];

export type PrimarySocialKey = keyof TeamMemberData['socials'];
export type AccountLinkPreset = PrimarySocialKey | 'website';

export interface AccountPresetMeta {
  preset: AccountLinkPreset;
  platform: SocialPlatform;
  label: string;
  placeholder: string;
}

export const ACCOUNT_LINK_PRESETS: AccountPresetMeta[] = [
  {
    preset: 'instagram',
    platform: 'instagram',
    label: 'Instagram (CEO Account)',
    placeholder: 'https://www.instagram.com/gauharaxe'
  },
  {
    preset: 'instagramCompany',
    platform: 'instagram',
    label: 'Instagram (Company Page)',
    placeholder: 'https://www.instagram.com/axeseraenterprises'
  },
  {
    preset: 'linkedin',
    platform: 'linkedin',
    label: 'LinkedIn (CEO Account)',
    placeholder: 'https://www.linkedin.com/in/gauharaxe/'
  },
  {
    preset: 'linkedinCompany',
    platform: 'linkedin',
    label: 'LinkedIn (Company Page)',
    placeholder: 'https://www.linkedin.com/company/axes-era-enterprises/'
  },
  {
    preset: 'facebook',
    platform: 'facebook',
    label: 'Facebook',
    placeholder: 'https://www.facebook.com/your-page'
  },
  {
    preset: 'twitter',
    platform: 'twitter',
    label: 'X (Twitter)',
    placeholder: 'https://twitter.com/your-handle'
  },
  {
    preset: 'youtube',
    platform: 'youtube',
    label: 'YouTube',
    placeholder: 'https://www.youtube.com/@your-channel'
  },
  {
    preset: 'upwork',
    platform: 'upwork',
    label: 'Upwork',
    placeholder: 'https://www.upwork.com/freelancers/...'
  },
  {
    preset: 'github',
    platform: 'github',
    label: 'GitHub / Portfolio',
    placeholder: 'https://github.com/your-username'
  },
  {
    preset: 'website',
    platform: 'website',
    label: 'Website / Custom Link',
    placeholder: 'https://yourwebsite.com'
  }
];

export interface EditableAccountLink {
  id: string;
  preset: AccountLinkPreset;
  platform: SocialPlatform;
  label: string;
  url: string;
}

const PRIMARY_ORDER: Array<{
  key: PrimarySocialKey;
  platform: SocialPlatform;
  label: string;
  ceoLabel?: string;
  accountScope?: 'ceo' | 'company';
}> = [
  { key: 'linkedin', platform: 'linkedin', label: 'LinkedIn Profile', ceoLabel: 'LinkedIn (CEO)', accountScope: 'ceo' },
  { key: 'linkedinCompany', platform: 'linkedin', label: 'LinkedIn (Company)', accountScope: 'company' },
  { key: 'twitter', platform: 'twitter', label: 'X (Twitter)' },
  { key: 'upwork', platform: 'upwork', label: 'Upwork Agency Profile' },
  { key: 'youtube', platform: 'youtube', label: 'YouTube' },
  { key: 'facebook', platform: 'facebook', label: 'Facebook' },
  { key: 'instagram', platform: 'instagram', label: 'Instagram', ceoLabel: 'Instagram (CEO)', accountScope: 'ceo' },
  { key: 'instagramCompany', platform: 'instagram', label: 'Instagram (Company)', accountScope: 'company' },
  { key: 'github', platform: 'github', label: 'GitHub Profile' }
];

export interface ResolvedSocialLink {
  id: string;
  platform: SocialPlatform;
  label: string;
  url: string;
  isExtra: boolean;
  badge?: 'CEO' | 'Co';
}

export function getAccountPresetMeta(preset: AccountLinkPreset): AccountPresetMeta {
  return ACCOUNT_LINK_PRESETS.find((item) => item.preset === preset) || ACCOUNT_LINK_PRESETS[ACCOUNT_LINK_PRESETS.length - 1];
}

export function platformDefaultLabel(platform: SocialPlatform): string {
  const found = SOCIAL_PLATFORM_OPTIONS.find((item) => item.value === platform);
  return found ? found.label : 'Profile Link';
}

export function normalizeSocialUrl(rawUrl: string | undefined): string {
  if (!rawUrl) return '';
  const trimmed = rawUrl.trim();
  if (!trimmed) return '';
  if (/^(javascript|data|vbscript):/i.test(trimmed)) return '';
  if (/^https?:\/\//i.test(trimmed)) return trimmed;
  return `https://${trimmed.replace(/^\/+/, '')}`;
}

export function memberToEditableLinks(
  member: Pick<TeamMemberData, 'socials' | 'extraLinks'>
): EditableAccountLink[] {
  const result: EditableAccountLink[] = [];
  const socials = member.socials ?? {};

  for (const meta of ACCOUNT_LINK_PRESETS) {
    if (meta.preset === 'website') continue;
    const raw = socials[meta.preset];
    if (typeof raw === 'string' && raw.trim().length > 0) {
      result.push({
        id: `slot-${meta.preset}`,
        preset: meta.preset,
        platform: meta.platform,
        label: meta.label,
        url: raw
      });
    }
  }

  for (const extra of member.extraLinks ?? []) {
    if (!extra.url || !extra.url.trim()) continue;
    const platform = extra.platform || 'website';
    result.push({
      id: extra.id || `extra-${platform}-${result.length}`,
      preset: (['instagram', 'linkedin', 'facebook', 'twitter', 'youtube', 'upwork', 'github'].includes(platform)
        ? platform
        : 'website') as AccountLinkPreset,
      platform,
      label: extra.label?.trim() || platformDefaultLabel(platform),
      url: extra.url
    });
  }

  return result;
}

export function createEditableAccountLink(
  preset: AccountLinkPreset,
  customLabel?: string,
  url?: string
): EditableAccountLink {
  const meta = getAccountPresetMeta(preset);
  return {
    id: `link-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
    preset: meta.preset,
    platform: meta.platform,
    label: customLabel?.trim() || meta.label,
    url: url ?? ''
  };
}

export function removeEditableAccountLink(
  links: EditableAccountLink[],
  id: string
): EditableAccountLink[] {
  return links.filter((item) => item.id !== id);
}

export function editableLinksToMemberSocials(links: EditableAccountLink[]): {
  socials: TeamMemberData['socials'];
  extraLinks: TeamExtraLink[];
} {
  const socials: TeamMemberData['socials'] = {
    linkedin: '',
    linkedinCompany: '',
    twitter: '',
    upwork: '',
    youtube: '',
    facebook: '',
    instagram: '',
    instagramCompany: '',
    github: ''
  };
  const extraLinks: TeamExtraLink[] = [];

  for (let i = 0; i < links.length; i += 1) {
    const item = links[i];
    const normalized = normalizeSocialUrl(item.url);
    if (!normalized) continue;

    const meta = getAccountPresetMeta(item.preset);
    const trimmedLabel = (item.label || '').trim();
    const isDefaultPresetLabel = !trimmedLabel || trimmedLabel === meta.label;

    if (item.preset !== 'website' && !socials[item.preset] && isDefaultPresetLabel) {
      socials[item.preset] = normalized;
    } else {
      extraLinks.push({
        id: item.id && !item.id.startsWith('slot-') ? item.id : `extra-${item.platform}-${i}-${Date.now()}`,
        platform: item.platform || meta.platform,
        label: trimmedLabel || platformDefaultLabel(item.platform || meta.platform),
        url: normalized
      });
    }
  }

  return { socials, extraLinks };
}

export function collectTeamSocialLinks(
  member: Pick<TeamMemberData, 'socials' | 'extraLinks'> & { id?: string; title?: string }
): ResolvedSocialLink[] {
  const resolved: ResolvedSocialLink[] = [];
  const socials = member.socials ?? {};
  const isCeo = member.id === 'gauhar-nadeem' || /\b(ceo|founder)\b/i.test(member.title || '');
  const hasLinkedinCompany = Boolean(normalizeSocialUrl(socials.linkedinCompany));
  const hasInstagramCompany = Boolean(normalizeSocialUrl(socials.instagramCompany));

  for (const entry of PRIMARY_ORDER) {
    const normalized = normalizeSocialUrl(socials[entry.key]);
    if (!normalized) continue;

    const hasPairedCompany =
      (entry.key === 'linkedin' && hasLinkedinCompany) ||
      (entry.key === 'instagram' && hasInstagramCompany);

    const label =
      entry.ceoLabel && (isCeo || hasPairedCompany)
        ? entry.ceoLabel
        : entry.label;

    let badge: 'CEO' | 'Co' | undefined;
    if (entry.accountScope === 'company') {
      badge = 'Co';
    } else if (entry.accountScope === 'ceo' && hasPairedCompany) {
      badge = 'CEO';
    }

    resolved.push({
      id: `primary-${entry.key}`,
      platform: entry.platform,
      label,
      url: normalized,
      isExtra: false,
      badge
    });
  }

  for (const extra of member.extraLinks ?? []) {
    const normalized = normalizeSocialUrl(extra.url);
    if (!normalized) continue;
    const label = extra.label?.trim() || platformDefaultLabel(extra.platform);
    resolved.push({
      id: extra.id || `extra-${extra.platform}-${resolved.length}`,
      platform: extra.platform,
      label,
      url: normalized,
      isExtra: true
    });
  }

  return resolved;
}

export function sanitizeExtraLinks(links: TeamExtraLink[] | undefined): TeamExtraLink[] {
  if (!Array.isArray(links)) return [];
  return links
    .map((item, idx) => ({
      id: item.id || `extra-${Date.now()}-${idx}`,
      platform: item.platform || 'facebook',
      label: (item.label || '').trim(),
      url: normalizeSocialUrl(item.url)
    }))
    .filter((item) => item.url.length > 0);
}

export function sanitizePrimarySocials(
  socials: TeamMemberData['socials'] | undefined
): TeamMemberData['socials'] {
  const s = socials ?? {};
  return {
    linkedin: normalizeSocialUrl(s.linkedin),
    linkedinCompany: normalizeSocialUrl(s.linkedinCompany),
    twitter: normalizeSocialUrl(s.twitter),
    upwork: normalizeSocialUrl(s.upwork),
    youtube: normalizeSocialUrl(s.youtube),
    facebook: normalizeSocialUrl(s.facebook),
    instagram: normalizeSocialUrl(s.instagram),
    instagramCompany: normalizeSocialUrl(s.instagramCompany),
    github: normalizeSocialUrl(s.github)
  };
}
