"use client";

import { createPreference } from "./preferences";

// design.md §2 Themes: System / Light / Dark, remembered per browser.
export const THEMES = ["system", "light", "dark"] as const;
export type Theme = (typeof THEMES)[number];

const STORAGE_KEY = "ff-theme";

const themePreference = createPreference<Theme>(STORAGE_KEY, "system", (value): value is Theme =>
  (THEMES as readonly string[]).includes(value),
);

/** The saved theme and a setter that stores it and applies it to <html>. */
export const useThemePreference = () => {
  const [theme, saveTheme] = themePreference.usePreference();
  const setTheme = (next: Theme) => {
    if (next === "system") document.documentElement.removeAttribute("data-theme");
    else document.documentElement.setAttribute("data-theme", next);
    saveTheme(next);
  };
  return [theme, setTheme] as const;
};

/** Runs before first paint (root layout) so a saved dark theme never flashes light. Mirrors the reader above. */
export const THEME_INIT_SCRIPT = `try{var t=localStorage.getItem(${JSON.stringify(STORAGE_KEY)});if(t==="light"||t==="dark")document.documentElement.setAttribute("data-theme",t)}catch(e){}`;
