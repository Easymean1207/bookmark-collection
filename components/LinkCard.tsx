"use client";

import { folders } from "../lib/bookmarks";
import { useFolders } from "./FolderProvider";
import styles from "../app/page.module.css";
import type { LinkItem } from "../lib/bookmarks";

export default function LinkCard({ link }: { link: LinkItem }) {
  const { allFolders } = useFolders();
  const originalFolder = folders.find((folder) => folder.name === link.category);
  const category = allFolders.find((folder) => folder.id === originalFolder?.id)?.name ?? link.category;
  return (
    <a className={styles.card} href={link.url} target="_blank" rel="noopener noreferrer">
      <span className={styles.category}>{category}</span>
      <h2>{link.title}</h2>
      <p>{link.description}</p>
      <span className={styles.url}>{link.url}</span>
    </a>
  );
}
