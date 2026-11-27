# 任务交接文档

> 最后更新：2026-11-27（第二轮：PR #1 落地 + 输入框改造 + sw.js 修复）
> 适用对象：接手本项目的维护者或 AI 代理
> 配套文档：[README.md](README.md)（用户教程）、[AGENTS.md](AGENTS.md)（维护手册）、[CONTRIBUTING.md](CONTRIBUTING.md)（协作流程）

---

## 0. 三十秒速览

**Akuma Max 是什么**：一个纯前端、无后端的英语学习工具。21,430 词词库、68 套 CET 真题、间隔重复复习、写作范文、AI 教练、语法、水平测试。数据全在本地，无账号、无服务器上传。

**当前交付的三种形态**（内容相同，打开方式不同）：

| 形态 | 地址 | 离线 | 发音 |
|---|---|---|---|
| 网页完整版 | https://shuzhiaa.github.io/AKUMA-MAX/ | 访问两次后完全离线 | 在线词典 + 浏览器语音 |
| 单文件手机版 | `mobile.html`（12.30 MB） | 完全离线（数据全内联） | 同网页版 |
| 安卓 APK | GitHub Releases `v1.3.3`（202MB） | 完全离线 | 端侧神经语音，音质最好 |

**最需要接手人知道的四件事**：

1. **源码工作区与线上产物的一致性问题已处理**：`sidecar.ts` 里已无 `DEFAULT_BASE`（v95 那项修复已同步到源码），但工作区仍有 113 个已跟踪改动 + 440 个未跟踪文件未提交（见 §4.2）。
2. **离线能力有 4 个独立失效点**（见 §6.5）——任何一个坏掉都会「页面正常但断网白屏」，且**页面上看不出异常**。
3. **GitHub 贡献者列表是异步快照**，历史改写后要等或强制重算（见 §5.3）。
4. **`node --check public/sw.js` 必须通过**——语法错一个字符，SW 整体求值失败，离线能力全废（本轮真踩过）。

---

## 1. 项目全景

四个独立目录，**互不共用文件、git 或发布目录**：

| 目录 | 内容 | 状态 |
|---|---|---|
| `D:/LexiCard` | 英语版源码：React + TS + Vite、构建脚本、Android 工程 | 本地 git，无远程；工作区有 113 已跟踪改动 + 440 未跟踪文件 |
| `D:/LexiCard-ghpages` | GitHub Pages 发布仓库，只存构建好的静态站点 | remote = `shuzhiaa/AKUMA-MAX`，main 分支 |
| `D:/AkumaJP` | 日语版独立项目（另一条产品线） | 独立 git，已提交 2 次 |
| `D:/ApkStart` + `D:/apkstart-runtime` | 安卓模拟器工具，用于在 PC 上验证 APK | 已跑通，13/13 自检通过 |

**边界规则**：
- 改功能 → 去英语源码仓库，不要直接改 Pages 仓库里的 JS/JSON/HTML（下次构建会覆盖）。
- 改文档 → 直接改 Pages 仓库的 Markdown。
- 日语版是独立项目，不要与英语版混用。

---

## 2. 线上资产清单

| 项目 | 值 |
|---|---|
| Pages 站点 | https://shuzhiaa.github.io/AKUMA-MAX/ |
| 演示版 | https://shuzhiaa.github.io/AKUMA-MAX/demo/ |
| 单文件手机版 | https://shuzhiaa.github.io/AKUMA-MAX/mobile.html |
| 源码仓库（公开） | https://github.com/shuzhiaa/AKUMA-MAX |
| 最新 Release | `v1.3.3`，含 `AkumaMax-1.3.3-signed.apk`（202MB）+ 签名自检 txt |
| 站点体积 | **63.4 MB / 6,550 个文件** |
| SW 缓存版本 | **`akuma-max-v95`** |
| 词库 | 21,430 词（unique_word_count 与 words.length 一致）；`mobile.html` 内联 98 份数据 |
| 词典分片 | `dict/` **26 个字母文件**（a–z 去掉无词条的首字母；`x.json`/`z.json` 为空对象，避免 404） |
| 真题 | **68 套（四级 35 + 六级 33）**；`exams/` 下 69 个 JSON，其中一个为索引文件 |
| 当前 JS 构建 | **`index-8hHR98hR.js`** |
| `mobile.html` | **12.30 MB**（含内联 dict 26 个文件 + 题库 69 项） |

