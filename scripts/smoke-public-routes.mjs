const baseUrl = process.env.BASE_URL ?? "http://localhost:3000";

const checks = [
  { label: "홈", path: "/", expected: 200 },
  { label: "카테고리 허브", path: "/category", expected: 200 },
  {
    label: "카테고리 검색/정렬",
    path: "/category/investment?q=%ED%99%95%EC%8B%A0&sort=published_desc",
    expected: 200,
  },
  {
    label: "전체 검색",
    path: "/search?q=AI&sort=published_asc",
    expected: 200,
  },
  {
    label: "글 상세",
    path: "/category/investment/economy/macro-liquidity-turn-17",
    expected: 200,
  },
  {
    label: "태그",
    path: "/tags?tag=%EC%9C%A0%EB%8F%99%EC%84%B1",
    expected: 200,
  },
  { label: "아카이브", path: "/archive", expected: 200 },
  { label: "구 blog 리다이렉트", path: "/blog", expected: 307 },
  { label: "관리자 보호", path: "/admin", expected: 307 },
  { label: "robots", path: "/robots.txt", expected: 200 },
  { label: "sitemap", path: "/sitemap.xml", expected: 200 },
];

async function main() {
  console.log(`Smoke checking ${baseUrl}`);

  let failed = false;

  for (const check of checks) {
    const url = `${baseUrl}${check.path}`;

    try {
      const response = await fetch(url, {
        method: "HEAD",
        redirect: "manual",
      });
      const ok = response.status === check.expected;
      const mark = ok ? "OK " : "FAIL";

      console.log(
        `[${mark}] ${check.label}: ${response.status} (expected ${check.expected}) ${check.path}`,
      );

      if (!ok) {
        failed = true;
      }
    } catch (error) {
      failed = true;
      console.log(
        `[FAIL] ${check.label}: request error for ${check.path}\n${String(error)}`,
      );
    }
  }

  if (failed) {
    process.exitCode = 1;
    return;
  }

  console.log("Smoke checks passed.");
}

await main();
