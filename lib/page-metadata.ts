import type { Metadata } from "next";

export const siteName = "북마크 모음집";
export const siteDescription = "저장한 링크를 한곳에서 모아보세요.";
export const socialImage = {
  url: "/thumbnail.png",
  width: 1424,
  height: 747,
  alt: "북마크 모음집 썸네일",
};

export function pageMetadata(title: string, description: string): Metadata {
  const fullTitle = `${title} | ${siteName}`;
  return {
    title,
    description,
    openGraph: { title: fullTitle, description, siteName, locale: "ko_KR", type: "website", images: [socialImage] },
    twitter: { card: "summary_large_image", title: fullTitle, description, images: [socialImage] },
  };
}
