# RedNote to Obsidian

一个用于小红书网页端内容采集的 Chrome / Edge 扩展。它可以把小红书笔记的标题、链接、网页摘要、主体图片和视频保存到 Obsidian，并生成后续 Codex 分析整理所需的 Markdown 模板。

详细说明见：[xhs-obsidian-extension/README.md](xhs-obsidian-extension/README.md)

## 功能

- 一键采集小红书网页标题、链接、网页摘要和选中文字
- 抓取小红书视频地址，并下载视频到 Obsidian Vault
- 抓取主体图片，排除评论区头像、图标、推荐区等干扰内容
- 支持图文、视频、混合笔记采集
- 在 Obsidian 笔记中生成本地视频、本地图片、源地址和 Codex 整理要求
- 支持“素材整理和知识候选生产”工作流，方便后续主对话整理入库

## 目录结构

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
```

## 安装前准备

### 1. 安装 Node.js

本地下载助手依赖 Node.js。

检查：

```powershell
node -v
```

### 2. 准备 Obsidian Vault

需要提前知道：

```text
Vault 名称
Vault 本地路径
```

示例：

```text
Vault 名称：
YourVault

Vault 本地路径：
D:\Obsidian\YourVault
```

## 安装扩展

1. 打开浏览器扩展管理页：

```text
Chrome: chrome://extensions/
Edge: edge://extensions/
```

2. 打开“开发者模式”
3. 点击“加载已解压的扩展”
4. 选择目录：

```text
xhs-obsidian-extension
```

5. 工具栏会出现 `RedNote` 图标

## 启动本地下载助手

在 `xhs-obsidian-extension` 目录下运行：

```powershell
powershell -ExecutionPolicy Bypass -File .\start-helper.ps1
```

本地助手会监听：

```text
http://127.0.0.1:8765
```

浏览器打开该地址显示 `404` 是正常的，因为实际下载接口是：

```text
http://127.0.0.1:8765/download
```

## 基本使用

### 视频笔记

1. 打开小红书视频页
2. 播放视频 5-10 秒
3. 点击浏览器工具栏 `RedNote` 图标
4. 勾选：

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

1. 打开小红书图文页
2. 先翻完主体图片，让浏览器加载图片
3. 点击 `RedNote`
4. 可取消“写入视频”
5. 图片范围选择：

```text
封面 + 主体图
```

6. 点击“保存当前页”

## 推荐工作流

```text
小红书网页
-> RedNote 扩展采集
-> 视频/图片下载到 Obsidian Vault
-> Obsidian 保存原始素材笔记
-> Codex 做逐帧/逐图分析
-> 生成知识候选 Markdown
-> 移动到脚本优化服务技能知识库补充目录
-> 主对话正式整理入库并同步 Notion
```

## 当前对话边界

这个扩展生成的 `Codex 整理要求` 用于“素材整理和知识候选生产”。

当前采集流程不直接修改 `script-optimization-service` 技能文件。正式学习、去重、合并、同步全局和写回 Notion，建议在主对话中执行。

## 常见问题

### 视频没有下载

检查：

- 是否启动了 `start-helper.ps1`
- 扩展面板里的 `Vault 本地路径` 是否正确
- 视频页是否已经播放 5-10 秒
- 是否勾选了“检测可播放后下载到 Vault”

### 图片没有下载

检查：

- 图文轮播是否已经翻过
- 是否勾选了“下载主体图片”
- 图片范围是否选择了“只要封面”
- 最多下载图片数是否为 0
- 本地下载助手是否启动

### 远程视频不能预览

远程小红书视频链接可能会过期或有防盗链限制。长期保存请以本地视频为准：

```markdown
![[xhs-video/xxx.mp4]]
```

## 迁移到其他电脑

复制整个 `xhs-obsidian-extension` 文件夹到新电脑，然后：

1. 安装 Node.js
2. 浏览器加载已解压扩展
3. 启动 `start-helper.ps1`
4. 在扩展面板重新填写新电脑的 `Vault 名称` 和 `Vault 本地路径`
