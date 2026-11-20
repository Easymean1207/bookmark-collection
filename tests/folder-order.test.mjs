import assert from "node:assert/strict";
import test from "node:test";
import * as folders from "../lib/custom-folders.ts";

const existing = [
  { id: "db-a", name: "A" },
  { id: "db-b", name: "B" },
  { id: "db-c", name: "C" },
];

test("dropping one folder on another swaps only their positions", () => {
  assert.deepEqual(folders.swapFolderPositions(existing, "db-a", "db-c"), [existing[2], existing[1], existing[0]]);
  assert.deepEqual(folders.swapFolderPositions(existing, "db-a", "missing"), existing);
});

test("saved order survives reload and new folders follow it", () => {
  assert.deepEqual(folders.orderFolders(existing, '["db-c","db-a"]'), [existing[2], existing[0], existing[1]]);
  assert.deepEqual(folders.orderFolders(existing, "broken"), existing);
});
