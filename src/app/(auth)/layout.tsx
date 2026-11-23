// architecture §5: minimal centred layout for the public auth pages.
const AuthLayout = ({ children }: { children: React.ReactNode }) => (
  <main className="flex min-h-dvh items-center justify-center p-4">
    <div className="flex w-full max-w-100 flex-col gap-6">
      <p className="text-h2 text-primary">FleetFlow</p>
      {children}
    </div>
  </main>
);

export default AuthLayout;
