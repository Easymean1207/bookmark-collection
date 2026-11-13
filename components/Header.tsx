"use client";

import Link from "next/link";
import { useRef, useState } from "react";
import { useFolders } from "./FolderProvider";
import styles from "../app/page.module.css";

export default function Header() {
  const { addFolder, ready } = useFolders();
  const dialogRef = useRef<HTMLDialogElement>(null);
  const [name, setName] = useState("");
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);
  const savingRef = useRef(false);

  async function saveFolder(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (savingRef.current) return;
    savingRef.current = true;
    setSaving(true);
    try {
      await addFolder(name);
      dialogRef.current?.close();
    } catch (cause) {
      const message = cause instanceof Error ? cause.message : "";
      setError(message === "폴더 이름을 입력해 주세요." || message === "이미 있는 폴더 이름입니다."
        ? message : "폴더를 저장하지 못했습니다.");
    } finally {
      savingRef.current = false;
      setSaving(false);
    }
  }

  return (
    <>
      <header className={styles.header}>
        <strong className={styles.logo}><span className={styles.logoText}>북마크 모음집</span></strong>
        <div className={styles.headerActions}>
          <button className={styles.folderButton} type="button" disabled={!ready} onClick={() => dialogRef.current?.showModal()}>+ 새 폴더</button>
          <Link className={styles.addButton} href="/new">+ 새 링크</Link>
        </div>
      </header>
      <dialog className={styles.folderDialog} ref={dialogRef} aria-labelledby="folder-dialog-title" onClose={() => { setName(""); setError(""); }}>
        <form className={styles.modalForm} onSubmit={saveFolder}>
          <h2 id="folder-dialog-title">새 폴더</h2>
          <label htmlFor="folder-name">폴더 이름</label>
          <input id="folder-name" className={styles.modalInput} value={name} onChange={(event) => { setName(event.target.value); setError(""); }} maxLength={40} required autoFocus placeholder="폴더 이름을 입력하세요" />
          {error && <p className={styles.formError} role="alert">{error}</p>}
          <div className={styles.modalActions}>
            <button className={styles.cancelButton} type="button" disabled={saving} onClick={() => dialogRef.current?.close()}>취소</button>
            <button className={styles.saveButton} type="submit" disabled={saving}>저장</button>
          </div>
        </form>
      </dialog>
    </>
  );
}
