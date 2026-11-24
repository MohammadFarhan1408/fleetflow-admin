"use client";

import { Button } from "@/components/ui/Button";
import { THEMES, useThemePreference } from "@/lib/theme";

export const ThemeToggle = () => {
  const [theme, setTheme] = useThemePreference();

  return (
    <div role="group" aria-label="Theme" className="flex gap-1">
      {THEMES.map((option) => (
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
};
