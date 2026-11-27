# AGENTS.md — Akuma Max 维护手册（供 AI / 维护者阅读）

本文件面向需要继续修改、更新、发布本项目的 AI 代理。人类用户请看 `README.md`。

## 0. 一句话定位

Akuma Max 是一个**纯前端、无后端**的英语学习工具。本仓库只存放**构建好的静态站点**，源码在另一个独立的源码仓库（不在本仓库内），二者不是同一个 git 仓库。

**线上地址**
- 完整版 / 仓库主页：https://shuzhiaa.github.io/AKUMA-MAX/
- 演示版：https://shuzhiaa.github.io/AKUMA-MAX/demo/
- 单文件手机版：https://shuzhiaa.github.io/AKUMA-MAX/mobile.html
- 安卓 APK：https://github.com/shuzhiaa/AKUMA-MAX/releases/latest

**硬性边界**
1. 本目录是发布产物，不是源码根目录。改功能请到源码仓库，改仓库展示内容才直接改本目录。
2. 本仓库及站点产物里禁止出现 `lexicard` 字样；品牌统一为 `Akuma Max`。
3. 站点产物里禁止出现任何开发者本机的绝对路径、回环地址、分享码、内部服务名或个人邮箱。
4. 其它语言版本是独立项目，不要混用文件、git 或发布目录。

---

## 1. 目录与职责

| 位置 | 作用 | 是否入库 |
|---|---|---|
| 源码仓库根目录 | React + TypeScript + Vite 源码、构建脚本、Android 工程 | 独立 git，无远程 |
| 源码仓库 `dist/` | 完整版构建产物（含体量很大的听力音频，发布时排除） | 否 |
| 源码仓库 `dist-demo/` | 演示版产物 | 否 |
| 源码仓库 `dist-mobile/` | Capacitor 移动端产物 | 否 |
| 源码仓库 `release/publish-ex/` | 发布三形态的组装目录 | 否 |
| 本目录 | GitHub Pages 站点，等于组装目录的快照 | 是（仓库 `shuzhiaa/AKUMA-MAX`） |

本目录关键文件：
- `index.html` 完整版；`demo/index.html` 演示版；`mobile.html` 单文件离线版；`404.html` 深层路径跳转页。
- `assets/` 构建产物（按 HTML 引用保留，不要手工删 hash 文件）。
- `lexicon.json` 词库、`sentences.json` 例句、`exams/` 真题、`dict/` 分字母词典、`audio/words/` 真人词频发音。
- `sw.js` 离线缓存外壳；`manifest.webmanifest`、`icon.svg` PWA 配置。
- `README.md` 人类教程；`AGENTS.md` 本文件。

---

## 2. 用户怎么用（回答用户问题时按此摘要）

1. **不想安装**：打开 https://shuzhiaa.github.io/AKUMA-MAX/ ，电脑手机浏览器都能用。
2. **想离线放进手机**：打开 `mobile.html`，用浏览器“添加到主屏幕”；它内联 98 份数据，断网可查词、做 68 套真题。
3. **想要 App**：到 Releases 下载 `AkumaMax-<版本>-signed.apk`，允许一次“未知来源”后安装；约 200MB，可覆盖旧版并保留学习记录。
4. 首次使用：选水平（或做水平测试）→ 设每日目标 → 今日页开始复习。
5. 数据全部存本地（IndexedDB / App 本地存储），无账号、无服务端上传；AI 功能需用户自己填 API Key。

功能分布：今日页看进度；学习页复习/学新词/智能选词；词库查词；真题训练（无听力音频）；写作范文；AI 教练（划选精讲）；语法；水平测试。发音优先级：App 端侧神经语音 → 系统 TTS；网页真人录音 → 在线词典 → 浏览器语音。无声时用“设置 → 声音自检”定位。

---

## 3. 修改内容的三类任务

### 3.1 只改仓库展示内容（README、本文件、仓库描述）

直接改本目录的 Markdown，然后：

```bash
cd <本目录>
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

### 3.2 改应用功能 / UI / 词库（改源码仓库）

**不要直接改本目录的 JS/CSS/JSON 再推送**，那样下次从源码构建会被覆盖。正确顺序（在源码仓库根目录执行）：

```bash
# 1) 完整版（内含 tsc -b）
npm run build
# 2) 单文件手机版，必须用未混淆的 dist
node tools/bundle-single-html.mjs --with-exams
# 3) 混淆完整版
node scripts/obfuscate-full.mjs
# 4) 演示版
npm run build:demo
# 5) 组装三形态到 release/publish-ex
node tools/assemble-publish.mjs
# 6) 本地回归（应 9/9），需要一个静态服务
python tools/serve-spa.py release/publish-ex <端口>
node tools/check-release.mjs --base=http://127.0.0.1:<端口>
```

发版前必须把 `public/sw.js` 的 `CACHE = "akuma-max-vNN"` 递增，否则用户浏览器会一直用旧缓存。

验证通过后同步到本仓库（按差集覆盖，不要整体删除）：

```bash
cp -r <源码仓库>/release/publish-ex/. <本目录>/
# 确认无本机地址与旧品牌字样
grep -ril "lexicard" <本目录> --exclude-dir=.git --exclude=AGENTS.md || true
grep -rIl "127.0.0.1" <本目录> --exclude-dir=.git || true
cd <本目录> && git add -A && git commit -m "release: 同步最新版" && git push origin main
```

线上复核用 `node tools/check-release.mjs --base=https://shuzhiaa.github.io/AKUMA-MAX`（**不要加 `--live`**：那个开关指向另一条发布线路的分享链接，与 GitHub Pages 无关）。

