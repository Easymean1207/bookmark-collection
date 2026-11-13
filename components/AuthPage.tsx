import Link from "next/link";
import styles from "../app/auth.module.css";

export default function AuthPage({ mode }: { mode: "login" | "signup" }) {
  const signup = mode === "signup";
  return (
    <main className={styles.page}>
      <section className={styles.card}>
        <h1 className={styles.logo}>북마크 모음집</h1>
        <div className={styles.fields}>
          <div className={styles.field}>
            <label htmlFor="auth-email">이메일</label>
            <input id="auth-email" type="email" autoComplete="email" placeholder="이메일을 입력하세요" />
          </div>
          <div className={styles.field}>
            <label htmlFor="auth-password">비밀번호</label>
            <input id="auth-password" type="password" autoComplete={signup ? "new-password" : "current-password"} placeholder="비밀번호를 입력하세요" />
          </div>
          {signup && <div className={styles.field}>
            <label htmlFor="auth-password-confirm">비밀번호 확인</label>
            <input id="auth-password-confirm" type="password" autoComplete="new-password" placeholder="비밀번호를 다시 입력하세요" />
          </div>}
          <button type="button" className={styles.submit}>{signup ? "회원가입" : "로그인"}</button>
        </div>
        <p className={styles.footer}>
          {signup ? "이미 계정이 있나요?" : "계정이 없나요?"}{" "}
          <Link href={signup ? "/login" : "/signup"} className={styles.switch}>{signup ? "로그인" : "회원가입"}</Link>
        </p>
      </section>
    </main>
  );
}
