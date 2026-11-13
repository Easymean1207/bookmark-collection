"use client";

import Header from "../components/Header";
import LinkGrid from "../components/LinkGrid";
import Sidebar from "../components/Sidebar";
import { useDatabaseLinks, useDeletedLinks, useLinkEdits, useSavedLinks } from "../components/useSavedLinks";
import { links } from "../lib/bookmarks";
import styles from "./page.module.css";

export default function Home() {
  const savedLinks = useSavedLinks();
  const databaseLinks = useDatabaseLinks();
  const deletedLinks = useDeletedLinks();
  const edits = useLinkEdits();
  const allLinks = [...links.filter((link) => !deletedLinks.includes(link.url)).map((link) => ({ ...link, ...edits[link.url] })),
    ...savedLinks.map((link) => ({ ...link, dbId: databaseLinks.find((item) => item.url === link.url)?.dbId ?? link.dbId })),
    ...databaseLinks.filter((link) => !savedLinks.some((saved) => saved.url === link.url))];
  return (
    <div className={styles.shell}>
      <Header />
      <div className={styles.content}>
        <Sidebar />
        <main className={styles.main}>
          <div className={styles.pageHeading}>
            <div>
              <h1 className={styles.pageTitle}>모아둔 링크</h1>
              <p className={styles.pageSubtitle}>필요한 순간, 저장해 둔 링크를 바로 찾아보세요.</p>
            </div>
            <span className={styles.linkCount}>전체 {allLinks.length}개</span>
          </div>
          <LinkGrid links={allLinks} />
        </main>
      </div>
    </div>
  );
}
