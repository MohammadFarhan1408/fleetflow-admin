import { ARCHIVED_PARAM, readIncludeArchived } from "@/components/shared/ArchivedToggle";
import {
  AVAILABILITY_PARAM,
  DATE_PARAM,
  readAvailabilityFilter,
  readDate,
} from "@/components/shared/availability-filter";
import { readPagination } from "@/components/shared/CursorPagination";
import { readSearch, SEARCH_PARAM } from "@/components/shared/SearchInput";
import { BRANCH_PARAM, readBranch } from "@/features/branches/params";
import { readOneOf } from "@/lib/url-params";
import type { DriverListFilters } from "./api";
import { DRIVER_STATUSES } from "./labels";

export const STATUS_PARAM = "status";

/** The list's filters from the URL. A value the API does not know counts as no filter. */
export const readDriverFilters = (searchParams: URLSearchParams): DriverListFilters => ({
  ...readPagination(searchParams),
  search: readSearch(searchParams),
  branch: readBranch(searchParams),
  status: readOneOf(DRIVER_STATUSES, searchParams.get(STATUS_PARAM)),
  available: readAvailabilityFilter(searchParams),
  date: readDate(searchParams),
  includeArchived: readIncludeArchived(searchParams),
});

/** Every URL parameter the drivers filters write. */
export const DRIVER_FILTER_PARAMS = [
  SEARCH_PARAM,
  BRANCH_PARAM,
  STATUS_PARAM,
  AVAILABILITY_PARAM,
  DATE_PARAM,
  ARCHIVED_PARAM,
];
