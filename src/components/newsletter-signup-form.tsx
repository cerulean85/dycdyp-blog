"use client";

import { usePathname, useSearchParams } from "next/navigation";

import { subscribeNewsletterAction } from "@/app/newsletter/actions";

type NewsletterSignupFormProps = {
  source: string;
  buttonLabel?: string;
  inputPlaceholder?: string;
  layout?: "stack" | "inline";
  tone?: "light" | "dark" | "adaptive";
};

const statusCopy = {
  success: "구독이 등록되었습니다.",
  duplicate: "이미 등록된 이메일입니다.",
  invalid: "유효한 이메일 주소를 입력해 주세요.",
  blocked: "이 이메일 주소는 현재 구독이 차단되어 있습니다.",
} as const;

export function NewsletterSignupForm({
  source,
  buttonLabel = "구독하기",
  inputPlaceholder = "you@example.com",
  layout = "inline",
  tone = "light",
}: NewsletterSignupFormProps) {
  const pathname = usePathname() || "/";
  const searchParams = useSearchParams();
  const status = searchParams.get("newsletter");
  const feedback =
    status && status in statusCopy
      ? statusCopy[status as keyof typeof statusCopy]
      : null;

  const inputClassName =
    tone === "adaptive"
      ? "newsletter-signup-input min-w-0 flex-1 rounded-[1.5rem] px-4 py-3 text-sm outline-none transition"
      : tone === "dark"
      ? "min-w-0 flex-1 rounded-[1.5rem] border border-white/10 bg-white/5 px-4 py-3 text-sm text-white outline-none transition placeholder:text-stone-500 focus:border-white/30 focus:bg-white/10"
      : "min-w-0 flex-1 rounded-[1.5rem] border border-black/10 bg-stone-50 px-4 py-3 text-sm text-stone-950 outline-none transition placeholder:text-stone-400 focus:border-stone-950 focus:bg-white";
  const buttonClassName =
    tone === "adaptive"
      ? "newsletter-signup-button inline-flex min-h-[3rem] items-center justify-center rounded-[1.5rem] px-5 py-3 text-sm font-medium transition"
      : tone === "dark"
      ? "inline-flex min-h-[3rem] items-center justify-center rounded-[1.5rem] bg-white px-5 py-3 text-sm font-medium text-stone-950 transition hover:bg-stone-200"
      : "inline-flex min-h-[3rem] items-center justify-center rounded-[1.5rem] bg-stone-950 px-5 py-3 text-sm font-medium text-white transition hover:bg-stone-800";

  return (
    <form
      action={subscribeNewsletterAction}
      className={layout === "stack" ? "space-y-3" : "flex flex-col gap-3 sm:flex-row"}
    >
      <input type="hidden" name="redirectTo" value={pathname} />
      <input type="hidden" name="source" value={source} />
      <input
        type="email"
        name="email"
        required
        placeholder={inputPlaceholder}
        className={inputClassName}
      />
      <button type="submit" className={buttonClassName}>
        {buttonLabel}
      </button>
      {feedback ? (
        <p
          className={
            tone === "adaptive"
              ? "newsletter-signup-feedback sm:basis-full text-xs"
              : tone === "dark"
              ? "sm:basis-full text-xs text-stone-400"
              : "sm:basis-full text-xs text-stone-500"
          }
        >
          {feedback}
        </p>
      ) : null}
    </form>
  );
}
