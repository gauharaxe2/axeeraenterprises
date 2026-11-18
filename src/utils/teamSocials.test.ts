import test from 'node:test';
import assert from 'node:assert/strict';
import {
  collectTeamSocialLinks,
  createEditableAccountLink,
  editableLinksToMemberSocials,
  memberToEditableLinks,
  normalizeSocialUrl,
  platformDefaultLabel,
  removeEditableAccountLink,
  sanitizeExtraLinks,
  sanitizePrimarySocials
} from './teamSocials';

test('normalizeSocialUrl trims, prepends https for bare domains, and rejects unsafe schemes', () => {
  assert.equal(normalizeSocialUrl('  https://www.facebook.com/gauharaxe  '), 'https://www.facebook.com/gauharaxe');
  assert.equal(normalizeSocialUrl('instagram.com/gauharaxe'), 'https://instagram.com/gauharaxe');
  assert.equal(normalizeSocialUrl('   '), '');
  assert.equal(normalizeSocialUrl('javascript:alert(1)'), '');
});

test('collectTeamSocialLinks includes primary facebook/instagram/youtube/github and extraLinks in order', () => {
  const links = collectTeamSocialLinks({
    id: 'gauhar-nadeem',
    title: 'CEO & Founder',
    socials: {
      linkedin: 'https://www.linkedin.com/in/gauharaxe/',
      linkedinCompany: 'https://www.linkedin.com/company/axes-era-enterprises/',
      facebook: 'https://www.facebook.com/gauharaxe',
      instagram: 'https://www.instagram.com/gauharaxe',
      instagramCompany: 'https://www.instagram.com/axeseraenterprises',
      youtube: 'https://www.youtube.com/@gauharaxe',
      github: '   '
    },
    extraLinks: [
      {
        id: 'fb-agency',
        platform: 'facebook',
        label: 'Agency Facebook Page',
        url: 'https://www.facebook.com/axeseraenterprises'
      },
      {
        id: 'empty-row',
        platform: 'website',
        label: 'Empty',
        url: '   '
      }
    ]
  });

  assert.equal(links.length, 7);
  assert.deepEqual(
    links.map((item) => ({
      platform: item.platform,
      label: item.label,
      url: item.url,
      isExtra: item.isExtra,
      badge: item.badge
    })),
    [
      {
        platform: 'linkedin',
        label: 'LinkedIn (CEO)',
        url: 'https://www.linkedin.com/in/gauharaxe/',
        isExtra: false,
        badge: 'CEO'
      },
      {
        platform: 'linkedin',
        label: 'LinkedIn (Company)',
        url: 'https://www.linkedin.com/company/axes-era-enterprises/',
        isExtra: false,
        badge: 'Co'
      },
      {
        platform: 'youtube',
        label: 'YouTube',
        url: 'https://www.youtube.com/@gauharaxe',
        isExtra: false,
        badge: undefined
      },
      {
        platform: 'facebook',
        label: 'Facebook',
        url: 'https://www.facebook.com/gauharaxe',
        isExtra: false,
        badge: undefined
      },
      {
        platform: 'instagram',
        label: 'Instagram (CEO)',
        url: 'https://www.instagram.com/gauharaxe',
        isExtra: false,
        badge: 'CEO'
      },
      {
        platform: 'instagram',
        label: 'Instagram (Company)',
        url: 'https://www.instagram.com/axeseraenterprises',
        isExtra: false,
        badge: 'Co'
      },
      {
        platform: 'facebook',
        label: 'Agency Facebook Page',
        url: 'https://www.facebook.com/axeseraenterprises',
        isExtra: true,
        badge: undefined
      }
    ]
  );
});

test('memberToEditableLinks, createEditableAccountLink, removeEditableAccountLink, and editableLinksToMemberSocials round-trip cleanly', () => {
  const initialLinks = memberToEditableLinks({
    socials: {
      linkedin: 'https://www.linkedin.com/in/gauharaxe/',
      twitter: 'https://twitter.com/gauharaxe',
      facebook: 'https://www.facebook.com/gauharaxe',
      instagram: 'https://www.instagram.com/gauharaxe'
    },
    extraLinks: [
      {
        id: 'fb-2',
        platform: 'facebook',
        label: 'Agency Facebook Page',
        url: 'https://www.facebook.com/axeseraenterprises'
      }
    ]
  });

  assert.equal(initialLinks.length, 5);

  // Create company Instagram + company LinkedIn links
  const withCompanyIg = [
    ...initialLinks,
    createEditableAccountLink('instagramCompany', '', 'instagram.com/axeseraenterprises'),
    createEditableAccountLink('linkedinCompany', '', 'https://www.linkedin.com/company/axes-era-enterprises/')
  ];

  // Delete Twitter link
  const afterDeleteTwitter = removeEditableAccountLink(withCompanyIg, 'slot-twitter');

  const saved = editableLinksToMemberSocials(afterDeleteTwitter);
  assert.equal(saved.socials.twitter, '');
  assert.equal(saved.socials.instagram, 'https://www.instagram.com/gauharaxe');
  assert.equal(saved.socials.instagramCompany, 'https://instagram.com/axeseraenterprises');
  assert.equal(saved.socials.linkedin, 'https://www.linkedin.com/in/gauharaxe/');
  assert.equal(saved.socials.linkedinCompany, 'https://www.linkedin.com/company/axes-era-enterprises/');
  assert.equal(saved.socials.facebook, 'https://www.facebook.com/gauharaxe');
  assert.equal(saved.extraLinks.length, 1);
  assert.equal(saved.extraLinks[0].label, 'Agency Facebook Page');
  assert.equal(saved.extraLinks[0].url, 'https://www.facebook.com/axeseraenterprises');
});

test('sanitizeExtraLinks and sanitizePrimarySocials clean CEO and company URLs cleanly', () => {
  const cleanedExtras = sanitizeExtraLinks([
    { id: '1', platform: 'facebook', label: '  Studio FB  ', url: ' facebook.com/studio ' },
    { id: '2', platform: 'instagram', label: 'Empty', url: '   ' }
  ]);
  assert.deepEqual(cleanedExtras, [
    { id: '1', platform: 'facebook', label: 'Studio FB', url: 'https://facebook.com/studio' }
  ]);

  const cleanedPrimary = sanitizePrimarySocials({
    facebook: '  https://www.facebook.com/gauharaxe ',
    instagram: 'instagram.com/gauharaxe',
    instagramCompany: ' https://www.instagram.com/axeseraenterprises ',
    linkedin: 'https://www.linkedin.com/in/gauharaxe/',
    linkedinCompany: 'linkedin.com/company/axes-era-enterprises',
    twitter: ''
  });
  assert.equal(cleanedPrimary.facebook, 'https://www.facebook.com/gauharaxe');
  assert.equal(cleanedPrimary.instagram, 'https://instagram.com/gauharaxe');
  assert.equal(cleanedPrimary.instagramCompany, 'https://www.instagram.com/axeseraenterprises');
  assert.equal(cleanedPrimary.linkedin, 'https://www.linkedin.com/in/gauharaxe/');
  assert.equal(cleanedPrimary.linkedinCompany, 'https://linkedin.com/company/axes-era-enterprises');
  assert.equal(cleanedPrimary.twitter, '');
});

test('platformDefaultLabel returns readable names', () => {
  assert.equal(platformDefaultLabel('facebook'), 'Facebook');
  assert.equal(platformDefaultLabel('instagram'), 'Instagram');
  assert.equal(platformDefaultLabel('website'), 'Website / Portfolio');
});
