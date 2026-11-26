import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { SelectFilter } from "./SelectFilter";

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
const renderFilter = () => render(<SelectFilter label="Kind" param="kind" options={OPTIONS} anyLabel="Any kind" />);

describe("SelectFilter", () => {
  beforeEach(() => {
    navigation.search = "";
    navigation.replace.mockReset();
  });

  it("is named after what it filters until a value is chosen, with no clear button", () => {
    renderFilter();

    expect(screen.getByRole("button", { name: "Kind" })).toBeInTheDocument();
    expect(screen.queryByRole("button", { name: "Clear Kind filter" })).not.toBeInTheDocument();
  });

  it("writes the choice to the URL, keeps other filters, drops the page cursor and closes", async () => {
    navigation.search = "search=x&cursor=c1";
    renderFilter();

    await userEvent.click(screen.getByRole("button", { name: "Kind" }));
    await userEvent.click(await screen.findByRole("radio", { name: "Beta" }));

    expect(navigation.replace).toHaveBeenCalledWith("/things?search=x&kind=b", { scroll: false });
    expect(screen.queryByRole("radio", { name: "Beta" })).not.toBeInTheDocument();
  });

  it("shows the choice in the chip, marks it in the list, and removes the parameter with 'any'", async () => {
    navigation.search = "kind=a";
    renderFilter();
    expect(screen.getByRole("button", { name: "Kind: Alpha" })).toBeInTheDocument();

    await userEvent.click(screen.getByRole("button", { name: "Kind: Alpha" }));
    expect(await screen.findByRole("radio", { name: "Alpha" })).toBeChecked();
    await userEvent.click(screen.getByRole("radio", { name: "Any kind" }));

    expect(navigation.replace).toHaveBeenCalledWith("/things", { scroll: false });
  });

  it("clears with the chip's own button", async () => {
    navigation.search = "kind=a&cursor=c1";
    renderFilter();

    await userEvent.click(screen.getByRole("button", { name: "Clear Kind filter" }));

    expect(navigation.replace).toHaveBeenCalledWith("/things", { scroll: false });
  });

  it("shows a value that is not an option (an edited link) as no filter", () => {
    navigation.search = "kind=zzz";
    renderFilter();

    expect(screen.getByRole("button", { name: "Kind" })).toBeInTheDocument();
  });
});
