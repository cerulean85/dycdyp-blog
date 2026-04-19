"use client";

import { signOut } from "next-auth/react";

export function AdminLogoutButton() {
  return (
    <button
      type="button"
      onClick={() => signOut({ callbackUrl: "/admin/login" })}
      className="rounded-full border border-white/20 px-4 py-2 text-stone-200 transition hover:border-white/40"
    >
      로그아웃
    </button>
  );
}
