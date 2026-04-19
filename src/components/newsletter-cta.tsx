import { Suspense } from "react";

import { NewsletterSignupForm } from "@/components/newsletter-signup-form";

type NewsletterCtaProps = {
  compact?: boolean;
};

export function NewsletterCta({ compact = false }: NewsletterCtaProps) {
  if (compact) {
    return (
      <section className="rounded-[1.75rem] border border-black/10 bg-white p-6 shadow-[0_20px_60px_-35px_rgba(0,0,0,0.25)]">
        <p className="font-mono text-xs uppercase tracking-[0.3em] text-stone-500">
          Newsletter
        </p>
        <h2 className="mt-4 font-serif text-3xl text-stone-950">
          이런 글을 메일로 받아보세요.
        </h2>
        <p className="mt-3 text-sm leading-7 text-stone-600">
          투자, AI, 문화, 인문에서 오래 남을 만한 관점을 큐레이션해서 보냅니다.
        </p>
        <div className="mt-6">
          <Suspense fallback={null}>
            <NewsletterSignupForm
              source="article_cta"
              buttonLabel="뉴스레터 구독"
              inputPlaceholder="you@example.com"
              tone="light"
            />
          </Suspense>
        </div>
      </section>
    );
  }

  return (
    <section className="rounded-[2rem] border border-black/10 bg-stone-950 p-8 text-stone-200 shadow-[0_20px_60px_-35px_rgba(0,0,0,0.45)]">
      <p className="font-mono text-xs uppercase tracking-[0.3em] text-stone-400">
        Newsletter
      </p>
      <h2 className="mt-4 max-w-3xl font-serif text-4xl leading-tight text-white">
        블로그에 자주 오지 않아도, 중요한 글만 뉴스레터로 다시 만날 수 있습니다.
      </h2>
      <p className="mt-4 max-w-2xl text-sm leading-8 text-stone-300">
        투자에서는 숫자 뒤의 맥락을, AI에서는 새 흐름의 의미를, 문화와 인문에서는
        오래 남는 문장을 골라 정기적으로 큐레이션합니다.
      </p>
      <div className="mt-8">
        <Suspense fallback={null}>
          <NewsletterSignupForm
            source="site_cta"
            buttonLabel="뉴스레터 구독하기"
            inputPlaceholder="you@example.com"
            tone="dark"
          />
        </Suspense>
        <p className="mt-3 text-xs leading-6 text-stone-400">
          구독 폼은 Neon에 저장되며, 발송 도구 연결 전까지 구독 의사 수집을 먼저
          진행합니다.
        </p>
      </div>
    </section>
  );
}
