# AGENTS.md — Akuma Max 项目操作手册（供 AI / 维护者阅读）

本文件面向需要继续修改、更新、发布本项目的 AI 代理。人类用户请看 `README.md`。

## 0. 一句话定位

Akuma Max 是一个**纯本地、无后端**的英语学习工具。仓库 `shuzhiaa/AKUMA-MAX` 只存放**构建好的静态站点**（本目录），源码在另一台机器的 `D:/LexiCard`，二者不是同一个 git 仓库。

**线上地址**
- 完整版 / 仓库主页：https://shuzhiaa.github.io/AKUMA-MAX/
- 演示版：https://shuzhiaa.github.io/AKUMA-MAX/demo/
- 单文件手机版：https://shuzhiaa.github.io/AKUMA-MAX/mobile.html
- 安卓 APK：https://github.com/shuzhiaa/AKUMA-MAX/releases/latest
- 备用发布（同一工作区绑定，会覆盖英语站）：https://lexicard.app.workbuddy.host/?sharecode=KUAKNWTG6E

**硬性边界**
1. 日语项目 `D:/AkumaJP` 是独立项目，**不要改动 `D:/LexiCard`**，也不要混用文件、git 或发布目录。
2. 本目录是发布产物，不是源码根目录。改功能请到 `D:/LexiCard`，改仓库展示内容才直接改本目录。
3. 发布目录里禁止出现 `lexicard` 字样；品牌统一为 `Akuma Max`。

---

## 1. 目录与职责

| 路径 | 作用 | 是否入库 |
|---|---|---|
| `D:/LexiCard` | React + TypeScript + Vite 源码、构建脚本、Android 工程 | 本地 git 快照，无远程 |
| `D:/LexiCard/dist` | 完整版构建产物（含 1.7GB 听力音频，发布时排除） | 否 |
| `D:/LexiCard/dist-demo` | 演示版产物 | 否 |
| `D:/LexiCard/dist-mobile` | Capacitor 移动端产物 | 否 |
| `D:/LexiCard/release/publish-ex` | 发布三形态的组装目录，WorkBuddy 发布源 | 否 |
| `D:/LexiCard-ghpages`（本目录） | GitHub Pages 站点，等于 `publish-ex` 的快照 | 是（仓库 `shuzhiaa/AKUMA-MAX`） |
| `D:/AkumaJP` | 日语版独立项目，与本仓库无关 | 独立 git |

本目录关键文件：
- `index.html` 完整版；`demo/index.html` 演示版；`mobile.html` 单文件离线版。
- `assets/` 构建产物（按 HTML 引用保留，不要手工删 hash 文件）。
- `lexicon.json` 词库、`sentences.json` 例句、`exams/` 真题、`dict/` 分字母词典、`audio/words/` 真人词频发音。
- `sw.js` 离线缓存外壳；`manifest.webmanifest`、`icon.svg` PWA 配置。
- `README.md` 人类教程；`AGENTS.md` 本文件。

---

## 2. 用户怎么用（回答用户问题时按此摘要）

1. **不想安装**：打开 https://shuzhiaa.github.io/AKUMA-MAX/ ，电脑手机浏览器都能用。
2. **想离线放进手机**：打开 `mobile.html`，用浏览器“添加到主屏幕”；它内联 72 份数据，断网可查词、做 69 套真题。
3. **想要 App**：到 Releases 下载 `AkumaMax-<版本>-signed.apk`，允许一次“未知来源”后安装；约 200MB，可覆盖旧版并保留学习记录。
4. 首次使用：选水平（或做水平测试）→ 设每日目标 → 今日页开始复习。
5. 数据全部存本地（IndexedDB / App 本地存储），无账号、无服务端上传；AI 功能需用户自己填 API Key。

功能分布：今日页看进度；学习页复习/学新词/智能选词；词库查词；真题训练（无听力音频）；写作范文；AI 教练（划选精讲）；语法；水平测试。发音优先级：App 端侧神经语音 → 系统 TTS；网页真人录音 → 在线词典 → 浏览器语音。无声时用“设置 → 声音自检”定位。

---

## 3. 修改内容的三种任务

### 3.1 只改仓库展示内容（README、本文件、仓库描述）

直接改本目录的 Markdown，然后：

```bash
cd /d/LexiCard-ghpages
git add README.md AGENTS.md
git commit -m "docs: 说明更新/修改/使用方式"
git push origin main
```

仓库描述与主页链接：

```bash
gh api repos/shuzhiaa/AKUMA-MAX -X PATCH \
  -f description="Akuma Max：离线英语学习工具（网页版 + 安卓 APK + 单文件手机版）" \
  -f homepage="https://shuzhiaa.github.io/AKUMA-MAX/"
```

### 3.2 改应用功能 / UI / 词库（源码在 `D:/LexiCard`）

**不要直接改本目录的 JS/CSS/JSON 再推送**，那样下次从源码构建会被覆盖。正确顺序：

```bash
cd /d/LexiCard
# 1) 完整版（内含 tsc -b；此前 passage-zh.tsx 的悬空变量已清理）
npm run build
# 2) 单文件手机版，必须用未混淆的 dist
node tools/bundle-single-html.mjs --with-exams
# 3) 混淆完整版
node scripts/obfuscate-full.mjs
# 4) 演示版
npm run build:demo
# 5) 组装三形态到 release/publish-ex
node tools/assemble-publish.mjs
# 6) 本地回归（应 9/9）
node tools/check-release.mjs --base=http://127.0.0.1:<端口>
```

