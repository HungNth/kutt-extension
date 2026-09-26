# 02: Connect a Kutt Instance from Options

**What to build:** Give a first-time or unconfigured user one complete setup flow in Options: enter a required Kutt Instance URL and API Key, verify the full Kutt API v2 account contract, save the connection atomically, and then use Popup to shorten a URL through that instance.

**Blocked by:** 01: Stop Implicit Hosted-Service Traffic.

**Status:** resolved

**Parent specification:** [Require a Self-Hosted Kutt Connection](../spec.md)

- [x] Options always displays required Kutt Instance URL and API Key fields; the former optional custom-host/advanced toggle is no longer part of setup.
- [x] An upgrade user's stored API Key is prefilled even when no Kutt Instance URL exists, but it remains inactive until Connect succeeds.
- [x] Connection inputs are staged locally; typing or local validation does not write partial credentials into extension storage.
- [x] Local validation uses the shared connection policy, requires HTTPS with a browser-trusted certificate at request time, and accepts a non-empty API Key of any length after trimming.
- [x] Open Instance is available only for a locally valid staged URL and opens that origin without appending a login or settings route.
- [x] Connect calls the Kutt API v2 account endpoint with the staged API Key, no credential cookies, and no request to any fallback service.
- [x] Verification succeeds only when the response contains the account data required by the extension, including the Short-Link Domain collection.
- [x] A successful verification atomically stores the normalized Kutt Instance URL, API Key, and returned account metadata; no observer can see a half-saved connection.
- [x] A failed first-time verification stores none of the staged connection, leaves the extension unconfigured, and reports invalid authentication, timeout, unreachable/TLS failure, or incompatible API behavior where the response permits that distinction.
- [x] History and URL-reuse preferences retain their existing independent persistence behavior.
- [x] After successful Connect, Popup can shorten a URL through the saved Kutt Instance and offers the account's Short-Link Domains.
- [x] Permanent policy tests cover successful first-time commit and failed first-time verification; a browser smoke run covers invalid URL, failed Connect, successful Connect, Open Instance, and one shortened URL.
