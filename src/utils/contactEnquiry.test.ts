import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { buildContactEnquiry } from './contactEnquiry.ts';

const root = join(dirname(fileURLToPath(import.meta.url)), '../..');

test('contact enquiries keep the Queries tab fields and fold timeline into the message', () => {
  const enquiry = buildContactEnquiry({
    name: '  Amina Shah  ',
    email: ' amina@example.com ',
    company: ' Northwind ',
    service: 'Web Development',
    message: '  Need a storefront. ',
    budget: ' $3,000 – $10,000 ',
    timeline: ' 2–3 Months '
  });

  assert.deepEqual(enquiry, {
    fullName: 'Amina Shah',
    email: 'amina@example.com',
    company: 'Northwind',
    service: 'Web Development',
    message: 'Need a storefront.\n\nTarget timeline: 2–3 Months',
    budget: '$3,000 – $10,000'
  });
});

test('optional contact fields stay unset instead of empty strings', () => {
  const enquiry = buildContactEnquiry({
    name: 'Amina',
    email: 'amina@example.com',
    company: '   ',
    service: '',
    message: 'Hello',
    budget: '',
    timeline: '   '
  });

  assert.equal(enquiry.company, undefined);
  assert.equal(enquiry.service, undefined);
  assert.equal(enquiry.budget, undefined);
  assert.equal(enquiry.message, 'Hello');
});

test('the contact page still submits through Firestore and not a new endpoint', () => {
  const source = readFileSync(join(root, 'src/components/ContactPage.tsx'), 'utf8');
  assert.match(source, /saveSubmissionToFirestore\(\s*buildContactEnquiry\(/);
  assert.equal(source.includes('data-netlify'), false);
  assert.equal(source.includes('fetch('), false);
  assert.match(source, /name="name"/);
  assert.match(source, /name="email"/);
  assert.match(source, /name="company"/);
  assert.match(source, /name="service"/);
  assert.match(source, /name="message"/);
  assert.match(source, /name="bot-field"/);
});
