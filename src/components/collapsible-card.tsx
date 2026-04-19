"use client";

import { useState, type ReactNode } from "react";

import { CollapseToggleChip } from "@/components/collapse-toggle-chip";

type CollapsibleCardProps = {
  id?: string;
  title: string;
  eyebrow?: string;
  description?: ReactNode;
  defaultOpen?: boolean;
  tone?: "default" | "warning";
  children: ReactNode;
};

const toneClassName = {
  default: "border-white/10 bg-white/5",
  warning: "border-amber-300/20 bg-amber-400/10",
} as const;

export function CollapsibleCard({
  id,
  title,
  eyebrow,
  description,
  defaultOpen = false,
  tone = "default",
  children,
}: CollapsibleCardProps) {
  const [isOpen, setIsOpen] = useState(defaultOpen);
  const cardId = id ?? title;

  return (
    <section className={`rounded-[2rem] border p-6 ${toneClassName[tone]}`}>
      <button
        type="button"
        onClick={() => setIsOpen((prev) => !prev)}
        aria-expanded={isOpen}
        aria-controls={`${cardId}-panel`}
        className="flex w-full items-start justify-between gap-4 text-left"
      >
        <div>
          {eyebrow ? (
            <p className="font-mono text-xs uppercase tracking-[0.3em] text-stone-400">
              {eyebrow}
            </p>
          ) : null}
          <h3 className={`${eyebrow ? "mt-3" : ""} font-serif text-2xl text-white`}>
            {title}
          </h3>
          {description ? (
            <div className="mt-3 text-sm leading-7 text-stone-400">
              {description}
            </div>
          ) : null}
        </div>
        <CollapseToggleChip isOpen={isOpen} className="mt-1" />
      </button>
      <div
        id={`${cardId}-panel`}
        hidden={!isOpen}
        className="mt-5"
      >
        {children}
      </div>
    </section>
  );
}
