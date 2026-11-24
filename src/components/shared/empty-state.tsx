import type { LucideIcon } from "lucide-react";

/** design.md §6 Empty state: in place, muted icon, `h3` title, one sentence, primary action when permitted. */
export const EmptyState = ({
  icon: Icon,
  title,
  description,
  action,
}: {
  icon: LucideIcon;
  title: string;
  description: string;
  action?: React.ReactNode;
}) => (
  <div className="flex flex-col items-center gap-3 px-6 py-12 text-center">
    <span className="grid size-12 place-items-center rounded-lg bg-surface-sunken text-muted">
      <Icon aria-hidden className="size-6" />
    </span>
    <div className="flex max-w-100 flex-col gap-1">
      <h3 className="text-h3 text-text">{title}</h3>
      <p className="text-body text-text-secondary">{description}</p>
    </div>
    {action}
  </div>
);
