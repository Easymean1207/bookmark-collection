import Header from "../../components/Header";
import NewLinkForm from "../../components/NewLinkForm";
import Sidebar from "../../components/Sidebar";
import { pageMetadata } from "../../lib/page-metadata";
import styles from "../page.module.css";

export const metadata = pageMetadata("새 링크", "보관할 링크를 폴더에 추가하세요.");

export default function NewLinkPage() {
  return (
    <div className={styles.shell}>
      <Header />
      <div className={styles.content}>
        <Sidebar activeFolderId={null} />
        <main className={styles.main}>
          <div className={styles.newLinkContent}>
            <h1>새 링크</h1>
            <p>보관하고 싶은 링크를 폴더에 추가하세요.</p>
            <NewLinkForm />
          </div>
        </main>
      </div>
    </div>
  );
}
