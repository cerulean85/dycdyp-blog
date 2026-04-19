import { redirect } from "next/navigation";

import { AdminLoginForm } from "@/components/admin-login-form";
import { getAdminSession } from "@/lib/admin-auth";

export default async function AdminLoginPage() {
  const session = await getAdminSession();

  if (session) {
    redirect("/admin");
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-[radial-gradient(circle_at_top,_rgba(251,191,36,0.18),_transparent_28%),linear-gradient(180deg,_#1c1917_0%,_#0c0a09_100%)] px-6">
      <div className="w-full max-w-md rounded-[2rem] border border-white/10 bg-white/5 p-8 shadow-[0_30px_80px_-40px_rgba(0,0,0,0.65)] backdrop-blur-sm">
        <p className="font-mono text-xs uppercase tracking-[0.35em] text-stone-400">
          Admin Login
        </p>
        <h1 className="mt-4 font-serif text-4xl text-white">관리자 로그인</h1>
        <p className="mt-3 text-sm leading-7 text-stone-300">
          Auth.js 기반 관리자 로그인으로 콘솔을 보호합니다. 현재는 운영 초기
          단계라 환경 변수 기반 Credentials 인증을 사용합니다.
        </p>
        <AdminLoginForm />
      </div>
    </div>
  );
}