---

## 3. GitHub 仓库状态

### 3.1 权限与人员

| 项目 | 状态 |
|---|---|
| 所有者 | `shuzhiaa`（admin） |
| 协作者 | `AurenQY`（write，2026-11-27 受邀并接受） |
| 贡献者列表 | 显示 `shuzhiaa=7 / SguZhiAA=3`（**异步快照，非实时**，见 §5.3） |
| 分支 | `main`、`collab/aurenqy-startup`（给 AurenQY 的起点，内容 = main） |
| Tag | `v1.3.3` → `48d0c1c`（已重指向改写后的等价提交） |
| PR #1 | CLOSED，作者 AurenQY，6 项修复已全部落地，无法重新打开（无共同祖先） |
| Topics | english-learning, vocabulary, spaced-repetition, offline-first, pwa, android, cet4, cet6, education, self-hosted |

### 3.2 仓库文档

- `README.md`：用户教程 + 三形态对照表（201 行）
- `AGENTS.md`：AI / 维护者手册，14 条已知坑
- `CONTRIBUTING.md`：协作指南（提 Issue / 提 PR / 长期协作）
- `HANDOFF.md`：本文

### 3.3 提交身份（重要）

所有提交必须统一用 GitHub noreply 邮箱：

```
341553122+shuzhiaa@users.noreply.github.com
```

本地已配置好（`git config user.email`）。个人邮箱 `3278222392@qq.com` 绑定在另一个账号 `SguZhiAA` 名下，一旦用它提交，贡献者列表就会出现那个账号。

---

## 4. 当前工作区状态与风险

### 4.1 Pages 仓库（干净）

`D:/LexiCard-ghpages` 工作区干净。所有文档改动已推送。

### 4.2 英语源码仓库（**需谨慎**）

`D:/LexiCard` 工作区状态（2026-11-27 实测）：

| 类别 | 数量 | 说明 |
|---|---|---|
| 已跟踪文件修改 | **113 个** | PR #1 修复 + 本轮（输入框改造、sw.js 修复、dict 补齐）应用到源码后的改动 |
| 未跟踪文件 | **440 个** | 主要在 `tools/`（含本轮新增的 12 个验证脚本）、`data/`（含本轮 6 份报告）、`android/`；含临时 wav 与模型缓存 |

**关键事实**：`src/lib/sidecar.ts` 里**已无 `DEFAULT_BASE`** —— v95 那项修复（不再硬编码本机回环地址）已经在源码里。
这一点与上一版文档写的「源码缺 v95 修复」相反，已核实修正。

**接手时的正确做法**：
1. 先跑 `tsc -b` 与 `node --check public/sw.js`，确认源码可构建、SW 无语法错。
2. 决定 113 个已跟踪改动的归属：哪些提交、哪些丢弃、哪些进 `.gitignore`。
3. **不要** `git add -A`：440 个未跟踪文件里混着开发产物与正式文档。
4. 发版前用 §6.2 的完整流程，不要跳过第 1 步（升 SW 版本）。

### 4.3 日语项目（干净）

`D:/AkumaJP` 工作区干净，最新提交 `3d290c2`，30,564 词。未部署、未发布，处于「数据地基完成」阶段。

---

## 5. 未完成事项与优先级

### 5.1 高优先级

1. **梳理英语源码仓库工作区**（§4.2）——113 + 440 个文件待定性。当前可以构建，但提交前需要人工分类。
2. **等待 GitHub 贡献者快照刷新**——main 上 11 个提交已全部 noreply，但列表仍显示旧计数。若长期不刷新，在仓库 Settings 切一次可见性（public → private → public）强制重算。

