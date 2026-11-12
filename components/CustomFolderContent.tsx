"use client";

import Link from "next/link";
import { useFolders } from "./FolderProvider";
import Sidebar from "./Sidebar";
import styles from "../app/page.module.css";

export default function CustomFolderContent({ folderId }: { folderId: string }) {
  const { allFolders, ready } = useFolders();
  const folder = allFolders.find((item) => item.id === folderId);

  return (
    <div className={styles.content}>
      <Sidebar activeFolderId={folderId} />
      <main className={styles.main}>
        {!ready ? <p>폴더를 불러오는 중...</p> : folder ? (
          <>
            <h1 className={styles.folderTitle}>{folder.name}</h1>
            <p className={styles.emptyState}>아직 저장된 링크가 없습니다.</p>
          </>
        ) : (
          <>
            <h1 className={styles.folderTitle}>폴더를 찾을 수 없습니다</h1>
            <Link href="/">전체 링크로 돌아가기</Link>
          </>
        )}
      </main>
    </div>
  );
}
