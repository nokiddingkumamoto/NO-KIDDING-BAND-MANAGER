const CACHE = "no-kidding-band-manager-v7.2.0";
const ASSETS = [
  "./",
  "./index.html",
  "./pixel.css?v=7.2.0",
  "./app.js?v=7.2.0",
  "./manifest.webmanifest",
  "./assets/logo.png",
  "./assets/top-page.png",
  "./assets/icon.svg"
];
self.addEventListener("install", event => {
  event.waitUntil(caches.open(CACHE).then(cache => cache.addAll(ASSETS)).then(() => self.skipWaiting()));
});
self.addEventListener("activate", event => {
  event.waitUntil(caches.keys().then(keys => Promise.all(keys.filter(key => key !== CACHE).map(key => caches.delete(key)))).then(() => self.clients.claim()));
});
self.addEventListener("fetch", event => {
  if (event.request.method !== "GET") return;
  event.respondWith(fetch(event.request).then(response => {
    const copy = response.clone();
    caches.open(CACHE).then(cache => cache.put(event.request, copy));
    return response;
  }).catch(() => caches.match(event.request).then(hit => hit || caches.match("./index.html"))));
});
