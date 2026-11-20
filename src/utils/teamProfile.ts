import type { TeamMemberData } from '../types';

export const DEFAULT_FOUNDER_BIO =
  "Visionary leadership driving digital excellence. Gauhar Axe founded Axe's Era Enterprises with a focus on crafting conversion-engineered web platforms, cutting-edge mobile apps, and iconic visual identities.";

export const DEFAULT_FOUNDER_SKILLS: readonly string[] = [
  'Full-Stack Engineering (React, Next.js, Node.js)',
  'Shopify & Headless E-Commerce',
  'WordPress & Custom Themes',
  'TypeScript & Cloud Architecture',
  'UI/UX & Brand Identity Systems',
  'Technical SEO & Conversion Optimization'
];

export const DEFAULT_MEMBER_SKILLS: readonly string[] = [
  'Full-Stack Web Engineering',
  'Modern UI/UX Architecture',
  'Performance & Core Web Vitals',
  'Scalable API Integration'
];

export function isFounderMember(member: Pick<TeamMemberData, 'id' | 'title'>): boolean {
  return member.id === 'gauhar-nadeem' || /\b(ceo|founder)\b/i.test(member.title || '');
}

export function sanitizeMemberSkills(skills: readonly string[] | undefined): string[] {
  if (!Array.isArray(skills)) return [];
  const seen = new Set<string>();
  const cleaned: string[] = [];

  for (const raw of skills) {
    if (typeof raw !== 'string') continue;
    const trimmed = raw.trim().replace(/\s+/g, ' ');
    if (!trimmed) continue;
    const key = trimmed.toLowerCase();
    if (seen.has(key)) continue;
    seen.add(key);
    cleaned.push(trimmed);
  }

  return cleaned;
}

export function parseSkillsInput(raw: string): string[] {
  if (!raw || !raw.trim()) return [];
  return sanitizeMemberSkills(raw.split(/[\n,]+/));
}

export function addMemberSkill(skills: readonly string[], candidate: string): string[] {
  const parsed = parseSkillsInput(candidate);
  if (parsed.length === 0) return sanitizeMemberSkills(skills);
  return sanitizeMemberSkills([...skills, ...parsed]);
}

export function removeMemberSkill(skills: readonly string[], skillToRemove: string): string[] {
  const target = skillToRemove.trim().toLowerCase();
  return sanitizeMemberSkills(skills).filter((skill) => skill.toLowerCase() !== target);
}

export function resolveMemberBiography(
  member: Pick<TeamMemberData, 'id' | 'name' | 'title' | 'bio'>
): string {
  const trimmedBio = (member.bio || '').trim();
  if (trimmedBio) return trimmedBio;
  if (isFounderMember(member)) return DEFAULT_FOUNDER_BIO;
  const roleLabel = (member.title || 'Digital Specialist').trim();
  const memberName = (member.name || 'Team Member').trim();
  return `${memberName} serves as ${roleLabel} at Axe's Era Enterprises, delivering high-precision digital platforms and reliable engineering execution.`;
}

export function resolveMemberSkills(
  member: Pick<TeamMemberData, 'id' | 'title' | 'skills'>
): string[] {
  const explicit = sanitizeMemberSkills(member.skills);
  if (explicit.length > 0) return explicit;
  return isFounderMember(member) ? [...DEFAULT_FOUNDER_SKILLS] : [...DEFAULT_MEMBER_SKILLS];
}
