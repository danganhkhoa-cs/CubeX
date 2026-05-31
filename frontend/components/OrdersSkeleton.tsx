import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"

type OrdersSkeletonProps = {
  compact?: boolean
}

export default function OrdersSkeleton({ compact = false }: OrdersSkeletonProps) {
  const table = (
    <Card>
      {!compact && (
        <CardHeader className="space-y-2">
          <div className="flex items-center gap-2">
            <Skeleton className="h-8 w-20" />
            <Skeleton className="h-8 w-20" />
          </div>
        </CardHeader>
      )}
      <CardContent className="space-y-3">
        {Array.from({ length: 6 }).map((_, index) => (
          <div
            key={`orders-row-skeleton-${index}`}
            className="grid grid-cols-[1.2fr_2fr_1fr_1fr_1.3fr_1fr] items-center gap-3"
          >
            <Skeleton className="h-4 w-32" />
            <div className="flex items-center gap-2">
              <Skeleton className="h-10 w-10" />
              <Skeleton className="h-4 w-44" />
            </div>
            <Skeleton className="h-4 w-16" />
            <Skeleton className="h-5 w-20" />
            <Skeleton className="h-4 w-28" />
            <div className="flex justify-end">
              <Skeleton className="h-8 w-20" />
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  )

  if (compact) {
    return table
  }

  return (
    <main className="space-y-6">
      <div className="space-y-2">
        <Skeleton className="h-7 w-28" />
        <Skeleton className="h-4 w-72" />
      </div>
      {table}
    </main>
  )
}
