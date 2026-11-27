/* 演示版的旧 Service Worker 停用开关：清掉演示版旧缓存并注销自己。
   Cache Storage 按 origin 共享，完整版（akuma-max-vNN，由根目录 sw.js 管理）的离线缓存不能一起删。 */
self.addEventListener("install",()=>{self.skipWaiting()});
self.addEventListener("activate",(e)=>{e.waitUntil((async()=>{try{const k=await caches.keys();await Promise.all(k.filter((x)=>!/^akuma-max-v\d+$/.test(x)).map((x)=>caches.delete(x)))}catch(_){}
try{await self.registration.unregister()}catch(_){}
try{const l=await self.clients.matchAll({type:"window"});l.forEach((c)=>c.navigate(c.url))}catch(_){}})())});
