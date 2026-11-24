"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { ChevronDownIcon, LogOutIcon, MonitorIcon, MoonIcon, SunIcon } from "lucide-react";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/DropdownMenu";
import { logout } from "@/features/auth/api";
import { useSession } from "@/features/session/SessionContext";
import { humanizeCode, initialsOf } from "@/lib/format";
import { ROUTES } from "@/lib/routes";
import { THEMES, useThemePreference, type Theme } from "@/lib/theme";

const THEME_OPTIONS: Record<Theme, { label: string; icon: typeof SunIcon }> = {
  system: { label: "Match system", icon: MonitorIcon },
  light: { label: "Light", icon: SunIcon },
  dark: { label: "Dark", icon: MoonIcon },
};

export const UserMenu = () => {
  const router = useRouter();
  const { user, roles } = useSession();
  const [theme, setTheme] = useThemePreference();
  const [signOutFailed, setSignOutFailed] = useState(false);
  const name = user.full_name || user.email;
  const primaryRole = roles[0] ? humanizeCode(roles[0]) : null;

  const signOut = async () => {
    setSignOutFailed(false);
    try {
      await logout();
      router.replace(ROUTES.login);
      router.refresh();
    } catch (error) {
      console.error("Sign out failed", error);
      setSignOutFailed(true);
    }
  };

  return (
    <DropdownMenu>
      {/* Named by its content, not aria-label, so the name always contains the visible text (WCAG 2.5.3). */}
      <DropdownMenuTrigger className="flex h-10 items-center gap-3 rounded-md pr-2 pl-1 text-left transition-colors hover:bg-hover">
        <span
          aria-hidden
          className="grid size-8 place-items-center rounded-full bg-primary-subtle text-label text-primary"
        >
          {initialsOf(user.full_name, user.email)}
        </span>
        <span className="hidden flex-col md:flex">
          <span className="text-label text-text">{name}</span>
          {primaryRole && <span className="text-caption text-muted">{primaryRole}</span>}
        </span>
        <span className="sr-only md:hidden">{name}</span>
        <span className="sr-only"> account menu</span>
        <ChevronDownIcon aria-hidden className="hidden size-4 text-muted md:block" />
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-64">
        <div className="flex flex-col px-2 py-2">
          <span className="text-body-strong text-text">{name}</span>
          <span className="truncate text-caption text-muted">{user.email}</span>
        </div>
        <DropdownMenuSeparator />
        <DropdownMenuGroup>
          <DropdownMenuLabel>Theme</DropdownMenuLabel>
          <DropdownMenuRadioGroup value={theme} onValueChange={(value) => setTheme(value as Theme)}>
            {THEMES.map((option) => {
              const { label, icon: Icon } = THEME_OPTIONS[option];
              return (
                <DropdownMenuRadioItem key={option} value={option}>
                  <Icon aria-hidden />
                  {label}
                </DropdownMenuRadioItem>
              );
            })}
          </DropdownMenuRadioGroup>
        </DropdownMenuGroup>
        <DropdownMenuSeparator />
        <DropdownMenuItem
          onSelect={(event) => {
            event.preventDefault();
            void signOut();
          }}
        >
          <LogOutIcon aria-hidden />
          Sign out
        </DropdownMenuItem>
        {signOutFailed && (
          <p role="alert" className="px-2 pb-2 text-caption text-error">
            Couldn&apos;t sign out. Check your connection and try again.
          </p>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
};
