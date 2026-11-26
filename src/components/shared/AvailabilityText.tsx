import { humanizeCode } from "@/lib/format";

type AvailabilityTextProps = {
  availability: { available: boolean; reasons: readonly string[] };
  /** Display label per reason code the generated enum knows. */
  labels: Readonly<Record<string, string>>;
};

/** "In maintenance, No insurance on file". A reason newer than the generated enum is shown humanized, not dropped. */
export const describeReasons = (reasons: readonly string[], labels: Readonly<Record<string, string>>) =>
  reasons.map((reason) => labels[reason] ?? humanizeCode(reason)).join(", ");

/** Whether a vehicle or driver can be assigned, and why not. Words, not colour: status already carries the colour. */
export const AvailabilityText = ({ availability, labels }: AvailabilityTextProps) => {
  const { available, reasons } = availability;
  if (available) return "Available";
  return (
    <span className="text-text-secondary">
      Unavailable{reasons.length > 0 && `: ${describeReasons(reasons, labels)}`}
    </span>
  );
};
