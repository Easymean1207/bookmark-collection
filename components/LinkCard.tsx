import styles from "../app/page.module.css";
import type { LinkItem } from "../lib/bookmarks";

export default function LinkCard({ link }: { link: LinkItem }) {
  return (
    <a className={styles.card} href={link.url} target="_blank" rel="noopener noreferrer">
      <span className={styles.category}>{link.category}</span>
      <h2>{link.title}</h2>
      <p>{link.description}</p>
      <span className={styles.url}>{link.url}</span>
    </a>
  );
}
