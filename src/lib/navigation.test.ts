import { HouseIcon, UsersIcon } from "lucide-react";
import { describe, expect, it } from "vitest";

import { activeNavItem, NAVIGATION, visibleNavigation, type NavGroup } from "./navigation";

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

describe("the console navigation", () => {
  const labels = (permissions: string[]) =>
    visibleNavigation((permission) => permissions.includes(permission), NAVIGATION).flatMap((group) =>
      group.items.map((item) => item.label),
    );

  it("lists Vehicles only for users who can view the fleet", () => {
    expect(labels(["fleet.view"])).toContain("Vehicles");
    expect(labels(["customers.view"])).not.toContain("Vehicles");
  });

  it("keeps Vehicles active on a vehicle's own page", () => {
    expect(activeNavItem("/fleet/vehicles/01a2", NAVIGATION)?.item.label).toBe("Vehicles");
  });
});
