"use client";

import { useRef, useState } from "react";

import { AdminAssetPicker } from "@/components/admin-asset-picker";
import { MarkdownRenderer } from "@/components/markdown-renderer";
import type { AdminMediaAssetPage } from "@/lib/media-assets";

type TiptapMarkdownEditorProps = {
  name: string;
  initialMarkdown: string;
  availableAssetPage: AdminMediaAssetPage;
};

type WrapSyntaxOptions = {
  prefix: string;
  suffix?: string;
  placeholder?: string;
};

type LineSyntaxOptions = {
  prefix: string;
  placeholder?: string;
};

const toolbarButtons = [
  {
    label: "텍스트",
    action: "paragraph" as const,
  },
  {
    label: "## 제목",
    action: "heading" as const,
  },
  {
    label: "**굵게**",
    action: "bold" as const,
  },
  {
    label: "_기울임_",
    action: "italic" as const,
  },
  {
    label: "[링크]",
    action: "link" as const,
  },
  {
    label: "- 목록",
    action: "bullet" as const,
  },
  {
    label: "1. 목록",
    action: "ordered" as const,
  },
  {
    label: "> 인용",
    action: "quote" as const,
  },
  {
    label: "``` 코드 ```",
    action: "codeblock" as const,
  },
  {
    label: "---",
    action: "divider" as const,
  },
  {
    label: "| 표 |",
    action: "table" as const,
  },
] as const;

