/** The tile left of a detail page's title: initials for a person, an icon for a thing (design.md §6 Page header). */
export const IdentityTile = ({ children }: { children: React.ReactNode }) => (
  <span
    aria-hidden
    className="grid size-12 shrink-0 place-items-center rounded-lg bg-primary-subtle text-h3 text-primary [&>svg]:size-6"
  >
    {children}
  </span>
);
