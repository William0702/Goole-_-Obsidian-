# RedNote 小红书采集到 Obsidian 扩展

这个扩展用于在小红书网页端一键采集内容，并写入 Obsidian 笔记。支持：

- 采集小红书标题、链接、网页摘要、选中文字
- 抓取并下载视频到 Obsidian Vault
- 抓取并下载主体图片到 Obsidian Vault
- 在 Obsidian 笔记中生成本地视频、本地图片、源地址和 Codex 整理要求

## 目录结构

复制给其他电脑时，请复制整个 `xhs-obsidian-extension` 文件夹。

```text
xhs-obsidian-extension/
├─ manifest.json
├─ popup.html
├─ popup.css
├─ popup.js
├─ content.js
├─ background.js
├─ local-helper.mjs
├─ start-helper.ps1
├─ README.md
└─ icons/
   ├─ icon-16.png
   ├─ icon-32.png
   ├─ icon-48.png
   └─ icon-128.png
```

## 电脑准备

### 1. 安装 Node.js

本地下载助手需要 Node.js。

检查是否已安装：

```powershell
node -v
```

如果没有输出版本号，请先安装 Node.js。

### 2. 准备 Obsidian Vault

确认目标电脑上已经有 Obsidian 仓库，并记下两个信息：

```text
Vault 名称：Obsidian 里显示的仓库名
Vault 本地路径：这个仓库在电脑上的实际路径
```

示例：

```text
Vault 名称：
YourVault

Vault 本地路径：
D:\Obsidian\YourVault
```

## 安装浏览器扩展

Chrome 或 Edge 都可以。

1. 打开扩展管理页

```text
Chrome: chrome://extensions/
Edge: edge://extensions/
```

2. 打开“开发者模式”
3. 点击“加载已解压的扩展”
4. 选择整个扩展目录：

```text
xhs-obsidian-extension
```

5. 浏览器工具栏会出现红色 `RN / RedNote` 图标

如果更新了扩展文件，需要回到扩展管理页点击“重新加载”。

## 启动本地下载助手

本地下载助手负责把视频和图片保存到 Obsidian Vault。没有启动它时，扩展只能写笔记，不能稳定下载媒体到 Vault。

在 `xhs-obsidian-extension` 目录中运行：

```powershell
powershell -ExecutionPolicy Bypass -File .\start-helper.ps1
```

启动后会监听：

```text
http://127.0.0.1:8765
```

浏览器打开这个地址看到 `404` 是正常的，因为下载接口是：

```text
http://127.0.0.1:8765/download
```

## 扩展面板设置

第一次使用时，点击工具栏里的 `RedNote` 图标，填写这些内容。

### Obsidian

```text
Vault 名称：
填写 Obsidian 里的仓库名

Vault 本地路径：
填写这个 Vault 的本地磁盘路径

笔记保存目录：
00_Inbox/小红书待整理

标签：
小红书待整理, 内容拆解
```

### 视频

```text
写入视频：
是否在笔记中写入视频部分

检测可播放后下载到 Vault：
建议开启

保留远程视频预览：
默认关闭。远程链接可能过期，长期保存以本地视频为准

视频下载子目录：
xhs-video
```

### 图片

```text
下载主体图片：
建议开启

图片范围：
封面 + 主体图 / 只要封面 / 只要主体图

图片下载子目录：
xhs-image

最多下载图片数：
建议 12；图文笔记可以调高
```

### 输出

```text
保留视频/图片源地址：
建议开启，方便排查

加入 Codex 整理要求：
建议开启。扩展会写入“知识候选生产版”的详细分析规范，方便其他 Codex 对话直接按要求逐帧/逐图分析、深度扩写、改标签并移动到知识库补充目录。
```

## 使用方式

### 视频笔记

1. 打开小红书网页视频
2. 播放视频 5-10 秒
3. 点击浏览器工具栏的 `RedNote` 图标
4. 确认勾选：

```text
写入视频
检测可播放后下载到 Vault
下载主体图片
```

5. 点击“保存当前页”

生成的 Obsidian 笔记会包含：

```markdown
## 本地视频
![[xhs-video/xxx.mp4]]

## 本地图片
![[xhs-image/xxx 01.jpg]]
```

### 图文 / 轮播笔记

1. 打开小红书图文笔记
2. 先把主体图片都翻一遍，让浏览器加载图片
3. 点击 `RedNote`
4. 可以取消“写入视频”
5. 图片范围选择：

```text
封面 + 主体图
```

6. 点击“保存当前页”

### 只保存封面

图片范围选择：

```text
只要封面
```

### 只保存文字和链接

取消：

```text
写入视频
下载主体图片
保留视频/图片源地址
```

## 输出到 Obsidian 的结构

扩展会生成类似：

```markdown
---
source: 小红书
type: video
status: raw
xhs_url: https://www.xiaohongshu.com/explore/...
notion_url:
created: 2026-06-02
local_video: xhs-video/xxx.mp4
tags:
  - 小红书待整理
  - 内容拆解
---

# 标题

## 原始链接

## 本地图片

## 封面

## 网页摘录

## 本地视频

## 主视频源地址

## 图片源地址

## 手动补充

## Codex 整理要求
```

## 常见问题

### 1. 视频没有下载

检查：

- 是否启动了 `start-helper.ps1`
- 扩展面板里的 `Vault 本地路径` 是否正确
- 视频页是否已经播放 5-10 秒
- 是否勾选了“检测可播放后下载到 Vault”

### 2. 图片没有下载

检查：

- 图文轮播是否已经翻过
- 是否勾选了“下载主体图片”
- 图片范围是否选择了“只要封面”
- 最多下载图片数是否为 0
- 本地下载助手是否启动

### 3. 抓到了评论区图片

扩展默认只抓主体大图和封面，并过滤头像、评论、图标。如果仍然混入评论区图片，可以把笔记里的 `图片源地址` 发给维护者继续收紧规则。

### 4. Obsidian 里视频不能播放

优先看 `本地视频`：

```markdown
![[xhs-video/xxx.mp4]]
```

远程视频预览可能因为小红书签名过期或防盗链失效。长期保存请以本地视频为准。

### 5. 换电脑后路径失效

每台电脑都要重新填写：

```text
Vault 名称
Vault 本地路径
```

不要直接沿用另一台电脑的磁盘路径。

## 推荐工作流

```text
小红书网页
-> RedNote 扩展采集
-> 视频/图片下载到 Obsidian Vault
-> Obsidian 保存原始素材笔记
-> 当前 Codex 对话做素材整理和知识候选生产
-> 移动到 01脚本优化服务技能知识库补充
-> 主 Codex 对话读取该目录
-> 正式更新脚本优化服务技能和 Notion 知识库
```

## 当前对话边界

本扩展生成的 `Codex 整理要求` 默认服务于“素材整理和知识候选生产”，不直接要求当前对话修改 `script-optimization-service` 技能文件。

当前对话只负责：

```text
读取 Obsidian 原始笔记
逐帧/逐图分析
生成 Codex 深度扩写版
删除粗写版
tags 改为 小红书已整理
移动到 01脚本优化服务技能知识库补充
```

正式学习和同步由主对话完成：

```text
读取知识库补充目录
筛选、去重、合并
更新 script-optimization-service
同步全局
写回 Notion
```
