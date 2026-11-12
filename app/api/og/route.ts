import { fetchOpenGraph, validateTarget } from "../../../lib/open-graph";

export async function POST(request: Request) {
  let url: URL;
  try {
    if (Number(request.headers.get("content-length") ?? 0) > 4_096) throw new Error();
    const text = await request.text();
    if (text.length > 4_096) throw new Error();
    const body: unknown = JSON.parse(text);
    if (!body || typeof body !== "object" || typeof (body as { url?: unknown }).url !== "string") throw new Error();
    url = validateTarget((body as { url: string }).url);
  } catch {
    return Response.json({ error: "올바른 공개 웹 주소를 입력해 주세요." }, { status: 400 });
  }

  try {
    return Response.json(await fetchOpenGraph(url));
  } catch {
    return Response.json({ error: "링크 정보를 가져오지 못했습니다." }, { status: 502 });
  }
}
