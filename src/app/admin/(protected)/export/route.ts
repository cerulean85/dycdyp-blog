import { assertCanExportData, getAdminSession } from "@/lib/admin-auth";
import { getAdminPosts } from "@/lib/admin-posts";

function escapeCsvValue(value: string) {
  return `"${value.replaceAll('"', '""')}"`;
}

export async function GET(request: Request) {
  const session = await getAdminSession();

  if (!session) {
    return Response.redirect(new URL("/admin/login", request.url), 302);
  }

  try {
    assertCanExportData(session.role);
  } catch {
    return Response.redirect(new URL("/admin?permissionError=1", request.url), 302);
  }

  const { searchParams } = new URL(request.url);
  const q = searchParams.get("q") ?? "";
  const status = searchParams.get("status") ?? "";
  const category = searchParams.get("category") ?? "";
  const sort = searchParams.get("sort") ?? "";

  const posts = await getAdminPosts({
    query: q,
    status:
      status === "draft" ||
      status === "review" ||
      status === "approved" ||
      status === "published"
        ? status
        : undefined,
    categoryRoot:
      category === "investment" ||
      category === "ai" ||
      category === "culture" ||
      category === "humanities"
        ? category
        : undefined,
    sort:
      sort === "updated_desc" ||
      sort === "updated_asc" ||
      sort === "title_asc" ||
      sort === "title_desc"
        ? sort
        : undefined,
  });

  const header = [
    "title",
    "slug",
    "status",
    "category_root",
    "category_leaf",
    "updated_at",
    "published_at",
  ];
  const rows = posts.map((post) =>
    [
      post.title,
      post.slug,
      post.status,
      post.categoryRoot,
      post.categoryLeaf,
      post.updatedAt,
      post.publishedAt,
    ]
      .map(escapeCsvValue)
      .join(","),
  );

  const csv = `\uFEFF${[header.join(","), ...rows].join("\n")}`;
  const filenameParts = ["admin-posts"];

  if (status) {
    filenameParts.push(status);
  }

  if (category) {
    filenameParts.push(category);
  }

  if (q) {
    filenameParts.push("filtered");
  }

  return new Response(csv, {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="${filenameParts.join("-")}.csv"`,
      "Cache-Control": "no-store",
    },
  });
}
