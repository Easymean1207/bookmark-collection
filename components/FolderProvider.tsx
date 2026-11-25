"use client";

import { createContext, useContext, useEffect, useState } from "react";
import { addCustomFolder, orderFolders, renameFolder as validateRename, swapFolderPositions, type CustomFolder } from "../lib/custom-folders";
import { createClient } from "../utils/supabase/client";

const FolderContext = createContext<{
  allFolders: CustomFolder[];
  ready: boolean;
  userId: string | null;
  authVersion: number;
  addFolder: (name: string) => Promise<void>;
  deleteFolder: (id: string) => Promise<void>;
  renameFolder: (id: string, name: string) => Promise<void>;
  swapFolders: (firstId: string, secondId: string) => void;
} | null>(null);

const FOLDER_ORDER_KEY = "bookmark-collection-folder-order";

export function FolderProvider({ children }: { children: React.ReactNode }) {
  const [auth, setAuth] = useState<{ userId: string | null; version: number }>({ userId: null, version: 0 });
  const [databaseFolders, setDatabaseFolders] = useState<{ version: number; folders: CustomFolder[] } | null>(null);
  useEffect(() => {
    const { data: { subscription } } = createClient().auth.onAuthStateChange((_event, session) => {
      const userId = session?.user.id ?? null;
      setAuth((current) => current.userId === userId ? current : { userId, version: current.version + 1 });
    });
    return () => subscription.unsubscribe();
  }, []);
  const { userId, version } = auth;
  useEffect(() => {
    const currentUserId = userId;
    if (!currentUserId) return;
    let active = true;
    async function load() {
      const { data, error } = await createClient().from("folders").select("id, name").eq("user_id", currentUserId).order("created_at");
      if (!active) return;
      if (error) console.error("Failed to load folders", error);
      const folders = data?.map((folder) => ({ id: `db-${folder.id}`, name: folder.name })) ?? [];
      try { setDatabaseFolders({ version, folders: orderFolders(folders, localStorage.getItem(`${FOLDER_ORDER_KEY}:${currentUserId}`)) }); }
      catch { setDatabaseFolders({ version, folders }); }
    }
    load();
    return () => { active = false; };
  }, [userId, version]);
  const ready = !!userId && databaseFolders?.version === version;
  const allFolders = ready ? databaseFolders.folders : [];

  async function addFolder(name: string) {
    const trimmed = addCustomFolder(allFolders, name, "new").at(-1)!.name;
    const { data, error } = await createClient().from("folders").insert({ name: trimmed }).select("id, name").single();
    if (error) throw error;
    setDatabaseFolders((current) => current?.version === version
      ? { ...current, folders: [...current.folders, { id: `db-${data.id}`, name: data.name }] } : current);
  }

  async function deleteFolder(id: string) {
    const { error } = await createClient().from("folders")
      .delete().eq("id", id.slice(3)).select("id").single();
    if (error) throw error;
    setDatabaseFolders((current) => current?.version === version
      ? { ...current, folders: current.folders.filter((folder) => folder.id !== id) } : current);
    window.dispatchEvent(new Event("bookmark-links-changed"));
  }

  async function renameFolder(id: string, name: string) {
    validateRename({ added: [], deleted: [], renamed: {} }, id, name, allFolders);
    const { data, error } = await createClient().from("folders")
      .update({ name: name.trim() }).eq("id", id.slice(3)).select("name").single();
    if (error) throw error;
    setDatabaseFolders((current) => current?.version === version
      ? { ...current, folders: current.folders.map((folder) => folder.id === id ? { ...folder, name: data.name } : folder) } : current);
  }

  function swapFolders(firstId: string, secondId: string) {
    const swapped = swapFolderPositions(allFolders, firstId, secondId);
    if (swapped === allFolders) return;
    setDatabaseFolders((current) => current?.version === version ? { ...current, folders: swapped } : current);
    try { if (userId) localStorage.setItem(`${FOLDER_ORDER_KEY}:${userId}`, JSON.stringify(swapped.map((folder) => folder.id))); }
    catch (error) { console.error("Failed to save folder order", error); }
  }

  return <FolderContext.Provider value={{ allFolders, ready, userId, authVersion: version, addFolder, deleteFolder, renameFolder, swapFolders }}>
    {children}
  </FolderContext.Provider>;
}

export function useFolders() {
  const context = useContext(FolderContext);
  if (!context) throw new Error("FolderProvider is missing");
  return context;
}
