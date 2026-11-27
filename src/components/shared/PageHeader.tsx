import { cn } from "@/lib/cn";

/** design.md §3: one `display` title per page, an optional one-line description and the page's actions on the right. */
export const PageHeader = ({
  title,
  description,
  actions,
  leading,
}: {
  title: React.ReactNode;
  description?: React.ReactNode;
  actions?: React.ReactNode;
  /** An identity tile left of the title, for detail pages. */
  leading?: React.ReactNode;
}) => (
  <div className={cn("flex flex-wrap justify-between gap-4", leading ? "items-center" : "items-end")}>
    <div className="flex min-w-0 items-center gap-4">
      {leading}
      <div className="flex min-w-0 flex-col gap-1">
        <h1 className="text-display text-text">{title}</h1>
        {description && <div className="text-body text-text-secondary">{description}</div>}
      </div>
    </div>
    {actions && <div className="flex flex-wrap items-center gap-2">{actions}</div>}
  </div>
);
