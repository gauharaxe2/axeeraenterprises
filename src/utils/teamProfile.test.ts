import test from 'node:test';
import assert from 'node:assert/strict';
import {
  DEFAULT_FOUNDER_BIO,
  DEFAULT_FOUNDER_SKILLS,
  DEFAULT_MEMBER_SKILLS,
  addMemberSkill,
  isFounderMember,
  parseSkillsInput,
  removeMemberSkill,
  resolveMemberBiography,
  resolveMemberSkills,
  sanitizeMemberSkills
} from './teamProfile';

test('sanitizeMemberSkills trims whitespace and deduplicates case-insensitively', () => {
  assert.deepEqual(
    sanitizeMemberSkills(['  React 19  ', 'TypeScript', 'react 19', '', '   ', 'Shopify   Liquid']),
    ['React 19', 'TypeScript', 'Shopify Liquid']
  );
  assert.deepEqual(sanitizeMemberSkills(undefined), []);
});

test('parseSkillsInput, addMemberSkill, and removeMemberSkill manage specialization lists cleanly', () => {
  const parsed = parseSkillsInput('Next.js 15, Tailwind CSS\nCloudflare Workers, next.js 15');
  assert.deepEqual(parsed, ['Next.js 15', 'Tailwind CSS', 'Cloudflare Workers']);

  const added = addMemberSkill(parsed, 'PostgreSQL, tailwind css');
  assert.deepEqual(added, ['Next.js 15', 'Tailwind CSS', 'Cloudflare Workers', 'PostgreSQL']);

  const removed = removeMemberSkill(added, 'Tailwind CSS');
  assert.deepEqual(removed, ['Next.js 15', 'Cloudflare Workers', 'PostgreSQL']);
});

test('resolveMemberBiography prefers explicit bio and falls back cleanly for founder and other members', () => {
  assert.equal(
    resolveMemberBiography({
      id: 'gauhar-nadeem',
      name: 'Gauhar Nadeem',
      title: 'CEO & Founder',
      bio: 'Custom founder biography.'
    }),
    'Custom founder biography.'
  );

  assert.equal(
    resolveMemberBiography({
      id: 'gauhar-nadeem',
      name: 'Gauhar Nadeem',
      title: 'CEO & Founder',
      bio: '   '
    }),
    DEFAULT_FOUNDER_BIO
  );

  assert.equal(
    resolveMemberBiography({
      id: 'eng-1',
      name: 'Ayesha Khan',
      title: 'Lead UI/UX Architect',
      bio: ''
    }),
    "Ayesha Khan serves as Lead UI/UX Architect at Axe's Era Enterprises, delivering high-precision digital platforms and reliable engineering execution."
  );
});

test('resolveMemberSkills returns explicit skills when provided and falls back by role when omitted', () => {
  assert.equal(isFounderMember({ id: 'gauhar-nadeem', title: 'CEO & Founder' }), true);
  assert.equal(isFounderMember({ id: 'eng-2', title: 'Senior Backend Engineer' }), false);

  assert.deepEqual(
    resolveMemberSkills({
      id: 'eng-2',
      title: 'Senior Backend Engineer',
      skills: ['Node.js', 'PostgreSQL', 'GraphQL']
    }),
    ['Node.js', 'PostgreSQL', 'GraphQL']
  );

  assert.deepEqual(
    resolveMemberSkills({
      id: 'gauhar-nadeem',
      title: 'CEO & Founder',
      skills: undefined
    }),
    [...DEFAULT_FOUNDER_SKILLS]
  );

  assert.deepEqual(
    resolveMemberSkills({
      id: 'eng-2',
      title: 'Senior Backend Engineer',
      skills: []
    }),
    [...DEFAULT_MEMBER_SKILLS]
  );
});
