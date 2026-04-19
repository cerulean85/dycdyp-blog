import { Suspense } from "react";

import Link from "next/link";

import { NewsletterSignupForm } from "@/components/newsletter-signup-form";

export function SiteFooter() {
  return (
    <footer className="border-t border-black/10 bg-stone-950 text-stone-200">
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-5 px-5 py-7 text-sm md:px-6 md:py-8">
        <div className="flex flex-col gap-4 rounded-[1.25rem] border border-white/10 bg-white/5 p-4 sm:flex-row sm:items-center sm:justify-between md:rounded-[1.5rem] md:p-5">
          <div>
            <p className="font-mono text-[11px] uppercase tracking-[0.22em] text-stone-400 md:text-xs md:tracking-[0.3em]">
              Newsletter
            </p>
            <p className="mt-1.5 text-sm leading-6 text-stone-200 md:mt-2 md:text-base">
              중요한 글만 골라 메일로 다시 받아볼 수 있습니다.
            </p>
          </div>
          <div className="w-full max-w-md">
            <Suspense fallback={null}>
              <NewsletterSignupForm
                source="footer_cta"
                buttonLabel="구독하기"
                inputPlaceholder="you@example.com"
                tone="dark"
              />
            </Suspense>
          </div>
        </div>
        <div className="flex flex-wrap items-center justify-center gap-x-3 gap-y-1 text-center text-sm leading-6 text-stone-400 sm:justify-end sm:text-left">
          <Link href="/policy" className="transition hover:text-stone-200">
            서비스 이용약관
          </Link>
          <span className="text-stone-600">·</span>
          <Link href="/terms" className="transition hover:text-stone-200">
            개인정보처리방침
          </Link>
          <span className="text-stone-600">·</span>
          <span className="text-stone-500">
            © 2026 DYCDYP. All rights reserved.
          </span>
        </div>
      </div>
    </footer>
  );
}
