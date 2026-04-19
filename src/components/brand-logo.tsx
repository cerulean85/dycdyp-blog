import Link from "next/link";

type BrandLogoProps = {
  href?: string;
  mode?: "light" | "dark" | "adaptive";
  compact?: boolean;
  showTagline?: boolean;
  className?: string;
};

function BrandMark({ mode = "light" }: { mode?: "light" | "dark" | "adaptive" }) {
  const isAdaptive = mode === "adaptive";
  const stroke = mode === "dark" ? "#f5f5f4" : "#1c1917";
  const accent = mode === "dark" ? "#fbbf24" : "#a16207";
  const fill = mode === "dark" ? "rgba(255,255,255,0.04)" : "rgba(0,0,0,0.04)";

  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 72 72"
      className="h-11 w-11 shrink-0"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <rect
        x="4"
        y="4"
        width="64"
        height="64"
        rx="22"
        fill={isAdaptive ? undefined : fill}
        className={isAdaptive ? "brand-mark-shell" : undefined}
      />
      <path
        d="M18 22H36C44.2843 22 51 28.7157 51 37C51 45.2843 44.2843 52 36 52H18V22Z"
        stroke={isAdaptive ? undefined : stroke}
        strokeWidth="4"
        className={isAdaptive ? "brand-mark-stroke" : undefined}
      />
      <path
        d="M33 22H49.5"
        stroke={isAdaptive ? undefined : accent}
        strokeWidth="4"
        strokeLinecap="round"
        className={isAdaptive ? "brand-mark-accent" : undefined}
      />
      <path
        d="M33 52H49.5"
        stroke={isAdaptive ? undefined : accent}
        strokeWidth="4"
        strokeLinecap="round"
        className={isAdaptive ? "brand-mark-accent" : undefined}
      />
    </svg>
  );
}

function BrandWordmark({
  mode = "light",
  compact = false,
  showTagline = true,
}: Pick<BrandLogoProps, "mode" | "compact" | "showTagline">) {
  const isAdaptive = mode === "adaptive";
  const overlineClass = isAdaptive
    ? "brand-logo-overline"
    : mode === "dark"
      ? "text-stone-400"
      : "text-stone-500";
  const titleClass = isAdaptive
    ? "brand-logo-title"
    : mode === "dark"
      ? "text-stone-50"
      : "text-stone-950";
  const taglineClass = isAdaptive
    ? "brand-logo-tagline"
    : mode === "dark"
      ? "text-stone-400"
      : "text-stone-600";

  return (
    <div className="min-w-0">
      <p className={`font-mono text-[11px] uppercase tracking-[0.35em] ${overlineClass}`}>
        DYCDYP
      </p>
      <p className={`mt-1 font-serif ${compact ? "text-lg" : "text-2xl"} leading-none ${titleClass}`}>
        기술과 자본, 인문학으로 읽는 미래
      </p>
      {showTagline ? (
        <p className={`mt-1 text-xs ${taglineClass}`}>
          AI-assisted editorial publishing system
        </p>
      ) : null}
    </div>
  );
}

export function BrandLogo({
  href = "/",
  mode = "light",
  compact = false,
  showTagline = true,
  className = "",
}: BrandLogoProps) {
  const content = (
    <div className={`flex items-center gap-3 ${className}`}>
      <BrandMark mode={mode} />
      <BrandWordmark
        mode={mode}
        compact={compact}
        showTagline={showTagline}
      />
    </div>
  );

  return href ? (
    <Link href={href} className="min-w-0">
      {content}
    </Link>
  ) : (
    content
  );
}
