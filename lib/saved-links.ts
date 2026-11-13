import type { LinkItem } from "./bookmarks";

export type SavedLink = LinkItem & { folderId: string };
export type LinkEdit = { folderId: string; title: string; description: string };

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

export function parseLinkEdits(raw: string | null): Record<string, LinkEdit> {
  try {
    const value: unknown = JSON.parse(raw ?? "{}");
    if (!value || typeof value !== "object" || Array.isArray(value)) return {};
    return Object.fromEntries(Object.entries(value).filter(([url, edit]) =>
      webUrl(url) && edit !== null && typeof edit === "object" &&
      typeof (edit as LinkEdit).folderId === "string" && (edit as LinkEdit).folderId.length > 0 &&
      typeof (edit as LinkEdit).title === "string" && (edit as LinkEdit).title.trim().length > 0 && (edit as LinkEdit).title.length <= 200 &&
      typeof (edit as LinkEdit).description === "string" && (edit as LinkEdit).description.length <= 1000)
      .map(([url, edit]) => [url, {
        folderId: (edit as LinkEdit).folderId,
        title: (edit as LinkEdit).title,
        description: (edit as LinkEdit).description,
      }]));
  } catch {
    return {};
  }
}

export function updateLink(saved: SavedLink[], edits: Record<string, LinkEdit>, url: string, change: LinkEdit, availableFolders: { id: string; name: string }[], builtInUrls: string[]) {
  const folder = availableFolders.find((item) => item.id === change.folderId);
  const title = change.title.trim();
  const description = change.description.trim();
  if (!folder) throw new Error("폴더를 선택해 주세요.");
  if (!title || title.length > 200) throw new Error("제목을 200자 이내로 입력해 주세요.");
  if (description.length > 1000) throw new Error("설명은 1000자 이내로 입력해 주세요.");
  const next = { folderId: folder.id, title, description };
  if (builtInUrls.includes(url)) return { saved, edits: { ...edits, [url]: next } };
  if (saved.some((link) => link.url === url)) return {
    saved: saved.map((link) => link.url === url ? { ...link, ...next, category: folder.name } : link), edits,
  };
  throw new Error("링크를 찾을 수 없습니다.");
}

export function syncDatabaseLinkFolder(saved: SavedLink[], link: LinkItem, folder: { id: string; name: string } | undefined, title: string, description: string): SavedLink[] {
  if (!folder || folder.id.startsWith("db-")) return saved.filter((item) => item.url !== link.url);
  const updated = { ...link, folderId: folder.id, category: folder.name, title, description };
  return saved.some((item) => item.url === link.url)
    ? saved.map((item) => item.url === link.url ? { ...item, ...updated } : item)
    : appendSavedLink(saved, updated, []);
}
