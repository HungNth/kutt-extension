# Shorten Arbitrary Target URLs from the Popup and Context Menu

Status: ready-for-agent

## Problem Statement

The popup can shorten only the active tab URL. A user who copies or encounters another URL must navigate to that URL before the extension can shorten it. The extension also has no hyperlink context-menu action, so shortening a link found on a page requires extra navigation and popup interaction.

Users need one full popup workflow for editing and shortening any Target URL, plus one Quick Shorten workflow that starts from a hyperlink context menu, opens the popup, creates the Shortened Link immediately, and copies the result through the existing popup behavior.

## Solution

Add an editable Target URL field to the popup. A normal popup opening pre-fills the field from the active tab when that URL satisfies the extension's existing validation policy, while allowing the user to replace it with another URL accepted by the same policy. Existing Custom Link, Password, Short-Link Domain, and Reuse controls remain available for this full Create workflow.

Add a hyperlink-only context-menu action named `Shorten link with Kutt` on Chrome and Firefox. The action checks that a Kutt Instance is configured, stores the selected hyperlink as a one-time pending Target URL, and opens the popup. The popup reads then removes that pending Target URL once, bypasses Custom Link, Password, and Short-Link Domain values, preserves the saved Reuse preference, and submits the shortening request automatically. The existing successful-result behavior displays and automatically copies the Shortened Link.

Chrome minimum support increases from 88 to 127 because general extension access to `action.openPopup()` begins in Chrome 127. Firefox minimum support remains 127. If popup opening fails, the pending Target URL is removed and an error badge remains until the popup opens successfully or another context-menu action begins.

## User Stories

