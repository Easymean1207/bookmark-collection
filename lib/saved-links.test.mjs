import assert from "node:assert/strict";
import { test } from "node:test";
import { syncDatabaseLinkFolder } from "./saved-links.ts";

test("database link folder changes keep only the needed local shadow", () => {
  const link = { url: "https://example.com/", title: "Old", description: "", category: "미분류", dbId: "db-link-1" };
  const local = { id: "development", name: "개발" };
  const saved = syncDatabaseLinkFolder([], link, local, "New", "Details");
  assert.deepEqual(saved, [{ ...link, folderId: local.id, category: local.name, title: "New", description: "Details" }]);
  assert.deepEqual(syncDatabaseLinkFolder(saved, link, { id: "db-2", name: "DB" }, "New", "Details"), []);
  assert.deepEqual(syncDatabaseLinkFolder(saved, link, undefined, "New", "Details"), []);
});
