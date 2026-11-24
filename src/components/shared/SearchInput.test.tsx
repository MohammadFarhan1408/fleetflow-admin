import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { SearchInput } from "./SearchInput";

const navigation = vi.hoisted(() => ({ search: "", replace: vi.fn() }));
vi.mock("next/navigation", () => ({
  // Stable per query string, like Next's hook, so the debounce is not restarted by re-renders.
  useSearchParams: (() => {
    let cached: { key: string; params: URLSearchParams } | null = null;
    return () => {
      if (cached?.key !== navigation.search)
        cached = { key: navigation.search, params: new URLSearchParams(navigation.search) };
      return cached.params;
    };
  })(),
  usePathname: () => "/customers",
  useRouter: () => ({ replace: navigation.replace }),
}));

describe("SearchInput", () => {
  beforeEach(() => {
    navigation.search = "";
    navigation.replace.mockReset();
  });

  it("puts a term of two or more characters in the URL after the debounce and drops the cursor", async () => {
    navigation.search = "cursor=abc&page_size=50";
    render(<SearchInput label="Search customers" />);

    await userEvent.type(screen.getByRole("searchbox", { name: "Search customers" }), "no");
    expect(navigation.replace).not.toHaveBeenCalled();

    await waitFor(() => expect(navigation.replace).toHaveBeenCalledTimes(1));
    expect(navigation.replace).toHaveBeenCalledWith("/customers?page_size=50&search=no", { scroll: false });
  });

  it("does not search for a single character", async () => {
    render(<SearchInput label="Search customers" />);

    await userEvent.type(screen.getByRole("searchbox"), "n");
    await new Promise((resolve) => setTimeout(resolve, 450));

    expect(navigation.replace).not.toHaveBeenCalled();
  });

  it("shows the term from the URL and clears it with the clear button", async () => {
    navigation.search = "search=north";
    render(<SearchInput label="Search customers" />);

    expect(screen.getByRole("searchbox")).toHaveValue("north");
    await userEvent.click(screen.getByRole("button", { name: "Clear search" }));

    expect(screen.getByRole("searchbox")).toHaveValue("");
    await waitFor(() => expect(navigation.replace).toHaveBeenCalledWith("/customers", { scroll: false }));
  });
});
