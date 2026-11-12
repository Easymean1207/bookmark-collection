"use client";

import Link from "next/link";
import LinkGrid from "./LinkGrid";
import { links } from "../lib/bookmarks";
import { useFolders } from "./FolderProvider";
import Sidebar from "./Sidebar";
import styles from "../app/page.module.css";

export default function FolderContent({ folderId }: { folderId: string }) {
  const { allFolders, ready } = useFolders();
  const folder = allFolders.find((item) => item.id === folderId);
  const folderLinks = folder && !folder.id.startsWith("custom-")
    ? links.filter((link) => link.category === folder.name) : [];

  return (
    <div className={styles.content}>
      <Sidebar activeFolderId={folderId} />
      <main className={styles.main}>
        {folder ? (
          <>
            <h1 className={styles.folderTitle}>{folder.name}</h1>
            {folderLinks.length
              ? <LinkGrid links={folderLinks} />
              : <p className={styles.emptyState}>아직 저장된 링크가 없습니다.</p>}
          </>
        ) : !ready ? <p>폴더를 불러오는 중...</p> : (
          <>
            <h1 className={styles.folderTitle}>폴더를 찾을 수 없습니다</h1>
            <Link href="/">전체 링크로 돌아가기</Link>
          </>
        )}
      </main>
    </div>
  );
}
