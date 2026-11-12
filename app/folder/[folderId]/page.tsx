import { notFound } from "next/navigation";
import { Suspense } from "react";
import FolderContent from "../../../components/FolderContent";
import Header from "../../../components/Header";
import Sidebar from "../../../components/Sidebar";
import { folders } from "../../../lib/bookmarks";
import styles from "../../page.module.css";

export function generateStaticParams() {
  return folders.map((folder) => ({ folderId: folder.id }));
}

async function FolderRouteContent({ params }: { params: PageProps<"/folder/[folderId]">["params"] }) {
  const { folderId } = await params;
  if (!folders.some((folder) => folder.id === folderId) && !folderId.startsWith("custom-")) notFound();
  return <FolderContent folderId={folderId} />;
}

export default function FolderPage({ params }: PageProps<"/folder/[folderId]">) {
  return (
    <div className={styles.shell}>
      <Header />
      <Suspense fallback={<div className={styles.content}><Sidebar activeFolderId={null} /><main className={styles.main}>폴더를 불러오는 중...</main></div>}>
        <FolderRouteContent params={params} />
      </Suspense>
    </div>
  );
}