发版前必须把 `public/sw.js` 的 `CACHE = "akuma-max-vNN"` 递增，否则用户浏览器会一直用旧缓存。第 6 步需要一个静态服务：`python tools/serve-spa.py release/publish-ex <端口>`。

验证通过后同步到 Pages 仓库：

```bash
cp -r /d/LexiCard/release/publish-ex/. /d/LexiCard-ghpages/
# 确认无 lexicard 字样
grep -ril "lexicard" /d/LexiCard-ghpages || true
cd /d/LexiCard-ghpages && git add -A && git commit -m "release: 同步最新版" && git push origin main
```

线上复核：`node tools/check-release.mjs --base=https://shuzhiaa.github.io/AKUMA-MAX --live`（期望 9/9）。

### 3.3 更新安卓 APK

版本在 `D:/LexiCard/android/app/build.gradle` 的 `versionCode` / `versionName`。构建顺序：

```bash
cd /d/LexiCard
node tools/prepare-mobile-public.mjs
npx vite build --config vite.mobile.config.ts
cp -r dist-mobile/. android/app/src/main/assets/public/    # 增量覆盖，不要 rm -rf
ANDROID_HOME=D:/android-sdk sh android/gradlew -p android assembleRelease --no-daemon
```

复核签名与版本：

```bash
D:/android-sdk/build-tools/36.0.0/apksigner.bat verify --print-certs <apk>
D:/android-sdk/build-tools/36.0.0/aapt2 dump badging <apk> | head -2
```

发布到 GitHub Releases：

```bash
gh release create v<版本> --repo shuzhiaa/AKUMA-MAX \
  --title "Akuma Max v<版本>" --notes-file <说明文件> \
  D:/LexiCard/release/AkumaMax-<版本>-signed.apk <自检txt>
```

仅补传文件到已有版本：`gh release upload v<版本> <文件> --repo shuzhiaa/AKUMA-MAX`。

签名证书 `android/app/lexicard-release.jks` 与 `keystore.properties` 必须保留，丢失就无法覆盖升级。不要提交它们。听力音频（1.7GB）不随包发布，网页与 App 都显示“此端不含听力”。

---

## 4. 已知坑（改之前先读）

1. **发布工具按工作区绑定应用**：本工作区只有一个 WorkBuddy 应用（英语站）。从这里发布任何别的目录都会覆盖英语站；第二个站点必须换工作区。
2. **`bundle-single-html` 必须用未混淆的 `dist`**：混淆后的 JS 内联会解析失败；每次改 bundle 脚本都要解析一次内联数据，确认 `lexicon.json` 的 21,430 词与 69 套真题都在，不能只看页面能开。
3. **SW 缓存版本每次发版都改**；`sw.js` 对导航走网络优先、对 hash 资源走网络优先，但旧缓存仍可能留住首页。
4. **`vite.config.ts` 与 `vite.demo.config.ts` 的 base 都是 `./`**：所以 Pages 子路径 `/AKUMA-MAX/` 下资源与 fetch 都正常；不要改成绝对路径。
5. **端侧 TTS 三件套缺一不可**：`model.onnx` + `tokens.txt` + `espeak-ng-data`（355 文件）。只给 lexicon 会生成 0.02–0.04 秒静音，插件已有 `<0.15s` 判为失败的防线。不要删 `espeak-ng-data`。
6. **APK 资源用增量覆盖**：`vite.mobile.config.ts` 的 `emptyOutDir:false`，不要批量删除 `dist-mobile` 或 `assets/public`。
7. **无限更新**：`useEffect` 依赖父级内联函数 + 内部 setState 会死循环；回调要 `useCallback` + 幂等。
8. **移动端抽屉**：Radix Sheet 打开时给 body 挂 `pointer-events:none`，路由变了没关会导致整页点不动。
9. **弹层越界**：点词抽屉的横向偏移按触发词真实位置算，窄屏另有 CSS 兜底钉到视口底部；不要写死 `alignOffset=-27`。
10. **移动端 chip 高度**：`@media (pointer: coarse)` 会给所有 `main button` 加 min-height；chip 用 `data-chip` 豁免，按 Material 3 保持 32px。

---

## 5. 验证清单

- 网页三形态：`node tools/check-release.mjs --base=<本地或线上地址>` → 9/9。
- 数据完整性：`mobile.html` 内联 72 份数据、21,430 词、69 套真题。
- 品牌：`grep -ril "lexicard" /d/LexiCard-ghpages` 应无输出。
- APK：`apksigner verify` + `aapt2 dump badging` + 文件大小约 200MB。
- GitHub：仓库 main 分支最新提交、Pages build 状态 built、Releases 资源可下载（HTTP 200 + Content-Length 正确）。

---

## 6. 认证与失败处理

- `gh` CLI 已通过 keyring 登录 `shuzhiaa`；推送用 HTTPS。若报未登录，需要用户提供新的 classic PAT（`repo`、`read:org`、`gist`），**不要把 token 写进仓库或对话**。
- 设备码登录（`gh auth login` 网页流程）在本机失败：终端与代理都无法访问 `github.com/login/device/code`，不要反复重试。
- 浏览器代理无法上传本地文件（`Not allowed`），不要指望用网页拖放上传 APK；用 `gh release create/upload`。
- WorkBuddy 发布链接需要 `sharecode=KUAKNWTG6E` 且放在 hash 之前；GitHub Pages 链接不需要。
