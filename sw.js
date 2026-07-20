const CACHE = "no-kidding-band-manager-v8.3.0";
const ASSETS = [
  "./",
  "./index.html",
  "./pixel.css?v=8.3.0",
  "./app.js?v=8.3.0",
  "./manifest.webmanifest",
  "./logo.png",
  "./top-page.png",
  "./icon.svg"
  ,"./studio.html"
  ,"./studio.css?v=8.1.0"
  ,"./studio.js?v=8.1.0"
  ,"./schedule.html"
  ,"./schedule.css?v=8.2.0"
  ,"./schedule.js?v=8.2.0"
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
