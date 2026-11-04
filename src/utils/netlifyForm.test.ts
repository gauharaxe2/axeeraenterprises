import test from 'node:test';
import assert from 'node:assert/strict';
import { encodeContactForm, isNetlifyFormAccepted } from './netlifyForm.ts';

const successPage = '<!DOCTYPE html><body data-netlify-form="accepted"><h1>Your form submission has been received</h1></body>';
const spaShell = '<!DOCTYPE html><html><body><div id="root"></div></body></html>';
const skeleton = '<form data-form-skeleton="contact" data-netlify="true"></form>';

test('accepts the dedicated success page and an empty 2xx body', () => {
  assert.equal(isNetlifyFormAccepted(200, successPage), true);
  assert.equal(isNetlifyFormAccepted(200, ''), true);
  assert.equal(isNetlifyFormAccepted(204, ''), true);
});

test('rejects the SPA shell, the static skeleton, and error statuses', () => {
  assert.equal(isNetlifyFormAccepted(200, spaShell), false);
  assert.equal(isNetlifyFormAccepted(404, spaShell), false);
  assert.equal(isNetlifyFormAccepted(200, skeleton), false);
  assert.equal(isNetlifyFormAccepted(500, ''), false);
  assert.equal(isNetlifyFormAccepted(404, 'Not found'), false);
});

test('posts url-encoded fields including form-name and the honeypot', () => {
  const body = encodeContactForm({
    name: 'Axe & Co',
    email: 'person@example.com',
    company: 'Era',
    service: 'web-development',
    message: 'Hello there',
    botField: ''
  });
  const params = new URLSearchParams(body);
  assert.equal(params.get('form-name'), 'contact');
  assert.equal(params.get('name'), 'Axe & Co');
  assert.equal(params.get('email'), 'person@example.com');
  assert.equal(params.get('company'), 'Era');
  assert.equal(params.get('service'), 'web-development');
  assert.equal(params.get('message'), 'Hello there');
  assert.equal(params.get('bot-field'), '');
  assert.equal(body.includes(' '), false);
});
