import { notFound } from "next/navigation";
import { Suspense } from "react";
import CustomFolderContent from "../../../components/CustomFolderContent";
import Header from "../../../components/Header";
import LinkGrid from "../../../components/LinkGrid";
import Sidebar from "../../../components/Sidebar";
import { folders, links } from "../../../lib/bookmarks";
import styles from "../../page.module.css";

export function generateStaticParams() {
  return folders.map((folder) => ({ folderId: folder.id }));
}

async function FolderContent({ params }: { params: PageProps<"/folder/[folderId]">["params"] }) {
  const { folderId } = await params;
  const folder = folders.find((item) => item.id === folderId);
  if (!folder) {
    if (!folderId.startsWith("custom-")) notFound();
    return <CustomFolderContent folderId={folderId} />;
  }

  return (
    <div className={styles.content}>
      <Sidebar activeFolderId={folderId} />
      <main className={styles.main}>
        <h1 className={styles.folderTitle}>{folder.name}</h1>
        <LinkGrid links={links.filter((link) => link.category === folder.name)} />
      </main>
    </div>
  );
}

export default function FolderPage({ params }: PageProps<"/folder/[folderId]">) {
  return (
    <div className={styles.shell}>
      <Header />
      <Suspense fallback={<div className={styles.content}><Sidebar activeFolderId={null} /><main className={styles.main}>폴더를 불러오는 중...</main></div>}>
        <FolderContent params={params} />
      </Suspense>
    </div>
  );
}
