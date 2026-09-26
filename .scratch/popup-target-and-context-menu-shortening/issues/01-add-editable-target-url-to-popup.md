# 01: Add Editable Target URL to the Popup

**Parent specification:** `.scratch/popup-target-and-context-menu-shortening/spec.md`

**What to build:** Let the user create a Shortened Link for any Target URL accepted by the extension's existing HTTP/HTTPS validation policy. A normal popup opening pre-fills the active tab URL when accepted, but the field remains editable. The full Create workflow retains Custom Link, Password, Short-Link Domain, Reuse, result display, QR actions, and automatic Shortened Link copy.

**Blocked by:** None (can start immediately).

**Status:** claimed

**Testing seam:** Pure behavior tests cover reuse of the existing Target URL validation policy and source selection without asserting React state or component wiring. Chrome and Firefox runtime smoke prove the rendered input and full Create workflow.

**Demo path:** Open the popup on a normal web page, confirm that the active tab URL is editable, replace it with another valid Target URL, use the advanced options, create the Shortened Link, and observe the existing result, QR, and auto-copy behavior.

- [x] A normal popup opening pre-fills an editable Target URL field with the active tab URL when it is a valid HTTP or HTTPS URL.
- [x] Opening the popup on an unsupported or invalid active-tab URL leaves an editable empty Target URL field and sends no request.
- [x] The user can replace the pre-filled value with another valid Target URL and the API request uses the edited value.
- [x] Validation preserves the existing policy: Target URLs must begin with `http://` or `https://` and match its supported public-domain or IPv4 prefix shape.
- [x] Localhost, IPv6, embedded credentials, scheme-less URLs, and public-domain suffixes outside the validator's current constraints remain unsupported; accepted URLs may continue to carry paths, queries, and fragments.
- [x] The feature neither replaces nor broadens the existing validator.
- [x] Manual Create continues to pass Custom Link, Password, selected Short-Link Domain, and saved Reuse exactly as configured.
- [x] Loading, API error, Shortened Link display, automatic copy, QR preview, Copy QR, and Download QR behavior remain unchanged.
- [x] Clipboard failure preserves the successful Shortened Link and does not retry or reclassify the shortening request.
- [x] Pure tests prove that editable Target URL submission and active-tab fallback use the existing accepted and rejected URL shapes.
- [ ] Chrome 127+ and Firefox 127+ runtime smoke verifies active-tab pre-fill, manual replacement, advanced options, successful creation, and clipboard-failure result retention.
- [x] Standard tests, TypeScript checking, lint, and both browser builds pass.

## Comments

- Implemented single authority helpers `validateTargetUrl` and `resolveTargetUrl` in `source/util/link.ts`.
- Connected controlled Target URL field to `Form.tsx`, keeping Custom URL, Password, Domain, and Reuse intact.
- Verified pure unit tests in `tests/targetUrl.test.ts` (13/13 passing tests across the repo).
- Code implementation, typecheck, lint, and unit tests are complete. Manual extension smoke in real Chrome/Firefox is blocked by environment constraints and must be verified by a human.
