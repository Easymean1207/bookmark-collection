"use client";

import { folders } from "../lib/bookmarks";
import { useFolders } from "./FolderProvider";
import styles from "../app/page.module.css";
import type { LinkItem } from "../lib/bookmarks";
import { useState } from "react";

export default function LinkCard({ link }: { link: LinkItem }) {
  const { allFolders } = useFolders();
  const [imageFailed, setImageFailed] = useState(false);
  const originalFolder = folders.find((folder) => folder.name === link.category);
  const category = allFolders.find((folder) => folder.id === (link.folderId ?? originalFolder?.id))?.name ?? link.category;
  return (
    <a className={styles.card} href={link.url} target="_blank" rel="noopener noreferrer">
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
  );
}
