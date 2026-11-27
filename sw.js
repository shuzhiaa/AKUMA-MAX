/* Akuma Max Service Worker —— 离线外壳 + 词库缓存 */
/*
   版本变更即换缓存名：activate 时自动清除旧缓存。

   ★ 这个数字必须每次发版都改。改之前踩过的坑：
     CACHE 一直停在 v29，而站内资源走的是「缓存优先 + 后台更新」，
     于是浏览器永远先返回缓存里的旧 JS 包，用户看到的还是几天前的页面。
     表现就是「你说修好了，但我这儿完全没变」——不是没修，是没发出去。
   v30：暴力提升（测评 / 排期 / 训练链 / 每题独立计时）；success/warning 配色修复。
   v31：逐题独立超时（不再全局共享）；翻译/写作作答格式提示；抽题轮换；
        分批内容生成（3 天/批，带条数校验）；结果页加 95% 置信区间；
        暴力提升独立三段式骨架。
   v36：选词填空改为整篇 10 空共享 15 词池（词直接填入句子）；
        单选选中锁定/再点取消、不自动跳题；匹配一段一句；
        错因扩到 10 类（解码 6 + 解释 4）；同卷重测不计进步。
   v32：交卷不再设门槛（原「至少答一题客观题」会让只做主观题的用户永远交不了卷）。
   v80：离线导航修复——
        1) 导航请求成功后把页面本身写入缓存，离线时先按原 URL 取回，
           找不到才退回 index.html。此前 mobile.html 离线会被换成完整版首页，
           若没开过完整版（JS 未缓存）就是白屏。
        2) activate 时把当前已打开的页面（如首次访问的 mobile.html）补进缓存：
           首次访问时页面不经过 SW，不补的话第一次断网仍然打不开。
        3) 只清理本应用（akuma-max-）的旧缓存。Cache Storage 按 origin 共享，
           同一 github.io 域名下其他项目的缓存不能被误删。
*/
const CACHE = "akuma-max-v80";
const CACHE_PREFIX = "akuma-max-";
const SHELL = ["./", "./index.html", "./manifest.webmanifest", "./icon.svg"];

self.addEventListener("install", (e) => {
  e.waitUntil(caches.open(CACHE).then((c) => c.addAll(SHELL)));
  self.skipWaiting();
});

self.addEventListener("activate", (e) => {
  e.waitUntil(
    (async () => {
      const keys = await caches.keys();
      await Promise.all(
        keys
          .filter((k) => k.startsWith(CACHE_PREFIX) && k !== CACHE)
          .map((k) => caches.delete(k)),
      );
      // 补缓存当前已打开、且在本 SW 作用域内的页面
      try {
        const cache = await caches.open(CACHE);
        const wins = await self.clients.matchAll({ type: "window", includeUncontrolled: true });
        await Promise.all(
          wins.map((c) => {
            const u = new URL(c.url);
            u.hash = "";
            if (!u.href.startsWith(self.registration.scope)) return null;
            return cache.match(u.href, { ignoreSearch: true }).then((hit) =>
              hit ? null : cache.add(u.href).catch(() => {}),
            );
          }),
        );
      } catch (_) {}
    })(),
  );
  self.clients.claim();
});

self.addEventListener("fetch", (e) => {
  const req = e.request;
  if (req.method !== "GET") return;
  const url = new URL(req.url);

  // 页面导航：网络优先并写入缓存；离线时先按原 URL 取回（mobile.html、demo/ 各回各的），
  // 找不到才退回完整版 index.html
  if (req.mode === "navigate") {
    e.respondWith(
      fetch(req)
        .then((res) => {
          if (res && res.ok && url.origin === self.location.origin) {
            const copy = res.clone();
            const saving = caches.open(CACHE).then((c) => c.put(req, copy)).catch(() => {});
            // 写缓存失败不能影响已拿到的网络响应
            try {
              e.waitUntil(saving);
            } catch (_) {}
          }
          return res;
        })
        .catch(() =>
          caches
            .match(req, { ignoreSearch: true })
            .then((r) => r || caches.match("./index.html"))
            .then((r) => r || caches.match("./")),
        ),
    );
    return;
  }

  // 站内静态资源
  if (url.origin === self.location.origin) {
    // 带内容 hash 的构建产物（assets/index-XXXX.js）：
    // 文件名本身就变了，缓存优先只会让「新版本永远发不出去」。
    // 这里走网络优先，失败回退缓存（离线仍可用）。
    const isHashed = /\/assets\/.+-[A-Za-z0-9_-]{8}\.(js|css|woff2?|png|svg)$/.test(url.pathname);
    if (isHashed) {
      e.respondWith(
        fetch(req)
          .then((res) => {
            if (res && res.ok) {
              const copy = res.clone();
              caches.open(CACHE).then((c) => c.put(req, copy));
            }
            return res;
          })
          .catch(() => caches.match(req)),
      );
      return;
    }

    // 词库 / 例句 / 真题 JSON 这类大文件：缓存优先 + 后台更新
    // （它们不带 hash，体积大，重复下载代价高）
    e.respondWith(
      caches.match(req).then((cached) => {
        const network = fetch(req)
          .then((res) => {
            if (res && res.ok) {
              const copy = res.clone();
              caches.open(CACHE).then((c) => c.put(req, copy));
            }
            return res;
          })
          .catch(() => cached);
        return cached || network;
      }),
    );
  }
  // 跨域（Wikimedia 图片/音频）：直接网络，不缓存
});
