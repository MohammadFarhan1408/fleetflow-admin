/** A titled group of fields inside a form card; groups after the first get a divider (design.md §6 Input). */
export const FormSection = ({
  title,
  description,
  children,
}: {
  title: string;
  description: string;
  children: React.ReactNode;
}) => (
  <div className="flex flex-col gap-4 border-t border-border pt-6 first:border-t-0 first:pt-0">
    <div className="flex flex-col gap-1">
      <h2 className="text-h3 text-text">{title}</h2>
      <p className="text-caption text-text-secondary">{description}</p>
    </div>
    {children}
  </div>
);
