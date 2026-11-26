import { ARCHIVED_PARAM, readIncludeArchived } from "@/components/shared/ArchivedToggle";
import { AVAILABILITY_PARAM, readAvailabilityFilter } from "@/components/shared/availability-filter";
import { readPagination } from "@/components/shared/CursorPagination";
import { readSearch, SEARCH_PARAM } from "@/components/shared/SearchInput";
import { readOneOf } from "@/lib/url-params";
import type { VehicleListFilters } from "./api";
import { LICENSE_CATEGORIES, VEHICLE_STATUSES } from "./labels";

export const STATUS_PARAM = "status";
export const LICENSE_PARAM = "license";

/** The list's filters from the URL. A value the API does not know (an edited link) counts as no filter. */
export const readVehicleFilters = (searchParams: URLSearchParams): VehicleListFilters => {
  return {
    ...readPagination(searchParams),
    search: readSearch(searchParams),
    status: readOneOf(VEHICLE_STATUSES, searchParams.get(STATUS_PARAM)),
    licenseCategory: readOneOf(LICENSE_CATEGORIES, searchParams.get(LICENSE_PARAM)),
    available: readAvailabilityFilter(searchParams),
    includeArchived: readIncludeArchived(searchParams),
  };
};

/** Every URL parameter the vehicles filters write. */
export const VEHICLE_FILTER_PARAMS = [SEARCH_PARAM, STATUS_PARAM, LICENSE_PARAM, AVAILABILITY_PARAM, ARCHIVED_PARAM];
