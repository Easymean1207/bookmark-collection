import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";
import { pageMetadata } from "../../lib/page-metadata";
import styles from "../page.module.css";

export const metadata: Metadata = {
  ...pageMetadata("개인정보 처리방침", "북마크 모음집의 개인정보 처리방침입니다."),
  robots: { index: true, follow: true },
};

const effectiveDate = "2026-11-25";
const contactEmail = "easymean1207@gmail.com";

const sections = [
  ["purpose", "개인정보의 처리 목적"],
  ["items", "처리하는 개인정보의 항목"],
  ["retention", "처리 및 보유 기간"],
  ["disclosure", "제3자 제공"],
  ["outsourcing", "처리 업무의 위탁"],
  ["deletion", "파기 절차와 방법"],
  ["rights", "정보주체의 권리와 행사 방법"],
  ["security", "안전성 확보 조치"],
  ["cookies", "쿠키 사용과 거부 방법"],
  ["contact", "개인정보 보호책임자 및 문의"],
  ["remedy", "권익침해 구제 방법"],
  ["changes", "처리방침의 변경"],
] as const;

async function PreviousPageLink({ searchParams }: { searchParams: PageProps<"/privacy">["searchParams"] }) {
  const from = (await searchParams).from;
  const backHref = typeof from === "string" && (from === "/" || from === "/signup" || from === "/new" || /^\/folder\/db-[1-9]\d*$/.test(from)) ? from : "/";
  return <Link href={backHref} className={styles.addButton}>← 이전 페이지로 돌아가기</Link>;
}

