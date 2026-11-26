"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";

import { PAGINATION_PARAMS } from "@/components/shared/CursorPagination";
import { hrefWithParams } from "@/lib/url-params";

/** Writes list filters to the URL. Every change returns the list to its first page (`null` removes a key). */
export const useFilterParams = () => {
  const pathname = usePathname();
  const router = useRouter();
  const searchParams = useSearchParams();
  return {
    searchParams,
    setParams: (changes: Record<string, string | null>) =>
      router.replace(hrefWithParams(pathname, searchParams, { ...changes, [PAGINATION_PARAMS.cursor]: null }), {
        scroll: false,
      }),
  };
};
