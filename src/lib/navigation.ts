import { ContactIcon, HouseIcon, UsersIcon, type LucideIcon } from "lucide-react";

import { PERMISSIONS } from "./permissions";
import { ROUTES } from "./routes";

export type NavItem = {
  label: string;
  href: string;
  icon: LucideIcon;
  /** Permission codename from fleetflow-api `/me`; omitted when every signed-in user may open it. */
  permission?: string;
};

export type NavGroup = { label: string | null; items: NavItem[] };

/**
 * The console navigation, defined once (architecture §5). Only modules that exist are listed; each phase
 * adds its own items under the design.md §5 groups (Operations, Fleet, Warehouse, Customers, Insights, Settings).
 */
export const NAVIGATION: NavGroup[] = [
  { label: null, items: [{ label: "Home", href: ROUTES.home, icon: HouseIcon }] },
  {
    label: "Customers",
    items: [{ label: "Customers", href: ROUTES.customers, icon: ContactIcon, permission: PERMISSIONS.customersView }],
  },
  {
    label: "Settings",
    items: [{ label: "Users", href: ROUTES.users, icon: UsersIcon, permission: PERMISSIONS.usersView }],
  },
];

/** Navigation filtered to what the user may open, without empty groups. */
export const visibleNavigation = (can: (permission: string) => boolean, navigation = NAVIGATION) =>
  navigation
    .map((group) => ({
      ...group,
      items: group.items.filter((item) => !item.permission || can(item.permission)),
    }))
    .filter((group) => group.items.length > 0);

/** The nav item for a pathname: exact match, or the longest item prefix (detail pages). */
export const activeNavItem = (pathname: string, navigation = NAVIGATION) => {
  const items = navigation.flatMap((group) => group.items.map((item) => ({ group: group.label, item })));
  return (
    items.find(({ item }) => item.href === pathname) ??
    items
      .filter(({ item }) => item.href !== ROUTES.home && pathname.startsWith(`${item.href}/`))
      .sort((a, b) => b.item.href.length - a.item.href.length)[0] ??
    null
  );
};
