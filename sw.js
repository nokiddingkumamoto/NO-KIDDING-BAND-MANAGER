const CACHE_NAME="nkbm-v182";
const CORE=[
  "./",
  "index.html",
  "styles.css?v=182",
  "app.js?v=182",
  "manifest.webmanifest",
  "assets/logo.png",
  "assets/character.png",
  "assets/icon.svg"
];

self.addEventListener("install",event=>{
  self.skipWaiting();
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache=>cache.addAll(CORE).catch(()=>{}))
  );
});

self.addEventListener("activate",event=>{
  event.waitUntil(
    caches.keys()
      .then(keys=>Promise.all(keys.filter(key=>key!==CACHE_NAME).map(key=>caches.delete(key))))
      .then(()=>self.clients.claim())
  );
});

self.addEventListener("fetch",event=>{
  const request=event.request;
  if(request.method!=="GET") return;

  const url=new URL(request.url);
  const isFreshFile =
    request.mode==="navigate" ||
    url.pathname.endsWith(".js") ||
    url.pathname.endsWith(".css") ||
    url.pathname.endsWith(".html");

  if(isFreshFile){
    event.respondWith(
      fetch(request,{cache:"no-store"})
        .then(response=>{
          const copy=response.clone();
          caches.open(CACHE_NAME).then(cache=>cache.put(request,copy));
          return response;
        })
        .catch(()=>caches.match(request).then(hit=>hit||caches.match("./")))
    );
    return;
  }

  event.respondWith(
    caches.match(request).then(hit=>
      hit || fetch(request).then(response=>{
        const copy=response.clone();
        caches.open(CACHE_NAME).then(cache=>cache.put(request,copy));
        return response;
      })
    )
  );
});
