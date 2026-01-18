# Web Libraries

JavaScript libraries that get injected into proxied pages.

## Structure

- `src/` - Source JavaScript files (edit these)
- `dist/` - Built/minified files (generated)
- `build/` - Build configuration (esbuild)

## Development

```bash
# Install dependencies
npm install

# Build once
npm run build

# Build and watch for changes
npm run build:watch

# Build and release to public/assets/js
npm run release
```

## Adding a new library

1. Create a new folder in `src/` (e.g., `src/mylib/`)
2. Add `src/mylib/index.js`
3. Update `build/esbuild.config.js` to add the entry point
4. Update `scripts/release-libs.js` to include the new library
5. Update `openresty/lua/config.lua` to inject the script

## Libraries

- **runtime** - Core functionality injected into all pages
- **admin** - Admin toolbar and debugging features
