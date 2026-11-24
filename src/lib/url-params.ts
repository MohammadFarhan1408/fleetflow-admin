/** `pathname` with `changes` applied to `searchParams`; a `null` value removes the key. */
export const hrefWithParams = (
  pathname: string,
  searchParams: URLSearchParams,
  changes: Record<string, string | null>,
) => {
  const params = new URLSearchParams(searchParams);
  for (const [key, value] of Object.entries(changes)) {
    if (value === null) params.delete(key);
    else params.set(key, value);
  }
  const query = params.toString();
  return query ? `${pathname}?${query}` : pathname;
};
