import { Alert } from "@/components/ui/Alert";
import type { FormAlert } from "../messages";

/** Form-level error with the API request ID for support (design.md §6 Error state). */
export const AuthAlert = ({ alert }: { alert: FormAlert }) => (
  <Alert tone="error" title={alert.title}>
    {alert.detail}
    {alert.requestId && <span className="block font-mono text-caption">Reference: {alert.requestId}</span>}
  </Alert>
);
