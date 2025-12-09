export default function SkeletonCard() {
  return (
    <div className="glass-card rounded-2xl shadow-lg overflow-hidden shimmer-overlay">
      {/* Image Skeleton */}
      <div className="h-52 skeleton-shimmer"></div>
      
      {/* Content Skeleton */}
      <div className="p-4">
        {/* Category Badge */}
        <div className="h-5 skeleton-shimmer rounded-full w-1/3 mb-3"></div>
        
        {/* Location */}
        <div className="h-3 skeleton-shimmer rounded w-2/3 mb-3"></div>
        
        {/* Description Lines */}
        <div className="space-y-2 mb-4">
          <div className="h-3 skeleton-shimmer rounded"></div>
          <div className="h-3 skeleton-shimmer rounded w-4/5"></div>
        </div>
        
        {/* Action Buttons */}
        <div className="flex gap-2 pt-2">
          <div className="h-9 skeleton-shimmer rounded-lg flex-1"></div>
          <div className="h-9 skeleton-shimmer rounded-lg w-12"></div>
        </div>
      </div>
    </div>
  )
}
