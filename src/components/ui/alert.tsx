import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "cn";
import { CircleAlertIcon, CircleCheckIcon, InfoIcon, TriangleAlertIcon } from "lucide-react";

// design.md §6 Alert (inline): 3 px left bar in the status colour, subtle background, icon, title and body.
const alertVariants = cva(
  "flex gap-3 rounded-md border-l-3 p-3 text-body text-text [&>svg]:mt-0.5 [&>svg]:size-4 [&>svg]:shrink-0",
  {
    variants: {
      tone: {
        info: "border-info bg-info-subtle [&>svg]:text-info",
        success: "border-success bg-success-subtle [&>svg]:text-success",
        warning: "border-warning bg-warning-subtle [&>svg]:text-warning",
        error: "border-error bg-error-subtle [&>svg]:text-error",
      },
    },
    defaultVariants: { tone: "info" },
  },
);

const ICONS = { info: InfoIcon, success: CircleCheckIcon, warning: TriangleAlertIcon, error: CircleAlertIcon };

type AlertProps = Omit<React.ComponentProps<"div">, "title"> &
  VariantProps<typeof alertVariants> & {
    title: React.ReactNode;
  };

/** Errors use role="alert" so screen readers announce them; other tones use role="status". */
const Alert = ({ className, tone = "info", title, children, ...props }: AlertProps) => {
  const Icon = ICONS[tone ?? "info"];
  return (
    <div
      data-slot="alert"
      role={tone === "error" ? "alert" : "status"}
      className={cn(alertVariants({ tone }), className)}
      {...props}
    >
      <Icon aria-hidden />
      <div className="flex flex-col gap-1">
        <p className="text-body-strong">{title}</p>
        {children && <div className="text-text-secondary">{children}</div>}
      </div>
    </div>
  );
};

export { Alert };
