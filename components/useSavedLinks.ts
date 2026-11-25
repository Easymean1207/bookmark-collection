"use client";

import { useEffect, useState } from "react";
import { useFolders } from "./FolderProvider";
import type { LinkItem } from "../lib/bookmarks";
import type { LinkEdit } from "../lib/saved-links";
import { createClient } from "../utils/supabase/client";

const changeEvent = "bookmark-links-changed";

export function useDatabaseLinks() {
  const { ready, userId, authVersion } = useFolders();
  const [databaseLinks, setDatabaseLinks] = useState<{ version: number; links: LinkItem[] } | null>(null);
  useEffect(() => {
    if (!ready || !userId) return;
    let active = true;
    function load() {
      createClient().from("links").select("id, url, title, description, thumbnail_url, folder_id")
        .eq("user_id", userId).order("created_at").then(({ data, error }) => {
          if (!active) return;
          if (error) { console.error("Failed to load links", error); return; }
          setDatabaseLinks({ version: authVersion, links: data.map((link) => ({
            dbId: `db-link-${link.id}`,
            url: link.url,
            title: link.title ?? link.url,
            description: link.description ?? "",
            thumbnail: link.thumbnail_url,
            folderId: link.folder_id == null ? undefined : `db-${link.folder_id}`,
            category: "미분류",
          })) });
        });
    }
    load();
    window.addEventListener(changeEvent, load);
    return () => { active = false; window.removeEventListener(changeEvent, load); };
  }, [ready, userId, authVersion]);
  return ready && databaseLinks?.version === authVersion ? databaseLinks.links : [];
}

export async function deleteLink(link: LinkItem) {
  if (!/^db-link-[1-9]\d*$/.test(link.dbId ?? "")) throw new Error("링크를 찾을 수 없습니다.");
  const { error } = await createClient().from("links")
    .delete().eq("id", link.dbId!.slice(8)).select("id").single();
  if (error) throw error;
  window.dispatchEvent(new Event(changeEvent));
}

export async function editLink(link: LinkItem, change: LinkEdit, availableFolders: { id: string; name: string }[]) {
  if (!/^db-link-[1-9]\d*$/.test(link.dbId ?? "")) throw new Error("링크를 찾을 수 없습니다.");
  const folder = availableFolders.find((item) => item.id === change.folderId);
  const title = change.title.trim();
  const description = change.description.trim();
  if (change.folderId && !folder) throw new Error("폴더를 선택해 주세요.");
  if (!title || title.length > 200) throw new Error("제목을 200자 이내로 입력해 주세요.");
  if (description.length > 1000) throw new Error("설명은 1000자 이내로 입력해 주세요.");
  const { error } = await createClient().from("links").update({
    title, description, folder_id: folder ? folder.id.slice(3) : null,
  }).eq("id", link.dbId!.slice(8)).select("id").single();
  if (error) throw error;
  window.dispatchEvent(new Event(changeEvent));
}
