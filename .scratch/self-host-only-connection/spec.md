# Require a Self-Hosted Kutt Connection

Status: ready-for-agent

## Problem Statement

The extension currently treats the public `kutt.it` service as its implicit default. A user can provide only an API Key, leave the custom-host controls disabled, and have Popup, History, and background API requests silently target `https://kutt.it`. The default is also embedded in validation, state initialization, user-facing links, errors, tests, package metadata, and setup documentation.

This behavior is wrong for a self-host-only extension. Users must know which Kutt Instance receives their URLs and API Key. Missing or invalid connection settings must never cause the extension to contact a public fallback service.

## Solution

Make a verified self-hosted connection mandatory. Options will always present a required Kutt Instance URL and API Key. A single Connect action will validate both values, verify the Kutt API v2 account contract, and atomically persist the connection only after verification succeeds.

The Kutt Instance URL will be a normalized HTTPS origin with a browser-trusted certificate. The API Key will require only a non-empty value locally; the Kutt Instance is authoritative for authentication. Popup and every API-dependent surface will refuse to operate without a complete saved connection, and Popup will immediately open Options when configuration is missing.

Remove all runtime fallbacks and setup dependencies on the public `kutt.it` service while retaining Kutt product branding and the existing Firefox extension identity.

## User Stories

1. As a new extension user, I want to enter my Kutt Instance URL and API Key during setup, so that the extension connects only to my self-hosted deployment.
2. As a new extension user, I want both connection fields to be required, so that I cannot accidentally configure an incomplete connection.
3. As a privacy-conscious user, I want the extension to have no public fallback Kutt Instance, so that my URLs and API Key are never sent to an unintended service.
4. As a self-host administrator, I want users to provide a complete HTTPS origin, so that API requests target the intended Kutt Instance unambiguously.
5. As a user, I want a trailing slash on my Kutt Instance URL to be accepted and normalized away, so that harmless formatting does not block setup.
6. As a user whose Kutt Instance uses a non-default HTTPS port, I want that port preserved, so that the extension reaches the correct service.
7. As a security-conscious user, I want HTTP Kutt Instance URLs rejected, so that my API Key is not transmitted over an unencrypted connection.
8. As a user, I want URLs containing a path, query, fragment, or embedded credentials rejected, so that the extension does not silently target a different API root than I entered.
9. As a user, I want malformed or scheme-less Kutt Instance URLs rejected with a clear validation message, so that I can correct the value before any request is sent.
10. As a self-host administrator, I want the extension to rely on the browser's TLS trust decisions, so that public, enterprise, and explicitly trusted certificates work without an unsafe certificate bypass.
11. As a user with an untrusted certificate, I want Connect to fail without saving the connection, so that the extension does not claim an unusable connection is active.
12. As a user, I want any non-empty API Key to be eligible for server verification, so that the extension does not impose the public service's former 40-character assumption on my Kutt Instance.
13. As a user, I want surrounding whitespace removed from connection inputs, so that accidental spaces do not cause authentication or URL failures.
14. As a user, I want a single Connect action, so that verification and saving are one clear operation.
15. As a user, I want Connect to verify the Kutt API v2 account endpoint before saving, so that the extension confirms both reachability and authentication.
16. As a user, I want the verified account response to include the Kutt API v2 data required by the extension, so that shortening, History, and Short-Link Domain selection work after setup.
17. As a user, I want a successful Connect operation to save the Kutt Instance URL, API Key, and returned account metadata together, so that the stored connection is internally consistent.
18. As a connected user, I want a failed attempt to change my connection to leave the active saved connection unchanged, so that a typo does not break a working configuration.
19. As an unconfigured user, I want a failed Connect attempt to leave no partial connection in storage, so that other extension surfaces remain safely blocked.
20. As a user, I want an invalid API Key error distinguished from a network, timeout, TLS, or API compatibility error, so that I know what to fix.
21. As a user, I want an incompatible Kutt API response reported without mentioning the public `kutt.it` service, so that the guidance applies to my Kutt Instance.
22. As a user, I want an Open Instance link to appear only when the entered Kutt Instance URL is locally valid, so that I can obtain an API Key without any public fallback link.
23. As a user, I want Open Instance to open the configured origin rather than assume a `/login` or `/settings` route, so that it works across compatible Kutt deployments.
24. As a first-run user, I want Popup to open Options immediately when connection settings are missing, so that I can configure the extension without waiting for a timed error.
25. As a user, I want Popup to send no shortening or account request while the connection is missing, so that no accidental network destination is used.
26. As a user opening History directly, I want History to refuse API access while the connection is missing, so that it cannot fall back to a public service.
27. As an upgrading user who previously stored only an API Key, I want that value retained and shown in Options, so that I can pair it with my Kutt Instance URL without retyping it.
28. As an upgrading user who has no Kutt Instance URL, I want the extension to remain unconfigured until Connect succeeds, so that the retained API Key is never used against a default service.
29. As a self-host-only user, I want the former custom-host advanced toggle removed, so that the mandatory Kutt Instance URL is always visible and cannot be disabled.
30. As a user, I want unrelated preferences such as History and URL reuse to remain independently configurable, so that requiring a connection does not change their meaning.
31. As a user, I want shortening requests to use only the saved Kutt Instance URL and API Key, so that each generated link comes from my selected deployment.
32. As a user, I want History requests to use only the saved Kutt Instance URL and API Key, so that account data is loaded from the same deployment used for shortening.
33. As a user, I want Short-Link Domain choices to come from the account metadata returned by my Kutt Instance, so that domain selection reflects that deployment.
34. As a user switching Kutt Instances, I want successful verification to replace stale account metadata with metadata from the new instance, so that old Short-Link Domains are not reused.
35. As a user, I want the Options header and other instance links to have no implicit destination while unconfigured, so that clicking extension branding cannot open the public service.
36. As a user, I want the Footer's Kutt link to point to the upstream open-source repository, so that attribution remains without promoting or depending on the hosted service.
37. As a user reading project documentation, I want setup instructions written for self-hosted Kutt only, so that I am not directed to create an account or API Key on `kutt.it`.
38. As a contributor, I want development documentation and package metadata to describe a self-hosted Kutt extension, so that the repository matches product behavior.
39. As an existing Firefox user, I want the extension's Gecko ID retained, so that this product change does not create a new add-on identity or break updates.
40. As a user familiar with the extension, I want Kutt branding and existing store identities retained, so that the self-host-only change does not become an unrelated rebrand.
41. As a maintainer, I want obsolete default-host constants, fallback branches, advanced-host state, comments, and tests removed, so that there is one connection model to maintain.
42. As a maintainer, I want neutral Kutt Instance terminology used consistently, so that a Kutt Instance URL is not confused with a Short-Link Domain.
43. As a maintainer, I want one shared connection policy to decide URL normalization and configured-state validity, so that Popup, Options, History, and background requests cannot drift into different fallback behavior.
44. As a maintainer, I want connection behavior covered at the existing Node test seam, so that critical policy remains testable without introducing a browser automation framework.

