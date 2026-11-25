"use client";

import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useEffect, useLayoutEffect, useState, type FormEvent } from "react";
import { createClient } from "../utils/supabase/client";
import googleLoginImage from "../public/google_login.png";
import styles from "../app/auth.module.css";

const providerNames = { kakao: "카카오", google: "구글" } as const;
type SocialProvider = keyof typeof providerNames;

export default function AuthPage({ mode }: { mode: "login" | "signup" }) {
  const signup = mode === "signup";
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [pending, setPending] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    const provider = new URLSearchParams(window.location.search).get("error");
    if (provider !== "kakao" && provider !== "google") return;
    window.history.replaceState(window.history.state, "", window.location.pathname);
    queueMicrotask(() => setError(`${providerNames[provider]} 로그인을 완료하지 못했습니다. 다시 시도해 주세요.`));
  }, []);

  useEffect(() => {
    if (!error) return;
    const timer = setTimeout(() => setError(""), 5000);
    return () => clearTimeout(timer);
  }, [error]);

  useEffect(() => {
    if (!success) return;
    const timer = setTimeout(() => {
      if (signup) router.replace("/login");
      else window.location.replace("/");
    }, 1000);
    return () => clearTimeout(timer);
  }, [success, router, signup]);

  useLayoutEffect(() => () => {
    setEmail("");
    setPassword("");
    setConfirm("");
    setError("");
    setSuccess(false);
  }, []);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!email.trim() || !password || (signup && !confirm) || pending || success) return;
    if (signup && password !== confirm) {
      setError("비밀번호가 일치하지 않습니다.");
      return;
    }

    setPending(true);
    setError("");
    try {
      if (!signup) {
        const { data, error: loginError } = await createClient().auth.signInWithPassword({ email: email.trim(), password });
        if (loginError || !data.session) {
          const messages: Record<string, string> = {
            invalid_credentials: "이메일 또는 비밀번호가 올바르지 않습니다.",
            email_not_confirmed: "이메일 인증 후 로그인해 주세요.",
            over_request_rate_limit: "로그인 요청이 너무 많습니다. 잠시 후 다시 시도해 주세요.",
          };
          setError(messages[loginError?.code ?? ""] ?? "로그인에 실패했습니다. 다시 시도해 주세요.");
          return;
        }
        setSuccess(true);
        return;
      }
      const { data, error: signupError } = await createClient().auth.signUp({ email: email.trim(), password });
      if (signupError) {
        const messages: Record<string, string> = {
          email_address_invalid: "올바른 이메일 주소를 입력해 주세요.",
          email_exists: "이미 가입된 이메일입니다.",
          user_already_exists: "이미 가입된 이메일입니다.",
          weak_password: "비밀번호 조건을 확인해 주세요.",
          signup_disabled: "현재 회원가입을 사용할 수 없습니다.",
          over_email_send_rate_limit: "요청이 너무 많습니다. 잠시 후 다시 시도해 주세요.",
        };
        setError(messages[signupError.code ?? ""] ?? "회원가입에 실패했습니다. 다시 시도해 주세요.");
        return;
      }
      if (!data.user || data.user.identities?.length === 0) {
        setError("가입 상태를 확인할 수 없습니다. 이메일을 확인하거나 로그인해 주세요.");
        return;
      }
      setSuccess(true);
    } catch {
      setError(signup ? "회원가입에 실패했습니다. 다시 시도해 주세요." : "로그인에 실패했습니다. 다시 시도해 주세요.");
    } finally {
      setPending(false);
    }
  }

  async function signInWithSocial(provider: SocialProvider) {
    if (pending || success) return;
    setPending(true);
    setError("");
    try {
      const { error: oauthError } = await createClient().auth.signInWithOAuth({
        provider,
        options: { redirectTo: `${window.location.origin}/auth/callback?flow=${provider}` },
      });
      if (oauthError) setError(`${providerNames[provider]} 로그인을 시작하지 못했습니다. 다시 시도해 주세요.`);
    } catch {
      setError(`${providerNames[provider]} 로그인을 시작하지 못했습니다. 다시 시도해 주세요.`);
    } finally {
      setPending(false);
    }
  }

  return (
    <main className={styles.page}>
      {error && <div className={styles.toast} role="alert">{error}</div>}
      {success && <div className={`${styles.toast} ${styles.toastSuccess}`} role="status">{signup ? "회원가입이 완료되었습니다." : "로그인에 성공했습니다."}</div>}
      <section className={styles.card}>
        <h1 className={styles.logo}>북마크 모음집</h1>
        <form className={styles.fields} onSubmit={submit} noValidate>
          <div className={styles.field}>
            <label htmlFor="auth-email">이메일</label>
            <input id="auth-email" type="email" autoComplete="email" placeholder="이메일을 입력하세요" value={email} onChange={(event) => setEmail(event.target.value)} />
          </div>
          <div className={styles.field}>
            <label htmlFor="auth-password">비밀번호</label>
            <input id="auth-password" type="password" autoComplete={signup ? "new-password" : "current-password"} placeholder="비밀번호를 입력하세요" value={password} onChange={(event) => setPassword(event.target.value)} />
          </div>
          {signup && <div className={styles.field}>
            <label htmlFor="auth-password-confirm">비밀번호 확인</label>
            <input id="auth-password-confirm" type="password" autoComplete="new-password" placeholder="비밀번호를 다시 입력하세요" value={confirm} onChange={(event) => setConfirm(event.target.value)} />
          </div>}
          <button type="submit" className={styles.submit} disabled={!email.trim() || !password || (signup && !confirm) || pending || success}>{success ? (signup ? "회원가입 완료" : "로그인 완료") : pending ? (signup ? "가입 중..." : "로그인 중...") : signup ? "회원가입" : "로그인"}</button>
        </form>
        {!signup && <button className={`${styles.socialButton} ${styles.googleButton}`} type="button" disabled={pending || success} onClick={() => signInWithSocial("google")}><Image className={styles.socialImage} src={googleLoginImage} alt="구글 로그인" /></button>}
        {!signup && <button className={styles.socialButton} type="button" disabled={pending || success} onClick={() => signInWithSocial("kakao")}><Image className={styles.socialImage} src="/kakao_login_large_wide.png" width={600} height={90} alt="카카오 로그인" /></button>}
        {!signup && <Link href="/forgot-password" className={styles.recoveryLink}>비밀번호 찾기</Link>}
        <p className={styles.footer}>
          {signup ? "이미 계정이 있나요?" : "계정이 없나요?"}{" "}
          <Link href={signup ? "/login" : "/signup"} className={styles.switch}>{signup ? "로그인" : "회원가입"}</Link>
        </p>
      </section>
    </main>
  );
}
