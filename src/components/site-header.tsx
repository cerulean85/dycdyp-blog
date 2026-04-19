import Link from "next/link";

import { BrandLogo } from "@/components/brand-logo";
import { ThemeToggle } from "@/components/theme-toggle";

const navigation = [
  { href: "/category", label: "카테고리" },
  { href: "/search", label: "검색" },
  { href: "/archive", label: "아카이브" },
  { href: "/tags", label: "태그" },
  { href: "/about", label: "소개" },
];

export function SiteHeader() {
  return (
    <header className="border-b border-black/10 bg-white/80 backdrop-blur-sm">
      <div className="mx-auto w-full max-w-6xl px-6 py-4">
        <div className="flex items-center justify-between">
          <BrandLogo compact showTagline={false} mode="adaptive" />
          <div className="hidden items-center gap-4 md:flex">
            <nav className="flex gap-5 text-sm text-stone-700">
              {navigation.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className="hover:text-stone-950"
                >
                  {item.label}
                </Link>
              ))}
            </nav>
            <ThemeToggle />
          </div>
        </div>
        <div className="mt-4 space-y-3 md:hidden">
          <nav className="-mx-1 flex gap-2 overflow-x-auto px-1 pb-1 text-sm text-stone-700">
            {navigation.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="shrink-0 rounded-full border border-black/10 bg-white px-4 py-2 transition hover:border-stone-950 hover:text-stone-950"
              >
                {item.label}
              </Link>
            ))}
          </nav>
          <ThemeToggle />
        </div>
      </div>
    </header>
  );
}
