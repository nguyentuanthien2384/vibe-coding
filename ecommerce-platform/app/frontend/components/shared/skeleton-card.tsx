// components/shared/skeleton-card.tsx
const SkeletonCard = () => {
  return (
    <div className="animate-pulse bg-white rounded-2xl border border-slate-100 p-4 space-y-4">
      <div className="w-full aspect-square bg-slate-200 rounded-xl" />
      <div className="space-y-2">
        <div className="h-4 bg-slate-200 rounded-md w-3/4" />
        <div className="h-4 bg-slate-200 rounded-md w-1/2" />
      </div>
      <div className="h-10 bg-slate-200 rounded-xl w-full" />
    </div>
  );
};

export default SkeletonCard;
