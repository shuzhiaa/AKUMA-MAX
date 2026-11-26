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
*/
const CACHE = "akuma-max-v79";
const SHELL = ["./", "./index.html", "./manifest.webmanifest", "./icon.svg"];

self.addEventListener("install", (e) => {
  e.waitUntil(caches.open(CACHE).then((c) => c.addAll(SHELL)));
  self.skipWaiting();
});

self.addEventListener("activate", (e) => {
  e.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k))),
    ),
  );
  self.clients.claim();
});

self.addEventListener("fetch", (e) => {
  const req = e.request;
  if (req.method !== "GET") return;
  const url = new URL(req.url);

  // 页面导航：网络优先，失败回退缓存（保证离线可打开）
  if (req.mode === "navigate") {
    e.respondWith(
      fetch(req).catch(() => caches.match("./index.html").then((r) => r || caches.match("./"))),
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
