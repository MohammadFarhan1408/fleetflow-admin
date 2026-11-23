import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

/** Shared frame for the auth pages: one page title, optional intro, then the form. */
export const AuthCard = ({
  title,
  description,
  children,
}: {
  title: string;
  description?: string;
  children: React.ReactNode;
}) => (
  <Card className="gap-6 p-6">
    <div className="flex flex-col gap-1">
      <h1 className="text-display">{title}</h1>
      {description && <p className="text-body text-text-secondary">{description}</p>}
    </div>
    {children}
  </Card>
);

/** Shown while a form that reads the URL query hydrates. */
export const AuthFormSkeleton = ({ fields }: { fields: number }) => (
  <div role="status" aria-busy="true" aria-label="Loading form" className="flex flex-col gap-4">
    {Array.from({ length: fields }, (_, index) => (
      <div key={index} className="flex flex-col gap-1">
        <Skeleton className="h-4 w-24" />
        <Skeleton className="h-8 w-full" />
      </div>
    ))}
    <Skeleton className="h-10 w-full" />
  </div>
);
