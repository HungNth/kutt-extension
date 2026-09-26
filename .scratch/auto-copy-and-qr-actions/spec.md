# Auto-Copy Shortened Links and Expose QR Actions

Status: ready-for-human

## Problem Statement

After the extension creates a Shortened Link, the user must manually click the result to copy it. The popup also hides the QR code behind an icon and offers no way to copy the QR image or download it as a file. These extra steps interrupt the primary create-and-share workflow and make the QR result less useful.

## Solution

After a successful Create action, automatically copy the Shortened Link to the clipboard while continuing to show the existing clickable URL as a manual copy path. Show the QR code immediately below the Shortened Link in the popup, with explicit actions to copy the QR image and download it as a PNG.

Clipboard or download failures must not turn a successfully created Shortened Link into a creation error. The popup will keep the result visible and show a short, accessible action status. The History page and its current QR modal remain unchanged.

## User Stories

1. As a user creating a Shortened Link, I want the result copied automatically, so that I can paste it without another click.
2. As a user, I want the Shortened Link to remain visible after automatic copy, so that I can inspect or open the result.
3. As a user, I want to click the displayed Shortened Link to copy it again, so that the existing manual copy path remains available.
4. As a user, I want confirmation that automatic copy succeeded, so that I know the clipboard contains the new Shortened Link.
5. As a user whose browser rejects automatic copy, I want the created result preserved, so that a clipboard failure does not hide or misreport a successful API operation.
6. As a user whose browser rejects automatic copy, I want a clear failure status, so that I know to use the manual copy action.
7. As a user, I want the QR code shown immediately after successful creation, so that I do not need to discover or click a reveal icon.
8. As a user, I want the QR code directly below the Shortened Link, so that the textual and scannable forms of the result are grouped together.
9. As a user, I want to copy the QR code as an image, so that I can paste it into another application.
10. As a user, I want feedback after copying the QR image, so that I know the image reached the clipboard.
11. As a user, I want a QR copy failure reported without losing the Shortened Link, so that I can still download or scan the QR code.
12. As a user, I want to download the QR code as a PNG, so that I can save and share it outside the extension.
13. As a user, I want the downloaded QR image to have a predictable name derived from the Shortened Link, so that saved files are identifiable.
14. As a user, I want the downloaded QR image to be larger than its popup preview, so that it remains clear when shared or printed.
15. As a keyboard user, I want Copy QR and Download QR to be real buttons, so that I can reach and activate them without a pointer.
16. As a screen-reader user, I want action outcomes announced accessibly, so that visual feedback is not the only indication of success or failure.
17. As a Chrome user, I want automatic link copy and QR image copy to work with the extension's declared permissions, so that browser gesture timing does not make the feature unreliable.
18. As a Firefox user, I want the same clipboard behavior on supported Firefox versions, so that the popup workflow is consistent across target browsers.
19. As a History user, I want the existing QR modal behavior to remain unchanged, so that this popup improvement does not redesign History.
20. As a maintainer, I want QR export behavior implemented with the installed QR dependency and browser APIs, so that no new package or duplicate QR encoder is introduced.

## Implementation Decisions

- The feature applies only to the popup result shown after Create succeeds. The History page and its QR modal are unchanged.
- The successful API response remains the authority for the Shortened Link. Clipboard work begins only after the shortening request succeeds.
- The popup automatically writes the full Shortened Link to the clipboard after creation. The existing click-to-copy URL behavior remains as a manual fallback.
- The manifest adds the `clipboardWrite` permission. The shortening request completes asynchronously, so relying on transient activation from the original Create click is not reliable across Chrome and Firefox.
- A clipboard failure is an action failure, not a shortening failure. It must not replace the successful result, set the request status to an API error, or trigger another shortening request.
- The QR reveal icon and popup-local reveal state are removed. A 250×250 QR preview is always visible directly below the Shortened Link after successful creation.
- Copy QR writes an `image/png` clipboard item. Download QR produces a PNG file. Both actions use the same QR image generation path.
- The exported PNG is 512×512 with a white background. The popup presents it at 250×250 CSS pixels and uses a 320px minimum width so the QR remains square without crowding.
- QR generation reuses the installed `qrcode.react` dependency and native browser APIs. No new QR, clipboard, or download dependency is added.
- The downloaded filename is `kutt-qr-<short-code>.png`, with unsafe filename characters removed. If no usable short code can be derived, the fallback name is `kutt-qr.png`.
- Download uses an in-memory PNG and the browser's native download behavior from the popup. The feature does not require the WebExtension `downloads` permission.
- Copy QR and Download QR are semantic buttons with visible labels. Their 36px minimum height and 0.8125rem font size match the Create button. Action feedback is a short status rendered below the result and exposed through an accessible live region.
- Success and failure statuses do not remove the result. A newer action status replaces the previous one and clears after a short interval.
- Firefox minimum support increases from 112 to 127 because standards-based PNG clipboard writes are available from Firefox 127. Chrome minimum support remains 88.
- Existing Shortened Link terminology follows `CONTEXT.md`. User-facing copy may continue to use concise language appropriate to the popup.

## Testing Decisions

- Permanent Node tests cover only deterministic browser-independent QR export policy: safe filename derivation and fallback naming. They do not claim to encode or inspect PNG bytes.
- QR rasterization uses browser canvas and Blob APIs. PNG dimensions, white background, encoded value, clipboard integration, native download behavior, accessible statuses, and failure handling are verified through Chrome and Firefox runtime smoke testing.
- No image encoder or browser-test dependency is added solely to inspect browser-produced PNG bytes in Node.
- No new component-testing framework is introduced for this feature.
- Chrome smoke verification must create a Shortened Link and observe: automatic URL copy, retained click-to-copy URL behavior, immediately visible QR preview, successful Copy QR image paste, successful PNG download, and transient success statuses.
- Firefox 127+ smoke verification must exercise the same successful path.
- At least one runtime smoke must deny or otherwise force a clipboard write failure and observe that the Shortened Link and QR remain visible while a copy failure status is shown.
- The downloaded PNG must be opened or decoded to verify that it is 512×512, has a white background, and encodes the displayed Shortened Link.
- History must be opened after the change to confirm its existing click-to-open QR modal remains unchanged.
- The standard test, lint, Chrome build, Firefox build, and bounded development-watch commands remain regression checks.

## Out of Scope

- Changing the Kutt API request or response contract.
- Changing how the source URL, custom alias, password, Short-Link Domain, or reuse option is submitted.
- Changing the History table, History QR icon, or History QR modal.
- Copying SVG data to the clipboard or downloading SVG files.
- Supporting Firefox versions older than 127 in the new release.
- Adding a WebExtension downloads permission or a download-management interface.
- Adding QR customization such as colors, logos, error-correction controls, dimensions, or file-format selection.
- Adding a persistent notification system, toast framework, or browser notification.
- Adding a React component-test or browser-automation framework.

## Further Notes

- The popup already uses `qrcode.react` and a URL copy dependency. The implementation should delete obsolete QR reveal state rather than preserve both interaction models.
- `clipboardWrite` grants write access only; this feature does not request clipboard read access.
- The standard Clipboard API supports PNG image writes in Chrome from version 76 and Firefox from version 127. The chosen browser minimums therefore allow one standards-based implementation.
- This feature does not require an ADR. The decisions are local, reversible UI behavior built on established browser APIs rather than a hard-to-reverse architectural trade-off.

## Comments

- Implementation and deterministic verification are complete in the working tree. Manual Chrome and Firefox extension smoke verification remains because this environment could not load the unpacked extension into an attachable browser target.

