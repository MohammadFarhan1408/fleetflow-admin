import Link from "next/link";

import { AvailabilityText } from "@/components/shared/AvailabilityText";
import type { Column } from "@/components/shared/DataTable";
import { EmptyValue } from "@/components/shared/EmptyValue";
import { vehiclePath } from "@/lib/routes";
import type { Vehicle } from "../api";
import { UNAVAILABLE_REASON_LABELS } from "../labels";
import { formatVolumeM3, formatWeightKg } from "../format";
import { VehicleStatus } from "./VehicleStatus";

export const VEHICLE_COLUMNS: Column<Vehicle>[] = [
  {
    id: "registration",
    header: "Registration",
    cell: (vehicle) => (
      <Link href={vehiclePath(vehicle.public_id)} className="font-mono text-body-strong text-primary hover:underline">
        {vehicle.registration_number}
      </Link>
    ),
  },
  {
    id: "model",
    header: "Make and model",
    cell: (vehicle) => [vehicle.make, vehicle.model].filter(Boolean).join(" ") || <EmptyValue />,
  },
  { id: "branch", header: "Branch", cell: (vehicle) => vehicle.branch.name },
  { id: "license", header: "Licence", cell: (vehicle) => vehicle.required_license_category },
  {
    id: "capacity",
    header: "Capacity",
    align: "end",
    cell: (vehicle) => (
      <span className="tabular-nums">
        {formatWeightKg(vehicle.capacity_weight_kg)} · {formatVolumeM3(vehicle.capacity_volume_m3)}
      </span>
    ),
  },
  { id: "status", header: "Status", cell: (vehicle) => <VehicleStatus vehicle={vehicle} /> },
  {
    id: "availability",
    header: "Availability",
    cell: (vehicle) => <AvailabilityText availability={vehicle.availability} labels={UNAVAILABLE_REASON_LABELS} />,
  },
];
