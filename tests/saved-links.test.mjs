import assert from "node:assert/strict";
import test from "node:test";
import { appendSavedLink, parseSavedLinks } from "../lib/saved-links.ts";

const link = {
  title: "예시", description: "설명", url: "https://example.com/", category: "자료",
  folderId: "custom-1", thumbnail: "https://example.com/cover.jpg",
};

test("reads saved links and rejects unsafe addresses", () => {
  assert.deepEqual(parseSavedLinks(JSON.stringify([link, { ...link, url: "javascript:alert(1)" }])), [link]);
  assert.deepEqual(parseSavedLinks("broken"), []);
});

test("appends a link once", () => {
  assert.deepEqual(appendSavedLink([], link, []), [link]);
  assert.throws(() => appendSavedLink([link], link, []));
  assert.throws(() => appendSavedLink([], link, [link.url]));
});
