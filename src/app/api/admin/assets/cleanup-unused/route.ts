import { NextResponse } from "next/server";

import { assertCanManageAssets, getAdminSession } from "@/lib/admin-auth";
import { deleteUnusedAdminMediaAssets } from "@/lib/media-assets";

export async function POST(request: Request) {
  const session = await getAdminSession();

  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    assertCanManageAssets(session.role);

    const body = (await request.json()) as {
      q?: string;
      mime?: string;
      kind?: "uploaded" | "load_test";
    };

    const result = await deleteUnusedAdminMediaAssets({
      filters: {
        query: String(body.q ?? "").trim() || undefined,
        mimeType: String(body.mime ?? "").trim() || undefined,
        kind:
          body.kind === "uploaded" || body.kind === "load_test"
            ? body.kind
            : undefined,
      },
    });

    return NextResponse.json(result);
  } catch (error) {
    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "미사용 자산 일괄 정리에 실패했습니다.",
      },
      { status: 400 },
    );
  }
}
