import assert from "node:assert/strict";
import test from "node:test";
import { appendSavedLink, parseDeletedLinks, parseLinkEdits, parseSavedLinks, removeLink, updateLink } from "../lib/saved-links.ts";

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

test("edits only a saved link's folder, title, and description", () => {
  const other = { ...link, url: "https://other.example/" };
  const result = updateLink([link, other], {}, link.url, { folderId: "design", title: " 새 제목 ", description: " 새 설명 " }, [{ id: "design", name: "디자인" }], []);
  assert.deepEqual(result, {
    saved: [{ ...link, folderId: "design", category: "디자인", title: "새 제목", description: "새 설명" }, other],
    edits: {},
  });
});

test("keeps built-in link edits by URL without changing its source", () => {
  const change = { folderId: "design", title: "새 제목", description: "새 설명" };
  assert.deepEqual(updateLink([], {}, "https://nextjs.org/docs", change, [{ id: "design", name: "디자인" }], ["https://nextjs.org/docs"]), {
    saved: [], edits: { "https://nextjs.org/docs": change },
  });
});

test("rejects blank titles, missing folders, and unknown links", () => {
  const folders = [{ id: "design", name: "디자인" }];
  assert.throws(() => updateLink([link], {}, link.url, { folderId: "design", title: " ", description: "" }, folders, []));
  assert.throws(() => updateLink([link], {}, link.url, { folderId: "missing", title: "제목", description: "" }, folders, []));
  assert.throws(() => updateLink([link], {}, "https://missing.example/", { folderId: "design", title: "제목", description: "" }, folders, []));
});

test("reads valid link edits and ignores malformed records", () => {
  const edit = { folderId: "design", title: "제목", description: "설명" };
  assert.deepEqual(parseLinkEdits(JSON.stringify({ "https://nextjs.org/docs": { ...edit, url: "https://evil.example/", thumbnail: "https://evil.example/x" }, "javascript:bad": edit, "https://bad.example/": { ...edit, title: "" } })), {
    "https://nextjs.org/docs": edit,
  });
  assert.deepEqual(parseLinkEdits("broken"), {});
});
