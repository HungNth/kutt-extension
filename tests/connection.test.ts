import test from 'node:test';
import assert from 'node:assert/strict';
import {
  normalizeKuttInstanceUrl,
  isValidKuttInstanceUrl,
  isConfiguredConnection,
  getConnectionConfig,
  getStoredConnectionConfig,
  applyConnectionVerification,
} from '../source/util/connection.ts';

test('normalizeKuttInstanceUrl accepts valid HTTPS origins with optional ports and strips trailing slash', () => {
  assert.equal(
    normalizeKuttInstanceUrl('https://kutt.mycompany.internal'),
    'https://kutt.mycompany.internal'
  );
  assert.equal(
    normalizeKuttInstanceUrl('https://kutt.mycompany.internal/'),
    'https://kutt.mycompany.internal'
  );
  assert.equal(
    normalizeKuttInstanceUrl('https://kutt.mydomain.com:8443'),
    'https://kutt.mydomain.com:8443'
  );
  assert.equal(
    normalizeKuttInstanceUrl('https://kutt.mydomain.com:8443/'),
    'https://kutt.mydomain.com:8443'
  );
});

test('normalizeKuttInstanceUrl rejects HTTP, subpaths, query strings, fragments, credentials, and invalid URLs', () => {
  const invalid = [
    '',
    '   ',
    'http://localhost:3000',
    'http://127.0.0.1:3000',
    'http://kutt.it',
    'https://example.com/kutt',
    'https://example.com/kutt/',
    'https://example.com:8443/api',
    'https://example.com?query=1',
    'https://example.com#hash',
    'https://user:pass@example.com',
    'not a url',
    'ftp://example.com',
    'javascript:alert(1)',
  ];

  for (const item of invalid) {
    assert.equal(
      normalizeKuttInstanceUrl(item),
      null,
      `Expected rejection for: ${item}`
    );
    assert.equal(
      isValidKuttInstanceUrl(item),
      false,
      `Expected isValid=false for: ${item}`
    );
  }
});

test('isConfiguredConnection requires both normalized HTTPS URL and non-empty API key', () => {
  assert.equal(
    isConfiguredConnection({
      host: 'https://kutt.custom.online',
      apikey: 'any-valid-key-or-token',
    }),
    true
  );

  // Missing or empty host
  assert.equal(isConfiguredConnection({apikey: '40-char-key-here'}), false);
  assert.equal(
    isConfiguredConnection({host: '', apikey: '40-char-key-here'}),
    false
  );
  assert.equal(
    isConfiguredConnection({host: '   ', apikey: '40-char-key-here'}),
    false
  );

  // Invalid host (HTTP or path)
  assert.equal(
    isConfiguredConnection({host: 'http://localhost:3000', apikey: 'key'}),
    false
  );
  assert.equal(
    isConfiguredConnection({
      host: 'https://example.com/subpath',
      apikey: 'key',
    }),
    false
  );

  // Missing or empty API key
  assert.equal(
    isConfiguredConnection({host: 'https://kutt.example.com'}),
    false
  );
  assert.equal(
    isConfiguredConnection({host: 'https://kutt.example.com', apikey: ''}),
    false
  );
  assert.equal(
    isConfiguredConnection({host: 'https://kutt.example.com', apikey: '   '}),
    false
  );
});

test('getConnectionConfig returns null when unconfigured and parsed connection when valid without any default fallback', () => {
  assert.equal(getConnectionConfig(undefined), null);
  assert.equal(getConnectionConfig({}), null);
  assert.equal(getConnectionConfig({apikey: 'some-key'}), null);
  assert.equal(getConnectionConfig({host: 'https://kutt.it'}), null);

  const valid = getConnectionConfig({
    host: 'https://kutt.example.com:8443/',
    apikey: '  secret-token  ',
  });

  assert.deepEqual(valid, {
    hostUrl: 'https://kutt.example.com:8443',
    hostDomain: 'kutt.example.com:8443',
    apikey: 'secret-token',
  });
});

test('applyConnectionVerification atomically commits connection and user account data upon success', () => {
  const currentSettings = {
    history: true,
    reuse: false,
  };

  const newUserData = {
    email: 'admin@instance.internal',
    domains: [
      {
        id: 'dom_1',
        address: 'short.internal',
        homepage: 'https://short.internal',
        banned: false,
        created_at: '2026-01-01',
        updated_at: '2026-01-01',
      },
    ],
  };

  const updated = applyConnectionVerification({
    currentSettings,
    verifiedHostUrl: 'https://instance.internal/',
    verifiedApiKey: '  secure-api-key  ',
    verifiedUser: newUserData,
  });

  assert.deepEqual(updated, {
    history: true,
    reuse: false,
    host: 'https://instance.internal',
    apikey: 'secure-api-key',
    user: newUserData,
  });
});

test('applyConnectionVerification replaces previous instance account metadata and domains without merging', () => {
  const activeSettings = {
    host: 'https://old-instance.com',
    apikey: 'old-api-key',
    history: false,
    reuse: true,
    user: {
      email: 'old-user@old-instance.com',
      domains: [
        {
          id: 'old_dom_1',
          address: 'old.short.link',
          homepage: 'https://old.short.link',
          banned: false,
        },
      ],
    },
  };

  const newUserData = {
    email: 'new-user@new-instance.org',
    domains: [
      {
        id: 'new_dom_99',
        address: 'new.short.link',
        homepage: 'https://new.short.link',
        banned: false,
      },
    ],
  };

  const updated = applyConnectionVerification({
    currentSettings: activeSettings,
    verifiedHostUrl: 'https://new-instance.org',
    verifiedApiKey: 'new-key-123',
    verifiedUser: newUserData,
  });

  assert.equal(updated.host, 'https://new-instance.org');
  assert.equal(updated.apikey, 'new-key-123');
  assert.equal(updated.history, false);
  assert.equal(updated.reuse, true);
  assert.deepEqual(updated.user, newUserData);
  // Ensure old domains are completely replaced
  const user = updated.user as typeof newUserData;
  assert.equal(user.domains.length, 1);
  assert.equal(user.domains[0].id, 'new_dom_99');
});

test('applyConnectionVerification rejects invalid host or empty key', () => {
  assert.throws(() => {
    applyConnectionVerification({
      currentSettings: {},
      verifiedHostUrl: 'http://insecure.internal',
      verifiedApiKey: 'key',
      verifiedUser: {email: 'a', domains: []},
    });
  }, /Invalid Kutt Instance URL/);

  assert.throws(() => {
    applyConnectionVerification({
      currentSettings: {},
      verifiedHostUrl: 'https://instance.internal',
      verifiedApiKey: '   ',
      verifiedUser: {email: 'a', domains: []},
    });
  }, /API key cannot be empty/);
});

test('getStoredConnectionConfig unwraps browser storage results for background entry points', () => {
  assert.deepEqual(
    getStoredConnectionConfig({
      settings: {
        host: 'https://kutt.example.com',
        apikey: 'test-api-key',
      },
    }),
    {
      hostUrl: 'https://kutt.example.com',
      hostDomain: 'kutt.example.com',
      apikey: 'test-api-key',
    }
  );

  assert.equal(getStoredConnectionConfig({}), null);
});
