"use client";

import { useEffect, useState } from "react";

type ThemeMode = "system" | "light" | "dark";

const STORAGE_KEY = "dycdyp-theme";

function applyTheme(mode: ThemeMode) {
  const root = document.documentElement;
  const resolved =
    mode === "system"
      ? window.matchMedia("(prefers-color-scheme: dark)").matches
        ? "dark"
        : "light"
      : mode;

  root.dataset.themeMode = mode;
  root.dataset.theme = resolved;
  root.style.colorScheme = resolved;
}

export function ThemeToggle() {
  const [themeMode, setThemeMode] = useState<ThemeMode>(() => {
    if (typeof window === "undefined") {
      return "system";
    }

    const stored = localStorage.getItem(STORAGE_KEY);
    return stored === "light" || stored === "dark" || stored === "system"
      ? stored
      : "system";
  });

  useEffect(() => {
    applyTheme(themeMode);
  }, [themeMode]);

  useEffect(() => {
    const media = window.matchMedia("(prefers-color-scheme: dark)");
    const listener = () => {
      const current = (document.documentElement.dataset.themeMode as ThemeMode) ?? "system";

      if (current === "system") {
        applyTheme("system");
      }
    };

    media.addEventListener("change", listener);
    return () => media.removeEventListener("change", listener);
  }, []);

  function handleChange(nextMode: ThemeMode) {
    setThemeMode(nextMode);
    localStorage.setItem(STORAGE_KEY, nextMode);
    applyTheme(nextMode);
  }

  const options: Array<{ value: ThemeMode; label: string }> = [
    { value: "system", label: "시스템" },
    { value: "light", label: "라이트" },
    { value: "dark", label: "다크" },
  ];

  return (
    <div className="theme-toggle-shell flex items-center gap-1 rounded-full border border-black/10 bg-white/70 p-1 backdrop-blur-sm">
      {options.map((option) => {
        const active = themeMode === option.value;

        return (
          <button
            key={option.value}
            type="button"
            onClick={() => handleChange(option.value)}
            className={`theme-toggle-button rounded-full px-3 py-1.5 text-[11px] transition md:text-xs ${
              active
                ? "bg-stone-950 text-white"
                : "text-stone-600 hover:text-stone-950"
            }`}
            aria-pressed={active}
          >
            {option.label}
          </button>
        );
      })}
    </div>
  );
}
