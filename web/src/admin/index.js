/**
 * Admin JavaScript - optional admin panel features
 * Only injected when needed
 */

// Import libraries you need
import axios from 'axios';
import { get } from 'lodash';

(function() {
    'use strict';

    console.log('[Proxy Admin] Initializing...');

    // Example: Fetch admin config from backend
    async function loadAdminConfig() {
        try {
            // Example API call using axios
            // const config = await axios.get('/api/admin/config');
            // return config.data;
            return { features: ['view-source', 'reload', 'inspect'] };
        } catch (err) {
            console.error('[Proxy Admin] Config load error:', err);
            return { features: [] };
        }
    }

    // Example: Add admin toolbar with dynamic features
    async function addAdminToolbar() {
        const config = await loadAdminConfig();
        const features = get(config, 'features', []);
        
        const toolbar = document.createElement('div');
        toolbar.id = 'proxy-admin-toolbar';
        toolbar.style.cssText = `
            position: fixed;
            bottom: 0;
            left: 0;
            right: 0;
            background: #333;
            color: white;
            padding: 10px;
            text-align: center;
            z-index: 9999;
            font-family: Arial, sans-serif;
            font-size: 12px;
        `;
        
        const buttons = [];
        if (features.includes('view-source')) {
            buttons.push('<button onclick="console.log(document.body.innerHTML)">View Source</button>');
        }
        if (features.includes('reload')) {
            buttons.push('<button onclick="location.reload()">Reload</button>');
        }
        if (features.includes('inspect')) {
            buttons.push('<button onclick="console.table(window.performance.getEntriesByType(\'navigation\'))">Inspect</button>');
        }
        
        toolbar.innerHTML = `⚙️ Admin Mode | ${buttons.join(' | ')}`;
        document.body.appendChild(toolbar);
    }

    // Initialize when DOM is ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', addAdminToolbar);
    } else {
        addAdminToolbar();
    }

    console.log('[Proxy Admin] Initialized successfully with axios and lodash');
})();
