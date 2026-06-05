function textContent(selector) {
  const node = document.querySelector(selector);
  return node ? node.textContent.trim() : "";
}

function attr(selector, name) {
  const node = document.querySelector(selector);
  return node ? node.getAttribute(name) || "" : "";
}

function unique(values) {
  return [...new Set(values.filter(Boolean))];
}

function cleanTitle(value) {
  return (value || "未命名小红书内容")
    .replace(/\s*[-|_]*\s*小红书\s*\d*$/i, "")
    .replace(/\s+/g, " ")
    .trim() || "未命名小红书内容";
}

function collectVideoUrls() {
  const candidates = [];
  const pushCandidate = (url, source = "") => {
    if (url) candidates.push({ url, source });
  };

  document.querySelectorAll("video").forEach(video => {
    pushCandidate(video.currentSrc || video.src || "", "video");
    video.querySelectorAll("source").forEach(source => pushCandidate(source.src || "", "source"));
  });
  document.querySelectorAll("meta[property='og:video'], meta[property='og:video:url'], meta[name='twitter:player:stream']").forEach(meta => {
    pushCandidate(meta.content || "", "meta");
  });

  const strongMediaPatterns = [
    ".mp4",
    ".m3u8",
    ".m4s",
    "sns-video",
    "/video/",
    "video_id",
    "videofe"
  ];

  if (performance && typeof performance.getEntriesByType === "function") {
    performance.getEntriesByType("resource").forEach(entry => {
      const name = entry.name || "";
      const lower = name.toLowerCase();
      const initiator = entry.initiatorType || "";
      const looksLikeMedia = strongMediaPatterns.some(pattern => lower.includes(pattern));
      if (looksLikeMedia) {
        pushCandidate(name, initiator || "resource");
      }
    });
  }

  const pageUrlPatterns = [
    /xiaohongshu\.com\/explore\//i,
    /xiaohongshu\.com\/user\//i,
    /xiaohongshu\.com\/search/i,
    /xiaohongshu\.com\/discovery/i,
    /xiaohongshu\.com\/login/i
  ];

  const nonVideoAssetPatterns = [
    /\.(js|css|json|png|jpe?g|webp|gif|svg|woff2?)(\?|$)/i,
    /\/api\/sns\/web\/v\d+\/feed/i,
    /\/api\/sns\/web\/v\d+\/note/i
  ];

  return unique(candidates.map(item => item.url)).filter(url => {
    if (!url) return false;
    if (url.startsWith("blob:")) return false;
    if (url.startsWith("data:")) return false;
    if (pageUrlPatterns.some(pattern => pattern.test(url))) return false;
    if (nonVideoAssetPatterns.some(pattern => pattern.test(url))) return false;
    return true;
  });
}

function isLikelyMainImage(img) {
  const rect = img.getBoundingClientRect();
  const src = img.currentSrc || img.src || "";
  const alt = img.alt || "";
  const classText = `${img.className || ""} ${img.parentElement ? img.parentElement.className || "" : ""}`;
  if (!src) return false;
  if (rect.width < 180 || rect.height < 180) return false;
  if (/avatar|comment|emoji|icon|logo|sprite|user|author/i.test(`${src} ${alt} ${classText}`)) return false;
  return true;
}

function findMainContentRoot() {
  const selectors = [
    "[class*='media-container']",
    "[class*='swiper']",
    "[class*='carousel']",
    "[class*='note-content']",
    "[class*='note-detail']",
    "[class*='feed-detail']",
    "main",
    "article"
  ];
  for (const selector of selectors) {
    const node = document.querySelector(selector);
    if (node && node.querySelectorAll("img").length) return node;
  }
  return document.body;
}

function collectImageUrls() {
  const urls = [];
  const push = url => {
    if (url) urls.push(url);
  };

  push(attr("meta[property='og:image']", "content"));
  push(attr("meta[name='twitter:image']", "content"));

  const root = findMainContentRoot();
  root.querySelectorAll("img").forEach(img => {
    if (isLikelyMainImage(img)) {
      push(img.currentSrc || img.src || "");
      if (img.srcset) {
        img.srcset.split(",").forEach(item => push(item.trim().split(/\s+/)[0]));
      }
    }
  });

  return unique(urls).filter(url => {
    if (!url) return false;
    if (url.startsWith("data:")) return false;
    if (url.startsWith("blob:")) return false;
    if (!/^https?:\/\//i.test(url)) return false;
    if (/\.(svg|gif)(\?|$)/i.test(url)) return false;
    return /xhscdn|xiaohongshu|sns-webpic/i.test(url);
  }).slice(0, 12);
}

function collectPageData() {
  const selectedText = window.getSelection ? window.getSelection().toString().trim() : "";
  const title =
    textContent("h1") ||
    attr("meta[property='og:title']", "content") ||
    attr("meta[name='twitter:title']", "content") ||
    document.title ||
    "未命名小红书内容";
  const description =
    attr("meta[property='og:description']", "content") ||
    attr("meta[name='description']", "content") ||
    attr("meta[name='twitter:description']", "content") ||
    "";
  const cover =
    attr("meta[property='og:image']", "content") ||
    attr("meta[name='twitter:image']", "content") ||
    "";
  return {
    title: cleanTitle(title),
    url: location.href,
    description,
    selectedText,
    cover,
    videoUrls: collectVideoUrls(),
    imageUrls: collectImageUrls()
  };
}

chrome.runtime.onMessage.addListener((message, _sender, sendResponse) => {
  if (message && message.type === "collect-xhs-page") {
    sendResponse(collectPageData());
  }
});