## Implementation Decisions

- The extension is self-host-only. There is no default Kutt Instance and no runtime fallback to `kutt.it` for missing, empty, or invalid settings.
- The connection model consists of a required Kutt Instance URL, a required API Key, and account metadata returned by successful verification.
- The former advanced/custom-host mode is removed. A Kutt Instance URL is first-class required configuration, not an optional preference.
- A shared connection policy will be the single authority for validating and normalizing the Kutt Instance URL and determining whether saved credentials form a configured connection. API-dependent surfaces must consume this policy rather than implement local fallback rules.
- A valid Kutt Instance URL is an HTTPS origin. It may include a port. A root trailing slash is accepted and removed. Paths other than `/`, query strings, fragments, embedded usernames/passwords, missing schemes, HTTP URLs, and malformed URLs are rejected.
- TLS validation is delegated to the browser. The extension will not attempt to bypass certificate errors. Self-signed certificates work only after the user has made them trusted by the browser or operating system.
- Local API Key validation trims surrounding whitespace and requires a non-empty value. There is no fixed-length or character-set restriction. The Kutt Instance is authoritative for whether the key is valid.
- Connection inputs are staged in Options. Editing them does not mutate the active saved connection.
- Connect validates the staged values and requests the Kutt API v2 account endpoint using the API Key header and no credential cookies.
- Successful verification requires the full account response shape used by the extension, including the Short-Link Domain collection. Partial API compatibility is not supported.
- A successful Connect operation atomically replaces the saved Kutt Instance URL, API Key, and account metadata. When switching instances, metadata from the previous instance is removed rather than merged.
- A failed Connect operation persists none of the staged connection values and leaves any active saved connection unchanged. With no active connection, the extension remains unconfigured.
- Existing stored API Keys are retained for upgrade users. An API Key without a valid saved Kutt Instance URL is not a configured connection and cannot authorize an API request.
- Popup immediately opens Options when the saved connection is incomplete. It does not wait on a timer and does not issue an API request first.
- History and any other API-dependent entry point also block when the saved connection is incomplete. No surface may manufacture, infer, or default a destination.
- Shortening, account verification, and History continue to use Kutt API v2 endpoints under the normalized Kutt Instance URL.
- Error messages distinguish invalid authentication, timeout, unreachable server or TLS failure, and incompatible API behavior where the underlying response permits that distinction. Error copy refers to the Kutt Instance, never the public service.
- The API Key helper link becomes Open Instance. It is unavailable until the staged Kutt Instance URL is locally valid and opens the origin without appending a route.
- The Footer service link is replaced with a link to the upstream Kutt repository.
- Kutt branding, browser store links, and the existing Firefox Gecko ID remain unchanged.
- User-facing setup documentation, contributor documentation, package metadata, and source comments are updated to describe self-host-only operation. Public-service quotas and hosted-service setup instructions are removed.
- Obsolete default-host constants, fallback code, advanced-host state, compatibility aliases, comments, and implementation-specific tests are deleted rather than retained behind shims.
- Preferences unrelated to connection identity, including History enablement and URL reuse, retain their existing behavior and persistence semantics.

