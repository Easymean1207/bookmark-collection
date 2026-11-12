import assert from "node:assert/strict";
import test from "node:test";
import { isBlockedAddress, parseOpenGraph, validateTarget } from "../lib/open-graph.ts";

test("reads OG tags in any attribute order and resolves the image URL", () => {
  const html = `<meta content="제목 &amp; 소식" property="og:title">
    <meta property='og:description' content='짧은 설명'>
    <meta content='/cover.jpg' property='og:image'>`;
  assert.deepEqual(parseOpenGraph(html, new URL("https://example.com/story")), {
    title: "제목 & 소식",
    description: "짧은 설명",
    thumbnail: "https://example.com/cover.jpg",
    url: "https://example.com/story",
  });
});

test("uses page title and description when OG tags are absent", () => {
  const html = `<title>문서 제목</title><meta name="description" content="문서 설명">`;
  assert.deepEqual(parseOpenGraph(html, new URL("https://example.com/")), {
    title: "문서 제목", description: "문서 설명", thumbnail: null, url: "https://example.com/",
  });
});

test("rejects unsafe URL targets", () => {
  for (const url of ["file:///etc/passwd", "http://localhost/", "http://127.0.0.1/", "http://192.168.1.2/", "http://[::ffff:127.0.0.1]/", "https://user:pass@example.com/"]) {
    assert.throws(() => validateTarget(url), url);
  }
  assert.equal(validateTarget("https://example.com/story").href, "https://example.com/story");
  assert.equal(isBlockedAddress("64.239.123.129", 4), false);
  assert.equal(isBlockedAddress("127.0.0.1", 4), true);
  assert.equal(isBlockedAddress("::ffff:7f00:1", 6), true);
});
