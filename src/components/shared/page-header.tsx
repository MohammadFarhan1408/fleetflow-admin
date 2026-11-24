/** design.md §3: one `display` title per page, an optional one-line description and the page's actions on the right. */
export const PageHeader = ({
  title,
  description,
  actions,
}: {
  title: React.ReactNode;
  description?: React.ReactNode;
  actions?: React.ReactNode;
}) => (
  <div className="flex flex-wrap items-end justify-between gap-4">
    <div className="flex min-w-0 flex-col gap-1">
      <h1 className="text-display text-text">{title}</h1>
      {description && <div className="text-body text-text-secondary">{description}</div>}
    </div>
    {actions && <div className="flex items-center gap-2">{actions}</div>}
  </div>
);
