/** "ops_manager" → "Ops manager". For API codes that have no display label of their own (roles). */
export const humanizeCode = (code: string) => {
  const words = code.replaceAll("_", " ").trim();
  return words.charAt(0).toUpperCase() + words.slice(1);
};

/** Up to two initials from a name, falling back to the first letter of the email. */
export const initialsOf = (fullName: string, email: string) => {
  const parts = fullName.trim().split(/\s+/).filter(Boolean);
  const letters =
    parts.length > 1 ? `${parts[0]?.[0] ?? ""}${parts.at(-1)?.[0] ?? ""}` : (parts[0]?.[0] ?? email[0] ?? "?");
  return letters.toUpperCase();
};
