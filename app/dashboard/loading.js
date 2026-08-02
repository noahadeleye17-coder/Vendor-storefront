// Shown automatically by Next.js while a dashboard page's server data is
// still loading (e.g. switching tabs). Mirrors the general shape of the
// overview page so the swap-in feels like a continuation, not a flash.
function Block({ className }) {
  return <div className={`animate-pulse rounded-2xl bg-white/[0.04] ${className}`} />;
}

export default function DashboardLoading() {
  return (
    <div className="flex flex-col gap-8">
      <div className="flex flex-col gap-2">
        <Block className="h-3 w-28" />
        <Block className="h-8 w-48" />
        <Block className="h-4 w-64" />
      </div>

      <Block className="h-32 w-full" />

      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
        <Block className="h-28 w-full" />
        <Block className="h-28 w-full" />
        <Block className="hidden h-28 w-full sm:block" />
      </div>

      <Block className="h-40 w-full" />
    </div>
  );
}
