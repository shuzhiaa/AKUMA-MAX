# 任务交接文档

> 最后更新：2026-11-27
> 适用对象：接手本项目的维护者或 AI 代理
> 配套文档：[README.md](README.md)（用户教程）、[AGENTS.md](AGENTS.md)（维护手册）、[CONTRIBUTING.md](CONTRIBUTING.md)（协作流程）

---

## 0. 三十秒速览

** Akuma Max 是什么**：一个纯前端、无后端的英语学习工具。21,430 词词库、68 套 CET 真题、间隔重复复习、写作范文、AI 教练、语法、水平测试。数据全在本地，无账号、无服务器上传。

**当前交付的三种形态**（内容相同，打开方式不同）：

| 形态 | 地址 | 离线 | 发音 |
|---|---|---|---|
| 网页完整版 | https://shuzhiaa.github.io/AKUMA-MAX/ | 缓存过的内容可离线 | 在线词典 + 浏览器语音 |
| 单文件手机版 | `mobile.html`（约 13MB） | 完全离线 | 同网页版 |
| 安卓 APK | GitHub Releases `v1.3.3`（202MB） | 完全离线 | 端侧神经语音，音质最好 |

**线上现状**：Pages 构建 `built`，三形态 HTTP 200，`check-release` 回归 **9/9 通过**。

**最需要接手人知道的两件事**：
1. **源码仓库的工作区状态与线上产物不一致**（见 §4.2），不要在源码仓库当前工作区直接构建发版。
2. **GitHub 仓库的协作者 AurenQY 需要一次落到 main 的提交**才会显示在 Contributors（见 §5.3）。

---

## 1. 项目全景

四个独立目录，**互不共用文件、git 或发布目录**：

| 目录 | 内容 | 状态 |
|---|---|---|
| `D:/LexiCard` | 英语版源码：React + TS + Vite、构建脚本、Android 工程 | 本地 git，无远程；工作区有大量未提交改动 |
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
| 站点体积 | 约 82MB / 6,548 个文件 |
| SW 缓存版本 | `akuma-max-v95` |
| 词库 | 21,430 词；`mobile.html` 内联 98 份数据 |
| 真题 | 68 套（`exams/` 下 69 个 JSON，其中一个是指数文件） |
| 当前 JS 构建 | `index-CKGqbOCs.js` |

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

### 3.3 提交身份（重要）

所有提交必须统一用 GitHub noreply 邮箱：

```
341553122+shuzhiaa@users.noreply.github.com
```

本地已配置好（`git config user.email`）。个人邮箱 `3278222392@qq.com` 绑定在另一个账号 `SguZhiAA` 名下，一旦用它提交，贡献者列表就会出现那个账号。

---

## 4. 当前工作区状态与风险

### 4.1 Pages 仓库（干净）

`D:/LexiCard-ghpages` 工作区干净，最新提交 `891c823`。所有文档改动已推送。

### 4.2 英语源码仓库（**高风险，需谨慎**）

`D:/LexiCard` 工作区状态：

| 类别 | 数量 | 说明 |
|---|---|---|
| 已跟踪文件修改 | 112 个（+25,405 / -14,652 行） | PR #1 修复应用到源码后的遗留，含 69 个真题 JSON、13 个 `src/lib`、10 个 `src/components` |
| 未跟踪文件 | 428 个 | 309 个在 `tools/`、39 个在 `data/`、34 个在 `android/`；含临时 wav、模型缓存、中文名文档 |

**关键风险**：源码工作区的 `src/lib/sidecar.ts` **不含**线上 v95 的修复（删除 `DEFAULT_BASE`）。也就是说，**当前源码工作区构建出来的产物 ≠ 线上 v95 产物**。

**接手时的正确做法**：
1. **不要**在源码仓库当前工作区直接 `npm run build` 发版。
2. 先确认 112 个已跟踪改动的归属：哪些应该提交、哪些应该丢弃、哪些应该进 `.gitignore`。
3. 从 clean 状态重新 applying 已提交的修复（`c8cbea8`、`96e6d48` 里的内容），再构建。
4. 或者直接以 Pages 仓库当前产物为基准，避免从源码重建。

**428 个未跟踪文件**里混有开发产物与可能的正式文件（若干中文命名的 data/docs 文档），清理前需人工判断，不要 `git add -A`。

### 4.3 日语项目（干净）

`D:/AkumaJP` 工作区干净，最新提交 `3d290c2`，30,564 词。未部署、未发布，处于"数据地基完成"阶段。

---

## 5. 未完成事项与优先级

### 5.1 高优先级

1. **梳理英语源码仓库工作区**（§4.2）——这是最大的技术债。当前状态无法安全地从源码发版。
2. **等待 GitHub 贡献者快照刷新**——main 上 11 个提交已全部 noreply，但列表仍显示旧计数。若长期不刷新，在仓库 Settings 切一次可见性（public → private → public）强制重算。

### 5.2 中优先级

3. **AurenQY 的提交落地**——他已有 write 权限和起点分支 `collab/aurenqy-startup`。只要他的一个提交合进 main，Contributors 列表就会显示他，同时挤掉 `SguZhiAA`。已在 PR #1 下留言说明步骤。
4. **iOS 原生版**（用户已搁置）——苹果要求所有 iOS 应用必须签名，免费账号 7 天过期、上架要审核。当前无原生包。iPhone 用户用 Safari「添加到主屏幕」的全屏 PWA 替代。若重启此事，需在 README 里更新说明。
5. **日语版后续**（用户暂未要求）——数据地基已完成（查词 / 词详情 / 活用表），下一步可选：学习闭环（复习卡）、独立 APK、独立发布域名。注意不共用英语版任何文件。

