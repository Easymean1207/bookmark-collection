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
        <strong className={styles.logo}>
          <svg className={styles.logoIcon} viewBox="0 0 32 32" fill="none" aria-hidden="true">
            <g transform="translate(16 16) scale(1.15) translate(-16 -16)">
              <path d="M16 8C12 5.5 8 4.5 4 5.5v19c4-1 8 0 12 2.5V8Z" fill="#E8F3FF" stroke="#3182F6" strokeWidth="1.5" strokeLinejoin="round" />
              <path d="M16 8c4-2.5 8-3.5 12-2.5v19c-4-1-8 0-12 2.5V8Z" fill="white" stroke="#3182F6" strokeWidth="1.5" strokeLinejoin="round" />
            </g>
            <path d="M19.5 7c2.5-1 5.2-1.5 8-1v16.5l-4-2.8-4 2.8V7Z" fill="#3182F6" />
            <path d="m23.5 9 1 2.8h2.8l-2.2 1.7.85 2.8-2.45-1.65-2.45 1.65.85-2.8-2.2-1.7h2.8L23.5 9Z" fill="#FFDC5E" />
          </svg>
          <span className={styles.logoText}>북마크 모음집</span>
        </strong>
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