1. As a user, I want to see the active tab URL in the popup, so that the existing current-page shortening workflow remains fast.
2. As a user, I want the active tab URL to be editable, so that I can shorten a different Target URL without navigating to it.
3. As a user, I want to paste an HTTP or HTTPS Target URL accepted by the extension's existing validation policy, so that copied links can be shortened directly.
4. As an existing user, I want Target URL acceptance rules to remain unchanged, so that this feature does not silently broaden or narrow supported URL shapes.
5. As a user, I want a Target URL rejected by the existing policy blocked before an API request, so that unsupported input is not sent to my Kutt Instance.
6. As a user, I want a clear validation error for a missing or invalid Target URL, so that I know what to correct.
7. As a user opening the popup on a browser-internal or otherwise unsupported page, I want an empty editable Target URL field, so that I can paste a supported URL.
8. As a user, I want Custom Link to remain available for manually entered Target URLs, so that the full Create workflow retains its capabilities.
9. As a user, I want Password to remain available for manually entered Target URLs, so that the full Create workflow retains its capabilities.
10. As a user, I want Short-Link Domain selection to remain available for manually entered Target URLs, so that the full Create workflow retains its capabilities.
11. As a user, I want the saved Reuse preference applied to manually entered Target URLs, so that duplicate-link behavior remains consistent.
12. As a user, I want the popup to show its existing loading state during shortening, so that I know the request is in progress.
13. As a user, I want the resulting Shortened Link, QR preview, copy actions, and download action to behave as they do today, so that changing the Target URL source does not redesign results.
14. As a user, I want the successful Shortened Link copied automatically, so that I can paste it immediately.
15. As a user whose clipboard write fails, I want the Shortened Link to remain visible, so that a copy failure does not become a shortening failure.
16. As a user, I want a context-menu command when I right-click a hyperlink, so that I can shorten the link without navigating to it.
17. As a user, I want the context-menu command hidden for non-link page areas, images, and selected text, so that it appears only where its target is unambiguous.
18. As a user, I want the context-menu command to open the extension popup automatically, so that I do not need to click the toolbar icon afterward.
19. As a user, I want the selected hyperlink shortened automatically after the popup opens, so that Quick Shorten requires one context-menu action.
20. As a user, I want the selected hyperlink to take precedence over the active tab URL, so that the intended link is shortened.
21. As a user, I want the pending Target URL consumed only once, so that reopening the popup does not repeat an earlier Quick Shorten request.
22. As a user, I want later normal popup openings to return to the active tab URL, so that Quick Shorten does not change normal popup behavior.
23. As a user performing several context-menu actions rapidly, I want the newest selected hyperlink to replace any older pending hyperlink, so that the latest explicit action wins.
24. As a user, I want Quick Shorten to omit Custom Link and Password, so that it remains immediate and requires no extra decisions.
25. As a user, I want Quick Shorten to let the Kutt Instance choose its default Short-Link Domain, so that no stale popup domain selection affects the result.
26. As a user, I want Quick Shorten to respect my saved Reuse preference, so that duplicate-link behavior remains consistent with the extension setting.
27. As a user, I want the popup to stay visible with loading and result feedback during Quick Shorten, so that I can observe completion and clipboard status.
28. As a user, I understand that closing the popup before completion can prevent result display and automatic copy, so that the extension does not need a second background clipboard architecture.
29. As an unconfigured user, I want a context-menu action to open Options, so that I can configure a Kutt Instance and API Key.
30. As an unconfigured user, I want the selected hyperlink discarded when Options opens, so that configuration does not cause a delayed unexpected request.
31. As a user, I want no pending Target URL written when configuration is missing, so that a future popup opening remains predictable.
32. As a user, I want popup-opening failure to discard the pending Target URL, so that a later popup opening cannot submit an unexpected request.
33. As a user, I want a `!` badge when popup opening fails, so that the extension exposes the failure without requesting notification permission.
34. As a user, I want the failure badge cleared when the popup next opens successfully, so that a resolved failure is not shown indefinitely.
35. As a user, I want the failure badge cleared when another context-menu action starts, so that the next explicit retry begins from a clean status.
36. As a Chrome user, I want consistent automatic popup opening on a supported browser version, so that Quick Shorten does not silently degrade.
37. As a Firefox user, I want the same popup and context-menu workflow, so that the extension remains cross-browser.
38. As a maintainer, I want the browser support documentation to state Chrome 127+ and Firefox 127+, so that product documentation matches required APIs.
39. As a maintainer, I want pending Target URL behavior covered at a browser-independent seam, so that precedence and one-time consumption cannot regress silently.
40. As a maintainer, I want real context-menu and popup behavior checked in both supported browsers, so that pure tests do not claim to prove WebExtension integration.

## Acceptance Criteria

- [ ] A normal popup opening presents an editable Target URL field pre-filled from the active tab when that tab has a valid HTTP or HTTPS URL.
- [ ] The user can replace the pre-filled value with another Target URL accepted by the existing validation policy and create a Shortened Link for that value.
- [ ] Target URL acceptance remains defined by the existing validator: the value must begin with `http://` or `https://` and then match either its supported public-domain shape or IPv4 shape.
- [ ] The feature does not add acceptance for localhost, IPv6, embedded credentials, scheme-less URLs, or public-domain suffixes outside the validator's current constraints; paths, queries, and fragments continue to work when the URL prefix passes the existing policy.
- [ ] Normal popup submission preserves Custom Link, Password, selected Short-Link Domain, and saved Reuse behavior.
- [ ] Successful manual submission retains the existing Shortened Link, QR, download, and auto-copy behavior.
- [ ] Chrome and Firefox expose `Shorten link with Kutt` only when the user opens the context menu on a hyperlink.
- [ ] A configured context-menu action stores the selected hyperlink before requesting popup opening.
- [ ] A pending Target URL takes precedence over the active tab URL, is read then removed once, and triggers automatic submission.
- [ ] Quick Shorten submits only the pending Target URL plus required connection credentials and persisted Reuse; it does not submit Custom Link, Password, or Short-Link Domain.
- [ ] A later normal popup opening does not repeat or display a previously consumed pending Target URL.
- [ ] If several context-menu actions occur before consumption, only the latest pending Target URL is retained.
- [ ] When connection configuration is missing or invalid, the context-menu action opens Options without writing pending state or issuing a shortening request.
- [ ] If popup opening fails, pending state is removed and the action badge becomes `!`.
- [ ] The `!` badge has no timer; it clears when the popup initializes successfully or when the next context-menu action starts.
- [ ] Clipboard failure leaves a successful Shortened Link visible and does not retry or reclassify the API request.
- [ ] Chrome support is declared as 127+ and Firefox support as 127+ in the manifest and support documentation.
- [ ] The Chrome 127 support trade-off remains recorded in the dedicated ADR.
- [ ] Pure tests cover full Target URL parsing, pending-target precedence and one-time consumption, latest-value semantics, and Quick Shorten request shaping.
- [ ] Chrome 127+ and Firefox 127+ runtime smoke verifies real context-menu visibility, popup opening, automatic submission, clipboard result handling, Options redirect, and badge lifecycle.


