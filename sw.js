const CACHE = "no-kidding-band-manager-v9.0.3-public";
const ASSETS = [
  "./", "./index.html", "./pixel.css?v=9.0.3", "./shared.css?v=9.0.3",
  "./api.js?v=9.0.3", "./app.js?v=9.0.3", "./manifest.webmanifest",
  "./logo.png", "./top-page.png", "./icon.svg",
  "./studio.html", "./studio.css?v=9.0.3", "./studio.js?v=9.0.3",
  "./schedule.html", "./schedule.css?v=9.0.3", "./schedule.js?v=9.0.3",
  "./merch.html", "./merch.css?v=9.0.3", "./merch.js?v=9.0.3",
  "./merch-images/tshirt-logo-white-front.jpg", "./merch-images/tshirt-logo-white-back.jpg",
  "./merch-images/tshirt-logo-gray.jpg", "./merch-images/tshirt-logo-blue.png",
  "./merch-images/tshirt-logo-purple.png", "./merch-images/tshirt-zombie-black-green.png",
  "./merch-images/tshirt-zombie-purple-green.png", "./merch-images/tshirt-zombie-black-yellow.png",
  "./merch-images/tshirt-zombie-purple-yellow.png", "./merch-images/tshirt-zombie-green-yellow.png",
  "./merch-images/sticker-logo.jpg", "./merch-images/sticker-character.jpg",
  "./merch-images/sticker-oni.png", "./merch-images/sticker-sign-large.jpg",
  "./merch-images/sticker-sign-medium.jpg"
];

self.addEventListener("install", event => {
  event.waitUntil(caches.open(CACHE).then(cache => cache.addAll(ASSETS)).then(() => self.skipWaiting()));
});
self.addEventListener("activate", event => {
  event.waitUntil(caches.keys().then(keys => Promise.all(keys.filter(key => key !== CACHE).map(key => caches.delete(key)))).then(() => self.clients.claim()));
});
self.addEventListener("fetch", event => {
  if (event.request.method !== "GET") return;
  const url = new URL(event.request.url);
  if (url.pathname.includes("/api/")) return;
  if (event.request.mode === "navigate") {
    event.respondWith(fetch(event.request).catch(() => caches.match(event.request).then(hit => hit || caches.match("./index.html"))));
    return;
  }
  event.respondWith(caches.match(event.request).then(cached => cached || fetch(event.request).then(response => {
    if (response.ok && response.type === "basic") {
      const copy = response.clone();
      caches.open(CACHE).then(cache => cache.put(event.request, copy));
    }
    return response;
  })));
});
