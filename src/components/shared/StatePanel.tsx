/** The bordered panel that holds a full-page empty, error or blocked state (design.md §6 Empty state). */
export const StatePanel = ({ children }: { children: React.ReactNode }) => (
  <div className="rounded-lg border border-border bg-surface shadow-1">{children}</div>
);
