"use client";

import { ChevronDownIcon, MapPinIcon } from "lucide-react";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useSession } from "@/features/session/session-context";
import { createPreference } from "@/lib/preferences";

const ALL_BRANCHES = "all";

// The selected branch becomes a list filter from Phase 2; the API still checks membership (architecture §10).
const branchPreference = createPreference<string>(
  "ff-branch",
  ALL_BRANCHES,
  (value): value is string => value.length > 0,
);

const triggerClasses =
  "flex h-9 items-center gap-2 rounded-md border border-border bg-surface px-3 text-label text-text transition-colors";

export const BranchSwitcher = () => {
  const { branches } = useSession();
  const [stored, setStored] = branchPreference.usePreference();

  if (branches.length === 0) return null;

  if (branches.length === 1) {
    return (
      <span className={triggerClasses}>
        <MapPinIcon aria-hidden className="size-4 text-accent" />
        {branches[0]?.name}
      </span>
    );
  }

  // A stored branch the user no longer belongs to falls back to all branches.
  const selected = branches.some((branch) => branch.public_id === stored) ? stored : ALL_BRANCHES;
  const label = branches.find((branch) => branch.public_id === selected)?.name ?? "All branches";

  return (
    <DropdownMenu>
      <DropdownMenuTrigger className={`${triggerClasses} hover:bg-hover`} aria-label={`Branch: ${label}`}>
        <MapPinIcon aria-hidden className="size-4 text-accent" />
        <span className="max-w-40 truncate">{label}</span>
        <ChevronDownIcon aria-hidden className="size-4 text-muted" />
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-60">
        <DropdownMenuLabel>Show data for</DropdownMenuLabel>
        <DropdownMenuRadioGroup value={selected} onValueChange={setStored}>
          <DropdownMenuRadioItem value={ALL_BRANCHES}>All branches</DropdownMenuRadioItem>
          {branches.map((branch) => (
            <DropdownMenuRadioItem key={branch.public_id} value={branch.public_id}>
              {branch.name}
            </DropdownMenuRadioItem>
          ))}
        </DropdownMenuRadioGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};
