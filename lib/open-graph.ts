import { BlockList, isIP } from "node:net";
import { lookup } from "node:dns/promises";
import http from "node:http";
import https from "node:https";

export type OpenGraph = { title: string; description: string; thumbnail: string | null; url: string };

const blocked = new BlockList();
const mapped = new BlockList();
mapped.addSubnet("::ffff:0:0", 96, "ipv6");
for (const [address, prefix] of [
  ["0.0.0.0", 8], ["10.0.0.0", 8], ["100.64.0.0", 10], ["127.0.0.0", 8],
  ["169.254.0.0", 16], ["172.16.0.0", 12], ["192.0.0.0", 24],
  ["192.0.2.0", 24], ["192.168.0.0", 16], ["198.18.0.0", 15],
  ["198.51.100.0", 24], ["203.0.113.0", 24], ["224.0.0.0", 4], ["240.0.0.0", 4],
] as [string, number][]) blocked.addSubnet(address, prefix, "ipv4");
for (const [address, prefix] of [
  ["::", 128], ["::1", 128], ["64:ff9b::", 96],
  ["64:ff9b:1::", 48], ["fc00::", 7], ["fe80::", 10], ["ff00::", 8],
  ["2001::", 32], ["2001:db8::", 32], ["2002::", 16],
] as [string, number][]) blocked.addSubnet(address, prefix, "ipv6");

export function validateTarget(input: string): URL {
  let url: URL;
  try { url = new URL(input); } catch { throw new Error("올바른 링크 주소를 입력해 주세요."); }
  const host = url.hostname.replace(/^\[|\]$/g, "").replace(/\.$/, "");
  const family = isIP(host);
  if (input.length > 2048 || !["http:", "https:"].includes(url.protocol) || url.username || url.password ||
      (url.port && url.port !== (url.protocol === "https:" ? "443" : "80")) ||
      (!family && (!host.includes(".") || /\.(localhost|local|internal|invalid|test)$/i.test(host))) ||
      ((family === 4 || family === 6) && isBlockedAddress(host, family))) {
    throw new Error("공개 웹 주소만 사용할 수 있습니다.");
  }
  return url;
}

export function isBlockedAddress(address: string, family: 4 | 6) {
  return blocked.check(address, family === 4 ? "ipv4" : "ipv6") ||
    (family === 6 && mapped.check(address, "ipv6"));
}

function decode(value: string) {
  return value.replace(/&(#x[\da-f]+|#\d+|amp|quot|apos|lt|gt|nbsp);/gi, (entity, code: string) => {
    if (code[0] === "#") {
      const point = code[1].toLowerCase() === "x" ? parseInt(code.slice(2), 16) : parseInt(code.slice(1), 10);
      return point > 0 && point <= 0x10ffff ? String.fromCodePoint(point) : entity;
    }
    return ({ amp: "&", quot: '"', apos: "'", lt: "<", gt: ">", nbsp: " " } as Record<string, string>)[code.toLowerCase()] ?? entity;
  });
}

export function parseOpenGraph(html: string, url: URL): OpenGraph {
  const meta: Record<string, string> = {};
  for (const tag of html.match(/<meta\b(?:"[^"]*"|'[^']*'|[^'">])*>/gi) ?? []) {
    const attrs: Record<string, string> = {};
    for (const match of tag.matchAll(/([^\s=/>]+)\s*=\s*(?:"([^"]*)"|'([^']*)'|([^\s>]+))/g)) {
      attrs[match[1].toLowerCase()] = match[2] ?? match[3] ?? match[4];
    }
    const key = (attrs.property ?? attrs.name)?.toLowerCase();
    if (key && attrs.content && !meta[key]) meta[key] = decode(attrs.content).trim();
  }
  const title = decode(html.match(/<title\b[^>]*>([\s\S]*?)<\/title>/i)?.[1] ?? "").trim();
  let thumbnail: string | null = null;
  try {
    if (meta["og:image"]) thumbnail = validateTarget(new URL(meta["og:image"], url).href).href;
  } catch { /* Ignore invalid image URLs. */ }
  return {
    title: (meta["og:title"] || title || url.hostname).slice(0, 200),
    description: (meta["og:description"] || meta.description || "").slice(0, 500),
    thumbnail,
    url: url.href,
  };
}

async function readPage(url: URL): Promise<{ html: string; url: URL }> {
  const maxHtmlBytes = 2_000_000;
  for (let redirects = 0; redirects <= 3; redirects++) {
    const host = url.hostname.replace(/^\[|\]$/g, "");
    const addresses = await lookup(host, { all: true });
    if (!addresses.length || addresses.some(({ address, family }) =>
      (family !== 4 && family !== 6) || isBlockedAddress(address, family))) {
      throw new Error("공개 웹 주소만 사용할 수 있습니다.");
    }
    const pinned = addresses[0];
    const response = await new Promise<{ status: number; location?: string; html?: string }>((resolve, reject) => {
      const request = (url.protocol === "https:" ? https : http).get(url, {
        headers: { Accept: "text/html,application/xhtml+xml", "Accept-Encoding": "identity", "User-Agent": "BookmarkCollection/1.0" },
        signal: AbortSignal.timeout(8_000),
        lookup: (_host, options, callback) => {
          if (options.all) callback(null, [pinned]);
          else callback(null, pinned.address, pinned.family);
        },
      }, (res) => {
        const status = res.statusCode ?? 0;
        if (status >= 300 && status < 400 && res.headers.location) {
          res.destroy();
          resolve({ status, location: res.headers.location });
          return;
        }
        if (status !== 200 || !/^(text\/html|application\/xhtml\+xml)\b/i.test(res.headers["content-type"] ?? "") ||
            (res.headers["content-encoding"] && res.headers["content-encoding"] !== "identity") ||
            Number(res.headers["content-length"] ?? 0) > maxHtmlBytes) {
          res.destroy();
          reject(new Error("HTML 페이지를 읽을 수 없습니다."));
          return;
        }
        const chunks: Buffer[] = [];
        let size = 0;
        res.on("data", (chunk: Buffer) => {
          size += chunk.length;
          if (size > maxHtmlBytes) { reject(new Error("페이지가 너무 큽니다.")); request.destroy(); }
          else chunks.push(chunk);
        });
        res.on("end", () => resolve({ status, html: Buffer.concat(chunks).toString("utf8") }));
        res.on("error", reject);
      });
      request.on("error", reject);
    });
    if (response.location) {
      url = validateTarget(new URL(response.location, url).href);
      continue;
    }
    return { html: response.html ?? "", url };
  }
  throw new Error("리다이렉트가 너무 많습니다.");
}

export async function fetchOpenGraph(url: URL): Promise<OpenGraph> {
  const page = await readPage(validateTarget(url.href));
  return parseOpenGraph(page.html, page.url);
}
