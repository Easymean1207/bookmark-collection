"use client";

import { useRouter } from "next/navigation";
import { useRef, useState } from "react";
import { useFolders } from "./FolderProvider";
import { saveLink, useSavedLinks } from "./useSavedLinks";
import { appendSavedLink } from "../lib/saved-links";
import { links } from "../lib/bookmarks";
import { createClient } from "../utils/supabase/client";
import type { OpenGraph } from "../lib/open-graph";
import styles from "../app/page.module.css";

export default function NewLinkForm() {
  const { allFolders } = useFolders();
  const savedLinks = useSavedLinks();
  const router = useRouter();
  const [saving, setSaving] = useState(false);
  const savingRef = useRef(false);
  const [error, setError] = useState("");

  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (savingRef.current) return;
    const form = new FormData(event.currentTarget);
    const folderId = String(form.get("folder") ?? "");
    const folder = allFolders.find((item) => item.id === folderId);
    if (!folder) { setError("폴더를 선택해 주세요."); return; }
    savingRef.current = true;
    setSaving(true);
    setError("");
    try {
      const response = await fetch("/api/og", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url: form.get("url") }),
      });
      const data = await response.json() as OpenGraph & { error?: string };
      if (!response.ok) throw new Error(data.error ?? "링크 정보를 가져오지 못했습니다.");
      const link = { ...data, folderId, category: folder.name };
      appendSavedLink(savedLinks, link, links.map((item) => item.url));
      const { data: inserted, error: insertError } = await createClient().from("links").insert({
        url: data.url,
        title: data.title,
        description: data.description,
        thumbnail_url: data.thumbnail,
        // shortcut: Existing local folders have no database ID; migrate them when cross-device folder assignment is needed.
        folder_id: folderId.startsWith("db-") ? folderId.slice(3) : null,
      }).select("id").single();
      if (insertError) throw insertError;
      if (!folderId.startsWith("db-")) saveLink({ ...link, dbId: `db-link-${inserted.id}` });
      router.push(`/folder/${folderId}`);
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "링크를 저장하지 못했습니다.");
      savingRef.current = false;
      setSaving(false);
    }
  }

  return (
    <form className={styles.newLinkForm} onSubmit={submit}>
      <div className={styles.formField}>
        <label htmlFor="link-url">링크 주소</label>
        <input id="link-url" name="url" type="url" placeholder="https://example.com" autoComplete="url" required />
      </div>
      <div className={styles.formField}>
        <label htmlFor="link-folder">폴더</label>
        <select id="link-folder" name="folder" defaultValue="" required>
          <option value="" disabled>폴더를 선택하세요</option>
          {allFolders.map((folder) => <option key={folder.id} value={folder.id}>{folder.name}</option>)}
        </select>
      </div>
      {error && <p className={styles.formError} role="alert">{error}</p>}
      <button className={styles.saveButton} type="submit" disabled={saving}>{saving ? "링크 정보를 가져오는 중..." : "저장"}</button>
    </form>
  );
}
