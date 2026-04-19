export function getNewsletterRedirectPath(
  result:
    | { ok: false; code: "invalid_email" | "blocked" }
    | { ok: true; code: "subscribed" | "already_subscribed" },
  redirectPath = "/",
) {
  const params = new URLSearchParams();

  if (!result.ok) {
    params.set("newsletter", result.code === "blocked" ? "blocked" : "invalid");
    return `${redirectPath}?${params.toString()}`;
  }

  if (result.code === "already_subscribed") {
    params.set("newsletter", "duplicate");
    return `${redirectPath}?${params.toString()}`;
  }

  params.set("newsletter", "success");
  return `${redirectPath}?${params.toString()}`;
}
