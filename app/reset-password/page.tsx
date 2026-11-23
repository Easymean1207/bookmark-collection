"use client";

import Link from "next/link";
import { useEffect, useLayoutEffect, useState, type FormEvent } from "react";
import { createClient } from "../../utils/supabase/client";
import styles from "../auth.module.css";

export default function ResetPasswordPage() {
  const [linkState, setLinkState] = useState<"checking" | "confirm" | "ready" | "invalid">("checking");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [pending, setPending] = useState(false);
  const [done, setDone] = useState(false);
  const [error, setError] = useState("");

  useLayoutEffect(() => () => {
    setLinkState("checking");
    setPassword("");
    setConfirm("");
    setPending(false);
    setDone(false);
    setError("");
  }, []);

  useEffect(() => {
    let active = true;
    if (new URLSearchParams(window.location.hash.slice(1)).has("token_hash")) {
      queueMicrotask(() => { if (active) setLinkState("confirm"); });
      return () => { active = false; };
    }
    createClient().auth.getUser().then(({ data, error: userError }) => {
      if (active) setLinkState(new URLSearchParams(window.location.search).has("error") || userError || !data.user ? "invalid" : "ready");
    }).catch(() => { if (active) setLinkState("invalid"); });
    return () => { active = false; };
  }, []);

  async function confirmLink() {
    const tokenHash = new URLSearchParams(window.location.hash.slice(1)).get("token_hash");
    if (!tokenHash) { setLinkState("invalid"); return; }
    if (pending) return;
    setPending(true);
    try {
      const { error } = await createClient().auth.verifyOtp({ token_hash: tokenHash, type: "recovery" });
      setLinkState(error ? "invalid" : "ready");
    } catch {
      setLinkState("invalid");
    } finally {
      window.history.replaceState(window.history.state, "", window.location.pathname);
      setPending(false);
    }
  }

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (linkState !== "ready" || !password || !confirm || pending || done) return;
    if (password !== confirm) {
      setError("비밀번호가 일치하지 않습니다.");
      return;
    }
    setPending(true);
    setError("");
    try {
      const { error: updateError } = await createClient().auth.updateUser({ password });
      if (updateError) {
        const messages: Record<string, string> = {
          weak_password: "비밀번호 조건을 확인해 주세요.",
          same_password: "기존 비밀번호와 다른 비밀번호를 입력해 주세요.",
          session_not_found: "재설정 링크가 만료되었습니다. 다시 요청해 주세요.",
        };
        setError(messages[updateError.code ?? ""] ?? "비밀번호를 변경하지 못했습니다. 다시 시도해 주세요.");
        return;
      }
      setPassword("");
      setConfirm("");
      setDone(true);
    } catch {
      setError("비밀번호를 변경하지 못했습니다. 다시 시도해 주세요.");
    } finally {
      setPending(false);
    }
  }

  return (
    <main className={styles.page}>
      <section className={styles.card}>
        <h1 className={styles.logo}>새 비밀번호 설정</h1>
        {linkState === "checking" && <p className={styles.status} role="status">재설정 링크를 확인하는 중...</p>}
        {linkState === "confirm" && <button className={styles.submit} type="button" disabled={pending} onClick={confirmLink}>{pending ? "확인 중..." : "재설정 링크 확인"}</button>}
        {linkState === "invalid" && <p className={`${styles.status} ${styles.statusError}`} role="alert">재설정 링크가 만료되었거나 유효하지 않습니다.</p>}
        {linkState === "ready" && !done && <form className={styles.fields} onSubmit={submit}>
          <div className={styles.field}>
            <label htmlFor="new-password">새 비밀번호</label>
            <input id="new-password" type="password" autoComplete="new-password" placeholder="새 비밀번호를 입력하세요" value={password} onChange={(event) => { setPassword(event.target.value); setError(""); }} required />
          </div>
          <div className={styles.field}>
            <label htmlFor="confirm-password">비밀번호 확인</label>
            <input id="confirm-password" type="password" autoComplete="new-password" placeholder="비밀번호를 다시 입력하세요" value={confirm} onChange={(event) => { setConfirm(event.target.value); setError(""); }} required />
          </div>
          <button className={styles.submit} type="submit" disabled={!password || !confirm || pending}>{pending ? "변경 중..." : "비밀번호 변경"}</button>
        </form>}
        {error && <p className={`${styles.status} ${styles.statusError}`} role="alert">{error}</p>}
        {done && <p className={`${styles.status} ${styles.statusSuccess}`} role="status">비밀번호가 변경되었습니다.</p>}
        <p className={styles.footer}><Link href={linkState === "invalid" ? "/forgot-password" : "/login"} className={styles.switch}>{linkState === "invalid" ? "재설정 링크 다시 요청하기" : "로그인 페이지로 이동"}</Link></p>
      </section>
    </main>
  );
}
