"use client";

import { ArchivedToggle } from "@/components/shared/ArchivedToggle";
import { AVAILABILITY_OPTIONS, AVAILABILITY_PARAM } from "@/components/shared/availability-filter";
import { FilterBar } from "@/components/shared/FilterBar";
import { SearchInput } from "@/components/shared/SearchInput";
import { SegmentedFilter } from "@/components/shared/SegmentedFilter";
import { BranchFilter } from "@/features/branches/components/BranchFilter";
import { DRIVER_STATUSES, DRIVER_STATUS_LABELS } from "../labels";
import { DRIVER_FILTER_PARAMS, STATUS_PARAM } from "../params";
import { AvailabilityDateInput } from "./AvailabilityDateInput";

const STATUS_OPTIONS = DRIVER_STATUSES.map((value) => ({ value, label: DRIVER_STATUS_LABELS[value] }));

/** Search, branch, status, availability on a day, and "Show archived" above the drivers table, all in the URL. */
export const DriversFilters = ({ date }: { date: string | null }) => (
  <FilterBar
    filterParams={DRIVER_FILTER_PARAMS}
    search={<SearchInput label="Search drivers" placeholder="Search by name or email" />}
  >
    <BranchFilter />
    <SegmentedFilter label="Status" param={STATUS_PARAM} options={STATUS_OPTIONS} />
    <div className="flex flex-wrap items-center gap-2">
      <SegmentedFilter label="Availability" param={AVAILABILITY_PARAM} options={AVAILABILITY_OPTIONS} />
      <span aria-hidden className="text-caption text-text-secondary">
        on
      </span>
      <AvailabilityDateInput value={date ?? ""} />
    </div>
    <ArchivedToggle />
  </FilterBar>
);
