# 01: Auto-Copy the Created Shortened Link

**What to build:** After Create successfully returns a Shortened Link, copy it automatically while keeping the result visible and retaining the existing click-to-copy URL interaction. Clipboard success or failure is reported as a short accessible status, and clipboard failure never changes a successful shortening result into an API error.

**Blocked by:** None (can start immediately).

**Status:** ready-for-human

**Parent specification:** [Auto-Copy Shortened Links and Expose QR Actions](../spec.md)

**Testing seam:** Runtime popup behavior in Chrome and Firefox. No new component-test framework.

**Demo path:** Create a Shortened Link in the popup, paste it into a text field, then force a clipboard failure and verify that the result remains available for manual copy.

- [ ] A successful Create action writes the full Shortened Link to the clipboard after the Kutt Instance responds.
- [ ] The displayed Shortened Link remains clickable to copy again using the existing interaction.
- [ ] The manifest declares `clipboardWrite`, allowing the asynchronous post-request copy to work without relying on transient activation.
- [ ] Automatic copy success is announced through a short accessible status below the result.
- [ ] Automatic copy failure is announced through a short accessible status that tells the user to use the manual copy path.
- [ ] Clipboard failure leaves the Shortened Link visible and does not set, replace, or mimic a shortening API error.
- [ ] Repeated successful Create actions copy the newest Shortened Link and replace stale action status.
- [ ] Chrome and Firefox runtime smoke checks prove automatic copy, retained click-to-copy behavior, and the non-destructive failure path.

## Comments

- Implementation is present in the working tree. Tests, typecheck, lint, production builds, and bounded development-watch builds pass. Manual Chrome and Firefox popup smoke verification remains.