### 5.2 中优先级

3. **AurenQY 的提交落地**——他已有 write 权限和起点分支 `collab/aurenqy-startup`。只要他的一个提交合进 main，Contributors 列表就会显示他。
4. **iOS 原生版**（用户已搁置）——苹果要求所有 iOS 应用必须签名，免费账号 7 天过期、上架要审核。当前无原生包。iPhone 用户用 Safari「添加到主屏幕」的全屏 PWA 替代。
5. **日语版后续**（用户暂未要求）——数据地基已完成，下一步可选：学习闭环（复习卡）、独立 APK、独立发布域名。

### 5.3 已知但不影响功能

6. **PR #1 的 `refs/pull/1/head`** 是 GitHub 只读引用，祖先链含 3 个改写前的 QQ 邮箱提交。删不掉，只能等 GitHub 后台重建贡献者快照。
7. **`check-release.mjs --live`** 硬编码指向另一条发布线路的分享链接，与 GitHub Pages 无关。验 Pages 必须用 `--base=https://shuzhiaa.github.io/AKUMA-MAX`，**不要加 `--live`**。
8. **`exams/listening/` 有 98 份，其中 53 份没有对应试卷**；`audio/words/` 有 2309 个文件未被 `words-index.json` 引用。可能是预留，删除需产品决策。

---

## 6. 常用操作速查

### 6.1 改文档（最常见）

```bash
cd /d/LexiCard-ghpages
# 改 README.md / AGENTS.md / CONTRIBUTING.md / HANDOFF.md
git add README.md AGENTS.md CONTRIBUTING.md HANDOFF.md
git commit -m "docs: 说明改了什么"
timeout 300 env https_proxy=http://127.0.0.1:7897 http_proxy=http://127.0.0.1:7897 git push origin main
```

### 6.2 发网页版

在 `D:/LexiCard` 按**严格顺序**执行：

```bash
# 0) 前置自检（本轮新增，必做）
npx tsc -b
node --check public/sw.js          # 语法错一个字符，离线能力全废

# 1) 升 SW 缓存版本（必做，否则用户看到旧缓存）
#    编辑 public/sw.js: const CACHE = "akuma-max-vNN"

# 2) 完整版（内含 tsc -b）
npm run build
# 3) 单文件手机版，必须用未混淆的 dist
node tools/bundle-single-html.mjs --out=release/lexicard-mobile.html --with-exams
# 4) 混淆完整版
node scripts/obfuscate-full.mjs
# 5) 演示版
npm run build:demo
# 6) 组装三形态
node tools/assemble-publish.mjs
# 7) 本地回归
python tools/serve-spa.py release/publish-ex <端口>
node tools/check-release.mjs --base=http://127.0.0.1:<端口>
```

验证通过后，按 sha256 差集同步到 Pages 仓库（不要 `rm -rf`、不要按文件大小判断，同长度不同内容会漏）。

### 6.3 发 APK

版本在 `android/app/build.gradle` 的 `versionCode` / `versionName`：

```bash
node tools/prepare-mobile-public.mjs
npx vite build --config vite.mobile.config.ts
cp -r dist-mobile/. android/app/src/main/assets/public/   # 增量覆盖，不要 rm -rf
gradlew -p android assembleRelease --no-daemon
apksigner verify --print-certs <apk>
aapt2 dump badging <apk> | head -2
gh release create v<版本> --repo shuzhiaa/AKUMA-MAX --title "Akuma Max v<版本>" --notes-file <说明> <apk> <自检txt>
```

**签名证书**：`android/app/lexicard.release.jks` + `keystore.properties`，已 gitignore。丢失就无法覆盖升级，必须离线备份。

### 6.4 推送到 GitHub

环境代理对 github.com 的 CONNECT 会 502，但 Clash 本机端口 `7897` 可用：

```bash
timeout 300 env https_proxy=http://127.0.0.1:7897 http_proxy=http://127.0.0.1:7897 git push origin main
```

`gh api` 命令则直接可用（走 api.github.com）。

