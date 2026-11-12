import assert from "node:assert/strict";
import test from "node:test";
import { appendSavedLink, parseDeletedLinks, parseSavedLinks, removeLink } from "../lib/saved-links.ts";

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

test("removes saved links and hides built-in links without affecting others", () => {
  const other = { ...link, url: "https://other.example/" };
  assert.deepEqual(removeLink([link, other], [], link.url, []), { saved: [other], deleted: [] });
  assert.deepEqual(removeLink([link], [], "https://nextjs.org/docs", ["https://nextjs.org/docs"]), {
    saved: [link], deleted: ["https://nextjs.org/docs"],
  });
  assert.throws(() => removeLink([link], [], "https://missing.example/", []));
});

test("reads deleted built-in links and ignores malformed entries", () => {
  assert.deepEqual(parseDeletedLinks('["https://nextjs.org/docs",42,"javascript:alert(1)"]'), ["https://nextjs.org/docs"]);
  assert.deepEqual(parseDeletedLinks("broken"), []);
});
