"use client";

import { useSyncExternalStore } from "react";
import { links } from "../lib/bookmarks";
import { appendSavedLink, parseDeletedLinks, parseLinkEdits, parseSavedLinks, removeLink, updateLink, type LinkEdit, type SavedLink } from "../lib/saved-links";

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

export function editLink(url: string, change: LinkEdit, availableFolders: { id: string; name: string }[]) {
  const builtInUrls = links.map((link) => link.url);
  const next = updateLink(parseSavedLinks(getSnapshot()), parseLinkEdits(getEditsSnapshot()), url, change, availableFolders, builtInUrls);
  const builtIn = builtInUrls.includes(url);
  localStorage.setItem(builtIn ? editsKey : storageKey, JSON.stringify(builtIn ? next.edits : next.saved));
  window.dispatchEvent(new Event(changeEvent));
}
