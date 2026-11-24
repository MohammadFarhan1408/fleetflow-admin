import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { CircleAlertIcon, MoreHorizontalIcon, PlusIcon, TruckIcon } from "lucide-react";

import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/Card";
import { Checkbox } from "@/components/ui/Checkbox";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/Dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/DropdownMenu";
import { Input } from "@/components/ui/Input";
import { Label } from "@/components/ui/Label";
import { Skeleton } from "@/components/ui/Skeleton";
import { Switch } from "@/components/ui/Switch";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/Tooltip";
import { ThemeToggle } from "./ThemeToggle";

// Dev-only visual contract for design.md, reviewed at the Phase 0 checkpoint.
export const metadata: Metadata = { title: "Design tokens · FleetFlow Admin", robots: { index: false } };

const colorTokens = [
  "bg",
  "surface",
  "surface-elevated",
  "surface-sunken",
  "border",
  "border-strong",
  "border-input",
  "text",
  "text-secondary",
  "muted",
  "primary",
  "primary-hover",
  "primary-fg",
  "primary-subtle",
  "secondary",
  "secondary-hover",
  "accent",
  "success",
  "success-subtle",
  "warning",
  "warning-subtle",
  "error",
  "error-subtle",
  "info",
  "info-subtle",
  "neutral-status",
  "neutral-status-subtle",
  "hover",
  "focus",
  "disabled-bg",
  "disabled-fg",
  "overlay",
  "chart-1",
  "chart-2",
  "chart-3",
  "chart-4",
  "chart-5",
];

const typeStyles = [
  { name: "display", className: "text-display" },
  { name: "h2", className: "text-h2" },
  { name: "h3", className: "text-h3" },
  { name: "body", className: "text-body" },
  { name: "body-strong", className: "text-body-strong" },
  { name: "table", className: "text-table" },
  { name: "label", className: "text-label" },
  { name: "caption", className: "text-caption" },
  { name: "overline", className: "text-overline" },
  { name: "kpi", className: "text-kpi tabular-nums" },
];

const spacingScale = [0, 2, 4, 6, 8, 12, 16, 20, 24, 32, 40, 48, 64];
const radii = ["sm", "md", "lg", "xl"];
const shadows = ["1", "2"];
const tones = ["neutral", "info", "primary", "success", "warning", "error"] as const;

const Section = ({ title, children }: { title: string; children: React.ReactNode }) => {
  return (
    <section aria-labelledby={`section-${title}`} className="flex flex-col gap-3">
      <h2 id={`section-${title}`} className="text-h2">
        {title}
      </h2>
      {children}
    </section>
  );
};

