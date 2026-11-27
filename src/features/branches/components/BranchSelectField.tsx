"use client";

import { useQuery } from "@tanstack/react-query";
import type { Ref } from "react";

import { branchOptions } from "@/components/shared/branch-options";
import { SelectField } from "@/components/shared/SelectField";
import { Button } from "@/components/ui/Button";
import { branchesQueries } from "../api";

type BranchSelectFieldProps = {
  id: string;
  error?: string;
  /** The record's current branch: it stays an option even if the list fails to load, so editing never loses it. */
  current?: { public_id: string; name: string };
  /** From the form library's field. */
  value: string;
  onValueChange: (value: string) => void;
  onBlur: () => void;
  name: string;
  ref?: Ref<HTMLButtonElement>;
};

/** The Branch field of the driver and vehicle forms: the API's branch list, with loading, empty and retry states. */
export const BranchSelectField = ({ current, ...field }: BranchSelectFieldProps) => {
  const query = useQuery(branchesQueries.list());
  const options = branchOptions(query.data ?? [], current);
  const placeholder = query.isPending
    ? "Loading branches…"
    : query.isError && options.length === 0
      ? "Couldn't load branches"
      : options.length === 0
        ? "No branches available"
        : "Choose a branch";

  return (
    <SelectField
      {...field}
      label="Branch"
      required
      placeholder={placeholder}
      options={options}
      disabled={options.length === 0}
      description={
        query.isError ? (
          <span className="flex flex-wrap items-center gap-2">
            Couldn&apos;t load the branches.
            <Button type="button" variant="secondary" size="sm" onClick={() => void query.refetch()}>
              Try again
            </Button>
          </span>
        ) : query.isSuccess && options.length === 0 ? (
          "There is no branch to choose. Ask an administrator to add you to one."
        ) : undefined
      }
    />
  );
};
