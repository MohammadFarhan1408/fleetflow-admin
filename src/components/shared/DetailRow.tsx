/** One label and value in a detail card's `<dl>` (design.md §6 Card). */
export const DetailRow = ({ label, children }: { label: string; children: React.ReactNode }) => (
  <div className="flex flex-col gap-1 py-3 first:pt-0 last:pb-0">
    <dt className="text-caption text-muted">{label}</dt>
    <dd className="text-body text-text">{children}</dd>
  </div>
);
