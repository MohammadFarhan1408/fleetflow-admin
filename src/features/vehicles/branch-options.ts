import type { Session } from "@/features/session/SessionContext";

export type BranchOption = { value: string; label: string };

/**
 * The branches a vehicle can be based at. `/me` lists only the user's own branches, so a user who may work across
 * branches (`fleet.all_branches`) sees fewer than exist until the API offers a branch list (memory.md API
 * requests). A vehicle already in another branch keeps that branch as an option, so editing it never loses it.
 */
export const branchOptions = (sessionBranches: Session["branches"], current?: { public_id: string; name: string }) => {
  const options: BranchOption[] = sessionBranches.map((branch) => ({ value: branch.public_id, label: branch.name }));
  if (current && !options.some((option) => option.value === current.public_id)) {
    options.push({ value: current.public_id, label: current.name });
  }
  return options;
};
