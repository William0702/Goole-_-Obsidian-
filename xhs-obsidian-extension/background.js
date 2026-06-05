const tabVideoUrls = new Map();
const tabImageUrls = new Map();

function looksLikeVideoUrl(url) {
  const lower = (url || "").toLowerCase();
  if (!lower) return false;
  if (lower.includes("xiaohongshu.com/explore/")) return false;
  if (/\.(js|css|json|png|jpe?g|webp|gif|svg|woff2?)(\?|$)/i.test(lower)) return false;
  return [
    ".mp4",
    ".m3u8",
    ".m4s",
    "sns-video",
    "/video/",
    "videofe"
  ].some(pattern => lower.includes(pattern));
}

function addTabUrl(tabId, url) {
  if (tabId < 0 || !looksLikeVideoUrl(url)) return;
  const list = tabVideoUrls.get(tabId) || [];
  if (!list.includes(url)) {
    list.push(url);
    tabVideoUrls.set(tabId, list.slice(-30));
  }
}

function looksLikeImageUrl(url) {
  const lower = (url || "").toLowerCase();
  if (!lower) return false;
  if (!/xhscdn|xiaohongshu|sns-webpic/i.test(lower)) return false;
  if (/\.(svg|gif|js|css|json)(\?|$)/i.test(lower)) return false;
  return /\.(png|jpe?g|webp)(\?|$)/i.test(lower) || lower.includes("sns-webpic");
}

function addTabImageUrl(tabId, url) {
  if (tabId < 0 || !looksLikeImageUrl(url)) return;
  const list = tabImageUrls.get(tabId) || [];
  if (!list.includes(url)) {
    list.push(url);
    tabImageUrls.set(tabId, list.slice(-30));
  }
}

chrome.webRequest.onBeforeRequest.addListener(
  details => addTabUrl(details.tabId, details.url),
  {
    urls: [
      "https://*.xiaohongshu.com/*",
      "https://*.xhscdn.com/*",
      "https://*.xhscdn.net/*"
    ],
    types: ["media", "xmlhttprequest", "other"]
  }
);

chrome.webRequest.onBeforeRequest.addListener(
  details => addTabImageUrl(details.tabId, details.url),
  {
    urls: [
      "https://*.xiaohongshu.com/*",
      "https://*.xhscdn.com/*",
      "https://*.xhscdn.net/*"
    ],
    types: ["image", "xmlhttprequest", "other"]
  }
);

chrome.tabs.onRemoved.addListener(tabId => {
  tabVideoUrls.delete(tabId);
  tabImageUrls.delete(tabId);
});

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message && message.type === "get-tab-video-urls") {
    sendResponse({ videoUrls: tabVideoUrls.get(message.tabId) || [] });
  }
  if (message && message.type === "clear-tab-video-urls") {
    tabVideoUrls.delete(message.tabId);
    sendResponse({ ok: true });
  }
  if (message && message.type === "get-tab-image-urls") {
    sendResponse({ imageUrls: tabImageUrls.get(message.tabId) || [] });
  }
});
