# 01: Stop Implicit Hosted-Service Traffic

**What to build:** Make an explicit saved connection mandatory before any API-dependent surface can operate. A user with fresh settings or only an API Key is sent directly to Options without any request being made, while a user with a valid explicit Kutt Instance connection can continue shortening links and viewing History.

**Blocked by:** None (can start immediately).

**Status:** resolved

**Parent specification:** [Require a Self-Hosted Kutt Connection](../spec.md)

- [x] One shared connection policy determines whether settings contain a configured Kutt Instance; Popup, History, Options verification, and background API entry points do not implement independent fallback rules.
- [x] A configured connection requires a normalized Kutt Instance URL and a non-empty trimmed API Key; an API Key without a URL remains available to Options but is not considered configured.
- [x] The URL policy accepts HTTPS origins with optional ports, normalizes a root trailing slash, and rejects HTTP, missing schemes, non-root paths, queries, fragments, embedded credentials, malformed values, and empty values.
- [x] Missing or invalid connection settings never resolve to `kutt.it` or any other manufactured destination.
- [x] Popup opens Options immediately when the connection is incomplete, without a delay and without first issuing an account or shortening request.
- [x] History and other API-dependent entry points refuse API access when the connection is incomplete and direct the user to configuration.
- [x] Existing settings containing an explicit valid self-hosted URL and API Key still allow shortening and History during this prefactoring slice.
- [x] Permanent `node:test` coverage proves URL normalization, credential readiness, retained key-only upgrade state, and the absence of a default destination.
- [x] A browser smoke run demonstrates both paths: an unconfigured profile opens Options with no hosted-service request, and an explicitly configured self-hosted profile still performs its existing API flow.
