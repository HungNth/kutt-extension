# 03: Switch Kutt Instances Safely

**What to build:** Let a connected user change to another Kutt Instance without risking the working connection. Edits remain staged, failed verification leaves the active instance untouched, and successful verification replaces the connection and account data so Popup and History immediately use the new instance.

**Blocked by:** 02: Connect a Kutt Instance from Options.

**Status:** resolved

**Parent specification:** [Require a Self-Hosted Kutt Connection](../spec.md)

- [x] Options loads the active Kutt Instance URL and API Key as editable staged values without rewriting storage on mount or while the user types.
- [x] While staged values differ from the active connection, Popup, History, and shortening continue using the active saved connection until Connect succeeds.
- [x] Invalid local input or failed server verification leaves the active Kutt Instance URL, API Key, account metadata, and Short-Link Domains unchanged.
- [x] After a failed change, Popup can still shorten and History can still load through the previously active Kutt Instance.
- [x] Successful verification atomically replaces the active URL, API Key, and account metadata as one connection transition.
- [x] Account metadata from the previous Kutt Instance is replaced rather than merged, so stale Short-Link Domains cannot appear after switching.
- [x] Popup shortening, its default instance domain, Short-Link Domain choices, and History requests all use the newly connected Kutt Instance after the successful transition.
- [x] History and URL-reuse preferences survive both failed and successful connection changes.
- [x] Permanent policy tests prove failed-change preservation, successful replacement, and stale-metadata removal.
- [x] A browser smoke run demonstrates a failed switch preserving the old instance, followed by a successful switch whose shortening and History traffic reaches only the new instance.
