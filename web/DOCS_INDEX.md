# 📚 Documentation Index

Welcome to the self-hosted proxy documentation!

## Getting Started

1. **[Main README](../README.md)** - Project overview, installation, and basic usage
2. **[Quick Reference](QUICKREF.md)** - Command cheatsheet and common tasks
3. **[Library README](README.md)** - JavaScript build system basics

## Using External Libraries

- **[Using External Libraries](LIBRARIES.md)** - How to import npm packages (axios, lodash, etc.)
- Includes examples with popular libraries
- Tree-shaking and bundle optimization tips

## Examples

- **[Analytics Example](EXAMPLE_ANALYTICS.md)** - Complete walkthrough of creating a custom analytics library
- Shows how to track clicks, scrolls, and page views
- Includes backend integration examples

## Quick Start

```powershell
# 1. Install dependencies
cd web
npm install

# 2. Build JavaScript libraries
npm run build

# 3. Release to public assets
npm run release

# 4. Start OpenResty (from project root)
cd ..
openresty -p . -c openresty/conf/nginx.conf

# 5. Test
# Visit http://localhost:8080/
```

## Project Structure

```
web/
├── src/              # Your JavaScript source files (edit these!)
│   ├── runtime/      # Core runtime (runs on all pages)
│   ├── admin/        # Admin panel features
│   └── ...           # Add your own libraries here
├── dist/             # Build output (auto-generated, gitignored)
├── build/            # Build configuration (esbuild)
│   └── esbuild.config.js
├── package.json      # Dependencies and build scripts
└── docs/             # This documentation
    ├── README.md
    ├── QUICKREF.md
    ├── LIBRARIES.md
    └── EXAMPLE_ANALYTICS.md
```

## Key Features

✅ **ES6+ Support** - Use modern JavaScript  
✅ **NPM Packages** - Import any library (axios, lodash, etc.)  
✅ **Auto-bundling** - esbuild bundles everything automatically  
✅ **Minification** - Automatic code minification  
✅ **Source Maps** - Debug your original code  
✅ **Versioning** - Multiple versions can coexist  
✅ **Watch Mode** - Auto-rebuild on file changes  

## Common Tasks

### Install a new library
```powershell
cd web
npm install <package-name>
```

### Edit JavaScript
Edit files in `web/src/*/index.js`

### Build
```powershell
npm run build              # Build once
npm run build:watch        # Watch for changes
npm run release            # Build + copy to public/
```

### Add a new library
See [QUICKREF.md](QUICKREF.md#add-a-new-library) for step-by-step guide

## Need Help?

- Check [QUICKREF.md](QUICKREF.md) for command syntax
- See [LIBRARIES.md](LIBRARIES.md) for library usage examples
- Review [EXAMPLE_ANALYTICS.md](EXAMPLE_ANALYTICS.md) for a complete implementation
- Check `logs/error.log` for OpenResty errors
- Run `npm run build` to see build errors

## Architecture

```
Browser Request
    ↓
OpenResty (nginx)
    ↓
Upstream Service (your app)
    ↓
HTML Response
    ↓
Lua Body Filter (inject.lua)
    ├→ Detects text/html
    ├→ Reads config.lua
    └→ Injects <script> tags
    ↓
Modified HTML Response
    ↓
Browser renders with injected scripts
    ├→ runtime.min.js (always)
    ├→ admin.min.js (conditional)
    └→ your custom scripts
```

## Support

- GitHub Issues: [Report bugs](https://github.com/spookysleeper/self-hosted-proxy/issues)
- Docs: You're reading them!
- Logs: Check `logs/error.log` and `logs/access.log`
