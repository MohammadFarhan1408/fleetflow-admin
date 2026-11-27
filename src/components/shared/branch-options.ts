export type BranchOption = { value: string; label: string };

/**
 * The branches a vehicle or driver can be based at, from the API's branch list. The record's current branch is kept as an
 * option when the list does not include it (or has not loaded), so editing never loses it.
 */
export const branchOptions = (
  branches: readonly { public_id: string; name: string }[],
  current?: { public_id: string; name: string },
) => {
  const options: BranchOption[] = branches.map((branch) => ({ value: branch.public_id, label: branch.name }));
  if (current && !options.some((option) => option.value === current.public_id)) {
    options.push({ value: current.public_id, label: current.name });
  }
  return options;
};
