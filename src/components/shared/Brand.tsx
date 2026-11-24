import { cn } from "@/lib/cn";

/** FleetFlow mark: a route with an orange stop on a deep indigo tile. Decorative; pair it with the wordmark or a label. */
const BrandMark = ({ className }: { className?: string }) => (
  <svg viewBox="0 0 32 32" aria-hidden className={cn("size-8 shrink-0", className)}>
    <rect width="32" height="32" rx="9" className="fill-brand" />
    <path
      d="M8 22.5c3.5 0 4-6 8-6s4.5-6 8-6"
      fill="none"
      className="stroke-brand-fg"
      strokeWidth="2.4"
      strokeLinecap="round"
    />
    <circle cx="8" cy="22.5" r="2.4" className="fill-brand-fg" />
    <circle cx="24" cy="10.5" r="3.2" className="fill-accent" />
  </svg>
);

/** Mark plus "FleetFlow" wordmark. `collapsed` hides the text (narrow sidebar) but keeps it for screen readers. */
const BrandLockup = ({
  collapsed = false,
  inverse = false,
  className,
}: {
  collapsed?: boolean;
  /** On a brand-coloured surface. */
  inverse?: boolean;
  className?: string;
}) => (
  <span className={cn("flex items-center gap-3", className)}>
    <BrandMark className={cn(inverse && "ring-1 ring-brand-fg/30 rounded-md")} />
    <span className={cn("text-h2", inverse ? "text-brand-fg" : "text-text", collapsed && "sr-only")}>FleetFlow</span>
  </span>
);

export { BrandLockup, BrandMark };
