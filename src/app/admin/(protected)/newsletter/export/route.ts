import { assertCanExportData, getAdminSession } from "@/lib/admin-auth";
import { getNewsletterSubscribers } from "@/lib/newsletter";

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
  const source = searchParams.get("source") ?? "";
  const status = searchParams.get("status") ?? "";
  const sort = searchParams.get("sort") ?? "";
  const subscribers = await getNewsletterSubscribers({
    query: q,
    source,
    status: status === "active" || status === "blocked" ? status : undefined,
    sort:
      sort === "created_desc" ||
      sort === "created_asc" ||
      sort === "email_asc" ||
      sort === "email_desc"
        ? sort
        : undefined,
  });

  const header = [
    "email",
    "status",
    "source",
    "blocked_at",
    "blocked_reason",
    "created_at",
    "updated_at",
  ];
  const rows = subscribers.map((subscriber) =>
    [
      subscriber.email,
      subscriber.status,
      subscriber.source,
      subscriber.blockedAt ?? "",
      subscriber.blockedReason ?? "",
      subscriber.createdAt,
      subscriber.updatedAt,
    ]
      .map(escapeCsvValue)
      .join(","),
  );

  const csv = `\uFEFF${[header.join(","), ...rows].join("\n")}`;
  const filenameParts = ["newsletter-subscribers"];

  if (source) {
    filenameParts.push(source.replaceAll(/[^a-zA-Z0-9_-]/g, "-"));
  }

  if (status) {
    filenameParts.push(status);
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
