"use client";

import { useRouter } from "next/navigation";
import { useRef, useState } from "react";
import { useFolders } from "./FolderProvider";
import { createClient } from "../utils/supabase/client";
import type { OpenGraph } from "../lib/open-graph";
import styles from "../app/page.module.css";

export default function NewLinkForm() {
  const { allFolders } = useFolders();
  const router = useRouter();
  const [saving, setSaving] = useState(false);
  const savingRef = useRef(false);
  const [error, setError] = useState("");

  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (savingRef.current) return;
    const formElement = event.currentTarget;
    const form = new FormData(formElement);
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
      const supabase = createClient();
      const { data: existing, error: lookupError } = await supabase.from("links").select("id").eq("url", data.url).limit(1);
      if (lookupError) throw lookupError;
      if (existing.length) throw new Error("이미 저장된 링크입니다.");
      const { error: insertError } = await supabase.from("links").insert({
        url: data.url,
        title: data.title,
        description: data.description,
        thumbnail_url: data.thumbnail,
        folder_id: folderId.slice(3),
      }).select("id").single();
      if (insertError) throw insertError;
      formElement.reset();
      router.push(`/folder/${folderId}`);
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "링크를 저장하지 못했습니다.");
    } finally {
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
