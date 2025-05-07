
import { cn } from "@/lib/utils"

function Skeleton({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn("animate-pulse rounded-md bg-muted", className)}
      {...props}
    />
  )
}

export function SkeletonCard() {
  return (
    <div className="p-6 rounded-lg bg-gray-800/50 border border-gray-700/50 space-y-3">
      <Skeleton className="h-6 w-2/3 bg-gray-700/50 rounded" />
      <Skeleton className="h-4 w-1/2 bg-gray-700/50 rounded" />
      <div className="pt-2">
        <Skeleton className="h-32 w-full bg-gray-700/50 rounded" />
      </div>
      <div className="flex justify-between">
        <Skeleton className="h-9 w-24 bg-gray-700/50 rounded" />
        <Skeleton className="h-9 w-24 bg-gray-700/50 rounded" />
      </div>
    </div>
  )
}

export function SkeletonProfile() {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <div>
        <div className="p-6 rounded-lg bg-gray-800/50 border border-gray-700/50 space-y-4">
          <div className="flex justify-center">
            <Skeleton className="h-32 w-32 bg-gray-700/50 rounded-full" />
          </div>
          <Skeleton className="h-4 w-1/2 bg-gray-700/50 rounded mx-auto" />
          <Skeleton className="h-4 w-3/4 bg-gray-700/50 rounded" />
          <Skeleton className="h-4 w-2/3 bg-gray-700/50 rounded" />
          <Skeleton className="h-4 w-1/2 bg-gray-700/50 rounded" />
        </div>
      </div>
      <div className="lg:col-span-2">
        <div className="p-6 rounded-lg bg-gray-800/50 border border-gray-700/50 space-y-4">
          <Skeleton className="h-6 w-2/5 bg-gray-700/50 rounded" />
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Skeleton className="h-10 w-full bg-gray-700/50 rounded" />
            <Skeleton className="h-10 w-full bg-gray-700/50 rounded" />
          </div>
          <Skeleton className="h-10 w-full bg-gray-700/50 rounded" />
          <Skeleton className="h-32 w-full bg-gray-700/50 rounded" />
          <Skeleton className="h-10 w-24 bg-gray-700/50 rounded" />
        </div>
      </div>
    </div>
  )
}

export { Skeleton }
