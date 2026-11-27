import { http, HttpResponse } from "msw";

import type { Branch } from "@/features/branches/api";

export const BRANCH_LIST = "*/bff/api/v1/branches/";

export const buildBranch = (overrides: Partial<Branch> = {}): Branch => ({
  public_id: "b-1",
  code: "BER",
  name: "Berlin depot",
  ...overrides,
});

/** `GET /branches/` answering with `branches`. */
export const branchesHandler = (
  branches: Branch[] = [buildBranch(), buildBranch({ public_id: "b-2", code: "HAM", name: "Hamburg hub" })],
) => http.get(BRANCH_LIST, () => HttpResponse.json({ results: branches, next: null, previous: null }));
