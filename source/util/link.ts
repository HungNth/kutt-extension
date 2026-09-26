import {IPV4_REGEX} from '@abhijithvijayan/ts-utils';

export const removeProtocol = (link: string): string =>
  link.replace(/^https?:\/\//i, '').replace(/^www\./i, '');

export function isValidUrl(url: string): boolean {
  // https://regex101.com/r/BzoIRR/1
  const ipRegex = IPV4_REGEX.toString().slice(2, -2);
  const re = new RegExp(
    `^(http[s]?:\\/\\/)(www\\.){0,1}(([a-zA-Z0-9.-]+\\.[a-zA-Z]{2,5}[.]{0,1})|(${ipRegex}))`
  );

  return re.test(url);
}

export function validateTargetUrl(url: string | null | undefined): boolean {
  if (!url) {
    return false;
  }
  const trimmed = url.trim();
  if (!trimmed) {
    return false;
  }
  return isValidUrl(trimmed);
}

export function resolveTargetUrl(tabUrl: string | null | undefined): string {
  if (validateTargetUrl(tabUrl)) {
    return (tabUrl as string).trim();
  }
  return '';
}
