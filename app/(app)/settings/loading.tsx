export default function Loading() {
  return (
    <div className="flex flex-col gap-6" aria-busy="true" aria-label="טוענים את ההגדרות">
      <div className="flex items-center gap-2">
        <div className="skeleton size-touch rounded-full" />
        <div className="skeleton h-7 w-24 rounded" />
      </div>
      <div className="glass-card flex flex-col gap-4 rounded-card p-5">
        <div className="skeleton h-6 w-32 rounded" />
        <div className="skeleton h-12 w-full rounded-lg" />
        <div className="skeleton h-12 w-full rounded-lg" />
        <div className="skeleton h-20 w-full rounded-lg" />
      </div>
      <div className="glass-card flex flex-col gap-3 rounded-card p-5">
        <div className="skeleton h-6 w-40 rounded" />
        <div className="skeleton h-10 w-full rounded-lg" />
      </div>
    </div>
  );
}
