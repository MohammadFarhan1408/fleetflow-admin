import { BrandLockup } from "@/components/shared/brand";
import { RoutePanel } from "@/features/auth/components/route-panel";

// architecture §5 auth layout; design.md §1: brand panel (≥ 1024 px) beside a quiet form pane.
const AuthLayout = ({ children }: { children: React.ReactNode }) => (
  <div className="grid min-h-dvh bg-surface lg:grid-cols-2">
    <RoutePanel />
    <main className="flex justify-center px-6 py-12 lg:items-center lg:p-12">
      <div className="flex w-full max-w-100 flex-col gap-8">
        <BrandLockup className="lg:hidden" />
        {children}
      </div>
    </main>
  </div>
);

export default AuthLayout;
