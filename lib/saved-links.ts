import type { LinkItem } from "./bookmarks";

export type SavedLink = LinkItem & { folderId: string };

function webUrl(value: unknown): value is string {
  if (typeof value !== "string") return false;
  try { return ["http:", "https:"].includes(new URL(value).protocol); } catch { return false; }
}

export function parseSavedLinks(raw: string | null): SavedLink[] {
  try {
    const value: unknown = JSON.parse(raw ?? "[]");
    return Array.isArray(value) ? value.filter((link): link is SavedLink =>
      link !== null && typeof link === "object" &&
      typeof link.title === "string" && link.title.trim().length > 0 &&
      typeof link.description === "string" && webUrl(link.url) &&
      typeof link.category === "string" && typeof link.folderId === "string" &&
      (link.thumbnail == null || webUrl(link.thumbnail))) : [];
  } catch {
    return [];
  }
}

export function appendSavedLink(existing: SavedLink[], link: SavedLink, knownUrls: string[]): SavedLink[] {
  if (!webUrl(link.url)) throw new Error("올바른 링크 주소를 입력해 주세요.");
  const url = new URL(link.url).href;
  if ([...existing.map((item) => item.url), ...knownUrls].some((item) => new URL(item).href === url)) {
    throw new Error("이미 저장된 링크입니다.");
  }
  return [...existing, link];
}

export function parseDeletedLinks(raw: string | null): string[] {
  try {
    const value: unknown = JSON.parse(raw ?? "[]");
    return Array.isArray(value) ? value.filter(webUrl) : [];
  } catch {
    return [];
  }
}

export function removeLink(saved: SavedLink[], deleted: string[], url: string, builtInUrls: string[]) {
  if (builtInUrls.includes(url) && !deleted.includes(url)) {
    return { saved, deleted: [...deleted, url] };
  }
  if (saved.some((link) => link.url === url)) {
    return { saved: saved.filter((link) => link.url !== url), deleted };
  }
  throw new Error("링크를 찾을 수 없습니다.");
}
