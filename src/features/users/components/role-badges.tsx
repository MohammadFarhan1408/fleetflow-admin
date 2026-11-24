import { Badge } from "@/components/ui/badge";
import { humanizeCode } from "@/lib/format";

export const RoleBadges = ({ roles }: { roles: string[] }) =>
  roles.length === 0 ? (
    <span className="text-muted">No role</span>
  ) : (
    <ul className="flex flex-wrap gap-1">
      {roles.map((role) => (
        <li key={role}>
          <Badge tone="primary" dot={false}>
            {humanizeCode(role)}
          </Badge>
        </li>
      ))}
    </ul>
  );
