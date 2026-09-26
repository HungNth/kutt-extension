import test from 'node:test';
import assert from 'node:assert/strict';
import {isValidUrl} from '../source/util/link.ts';

test('isValidUrl validates target URLs supported by original link validator', () => {
  const validUrls = [
    'https://example.com',
    'https://subdomain.mycompany.org',
    'https://custom.online',
    'http://127.0.0.1',
    'http://192.168.1.100',
  ];

  for (const url of validUrls) {
    assert.equal(isValidUrl(url), true, `Expected valid: ${url}`);
  }

  const invalidUrls = [
    'not a url',
    'ftp://example.com',
    'javascript:alert(1)',
    'http://',
    'https://',
    '',
  ];

  for (const url of invalidUrls) {
    assert.equal(isValidUrl(url), false, `Expected invalid: ${url}`);
  }
});
