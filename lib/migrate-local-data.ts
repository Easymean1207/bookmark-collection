import { parseFolderStore } from "./custom-folders";
import { parseLinkEdits, parseSavedLinks } from "./saved-links";
import { createClient } from "../utils/supabase/client";

const legacyFolders: Record<string, string> = {
  development: "개발", design: "디자인", news: "뉴스", youtube: "유튜브",
};
const migrationKey = "bookmark-collection-supabase-migrated";

export async function migrateLocalData() {
  if (localStorage.getItem(migrationKey) === "1") return;
  const localFolders = parseFolderStore(localStorage.getItem("bookmark-collection-folders"));
  const localLinks = parseSavedLinks(localStorage.getItem("bookmark-collection-links"));
  const edits = parseLinkEdits(localStorage.getItem("bookmark-collection-link-edits"));
  const supabase = createClient();
  const { data: folders, error: folderError } = await supabase.from("folders").select("id, name");
  if (folderError || !folders) throw folderError ?? new Error("폴더를 불러오지 못했습니다.");
  const availableFolders = folders;
  const folderIds = new Map<string, number>();

  for (const [legacyId, originalName] of Object.entries(legacyFolders)) {
    const name = localFolders.renamed[legacyId] ?? originalName;
    const folder = availableFolders.find((item) => item.name.toLocaleLowerCase() === originalName.toLocaleLowerCase())
      ?? availableFolders.find((item) => item.name.toLocaleLowerCase() === name.toLocaleLowerCase());
    if (!folder) continue;
    if (folder.name !== name) {
      if (availableFolders.some((item) => item.id !== folder.id && item.name.toLocaleLowerCase() === name.toLocaleLowerCase()))
        throw new Error(`폴더 이름 충돌: ${name}`);
      const { error } = await supabase.from("folders").update({ name }).eq("id", folder.id).select("id").single();
      if (error) throw error;
      folder.name = name;
    }
    folderIds.set(legacyId, folder.id);
  }

  async function ensureFolder(name: string) {
    let folder = availableFolders.find((item) => item.name.toLocaleLowerCase() === name.toLocaleLowerCase());
    if (!folder) {
      const { data, error } = await supabase.from("folders").insert({ name }).select("id, name").single();
      if (error?.code === "23505") {
        const { data: current, error: lookupError } = await supabase.from("folders").select("id, name");
        if (lookupError) throw lookupError;
        folder = current?.find((item) => item.name.toLocaleLowerCase() === name.toLocaleLowerCase());
        if (!folder) throw error;
      } else if (error) throw error;
      else folder = data;
      availableFolders.push(folder);
    }
    return folder.id;
  }

  for (const folder of localFolders.added) folderIds.set(folder.id, await ensureFolder(folder.name));
  const { data: databaseLinks, error: linkError } = await supabase.from("links").select("id, url, folder_id");
  if (linkError || !databaseLinks) throw linkError ?? new Error("링크를 불러오지 못했습니다.");
  async function getFolderId(id: string, name?: string) {
    if (/^db-[1-9]\d*$/.test(id)) return Number(id.slice(3));
    return folderIds.get(id) ?? (name ? await ensureFolder(name) : null);
  }

  for (const link of localLinks) {
    const folderId = await getFolderId(link.folderId, link.category);
    const existing = databaseLinks.find((item) => item.url === link.url);
    if (existing) {
      if (existing.folder_id == null && folderId != null) {
        const { error } = await supabase.from("links").update({ folder_id: folderId }).eq("id", existing.id).select("id").single();
        if (error) throw error;
        existing.folder_id = folderId;
      }
      continue;
    }
    const { data, error } = await supabase.from("links").insert({
      url: link.url, title: link.title, description: link.description,
      thumbnail_url: link.thumbnail ?? null, folder_id: folderId,
    }).select("id, url, folder_id").single();
    if (error?.code === "23505") {
      const { data: current, error: lookupError } = await supabase.from("links")
        .select("id, url, folder_id").eq("url", link.url).single();
      if (lookupError) throw lookupError;
      databaseLinks.push(current);
      if (current.folder_id == null && folderId != null) {
        const { error: updateError } = await supabase.from("links").update({ folder_id: folderId })
          .eq("id", current.id).select("id").single();
        if (updateError) throw updateError;
        current.folder_id = folderId;
      }
    } else if (error) throw error;
    else databaseLinks.push(data);
  }

  for (const [url, edit] of Object.entries(edits)) {
    const existing = databaseLinks.find((item) => item.url === url);
    if (!existing) continue;
    const folderId = await getFolderId(edit.folderId);
    const { error } = await supabase.from("links").update({
      title: edit.title, description: edit.description, folder_id: folderId,
    }).eq("id", existing.id).select("id").single();
    if (error) throw error;
  }
  localStorage.setItem(migrationKey, "1");
}
