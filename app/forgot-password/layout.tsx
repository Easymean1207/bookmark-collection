import { pageMetadata } from "../../lib/page-metadata";

export const metadata = pageMetadata("비밀번호 찾기", "이메일로 비밀번호 재설정 링크를 요청하세요.");

export default function ForgotPasswordLayout({ children }: { children: React.ReactNode }) {
  return children;
}
