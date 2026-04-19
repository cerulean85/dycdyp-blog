export function normalizeNewsletterEmail(email: string) {
  return email.trim().toLowerCase();
}

export function validateNewsletterEmail(email: string) {
  const normalizedEmail = normalizeNewsletterEmail(email);

  if (!normalizedEmail || !normalizedEmail.includes("@")) {
    return {
      ok: false as const,
      code: "invalid_email" as const,
    };
  }

  return {
    ok: true as const,
    normalizedEmail,
  };
}
