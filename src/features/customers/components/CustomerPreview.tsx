import { ContactIcon } from "lucide-react";

import { DetailRow } from "@/components/shared/DetailRow";
import { EmptyValue } from "@/components/shared/EmptyValue";
import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/Card";
import { cn } from "@/lib/cn";
import { initialsOf } from "@/lib/format";
import type { CustomerValues } from "../schemas";
import { CustomerKind } from "./CustomerKind";

/**
 * The customer as the list and the customer page will show it, updating as the form changes. It repeats
 * what the form already says, so assistive technology skips it; it is there to be looked at.
 */
export const CustomerPreview = ({ values }: { values: CustomerValues }) => {
  const name = values.name.trim();
  const email = values.email.trim();
  const phone = values.phone.trim();
  return (
    <div aria-hidden="true" className="hidden xl:sticky xl:top-20 xl:col-span-4 xl:block">
      <Card>
        <CardHeader>
          <div className="flex flex-col gap-1">
            <CardTitle>Preview</CardTitle>
            <CardDescription>How this customer will look in your list.</CardDescription>
          </div>
        </CardHeader>
        <div className="flex items-center gap-3">
          <span className="grid size-10 shrink-0 place-items-center rounded-lg bg-primary-subtle text-label text-primary">
            {name ? initialsOf(name, "") : <ContactIcon className="size-5" />}
          </span>
          <div className="flex min-w-0 flex-col items-start gap-1">
            <p className={cn("w-full truncate text-h3", name ? "text-text" : "text-muted")}>
              {name || "Customer name"}
            </p>
            <CustomerKind kind={values.kind} />
          </div>
        </div>
        <dl className="divide-y divide-border">
          <DetailRow label="Email">{email || <EmptyValue />}</DetailRow>
          <DetailRow label="Phone">{phone || <EmptyValue />}</DetailRow>
        </dl>
      </Card>
    </div>
  );
};
