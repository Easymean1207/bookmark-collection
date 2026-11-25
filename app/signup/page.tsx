import AuthPage from "../../components/AuthPage";
import { pageMetadata } from "../../lib/page-metadata";

export const metadata = pageMetadata("회원가입", "북마크 모음집 계정을 만들고 링크를 저장하세요.");

export default function SignupPage() {
  return <AuthPage mode="signup" />;
}
