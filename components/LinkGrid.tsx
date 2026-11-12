import LinkCard from "./LinkCard";
import type { LinkItem } from "../lib/bookmarks";
import styles from "../app/page.module.css";

export default function LinkGrid({ links }: { links: LinkItem[] }) {
  return <div className={styles.grid} aria-label="등록된 링크">{links.map((link) => <LinkCard key={link.url} link={link} />)}</div>;
}
