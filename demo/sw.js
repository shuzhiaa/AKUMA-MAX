self.addEventListener("install",()=>{self.skipWaiting()});
self.addEventListener("activate",(e)=>{e.waitUntil((async()=>{try{const k=await caches.keys();await Promise.all(k.filter((x)=>!/^akuma-max-vd+$/.test(x)).map((x)=>caches.delete(x)))}catch(_){}
try{await self.registration.unregister()}catch(_){}
try{const l=await self.clients.matchAll({type:"window"});l.forEach((c)=>c.navigate(c.url))}catch(_){}})())});
