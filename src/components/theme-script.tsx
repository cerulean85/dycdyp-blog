export function ThemeScript() {
  const script = `
    (() => {
      const storageKey = "dycdyp-theme";
      const root = document.documentElement;
      const media = window.matchMedia("(prefers-color-scheme: dark)");
      const stored = localStorage.getItem(storageKey);
      const mode = stored === "light" || stored === "dark" || stored === "system"
        ? stored
        : "system";
      const resolved = mode === "system"
        ? (media.matches ? "dark" : "light")
        : mode;

      root.dataset.themeMode = mode;
      root.dataset.theme = resolved;
      root.style.colorScheme = resolved;
    })();
  `;

  return <script dangerouslySetInnerHTML={{ __html: script }} />;
}