## Implementation Decisions

- Target URL is the canonical term for the HTTP or HTTPS URL submitted to the Kutt Instance. The domain glossary defines it separately from the active tab URL and the returned Shortened Link.
- The popup gains one controlled Target URL field. A normal popup opening attempts to pre-fill it from the active tab; a valid pending Target URL takes precedence.
- Target URL validation deliberately preserves the existing `isValidUrl` policy selected for this feature. It remains a prefix-oriented HTTP/HTTPS public-domain-or-IPv4 check, including its current domain-suffix constraints; this feature does not replace it with general standards-based URL parsing.
- The full manual Create workflow continues to support Custom Link, Password, Short-Link Domain, and Reuse.
- The context menu is registered for hyperlink contexts only and is available on both Chrome and Firefox.
- The context-menu title is `Shorten link with Kutt`.
- The background context-menu handler checks saved connection configuration before writing pending state. Missing or invalid configuration opens Options and discards the selected link.
- A configured context-menu action writes the selected hyperlink to an extension-owned pending slot before invoking `action.openPopup()`. The storage area is an implementation choice only after confirming Chrome 127 and Firefox 127 support; runtime messaging directly to a possibly absent popup is not used.
- Pending Target URL storage is a single latest-value slot, not a queue. A newer context-menu action replaces an older unconsumed value.
- The popup reads and removes the pending Target URL only after the value has been retrieved. The value is consumed once.
- A pending Target URL overrides the active tab URL and triggers automatic submission after popup initialization.
- Quick Shorten sends the pending Target URL, the configured API Key, Kutt Instance URL, and saved Reuse preference. It omits Custom Link, Password, and Short-Link Domain so that the Kutt Instance chooses its default domain.
- The popup continues to send shortening work through the established background API boundary. The Kutt API endpoint and response contract do not change.
- Existing successful-result behavior remains authoritative: the popup displays the returned Shortened Link, attempts automatic clipboard copy, and exposes the existing QR actions.
- Clipboard failure remains an action failure. It does not remove the Shortened Link, convert the API result into a shortening error, or retry the API request.
- The user must keep the popup open until the request and automatic copy complete. No offscreen document, background clipboard workflow, or notification system is introduced.
- If `action.openPopup()` rejects, the background removes the pending Target URL and sets the extension action badge to `!`.
- The badge is not timer-based. It remains until the popup initializes successfully or another context-menu action starts; either event clears it.
- Chrome minimum support increases from 88 to 127 because `action.openPopup()` is generally available to extensions from Chrome 127. The Chrome 118–126 policy-installed-only behavior is not treated as supported.
- Firefox minimum support remains 127. The context-menu click supplies the user interaction required by supported Firefox versions before Firefox 149.
- Manifest declarations, generated browser manifests, README browser support documentation, and any contributor-facing compatibility documentation must agree on Chrome 127+ and Firefox 127+.
- The context-menu permission is added. No notifications, offscreen, scripting, clipboard-read, or downloads permission is added for this feature.
- Obsolete active-tab-only submission logic is removed rather than retained as a parallel submission path.

