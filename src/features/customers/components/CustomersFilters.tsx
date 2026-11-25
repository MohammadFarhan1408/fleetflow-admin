"use client";

import { ArchivedToggle } from "@/components/shared/ArchivedToggle";
import { SearchInput } from "@/components/shared/SearchInput";

/** Search and "Show archived" above the customers table. Both write to the URL and return to page one. */
export const CustomersFilters = () => (
  <div className="flex flex-wrap items-center justify-between gap-4">
    <SearchInput label="Search customers" placeholder="Search by name" />
    <ArchivedToggle />
  </div>
);
