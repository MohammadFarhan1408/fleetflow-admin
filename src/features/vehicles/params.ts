import { readIncludeArchived } from "@/components/shared/ArchivedToggle";
import { readPagination } from "@/components/shared/CursorPagination";
import { readSearch } from "@/components/shared/SearchInput";
import type { VehicleListFilters } from "./api";
import { LICENSE_CATEGORIES, VEHICLE_STATUSES } from "./labels";

export const STATUS_PARAM = "status";
export const LICENSE_PARAM = "license";
export const AVAILABILITY_PARAM = "availability";

export const AVAILABILITY_VALUES = { available: "available", unavailable: "unavailable" } as const;

const oneOf = <Value extends string>(allowed: readonly Value[], value: string | null) =>
  allowed.find((option) => option === value) ?? null;

/** The list's filters from the URL. A value the API does not know (an edited link) counts as no filter. */
export const readVehicleFilters = (searchParams: URLSearchParams): VehicleListFilters => {
  const availability = oneOf(Object.values(AVAILABILITY_VALUES), searchParams.get(AVAILABILITY_PARAM));
  return {
    ...readPagination(searchParams),
    search: readSearch(searchParams),
    status: oneOf(VEHICLE_STATUSES, searchParams.get(STATUS_PARAM)),
    licenseCategory: oneOf(LICENSE_CATEGORIES, searchParams.get(LICENSE_PARAM)),
    available: availability === null ? null : availability === AVAILABILITY_VALUES.available,
    includeArchived: readIncludeArchived(searchParams),
  };
};
