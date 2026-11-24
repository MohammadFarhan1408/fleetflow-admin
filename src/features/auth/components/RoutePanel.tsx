import { BrandLockup } from "@/components/shared/Brand";

// A delivery route that follows the streets of a city block grid, in viewBox units. Illustrative only: no data.
const STREETS_H = [50, 110, 170, 230, 280];
const STREETS_V = [60, 140, 220, 300, 370];
const ROUTE =
  "M40 230 H126 Q140 230 140 216 V184 Q140 170 154 170 H206 Q220 170 220 156 V124 Q220 110 234 110 H286 Q300 110 300 96 V64 Q300 50 314 50 H356";
const STOPS = [
  { x: 92, y: 230 },
  { x: 180, y: 170 },
  { x: 220, y: 132 },
  { x: 262, y: 110 },
  { x: 300, y: 78 },
];

/** The auth screen's one bold moment (design.md §1): an orange route drawing through its stops. */
export const RoutePanel = () => (
  <aside className="relative hidden flex-col justify-between overflow-hidden bg-brand p-10 text-brand-fg lg:flex">
    <BrandLockup inverse />

    <svg viewBox="0 0 400 300" aria-hidden className="w-full max-w-120 self-center">
      {/* Street grid with one diagonal avenue */}
      <g className="stroke-brand-fg/10" strokeWidth="6" strokeLinecap="round">
        {STREETS_H.map((y) => (
          <line key={`h${y}`} x1="10" x2="390" y1={y} y2={y} />
        ))}
        {STREETS_V.map((x) => (
          <line key={`v${x}`} x1={x} x2={x} y1="20" y2="290" />
        ))}
        <line x1="20" y1="150" x2="150" y2="20" />
      </g>
      <path d={ROUTE} fill="none" className="stroke-brand-fg/20" strokeWidth="10" strokeLinecap="round" />
      <path
        d={ROUTE}
        fill="none"
        pathLength={1}
        strokeDasharray="1"
        className="animate-route-draw stroke-accent"
        strokeWidth="4"
        strokeLinecap="round"
      />
      <rect x="28" y="218" width="24" height="24" rx="6" className="fill-brand-fg" />
      {STOPS.map(({ x, y }) => (
        <circle key={`${x}-${y}`} cx={x} cy={y} r="7" className="fill-brand stroke-brand-fg" strokeWidth="3" />
      ))}
      <circle cx="356" cy="50" r="11" className="fill-accent stroke-brand-fg" strokeWidth="3" />
    </svg>

    <div className="flex max-w-110 flex-col gap-2">
      <p className="max-w-90 text-display">Every shipment, every stop, one console.</p>
      <p className="text-body text-brand-fg/80">
        Dispatch routes, follow drivers and clear exceptions from the same place your team plans the day.
      </p>
    </div>
  </aside>
);
