"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useRef, useState } from "react";
import { useFolders } from "./FolderProvider";
import type { CustomFolder } from "../lib/custom-folders";
import styles from "../app/page.module.css";

export default function Sidebar({ activeFolderId }: { activeFolderId?: string | null }) {
  const { allFolders, deleteFolder, renameFolder } = useFolders();
  const router = useRouter();
  const dialogRef = useRef<HTMLDialogElement>(null);
  const editDialogRef = useRef<HTMLDialogElement>(null);
  const [selectedFolder, setSelectedFolder] = useState<CustomFolder | null>(null);
  const [error, setError] = useState("");
  const [editingFolder, setEditingFolder] = useState<CustomFolder | null>(null);
  const [editName, setEditName] = useState("");
  const [editError, setEditError] = useState("");

  function saveEdit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!editingFolder) return;
    try {
      renameFolder(editingFolder.id, editName);
      editDialogRef.current?.close();
    } catch (cause) {
      const message = cause instanceof Error ? cause.message : "";
      setEditError(["폴더 이름을 입력해 주세요.", "폴더 이름은 40자 이내로 입력해 주세요.", "이미 있는 폴더 이름입니다."].includes(message)
        ? message : "폴더 이름을 수정하지 못했습니다.");
    }
  }

  function confirmDelete(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!selectedFolder) return;
    try {
      deleteFolder(selectedFolder.id);
      dialogRef.current?.close();
      if (activeFolderId === selectedFolder.id) router.push("/");
    } catch {
      setError("폴더를 삭제하지 못했습니다.");
    }
  }

  return (
    <aside className={styles.sidebar}>
      <nav className={styles.folderNav} aria-label="북마크 폴더">
        <Link className={`${styles.folder} ${activeFolderId === undefined ? styles.folderActive : ""}`} href="/" aria-current={activeFolderId === undefined ? "page" : undefined}>All</Link>
        {allFolders.map((folder) => (
          <div className={styles.folderRow} key={folder.id}>
            <Link className={`${styles.folder} ${activeFolderId === folder.id ? styles.folderActive : ""}`} href={`/folder/${folder.id}`} aria-current={activeFolderId === folder.id ? "page" : undefined}><span className={styles.folderName}>{folder.name}</span></Link>
            <div className={styles.folderActions}>
              <button className={styles.editButton} type="button" aria-label={`${folder.name} 폴더 수정`} title={`${folder.name} 폴더 수정`} onClick={() => { setEditingFolder(folder); setEditName(folder.name); setEditError(""); editDialogRef.current?.showModal(); }}>
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="m15 5 4 4M4 20l4.5-1 10.8-10.8a2.1 2.1 0 0 0-3-3L5.5 16z" /></svg>
              </button>
              <button className={styles.deleteButton} type="button" aria-label={`${folder.name} 폴더 삭제`} title={`${folder.name} 폴더 삭제`} onClick={() => { setSelectedFolder(folder); setError(""); dialogRef.current?.showModal(); }}>
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M4 7h16M10 3h4m-8 4 1 14h10l1-14M10 11v6m4-6v6" /></svg>
              </button>
            </div>
          </div>
        ))}
      </nav>
      <dialog className={styles.folderDialog} ref={editDialogRef} aria-labelledby="edit-folder-title" onClose={() => { setEditingFolder(null); setEditError(""); }}>
        <form className={styles.modalForm} onSubmit={saveEdit}>
          <h2 id="edit-folder-title">폴더 이름 수정</h2>
          <label htmlFor="edit-folder-name">폴더 이름</label>
          <input id="edit-folder-name" className={styles.modalInput} value={editName} onChange={(event) => { setEditName(event.target.value); setEditError(""); }} maxLength={40} required autoFocus />
          {editError && <p className={styles.formError} role="alert">{editError}</p>}
          <div className={styles.modalActions}>
            <button className={styles.cancelButton} type="button" onClick={() => editDialogRef.current?.close()}>취소</button>
            <button className={styles.saveButton} type="submit">저장</button>
          </div>
        </form>
      </dialog>
      <dialog className={styles.folderDialog} ref={dialogRef} aria-labelledby="delete-folder-title" onClose={() => { setSelectedFolder(null); setError(""); }}>
        <form className={styles.modalForm} onSubmit={confirmDelete}>
          <h2 id="delete-folder-title">폴더를 삭제할까요?</h2>
          <p className={styles.modalDescription}>“{selectedFolder?.name}” 폴더를 삭제합니다. 저장된 링크는 전체 목록에 남습니다.</p>
          {error && <p className={styles.formError} role="alert">{error}</p>}
          <div className={styles.modalActions}>
            <button className={styles.cancelButton} type="button" autoFocus onClick={() => dialogRef.current?.close()}>취소</button>
            <button className={styles.dangerButton} type="submit">삭제</button>
          </div>
        </form>
      </dialog>
    </aside>
  );
}
