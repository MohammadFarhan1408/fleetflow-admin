"use client";

import { DatePicker } from "@/components/ui/DatePicker";
import { useFilterParams } from "@/components/shared/use-filter-params";
import { DATE_PARAM } from "@/components/shared/availability-filter";

/** The detail page's "Availability on": the day shown, kept in the URL. Today clears it (the API's own today). */
export const AvailabilityDateInput = ({ value }: { value: string }) => {
  const { setParams } = useFilterParams();
  return (
    <DatePicker
      label="Availability on"
      value={value}
      placeholder="Today"
      resetLabel="Today"
      onChange={(day) => setParams({ [DATE_PARAM]: day || null })}
    />
  );
};
