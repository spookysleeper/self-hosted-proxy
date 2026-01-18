# Example: Creating a Custom Analytics Library

This example shows how to create a new injected library that tracks user behavior.

## 1. Create the source file

Create `web/src/analytics/index.js`:

```javascript
import axios from 'axios';
import { debounce, throttle } from 'lodash';
import { format } from 'date-fns';

class AnalyticsTracker {
    constructor(config = {}) {
        this.endpoint = config.endpoint || '/api/analytics';
        this.sessionId = this.generateSessionId();
        this.events = [];
        this.batchSize = config.batchSize || 10;
        
        this.init();
    }

    generateSessionId() {
        return `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    }

    init() {
        // Track page view
        this.trackPageView();
        
        // Track clicks
        document.addEventListener('click', (e) => {
            this.trackClick(e);
        });
        
        // Track scroll depth
        window.addEventListener('scroll', throttle(() => {
            this.trackScroll();
        }, 1000));
        
        // Track time on page
        this.startTime = Date.now();
        window.addEventListener('beforeunload', () => {
            this.trackTimeOnPage();
        });
        
        // Auto-flush events periodically
        setInterval(() => this.flush(), 30000);
    }

    trackPageView() {
        this.track('page_view', {
            url: window.location.href,
            title: document.title,
            referrer: document.referrer,
            timestamp: format(new Date(), 'yyyy-MM-dd HH:mm:ss')
        });
    }

    trackClick(event) {
        const target = event.target;
        this.track('click', {
            tag: target.tagName,
            id: target.id,
            class: target.className,
            text: target.innerText?.substring(0, 50),
            x: event.clientX,
            y: event.clientY
        });
    }

    trackScroll() {
        const scrollPercent = Math.round(
            (window.scrollY / (document.body.scrollHeight - window.innerHeight)) * 100
        );
        this.track('scroll', { depth: scrollPercent });
    }

    trackTimeOnPage() {
        const duration = Math.round((Date.now() - this.startTime) / 1000);
        this.track('time_on_page', { duration });
        this.flush();
    }

    track(eventName, data = {}) {
        this.events.push({
            event: eventName,
            session: this.sessionId,
            data,
            timestamp: Date.now()
        });
        
        if (this.events.length >= this.batchSize) {
            this.flush();
        }
    }

    async flush() {
        if (this.events.length === 0) return;
        
        const batch = [...this.events];
        this.events = [];
        
        try {
            await axios.post(this.endpoint, { events: batch });
            console.log(`[Analytics] Sent ${batch.length} events`);
        } catch (err) {
            console.error('[Analytics] Failed to send events:', err);
            // Re-add events back to queue
            this.events.unshift(...batch);
        }
    }
}

// Initialize and expose globally
window.ProxyAnalytics = new AnalyticsTracker({
    endpoint: '/api/analytics',
    batchSize: 10
});

console.log('[Analytics] Tracker initialized');
```

## 2. Add to build configuration

Edit `web/build/esbuild.config.js`:

```javascript
const esbuild = require('esbuild');
const path = require('path');

const isWatch = process.argv.includes('--watch');

const buildOptions = {
  entryPoints: {
    'runtime.min': path.join(__dirname, '../src/runtime/index.js'),
    'admin.min': path.join(__dirname, '../src/admin/index.js'),
    'analytics.min': path.join(__dirname, '../src/analytics/index.js'), // ADD THIS
  },
  bundle: true,
  minify: true,
  sourcemap: true,
  outdir: path.join(__dirname, '../dist'),
  target: ['es2015'],
  format: 'iife',
  logLevel: 'info',
};

if (isWatch) {
  esbuild.context(buildOptions).then(ctx => {
    ctx.watch();
    console.log('👀 Watching for changes...');
  });
} else {
  esbuild.build(buildOptions).then(() => {
    console.log('✅ Build complete!');
  }).catch(() => process.exit(1));
}
```

## 3. Add to release script

Edit `web/release.js`:

```javascript
const libraries = [
  { name: 'runtime', file: 'runtime.min.js' },
  { name: 'admin', file: 'admin.min.js' },
  { name: 'analytics', file: 'analytics.min.js' }  // ADD THIS
];
```

## 4. Configure injection

Edit `openresty/lua/config.lua`:

```lua
_M.scripts = {
    {
        src = "/assets/js/runtime/1.0.0/runtime.min.js",
        position = "head",
        enabled = true
    },
    {
        src = "/assets/js/analytics/1.0.0/analytics.min.js",  -- ADD THIS
        position = "head",
        enabled = true
    },
    {
        src = "/assets/js/admin/1.0.0/admin.min.js",
        position = "body",
        enabled = true
    }
}
```

## 5. Build and release

```powershell
cd web
npm run release
```

## 6. Create backend endpoint (optional)

If you want to actually receive the analytics data, add this to your backend:

### Express.js example:

```javascript
app.post('/api/analytics', express.json(), (req, res) => {
    const { events } = req.body;
    
    console.log(`Received ${events.length} analytics events`);
    
    // Store in database, send to analytics service, etc.
    events.forEach(event => {
        console.log(`Event: ${event.event}`, event.data);
    });
    
    res.json({ success: true, received: events.length });
});
```

## 7. Test it

Start OpenResty and visit `http://localhost:8080/`:
- Open browser console
- Click around the page
- Scroll the page
- Check console for `[Analytics]` messages
- Events are batched and sent to `/api/analytics`

## Advanced: Conditional Loading

You can make injection conditional based on URL patterns. Edit `openresty/lua/config.lua`:

```lua
_M.scripts = {
    {
        src = "/assets/js/runtime/1.0.0/runtime.min.js",
        position = "head",
        enabled = true,
        -- Load on all pages
    },
    {
        src = "/assets/js/analytics/1.0.0/analytics.min.js",
        position = "head",
        enabled = true,
        -- Only load if path matches pattern
        condition = function()
            local uri = ngx.var.uri
            return string.match(uri, "^/app/") ~= nil
        end
    },
    {
        src = "/assets/js/admin/1.0.0/admin.min.js",
        position = "body",
        enabled = true,
        -- Only load if query param exists
        condition = function()
            local args = ngx.req.get_uri_args()
            return args.admin == "true"
        end
    }
}
```

Then update `openresty/lua/inject.lua` to check conditions:

```lua
for _, script in ipairs(config.scripts) do
    if script.enabled then
        -- Check condition if exists
        local should_load = true
        if script.condition and type(script.condition) == "function" then
            should_load = script.condition()
        end
        
        if should_load then
            local tag = string.format('<script src="%s" defer></script>\n', script.src)
            if script.position == "head" then
                table.insert(head_scripts, tag)
            else
                table.insert(body_scripts, tag)
            end
        end
    end
end
```

This allows:
- Load analytics only on `/app/*` routes
- Load admin panel only when `?admin=true` is in URL
- Different scripts for different domains/paths