## Testing Decisions

- Permanent tests verify externally observable connection-policy behavior rather than component state, hook calls, source strings, or storage implementation details.
- The project will use one permanent behavioral seam: the shared connection policy exercised through the existing `node:test` setup. This extends the repository's existing URL validation and host normalization test precedent instead of adding a browser testing dependency.
- URL policy coverage includes valid HTTPS origins, optional ports, trailing-slash normalization, and rejection of HTTP, missing schemes, non-root paths, query strings, fragments, embedded credentials, malformed values, and empty values.
- Credential policy coverage includes non-empty API Keys of arbitrary length, trimming, missing Kutt Instance URLs, missing API Keys, and the absence of any default destination.
- Connection transition coverage proves that successful verification produces one complete saved connection, failed verification leaves an existing connection unchanged, failed first-time verification leaves the user unconfigured, and switching instances replaces stale account metadata.
- Upgrade coverage proves that an existing API Key without a Kutt Instance URL remains available to Options but is not considered configured and cannot produce an API request.
- Tests must not assert obsolete field names, React component wiring, exact internal helper composition, or incidental copy. Those would pin implementation rather than behavior.
- Integration verification is a browser smoke run against the built extension and a reachable Kutt API v2 instance with a browser-trusted certificate. It must exercise: fresh-install Popup opening Options; invalid URL rejection; failed Connect not changing storage; successful Connect; shortening a URL; loading History; and opening the configured Kutt Instance.
- The smoke run must also observe that no request to `kutt.it` occurs during first run, failed setup, Popup use, shortening, or History.
- Documentation and Footer changes are verified on the rendered Options surface and by reading the published setup instructions; they are not covered by source-text assertion tests.

## Out of Scope

- Supporting HTTP Kutt Instances, including localhost or private-network HTTP deployments.
- Supporting Kutt deployments mounted under a URL subpath.
- Bypassing invalid or untrusted TLS certificates.
- Supporting Kutt API v1, partially compatible forks, capability detection, or per-feature degradation.
- Reintroducing the public `kutt.it` service as a default, fallback, migration target, or setup recommendation.
- Full product rebranding, changing the extension name, changing browser store identities, or changing the Firefox Gecko ID.
- Managing multiple Kutt Instances or switching between saved connection profiles.
- Changing Kutt server behavior, deployment configuration, certificate provisioning, API Key issuance, or Short-Link Domain administration.
- Encrypting extension local storage or introducing a new credential vault.
- Adding a permanent WebExtension end-to-end automation framework.
- Changing shortening, History, password, custom alias, reuse, QR code, or Short-Link Domain behavior beyond routing them exclusively through the verified Kutt Instance.

## Further Notes

- Canonical terminology comes from the project domain glossary: Kutt Instance, Kutt Instance URL, Short-Link Domain, and API Key.
- The connection policy is the testing and consistency seam; it should remain small and free of UI concerns.
- This change does not require an ADR. The product direction is explicit in this specification, and the implementation is reversible without a durable cross-system architectural constraint.
- Generated browser artifacts should be regenerated through the repository's standard build process after source changes; generated output must not become a second source of truth.
