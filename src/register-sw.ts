// Handles service worker registration across environments
// - In production: register sw.js UNLESS on Lovable preview host
// - In dev/preview: unregister any existing service workers to avoid stale caches
// - Emergency kill-switch: Add ?no-sw=1 to URL to force-clear SW and caches

(function registerServiceWorker() {
  if (!('serviceWorker' in navigator)) {
    return;
  }

  const hostname = window.location.hostname;
  const isLovableDomain = hostname.endsWith('.lovable.app') || hostname.endsWith('.lovableproject.com');
  const isPreviewSubdomain = hostname.startsWith('preview--') || hostname.startsWith('id-preview--');
  const isLovablePreviewHost = isLovableDomain && isPreviewSubdomain;
  
  // Emergency kill-switch: force unregister and clear caches
  const params = new URLSearchParams(window.location.search);
  const forceNoSW = params.get('no-sw') === '1';
  
  if (forceNoSW) {
    console.debug('🛑 Emergency kill-switch activated: clearing SW and caches...');
    navigator.serviceWorker.getRegistrations().then((regs) => {
      regs.forEach((reg) => reg.unregister());
    });
    if (window.caches && caches.keys) {
      caches.keys().then((keys) => keys.forEach((k) => caches.delete(k)));
    }
    // Remove query param and reload once to re-bootstrap cleanly
    setTimeout(() => {
      const url = new URL(window.location.href);
      url.searchParams.delete('no-sw');
      window.location.replace(url.toString());
    }, 500);
    return;
  }

  if (import.meta.env.PROD) {
    // PHASE 1 HOTFIX: Disable SW on Lovable preview hosts to avoid stale cache issues
    if (isLovablePreviewHost) {
      console.debug('🚫 SW disabled on Lovable preview host. Clearing any existing SW and caches...');
      navigator.serviceWorker.getRegistrations().then((regs) => {
        regs.forEach((reg) => {
          console.debug('Unregistering SW on preview:', reg);
          reg.unregister();
        });
      });
      if (window.caches && caches.keys) {
        caches.keys().then((keys) => {
          keys.forEach((k) => {
            console.debug('Deleting cache on preview:', k);
            caches.delete(k);
          });
        });
      }
      return;
    }

    // Normal production: register SW
    window.addEventListener('load', () => {
      navigator.serviceWorker
        .register('/sw.js')
        .then((registration) => {
          console.debug('✅ SW registered: ', registration);
        })
        .catch((err) => {
          console.error('❌ SW registration failed: ', err);
        });
    });
  } else {
    // Dev/preview: ensure no SW interferes with HMR or fresh bundles
    navigator.serviceWorker.getRegistrations().then((regs) => {
      regs.forEach((reg) => {
        console.debug('Unregistering SW in dev/preview:', reg);
        reg.unregister();
      });
      // Also clear any caches created by previous SW
      if (window.caches && caches.keys) {
        caches.keys().then((keys) => keys.forEach((k) => caches.delete(k)));
      }
    });
  }
})();