### 6.5 离线能力的四个必查点（本轮踩出来的）

「页面正常但断网白屏」有四个独立成因，**每次发版都要逐个确认**：

| # | 检查点 | 坏掉的症状 | 怎么查 |
|---|---|---|---|
| 1 | `node --check public/sw.js` | SW 求值失败，连注册都没有 | `node --check` + 浏览器里看 `ServiceWorker script evaluation failed` |
| 2 | 缓存写入有没有 `e.waitUntil(...)` | 访问一次后缓存只剩 4 个外壳文件，`assets/*.js` 与 `lexicon.json` 全没进去 | DevTools → Application → Cache Storage，看条目数（应 ≥8） |
| 3 | `isHashed` 正则的 hash 长度 | Vite 的 base64 hash 有 8/9 位、含 `-`/`_`，写死 `{8}` 会误判 | 对照 `dist/assets/` 实际文件名 |
| 4 | 404.html 会不会把真实文件当路由 | `/AKUMA-MAX/mobile.html` 被跳成 `#/mobile.html` → 空白 | 带扩展名的路径不该做 hash 跳转 |

另外：**Service Worker 首次安装不接管当前页面**（标准行为），
所以「访问一次就断网」看不到缓存效果，测试必须访问**两次**。

---

## 7. 环境与认证

| 项目 | 值 |
|---|---|
| 源码目录 | `D:/LexiCard` |
| Pages 目录 | `D:/LexiCard-ghpages` |
| Android SDK | `D:/android-sdk`（platforms/android-36、build-tools/36.0.0） |
| JDK | 21 |
| Android 签名 | `android/app/lexicard-release.jks` + `keystore.properties`（已 gitignore） |
| 浏览器测试 | `playwright-core`，Edge 路径 `C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe` |
| Pages 模拟器 | `node tools/serve-pages-sim.mjs`（监听 4600，服务 `release/publish-ex`，模拟子路径 + 404 回退） |
| 静态服务 | `python tools/serve-spa.py <目录> <端口>` |
| AI mock 服务 | `node tools/mock-ai-server.mjs`（监听 4599，提供 `/ok` `/slow` `/stall` `/429` `/truncate` `/examples` `/sense`） |
| GitHub CLI | 已用 keyring 登录 `shuzhiaa`；PAT 若泄露需撤销并重新生成 |
| 代理 | github.com 走 `127.0.0.1:7897`；api.github.com 直连可用 |

**注意**：磁盘紧张（C 盘曾因临时文件占满到 0 可用），大工程前先 `df -h` 检查。

---

## 8. 关键决策与原因

| 决策 | 原因 |
|---|---|
| 网页版与源码分离 | 源码含 1.7GB 听力音频与签名材料；只发布构建产物，仓库轻量可审计 |
| 端侧 TTS 必须带 espeak-ng-data | 缺它引擎能报 sampleRate 却只输出几十毫秒静音；lexicon 路线会大量 OOV |
| 不写死本机回环地址 | 原默认 sidecar 地址让每个访客都去戳自己机器，控制台一片连接失败 |
| 一词四档记忆（忘记/模糊/认识/牢记） | 分别对应 FM 重置 / -1 / +1 / +2，驱动下次出现时间 |
| 真题不含听力音频 | 原声 1.7GB 过大；题目与原文保留，可阅读作答 |
| 日语版完全独立 | 词库、记忆模型、真题都不同，共用会让包翻倍且状态迁移复杂 |
| 不走 iOS 原生 | 苹果强制签名，无法提供「免签名不过期」的原生包；PWA 是零风险替代 |
| **单文件版不注册 SW** | 它的数据全部内联在同一个 HTML 里，不需要 SW；且为了走原生朗读链注入了 `window.Capacitor`，`isNativeShell()` 为 true → 走反注册分支。这是设计意图，不是 bug |
| **每日目标与复习上限用输入框而非滑杆** | 滑杆无法精确到具体数字，且设置页那行只显示文字看不出滑杆当前值 |
| **每日目标范围 10–1000，词池只作提示** | 词池（如 8816）远大于合理目标；用词池当硬上限会让用户觉得被限制 |
| **词对/短语/句式都走全词可点** | 学生反馈「看着能点其实点不了」；统一用 `ClickableSentence` 包 `WordPopover` |

