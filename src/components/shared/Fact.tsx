/** One label and value in a `FactList` (design.md §6 Facts). */
export const Fact = ({ label, children }: { label: string; children: React.ReactNode }) => (
  <div className="flex min-w-0 flex-col gap-1">
    <dt className="text-caption text-muted">{label}</dt>
    <dd className="text-body break-words text-text">{children}</dd>
  </div>
);
