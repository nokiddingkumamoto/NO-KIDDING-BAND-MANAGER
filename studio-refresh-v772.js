(() => {
  "use strict";

  const load = () => {
    const script = document.createElement("script");
    script.src = `studio-features-v760.js?v=7.7.2-${Date.now()}`;
    script.async = false;
    document.body.appendChild(script);
  };

  Promise.resolve()
    .then(async () => {
      if ("serviceWorker" in navigator) {
        const registrations = await navigator.serviceWorker.getRegistrations();
        await Promise.all(registrations.map(item => item.unregister()));
      }
      if ("caches" in window) {
        const keys = await caches.keys();
        await Promise.all(keys.map(key => caches.delete(key)));
      }
    })
    .catch(() => {})
    .finally(load);
})();
