const baseUrl = process.env.BASE_URL ?? "http://localhost:3000";

function compactCookies(setCookieHeaders) {
  return setCookieHeaders.map((value) => value.split(";")[0]).join("; ");
}

async function loginAs(email, password) {
  const csrfResponse = await fetch(`${baseUrl}/api/auth/csrf`);
  const csrfPayload = await csrfResponse.json();
  const csrfCookies = csrfResponse.headers.getSetCookie?.() ?? [];

  if (!csrfPayload?.csrfToken) {
    throw new Error("Failed to get csrf token");
  }

  const callbackResponse = await fetch(`${baseUrl}/api/auth/callback/credentials`, {
    method: "POST",
    headers: {
      "content-type": "application/x-www-form-urlencoded",
      cookie: compactCookies(csrfCookies),
    },
    body: new URLSearchParams({
      csrfToken: csrfPayload.csrfToken,
      email,
      password,
      callbackUrl: `${baseUrl}/admin`,
    }),
    redirect: "manual",
  });

  const authCookies = callbackResponse.headers.getSetCookie?.() ?? [];
  const sessionToken = authCookies.find((value) => value.startsWith("next-auth.session-token="));

  if (!sessionToken) {
    throw new Error(`Login failed for ${email}`);
  }

  return compactCookies([...csrfCookies, ...authCookies]);
}

async function checkRoute(cookie, label, path, expected) {
  const response = await fetch(`${baseUrl}${path}`, {
    method: "HEAD",
    headers: {
      cookie,
    },
    redirect: "manual",
  });

  const ok = Array.isArray(expected)
    ? expected.includes(response.status)
    : response.status === expected;
  const mark = ok ? "OK " : "FAIL";
  console.log(
    `[${mark}] ${label}: ${response.status} (expected ${
      Array.isArray(expected) ? expected.join("/") : expected
    }) ${path}`,
  );

  if (!ok) {
    throw new Error(`${label} failed`);
  }
}

async function main() {
  const adminEmail = process.env.ADMIN_LOGIN_EMAIL;
  const adminPassword = process.env.ADMIN_LOGIN_PASSWORD;
  const editorEmail = process.env.EDITOR_LOGIN_EMAIL;
  const editorPassword = process.env.EDITOR_LOGIN_PASSWORD;

  if (!adminEmail || !adminPassword || !editorEmail || !editorPassword) {
    throw new Error("ADMIN_LOGIN_* and EDITOR_LOGIN_* env vars are required");
  }

  console.log(`Auth smoke checking ${baseUrl}`);

  const adminCookie = await loginAs(adminEmail, adminPassword);
  await checkRoute(adminCookie, "admin /admin", "/admin", 200);
  await checkRoute(adminCookie, "admin /admin/export", "/admin/export", 200);
  await checkRoute(
    adminCookie,
    "admin /admin/newsletter/export",
    "/admin/newsletter/export",
    200,
  );

  const editorCookie = await loginAs(editorEmail, editorPassword);
  await checkRoute(editorCookie, "editor /admin", "/admin", 200);
  await checkRoute(editorCookie, "editor /admin/export", "/admin/export", [302, 307]);
  await checkRoute(
    editorCookie,
    "editor /admin/newsletter/export",
    "/admin/newsletter/export",
    [302, 307],
  );

  console.log("Auth smoke checks passed.");
}

await main();
