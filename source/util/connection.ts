export type ConnectionConfig = {
  hostUrl: string;
  hostDomain: string;
  apikey: string;
};

export type PartialSettings = {
  host?: unknown;
  apikey?: unknown;
  [key: string]: unknown;
};

export type VerifiedUserProperties = {
  email?: string;
  domains: Array<{
    id: string;
    address: string;
    homepage: string;
    banned: boolean;
    created_at?: string;
    updated_at?: string;
  }>;
};

export type ApplyVerificationParams = {
  currentSettings: Record<string, unknown>;
  verifiedHostUrl: string;
  verifiedApiKey: string;
  verifiedUser: VerifiedUserProperties;
};

/**
 * Normalizes a Kutt Instance URL to an HTTPS origin (protocol + host:port).
 * Rejects non-HTTPS, paths (other than /), queries, fragments, credentials, or malformed URLs.
 */
export function normalizeKuttInstanceUrl(rawUrl?: unknown): string | null {
  if (typeof rawUrl !== 'string') {
    return null;
  }
  const trimmed = rawUrl.trim();
  if (!trimmed) {
    return null;
  }

  try {
    const parsed = new URL(trimmed);
    if (parsed.protocol !== 'https:') {
      return null;
    }
    // Reject paths other than root or empty
    if (parsed.pathname !== '' && parsed.pathname !== '/') {
      return null;
    }
    // Reject queries, fragments, credentials
    if (parsed.search || parsed.hash || parsed.username || parsed.password) {
      return null;
    }
    if (!parsed.hostname) {
      return null;
    }
    return parsed.origin;
  } catch {
    return null;
  }
}

export function isValidKuttInstanceUrl(rawUrl?: unknown): boolean {
  return normalizeKuttInstanceUrl(rawUrl) !== null;
}

export function isConfiguredConnection(
  settings?: PartialSettings | null
): boolean {
  if (!settings || typeof settings !== 'object') {
    return false;
  }
  const normalizedUrl = normalizeKuttInstanceUrl(settings.host);
  if (!normalizedUrl) {
    return false;
  }
  if (typeof settings.apikey !== 'string') {
    return false;
  }
  return settings.apikey.trim().length > 0;
}

export function getConnectionConfig(
  settings?: PartialSettings | null
): ConnectionConfig | null {
  if (!isConfiguredConnection(settings)) {
    return null;
  }
  const hostUrl = normalizeKuttInstanceUrl(settings!.host)!;
  const apikey = (settings!.apikey as string).trim();
  const parsed = new URL(hostUrl);

  return {
    hostUrl,
    hostDomain: parsed.host,
    apikey,
  };
}

/**
 * Atomically creates the new settings payload after successful server verification.
 */
export function applyConnectionVerification({
  currentSettings,
  verifiedHostUrl,
  verifiedApiKey,
  verifiedUser,
}: ApplyVerificationParams): Record<string, unknown> {
  const normalizedUrl = normalizeKuttInstanceUrl(verifiedHostUrl);
  if (!normalizedUrl) {
    throw new Error('Invalid Kutt Instance URL');
  }
  const trimmedKey = verifiedApiKey.trim();
  if (trimmedKey.length === 0) {
    throw new Error('API key cannot be empty');
  }

  return {
    ...currentSettings,
    host: normalizedUrl,
    apikey: trimmedKey,
    user: verifiedUser,
  };
}
