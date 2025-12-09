export default function SkeletonCard() {
  return (
    <div className="glass-card rounded-2xl shadow-lg overflow-hidden animate-pulse">
      {/* Image Skeleton */}
      <div className="h-48 bg-gray-300 dark:bg-gray-700"></div>
      
      {/* Content Skeleton */}
      <div className="p-6">
        {/* Title */}
        <div className="h-6 bg-gray-300 dark:bg-gray-700 rounded w-3/4 mb-4"></div>
        
        {/* Category Badge */}
        <div className="h-5 bg-gray-300 dark:bg-gray-700 rounded w-1/3 mb-4"></div>
        
        {/* Description Lines */}
        <div className="space-y-2 mb-4">
          <div className="h-4 bg-gray-300 dark:bg-gray-700 rounded"></div>
          <div className="h-4 bg-gray-300 dark:bg-gray-700 rounded w-5/6"></div>
        </div>
        
        {/* Raw Material */}
        <div className="mb-4">
          <div className="h-4 bg-gray-300 dark:bg-gray-700 rounded w-1/2 mb-2"></div>
          <div className="h-4 bg-gray-300 dark:bg-gray-700 rounded w-2/3"></div>
        </div>
        
        {/* Stats */}
        <div className="flex items-center justify-between pt-4 border-t border-gray-200 dark:border-gray-700">
          <div className="h-8 bg-gray-300 dark:bg-gray-700 rounded w-20"></div>
          <div className="h-10 bg-gray-300 dark:bg-gray-700 rounded w-24"></div>
        </div>
      </div>
    </div>
  )
}
