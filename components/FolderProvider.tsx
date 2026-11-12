"use client";

import { createContext, useContext, useSyncExternalStore } from "react";
import { folders } from "../lib/bookmarks";
import { addCustomFolder, parseCustomFolders, type CustomFolder } from "../lib/custom-folders";

const storageKey = "bookmark-collection-folders";
const changeEvent = "bookmark-folders-changed";
function subscribe(callback: () => void) {
  window.addEventListener("storage", callback);
  window.addEventListener(changeEvent, callback);
  return () => {
    window.removeEventListener("storage", callback);
    window.removeEventListener(changeEvent, callback);
  };
}

function getSnapshot() {
  try {
    return localStorage.getItem(storageKey) ?? "[]";
  } catch {
    return "[]";
  }
}

const FolderContext = createContext<{
  allFolders: CustomFolder[];
  ready: boolean;
  addFolder: (name: string) => void;
} | null>(null);

export function FolderProvider({ children }: { children: React.ReactNode }) {
  const stored = useSyncExternalStore(subscribe, getSnapshot, () => null);
  const allFolders = [...folders, ...parseCustomFolders(stored)];
  const ready = stored !== null;

  function addFolder(name: string) {
    const next = addCustomFolder(allFolders, name, `custom-${crypto.randomUUID()}`);
    localStorage.setItem(storageKey, JSON.stringify(next.slice(folders.length)));
    window.dispatchEvent(new Event(changeEvent));
  }

  return <FolderContext.Provider value={{ allFolders, ready, addFolder }}>{children}</FolderContext.Provider>;
}

export function useFolders() {
  const context = useContext(FolderContext);
  if (!context) throw new Error("FolderProvider is missing");
  return context;
}
