import { ArchiveIcon, CircleCheckIcon, TriangleAlertIcon } from "lucide-react";

import { describeReasons } from "@/components/shared/AvailabilityText";
import { Badge } from "@/components/ui/Badge";
import { cn } from "@/lib/cn";
import { formatCalendarDate } from "@/lib/format";

type AvailabilityPanelProps = {
  availability: { date: string; available: boolean; reasons: readonly string[] };
  /** Display label per reason code the generated enum knows. */
  labels: Readonly<Record<string, string>>;
  /** Why the record has its status ("Brake service"), when it has one. */
  statusReason?: string;
  /** What the panel is about, in the user's words: "driver", "vehicle". */
  subject: string;
  /** The control for checking another day. */
  action?: React.ReactNode;
};

/**
 * design.md §6 Availability panel: the answer to "can I assign this today?". Status colour, icon and words (never colour
 * alone), the reasons as chips, and the reason given. An archived record is neutral: it can never be assigned.
 */
export const AvailabilityPanel = ({ availability, labels, statusReason, subject, action }: AvailabilityPanelProps) => {
  const { available, reasons, date } = availability;
  const archived = reasons.includes("archived");
  const tone = available ? "success" : archived ? "neutral" : "warning";
  const Icon = available ? CircleCheckIcon : archived ? ArchiveIcon : TriangleAlertIcon;
  const day = formatCalendarDate(date);

  return (
    <section
      aria-label={`Availability on ${day}`}
      className={cn(
        "flex flex-wrap items-center justify-between gap-x-6 gap-y-4 rounded-lg border border-l-3 bg-surface p-5 shadow-1",
        tone === "success" && "border-l-success",
        tone === "warning" && "border-l-warning",
        tone === "neutral" && "border-l-border-strong",
      )}
    >
      <div className="flex min-w-0 items-start gap-4">
        <span
          aria-hidden
          className={cn(
            "grid size-10 shrink-0 place-items-center rounded-full [&>svg]:size-5",
            tone === "success" && "bg-success-subtle text-success",
            tone === "warning" && "bg-warning-subtle text-warning",
            tone === "neutral" && "bg-neutral-status-subtle text-neutral-status",
          )}
        >
          <Icon />
        </span>
        <div className="flex min-w-0 flex-col gap-2">
          <div className="flex flex-col">
            <p className="text-h2 text-text">{available ? "Available" : "Unavailable"}</p>
            <p className="text-caption text-text-secondary">
              {available
                ? `This ${subject} can be assigned on ${day}.`
                : `This ${subject} can't be assigned on ${day}.`}
            </p>
          </div>
          {reasons.length > 0 && (
            <ul aria-label="Reasons" className="flex flex-wrap gap-1.5">
              {reasons.map((reason) => (
                <li key={reason}>
                  <Badge tone={archived ? "neutral" : "warning"}>{describeReasons([reason], labels)}</Badge>
                </li>
              ))}
            </ul>
          )}
          {statusReason && (
            <p className="text-body text-text-secondary">
              <span className="text-text">Reason given:</span> {statusReason}
            </p>
          )}
        </div>
      </div>
      {action}
    </section>
  );
};
