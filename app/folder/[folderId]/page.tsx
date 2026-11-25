import { notFound } from "next/navigation";
import { Suspense } from "react";
import FolderContent from "../../../components/FolderContent";
import Header from "../../../components/Header";
import Sidebar from "../../../components/Sidebar";
import { pageMetadata } from "../../../lib/page-metadata";
import styles from "../../page.module.css";

export const metadata = pageMetadata("폴더", "폴더에 저장한 링크를 확인하세요.");

async function FolderRouteContent({ params }: { params: PageProps<"/folder/[folderId]">["params"] }) {
  const { folderId } = await params;
  if (!/^db-[1-9]\d*$/.test(folderId)) notFound();
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
