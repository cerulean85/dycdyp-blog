"use server";

import { redirect } from "next/navigation";

import { getNewsletterRedirectPath } from "@/lib/newsletter-action-helpers";
import { subscribeToNewsletter } from "@/lib/newsletter";

export async function subscribeNewsletterAction(formData: FormData) {
  const email = String(formData.get("email") ?? "").trim();
  const redirectTo = String(formData.get("redirectTo") ?? "/").trim() || "/";
  const source = String(formData.get("source") ?? "site_newsletter").trim();

  const result = await subscribeToNewsletter({
    email,
    source,
  });

  redirect(getNewsletterRedirectPath(result, redirectTo));
}
