# Kutt Browser Extension

This context describes how the extension connects a user to a self-hosted Kutt deployment and creates shortened links through it.

## Language

**Kutt Instance**:
A self-hosted Kutt deployment used by the extension.
_Avoid_: Kutt.it service, custom host

**Kutt Instance URL**:
The normalized HTTPS origin of the user's Kutt Instance, without a path, query, fragment, or trailing slash.
_Avoid_: Domain, host, custom URL, server URL

**Short-Link Domain**:
A domain managed by a Kutt Instance and available for creating shortened links.
_Avoid_: Host, Kutt Instance URL

**Target URL**:
The full HTTP or HTTPS URL submitted to a Kutt Instance to create a Shortened Link.
_Avoid_: Current tab URL, destination link, original URL

**Shortened Link**:
The fully qualified URL returned by a Kutt Instance after successfully creating a short link.
_Avoid_: Shortened URL, result URL

**API Key**:
A credential issued by a Kutt Instance and used to authenticate extension requests to that instance.
_Avoid_: Token, password