## Testing Decisions

- Permanent automated tests cover externally observable, browser-independent Target URL selection policy rather than React wiring, storage method calls, source text, or dependency markup.
- The automated seam verifies that a valid pending Target URL takes precedence over the active tab URL, is consumed once, and does not affect a later normal popup opening.
- The seam verifies that when a pending Target URL is present, it takes precedence and is consumed once; an invalid pending value does not fall back to the active tab, and only an absent pending state permits active-tab resolution.
- The seam verifies latest-value semantics for multiple pending Target URLs rather than introducing queue behavior.
- Existing Target URL validation tests remain the authority for accepted HTTP/HTTPS public-domain and IPv4 shapes and rejected unsupported shapes. This feature extends coverage only where needed to prove the editable field and active-tab fallback use the same policy.
- A pure Quick Shorten request-shaping seam verifies that context-menu submission includes the Target URL and persisted Reuse while omitting Custom Link, Password, and Short-Link Domain.
- Existing shortening, connection, QR filename, and QR preview-style tests remain regression checks; this feature does not duplicate those assertions.
- No React component-test framework, browser-automation package, or WebExtension mock framework is added solely for this feature.
- Chrome 127+ runtime smoke verifies: editable Target URL pre-filled from the active tab; manual replacement with another Target URL; preservation of advanced fields; hyperlink-only context-menu visibility; automatic popup opening; pending Target URL precedence; automatic submission; Shortened Link display; automatic clipboard copy; and one-time pending consumption.
- Firefox 127+ runtime smoke exercises the same normal popup and Quick Shorten paths.
- Runtime smoke verifies that Quick Shorten omits Custom Link, Password, and Short-Link Domain while retaining Reuse behavior.
- Runtime smoke with missing connection settings verifies that the context-menu action opens Options, creates no pending Target URL, and performs no shortening request.
- Runtime smoke forces `action.openPopup()` failure where practical, or exercises the failure coordinator at the highest available seam, and verifies pending-state cleanup plus the persistent `!` badge.
- Runtime smoke verifies that the failure badge clears on successful popup initialization and at the start of the next context-menu action without relying on a Service Worker timer.
- Runtime smoke verifies that closing the popup before completion does not create a background retry or delayed clipboard action.
- Runtime smoke forces clipboard failure and verifies that the successful Shortened Link remains visible with copy-failure feedback.
- Standard `npm test`, TypeScript checking, lint, Chrome build, and Firefox build remain required regression checks.

## Out of Scope

- Context-menu actions for selected text, images, page backgrounds, or the current page.
- Queuing or batch-shortening multiple hyperlinks.
- Preserving a selected hyperlink across Kutt Instance configuration.
- Quick Shorten support for Custom Link, Password, or explicit Short-Link Domain selection.
- Automatically keeping the popup open or continuing popup-owned clipboard work after the user closes it.
- Moving shortening or clipboard behavior into an offscreen document or a new background workflow.
- Supporting Quick Shorten on Chrome versions older than 127.
- Policy-installed Chrome 118–126 compatibility paths.
- Adding system notifications, a toast framework, or notification permission.
- Adding clipboard-read, scripting, offscreen, or downloads permissions.
- Changing the Kutt API request or response contract.
- Changing History, Options connection semantics, Shortened Link result rendering, or QR export behavior beyond integration with the new Target URL source.
- Adding browser-extension end-to-end automation infrastructure.

## Further Notes

- The existing background shortening API path remains reusable for both manual Create and Quick Shorten. The feature changes how the Target URL reaches that path, not the Kutt API contract.
- The Chrome 127 minimum decision is recorded separately because lowering the minimum later would require a fallback interaction rather than a small compatibility shim.
- Official API references: Chrome documents general `action.openPopup()` availability from Chrome 127; Firefox supports `action.openPopup()` from Firefox 109 and the chosen Firefox 127 floor already covers it.