---

## 9. 已知坑索引

完整见 [AGENTS.md](AGENTS.md) 第 5 章。最容易踩的：

1. **发布工具按工作区绑定应用**——同一工作区发任何目录都会覆盖现有站点；第二站点必须换工作区。
2. **SW 缓存版本每次发版都改**——否则用户浏览器永远返回旧 JS。
3. **`bundle-single-html` 必须用未混淆的 dist**——混淆后内联会解析失败。
4. **`base` 是 `./`**——Pages 子路径下资源才正常，不要改绝对路径。
5. **Too-short 防线**——合成时长 <0.15s 判为失败，拦住「静音假成功」。
6. **改写历史后 tag 不会自动更新**——需手动重指。
7. **Contributors 是异步快照**——改写历史后不会立刻刷新。
8. **PR 分支要基于当前 main**——旧分支无共同祖先，无法合并。
9. **`sw.js` 注释块位置**——新增版本说明时，锚点若落在 `*/` 之后，那一行会变成裸文本 → 语法错误 → SW 求值失败 → 离线全废。**加完注释必须 `node --check`**。
10. **`isHashed` 正则的 hash 长度别写死**——Vite base64 hash 有 8/9 位，结尾可能是 `-`/`_`。
11. **缓存写入必须 `e.waitUntil`**——否则 SW 可能在 `put` 完成前被终止，大文件（词库 4MB）几乎必然写不进去。
12. **PowerShell here-string 会吞 `$` 与嵌套引号**——含 `${...}` 的补丁一律写进 `.py` 文件再跑，不要内联。
13. **Service Worker 首次安装不接管页面**——测试离线必须访问两次，否则看到的是「首次没有缓存」而非 bug。

---

## 10. 接手后的第一步建议

1. 读 [README.md](README.md) 了解用户视角，读 [AGENTS.md](AGENTS.md) 了解维护边界。
2. 跑一次线上回归确认基线：`node tools/check-release.mjs --base=https://shuzhiaa.github.io/AKUMA-MAX`（应 9/9）。
3. 跑一遍离线四项检查（§6.5）。
4. 检查 `D:/LexiCard` 工作区，决定 113 个已跟踪改动的归属。
5. 确认 GitHub 贡献者快照是否已刷新。
6. 任何发版前，先确认源码工作区干净且与线上产物一致。

---

## 11. 2026-11-27 本轮改动清单

### 11.1 PR #1（AurenQY）落地到源码

| 项 | 位置 |
|---|---|
| 离线导航修复（导航写缓存 + activate 补缓存 + 只清 `akuma-max-` 前缀） | `public/sw.js` |
| 演示版退场 SW 不再删完整版缓存 | `scripts/obfuscate-demo.mjs` |
| 404.html 改为跳转页（并加固：带扩展名的路径回首页） | `tools/copy-404.mjs` |
| `dict/x.json`、`dict/z.json` 补齐 | `public/dict/` |
| 词数 21,421→21,430、套数 34/32→35/33 | `index.html`、`manifest.webmanifest`、`src/pages/exam.tsx`、`exams/index.json` |
| 遗留文件 `brute-words.json.bak` 全清（6 处副本） | 各目录 |
| `ttsLocalUrl` 默认改空 + 空值跳过探活 | `src/lib/db.ts`、`src/hooks/use-settings.tsx` |
| 单文件版内联 `dict/`（26 个文件） | `tools/bundle-single-html.mjs` |

### 11.2 我在核对中额外修掉的两个真根因

| 根因 | 症状 | 修法 |
|---|---|---|
| 缓存写入是悬空 Promise（无 `waitUntil`） | 访问一次后缓存只剩 4 个外壳文件，词库与 JS 全没进 | 两条分支都 `e.waitUntil(...)` |
| `isHashed` 正则写死 `{8}` 位 | 9 位 hash（`index-CXc6iddy.js`）等被误判成非 hashed | 放宽到 `{6,12}` |

