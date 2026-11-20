"use client";

import { createContext, useContext, useEffect, useState } from "react";
import { addCustomFolder, orderFolders, renameFolder as validateRename, swapFolderPositions, type CustomFolder } from "../lib/custom-folders";
import { migrateLocalData } from "../lib/migrate-local-data";
import { createClient } from "../utils/supabase/client";

const FolderContext = createContext<{
  allFolders: CustomFolder[];
  ready: boolean;
  addFolder: (name: string) => Promise<void>;
  deleteFolder: (id: string) => Promise<void>;
  renameFolder: (id: string, name: string) => Promise<void>;
  swapFolders: (firstId: string, secondId: string) => void;
} | null>(null);

const FOLDER_ORDER_KEY = "bookmark-collection-folder-order";

export function FolderProvider({ children }: { children: React.ReactNode }) {
  const [databaseFolders, setDatabaseFolders] = useState<CustomFolder[] | null>(null);
  const [migrationError, setMigrationError] = useState(false);
  useEffect(() => {
    let active = true;
    async function load() {
      try { await migrateLocalData(); }
      catch (error) { console.error("Failed to migrate local data", error); if (active) setMigrationError(true); }
      const { data, error } = await createClient().from("folders").select("id, name").order("created_at");
      if (!active) return;
      if (error) console.error("Failed to load folders", error);
      const folders = data?.map((folder) => ({ id: `db-${folder.id}`, name: folder.name })) ?? [];
      try { setDatabaseFolders(orderFolders(folders, localStorage.getItem(FOLDER_ORDER_KEY))); }
      catch { setDatabaseFolders(folders); }
    }
    load();
    return () => { active = false; };
  }, []);
  const allFolders = databaseFolders ?? [];

  async function addFolder(name: string) {
    const trimmed = addCustomFolder(allFolders, name, "new").at(-1)!.name;
    const { data, error } = await createClient().from("folders").insert({ name: trimmed }).select("id, name").single();
    if (error) throw error;
    setDatabaseFolders((current) => [...(current ?? []), { id: `db-${data.id}`, name: data.name }]);
  }

  async function deleteFolder(id: string) {
    const { error } = await createClient().from("folders")
      .delete().eq("id", id.slice(3)).select("id").single();
    if (error) throw error;
    setDatabaseFolders((current) => current?.filter((folder) => folder.id !== id) ?? []);
    window.dispatchEvent(new Event("bookmark-links-changed"));
  }

  async function renameFolder(id: string, name: string) {
    validateRename({ added: [], deleted: [], renamed: {} }, id, name, allFolders);
    const { data, error } = await createClient().from("folders")
      .update({ name: name.trim() }).eq("id", id.slice(3)).select("name").single();
    if (error) throw error;
    setDatabaseFolders((current) => current?.map((folder) => folder.id === id ? { ...folder, name: data.name } : folder) ?? []);
  }

  function swapFolders(firstId: string, secondId: string) {
    const swapped = swapFolderPositions(allFolders, firstId, secondId);
    if (swapped === allFolders) return;
    setDatabaseFolders(swapped);
    try { localStorage.setItem(FOLDER_ORDER_KEY, JSON.stringify(swapped.map((folder) => folder.id))); }
    catch (error) { console.error("Failed to save folder order", error); }
  }

  return <FolderContext.Provider value={{ allFolders, ready: databaseFolders !== null, addFolder, deleteFolder, renameFolder, swapFolders }}>
    {migrationError && <p role="alert">로컬 데이터 이관에 실패했습니다. 새로고침하여 다시 시도해 주세요.</p>}
    {children}
  </FolderContext.Provider>;
}

export function useFolders() {
  const context = useContext(FolderContext);
  if (!context) throw new Error("FolderProvider is missing");
  return context;
}
