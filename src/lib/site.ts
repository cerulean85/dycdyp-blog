const DEFAULT_SITE_URL = "https://dycdyp.com";

export const siteConfig = {
  name: "DYCDYP",
  description: "기술과 자본, 인문학으로 읽는 미래",
  siteUrl: process.env.NEXT_PUBLIC_SITE_URL || DEFAULT_SITE_URL,
  locale: "ko_KR",
};

export function absoluteUrl(path = "/") {
  return new URL(path, siteConfig.siteUrl).toString();
}
