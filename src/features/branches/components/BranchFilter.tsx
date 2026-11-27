"use client";

import { useQuery } from "@tanstack/react-query";

import { branchOptions } from "@/components/shared/branch-options";
import { SelectFilter } from "@/components/shared/SelectFilter";
import { useFilterParams } from "@/components/shared/use-filter-params";
import { branchesQueries } from "../api";
import { BRANCH_PARAM, readBranch } from "../params";

/**
 * Branch filter of the vehicles and drivers lists. Hidden when there is nothing to choose between (one branch or none),
 * unless the URL already holds a branch: a stale or hand-edited link must always be clearable. The API scopes every read, so
 * a branch the caller cannot see just matches nothing.
 */
export const BranchFilter = () => {
  const query = useQuery(branchesQueries.list());
  const { searchParams } = useFilterParams();
  const chosen = readBranch(searchParams);

  // Wait for the answer, so a valid branch is not shown as unknown while the list loads.
  if (query.isPending) return null;
  const branches = query.data ?? [];
  if (branches.length <= 1 && !chosen) return null;

  // A branch that is not in the list (unreachable or deleted) stays an option, so the chip names it and can clear it.
  const options = branchOptions(
    branches,
    chosen ? { public_id: chosen, name: query.isError ? "Selected branch" : "Unknown branch" } : undefined,
  );
  return <SelectFilter label="Branch" param={BRANCH_PARAM} options={options} anyLabel="All branches" />;
};
