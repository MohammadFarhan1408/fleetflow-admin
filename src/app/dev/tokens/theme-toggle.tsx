"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";

const themes = ["system", "light", "dark"] as const;
type Theme = (typeof themes)[number];

// ponytail: showcase-only toggle, not persisted. The real per-user preference ships with the Phase 1 header.
export function ThemeToggle() {
  const [theme, setTheme] = useState<Theme>("system");

  useEffect(() => {
    const root = document.documentElement;
    if (theme === "system") root.removeAttribute("data-theme");
    else root.setAttribute("data-theme", theme);
  }, [theme]);

  return (
    <div role="group" aria-label="Theme" className="flex gap-1">
      {themes.map((option) => (
        <Button
          key={option}
          size="sm"
          variant={theme === option ? "primary" : "secondary"}
          aria-pressed={theme === option}
          onClick={() => setTheme(option)}
          className="capitalize"
        >
          {option}
        </Button>
      ))}
    </div>
  );
}
