# Quick Reference

## Install a Library

```powershell
cd web
npm install <package-name>
```

Examples:
```powershell
npm install axios lodash date-fns
npm install chart.js marked validator
npm install dayjs fuse.js localforage
```

## Import in Your Code

```javascript
// Full import
import axios from 'axios';

// Named imports (better for tree-shaking)
import { debounce, throttle } from 'lodash';

// Default + named
import dayjs, { extend } from 'dayjs';
```

## Build Commands

```powershell
cd web

# Build once
npm run build

# Build and watch for changes
npm run build:watch

# Build and release to public/
npm run release
```

## File Locations

| Purpose | Location |
|---------|----------|
| **Edit source** | `web/src/*/index.js` |
| **Build output** | `web/dist/*.min.js` (auto-generated) |
| **Public assets** | `public/assets/js/*/<version>/*.min.js` |
| **Build config** | `web/build/esbuild.config.js` |
| **Release script** | `web/release.js` |
| **Injection config** | `openresty/lua/config.lua` |
| **Injection logic** | `openresty/lua/inject.lua` |

## Add a New Library

1. **Create source**: `web/src/mylib/index.js`
2. **Add to build**: Edit `web/build/esbuild.config.js`
   ```javascript
   entryPoints: {
     'mylib.min': path.join(__dirname, '../src/mylib/index.js'),
   }
   ```
3. **Add to release**: Edit `web/release.js`
   ```javascript
   { name: 'mylib', file: 'mylib.min.js' }
   ```
4. **Add to injection**: Edit `openresty/lua/config.lua`
   ```lua
   {
       src = "/assets/js/mylib/1.0.0/mylib.min.js",
       position = "head",
       enabled = true
   }
   ```
5. **Build**: `npm run release`
6. **Reload OpenResty**: `openresty -p . -s reload`

## OpenResty Commands

```powershell
# Start
openresty -p . -c openresty/conf/nginx.conf

# Reload config (without downtime)
openresty -p . -s reload

# Stop
openresty -p . -s stop

# Test config
openresty -p . -c openresty/conf/nginx.conf -t
```

## Check Logs

```powershell
# Error log
Get-Content logs/error.log -Tail 50

# Access log
Get-Content logs/access.log -Tail 50

# Watch logs in real-time
Get-Content logs/error.log -Wait
```

## Version Management

To release a new version:

1. Update version in `web/release.js`:
   ```javascript
   const version = '1.1.0';
   ```

2. Update paths in `openresty/lua/config.lua`:
   ```lua
   src = "/assets/js/runtime/1.1.0/runtime.min.js"
   ```

3. Release:
   ```powershell
   cd web
   npm run release
   ```

## Troubleshooting

| Problem | Solution |
|---------|----------|
| Build fails | `cd web && npm install` |
| Scripts not injecting | Check `logs/error.log` for Lua errors |
| Old script still running | Hard refresh: `Ctrl+Shift+R` |
| OpenResty won't start | Check port 8080 is free, review `logs/error.log` |
| Import not working | Ensure package is in `web/package.json` dependencies |

## Common Patterns

### Expose API to other scripts

```javascript
// In runtime/index.js
window.MyAPI = {
    track: (event, data) => { /* ... */ },
    config: { /* ... */ }
};
```

### Use API from admin script

```javascript
// In admin/index.js
if (window.MyAPI) {
    window.MyAPI.track('admin_loaded');
}
```

### Conditional features

```javascript
// Feature detection
if ('IntersectionObserver' in window) {
    // Use modern API
} else {
    // Fallback
}
```

### Storage

```javascript
// Save data
localStorage.setItem('key', JSON.stringify(data));

// Load data
const data = JSON.parse(localStorage.getItem('key') || '{}');
```

## Performance Tips

1. **Import only what you need**
   ```javascript
   // ✅ Good
   import { debounce } from 'lodash';
   
   // ❌ Bad (imports entire library)
   import _ from 'lodash';
   ```

2. **Use defer attribute** (already configured in `inject.lua`)
   ```html
   <script src="..." defer></script>
   ```

3. **Lazy load heavy features**
   ```javascript
   document.getElementById('chart-button').addEventListener('click', async () => {
       const { Chart } = await import('chart.js/auto');
       // Use Chart here
   });
   ```

4. **Check bundle sizes**
   ```powershell
   # After build
   ls web/dist/ -Sort Length
   ```

## Testing

### Test injection locally

```powershell
# Start OpenResty
openresty -p . -c openresty/conf/nginx.conf

# Visit
http://localhost:8080/

# Check console for:
# [Proxy Runtime] Initialized successfully
# [Proxy Admin] Initialized successfully
```

### Test with real upstream

Edit `openresty/conf/conf.d/sites/default.conf`:

```nginx
location / {
    proxy_pass http://localhost:3000;  # Your app
    proxy_set_header Host $host;
    body_filter_by_lua_file openresty/lua/inject.lua;
}
```

## Documentation

- [Using External Libraries](LIBRARIES.md)
- [Analytics Example](EXAMPLE_ANALYTICS.md)
- [Main README](../README.md)
