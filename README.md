# Self-Hosted OpenResty Proxy with JavaScript Injection

OpenResty reverse proxy that automatically injects custom JavaScript into proxied web applications.

## Project Structure

```
self-hosted-proxy/
├── openresty/                  # OpenResty configuration
│   ├── conf/
│   │   ├── nginx.conf         # Main nginx config
│   │   └── conf.d/
│   │       └── sites/         # Site-specific configs
│   │           └── default.conf
│   └── lua/                   # Lua modules for injection
│       ├── config.lua         # Injection configuration
│       └── inject.lua         # Body filter logic
├── web/                       # JavaScript source & build
│   ├── src/                   # Edit your JS here
│   │   ├── runtime/           # Core runtime injected on all pages
│   │   └── admin/             # Admin toolbar (optional)
│   ├── dist/                  # Build output (gitignored)
│   ├── build/                 # Build configuration
│   ├── release.js             # Deploy built JS to public/
│   └── package.json
├── public/
│   └── assets/
│       └── js/                # Versioned JS served by OpenResty
│           ├── runtime/
│           │   └── 1.0.0/
│           └── admin/
│               └── 1.0.0/
└── logs/                      # Runtime logs (gitignored)
```

## Quick Start

### 1. Build JavaScript Libraries

```powershell
cd web
npm install
npm run build
```

This compiles `src/runtime/index.js` and `src/admin/index.js` into minified bundles in `dist/`.

### 2. Release to Public Assets

```powershell
npm run release
```

This copies built files from `web/dist/` to `public/assets/js/<name>/<version>/`

### 3. Start OpenResty

```powershell
# From project root
openresty -p . -c openresty/conf/nginx.conf
```

### 4. Test

Visit `http://localhost:8080/` - you should see a test page with:
- A blue banner at the top (injected by `runtime.js`)
- An admin toolbar at the bottom (injected by `admin.js`)
- Console logs showing injection working

## How It Works

1. **OpenResty proxies requests** to upstream services (configured in `openresty/conf/conf.d/sites/default.conf`)
2. **Lua body filter** (`openresty/lua/inject.lua`) detects HTML responses
3. **Script tags are injected** before `</head>` or `</body>` based on config
4. **JavaScript runs** on the proxied page with full DOM access

## Customizing Injected Scripts

### Edit JavaScript Source

Edit files in `web/src/`:
- `runtime/index.js` - Runs on every page
- `admin/index.js` - Admin features

**💡 You can import any npm package!** See [`web/LIBRARIES.md`](web/LIBRARIES.md) for examples using axios, lodash, date-fns, and more.

### Configure Injection

Edit `openresty/lua/config.lua` to:
- Enable/disable scripts
- Change injection position (head/body)
- Add new scripts

Example:
```lua
_M.scripts = {
    {
        src = "/assets/js/runtime/1.0.0/runtime.min.js",
        position = "head",
        enabled = true
    },
    {
        src = "/assets/js/mylib/1.0.0/mylib.min.js",
        position = "body",
        enabled = true
    }
}
```

### Version Management

Scripts are versioned in `public/assets/js/<name>/<version>/`:
- Change version in `scripts/release-libs.js`
- Update path in `openresty/lua/config.lua`
- Allows rollback and A/B testing

## Development Workflow

```powershell
# Terminal 1: Watch and rebuild JS
cd web
npm run build:watch

# Terminal 2: Run OpenResty
openresty -p . -c openresty/conf/nginx.conf

# After JS changes, release and reload:
npm run release
openresty -p . -s reload
```

## Adding a New Library

1. Create `web/src/mylib/index.js`
2. Add entry point to `web/build/esbuild.config.js`:
   ```js
   entryPoints: {
     'runtime.min': '...',
     'mylib.min': path.join(__dirname, '../src/mylib/index.js'),
   }
   ```
3. Add to `scripts/release-libs.js`:
   ```js
   { name: 'mylib', file: 'mylib.min.js' }
   ```
4. Add to `openresty/lua/config.lua`:
   ```lua
   {
       src = "/assets/js/mylib/1.0.0/mylib.min.js",
       position = "head",
       enabled = true
   }
   ```
5. Build and release:
   ```powershell
   cd web
   npm run release
   ```

## Configuration

### Proxy Upstream

Edit `openresty/conf/conf.d/sites/default.conf`:

```nginx
location / {
    proxy_pass http://your-upstream-service:3000;
    proxy_set_header Host $host;
    proxy_set_header X-Real-IP $remote_addr;
    
    # Enable injection
    body_filter_by_lua_file openresty/lua/inject.lua;
}
```

### Static Assets

Static files in `public/assets/` are served at `/assets/`:
- Cached for 1 year (immutable)
- Versioned paths allow cache busting

## Troubleshooting

**Scripts not injecting?**
- Check `logs/error.log` for Lua errors
- Verify `Content-Type: text/html` on responses
- Ensure `body_filter_by_lua_file` is enabled

**Build errors?**
- Run `npm install` in `web/` directory
- Check Node.js version (need 14+)

**OpenResty won't start?**
- Check `logs/error.log`
- Verify paths in `nginx.conf` are correct
- Ensure port 8080 is not in use

## License

MIT