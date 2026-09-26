# 04: Remove Hosted-Service References and Obsolete Connection Paths

**What to build:** Finish the self-host-only cutover across the product surface. Remove obsolete default-host and advanced-connection paths, replace hosted-service links and wording with Kutt Instance terminology, update project documentation, and verify the built extension never treats `kutt.it` as an API destination while retaining Kutt branding and the existing Firefox identity.

**Blocked by:** 03: Switch Kutt Instances Safely.

**Status:** resolved

**Parent specification:** [Require a Self-Hosted Kutt Connection](../spec.md)

- [x] Default Kutt host constants, fallback branches, obsolete advanced-connection state, compatibility aliases, dead styles, stale comments, and tests that encode the former fallback are removed rather than retained behind shims.
- [x] User-visible connection labels and messages consistently use Kutt Instance URL, API Key, and Short-Link Domain terminology without conflating the instance with a shortening domain.
- [x] Authentication, timeout, unreachable/TLS, validation, and API compatibility errors refer neutrally to the Kutt Instance and do not tell users to update or visit `kutt.it`.
- [x] Options and other headers have no implicit public-service destination while unconfigured; configured instance links use only the validated Kutt Instance URL.
- [x] The Footer's hosted-service link is replaced with the upstream Kutt repository link.
- [x] User setup documentation describes the required self-hosted connection and removes hosted-service account creation, quotas, delays, and optional-custom-host instructions.
- [x] Contributor documentation, package metadata, and relevant source comments describe self-host-only operation.
- [x] Kutt branding, browser store links, and the Firefox Gecko ID remain unchanged.
- [x] Permanent tests cover only current connection behavior and contain no fallback expectations or implementation-specific source-text assertions.
- [x] Standard tests, linting, and browser builds pass, and generated browser artifacts are refreshed through the standard build process.
- [x] Final browser smoke verification covers fresh setup, failed setup, successful Connect, shortening, History, Open Instance, and Footer navigation while observing no API request to `kutt.it`.
