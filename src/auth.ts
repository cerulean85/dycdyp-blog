import { AdminRole } from "@prisma/client";
import type { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";

import { ensureAdminUser } from "@/lib/admin-users";
import { normalizeAdminRole } from "@/lib/admin-permissions";

export const authOptions: NextAuthOptions = {
  secret:
    process.env.NEXTAUTH_SECRET ??
    process.env.AUTH_SECRET ??
    process.env.ADMIN_SESSION_SECRET,
  session: {
    strategy: "jwt",
  },
  pages: {
    signIn: "/admin/login",
  },
  providers: [
    CredentialsProvider({
      name: "Admin Credentials",
      credentials: {
        email: { label: "이메일", type: "email" },
        password: { label: "비밀번호", type: "password" },
      },
      async authorize(credentials) {
        const email = String(credentials?.email ?? "").trim();
        const password = String(credentials?.password ?? "");
        const loginCandidates = [
          {
            email: process.env.ADMIN_LOGIN_EMAIL,
            password: process.env.ADMIN_LOGIN_PASSWORD,
            role: AdminRole.ADMIN,
          },
          {
            email: process.env.EDITOR_LOGIN_EMAIL,
            password: process.env.EDITOR_LOGIN_PASSWORD,
            role: AdminRole.EDITOR,
          },
        ].filter((candidate) => candidate.email && candidate.password);

        if (!loginCandidates.length) {
          throw new Error("관리자 인증 환경 변수가 설정되지 않았습니다.");
        }

        const matchedCandidate = loginCandidates.find(
          (candidate) =>
            email === candidate.email && password === candidate.password,
        );

        if (!matchedCandidate) {
          return null;
        }

        const adminUser = await ensureAdminUser(email, matchedCandidate.role);

        return {
          id: adminUser.id,
          email: adminUser.email,
          name: adminUser.displayName ?? adminUser.email,
          role: normalizeAdminRole(adminUser.role.toLowerCase()),
        };
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.email = user.email;
        token.role = (user as { role?: string }).role ?? "editor";
      }

      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.email = token.email as string;
        session.user.name =
          session.user.name ?? (token.email as string | undefined) ?? null;
        session.user.role = token.role as string;
      }

      return session;
    },
  },
};
