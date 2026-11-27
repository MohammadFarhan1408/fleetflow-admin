/** A figure that leads (design.md §6 Stat): a small label, the number in tabular figures, and its unit. */
export const StatTile = ({ label, value, unit }: { label: string; value: string; unit: string }) => (
  <div className="flex flex-col gap-1">
    <p className="text-caption text-muted">{label}</p>
    <p className="flex items-baseline gap-1.5">
      <span className="text-display tabular-nums text-text">{value}</span>
      <span className="text-body text-text-secondary">{unit}</span>
    </p>
  </div>
);
