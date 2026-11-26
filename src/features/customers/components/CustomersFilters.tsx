"use client";

import { ARCHIVED_PARAM, ArchivedToggle } from "@/components/shared/ArchivedToggle";
import { FilterBar } from "@/components/shared/FilterBar";
import { SEARCH_PARAM, SearchInput } from "@/components/shared/SearchInput";

/** Every URL parameter the customers filters write. */
export const CUSTOMER_FILTER_PARAMS = [SEARCH_PARAM, ARCHIVED_PARAM];

/** Search and "Show archived" above the customers table. Both write to the URL and return to page one. */
export const CustomersFilters = () => (
  <FilterBar
    filterParams={CUSTOMER_FILTER_PARAMS}
    search={<SearchInput label="Search customers" placeholder="Search by name" />}
  >
    <ArchivedToggle />
  </FilterBar>
);
