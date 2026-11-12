import type { Metadata } from "next";
import { FolderProvider } from "../components/FolderProvider";
import "./globals.css";

export const metadata: Metadata = {
  title: "북마크 모음집",
  description: "저장한 링크를 한곳에서 모아보세요.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="ko" className="h-full antialiased">
      <body className="min-h-full flex flex-col"><FolderProvider>{children}</FolderProvider></body>
    </html>
  );
}
