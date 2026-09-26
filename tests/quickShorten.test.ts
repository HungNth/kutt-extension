import test from 'node:test';
import assert from 'node:assert/strict';
import {
  setPendingTargetUrl,
  consumePendingTargetUrl,
  clearPendingTargetUrl,
  shapeQuickShortenRequest,
  resolveInitialTargetState,
  type StorageAdapter,
} from '../source/util/quickShorten.ts';
import {validateTargetUrl, resolveTargetUrl} from '../source/util/link.ts';

function createMockStorageAdapter(
  initialStore: Record<string, string> = {}
): StorageAdapter {
  const store = {...initialStore};
  return {
    async get(key: string): Promise<string | undefined> {
      return store[key];
    },
    async set(key: string, value: string): Promise<void> {
      store[key] = value;
    },
    async remove(key: string): Promise<void> {
      delete store[key];
    },
  };
}

test('consumePendingTargetUrl consumes a pending Target URL once and clears it', async () => {
  const storageAdapter = createMockStorageAdapter();

  await setPendingTargetUrl('https://example.com/first', storageAdapter);
  assert.equal(
    await consumePendingTargetUrl(storageAdapter),
    'https://example.com/first'
  );
  // Second call must return null (one-time consumption)
  assert.equal(await consumePendingTargetUrl(storageAdapter), null);
});

test('consumePendingTargetUrl consumes empty string pending target without fallthrough', async () => {
  const storageAdapter = createMockStorageAdapter();

  await setPendingTargetUrl('', storageAdapter);
  assert.equal(await consumePendingTargetUrl(storageAdapter), '');
  assert.equal(await consumePendingTargetUrl(storageAdapter), null);
});

test('resolveInitialTargetState gives pending target URL precedence over active tab without fallthrough', async () => {
  const storageAdapter = createMockStorageAdapter();
  // Case 1: Valid pending Target URL overrides active tab
  await setPendingTargetUrl('https://example.com/pending', storageAdapter);
  const result1 = await resolveInitialTargetState(
    storageAdapter,
    'https://example.com/active-tab',
    validateTargetUrl,
    resolveTargetUrl
  );
  assert.equal(result1.target, 'https://example.com/pending');
  assert.equal(result1.isQuickShorten, true);
  assert.equal(result1.isValid, true);

  // Case 2: Invalid pending Target URL does NOT fall back to active tab
  await setPendingTargetUrl('chrome://invalid-link', storageAdapter);
  const result2 = await resolveInitialTargetState(
    storageAdapter,
    'https://example.com/active-tab',
    validateTargetUrl,
    resolveTargetUrl
  );
  assert.equal(result2.target, 'chrome://invalid-link');
  assert.equal(result2.isQuickShorten, true);
  assert.equal(result2.isValid, false);

  // Case 3: Empty string pending Target URL does NOT fall back to active tab
  await setPendingTargetUrl('', storageAdapter);
  const result3 = await resolveInitialTargetState(
    storageAdapter,
    'https://example.com/active-tab',
    validateTargetUrl,
    resolveTargetUrl
  );
  assert.equal(result3.target, '');
  assert.equal(result3.isQuickShorten, true);
  assert.equal(result3.isValid, false);

  // Case 4: Absent pending Target URL falls back to valid active tab
  const result4 = await resolveInitialTargetState(
    storageAdapter,
    'https://example.com/active-tab',
    validateTargetUrl,
    resolveTargetUrl
  );
  assert.equal(result4.target, 'https://example.com/active-tab');
  assert.equal(result4.isQuickShorten, false);
  assert.equal(result4.isValid, true);

  // Case 5: Absent pending Target URL and invalid active tab produces empty state
  const result5 = await resolveInitialTargetState(
    storageAdapter,
    'chrome://settings',
    validateTargetUrl,
    resolveTargetUrl
  );
  assert.equal(result5.target, '');
  assert.equal(result5.isQuickShorten, false);
  assert.equal(result5.isValid, false);
});

test('setPendingTargetUrl overwrites older unconsumed values (latest-value semantics)', async () => {
  const storageAdapter = createMockStorageAdapter();
  await setPendingTargetUrl('https://example.com/first', storageAdapter);
  await setPendingTargetUrl('https://example.com/second', storageAdapter);

  assert.equal(
    await consumePendingTargetUrl(storageAdapter),
    'https://example.com/second'
  );
  assert.equal(await consumePendingTargetUrl(storageAdapter), null);
});

test('clearPendingTargetUrl cleanly removes stored pending state', async () => {
  const storageAdapter = createMockStorageAdapter();
  await setPendingTargetUrl('https://example.com/first', storageAdapter);
  await clearPendingTargetUrl(storageAdapter);
  assert.equal(await consumePendingTargetUrl(storageAdapter), null);
});

test('shapeQuickShortenRequest shapes request with target and reuse while omitting custom fields', () => {
  const request = shapeQuickShortenRequest({
    target: 'https://example.com/target',
    apikey: 'test-api-key',
    reuse: true,
  });

  assert.deepEqual(request, {
    target: 'https://example.com/target',
    apikey: 'test-api-key',
    reuse: true,
  });
});