const TokensPage = () => {
  if (process.env.NEXT_PUBLIC_APP_ENV === "production") notFound();

  return (
    <main className="flex flex-col gap-8 p-4 lg:p-6">
      <header className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-display">Design tokens</h1>
          <p className="text-caption text-text-secondary">design.md rendered from tokens.css. Development only.</p>
        </div>
        <ThemeToggle />
      </header>

      <Section title="Colour">
        <ul className="grid grid-cols-2 gap-3 sm:grid-cols-4 xl:grid-cols-8">
          {colorTokens.map((token) => (
            <li key={token} className="flex flex-col gap-1">
              <span className="h-10 rounded-md border border-border" style={{ background: `var(--color-${token})` }} />
              <code className="font-mono text-caption">{token}</code>
            </li>
          ))}
        </ul>
      </Section>

      <Section title="Typography">
        <Card>
          <ul className="flex flex-col gap-3">
            {typeStyles.map(({ name, className }) => (
              <li key={name} className="flex items-baseline gap-4">
                <code className="w-24 shrink-0 font-mono text-caption text-text-secondary">{name}</code>
                <span className={className}>Route R-0412 dispatched 14:35</span>
              </li>
            ))}
            <li className="flex items-baseline gap-4">
              <code className="w-24 shrink-0 font-mono text-caption text-text-secondary">mono</code>
              <span className="font-mono text-body">FF-2026-000184 · 25.2048, 55.2708</span>
            </li>
          </ul>
        </Card>
      </Section>

      <Section title="Spacing, radius, elevation">
        <div className="grid gap-4 lg:grid-cols-3">
          <Card>
            <CardTitle>Spacing (px)</CardTitle>
            <ul className="flex flex-col gap-1">
              {spacingScale.map((px) => (
                <li key={px} className="flex items-center gap-3">
                  <code className="w-8 font-mono text-caption tabular-nums">{px}</code>
                  <span className="h-3 bg-primary" style={{ width: px }} />
                </li>
              ))}
            </ul>
          </Card>
          <Card>
            <CardTitle>Radius</CardTitle>
            <ul className="flex gap-4">
              {radii.map((radius) => (
                <li key={radius} className="flex flex-col items-center gap-1">
                  <span
                    className="size-12 border border-border-strong bg-surface-sunken"
                    style={{ borderRadius: `var(--radius-${radius})` }}
                  />
                  <code className="font-mono text-caption">{radius}</code>
                </li>
              ))}
            </ul>
          </Card>
          <Card>
            <CardTitle>Shadow</CardTitle>
            <ul className="flex gap-6">
              {shadows.map((shadow) => (
                <li key={shadow} className="flex flex-col items-center gap-1">
                  <span
                    className="size-12 rounded-md bg-surface-elevated"
                    style={{ boxShadow: `var(--shadow-${shadow})` }}
                  />
                  <code className="font-mono text-caption">shadow-{shadow}</code>
                </li>
              ))}
            </ul>
          </Card>
        </div>
      </Section>

      <Section title="Buttons">
        <Card>
          <div className="flex flex-wrap items-center gap-3">
            <Button>
              <PlusIcon />
              Create shipment
            </Button>
            <Button variant="secondary">Cancel</Button>
            <Button variant="ghost">Ghost</Button>
            <Button variant="destructive">Cancel shipment</Button>
            <Button variant="link">View route</Button>
            <Button loading>
              <PlusIcon />
              Saving
            </Button>
            <Button disabled>Disabled</Button>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <Button size="sm">Small 28</Button>
            <Button size="md">Medium 32</Button>
            <Button size="lg">Large 40</Button>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button variant="ghost" size="icon" aria-label="Dispatch route">
                  <TruckIcon />
                </Button>
              </TooltipTrigger>
              <TooltipContent>Dispatch route</TooltipContent>
            </Tooltip>
          </div>
        </Card>
      </Section>

      <Section title="Form controls">
        <Card className="max-w-180">
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="flex flex-col gap-1">
              <Label htmlFor="demo-reference">Reference</Label>
              <Input id="demo-reference" placeholder="e.g. PO-1182" />
              <p className="text-caption text-text-secondary">Your own order or invoice number.</p>
            </div>
            <div className="flex flex-col gap-1">
              <Label htmlFor="demo-weight">Weight (kg)</Label>
              <Input id="demo-weight" aria-invalid aria-describedby="demo-weight-error" defaultValue="0" />
              <p id="demo-weight-error" className="flex items-center gap-1 text-caption text-error">
                <CircleAlertIcon aria-hidden className="size-4" />
                Weight must be between 0.01 and 30,000 kg
              </p>
            </div>
            <div className="flex flex-col gap-1">
              <Label htmlFor="demo-readonly">Tracking number</Label>
              <Input id="demo-readonly" readOnly defaultValue="FF-2026-000184" className="font-mono" />
            </div>
            <div className="flex flex-col gap-1">
              <Label htmlFor="demo-disabled">Disabled</Label>
              <Input id="demo-disabled" disabled defaultValue="Not editable" />
            </div>
          </div>
          <div className="flex flex-wrap items-center gap-6">
            <div className="flex items-center gap-2">
              <Checkbox id="demo-checkbox" defaultChecked />
              <Label htmlFor="demo-checkbox">Require signature</Label>
            </div>
            <div className="flex items-center gap-2">
              <Switch id="demo-switch" defaultChecked />
              <Label htmlFor="demo-switch">Compact tables</Label>
            </div>
          </div>
        </Card>
      </Section>

      <Section title="Badges">
        <Card>
          <div className="flex flex-wrap gap-2">
            {tones.map((tone) => (
              <Badge key={tone} tone={tone}>
                {tone}
              </Badge>
            ))}
          </div>
        </Card>
      </Section>

      <Section title="Overlays and loading">
        <div className="grid gap-4 lg:grid-cols-2">
          <Card>
            <CardHeader>
              <div className="flex flex-col gap-1">
                <CardTitle>Card title</CardTitle>
                <CardDescription>Surface, hairline border, radius lg, shadow 1.</CardDescription>
              </div>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon-sm" aria-label="Route actions">
                    <MoreHorizontalIcon />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuLabel>Route</DropdownMenuLabel>
                  <DropdownMenuItem>Edit stops</DropdownMenuItem>
                  <DropdownMenuItem>Reassign driver</DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem variant="destructive">Cancel route</DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </CardHeader>
            <CardContent>
              <Dialog>
                <DialogTrigger asChild>
                  <Button variant="secondary">Open confirm dialog</Button>
                </DialogTrigger>
                <DialogContent size="confirm">
                  <DialogHeader>
                    <DialogTitle>Cancel route R-0412?</DialogTitle>
                    <DialogDescription>The 14 stops on this route go back to unassigned.</DialogDescription>
                  </DialogHeader>
                  <DialogFooter>
                    <DialogClose asChild>
                      <Button variant="secondary">Keep route</Button>
                    </DialogClose>
                    <DialogClose asChild>
                      <Button variant="destructive">Cancel route</Button>
                    </DialogClose>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </CardContent>
          </Card>
          <Card role="status" aria-busy="true" aria-label="Loading example">
            <Skeleton className="h-4 w-1/3" />
            <Skeleton className="h-8 w-full" />
            <Skeleton className="h-8 w-full" />
            <Skeleton className="h-8 w-2/3" />
          </Card>
        </div>
      </Section>
    </main>
  );
};

export default TokensPage;