### 3.3 更新安卓 APK

版本在源码仓库 `android/app/build.gradle` 的 `versionCode` / `versionName`。构建顺序：

```bash
node tools/prepare-mobile-public.mjs
npx vite build --config vite.mobile.config.ts
cp -r dist-mobile/. android/app/src/main/assets/public/    # 增量覆盖，不要 rm -rf
gradlew -p android assembleRelease --no-daemon
```

复核签名与版本（用本机 Android SDK 里的 build-tools）：

```bash
apksigner verify --print-certs <apk>
aapt2 dump badging <apk> | head -2
```

发布到 GitHub Releases：

```bash
gh release create v<版本> --repo shuzhiaa/AKUMA-MAX \
  --title "Akuma Max v<版本>" --notes-file <说明文件> \
  <apk 路径> <自检txt>
```

仅补传文件到已有版本：`gh release upload v<版本> <文件> --repo shuzhiaa/AKUMA-MAX`。

签名证书与口令配置必须在本地保留，丢失就无法覆盖升级；不要提交它们。听力音频体积过大，不随包发布，网页与 App 都显示“此端不含听力”。

---

## 4. 已知坑（改之前先读）

1. **发布工具按工作区绑定应用**：从同一个工作区发布任何别的目录都会覆盖当前站点；第二个站点必须换工作区。
2. **`bundle-single-html` 必须用未混淆的 `dist`**：混淆后的 JS 内联会解析失败；每次改 bundle 脚本都要解析一次内联数据，确认 21,430 词与 68 套真题都在，不能只看页面能开。
3. **SW 缓存版本每次发版都改**；旧缓存可能留住首页，需要用户强制刷新。
4. **Vite 的 `base` 是 `./`**：所以 Pages 子路径 `/AKUMA-MAX/` 下资源与 fetch 都正常；不要改成绝对路径。
5. **端侧 TTS 三件套缺一不可**：模型文件 + 词表 + 文本前端数据。少给文本前端，引擎会“成功”返回几十毫秒静音；插件已有 `<0.15s` 判为失败的防线。不要删文本前端数据目录。
6. **本地语音服务地址只认用户配置**：不要在代码里写死默认回环端口，否则每个访客打开页面都会去戳自己机器，控制台一片连接失败。
7. **APK 资源用增量覆盖**：移动端构建配置里 `emptyOutDir:false`，不要批量删除移动端产物目录或 assets 目录。
8. **无限更新**：`useEffect` 依赖父级内联函数 + 内部 setState 会死循环；回调要 `useCallback` + 幂等。
9. **移动端抽屉**：Radix Sheet 打开时给 body 挂 `pointer-events:none`，路由变了没关会导致整页点不动。
10. **弹层越界**：点词抽屉的横向偏移按触发词真实位置算，窄屏另有 CSS 兜底钉到视口底部；不要写死偏移量。

---

## 5. 验证清单

- 网页三形态：`node tools/check-release.mjs --base=<本地或线上地址>` → 9/9。
- 数据完整性：`mobile.html` 内联 98 份数据、21,430 词、68 套真题。
- 品牌与隐私：`grep -ril "lexicard" <本目录> --exclude-dir=.git --exclude=AGENTS.md` 应无输出；`grep -rIl "127.0.0.1" <本目录> --exclude-dir=.git` 应无输出。
- APK：`apksigner verify` + `aapt2 dump badging` + 文件大小约 200MB。
- GitHub：仓库 main 分支最新提交、Pages build 状态 built、Releases 资源可下载（HTTP 200 + Content-Length 正确）。

---

## 6. 认证与失败处理

- `gh` CLI 通过 keyring 登录仓库所有者账号；推送用 HTTPS。若报未登录，需要新的 classic PAT（`repo`、`read:org`、`gist`），**不要把 token 写进仓库或对话**，用完即删本地临时文件。
- 设备码登录（`gh auth login` 网页流程）在部分网络下不可达（无法访问 `github.com/login/device/code`），不要反复重试。
- 浏览器自动化代理通常无法把本地文件挂到网页的文件输入框（报 `Not allowed`），不要指望用网页拖放上传 APK；用 `gh release create/upload`。
- 提交历史里的作者邮箱请用 GitHub 提供的 noreply 形式，避免暴露个人邮箱并让贡献者列表归一到同一个账号。
