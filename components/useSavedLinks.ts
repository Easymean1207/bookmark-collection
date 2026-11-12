"use client";

import { useSyncExternalStore } from "react";
import { links } from "../lib/bookmarks";
import { appendSavedLink, parseSavedLinks, type SavedLink } from "../lib/saved-links";

const storageKey = "bookmark-collection-links";
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

export function useSavedLinks() {
  return parseSavedLinks(useSyncExternalStore(subscribe, getSnapshot, () => null));
}

export function saveLink(link: SavedLink) {
  const next = appendSavedLink(parseSavedLinks(getSnapshot()), link, links.map((item) => item.url));
  localStorage.setItem(storageKey, JSON.stringify(next));
  window.dispatchEvent(new Event(changeEvent));
}