export default function PrivacyPage({ searchParams }: PageProps<"/privacy">) {
  return (
    <main className="mx-auto min-h-screen max-w-5xl px-5 py-9 text-[var(--text)] sm:py-12">
      <article className="rounded-2xl bg-[var(--surface)] px-5 py-8 shadow-[0_2px_8px_rgba(25,31,40,0.08)] sm:px-10 sm:py-10">
        <header className="border-b border-gray-200 pb-8">
          <p className="mb-3 text-sm font-semibold text-[var(--accent-hover)]">북마크 모음집 · 개인정보 안내</p>
          <h1 className="text-[30px] font-bold leading-tight tracking-tight sm:text-[34px]">개인정보 처리방침</h1>
          <p className="mt-4 inline-flex rounded-lg bg-[var(--accent-soft)] px-3 py-1.5 text-sm font-medium text-[var(--accent-hover)]">시행일: <time className="ml-1" dateTime={effectiveDate}>{effectiveDate}</time></p>
        </header>

        <p className="mt-7 max-w-[640px] text-[17px] leading-8">
          북마크 모음집(운영자: 이지민)은 개인정보 보호법에 따라 이용자의 개인정보를 보호하고,
          개인정보와 관련한 문의를 처리하기 위해 다음과 같이 개인정보 처리방침을 공개합니다.
        </p>

        <div className="mt-9 grid gap-9 lg:grid-cols-[220px_minmax(0,1fr)] lg:gap-10">
          <nav aria-label="개인정보 처리방침 목차" className="rounded-xl bg-[var(--background)] p-4 lg:sticky lg:top-6 lg:self-start">
            <h2 className="px-2 text-base font-bold">목차</h2>
            <ol className="mt-3 grid gap-1 sm:grid-cols-2 lg:grid-cols-1">
              {sections.map(([id, title], index) => (
                <li key={id}>
                  <a className="privacy-nav-link flex items-start gap-2 rounded-lg px-2 py-2 text-sm leading-5 text-[var(--text)] focus-visible:outline-2 focus-visible:outline-[var(--accent)]" href={`#${id}`}>
                    <span className="font-bold text-[var(--accent-hover)]">{String(index + 1).padStart(2, "0")}{" "}</span>
                    <span>{title}</span>
                  </a>
                </li>
              ))}
            </ol>
          </nav>

          <div className="min-w-0 max-w-[640px] divide-y divide-gray-200 text-[16px] leading-7 sm:text-[17px] sm:leading-8 [&_h2]:mb-4 [&_h2]:text-[20px] [&_h2]:font-bold [&_h2]:leading-7 [&_section]:scroll-mt-6 [&_section]:py-8 [&_section:first-child]:pt-0">
          <section id="purpose">
            <h2>1. 개인정보의 처리 목적</h2>
            <p>계정 생성과 로그인, 저장한 링크 및 폴더의 관리, 문의 응대와 서비스의 안전한 운영을 위해 개인정보를 처리합니다.</p>
          </section>

          <section id="items">
            <h2>2. 처리하는 개인정보의 항목</h2>
            <ul className="list-disc space-y-2 pl-6">
              <li>이메일 가입 시: 이메일 주소, 비밀번호. 비밀번호는 Supabase 인증 서비스에서 처리하며 서비스가 원문을 보관하지 않습니다.</li>
              <li>구글 또는 카카오 로그인 시: 로그인 제공자가 전달하는 계정 식별자와 이메일 주소(제공된 경우).</li>
              <li>서비스 이용 시: 저장한 링크의 URL·제목·설명·썸네일 URL, 폴더 이름, 생성 시각 및 계정 식별자.</li>
              <li>브라우저 저장소에 계정별 폴더 정렬 순서를 저장합니다.</li>
              <li>접속 과정에서: 로그인 세션 쿠키, IP 주소와 접속 기록이 인증 및 호스팅 서비스 운영 과정에서 생성될 수 있습니다.</li>
            </ul>
          </section>

          <section id="retention">
            <h2>3. 개인정보의 처리 및 보유 기간</h2>
            <p>계정 정보와 저장한 링크·폴더 정보는 서비스 이용 기간 동안 보유합니다. 계정 삭제를 요청하거나 처리 목적이 끝나면 지체 없이 파기합니다. 관계 법령에 따라 보존할 의무가 있는 정보는 해당 법령에서 정한 기간 동안만 별도로 보관합니다.</p>
          </section>

          <section id="disclosure">
            <h2>4. 개인정보의 제3자 제공</h2>
            <p>법령에 근거가 있거나 이용자가 별도로 동의한 경우를 제외하고, 개인정보를 제3자에게 제공하지 않습니다.</p>
          </section>

          <section id="outsourcing">
            <h2>5. 개인정보 처리 업무의 위탁</h2>
            <p>서비스 제공을 위해 다음 업체의 서비스를 이용합니다.</p>
            <div className="mt-4 overflow-x-auto rounded-xl border border-gray-200">
              <table className="w-full min-w-[420px] text-left text-[15px] leading-6">
                <thead><tr className="bg-[var(--background)]"><th className="w-2/5 p-3 font-semibold">업체</th><th className="p-3 font-semibold">처리 업무</th></tr></thead>
                <tbody className="divide-y divide-gray-200">
                  <tr><td className="p-3 align-top">Supabase Pte. Ltd.</td><td className="p-3">회원 인증, 인증 이메일 발송, 링크·폴더 데이터 저장</td></tr>
                  <tr><td className="p-3 align-top">Vercel Inc.</td><td className="p-3">웹 서비스 호스팅 및 접속 처리</td></tr>
                </tbody>
              </table>
            </div>
          </section>

          <section id="deletion">
            <h2>6. 개인정보의 파기 절차와 방법</h2>
            <p>보유 기간이 끝나거나 삭제 요청을 처리한 정보는 서비스 데이터베이스에서 삭제합니다. 관계 법령에 따른 보존 대상 정보는 분리하여 보관한 뒤 기간이 끝나면 삭제합니다.</p>
          </section>

          <section id="rights">
            <h2>7. 정보주체와 법정대리인의 권리·의무 및 행사 방법</h2>
            <p>이용자와 법정대리인은 개인정보 열람, 정정, 삭제, 처리정지 및 동의 철회를 요청할 수 있습니다. 아래 이메일로 요청하면 본인 확인 후 처리하고 결과를 안내합니다.</p>
            <a className="break-all font-semibold text-[var(--accent-hover)] underline" href={`mailto:${contactEmail}`}>{contactEmail}</a>
          </section>

          <section id="security">
            <h2>8. 개인정보의 안전성 확보 조치</h2>
            <p>서비스는 HTTPS 통신, 계정별 데이터 접근 제한(Row Level Security), 인증 정보의 접근 권한 관리를 적용합니다.</p>
          </section>

          <section id="cookies">
            <h2>9. 쿠키의 사용과 거부 방법</h2>
            <p>로그인 상태를 유지하기 위해 인증 쿠키를 사용하고, 폴더 정렬 순서는 브라우저 저장소에 보관합니다. 브라우저 설정에서 쿠키와 사이트 데이터를 차단하거나 삭제할 수 있으나, 차단하면 로그인이 필요한 기능을 이용하기 어렵습니다.</p>
          </section>

          <section id="contact">
            <h2>10. 개인정보 보호책임자 및 문의</h2>
            <p>개인정보 보호책임자: 이지민</p>
            <p>문의 이메일: <a className="break-all font-semibold text-[var(--accent-hover)] underline" href={`mailto:${contactEmail}`}>{contactEmail}</a></p>
          </section>

          <section id="remedy">
            <h2>11. 권익침해 구제 방법</h2>
            <p>개인정보 침해에 관한 상담과 구제를 원할 경우 개인정보침해신고센터(국번 없이 118) 또는 개인정보분쟁조정위원회(1833-6972)에 문의할 수 있습니다.</p>
          </section>

          <section id="changes">
            <h2>12. 개인정보 처리방침의 변경</h2>
            <p>이 방침은 <time dateTime={effectiveDate}>{effectiveDate}</time>부터 적용됩니다. 내용이 바뀌면 변경 사항과 시행일을 이 페이지에 안내합니다.</p>
          </section>
          </div>
        </div>
      </article>
      <div className="mt-8 flex justify-center">
        <Suspense fallback={null}><PreviousPageLink searchParams={searchParams} /></Suspense>
      </div>
    </main>
  );
}
