"use client";

import { ArchivedToggle } from "@/components/shared/ArchivedToggle";
import { AVAILABILITY_OPTIONS, AVAILABILITY_PARAM } from "@/components/shared/availability-filter";
import { FilterBar } from "@/components/shared/FilterBar";
import { SearchInput } from "@/components/shared/SearchInput";
import { SegmentedFilter } from "@/components/shared/SegmentedFilter";
import { SelectFilter } from "@/components/shared/SelectFilter";
import { LICENSE_CATEGORIES, VEHICLE_STATUSES, VEHICLE_STATUS_LABELS } from "../labels";
import { LICENSE_PARAM, STATUS_PARAM, VEHICLE_FILTER_PARAMS } from "../params";

const STATUS_OPTIONS = VEHICLE_STATUSES.map((value) => ({ value, label: VEHICLE_STATUS_LABELS[value] }));
const LICENSE_OPTIONS = LICENSE_CATEGORIES.map((value) => ({ value, label: value }));

/** Search, status, licence, availability and "Show archived" above the vehicles table, all in the URL. */
export const VehiclesFilters = () => (
  <FilterBar
    filterParams={VEHICLE_FILTER_PARAMS}
    search={<SearchInput label="Search vehicles" placeholder="Search by registration" />}
  >
    <SegmentedFilter label="Status" param={STATUS_PARAM} options={STATUS_OPTIONS} />
    <SelectFilter label="Licence" param={LICENSE_PARAM} options={LICENSE_OPTIONS} anyLabel="Any licence category" />
    <SegmentedFilter label="Availability" param={AVAILABILITY_PARAM} options={AVAILABILITY_OPTIONS} />
    <ArchivedToggle />
  </FilterBar>
);
