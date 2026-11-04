import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, existsSync } from 'node:fs';
import { resolve } from 'node:path';

test('firebase-applet-config.json exists and contains required Firestore configuration', () => {
  const configPath = resolve(process.cwd(), 'firebase-applet-config.json');
  assert.equal(existsSync(configPath), true, 'firebase-applet-config.json should exist');

  const content = JSON.parse(readFileSync(configPath, 'utf8'));
  assert.ok(content.projectId, 'projectId must be defined');
  assert.ok(content.apiKey, 'apiKey must be defined');
  assert.ok(content.firestoreDatabaseId, 'firestoreDatabaseId must be defined');
});

test('firebase-blueprint.json defines SiteSection, ContactSubmission and paths', () => {
  const blueprintPath = resolve(process.cwd(), 'firebase-blueprint.json');
  assert.equal(existsSync(blueprintPath), true, 'firebase-blueprint.json should exist');

  const blueprint = JSON.parse(readFileSync(blueprintPath, 'utf8'));
  assert.ok(blueprint.entities.SiteSection, 'SiteSection entity should exist');
  assert.ok(blueprint.entities.ContactSubmission, 'ContactSubmission entity should exist');
  assert.ok(blueprint.firestore['/site_content/{sectionId}'], '/site_content path must be mapped');
  assert.ok(blueprint.firestore['/submissions/{submissionId}'], '/submissions path must be mapped');
});

test('firestore.rules is valid rules_version 2 with site_content and submissions match blocks', () => {
  const rulesPath = resolve(process.cwd(), 'firestore.rules');
  assert.equal(existsSync(rulesPath), true, 'firestore.rules should exist');

  const rules = readFileSync(rulesPath, 'utf8');
  assert.match(rules, /rules_version = '2';/);
  assert.match(rules, /match \/site_content\/\{sectionId\}/);
  assert.match(rules, /match \/submissions\/\{submissionId\}/);
});
