"use client";

import { useRef, useState } from "react";
import LinkCard from "./LinkCard";
import { deleteLink } from "./useSavedLinks";
import type { LinkItem } from "../lib/bookmarks";
import styles from "../app/page.module.css";

export default function LinkGrid({ links }: { links: LinkItem[] }) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const [selectedLink, setSelectedLink] = useState<LinkItem | null>(null);
  const [error, setError] = useState("");

  function confirmDelete(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!selectedLink) return;
    try {
      deleteLink(selectedLink.url);
      dialogRef.current?.close();
    } catch {
      setError("링크를 삭제하지 못했습니다.");
    }
  }

  return <>
    <div className={styles.grid} aria-label="등록된 링크">{links.map((link) => <LinkCard key={link.url} link={link} onDelete={() => { setSelectedLink(link); setError(""); dialogRef.current?.showModal(); }} />)}</div>
    <dialog className={styles.folderDialog} ref={dialogRef} aria-labelledby="delete-link-title" aria-describedby="delete-link-description" onClose={() => { setSelectedLink(null); setError(""); }}>
      <form className={styles.modalForm} onSubmit={confirmDelete}>
        <h2 id="delete-link-title">링크를 삭제할까요?</h2>
        <p id="delete-link-description" className={styles.modalDescription}>“{selectedLink?.title}” 링크를 삭제합니다.</p>
        {error && <p className={styles.formError} role="alert">{error}</p>}
        <div className={styles.modalActions}>
          <button className={styles.cancelButton} type="button" autoFocus onClick={() => dialogRef.current?.close()}>취소</button>
          <button className={styles.dangerButton} type="submit">삭제</button>
        </div>
      </form>
    </dialog>
  </>;
}
