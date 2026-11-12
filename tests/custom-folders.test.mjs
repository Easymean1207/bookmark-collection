import assert from "node:assert/strict";
import test from "node:test";
import { addCustomFolder, deleteFolder, parseCustomFolders, parseFolderStore } from "../lib/custom-folders.ts";

test("adds a trimmed folder and rejects blank or duplicate names", () => {
  const existing = [{ id: "development", name: "개발" }];
  assert.deepEqual(addCustomFolder(existing, "  자료  ", "custom-1"), [
    ...existing,
    { id: "custom-1", name: "자료" },
  ]);
  assert.throws(() => addCustomFolder(existing, "   ", "custom-2"));
  assert.throws(() => addCustomFolder(existing, "개발", "custom-2"));
});

test("reads saved folders and ignores malformed entries", () => {
  assert.deepEqual(parseCustomFolders('[{"id":"custom-1","name":"자료"},{"id":"bad","name":"잘못됨"}]'), [
    { id: "custom-1", name: "자료" },
  ]);
  assert.deepEqual(parseCustomFolders("not json"), []);
});

test("keeps folders saved before delete support", () => {
  assert.deepEqual(parseFolderStore('[{"id":"custom-1","name":"자료"}]'), {
    added: [{ id: "custom-1", name: "자료" }], deleted: [],
  });
  assert.deepEqual(parseFolderStore('{"added":[{"id":"custom-1","name":"자료"}],"deleted":["development",42]}'), {
    added: [{ id: "custom-1", name: "자료" }], deleted: ["development"],
  });
  assert.deepEqual(parseFolderStore("broken"), { added: [], deleted: [] });
});

test("deletes custom folders and hides built-in folders", () => {
  const store = { added: [{ id: "custom-1", name: "자료" }], deleted: [] };
  assert.deepEqual(deleteFolder(store, "custom-1", ["development"]), { added: [], deleted: [] });
  assert.deepEqual(deleteFolder(store, "development", ["development"]), {
    added: store.added, deleted: ["development"],
  });
  assert.throws(() => deleteFolder(store, "missing", ["development"]));
});
