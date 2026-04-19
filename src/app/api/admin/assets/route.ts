import { NextResponse } from "next/server";

import { getAdminSession } from "@/lib/admin-auth";
import { getAdminMediaAssetPage } from "@/lib/media-assets";

export async function GET(request: Request) {
  const session = await getAdminSession();

  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const q = searchParams.get("q") ?? "";
  const mime = searchParams.get("mime") ?? "";
  const kind = searchParams.get("kind") ?? "";
  const sort = searchParams.get("sort") ?? "";
  const page = Number(searchParams.get("page") ?? "1") || 1;
  const pageSize = Number(searchParams.get("pageSize") ?? "12") || 12;

  const assetPage = await getAdminMediaAssetPage({
    filters: {
      query: q,
      mimeType: mime || undefined,
      kind: kind === "uploaded" || kind === "load_test" ? kind : undefined,
    },
    page,
    pageSize,
    sort:
      sort === "created_asc" ||
      sort === "alt_asc" ||
      sort === "size_desc" ||
      sort === "created_desc"
        ? sort
        : "created_desc",
  });

  return NextResponse.json(assetPage);
}
