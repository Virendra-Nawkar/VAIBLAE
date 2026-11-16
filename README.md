# Vaiblae

Privacy-first image metadata cleaning in the browser.

## Development

Requires Node.js 20 and npm.

```sh
npm ci
npm run dev
```

## Validation

```sh
npm run typecheck
npm test
npm run build
npx playwright install chromium
npm run test:e2e
```

The static production site is emitted to `out/`. See [architecture](docs/architecture.md) for the local-only processing design, privacy limits, advertising setup and rollback guidance.
