import { NextResponse } from "next/server";

import { assertCanManageAssets, getAdminSession } from "@/lib/admin-auth";
import {
  deleteAdminMediaAsset,
  getAdminMediaAssetById,
  updateAdminMediaAssetAltText,
} from "@/lib/media-assets";

type RouteContext = {
  params: Promise<{
    id: string;
  }>;
};

export async function GET(_request: Request, context: RouteContext) {
  const session = await getAdminSession();

  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  assertCanManageAssets(session.role);

  const { id } = await context.params;
  const asset = await getAdminMediaAssetById(id);

  if (!asset) {
    return NextResponse.json({ error: "자산을 찾을 수 없습니다." }, { status: 404 });
  }

  return NextResponse.json(asset);
}

export async function PATCH(request: Request, context: RouteContext) {
  const session = await getAdminSession();

  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  assertCanManageAssets(session.role);

  const { id } = await context.params;
  const body = (await request.json()) as {
    altText?: string;
  };

  const asset = await updateAdminMediaAssetAltText({
    id,
    altText: String(body.altText ?? ""),
  });

  return NextResponse.json(asset);
}

export async function DELETE(_request: Request, context: RouteContext) {
  const session = await getAdminSession();

  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    assertCanManageAssets(session.role);
    const { id } = await context.params;
    const result = await deleteAdminMediaAsset(id);
    return NextResponse.json(result);
  } catch (error) {
    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "자산 삭제에 실패했습니다.",
      },
      { status: 400 },
    );
  }
}
