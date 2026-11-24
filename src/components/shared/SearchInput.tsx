"use client";

import { useEffect, useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { SearchIcon, XIcon } from "lucide-react";

import { Input } from "@/components/ui/Input";
import { PAGINATION_PARAMS } from "./CursorPagination";
import { hrefWithParams } from "@/lib/url-params";

// architecture §14: debounced 300 ms, at least 2 characters, the term lives in the URL.
export const SEARCH_PARAM = "search";
export const SEARCH_MIN_LENGTH = 2;
export const SEARCH_DEBOUNCE_MS = 300;

/** The applied search term from the URL. */
export const readSearch = (searchParams: URLSearchParams) => searchParams.get(SEARCH_PARAM) ?? "";

/** design.md §6 Search: leading icon, clear button. Applying a term returns the list to its first page. */
export const SearchInput = ({ label, placeholder }: { label: string; placeholder?: string }) => {
  const pathname = usePathname();
  const router = useRouter();
  const searchParams = useSearchParams();
  const applied = readSearch(searchParams);
  const [value, setValue] = useState(applied);
  const [seenApplied, setSeenApplied] = useState(applied);

  // Back/forward changes the URL term: show it. Typing already matches `applied` by the time it lands.
  if (seenApplied !== applied) {
    setSeenApplied(applied);
    setValue(applied);
  }

  const term = value.trim();
  const next = term.length >= SEARCH_MIN_LENGTH ? term : "";

  useEffect(() => {
    if (next === applied) return;
    const timer = setTimeout(
      () =>
        router.replace(
          hrefWithParams(pathname, new URLSearchParams(searchParams), {
            [SEARCH_PARAM]: next || null,
            [PAGINATION_PARAMS.cursor]: null,
          }),
          { scroll: false },
        ),
      SEARCH_DEBOUNCE_MS,
    );
    return () => clearTimeout(timer);
  }, [next, applied, pathname, router, searchParams]);

  return (
    <div role="search" className="relative w-full max-w-80">
      <SearchIcon aria-hidden className="pointer-events-none absolute top-2 left-2 size-4 text-muted" />
      <Input
        type="text"
        role="searchbox"
        aria-label={label}
        placeholder={placeholder}
        value={value}
        onChange={(event) => setValue(event.target.value)}
        className="pr-8 pl-8"
      />
      {value && (
        <button
          type="button"
          aria-label="Clear search"
          onClick={() => setValue("")}
          className="absolute top-1 right-1 grid size-6 place-items-center rounded-sm text-muted hover:text-text"
        >
          <XIcon aria-hidden className="size-4" />
        </button>
      )}
    </div>
  );
};
