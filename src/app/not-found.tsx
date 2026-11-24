import Link from "next/link";
import { CompassIcon } from "lucide-react";

import { BrandLockup } from "@/components/shared/Brand";
import { Button } from "@/components/ui/Button";
import { ROUTES } from "@/lib/routes";

const NotFound = () => (
  <main className="flex min-h-dvh flex-col items-center justify-center gap-8 bg-bg p-6">
    <BrandLockup />
    <div className="flex max-w-100 flex-col items-center gap-3 text-center">
      <span className="grid size-12 place-items-center rounded-lg bg-primary-subtle text-primary">
        <CompassIcon aria-hidden className="size-6" />
      </span>
      <h1 className="text-display">Page not found</h1>
      <p className="text-body text-text-secondary">
        The link may be out of date, or the page was moved. Check the address or go back to the console.
      </p>
      <Button asChild className="mt-2">
        <Link href={ROUTES.home}>Go to home</Link>
      </Button>
    </div>
  </main>
);

export default NotFound;
