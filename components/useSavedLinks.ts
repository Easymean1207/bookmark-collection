"use client";

import { useSyncExternalStore } from "react";
import { links } from "../lib/bookmarks";
import { appendSavedLink, parseDeletedLinks, parseSavedLinks, removeLink, type SavedLink } from "../lib/saved-links";

const storageKey = "bookmark-collection-links";
const deletedKey = "bookmark-collection-deleted-links";
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

export function useSavedLinks() {
  return parseSavedLinks(useSyncExternalStore(subscribe, getSnapshot, () => null));
}

export function useDeletedLinks() {
  return parseDeletedLinks(useSyncExternalStore(subscribe, getDeletedSnapshot, () => null));
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
