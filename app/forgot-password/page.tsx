'use client';

import Link from 'next/link';
import { useLayoutEffect, useState, type FormEvent } from 'react';
import { createClient } from '../../utils/supabase/client';
import styles from '../auth.module.css';

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [pending, setPending] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState('');

  useLayoutEffect(
    () => () => {
      setEmail('');
      setPending(false);
      setSent(false);
      setError('');
    },
    [],
  );

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!email.trim() || pending || sent) return;
    setPending(true);
    setError('');
    try {
      const { error: sendError } = await createClient().auth.resetPasswordForEmail(email.trim(), {
        redirectTo: `${window.location.origin}/auth/callback`,
      });
      if (sendError) {
        const messages: Record<string, string> = {
          email_address_invalid: '올바른 이메일 주소를 입력해 주세요.',
          over_email_send_rate_limit: '메일 발송 제한에 도달했습니다. 잠시 후 다시 시도해 주세요.',
          over_request_rate_limit: '요청이 너무 많습니다. 잠시 후 다시 시도해 주세요.',
        };
        setError(messages[sendError.code ?? ''] ?? '재설정 링크를 보내지 못했습니다. 다시 시도해 주세요.');
        return;
      }
      setSent(true);
    } catch {
      setError('재설정 링크를 보내지 못했습니다. 다시 시도해 주세요.');
    } finally {
      setPending(false);
    }
  }

  return (
    <main className={styles.page}>
      <section className={styles.card}>
        <h1 className={styles.logo}>비밀번호 찾기</h1>
        <form className={styles.fields} onSubmit={submit} noValidate>
          <div className={styles.field}>
            <label htmlFor="recovery-email">이메일</label>
            <input
              id="recovery-email"
              type="email"
              autoComplete="email"
              placeholder="이메일을 입력하세요"
              value={email}
              onChange={(event) => {
                setEmail(event.target.value);
                setSent(false);
                setError('');
              }}
            />
          </div>
          <button className={styles.submit} type="submit" disabled={!email.trim() || pending || sent}>
            {pending ? '발송 중...' : '비밀번호 재설정 링크 발송'}
          </button>
        </form>
        {error && (
          <p className={`${styles.status} ${styles.statusError}`} role="alert">
            {error}
          </p>
        )}
        {sent && (
          <p className={`${styles.status} ${styles.statusSuccess}`} role="status">
            재설정 링크를 발송했습니다. 메일함을 확인해 주세요.
          </p>
        )}
        <p className={styles.footer}>
          <Link href="/login" className={styles.switch}>
            로그인으로 돌아가기
          </Link>
        </p>
      </section>
    </main>
  );
}
