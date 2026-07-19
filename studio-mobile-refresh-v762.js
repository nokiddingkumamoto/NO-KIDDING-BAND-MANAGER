(() => {
  "use strict";

  const loadLatest = () => {
    const script = document.createElement("script");
    script.src = `studio-features-v760.js?v=7.6.2-${Date.now()}`;
    script.async = false;
    document.body.appendChild(script);
  };

  const clearOldFiles = async () => {
    try {
      if ("serviceWorker" in navigator) {
        const registrations = await navigator.serviceWorker.getRegistrations();
        await Promise.all(registrations.map(item => item.unregister()));
      }
      if ("caches" in window) {
        const keys = await caches.keys();
        await Promise.all(keys.map(key => caches.delete(key)));
      }
    } catch {
      // キャッシュ削除に失敗しても最新版の読み込みを続ける
    }
    loadLatest();
  };

  clearOldFiles();
})();