export function TiptapMarkdownEditor({
  name,
  initialMarkdown,
  availableAssetPage,
}: TiptapMarkdownEditorProps) {
  const [markdown, setMarkdown] = useState(initialMarkdown);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState("");
  const textareaRef = useRef<HTMLTextAreaElement | null>(null);

  function focusTextarea(selectionStart?: number, selectionEnd?: number) {
    const textarea = textareaRef.current;

    if (!textarea) {
      return;
    }

    textarea.focus();

    if (
      typeof selectionStart === "number" &&
      typeof selectionEnd === "number"
    ) {
      textarea.setSelectionRange(selectionStart, selectionEnd);
    }
  }

  function updateMarkdown(nextValue: string) {
    setMarkdown(nextValue);
  }

  function applyWrappedSyntax(options: WrapSyntaxOptions) {
    const textarea = textareaRef.current;

    if (!textarea) {
      return;
    }

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const selected = markdown.slice(start, end);
    const content = selected || options.placeholder || "";
    const suffix = options.suffix ?? options.prefix;
    const nextValue =
      markdown.slice(0, start) +
      options.prefix +
      content +
      suffix +
      markdown.slice(end);
    const selectionStart = start + options.prefix.length;
    const selectionEnd = selectionStart + content.length;

    updateMarkdown(nextValue);
    requestAnimationFrame(() => focusTextarea(selectionStart, selectionEnd));
  }

  function applyLinePrefix(options: LineSyntaxOptions) {
    const textarea = textareaRef.current;

    if (!textarea) {
      return;
    }

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const lineStart = markdown.lastIndexOf("\n", start - 1) + 1;
    const lineEndIndex = markdown.indexOf("\n", end);
    const lineEnd = lineEndIndex === -1 ? markdown.length : lineEndIndex;
    const selectedBlock = markdown.slice(lineStart, lineEnd);
    const lines = selectedBlock.split("\n");
    const nextBlock = lines
      .map((line, index) => {
        if (!line.trim()) {
          return options.prefix + (options.placeholder ?? "");
        }

        if (options.prefix === "1. ") {
          return `${index + 1}. ${line.replace(/^\d+\.\s*/, "")}`;
        }

        return line.startsWith(options.prefix)
          ? line
          : `${options.prefix}${line}`;
      })
      .join("\n");
    const nextValue =
      markdown.slice(0, lineStart) + nextBlock + markdown.slice(lineEnd);

    updateMarkdown(nextValue);
    requestAnimationFrame(() =>
      focusTextarea(lineStart, lineStart + nextBlock.length),
    );
  }

  function insertSnippet(snippet: string, selectOffset = 0) {
    const textarea = textareaRef.current;

    if (!textarea) {
      return;
    }

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const nextValue = markdown.slice(0, start) + snippet + markdown.slice(end);
    const cursor = start + snippet.length - selectOffset;

    updateMarkdown(nextValue);
    requestAnimationFrame(() => focusTextarea(cursor, cursor));
  }

  function handleToolbarAction(action: (typeof toolbarButtons)[number]["action"]) {
    switch (action) {
      case "paragraph":
        return applyLinePrefix({ prefix: "", placeholder: "" });
      case "heading":
        return applyLinePrefix({ prefix: "## ", placeholder: "제목" });
      case "bold":
        return applyWrappedSyntax({ prefix: "**", placeholder: "강조" });
      case "italic":
        return applyWrappedSyntax({ prefix: "_", placeholder: "기울임" });
      case "link": {
        const textarea = textareaRef.current;

        if (!textarea) {
          return;
        }

        const selected = markdown.slice(
          textarea.selectionStart,
          textarea.selectionEnd,
        );
        const label = selected || "링크 텍스트";
        const url = window.prompt("링크 URL을 입력하세요", "https://");

        if (!url) {
          return;
        }

        return applyWrappedSyntax({
          prefix: "[",
          suffix: `](${url.trim()})`,
          placeholder: label,
        });
      }
      case "bullet":
        return applyLinePrefix({ prefix: "- ", placeholder: "목록 항목" });
      case "ordered":
        return applyLinePrefix({ prefix: "1. ", placeholder: "순서 항목" });
      case "quote":
        return applyLinePrefix({ prefix: "> ", placeholder: "인용문" });
      case "codeblock":
        return applyWrappedSyntax({
          prefix: "```md\n",
          suffix: "\n```",
          placeholder: "코드를 입력하세요",
        });
      case "divider":
        return insertSnippet("\n---\n");
      case "table":
        return insertSnippet(
          "\n| 컬럼 1 | 컬럼 2 | 컬럼 3 |\n| --- | --- | --- |\n| 값 1 | 값 2 | 값 3 |\n",
        );
    }
  }

  async function handleImageUpload(file: File) {
    setIsUploading(true);
    setUploadError("");

    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("altText", file.name.replace(/\.[^.]+$/, ""));

      const response = await fetch("/api/admin/uploads/image", {
        method: "POST",
        body: formData,
      });

      const result = (await response.json()) as {
        url?: string;
        altText?: string;
        error?: string;
      };

      if (!response.ok || !result.url) {
        throw new Error(result.error ?? "이미지 업로드에 실패했습니다.");
      }

      insertSnippet(`\n![${result.altText ?? ""}](${result.url})\n`);
    } catch (error) {
      setUploadError(
        error instanceof Error ? error.message : "이미지 업로드에 실패했습니다.",
      );
    } finally {
      setIsUploading(false);
    }
  }

  return (
    <div className="mt-5">
      <div className="mb-3 flex flex-wrap gap-2">
        {toolbarButtons.map((button) => (
          <button
            key={button.label}
            type="button"
            onClick={() => handleToolbarAction(button.action)}
            className="rounded-full border border-stone-300/70 bg-white px-3 py-1.5 text-xs text-stone-700 transition hover:border-stone-400 hover:bg-stone-100 dark:border-white/10 dark:bg-white/5 dark:text-stone-200 dark:hover:border-white/25 dark:hover:bg-white/8"
          >
            {button.label}
          </button>
        ))}
        <label className="rounded-full border border-stone-300/70 bg-white px-3 py-1.5 text-xs text-stone-700 transition hover:border-stone-400 hover:bg-stone-100 dark:border-white/10 dark:bg-white/5 dark:text-stone-200 dark:hover:border-white/25 dark:hover:bg-white/8">
          {isUploading ? "![이미지] 업로드 중..." : "![이미지]"}
          <input
            type="file"
            accept="image/png,image/jpeg,image/webp,image/gif"
            hidden
            disabled={isUploading}
            onChange={async (event) => {
              const file = event.target.files?.[0];

              if (!file) {
                return;
              }

              await handleImageUpload(file);
              event.target.value = "";
            }}
          />
        </label>
      </div>
      <div className="space-y-6">
        <div>
          <textarea
            ref={textareaRef}
            name={name}
            value={markdown}
            onChange={(event) => updateMarkdown(event.target.value)}
            spellCheck={false}
            className="min-h-[420px] w-full rounded-[1.5rem] border border-stone-300/70 bg-stone-100 px-4 py-4 font-mono text-sm leading-7 text-stone-900 outline-none transition focus:border-amber-300 dark:border-white/10 dark:bg-black/30 dark:text-stone-100"
          />
          {uploadError ? (
            <p className="mt-3 text-xs text-red-600 dark:text-red-300">{uploadError}</p>
          ) : null}
          <AdminAssetPicker
            initialAssets={availableAssetPage.items}
            initialPage={availableAssetPage.currentPage}
            initialTotalPages={availableAssetPage.totalPages}
            title="기존 자산 다시 삽입"
            description="최근 업로드된 자산을 선택하면 현재 커서 위치에 Markdown 이미지 문법으로 바로 들어갑니다."
            emptyCopy="삽입할 수 있는 기존 자산이 없습니다."
            selectLabel="본문에 삽입"
            kind="uploaded"
            onSelect={(asset) => {
              const altText = asset.altText || "image";
              insertSnippet(`\n![${altText}](${asset.publicUrl})\n`);
              setUploadError("");
            }}
          />
        </div>
        <section className="rounded-[1.5rem] border border-stone-300/70 bg-white p-5 shadow-sm dark:border-white/10 dark:bg-white/5 dark:shadow-none">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <p className="text-xs uppercase tracking-[0.25em] text-stone-400">
                Preview
              </p>
              <h4 className="mt-2 font-serif text-2xl text-stone-950 dark:text-white">
                게시 전 미리보기
              </h4>
            </div>
            <span className="rounded-full border border-emerald-400/35 bg-emerald-500/8 px-3 py-1 text-[11px] uppercase tracking-[0.2em] text-emerald-700 dark:border-emerald-300/20 dark:bg-emerald-400/10 dark:text-emerald-100">
              Live
            </span>
          </div>
          <p className="mt-3 text-sm leading-7 text-stone-600 dark:text-stone-400">
            왼쪽에서는 Markdown 문법 자체를 편집하고, 아래에서는 공개 화면과
            같은 렌더 결과를 바로 확인합니다.
          </p>
          <div className="mt-5 min-h-[420px] rounded-[1.5rem] bg-stone-50 px-5 py-6">
            {markdown.trim() ? (
              <MarkdownRenderer markdown={markdown} />
            ) : (
              <div className="flex min-h-[360px] items-center justify-center rounded-[1.25rem] border border-dashed border-stone-300 bg-white px-6 text-center text-sm leading-7 text-stone-500">
                본문을 입력하면 이곳에 공개 화면 기준 미리보기가 표시됩니다.
              </div>
            )}
          </div>
        </section>
      </div>
    </div>
  );
}
