import { AdminRole } from "@prisma/client";

import { prisma } from "@/lib/prisma";

export async function ensureAdminUser(
  email: string,
  role: AdminRole = AdminRole.ADMIN,
) {
  return prisma.adminUser.upsert({
    where: {
      email,
    },
    update: {
      role,
    },
    create: {
      email,
      displayName: role === AdminRole.ADMIN ? "DYCDYP Admin" : "DYCDYP Editor",
      role,
    },
  });
}
