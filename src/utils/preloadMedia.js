const inferAsType = (url) => {
  if (!url) return "fetch";
  const value = url.toLowerCase();
  if (/\.(png|jpe?g|gif|webp|avif|svg)(\?|$)/.test(value) || value.includes("/image/upload/")) return "image";
  if (/\.(mp4|webm|ogg|m3u8)(\?|$)/.test(value) || value.includes("/video/upload/")) return "video";
  if (/\.pdf(\?|$)/.test(value)) return "fetch";
  return "fetch";
};

export const preloadMedia = (urls = []) => {
  if (!Array.isArray(urls) || !urls.length || typeof document === "undefined") return;

  const existing = new Set(
    Array.from(document.querySelectorAll('link[data-preload="smart-media"]')).map((el) => el.href)
  );

  urls.filter(Boolean).forEach((url) => {
    const absoluteUrl = new URL(url, window.location.origin).href;
    if (existing.has(absoluteUrl)) return;

    const link = document.createElement("link");
    link.rel = "preload";
    link.as = inferAsType(url);
    link.href = url;
    link.setAttribute("data-preload", "smart-media");
    document.head.appendChild(link);
    existing.add(absoluteUrl);
  });
};

