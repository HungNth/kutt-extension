import type {ApiBodyProperties} from '../Background';

export const PENDING_TARGET_KEY = 'kutt_pending_target_url';

export interface StorageAdapter {
  get(key: string): Promise<string | undefined | null>;
  set(key: string, value: string): Promise<void>;
  remove(key: string): Promise<void>;
}

export function createBrowserStorageAdapter(browserStorage: {
  get(key: string): Promise<Record<string, unknown>>;
  set(items: Record<string, unknown>): Promise<void>;
  remove(key: string): Promise<void>;
}): StorageAdapter {
  return {
    async get(key: string): Promise<string | undefined> {
      const result = await browserStorage.get(key);
      return result?.[key] as string | undefined;
    },
    async set(key: string, value: string): Promise<void> {
      await browserStorage.set({[key]: value});
    },
    async remove(key: string): Promise<void> {
      await browserStorage.remove(key);
    },
  };
}

export async function setPendingTargetUrl(
  url: string,
  storage: StorageAdapter
): Promise<void> {
  await storage.set(PENDING_TARGET_KEY, url);
}

export async function consumePendingTargetUrl(
  storage: StorageAdapter
): Promise<string | null> {
  const value = await storage.get(PENDING_TARGET_KEY);
  if (value !== undefined && value !== null) {
    await storage.remove(PENDING_TARGET_KEY);
    return value;
  }
  return null;
}

export async function clearPendingTargetUrl(
  storage: StorageAdapter
): Promise<void> {
  await storage.remove(PENDING_TARGET_KEY);
}

export async function resolveInitialTargetState(
  storage: StorageAdapter,
  tabUrl: string | null | undefined,
  validateFn: (url: string | null | undefined) => boolean,
  resolveFn: (url: string | null | undefined) => string
): Promise<{
  target: string;
  isQuickShorten: boolean;
  isValid: boolean;
}> {
  const pending = await consumePendingTargetUrl(storage);
  if (pending !== null) {
    const trimmed = pending.trim();
    return {
      target: trimmed,
      isQuickShorten: true,
      isValid: validateFn(trimmed),
    };
  }

  const activeTabTarget = resolveFn(tabUrl);
  return {
    target: activeTabTarget,
    isQuickShorten: false,
    isValid: activeTabTarget.length > 0,
  };
}

export function shapeQuickShortenRequest(options: {
  target: string;
  apikey: string;
  reuse: boolean;
}): ApiBodyProperties {
  return {
    target: options.target,
    apikey: options.apikey,
    reuse: options.reuse,
  };
}
