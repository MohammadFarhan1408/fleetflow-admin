import type { Vehicle } from "../api";
import { describeReasons } from "../availability";

/** Whether the vehicle can be assigned today, and why not. Words, not colour: status already carries the colour. */
export const VehicleAvailability = ({ vehicle }: { vehicle: Vehicle }) => {
  const { available, reasons } = vehicle.availability;
  if (available) return "Available";
  return (
    <span className="text-text-secondary">Unavailable{reasons.length > 0 && `: ${describeReasons(reasons)}`}</span>
  );
};
