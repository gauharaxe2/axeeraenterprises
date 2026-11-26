import test from 'node:test';
import assert from 'node:assert/strict';
import {
  buildCaseStudyHash,
  collectProjectGallery,
  createDuplicatedProject,
  filterAdminProjects,
  findProjectByRouteId,
  getProjectSlug,
  reorderProjectList,
  resolveProjectDetails,
  resolveProjectStatus,
  resolveProjectType,
  slugifyProjectTitle
} from './projectUtils';
import { projectsData } from '../data/projects';

test('slugifyProjectTitle and buildCaseStudyHash generate clean route URLs', () => {
  assert.equal(slugifyProjectTitle('EstateCRM Platform 2.0!'), 'estatecrm-platform-2-0');
  assert.equal(
    buildCaseStudyHash({ id: 'estate-crm', slug: 'estate-crm', title: 'EstateCRM Platform' }),
    '/#case-study-estate-crm'
  );
  assert.equal(getProjectSlug({ id: 'custom-1', title: 'My Product' }), 'custom-1');
});

test('resolveProjectType and resolveProjectStatus preserve explicit choices and infer sensibly', () => {
  assert.equal(resolveProjectType({ id: 'x', category: 'saas' }), 'digital-product');
  assert.equal(
    resolveProjectType({ id: 'x', category: 'saas', projectType: 'case-study' }),
    'case-study'
  );
  assert.equal(resolveProjectStatus('beta'), 'beta');
  assert.equal(resolveProjectStatus(undefined), 'live');
});

test('resolveProjectDetails hydrates legacy slim project records using seed and smart fallbacks', () => {
  const legacyEstate = {
    id: 'estate-crm',
    title: 'EstateCRM Platform',
    subtitle: 'Real Estate CRM',
    category: 'saas' as const,
    metric: '+240% Pipeline Velocity',
    link: 'https://real-estate-crm-ps3u.vercel.app/',
    imageUrl: '/images/estate-crm.png'
  };
  const resolvedSeed = resolveProjectDetails(legacyEstate);
  assert.equal(resolvedSeed.projectType, 'digital-product');
  assert.ok(resolvedSeed.challenge.length > 20);
  assert.ok(resolvedSeed.solution.length > 20);
  assert.ok(resolvedSeed.keyFeatures.length >= 3);
  assert.ok(resolvedSeed.outcomes.length >= 2);

  const customProject = {
    id: 'custom-launch',
    title: 'FinFlow Portal',
    subtitle: 'Automated Treasury UI',
    category: 'web' as const,
    projectType: 'digital-product' as const,
    metric: '50ms Latency',
    link: 'https://example.com',
    imageUrl: '',
    description: 'Treasury portal for modern CFOs.',
    tags: ['TypeScript', 'Cloudflare']
  };
  const resolvedCustom = resolveProjectDetails(customProject);
  assert.equal(resolvedCustom.overview, 'Treasury portal for modern CFOs.');
  assert.equal(resolvedCustom.outcomes[0].value, '50ms Latency');
  assert.ok(resolvedCustom.solution.includes('TypeScript'));
});

test('collectProjectGallery deduplicates primary and gallery images and drops unsafe schemes', () => {
  const gallery = collectProjectGallery({
    imageUrl: 'https://example.com/a.jpg',
    galleryImages: [
      'https://example.com/a.jpg',
      'javascript:alert(1)',
      '/images/estate-crm.png',
      'https://example.com/b.webp'
    ]
  });
  assert.deepEqual(gallery, [
    'https://example.com/a.jpg',
    '/images/estate-crm.png',
    'https://example.com/b.webp'
  ]);
});

test('reorderProjectList, createDuplicatedProject, filterAdminProjects, and findProjectByRouteId work accurately', () => {
  const reordered = reorderProjectList(projectsData, projectsData[1].id, 'up');
  assert.equal(reordered[0].id, projectsData[1].id);
  assert.equal(reordered[1].id, projectsData[0].id);

  const dup = createDuplicatedProject(projectsData[0], 1700000000123);
  assert.notEqual(dup.id, projectsData[0].id);
  assert.equal(dup.featured, false);
  assert.match(dup.title, /\(Copy\)$/);

  const digitalProducts = filterAdminProjects(projectsData, { typeFilter: 'digital-product' });
  assert.ok(digitalProducts.length >= 2);
  assert.ok(digitalProducts.every((p) => resolveProjectType(p) === 'digital-product'));

  const found = findProjectByRouteId(projectsData, 'SHOPAXE-SHOPIFY-STORE');
  assert.equal(found?.id, 'shopaxe-shopify-store');
});
