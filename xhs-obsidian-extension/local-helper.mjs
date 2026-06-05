import http from "node:http";
import https from "node:https";
import fs from "node:fs";
import path from "node:path";
import { URL } from "node:url";

const HOST = "127.0.0.1";
const PORT = 8765;

function send(res, status, payload) {
  res.writeHead(status, {
    "Content-Type": "application/json; charset=utf-8",
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "POST, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type"
  });
  res.end(JSON.stringify(payload));
}

function safeSegment(value, fallback) {
  return String(value || fallback)
    .replace(/[<>:"|?*\x00-\x1f]+/g, " ")
    .replace(/[\\/]+/g, " ")
    .replace(/\s+/g, " ")
    .trim()
    .slice(0, 120) || fallback;
}

function safeSubdir(value) {
  return String(value || "xhs-video")
    .replace(/\\/g, "/")
    .split("/")
    .map(part => safeSegment(part, ""))
    .filter(Boolean)
    .join(path.sep) || "xhs-video";
}

function isInside(parent, child) {
  const relative = path.relative(parent, child);
  return relative === "" || (!relative.startsWith("..") && !path.isAbsolute(relative));
}

function download(url, targetFile) {
  return new Promise((resolve, reject) => {
    const request = https.get(url, {
      headers: {
        "User-Agent": "Mozilla/5.0",
        "Referer": "https://www.xiaohongshu.com/"
      }
    }, response => {
      if (response.statusCode >= 300 && response.statusCode < 400 && response.headers.location) {
        response.resume();
        download(new URL(response.headers.location, url).toString(), targetFile).then(resolve, reject);
        return;
      }
      if (response.statusCode !== 200) {
        response.resume();
        reject(new Error(`HTTP ${response.statusCode}`));
        return;
      }
      fs.mkdirSync(path.dirname(targetFile), { recursive: true });
      const file = fs.createWriteStream(targetFile);
      response.pipe(file);
      file.on("finish", () => file.close(() => resolve(targetFile)));
      file.on("error", reject);
    });
    request.on("error", reject);
    request.setTimeout(60000, () => {
      request.destroy(new Error("Download timeout"));
    });
  });
}

const server = http.createServer(async (req, res) => {
  if (req.method === "OPTIONS") {
    send(res, 204, {});
    return;
  }
  if (req.method !== "POST" || req.url !== "/download") {
    send(res, 404, { ok: false, error: "Not found" });
    return;
  }

  let body = "";
  req.on("data", chunk => {
    body += chunk;
    if (body.length > 1024 * 1024) req.destroy();
  });
  req.on("end", async () => {
    try {
      const payload = JSON.parse(body || "{}");
      const videoUrl = String(payload.url || "");
      const vaultPath = path.resolve(String(payload.vaultPath || ""));
      const subdir = safeSubdir(payload.subdir);
      const requestedFilename = safeSegment(payload.filename, "xhs-media").replace(/\.+$/, "");
      const type = String(payload.type || "video");
      const ext = type === "image" ? safeSegment(payload.ext, "jpg").replace(/^\.+/, "") : "mp4";
      const filename = `${requestedFilename}.${ext}`;

      if (type === "video" && !/^https:\/\/.+\.mp4(\?|$)/i.test(videoUrl)) {
        send(res, 400, { ok: false, error: "Only https mp4 URLs are supported for video." });
        return;
      }
      if (type === "image" && !/^https?:\/\//i.test(videoUrl)) {
        send(res, 400, { ok: false, error: "Only http(s) image URLs are supported." });
        return;
      }
      if (!fs.existsSync(vaultPath) || !fs.statSync(vaultPath).isDirectory()) {
        send(res, 400, { ok: false, error: "Vault path does not exist." });
        return;
      }

      const targetDir = path.resolve(vaultPath, subdir);
      const targetFile = path.resolve(targetDir, filename);
      if (!isInside(vaultPath, targetFile)) {
        send(res, 400, { ok: false, error: "Target path escaped vault." });
        return;
      }

      await download(videoUrl, targetFile);
      send(res, 200, {
        ok: true,
        path: targetFile,
        obsidianPath: `${subdir.replaceAll(path.sep, "/")}/${filename}`
      });
    } catch (error) {
      send(res, 500, { ok: false, error: error.message || String(error) });
    }
  });
});

server.listen(PORT, HOST, () => {
  console.log(`XHS Obsidian helper listening at http://${HOST}:${PORT}`);
});
