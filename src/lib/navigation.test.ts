import { HouseIcon, UsersIcon } from "lucide-react";
import { describe, expect, it } from "vitest";

import { activeNavItem, visibleNavigation, type NavGroup } from "./navigation";

// A fixture tree, so the rules are tested independently of which modules exist today.
const TREE: NavGroup[] = [
  { label: null, items: [{ label: "Home", href: "/", icon: HouseIcon }] },
  {
    label: "Settings",
    items: [{ label: "Users", href: "/settings/users", icon: UsersIcon, permission: "users.view" }],
  },
];

describe("visibleNavigation", () => {
  it("drops items and empty groups the user may not open", () => {
    expect(visibleNavigation(() => false, TREE).map((group) => group.label)).toEqual([null]);
  });

  it("keeps permitted items", () => {
    expect(visibleNavigation((permission) => permission === "users.view", TREE)[1]?.items[0]?.label).toBe("Users");
  });
});

describe("activeNavItem", () => {
  it.each([
    ["/", "Home"],
    ["/settings/users", "Users"],
    ["/settings/users/01a2", "Users"],
  ])("%s → %s", (path, label) => expect(activeNavItem(path, TREE)?.item.label).toBe(label));

  it("does not treat every path as Home", () => {
    expect(activeNavItem("/unknown", TREE)).toBeNull();
  });
});
