export const BRANCH_PARAM = "branch";

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

/** The branch to filter by from the URL. Anything that is not a UUID (an edited link) counts as no filter, because the API answers it with 400. */
export const readBranch = (searchParams: URLSearchParams) => {
  const value = searchParams.get(BRANCH_PARAM);
  return value !== null && UUID.test(value) ? value : null;
};
