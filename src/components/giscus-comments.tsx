"use client";

import { useEffect, useState } from "react";

import Giscus from "@giscus/react";

type GiscusCommentsProps = {
  term: string;
};

const giscusConfig = {
  repo: process.env.NEXT_PUBLIC_GISCUS_REPO,
  repoId: process.env.NEXT_PUBLIC_GISCUS_REPO_ID,
  category: process.env.NEXT_PUBLIC_GISCUS_CATEGORY,
  categoryId: process.env.NEXT_PUBLIC_GISCUS_CATEGORY_ID,
};

function readResolvedTheme() {
  if (typeof document === "undefined") {
    return "light";
  }

  return document.documentElement.dataset.theme === "dark" ? "dark" : "light";
}

export function GiscusComments({ term }: GiscusCommentsProps) {
  const [resolvedTheme, setResolvedTheme] = useState<"light" | "dark">(() =>
    readResolvedTheme(),
  );

  useEffect(() => {
    const observer = new MutationObserver(() => {
      setResolvedTheme(readResolvedTheme());
    });

    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ["data-theme"],
    });

    return () => observer.disconnect();
  }, []);

  if (
    !giscusConfig.repo ||
    !giscusConfig.repoId ||
    !giscusConfig.category ||
    !giscusConfig.categoryId
  ) {
    return null;
  }

  return (
    <section className="public-panel mt-10 rounded-[1.75rem] border border-black/10 bg-white p-6 shadow-[0_20px_60px_-35px_rgba(0,0,0,0.25)]">
      <p className="font-mono text-xs uppercase tracking-[0.3em] text-stone-500">
        Discussion
      </p>
      <h2 className="mt-4 font-serif text-3xl text-stone-950">댓글</h2>
      <p className="mt-3 text-sm leading-7 text-stone-600">
        GitHub Discussions 기반으로 댓글을 남길 수 있습니다.
      </p>
      <div className="mt-6">
        <Giscus
          key={`giscus-${resolvedTheme}`}
          repo={giscusConfig.repo as `${string}/${string}`}
          repoId={giscusConfig.repoId}
          category={giscusConfig.category}
          categoryId={giscusConfig.categoryId}
          mapping="specific"
          term={term}
          reactionsEnabled="1"
          emitMetadata="0"
          inputPosition="top"
          theme={resolvedTheme === "dark" ? "dark_dimmed" : "light"}
          lang="ko"
          loading="lazy"
        />
      </div>
    </section>
  );
}