### 11.3 界面改动

| 改动 | 位置 |
|---|---|
| 易混词辨析扩到 312 条（词对 117 + 短语 102 + 形容词 53 + 句式 40），全部英文可点 | `src/pages/confused.tsx`、`tools/build-confused-plus.py` |
| 划词选句重做（`selectionchange` 兜底、`intersectsNode` 判相交、滚动重定位） | `src/components/coach/selection-layer.tsx` |
| 按义项扩展例句（`SENSE_CARD_SYS`） | `src/lib/prompts.ts`、`src/components/sense-card.tsx` |
| 例句工具条常驻（AI 补例句 / 换一批 / 清空） | `src/components/word-detail.tsx` |
| 每日目标 10–1000 自由输入（删快捷按钮） | `src/pages/study.tsx` |
| 单次复习上限滑杆 → 输入框 | `src/pages/settings.tsx` |
| 设置页彻底移除「每日新词目标」重复行 | `src/pages/settings.tsx` |
| 主题跟随系统（`enableSystem`） | `src/main.tsx`、`src/main-demo.tsx` |
| AI 传输层硬化（超时/重试/截断检测/进度） | `src/lib/ai.ts`、`src/lib/translate.ts`、`src/lib/translate-parallel.ts` |
| 长文对照翻译改逐段（并发 2）+ 进度条 | `src/components/exam/passage-zh.tsx`、`src/components/ai/ai-progress.tsx` |

### 11.4 新增验证脚本（12 个）

```
tools/pr1-verify.mjs                 14 项（子路径 / 404 / dict / SW 前缀 / 离线 / 主导航）
tools/pr1-mobile-offline-check.mjs   13 项（mobile.html 自包含 + 断网可读）
tools/input-range-check.mjs          15 项（两个输入框的范围与写库）
tools/theme-goal-check.mjs           13 项（主题跟随系统 + 目标去重）
tools/goal-cap-check.mjs              7 项（目标上限与复习截断）
tools/example-regen-check.mjs        13 项（例句生成 / 换一批 / 清空）
tools/sense-card-check.mjs           11 项（按义项例句）
tools/confused-check.mjs             19 项（312 条内容 + 全词可点 + 划词）
tools/ai-transport-check.mjs         10 项（429 重试 / 空闲超时 / 截断 / 分块）
tools/ai-ui-progress-check.mjs        9 项（真 UI 进度条）
tools/student-flow-check.mjs         31 项（学生全流程）
tools/student-deep-check.mjs         25 项（主观题判分 + 数据边界）
tools/drill-verify.mjs               22 项（专项提升计划 + 对照翻译）
```

配套工具：

```
tools/serve-pages-sim.mjs    模拟 GitHub Pages（子路径 + 404 回退），监听 4600
tools/mock-ai-server.mjs     模拟 OpenAI 兼容服务（可故意慢/挂/429/截断），监听 4599
tools/build-ai-bundle.mjs    把 src/lib/ai.ts 打成 IIFE 供浏览器里验真实传输层
```

### 11.5 本轮报告（`data/`）

```
data/pr1-apply-report.md             PR #1 落地 + 额外根因
data/input-range-report.md           输入框改造 + sw.js 语法 bug
data/theme-goal-sense-report.md      主题 / 目标去重 / 按义项例句
data/dedupe-example-regen-report.md  重复项彻底删除 + 例句重生成
data/ai-path-audit-report.md         AI 传输层审计
data/student-flow-test-report.md     学生全流程测试
data/cet4-essay-anatomy-report.md    36 篇范文解剖
data/cet4-drill-plan-report.md       专项提升计划
data/cet4-writ-tran-report.md        真题写作/翻译规律
```

---

**文档维护**：本项目状态变化后，请同步更新本文的 §2（线上资产清单）、§3（仓库状态）、§5（未完成事项）、§11（改动清单）与顶部的「最后更新」。
