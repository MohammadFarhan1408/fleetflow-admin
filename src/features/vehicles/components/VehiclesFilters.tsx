"use client";

import { ArchivedToggle } from "@/components/shared/ArchivedToggle";
import { FilterSelect } from "@/components/shared/FilterSelect";
import { SearchInput } from "@/components/shared/SearchInput";
import { LICENSE_CATEGORIES, VEHICLE_STATUSES, VEHICLE_STATUS_LABELS } from "../labels";
import { AVAILABILITY_PARAM, AVAILABILITY_VALUES, LICENSE_PARAM, STATUS_PARAM } from "../params";

const STATUS_OPTIONS = VEHICLE_STATUSES.map((value) => ({ value, label: VEHICLE_STATUS_LABELS[value] }));
const LICENSE_OPTIONS = LICENSE_CATEGORIES.map((value) => ({ value, label: value }));
const AVAILABILITY_OPTIONS = [
  { value: AVAILABILITY_VALUES.available, label: "Available" },
  { value: AVAILABILITY_VALUES.unavailable, label: "Unavailable" },
];

/** Search, status, licence, availability and "Show archived" above the vehicles table, all in the URL. */
export const VehiclesFilters = () => (
  <div className="flex flex-wrap items-center gap-3">
    <SearchInput label="Search vehicles" placeholder="Search by registration" />
    <FilterSelect label="Filter by status" param={STATUS_PARAM} options={STATUS_OPTIONS} anyLabel="All statuses" />
    <FilterSelect
      label="Filter by licence category"
      param={LICENSE_PARAM}
      options={LICENSE_OPTIONS}
      anyLabel="All licence categories"
    />
    <FilterSelect
      label="Filter by availability"
      param={AVAILABILITY_PARAM}
      options={AVAILABILITY_OPTIONS}
      anyLabel="Any availability"
    />
    <div className="ml-auto">
      <ArchivedToggle />
    </div>
  </div>
);
