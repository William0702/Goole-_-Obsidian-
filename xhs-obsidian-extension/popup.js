const els = {
  vault: document.getElementById("vault"),
  vaultPath: document.getElementById("vaultPath"),
  folder: document.getElementById("folder"),
  tags: document.getElementById("tags"),
  includeVideo: document.getElementById("includeVideo"),
  downloadFolder: document.getElementById("downloadFolder"),
  includeRemotePreview: document.getElementById("includeRemotePreview"),
  includeImages: document.getElementById("includeImages"),
  imageMode: document.getElementById("imageMode"),
  imageFolder: document.getElementById("imageFolder"),
  maxImages: document.getElementById("maxImages"),
  autoDownload: document.getElementById("autoDownload"),
  includeSourceUrls: document.getElementById("includeSourceUrls"),
  includeCodexPrompt: document.getElementById("includeCodexPrompt"),
  save: document.getElementById("save"),
  copy: document.getElementById("copy"),
  status: document.getElementById("status")
};

function today() {
  const d = new Date();
  return [
    d.getFullYear(),
    String(d.getMonth() + 1).padStart(2, "0"),
    String(d.getDate()).padStart(2, "0")
  ].join("-");
}

function safeFileName(value) {
  return (value || "未命名小红书内容")
    .replace(/[\\/:*?"<>|#^[\]]+/g, " ")
    .replace(/\s+/g, " ")
    .trim()
    .slice(0, 80) || "未命名小红书内容";
}

function safeDownloadFolder(value) {
  return (value || "xhs-video")
    .replace(/\\/g, "/")
    .replace(/^\/+|\/+$/g, "")
    .replace(/[<>:"|?*]+/g, " ")
    .replace(/\s+/g, " ")
    .trim() || "xhs-video";
}

function yamlTags(value) {
  const tags = value.split(",").map(tag => tag.trim()).filter(Boolean);
  return tags.length ? tags.map(tag => `  - ${tag}`).join("\n") : "  - 小红书待整理";
}

function isEmbeddableVideo(url) {
  return /\.(mp4|webm|mov)(\?|$)/i.test(url || "");
}

function videoMarkdown(url) {
  return isEmbeddableVideo(url)
    ? `<video controls src="${escapeHtml(url)}" style="width: 100%; max-height: 720px;"></video>`
    : `- ${url}`;
}

function escapeHtml(value) {
  return String(value || "")
    .replace(/&/g, "&amp;")
    .replace(/"/g, "&quot;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}

function localVideoName(data) {
  return `${today()} ${safeFileName(data.title)}.mp4`;
}

function localVideoPath(data, downloadInfo = null) {
  if (downloadInfo && downloadInfo.obsidianPath) return downloadInfo.obsidianPath;
  return `${safeDownloadFolder(els.downloadFolder.value)}/${localVideoName(data)}`;
}

function codexDeepPrompt() {
  return `请将这条小红书素材整理为“知识候选生产版”Markdown，供后续脚本优化服务主对话入库使用。

处理原则：
1. 不要只做摘要，要做可复用的方法论提炼。
2. 如果有本地视频，必须基于视频逐帧或关键帧分析，不要只依据标题和网页摘录。
3. 如果有本地图片，必须分析主体图片的视觉信息、构图、风格、可复用元素。
4. 删除粗写版，只保留最终深度版。
5. 分析完成后，将 tags 改为“小红书已整理”。
6. 分析完成后，将笔记移动到当前 Vault 下的：
   01脚本优化服务技能知识库补充

必须输出以下结构：

## Codex 深度扩写版

### 一句话总结
用一句话说明这条内容真正值得沉淀的价值，不要只复述标题。

### 素材核心价值
说明它解决了什么创作问题，适合沉淀到哪些能力模块，例如 AI 视频提示词、镜头语言、角色表演、画面质感、脚本节奏、分镜设计、短剧钩子、视觉风格等。

### 逐帧 / 逐图内容拆解
如果是视频：按关键帧或时间段拆解。
如果是图文：按图片顺序拆解。
每段至少包含：
- 画面内容
- 镜头/构图/动作/表情/光影
- 信息价值
- 可复用点

### 内容结构分析
分析这条小红书内容为什么成立，包括：
- 开头如何吸引注意
- 中间如何展示方法或结果
- 结尾如何形成收藏价值
- 是否有对比、反差、教程、清单、模板、结果展示等结构

### 爆点分析
分析它为什么容易被收藏、点赞或转发：
- 标题钩子
- 信息差
- 视觉吸引点
- 情绪价值
- 实操价值
- 适合的人群

### 可复用技巧
把内容提炼成可以迁移到其他脚本、视频、提示词、分镜里的技巧。每条技巧要具体，不要写空泛结论。

### 可沉淀到脚本优化服务的知识点
将素材转化为脚本优化服务可调用的规则，至少包含：
- 方法论规则
- 提示词写法规则
- 镜头/画面控制规则
- 稳定性约束
- 适用场景
- 不适用场景或风险

### 可复制模板 / 提示词框架
如果素材包含提示词、教程或工作流，必须整理成可直接复制的模板。
模板要包含变量占位，例如：
[角色]、[场景]、[情绪起点]、[镜头运动]、[光影氛围]、[最终效果]。

### 可转化选题
输出 5-10 个可以再次创作的小红书/短视频选题。

### 标签建议
输出适合 Obsidian、Notion 和脚本优化服务检索的标签。

质量要求：
- 分析要具体到动作、镜头、构图、视觉元素、情绪变化和提示词变量。
- 不要只说“高级”“电影感”“有氛围”，必须解释高级在哪里、电影感由什么构成、氛围由什么元素产生。
- 如果信息不足，要明确写“基于当前素材可判断”，不要编造视频中不存在的内容。
- 最终文档要像知识库条目，不像聊天回复。`;
}

function markdown(data, downloadInfo = null, imageInfo = null) {
  const primaryVideo = playableVideoUrl(data);
  const backupVideoUrls = (data.videoUrls || []).filter(url => url !== primaryVideo);
  const rawText = [data.description, data.selectedText].filter(Boolean).join("\n\n") || "待补充。";
  const parts = [
    "---",
    "source: 小红书",
    "type: video",
    "status: raw",
    `xhs_url: ${data.url}`,
    "notion_url: ",
    `created: ${today()}`,
    `local_video: ${downloadInfo && downloadInfo.started ? localVideoPath(data, downloadInfo) : ""}`,
    "tags:",
    yamlTags(els.tags.value),
    "---",
    "",
    `# ${data.title}`,
    "",
    "## 原始链接",
    data.url,
    ""
  ];

  const localImages = imageInfo && imageInfo.paths && imageInfo.paths.length
    ? imageInfo.paths.map(path => `![[${path}]]`).join("\n\n")
    : "未下载。";
  const imageNote = imageInfo && imageInfo.reason ? `\n\n图片下载说明：${imageInfo.reason}` : "";
  const imageSources = [...new Set([data.cover, ...(data.imageUrls || [])].filter(Boolean))];

  if (els.includeImages.checked) {
    parts.push("## 本地图片", `${localImages}${imageNote}`, "");
  }

  parts.push("## 封面", data.cover || "待补充", "", "## 网页摘录", rawText, "");

  if (els.includeVideo.checked) {
    const localSection = downloadInfo && downloadInfo.started
      ? `![[${localVideoPath(data, downloadInfo)}]]\n\n下载状态：已下载到 Obsidian Vault。`
      : "未下载。";
    const downloadNote = downloadInfo && downloadInfo.reason ? `\n\n下载说明：${downloadInfo.reason}` : "";
    parts.push("## 本地视频", `${localSection}${downloadNote}`, "");

    if (els.includeRemotePreview.checked) {
      parts.push(
        "## 视频预览",
        primaryVideo ? videoMarkdown(primaryVideo) : "未检测到稳定视频地址。",
        ""
      );
    }
  }

  if (els.includeSourceUrls.checked) {
    if (els.includeVideo.checked) {
      parts.push(
        "## 主视频源地址",
        primaryVideo ? `- ${primaryVideo}` : "未检测到稳定视频地址。",
        "",
        "## 备用视频源地址",
        backupVideoUrls.length ? backupVideoUrls.map(url => `- ${url}`).join("\n") : "无。",
        ""
      );
    }
    if (els.includeImages.checked) {
      parts.push(
        "## 图片源地址",
        imageSources.length ? imageSources.map(url => `- ${url}`).join("\n") : "未检测到图片地址。",
        ""
      );
    }
  }

  parts.push("## 手动补充", "- 收藏原因：\n- 视频大意：\n- 关键字幕：", "");

  if (els.includeCodexPrompt.checked) {
    parts.push(
      "## Codex 整理要求",
      codexDeepPrompt(),
      ""
    );
  }

  return parts.join("\n");
}

async function getActiveTab() {
  const tabs = await chrome.tabs.query({ active: true, currentWindow: true });
  return tabs[0];
}

async function collectData() {
  const tab = await getActiveTab();
  if (!tab || !tab.id) throw new Error("没有找到当前页面。");
  let backgroundVideoUrls = [];
  try {
    const result = await chrome.runtime.sendMessage({ type: "get-tab-video-urls", tabId: tab.id });
    backgroundVideoUrls = result && result.videoUrls ? result.videoUrls : [];
  } catch {
    backgroundVideoUrls = [];
  }

  try {
    const data = await chrome.tabs.sendMessage(tab.id, { type: "collect-xhs-page" });
    data.videoUrls = [...new Set([...(data.videoUrls || []), ...backgroundVideoUrls])];
    data.imageUrls = [...new Set(data.imageUrls || [])];
    return data;
  } catch {
    return {
      title: tab.title || "未命名小红书内容",
      url: tab.url || "",
      description: "",
      selectedText: "",
      cover: "",
      videoUrls: backgroundVideoUrls,
      imageUrls: []
    };
  }
}

function buildObsidianUri(data, downloadInfo = null, imageInfo = null) {
  const folder = (els.folder.value || "00_Inbox/小红书待整理").replace(/\/+$/, "");
  const file = `${folder}/${today()} ${safeFileName(data.title)}.md`;
  const params = [
    ["vault", els.vault.value.trim()],
    ["file", file],
    ["content", markdown(data, downloadInfo, imageInfo)]
  ];
  return `obsidian://new?${params
    .map(([key, value]) => `${key}=${encodeURIComponent(value)}`)
    .join("&")}`;
}

function playableVideoUrl(data) {
  return (data.videoUrls || []).find(isEmbeddableVideo) || "";
}

function testVideoPlayable(url, timeoutMs = 8000) {
  return new Promise(resolve => {
    if (!url) {
      resolve(false);
      return;
    }
    const video = document.createElement("video");
    let done = false;
    const finish = ok => {
      if (done) return;
      done = true;
      video.removeAttribute("src");
      video.load();
      resolve(ok);
    };
    const timer = setTimeout(() => finish(false), timeoutMs);
    video.muted = true;
    video.preload = "metadata";
    video.addEventListener("loadedmetadata", () => {
      clearTimeout(timer);
      finish(true);
    }, { once: true });
    video.addEventListener("canplay", () => {
      clearTimeout(timer);
      finish(true);
    }, { once: true });
    video.addEventListener("error", () => {
      clearTimeout(timer);
      finish(false);
    }, { once: true });
    video.src = url;
  });
}

async function maybeDownloadVideo(data) {
  if (!els.includeVideo.checked) return { started: false, reason: "video-disabled" };
  if (!els.autoDownload.checked) return { started: false, reason: "disabled" };
  const url = playableVideoUrl(data);
  if (!url) return { started: false, reason: "no-mp4" };
  const vaultPath = els.vaultPath.value.trim();
  if (!vaultPath) return { started: false, reason: "请填写 Vault 本地路径，才能直接下载到 Obsidian 库。" };
  setStatus("正在检测视频是否可播放...");
  const ok = await testVideoPlayable(url);
  if (!ok) return { started: false, reason: "not-playable" };
  const filenameOnly = localVideoName(data);
  const subdir = safeDownloadFolder(els.downloadFolder.value);

  try {
    setStatus("正在下载视频到 Obsidian Vault...");
    const response = await fetch("http://127.0.0.1:8765/download", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ url, vaultPath, subdir, filename: filenameOnly.replace(/\.mp4$/i, "") })
    });
    const result = await response.json();
    if (response.ok && result.ok) {
      return {
        started: true,
        method: "helper",
        filename: result.path,
        obsidianPath: result.obsidianPath
      };
    }
    return { started: false, reason: `本地助手下载失败：${result.error || response.status}` };
  } catch (error) {
    return { started: false, reason: `本地助手未启动或不可用：${error.message || error}` };
  }
}

function imageExtFromUrl(url) {
  const match = String(url || "").match(/\.(png|jpe?g|webp)(?:\?|$)/i);
  if (!match) return "jpg";
  const ext = match[1].toLowerCase();
  return ext === "jpeg" ? "jpg" : ext;
}

async function maybeDownloadImages(data) {
  if (!els.includeImages.checked) return { paths: [], reason: "images-disabled" };
  const vaultPath = els.vaultPath.value.trim();
  if (!vaultPath) return { paths: [], reason: "请填写 Vault 本地路径，才能下载图片到 Obsidian 库。" };
  const max = Math.max(0, Math.min(30, Number(els.maxImages.value || 12)));
  const mode = els.imageMode.value || "main";
  const coverUrls = mode === "body" ? [] : [data.cover];
  const bodyUrls = mode === "cover" ? [] : (data.imageUrls || []);
  const urls = [...new Set([...coverUrls, ...bodyUrls].filter(Boolean))].slice(0, max);
  if (!urls.length || max === 0) return { paths: [], reason: "未检测到图片地址。" };

  const paths = [];
  const errors = [];
  const subdir = safeDownloadFolder(els.imageFolder.value || "xhs-image");
  for (let index = 0; index < urls.length; index += 1) {
    const url = urls[index];
    try {
      setStatus(`正在下载图片 ${index + 1}/${urls.length}...`);
      const response = await fetch("http://127.0.0.1:8765/download", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type: "image",
          url,
          vaultPath,
          subdir,
          filename: `${today()} ${safeFileName(data.title)} ${String(index + 1).padStart(2, "0")}`,
          ext: imageExtFromUrl(url)
        })
      });
      const result = await response.json();
      if (response.ok && result.ok) {
        paths.push(result.obsidianPath);
      } else {
        errors.push(result.error || String(response.status));
      }
    } catch (error) {
      errors.push(error.message || String(error));
    }
  }
  return {
    paths,
    reason: errors.length ? `部分图片下载失败：${errors.slice(0, 3).join("; ")}` : ""
  };
}

