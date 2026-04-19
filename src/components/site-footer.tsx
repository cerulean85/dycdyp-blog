import { Suspense } from "react";

import Link from "next/link";

import { NewsletterSignupForm } from "@/components/newsletter-signup-form";

export function SiteFooter() {
  return (
    <footer className="site-footer-shell border-t border-black/10 bg-white/70 text-stone-700 backdrop-blur-sm">
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-5 px-5 py-7 text-sm md:px-6 md:py-8">
        <div className="site-footer-newsletter flex flex-col gap-4 rounded-[1.25rem] border border-black/10 bg-stone-50/85 p-4 sm:flex-row sm:items-center sm:justify-between md:rounded-[1.5rem] md:p-5">
          <div>
            <p className="font-mono text-[11px] uppercase tracking-[0.22em] text-stone-500 md:text-xs md:tracking-[0.3em]">
              Newsletter
            </p>
            <p className="site-footer-copy mt-1.5 text-sm leading-6 text-stone-700 md:mt-2 md:text-base">
              중요한 글만 골라 메일로 다시 받아볼 수 있습니다.
            </p>
          </div>
          <div className="w-full max-w-md">
            <Suspense fallback={null}>
              <NewsletterSignupForm
                source="footer_cta"
                buttonLabel="구독하기"
                inputPlaceholder="you@example.com"
                tone="adaptive"
              />
            </Suspense>
          </div>
        </div>
        <div className="site-footer-legal flex flex-wrap items-center justify-center gap-x-3 gap-y-1 text-center text-sm leading-6 text-stone-500 sm:justify-end sm:text-left">
          <Link href="/policy" className="transition hover:text-stone-950">
            서비스 이용약관
          </Link>
          <span className="text-stone-400">·</span>
          <Link href="/terms" className="transition hover:text-stone-950">
            개인정보처리방침
          </Link>
          <span className="text-stone-400">·</span>
          <span className="text-stone-500">
            © 2026 DYCDYP. All rights reserved.
          </span>
        </div>
      </div>
    </footer>
  );
}
