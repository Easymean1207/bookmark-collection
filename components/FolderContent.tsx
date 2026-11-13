"use client";

import Link from "next/link";
import LinkGrid from "./LinkGrid";
import { folders, links } from "../lib/bookmarks";
import { useFolders } from "./FolderProvider";
import { useDatabaseLinks, useDeletedLinks, useLinkEdits, useSavedLinks } from "./useSavedLinks";
import Sidebar from "./Sidebar";
import styles from "../app/page.module.css";

export default function FolderContent({ folderId }: { folderId: string }) {
  const { allFolders, ready } = useFolders();
  const savedLinks = useSavedLinks();
  const databaseLinks = useDatabaseLinks();
  const deletedLinks = useDeletedLinks();
  const edits = useLinkEdits();
  const folder = allFolders.find((item) => item.id === folderId);
  const folderLinks = [
    ...links.filter((link) => !deletedLinks.includes(link.url))
      .map((link) => ({ ...link, ...edits[link.url] }))
      .filter((link) => (link.folderId ?? folders.find((folder) => folder.name === link.category)?.id) === folderId),
    ...savedLinks.filter((link) => link.folderId === folderId)
      .map((link) => ({ ...link, dbId: databaseLinks.find((item) => item.url === link.url)?.dbId ?? link.dbId })),
    ...databaseLinks.filter((link) => link.folderId === folderId && !savedLinks.some((saved) => saved.url === link.url)),
  ];

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
