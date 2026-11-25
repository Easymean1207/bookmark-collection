import AuthPage from "../../components/AuthPage";
import { pageMetadata } from "../../lib/page-metadata";

export const metadata = pageMetadata("로그인", "북마크 모음집에 로그인하고 저장한 링크를 확인하세요.");

export default function LoginPage() {
  return <AuthPage mode="login" />;
}
