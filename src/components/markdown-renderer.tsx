"use client";

import type { ReactNode } from "react";
import { useState } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

type MarkdownRendererProps = {
  markdown: string;
};

type CodeBlockHeaderProps = {
  code: string;
  language: string;
};

function CodeBlockHeader({ code, language }: CodeBlockHeaderProps) {
  const [copied, setCopied] = useState(false);

  async function handleCopy() {
    try {
      await navigator.clipboard.writeText(code);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1600);
    } catch {
      setCopied(false);
    }
  }

  return (
    <div className="flex items-center justify-between border-b border-white/10 bg-stone-900/90 px-4 py-3">
      <span className="font-mono text-[10px] uppercase tracking-[0.18em] text-stone-400 md:text-[11px] md:tracking-[0.24em]">
        {language || "code"}
      </span>
      <button
        type="button"
        onClick={() => void handleCopy()}
        className="rounded-full border border-white/10 px-3 py-1 text-[10px] uppercase tracking-[0.14em] text-stone-400 transition hover:border-white/20 hover:text-white md:text-[11px] md:tracking-[0.18em]"
      >
        {copied ? "복사됨" : "복사"}
      </button>
    </div>
  );
}

export function MarkdownRenderer({ markdown }: MarkdownRendererProps) {
  const headingIdCounts = new Map<string, number>();

  function flattenText(children: ReactNode): string {
    if (typeof children === "string" || typeof children === "number") {
      return String(children);
    }

    if (Array.isArray(children)) {
      return children.map(flattenText).join("");
    }

    if (children && typeof children === "object" && "props" in children) {
      return flattenText((children as { props?: { children?: ReactNode } }).props?.children);
    }

    return "";
  }

  function slugifyHeading(text: string) {
    return text
      .trim()
      .toLowerCase()
      .replace(/[`*_#[\]()]/g, "")
      .replace(/[^\p{L}\p{N}\s-]/gu, "")
      .replace(/\s+/g, "-");
  }

  function getHeadingId(children: ReactNode, level: number) {
    const text = flattenText(children);
    const baseId = slugifyHeading(text) || `section-${level}`;
    const duplicateCount = headingIdCounts.get(baseId) ?? 0;
    headingIdCounts.set(baseId, duplicateCount + 1);
    return duplicateCount === 0 ? baseId : `${baseId}-${duplicateCount + 1}`;
  }

  function getCodeLanguage(className?: string) {
    const match = /language-([\w-]+)/.exec(className ?? "");
    return match?.[1] ?? "";
  }

  return (
    <div className="markdown-body text-stone-800">
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        components={{
          h1: ({ children }) => (
            <h1
              id={getHeadingId(children, 1)}
              className="mt-8 scroll-mt-24 font-serif text-[2.15rem] leading-tight text-stone-950 first:mt-0 md:mt-10 md:text-4xl"
            >
              {children}
            </h1>
          ),
          h2: ({ children }) => (
            <h2
              id={getHeadingId(children, 2)}
              className="mt-8 scroll-mt-24 font-serif text-[1.85rem] leading-tight text-stone-950 first:mt-0 md:mt-10 md:text-3xl"
            >
              {children}
            </h2>
          ),
          h3: ({ children }) => (
            <h3
              id={getHeadingId(children, 3)}
              className="mt-6 scroll-mt-24 font-serif text-[1.5rem] leading-tight text-stone-950 md:mt-8 md:text-2xl"
            >
              {children}
            </h3>
          ),
          p: ({ children }) => (
            <p className="mt-4 text-[15px] leading-7 text-stone-700 first:mt-0 md:mt-5 md:text-base md:leading-8">
              {children}
            </p>
          ),
          ul: ({ children }) => (
            <ul className="mt-4 list-disc space-y-2 pl-5 text-[15px] leading-7 text-stone-700 md:mt-5 md:pl-6 md:text-base md:leading-8">
              {children}
            </ul>
          ),
          ol: ({ children }) => (
            <ol className="mt-4 list-decimal space-y-2 pl-5 text-[15px] leading-7 text-stone-700 md:mt-5 md:pl-6 md:text-base md:leading-8">
              {children}
            </ol>
          ),
          li: ({ children }) => <li>{children}</li>,
          blockquote: ({ children }) => (
            <blockquote className="mt-5 rounded-r-2xl border-l-4 border-amber-400 bg-amber-50 px-4 py-3.5 text-[15px] leading-7 text-stone-700 md:mt-6 md:px-5 md:py-4 md:text-base md:leading-8">
              {children}
            </blockquote>
          ),
          a: ({ href, children }) => (
            <a
              href={href}
              className="font-medium text-sky-700 underline decoration-sky-300 underline-offset-4 hover:text-sky-900"
              target={href?.startsWith("http") ? "_blank" : undefined}
              rel={href?.startsWith("http") ? "noreferrer noopener" : undefined}
            >
              {children}
            </a>
          ),
          hr: () => <hr className="my-8 border-stone-200 md:my-10" />,
          code: ({ className, children }) => {
            const isBlock = Boolean(className);

            if (isBlock) {
              return (
                <code className="block overflow-x-auto p-4 font-mono text-[13px] leading-6 text-stone-100 md:p-5 md:text-sm md:leading-7">
                  {children}
                </code>
              );
            }

            return (
              <code className="rounded-md bg-stone-200 px-1.5 py-0.5 font-mono text-[13px] text-stone-900 md:text-sm">
                {children}
              </code>
            );
          },
          pre: ({ children }) => {
            const codeChild =
              children && typeof children === "object" && "props" in children
                ? (children as { props?: { className?: string } }).props
                : undefined;
            const language = getCodeLanguage(codeChild?.className);
            const codeText = flattenText(children);

            return (
              <div className="mt-5 overflow-hidden rounded-[1.25rem] border border-stone-800 bg-stone-950 shadow-[0_24px_60px_-40px_rgba(0,0,0,0.55)] md:mt-6 md:rounded-[1.5rem]">
                <CodeBlockHeader code={codeText} language={language} />
                <pre className="overflow-x-auto">{children}</pre>
              </div>
            );
          },
          table: ({ children }) => (
            <div className="mt-5 overflow-hidden rounded-[1.25rem] border border-stone-200 bg-white shadow-[0_20px_40px_-30px_rgba(0,0,0,0.22)] md:mt-6 md:rounded-[1.5rem]">
              <table className="min-w-full border-collapse text-sm">
                {children}
              </table>
            </div>
          ),
          thead: ({ children }) => <thead className="bg-stone-100">{children}</thead>,
          th: ({ children }) => (
            <th className="border border-stone-200 px-4 py-3 text-left font-medium text-stone-900">
              {children}
            </th>
          ),
          td: ({ children }) => (
            <td className="border border-stone-200 px-4 py-3 text-stone-700">
              {children}
            </td>
          ),
          tbody: ({ children }) => (
            <tbody className="[&_tr:nth-child(even)]:bg-stone-50">{children}</tbody>
          ),
          img: ({ src, alt }) => (
            <figure className="mt-6 overflow-hidden rounded-[1.5rem] border border-stone-200 bg-white shadow-[0_20px_50px_-35px_rgba(0,0,0,0.35)] md:mt-8 md:rounded-[1.75rem]">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={src ?? ""}
                alt={alt ?? ""}
                className="w-full bg-stone-50 object-cover"
              />
              {alt ? (
                <figcaption className="border-t border-stone-200 px-4 py-3 text-sm leading-6 text-stone-500 md:px-5 md:leading-7">
                  {alt}
                </figcaption>
              ) : null}
            </figure>
          ),
        }}
      >
        {markdown}
      </ReactMarkdown>
    </div>
  );
}
