// Handles service worker registration across environments
// - In production: register sw.js
// - In dev/preview: unregister any existing service workers to avoid stale caches

if ('serviceWorker' in navigator) {
  if (import.meta.env.PROD) {
    window.addEventListener('load', () => {
      navigator.serviceWorker
        .register('/sw.js')
        .then((registration) => {
          console.log('SW registered: ', registration);
        })
        .catch((err) => {
          console.log('SW registration failed: ', err);
        });
    });
  } else {
    // Dev/preview: ensure no SW interferes with HMR or fresh bundles
    navigator.serviceWorker.getRegistrations().then((regs) => {
      regs.forEach((reg) => {
        console.log('Unregistering SW in dev/preview:', reg);
        reg.unregister();
      });
      // Also clear any caches created by previous SW
      if (window.caches && caches.keys) {
        caches.keys().then((keys) => keys.forEach((k) => caches.delete(k)));
      }
    });
  }
}
