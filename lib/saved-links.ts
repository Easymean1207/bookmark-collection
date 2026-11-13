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
