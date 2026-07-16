const RESET_VERSION="nkbm-reset-v221";
self.addEventListener("install",event=>{
  self.skipWaiting();
});
self.addEventListener("activate",event=>{
  event.waitUntil((async()=>{
    const keys=await caches.keys();
    await Promise.all(keys.map(key=>caches.delete(key)));
    await self.clients.claim();
    const clients=await self.clients.matchAll({type:"window",includeUncontrolled:true});
    await self.registration.unregister();
    for(const client of clients){
      try{ await client.navigate(client.url); }catch(e){}
    }
  })());
});
self.addEventListener("fetch",event=>{
  event.respondWith(fetch(event.request,{cache:"no-store"}));
});
