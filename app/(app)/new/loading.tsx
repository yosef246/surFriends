export default function Loading() {
  return (
    <div className="flex flex-col gap-4" aria-busy="true" aria-label="טוענים את הטופס">
      <div className="flex items-center gap-3">
        <div className="skeleton size-9 rounded-full" />
        <div className="flex flex-col gap-2">
          <div className="skeleton h-3 w-32 rounded" />
          <div className="skeleton h-6 w-40 rounded" />
        </div>
      </div>
      <div className="card-coast flex flex-col gap-4 rounded-card p-5">
        <div className="skeleton h-12 w-full rounded-lg" />
        <div className="skeleton h-12 w-full rounded-lg" />
        <div className="skeleton h-24 w-full rounded-lg" />
        <div className="skeleton h-12 w-full rounded-pill" />
      </div>
    </div>
  );
}