function saveSettings() {
  chrome.storage.sync.set({
    vault: els.vault.value,
    vaultPath: els.vaultPath.value,
    folder: els.folder.value,
    tags: els.tags.value,
    includeVideo: els.includeVideo.checked,
    downloadFolder: els.downloadFolder.value,
    includeRemotePreview: els.includeRemotePreview.checked,
    includeImages: els.includeImages.checked,
    imageMode: els.imageMode.value,
    imageFolder: els.imageFolder.value,
    maxImages: els.maxImages.value,
    autoDownload: els.autoDownload.checked,
    includeSourceUrls: els.includeSourceUrls.checked,
    includeCodexPrompt: els.includeCodexPrompt.checked
  });
}

async function loadSettings() {
  const saved = await chrome.storage.sync.get([
    "vault",
    "vaultPath",
    "folder",
    "tags",
    "includeVideo",
    "downloadFolder",
    "includeRemotePreview",
    "includeImages",
    "imageMode",
    "imageFolder",
    "maxImages",
    "autoDownload",
    "includeSourceUrls",
    "includeCodexPrompt"
  ]);
  els.vault.value = saved.vault || "";
  els.vaultPath.value = saved.vaultPath || "";
  els.folder.value = saved.folder || "00_Inbox/小红书待整理";
  els.tags.value = saved.tags || "小红书待整理, 内容拆解";
  els.includeVideo.checked = saved.includeVideo !== false;
  els.downloadFolder.value = saved.downloadFolder || "xhs-video";
  els.includeRemotePreview.checked = saved.includeRemotePreview === true;
  els.includeImages.checked = saved.includeImages !== false;
  els.imageMode.value = saved.imageMode || "main";
  els.imageFolder.value = saved.imageFolder || "xhs-image";
  els.maxImages.value = saved.maxImages || "12";
  els.autoDownload.checked = saved.autoDownload !== false;
  els.includeSourceUrls.checked = saved.includeSourceUrls !== false;
  els.includeCodexPrompt.checked = saved.includeCodexPrompt !== false;
}

