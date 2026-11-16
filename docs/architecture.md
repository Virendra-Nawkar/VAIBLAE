# Vaiblae architecture

Vaiblae is a static-first Next.js App Router site. Public content is statically exported; image processing is client-only and uses a dedicated Web Worker. There are no API routes, database connections, image uploads, or cloud file storage.

## Image flow

1. The browser receives a `File` through the File API and creates a temporary preview URL.
2. The client transfers an `ArrayBuffer` to `src/workers/image.worker.ts` using a transferable message.
3. The worker validates the binary signature and MIME consistency, strips recognized metadata containers, and verifies structure and metadata absence.
4. A local Blob URL is offered for download and revoked on reset, new selection, or download.

JPEG application metadata segments, selected PNG metadata chunks, and WebP EXIF/XMP chunks are removed without rasterizing image pixels. ICC color profiles are preserved. C2PA and pixel-level watermarks are not claimed as removed. The metadata report is a container-level inspection, not a full tag parser; individual GPS, camera and software tags are not decoded in this initial implementation.

## Network and privacy

No image bytes are sent in HTTP requests. The Playwright privacy test intercepts browser requests during a local file processing run and fails if request bodies are observed. Any future advertising or analytics must be disclosed and reviewed separately. The ad slot is disabled unless an owner configures a publisher ID and the visitor has locally recorded consent.

## Deployment

`next.config.mjs` exports a static site. Deploy the generated `out/` directory to a static hosting provider/CDN with HTTPS. No runtime server is needed. Set `NEXT_PUBLIC_ADSENSE_PUBLISHER_ID` only after obtaining a real publisher ID, and implement the appropriate regional consent flow before enabling advertising.

## Rollback

Keep each production static deployment as an immutable release. To roll back, repoint the CDN/static host to the previous known-good `out/` artifact and invalidate cached HTML and asset manifests. No database migrations or user file backups are involved.
