# 02: Show and Export the Popup QR Code

**What to build:** Show the QR code immediately below every successfully created Shortened Link in the popup and provide explicit Copy QR and Download QR actions. Both actions export a white-background 512×512 PNG while the popup presents a square 250×250 preview at a 320px minimum width. The History QR interaction remains unchanged.

**Blocked by:** 01: Auto-Copy the Created Shortened Link.

**Status:** ready-for-human

**Parent specification:** [Auto-Copy Shortened Links and Expose QR Actions](../spec.md)

**Testing seam:** One pure filename-policy helper covered by the existing `node:test` setup, plus runtime PNG, clipboard, download, and popup smoke checks in Chrome and Firefox 127+.

**Demo path:** Create a Shortened Link, observe the QR without clicking a reveal control, copy and paste the QR image, download and inspect the PNG, then open History and confirm its existing QR modal still works.

- [ ] The popup removes the QR reveal icon and reveal state; a 250×250 QR preview is visible directly below the Shortened Link after successful creation, and the popup has a 320px minimum width so the preview is not compressed.
- [ ] The QR encodes the full Shortened Link returned by the Kutt Instance.
- [ ] Copy QR is a keyboard-accessible semantic button that writes the QR as `image/png` and reports a short accessible success or failure status without removing the result.
- [ ] Download QR is a keyboard-accessible semantic button that downloads the same QR as a PNG without requesting the WebExtension downloads permission.
- [ ] Copy QR and Download QR use the Create button's 36px minimum height and 0.8125rem font size for consistent sizing.
- [ ] The exported PNG is 512×512 with a white background and remains scannable after download or paste.
- [ ] The downloaded filename is `kutt-qr-<short-code>.png` with unsafe characters removed, falling back to `kutt-qr.png` when no usable short code exists.
- [ ] QR rendering and export reuse the installed QR dependency and native browser APIs; no new QR, clipboard, or download dependency is added.
- [ ] Firefox minimum support is raised to 127 and Chrome minimum support remains 88.
- [ ] Permanent helper tests cover safe deterministic filename derivation and fallback naming without asserting React wiring, source text, or browser-produced PNG bytes.
- [ ] Chrome and Firefox 127+ smoke checks prove immediate QR display, a 512×512 white-background PNG encoding the Shortened Link, image clipboard copy, PNG download, accessible action feedback, and retention of the successful result after an action failure.
- [ ] History retains its current click-to-open QR modal behavior.

## Comments

- Implementation is present in the working tree. The filename-policy tests and deterministic project checks pass. Manual browser verification remains for PNG clipboard contents, downloaded PNG dimensions/background/scannability, action statuses, and unchanged History interaction.