### 5.3 已知但不影响功能

6. **PR #1 的 `refs/pull/1/head`** 是 GitHub 只读引用，祖先链含 3 个改写前的 QQ 邮箱提交。删不掉，只能等 GitHub 后台重建贡献者快照。
7. **`check-release.mjs --live`** 硬编码指向另一条发布线路的分享链接，与 GitHub Pages 无关。验 Pages 必须用 `--base=https://shuzhiaa.github.io/AKUMA-MAX`，**不要加 `--live`**。

---

## 6. 常用操作速查

### 6.1 改文档（最常见）

```bash
cd /d/LexiCard-ghpages
# 改 README.md / AGENTS.md / CONTRIBUTING.md
git add README.md AGENTS.md CONTRIBUTING.md
git commit -m "docs: 说明改了什么"
timeout 300 env https_proxy=http://127.0.0.1:7897 http_proxy=http://127.0.0.1:7897 git push origin main
```

### 6.2 发网页版（先决条件：源码工作区已梳理干净）

在 `D:/LexiCard` 按**严格顺序**执行：

```bash
# 1) 升 SW 缓存版本（必做，否则用户看到旧缓存）
#    编辑 public/sw.js: const CACHE = "akuma-max-vNN"

# 2) 完整版（内含 tsc -b）
npm run build
# 3) 单文件手机版，必须用未混淆的 dist
node tools/bundle-single-html.mjs --with-exams
# 4) 混淆完整版
node scripts/obfuscate-full.mjs
# 5) 演示版
npm run build:demo
# 6) 组装三形态
node tools/assemble-publish.mjs
# 7) 本地回归，应 9/9
python tools/serve-spa.py release/publish-ex <端口>
node tools/check-release.mjs --base=http://127.0.0.1:<端口>
```

验证通过后，按 sha256 差集同步到 Pages 仓库（不要 `rm -rf`、不要按文件大小判断，同长度不同内容会漏）：

```bash
# Python 脚本做差集：删 ghpages 独有的旧文件，复制内容不同的文件
# 保留 .git / .nojekyll / README.md / AGENTS.md / CONTRIBUTING.md
```

然后提交推送，等 Pages `built`，线上回归：

```bash
node tools/check-release.mjs --base=https://shuzhiaa.github.io/AKUMA-MAX
```

### 6.3 发 APK

版本在 `android/app/build.gradle` 的 `versionCode` / `versionName`：

```bash
node tools/prepare-mobile-public.mjs
npx vite build --config vite.mobile.config.ts
cp -r dist-mobile/. android/app/src/main/assets/public/   # 增量覆盖，不要 rm -rf
gradlew -p android assembleRelease --no-daemon
# 复核签名与版本
apksigner verify --print-certs <apk>
aapt2 dump badging <apk> | head -2
# 发布
gh release create v<版本> --repo shuzhiaa/AKUMA-MAX --title "Akuma Max v<版本>" --notes-file <说明> <apk> <自检txt>
```

**签名证书**：`android/app/lexicard-release.jks` + `keystore.properties`，已 gitignore。丢失就无法覆盖升级，必须离线备份。

### 6.4 推送到 GitHub

环境代理对 github.com 的 CONNECT 会 502，但 Clash 本机端口 `7897` 可用：

```bash
timeout 300 env https_proxy=http://127.0.0.1:7897 http_proxy=http://127.0.0.1:7897 git push origin main
```

`gh api` 命令则直接可用（走 api.github.com）。

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
| 静态服务 | `python tools/serve-spa.py <目录> <端口>` |
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
| 不走 iOS 原生 | 苹果强制签名，无法提供"免签名不过期"的原生包；PWA 是零风险替代 |

---

## 9. 已知坑索引

完整 14 条见 [AGENTS.md](AGENTS.md) 第 5 章。最容易踩的几条：

1. **发布工具按工作区绑定应用**——同一工作区发任何目录都会覆盖现有站点；第二站点必须换工作区。
2. **SW 缓存版本每次发版都改**——否则用户浏览器永远返回旧 JS。
3. **`bundle-single-html` 必须用未混淆的 dist**——混淆后内联会解析失败。
4. **`base` 是 `./`**——Pages 子路径下资源才正常，不要改绝对路径。
5. **Too-short 防线**——合成时长 <0.15s 判为失败，拦住"静音假成功"。
6. **改写历史后 tag 不会自动更新**——需手动重指，否则贡献者统计仍算旧邮箱。
7. **Contributors 是异步快照**——改写历史后不会立刻刷新。
8. **PR 分支要基于当前 main**——旧分支无共同祖先，无法合并。

---

## 10. 接手后的第一步建议

1. 读 [README.md](README.md) 了解用户视角，读 [AGENTS.md](AGENTS.md) 了解维护边界。
2. 跑一次线上回归确认基线：`node tools/check-release.mjs --base=https://shuzhiaa.github.io/AKUMA-MAX`（应 9/9）。
3. 检查 `D:/LexiCard` 工作区，决定 112 个已跟踪改动的归属——这是当前最大的未决事项。
4. 确认 GitHub 贡献者快照是否已刷新；若 AurenQY 已完成提交，确认列表归一。
5. 任何发版前，先确认源码工作区干净且与线上产物一致。

---

**文档维护**：本项目状态变化后，请同步更新本文的 §2（线上资产清单）、§3（仓库状态）、§5（未完成事项）与 §10（最后更新于）。
