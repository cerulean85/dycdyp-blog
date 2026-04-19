import Link from "next/link";

import { AdminLogoutButton } from "@/components/admin-logout-button";
import { BrandLogo } from "@/components/brand-logo";
import { requireAdminSession } from "@/lib/admin-auth";

export default async function AdminProtectedLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const session = await requireAdminSession();

  return (
    <div className="min-h-screen bg-stone-950 text-stone-100">
      <header className="border-b border-white/10">
        <div className="mx-auto flex w-full max-w-6xl items-center justify-between px-6 py-4">
          <div className="flex items-center gap-4">
            <BrandLogo href="/" mode="dark" compact showTagline={false} />
            <div className="hidden border-l border-white/10 pl-4 lg:block">
              <p className="font-mono text-[11px] uppercase tracking-[0.35em] text-stone-400">
                Admin
              </p>
              <h1 className="font-serif text-2xl">Editorial Console</h1>
            </div>
          </div>
          <div className="flex items-center gap-3 text-sm">
            <span className="rounded-full border border-white/15 px-3 py-1 text-xs uppercase tracking-[0.2em] text-stone-300">
              {session.role}
            </span>
            <span className="text-stone-400">{session.email}</span>
            <AdminLogoutButton />
          </div>
        </div>
      </header>
      <div className="mx-auto grid w-full max-w-6xl gap-8 px-6 py-8 lg:grid-cols-[220px_minmax(0,1fr)]">
        <aside className="rounded-[1.75rem] border border-white/10 bg-white/5 p-5">
          <nav className="flex flex-col gap-2 text-sm text-stone-300">
            <Link
              href="/admin"
              className="rounded-xl px-3 py-2 transition hover:bg-white/10 hover:text-white"
            >
              게시물 목록
            </Link>
            <Link
              href="/admin/posts/new"
              className="rounded-xl px-3 py-2 transition hover:bg-white/10 hover:text-white"
            >
              새 게시물
            </Link>
            <Link
              href="/admin/newsletter"
              className="rounded-xl px-3 py-2 transition hover:bg-white/10 hover:text-white"
            >
              뉴스레터 구독자
            </Link>
            <Link
              href="/admin/assets"
              className="rounded-xl px-3 py-2 transition hover:bg-white/10 hover:text-white"
            >
              이미지 자산
            </Link>
          </nav>
        </aside>
        <main className="min-w-0 max-w-full overflow-x-hidden">{children}</main>
      </div>
    </div>
  );
}
