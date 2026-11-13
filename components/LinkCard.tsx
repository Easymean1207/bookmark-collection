"use client";

import { folders } from "../lib/bookmarks";
import { useFolders } from "./FolderProvider";
import styles from "../app/page.module.css";
import type { LinkItem } from "../lib/bookmarks";
import { useState } from "react";

export default function LinkCard({ link, onEdit, onDelete }: { link: LinkItem; onEdit?: () => void; onDelete?: () => void }) {
  const { allFolders } = useFolders();
  const [imageFailed, setImageFailed] = useState(false);
  const originalFolder = folders.find((folder) => folder.name === link.category);
  const category = allFolders.find((folder) => folder.id === (link.folderId ?? originalFolder?.id))?.name ?? link.category;
  return (
    <div className={`${styles.card} linkCard`}>
      <a className={styles.cardLink} href={link.url} target="_blank" rel="noopener noreferrer">
        {link.thumbnail && !imageFailed && (
          // OG images can come from any public host, so Next Image's fixed remotePatterns do not fit.
          // eslint-disable-next-line @next/next/no-img-element
          <img className={styles.thumbnail} src={link.thumbnail} alt="" loading="lazy" referrerPolicy="no-referrer" onError={() => setImageFailed(true)} />
        )}
        <span className={styles.category}>{category}</span>
        <h2>{link.title}</h2>
        <p>{link.description}</p>
        <span className={styles.url}>{link.url}</span>
      </a>
      {onEdit && onDelete && <div className={`${styles.cardActions} linkCardActions`}>
        <button className={styles.editButton} type="button" aria-label={`${link.title} 링크 수정`} title={`${link.title} 링크 수정`} onClick={onEdit}>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="m15 5 4 4M4 20l4.5-1 10.8-10.8a2.1 2.1 0 0 0-3-3L5.5 16z" /></svg>
        </button>
        <button className={styles.deleteButton} type="button" aria-label={`${link.title} 링크 삭제`} title={`${link.title} 링크 삭제`} onClick={onDelete}>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M4 7h16M10 3h4m-8 4 1 14h10l1-14M10 11v6m4-6v6" /></svg>
        </button>
      </div>}
    </div>
  );
}
