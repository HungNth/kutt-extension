# 02: Quick Shorten Links from the Context Menu

**Parent specification:** `.scratch/popup-target-and-context-menu-shortening/spec.md`

**What to build:** Add a hyperlink-only `Shorten link with Kutt` context-menu action for Chrome and Firefox. A configured action stores the selected hyperlink in a one-time latest-value pending slot, opens the popup, and lets the popup read then remove the Target URL and automatically create and copy a Shortened Link. The failure path cleans pending state and exposes a deterministic badge without adding notification or background clipboard infrastructure.

**Blocked by:** 01: Add Editable Target URL to the Popup.

**Status:** claimed

**Testing seam:** Pure behavior tests cover pending Target URL precedence, read-then-remove one-time consumption, latest-value semantics, and Quick Shorten request shaping. Chrome and Firefox runtime smoke remain the source of truth for actual context-menu visibility, popup opening, clipboard behavior, Options redirect, and badge lifecycle.

**Demo path:** Right-click a hyperlink, choose `Shorten link with Kutt`, observe the popup open and submit automatically, then paste the copied Shortened Link. Repeat while unconfigured and with popup opening forced to fail to observe Options routing, pending-state cleanup, and badge behavior.

- [x] The context-menu command appears only for hyperlinks on Chrome and Firefox.
- [x] The manifest declares the context-menu permission without adding notifications, offscreen, scripting, clipboard-read, or downloads permissions.
- [x] The context-menu handler clears any previous error badge before handling the new action.
- [x] Missing or invalid Kutt Instance configuration opens Options without writing pending Target URL state or sending a shortening request.
- [x] A configured action stores the selected hyperlink before invoking `action.openPopup()`; it does not send a lossy runtime message to a popup that may not exist.
- [x] The pending Target URL uses one latest-value slot rather than a queue; a newer action replaces an older unconsumed value.
- [x] The popup retrieves the pending Target URL before removing it, uses it instead of the active tab URL, and consumes it once.
- [x] A later normal popup opening does not repeat or display the consumed Target URL.
- [x] An invalid pending Target URL does not fall back to the active tab URL.
- [x] Quick Shorten submits automatically after popup initialization.
- [x] Quick Shorten request shaping includes the pending Target URL, required connection credentials, and persisted Reuse while omitting Custom Link, Password, and Short-Link Domain.
- [x] The existing result path displays and automatically copies the returned Shortened Link; clipboard failure preserves the result.
- [x] Closing the popup before completion does not create a background retry or delayed clipboard operation.
- [x] If `action.openPopup()` rejects, pending Target URL state is removed and the action badge becomes `!`.
- [x] The `!` badge has no timer and clears when the popup initializes successfully or when the next context-menu action starts.
- [x] Chrome minimum support changes from 88 to 127; Firefox minimum support remains 127.
- [x] README and contributor-facing browser support documentation state Chrome 127+ and Firefox 127+.
- [x] The Chrome 127 trade-off remains documented in the dedicated ADR.
- [x] Pure tests cover pending precedence, one-time consumption, latest-value replacement, and Quick Shorten request shaping at exported behavior boundaries.
- [ ] Chrome 127+ and Firefox 127+ runtime smoke verifies context-menu visibility, popup opening, automatic submission, copy success/failure, unconfigured Options routing, one-time consumption, and badge set/clear behavior.
- [x] Standard tests, TypeScript checking, lint, and both browser builds pass.

## Comments
- Implemented context-menu registration in `source/Background/index.ts` with `browser.storage.session` adapter and badge error lifecycle.
- Implemented Quick Shorten auto-submission in `source/Popup/Form.tsx` ensuring pending Target URL precedence without active tab fallthrough.
- Pure unit tests added in `tests/quickShorten.test.ts` (including empty string pending consumption).
- Updated `source/manifest.json` and `README.md` to Chrome 127+.
- Verified with typecheck, lint, and full build.
- Code implementation and unit tests are complete; browser runtime smoke on Chrome and Firefox remains manual and unverified in this non-interactive environment.
