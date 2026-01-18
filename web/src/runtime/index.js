/**
 * Runtime JavaScript - injected into all proxied pages
 * This runs on every page load
 */

// Import external libraries - esbuild will bundle them!
import axios from 'axios';
import { debounce, throttle } from 'lodash';
import { format } from 'date-fns';

(function() {
    'use strict';

    console.log('[Proxy Runtime] Initializing...');
    console.log('[Proxy Runtime] Current time:', format(new Date(), 'PPpp'));

    // Example: Add a custom banner
    function addBanner() {
        const banner = document.createElement('div');
        banner.id = 'proxy-banner';
        banner.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            right: 0;
            background: #2196F3;
            color: white;
            padding: 10px;
            text-align: center;
            z-index: 9999;
            font-family: Arial, sans-serif;
        `;
        banner.textContent = `🔧 Proxied by OpenResty - ${format(new Date(), 'HH:mm:ss')}`;
        document.body.prepend(banner);
    }

    // Example: Track page views with debounce (using lodash)
    const trackPageView = debounce(function() {
        console.log('[Proxy Runtime] Page view:', window.location.href);
        
        // Example: Send analytics to your backend using axios
        // axios.post('/api/analytics', {
        //     url: window.location.href,
        //     timestamp: new Date().toISOString(),
        //     userAgent: navigator.userAgent
        // }).catch(err => console.error('Analytics error:', err));
    }, 1000);

    // Example: Monitor scroll with throttle (using lodash)
    const handleScroll = throttle(() => {
        const scrollPercent = (window.scrollY / (document.body.scrollHeight - window.innerHeight)) * 100;
        console.log('[Proxy Runtime] Scroll:', Math.round(scrollPercent) + '%');
    }, 500);

    window.addEventListener('scroll', handleScroll);

    // Initialize when DOM is ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', () => {
            addBanner();
            trackPageView();
        });
    } else {
        addBanner();
        trackPageView();
    }

    console.log('[Proxy Runtime] Initialized successfully with axios, lodash, and date-fns');
})();
