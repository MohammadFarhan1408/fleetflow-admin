import { cn } from "@/lib/cn";

/** Labelled facts in a compact grid (design.md §6 Facts): several to a row, no divider between them. */
export const FactList = ({ columns = 1, children }: { columns?: 1 | 2; children: React.ReactNode }) => (
  <dl className={cn("grid gap-x-6 gap-y-4", columns === 2 && "sm:grid-cols-2")}>{children}</dl>
);
