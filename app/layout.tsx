import type { Metadata } from "next";
import { FolderProvider } from "../components/FolderProvider";
import { siteDescription, siteName, socialImage } from "../lib/page-metadata";
import "./globals.css";

const vercelHost = process.env.VERCEL_PROJECT_PRODUCTION_URL ?? process.env.VERCEL_URL;
const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? (vercelHost ? `https://${vercelHost}` : "http://localhost:3000");

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: { default: siteName, template: `%s | ${siteName}` },
  description: siteDescription,
  openGraph: { title: siteName, description: siteDescription, siteName, locale: "ko_KR", type: "website", images: [socialImage] },
  twitter: { card: "summary_large_image", title: siteName, description: siteDescription, images: [socialImage] },
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="ko" className="h-full antialiased">
      <body className="min-h-full flex flex-col"><FolderProvider>{children}</FolderProvider></body>
    </html>
  );
}
