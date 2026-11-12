import Header from "../components/Header";
import LinkGrid from "../components/LinkGrid";
import Sidebar from "../components/Sidebar";
import { links } from "../lib/bookmarks";
import styles from "./page.module.css";

export default function Home() {
  return (
    <div className={styles.shell}>
      <Header />
      <div className={styles.content}>
        <Sidebar />
        <main className={styles.main}><LinkGrid links={links} /></main>
      </div>
    </div>
  );
}
