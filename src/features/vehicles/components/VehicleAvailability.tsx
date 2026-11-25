import { EmptyValue } from "@/components/shared/EmptyValue";
import type { Vehicle } from "../api";
import { describeReasons, readAvailability } from "../availability";

/** Whether the vehicle can be assigned today, and why not. Words, not colour: status already carries the colour. */
export const VehicleAvailability = ({ vehicle }: { vehicle: Vehicle }) => {
  const availability = readAvailability(vehicle.availability);
  if (!availability) return <EmptyValue />;
  if (availability.available) return "Available";
  return <span className="text-text-secondary">Unavailable{describeReasonsSuffix(availability.reasons)}</span>;
};

const describeReasonsSuffix = (reasons: string[]) => (reasons.length > 0 ? `: ${describeReasons(reasons)}` : "");
