import { pageMetadata } from "../../lib/page-metadata";

export const metadata = pageMetadata("새 비밀번호 설정", "북마크 모음집 계정의 비밀번호를 새로 설정하세요.");

export default function ResetPasswordLayout({ children }: { children: React.ReactNode }) {
  return children;
}
