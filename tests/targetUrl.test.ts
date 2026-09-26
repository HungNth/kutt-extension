import test from 'node:test';
import assert from 'node:assert/strict';
import {resolveTargetUrl, validateTargetUrl} from '../source/util/link.ts';

test('validateTargetUrl validates URLs strictly using the existing link validation policy', () => {
  assert.equal(validateTargetUrl('https://example.com/page'), true);
  assert.equal(
    validateTargetUrl('http://sub.domain.org:8080/path?query=1#hash'),
    true
  );
  assert.equal(validateTargetUrl('http://192.168.1.1/test'), true);

  // Rejected by existing validator policy
  assert.equal(validateTargetUrl(''), false);
  assert.equal(validateTargetUrl('   '), false);
  assert.equal(validateTargetUrl('not a url'), false);
  assert.equal(validateTargetUrl('ftp://example.com'), false);
  assert.equal(validateTargetUrl('chrome://extensions'), false);
  assert.equal(validateTargetUrl('http://localhost'), false);
});

test('resolveTargetUrl selects active tab URL if valid and returns empty string if invalid or absent', () => {
  assert.equal(
    resolveTargetUrl('https://example.com/from-tab'),
    'https://example.com/from-tab'
  );
  assert.equal(resolveTargetUrl('chrome://settings'), '');
  assert.equal(resolveTargetUrl(null), '');
  assert.equal(resolveTargetUrl(undefined), '');
  assert.equal(resolveTargetUrl('   '), '');
});
