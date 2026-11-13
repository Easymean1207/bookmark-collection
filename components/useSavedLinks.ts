"use client";

import { useEffect, useState, useSyncExternalStore } from "react";
import { links } from "../lib/bookmarks";
import type { LinkItem } from "../lib/bookmarks";
import { appendSavedLink, parseDeletedLinks, parseLinkEdits, parseSavedLinks, removeLink, syncDatabaseLinkFolder, updateLink, type LinkEdit, type SavedLink } from "../lib/saved-links";
import { createClient } from "../utils/supabase/client";

const storageKey = "bookmark-collection-links";
const deletedKey = "bookmark-collection-deleted-links";
const editsKey = "bookmark-collection-link-edits";
const changeEvent = "bookmark-links-changed";

function subscribe(callback: () => void) {
  window.addEventListener("storage", callback);
  window.addEventListener(changeEvent, callback);
  return () => {
    window.removeEventListener("storage", callback);
    window.removeEventListener(changeEvent, callback);
  };
}

function getSnapshot() {
  try { return localStorage.getItem(storageKey) ?? "[]"; } catch { return "[]"; }
}

function getDeletedSnapshot() {
  try { return localStorage.getItem(deletedKey) ?? "[]"; } catch { return "[]"; }
}

function getEditsSnapshot() {
  try { return localStorage.getItem(editsKey) ?? "{}"; } catch { return "{}"; }
}

export function useSavedLinks() {
  return parseSavedLinks(useSyncExternalStore(subscribe, getSnapshot, () => null));
}

export function useDatabaseLinks() {
  const [databaseLinks, setDatabaseLinks] = useState<LinkItem[]>([]);
  useEffect(() => {
    let active = true;
    function load() { createClient().from("links").select("id, url, title, description, thumbnail_url, folder_id")
      .order("created_at").then(({ data, error }) => {
        if (!active) return;
        if (error) { console.error("Failed to load links", error); return; }
        setDatabaseLinks(data.map((link) => ({
          dbId: `db-link-${link.id}`,
          url: link.url,
          title: link.title ?? link.url,
          description: link.description ?? "",
          thumbnail: link.thumbnail_url,
          folderId: link.folder_id == null ? undefined : `db-${link.folder_id}`,
          category: "미분류",
        })));
      }); }
    load();
    window.addEventListener(changeEvent, load);
    return () => { active = false; window.removeEventListener(changeEvent, load); };
  }, []);
  return databaseLinks;
}

export function useDeletedLinks() {
  return parseDeletedLinks(useSyncExternalStore(subscribe, getDeletedSnapshot, () => null));
}

export function useLinkEdits() {
  return parseLinkEdits(useSyncExternalStore(subscribe, getEditsSnapshot, () => null));
}

export function saveLink(link: SavedLink) {
  const next = appendSavedLink(parseSavedLinks(getSnapshot()), link, links.map((item) => item.url));
  localStorage.setItem(storageKey, JSON.stringify(next));
  window.dispatchEvent(new Event(changeEvent));
}

export function deleteLink(url: string) {
  const builtInUrls = links.map((link) => link.url);
  const next = removeLink(parseSavedLinks(getSnapshot()), parseDeletedLinks(getDeletedSnapshot()), url, builtInUrls);
  localStorage.setItem(builtInUrls.includes(url) ? deletedKey : storageKey, JSON.stringify(builtInUrls.includes(url) ? next.deleted : next.saved));
  window.dispatchEvent(new Event(changeEvent));
}

export async function editLink(link: LinkItem, change: LinkEdit, availableFolders: { id: string; name: string }[]) {
  const url = link.url;
  const builtInUrls = links.map((link) => link.url);
  const saved = parseSavedLinks(getSnapshot());
  if (link.dbId) {
    const folder = availableFolders.find((item) => item.id === change.folderId);
    const title = change.title.trim();
    const description = change.description.trim();
    if (change.folderId && !folder) throw new Error("폴더를 선택해 주세요.");
    if (!title || title.length > 200) throw new Error("제목을 200자 이내로 입력해 주세요.");
    if (description.length > 1000) throw new Error("설명은 1000자 이내로 입력해 주세요.");
    const { error } = await createClient().from("links").update({
      title, description, folder_id: folder?.id.startsWith("db-") ? folder.id.slice(3) : null,
    }).eq("id", link.dbId.slice(8)).select("id").single();
    if (error) throw error;
    const existing = saved.some((item) => item.url === url);
    if (existing || (folder && !folder.id.startsWith("db-")))
      localStorage.setItem(storageKey, JSON.stringify(syncDatabaseLinkFolder(saved, link, folder, title, description)));
    window.dispatchEvent(new Event(changeEvent));
    return;
  }
  const next = updateLink(saved, parseLinkEdits(getEditsSnapshot()), url, change, availableFolders, builtInUrls);
  const builtIn = builtInUrls.includes(url);
  localStorage.setItem(builtIn ? editsKey : storageKey, JSON.stringify(builtIn ? next.edits : next.saved));
  window.dispatchEvent(new Event(changeEvent));
}
