import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { SegmentedFilter } from "./SegmentedFilter";

const navigation = vi.hoisted(() => ({ search: "", replace: vi.fn() }));
vi.mock("next/navigation", () => ({
  useSearchParams: () => new URLSearchParams(navigation.search),
  usePathname: () => "/things",
  useRouter: () => ({ replace: navigation.replace }),
}));

const OPTIONS = [
  { value: "a", label: "Alpha" },
  { value: "b", label: "Beta" },
];
const renderFilter = () => render(<SegmentedFilter label="Kind" param="kind" options={OPTIONS} />);

describe("SegmentedFilter", () => {
  beforeEach(() => {
    navigation.search = "";
    navigation.replace.mockReset();
  });

  it("shows every choice at once, with 'All' chosen until a value is", () => {
    renderFilter();

    expect(screen.getByRole("radiogroup", { name: "Kind" })).toBeInTheDocument();
    expect(screen.getAllByRole("radio").map((radio) => radio.textContent)).toEqual(["All", "Alpha", "Beta"]);
    expect(screen.getByRole("radio", { name: "All" })).toBeChecked();
  });

  it("writes the choice to the URL in one click, keeps other filters and drops the page cursor", async () => {
    navigation.search = "search=x&cursor=c1";
    renderFilter();

    await userEvent.click(screen.getByRole("radio", { name: "Beta" }));

    expect(navigation.replace).toHaveBeenCalledWith("/things?search=x&kind=b", { scroll: false });
  });

  it("marks the value from the URL, and removes the parameter with 'All'", async () => {
    navigation.search = "kind=a";
    renderFilter();
    expect(screen.getByRole("radio", { name: "Alpha" })).toBeChecked();

    await userEvent.click(screen.getByRole("radio", { name: "All" }));

    expect(navigation.replace).toHaveBeenCalledWith("/things", { scroll: false });
  });

  it("moves with the arrow keys", async () => {
    renderFilter();

    screen.getByRole("radio", { name: "All" }).focus();
    // Radix selects on an arrow key only while it is still held when focus moves.
    await userEvent.keyboard("{ArrowRight>}");
    await waitFor(() => expect(navigation.replace).toHaveBeenCalledWith("/things?kind=a", { scroll: false }));
    await userEvent.keyboard("{/ArrowRight}");
  });

  it("shows a value that is not an option (an edited link) as 'All'", () => {
    navigation.search = "kind=zzz";
    renderFilter();

    expect(screen.getByRole("radio", { name: "All" })).toBeChecked();
  });
});
