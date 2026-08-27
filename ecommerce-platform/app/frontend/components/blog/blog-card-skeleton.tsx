export const BlogCardSkeleton = () => {
  return (
    <div className="flex flex-col bg-white rounded-2xl overflow-hidden border border-slate-200 animate-pulse">
      {/* Image Skeleton */}
      <div className="aspect-[16/9] bg-slate-200" />

      {/* Body Skeleton */}
      <div className="p-5 space-y-3 flex-1 flex flex-col justify-between">
        <div className="space-y-3">
          <div className="w-20 h-4 bg-slate-200 rounded" />
          <div className="w-full h-5 bg-slate-200 rounded" />
          <div className="w-2/3 h-5 bg-slate-200 rounded" />
          <div className="w-full h-4 bg-slate-100 rounded mt-2" />
        </div>

        {/* Footer Skeleton */}
        <div className="pt-4 flex justify-between items-center border-t border-slate-100 mt-4">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-full bg-slate-200" />
            <div className="w-24 h-4 bg-slate-200 rounded" />
          </div>
          <div className="w-12 h-4 bg-slate-200 rounded" />
        </div>
      </div>
    </div>
  );
};
