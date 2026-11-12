import Link from "next/link";
import { folders } from "../lib/bookmarks";
import styles from "../app/page.module.css";

export default function Sidebar({ activeFolderId }: { activeFolderId?: string | null }) {
  return (
    <aside className={styles.sidebar}>
      <nav className={styles.folderNav} aria-label="북마크 폴더">
        <Link className={`${styles.folder} ${activeFolderId === undefined ? styles.folderActive : ""}`} href="/" aria-current={activeFolderId === undefined ? "page" : undefined}>All</Link>
        {folders.map((folder) => (
          <Link className={`${styles.folder} ${activeFolderId === folder.id ? styles.folderActive : ""}`} href={`/folder/${folder.id}`} aria-current={activeFolderId === folder.id ? "page" : undefined} key={folder.id}>{folder.name}</Link>
        ))}
      </nav>
    </aside>
  );
}
