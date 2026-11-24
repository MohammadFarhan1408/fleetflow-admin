import { formatDateTime, formatRelative } from "@/lib/format";

/** Relative time with the exact time available on hover and to assistive tech (design.md §6 Timeline rule). */
export const LastSignIn = ({ at }: { at: string | null }) =>
  at ? (
    <time dateTime={at} title={formatDateTime(at)}>
      {formatRelative(at)}
    </time>
  ) : (
    <span className="text-muted">Never signed in</span>
  );
