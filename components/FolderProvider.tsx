"use client";

import { createContext, useContext, useEffect, useState, useSyncExternalStore } from "react";
import { folders } from "../lib/bookmarks";
import { addCustomFolder, deleteFolder as removeFolder, parseFolderStore, renameFolder as updateFolder, type CustomFolder } from "../lib/custom-folders";
import { createClient } from "../utils/supabase/client";

const storageKey = "bookmark-collection-folders";
const changeEvent = "bookmark-folders-changed";
const subscribeHydration = () => () => {};
const clientHydrated = () => true;
const serverHydrated = () => false;
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
  addFolder: (name: string) => Promise<void>;
  deleteFolder: (id: string) => void;
  renameFolder: (id: string, name: string) => void;
} | null>(null);

export function FolderProvider({ children }: { children: React.ReactNode }) {
  const [databaseFolders, setDatabaseFolders] = useState<CustomFolder[] | null>(null);
  useEffect(() => {
    let active = true;
    createClient().from("folders").select("id, name").order("created_at").then(({ data, error }) => {
      if (!active) return;
      if (error) console.error("Failed to load folders", error);
      setDatabaseFolders((current) => [
        ...(error ? [] : data.map((folder) => ({ id: `db-${folder.id}`, name: folder.name }))),
        ...(current ?? []).filter((folder) => !data?.some((row) => `db-${row.id}` === folder.id)),
      ]);
    });
    return () => { active = false; };
  }, []);
  const stored = useSyncExternalStore(subscribe, getSnapshot, () => null);
  const saved = parseFolderStore(stored);
  const allFolders = [
    ...folders.map((folder) => ({ ...folder, name: saved.renamed[folder.id] ?? folder.name })),
    ...saved.added,
    ...(databaseFolders ?? []),
  ].filter((folder) => !saved.deleted.includes(folder.id));
  const ready = stored !== null && databaseFolders !== null;

  async function addFolder(name: string) {
    const trimmed = addCustomFolder(allFolders, name, "custom-new").at(-1)!.name;
    const { data, error } = await createClient().from("folders").insert({ name: trimmed }).select("id, name").single();
    if (error) throw error;
    setDatabaseFolders((current) => [...(current ?? []), { id: `db-${data.id}`, name: data.name }]);
  }

  function deleteFolder(id: string) {
    const next = removeFolder(saved, id, folders.map((folder) => folder.id));
    localStorage.setItem(storageKey, JSON.stringify(next));
    window.dispatchEvent(new Event(changeEvent));
  }

  function renameFolder(id: string, name: string) {
    const next = updateFolder(saved, id, name, allFolders);
    localStorage.setItem(storageKey, JSON.stringify(next));
    window.dispatchEvent(new Event(changeEvent));
  }

  return <FolderContext.Provider value={{ allFolders, ready, addFolder, deleteFolder, renameFolder }}>{children}</FolderContext.Provider>;
}

export function useFolders() {
  const context = useContext(FolderContext);
  const hydrated = useSyncExternalStore(subscribeHydration, clientHydrated, serverHydrated);
  if (!context) throw new Error("FolderProvider is missing");
  return hydrated ? context : { ...context, allFolders: folders, ready: false };
}
