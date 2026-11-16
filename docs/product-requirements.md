# Vaiblae product requirements

## Goal

Let visitors inspect supported image metadata and download a cleaned JPG, PNG or WebP without sending image bytes to any server.

## Release scope

- Local image selection, preview and size validation.
- Signature validation independent of the extension.
- Browser worker processing and output verification.
- Download and reset with temporary object URL cleanup.
- Static SEO pages, privacy disclosure, responsive interface.
- Optional AdSense slot, disabled until configured and consent is granted.

## Known limitations

Inspection recognizes metadata containers, not every metadata tag. GPS, camera and software values are not parsed individually. C2PA and pixel-level watermarks are not handled. Contact information, real AdSense publisher ID, deployment target, and consent-management integration are not configured. Browser compatibility and large-file behavior require CI and manual validation before launch.