function setStatus(text) {
  els.status.textContent = text;
}

els.save.addEventListener("click", async () => {
  if (!els.vault.value.trim()) {
    setStatus("请先填写 Vault 名称。");
    els.vault.focus();
    return;
  }
  saveSettings();
  const data = await collectData();
  const downloadInfo = await maybeDownloadVideo(data);
  const imageInfo = await maybeDownloadImages(data);
  const uri = buildObsidianUri(data, downloadInfo, imageInfo);
  const tab = await getActiveTab();
  await chrome.tabs.update(tab.id, { url: uri });
  setStatus(downloadInfo.started ? "已提交下载并调用 Obsidian。" : "已调用 Obsidian，视频未下载。");
});

els.copy.addEventListener("click", async () => {
  saveSettings();
  const data = await collectData();
  await navigator.clipboard.writeText(markdown(data));
  setStatus("Markdown 已复制。");
});

[els.vault, els.vaultPath, els.folder, els.tags, els.includeVideo, els.downloadFolder, els.includeRemotePreview, els.includeImages, els.imageMode, els.imageFolder, els.maxImages, els.autoDownload, els.includeSourceUrls, els.includeCodexPrompt].forEach(input => {
  input.addEventListener("input", saveSettings);
  input.addEventListener("change", saveSettings);
});

loadSettings();
