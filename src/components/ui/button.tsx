import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/cn";
import { Slot } from "radix-ui";
import { LoaderCircleIcon } from "lucide-react";

// design.md §6 Button / Icon button.
const buttonVariants = cva(
  "inline-flex shrink-0 items-center justify-center gap-1.5 rounded-md border border-transparent text-label whitespace-nowrap transition-colors select-none disabled:pointer-events-none disabled:bg-disabled-bg disabled:text-disabled-fg [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0",
  {
    variants: {
      variant: {
        primary: "bg-primary text-primary-fg hover:bg-primary-hover",
        secondary: "bg-secondary text-text hover:bg-secondary-hover",
        ghost: "text-text hover:bg-hover aria-expanded:bg-hover",
        destructive: "bg-error text-primary-fg hover:bg-error/90",
        link: "text-primary underline-offset-4 hover:underline disabled:bg-transparent",
      },
      size: {
        sm: "h-7 px-2",
        md: "h-8 px-3",
        lg: "h-10 px-4",
        "icon-sm": "size-7",
        icon: "size-8",
        "icon-lg": "size-10",
      },
    },
    // Applied after the size classes, so a link keeps text-like spacing at every size.
    compoundVariants: [{ variant: "link", class: "h-auto px-0" }],
    defaultVariants: {
      variant: "primary",
      size: "md",
    },
  },
);

type ButtonProps = React.ComponentProps<"button"> &
  VariantProps<typeof buttonVariants> & {
    asChild?: boolean;
    /** Replaces the leading icon with a spinner and disables the button. */
    loading?: boolean;
  };

const Button = ({
  className,
  variant = "primary",
  size = "md",
  asChild = false,
  loading = false,
  disabled,
  children,
  ...props
}: ButtonProps) => {
  const classes = cn(buttonVariants({ variant, size }), className);

  if (asChild) {
    return (
      <Slot.Root data-slot="button" className={classes} {...props}>
        {children}
      </Slot.Root>
    );
  }

  return (
    <button
      data-slot="button"
      className={cn(classes, loading && "[&>svg:not([data-spinner])]:hidden")}
      disabled={disabled || loading}
      aria-busy={loading || undefined}
      {...props}
    >
      {loading && <LoaderCircleIcon data-spinner aria-hidden className="animate-spin" />}
      {children}
    </button>
  );
};

export { Button, buttonVariants };
