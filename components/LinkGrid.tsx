"use client";

import { useRef, useState } from "react";
import LinkCard from "./LinkCard";
import { useFolders } from "./FolderProvider";
import { deleteLink, editLink } from "./useSavedLinks";
import type { LinkItem } from "../lib/bookmarks";
import styles from "../app/page.module.css";

export default function LinkGrid({ links }: { links: LinkItem[] }) {
  const { allFolders } = useFolders();
  const dialogRef = useRef<HTMLDialogElement>(null);
  const editDialogRef = useRef<HTMLDialogElement>(null);
  const [selectedLink, setSelectedLink] = useState<LinkItem | null>(null);
  const [error, setError] = useState("");
  const [editingLink, setEditingLink] = useState<LinkItem | null>(null);
  const [editFolderId, setEditFolderId] = useState("");
  const [editTitle, setEditTitle] = useState("");
  const [editDescription, setEditDescription] = useState("");
  const [editError, setEditError] = useState("");
  const [savingEdit, setSavingEdit] = useState(false);
  const savingEditRef = useRef(false);
  const [deleting, setDeleting] = useState(false);
  const deletingRef = useRef(false);

  function openEdit(link: LinkItem) {
    setEditingLink(link);
    setEditFolderId(link.folderId ?? "");
    setEditTitle(link.title);
    setEditDescription(link.description);
    setEditError("");
    editDialogRef.current?.showModal();
  }

  async function saveEdit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!editingLink || savingEditRef.current) return;
    savingEditRef.current = true;
    setSavingEdit(true);
    try {
      await editLink(editingLink, { folderId: editFolderId, title: editTitle, description: editDescription }, allFolders);
      editDialogRef.current?.close();
    } catch (cause) {
      const message = cause instanceof Error ? cause.message : "";
      setEditError(["폴더를 선택해 주세요.", "제목을 200자 이내로 입력해 주세요.", "설명은 1000자 이내로 입력해 주세요."].includes(message)
        ? message : "링크를 수정하지 못했습니다.");
    } finally {
      savingEditRef.current = false;
      setSavingEdit(false);
    }
  }

  async function confirmDelete(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!selectedLink || deletingRef.current) return;
    deletingRef.current = true;
    setDeleting(true);
    try {
      await deleteLink(selectedLink);
      dialogRef.current?.close();
    } catch {
      setError("링크를 삭제하지 못했습니다.");
    } finally {
      deletingRef.current = false;
      setDeleting(false);
    }
  }

  return <>
    <div className={styles.grid} aria-label="등록된 링크">{links.map((link) => <LinkCard key={link.dbId ?? link.url} link={link} onEdit={() => openEdit(link)} onDelete={() => { setSelectedLink(link); setError(""); dialogRef.current?.showModal(); }} />)}</div>
    <dialog className={styles.folderDialog} ref={editDialogRef} aria-labelledby="edit-link-title" onClose={() => { setEditingLink(null); setEditError(""); }}>
      <form className={styles.modalForm} onSubmit={saveEdit}>
        <h2 id="edit-link-title">링크 수정</h2>
        <label htmlFor="edit-link-folder">폴더</label>
        <select id="edit-link-folder" className={styles.modalInput} value={editFolderId} onChange={(event) => setEditFolderId(event.target.value)} required={!editingLink?.dbId} autoFocus>
          <option value="" disabled={!!editingLink?.folderId}>{editingLink?.dbId ? "미분류" : "폴더를 선택하세요"}</option>
          {allFolders.map((folder) => <option key={folder.id} value={folder.id}>{folder.name}</option>)}
        </select>
        <label htmlFor="edit-link-name">제목</label>
        <input id="edit-link-name" className={styles.modalInput} value={editTitle} onChange={(event) => setEditTitle(event.target.value)} maxLength={200} required />
        <label htmlFor="edit-link-description">설명</label>
        <textarea id="edit-link-description" className={`${styles.modalInput} ${styles.modalTextarea}`} value={editDescription} onChange={(event) => setEditDescription(event.target.value)} maxLength={1000} />
        {editError && <p className={styles.formError} role="alert">{editError}</p>}
        <div className={styles.modalActions}>
          <button className={styles.cancelButton} type="button" disabled={savingEdit} onClick={() => editDialogRef.current?.close()}>취소</button>
          <button className={styles.saveButton} type="submit" disabled={savingEdit}>저장</button>
        </div>
      </form>
    </dialog>
    <dialog className={styles.folderDialog} ref={dialogRef} aria-labelledby="delete-link-title" aria-describedby="delete-link-description" onClose={() => { setSelectedLink(null); setError(""); }}>
      <form className={styles.modalForm} onSubmit={confirmDelete}>
        <h2 id="delete-link-title">링크를 삭제할까요?</h2>
        <p id="delete-link-description" className={styles.modalDescription}>“{selectedLink?.title}” 링크를 삭제합니다.</p>
        {error && <p className={styles.formError} role="alert">{error}</p>}
        <div className={styles.modalActions}>
          <button className={styles.cancelButton} type="button" autoFocus disabled={deleting} onClick={() => dialogRef.current?.close()}>취소</button>
          <button className={styles.dangerButton} type="submit" disabled={deleting}>삭제</button>
        </div>
      </form>
    </dialog>
  </>;
}
