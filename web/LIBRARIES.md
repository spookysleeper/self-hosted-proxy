# Using External Libraries

Your JavaScript libraries support ES6 imports and esbuild will bundle everything automatically!

## How It Works

1. **Install** any npm package: `npm install <package-name>`
2. **Import** in your JS files: `import { something } from 'package-name'`
3. **Build** with esbuild: `npm run build`
4. **esbuild bundles** all dependencies into a single minified file

## Examples

### Using Axios (HTTP requests)

```javascript
import axios from 'axios';

// GET request
const data = await axios.get('https://api.example.com/data');

// POST request
await axios.post('/api/analytics', {
    page: window.location.href,
    timestamp: Date.now()
});
```

### Using Lodash (Utilities)

```javascript
import { debounce, throttle, get, uniq } from 'lodash';

// Debounce function (wait until user stops typing)
const search = debounce((query) => {
    console.log('Searching for:', query);
}, 500);

// Throttle function (limit execution rate)
const handleScroll = throttle(() => {
    console.log('Scroll position:', window.scrollY);
}, 200);

// Safe property access
const value = get(obj, 'deeply.nested.property', 'default');

// Remove duplicates
const unique = uniq([1, 2, 2, 3, 3, 3]);
```

### Using date-fns (Date formatting)

```javascript
import { format, formatDistance, parseISO } from 'date-fns';

// Format date
format(new Date(), 'PPpp'); // "Jan 18, 2026, 3:45:00 PM"

// Relative time
formatDistance(new Date(2026, 0, 1), new Date()); // "17 days ago"

// Parse ISO string
parseISO('2026-01-18T15:45:00Z');
```

### Using Day.js (Lightweight alternative to date-fns)

```bash
npm install dayjs
```

```javascript
import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';

dayjs.extend(relativeTime);

console.log(dayjs().format('YYYY-MM-DD HH:mm:ss'));
console.log(dayjs().fromNow()); // "a few seconds ago"
```

### Using Chart.js (Charts & Graphs)

```bash
npm install chart.js
```

```javascript
import { Chart } from 'chart.js/auto';

const ctx = document.createElement('canvas');
document.body.appendChild(ctx);

new Chart(ctx, {
    type: 'bar',
    data: {
        labels: ['Red', 'Blue', 'Yellow'],
        datasets: [{
            label: 'Votes',
            data: [12, 19, 3]
        }]
    }
});
```

### Using marked (Markdown parser)

```bash
npm install marked
```

```javascript
import { marked } from 'marked';

const html = marked.parse('# Hello **World**!');
document.body.innerHTML = html;
```

### Using validator.js (String validation)

```bash
npm install validator
```

```javascript
import validator from 'validator';

validator.isEmail('foo@bar.com'); // true
validator.isURL('https://example.com'); // true
validator.isCreditCard('4111111111111111'); // true
```

## Popular Libraries for Web Injection

| Library | Size | Purpose |
|---------|------|---------|
| **axios** | ~13kb | HTTP requests |
| **lodash** | ~24kb | Utility functions |
| **date-fns** | ~15kb | Date utilities |
| **dayjs** | ~2kb | Lightweight date library |
| **chart.js** | ~200kb | Charts & graphs |
| **marked** | ~20kb | Markdown parser |
| **validator** | ~40kb | String validation |
| **fuse.js** | ~12kb | Fuzzy search |
| **localforage** | ~8kb | Local storage wrapper |
| **screenfull** | ~1kb | Fullscreen API wrapper |

## Tree Shaking

esbuild automatically removes unused code. If you import only specific functions, the rest won't be included:

```javascript
// ✅ Good - only imports what you use
import { debounce } from 'lodash';

// ❌ Avoid - imports entire library
import _ from 'lodash';
```

## Bundle Size

Check bundle sizes after building:

```powershell
cd web
npm run build
# Look at dist/ folder sizes
```

To reduce size:
1. Import only what you need
2. Use smaller alternatives (dayjs vs moment)
3. Check `node_modules/` for duplicate dependencies
4. Use CDN for very large libraries

## Development Workflow

```powershell
# Terminal 1: Watch mode (auto-rebuild on changes)
cd web
npm run build:watch

# Terminal 2: Edit your code
# Files in web/src/ are watched

# When ready, release:
npm run release
```

## Common Patterns

### API Integration

```javascript
import axios from 'axios';

class ProxyAPI {
    constructor(baseURL) {
        this.client = axios.create({ baseURL });
    }

    async trackEvent(eventName, data) {
        return this.client.post('/events', { eventName, data });
    }

    async getConfig() {
        const response = await this.client.get('/config');
        return response.data;
    }
}

const api = new ProxyAPI('https://your-backend.com/api');
```

### State Management

```javascript
import { get, set } from 'lodash';

class AppState {
    constructor() {
        this.state = {};
    }

    get(path, defaultValue) {
        return get(this.state, path, defaultValue);
    }

    set(path, value) {
        set(this.state, path, value);
        this.notify(path, value);
    }

    notify(path, value) {
        console.log(`State changed: ${path} =`, value);
    }
}

const appState = new AppState();
```

## Troubleshooting

**Build fails?**
- Check `package.json` dependencies are installed: `npm install`
- Look for syntax errors in your import statements

**Bundle too large?**
- Review what you're importing
- Use tree-shaking (import specific functions)
- Consider lighter alternatives

**Library not working?**
- Check if it's browser-compatible (some Node.js libraries don't work in browsers)
- Use browser-specific alternatives when needed
