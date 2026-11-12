"use client";

import { createContext, useContext, useSyncExternalStore } from "react";
import { folders } from "../lib/bookmarks";
import { addCustomFolder, deleteFolder as removeFolder, parseFolderStore, type CustomFolder } from "../lib/custom-folders";

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
  deleteFolder: (id: string) => void;
} | null>(null);

export function FolderProvider({ children }: { children: React.ReactNode }) {
  const stored = useSyncExternalStore(subscribe, getSnapshot, () => null);
  const saved = parseFolderStore(stored);
  const allFolders = [...folders, ...saved.added].filter((folder) => !saved.deleted.includes(folder.id));
  const ready = stored !== null;

  function addFolder(name: string) {
    const next = addCustomFolder(allFolders, name, `custom-${crypto.randomUUID()}`);
    localStorage.setItem(storageKey, JSON.stringify({ ...saved, added: [...saved.added, next[next.length - 1]] }));
    window.dispatchEvent(new Event(changeEvent));
  }

  function deleteFolder(id: string) {
    const next = removeFolder(saved, id, folders.map((folder) => folder.id));
    localStorage.setItem(storageKey, JSON.stringify(next));
    window.dispatchEvent(new Event(changeEvent));
  }

  return <FolderContext.Provider value={{ allFolders, ready, addFolder, deleteFolder }}>{children}</FolderContext.Provider>;
}

export function useFolders() {
  const context = useContext(FolderContext);
  if (!context) throw new Error("FolderProvider is missing");
  return context;
}
