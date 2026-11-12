import styles from "../app/page.module.css";
import { folders } from "../lib/bookmarks";

export default function NewLinkForm() {
  return (
    <div className={styles.newLinkForm}>
      <div className={styles.formField}>
        <label htmlFor="link-url">링크 주소</label>
        <input id="link-url" name="url" type="url" placeholder="https://example.com" autoComplete="url" />
      </div>
      <div className={styles.formField}>
        <label htmlFor="link-folder">폴더</label>
        <select id="link-folder" name="folder" defaultValue="">
          <option value="" disabled>폴더를 선택하세요</option>
          {folders.map((folder) => <option key={folder.id} value={folder.name}>{folder.name}</option>)}
        </select>
      </div>
      <button className={styles.saveButton} type="button">저장</button>
    </div>
  );
}
