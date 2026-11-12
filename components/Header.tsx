import Link from "next/link";
import styles from "../app/page.module.css";

export default function Header() {
  return (
    <header className={styles.header}>
      <strong className={styles.logo}>북마크 모음집</strong>
      <Link className={styles.addButton} href="/new">+ 새 링크</Link>
    </header>
  );
}
