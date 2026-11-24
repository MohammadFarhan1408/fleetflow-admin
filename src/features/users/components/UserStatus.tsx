import { Badge } from "@/components/ui/Badge";

/** `is_active` as a status badge: dot plus text, never colour alone (design.md §6). */
export const UserStatus = ({ active }: { active: boolean }) =>
  active ? <Badge tone="success">Active</Badge> : <Badge tone="neutral">Deactivated</Badge>;
