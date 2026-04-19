"use client";

import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import type { FormEvent } from "react";
import { useState } from "react";

export function AdminLoginForm() {
  const router = useRouter();
  const [isPending, setIsPending] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setIsPending(true);
    setError("");

    const formData = new FormData(event.currentTarget);
    const email = String(formData.get("email") ?? "").trim();
    const password = String(formData.get("password") ?? "");

    const result = await signIn("credentials", {
      email,
      password,
      redirect: false,
      callbackUrl: "/admin",
    });

    if (!result || result.error) {
      setError("이메일 또는 비밀번호가 올바르지 않습니다.");
      setIsPending(false);
      return;
    }

    router.push("/admin");
    router.refresh();
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="mt-8 space-y-4"
    >
      {error ? (
        <p className="rounded-xl border border-red-400/25 bg-red-500/10 px-4 py-3 text-sm text-red-200">
          {error}
        </p>
      ) : null}
      <label className="block">
        <span className="mb-2 block text-sm text-stone-300">이메일</span>
        <input
          type="email"
          name="email"
          className="w-full rounded-2xl border border-white/10 bg-black/20 px-4 py-3 text-white outline-none transition focus:border-amber-300"
          placeholder="editor@dycdyp.com"
          required
        />
      </label>
      <label className="block">
        <span className="mb-2 block text-sm text-stone-300">비밀번호</span>
        <input
          type="password"
          name="password"
          className="w-full rounded-2xl border border-white/10 bg-black/20 px-4 py-3 text-white outline-none transition focus:border-amber-300"
          placeholder="관리자 비밀번호"
          required
        />
      </label>
      <button
        type="submit"
        disabled={isPending}
        className="w-full rounded-full bg-amber-300 px-5 py-3 text-sm font-medium text-stone-950 transition hover:bg-amber-200 disabled:cursor-not-allowed disabled:bg-amber-100"
      >
        {isPending ? "로그인 중..." : "로그인"}
      </button>
    </form>
  );
}
