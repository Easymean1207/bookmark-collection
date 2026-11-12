import assert from "node:assert/strict";
import test from "node:test";
import { addCustomFolder, parseCustomFolders } from "../lib/custom-folders.ts";

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
