import { Skeleton } from "@/components/ui/skeleton"
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card"

export default function ProductCardSkeleton() {
  return (
    <Card className="flex h-full flex-col overflow-hidden">
      <CardHeader className="space-y-3">
        <Skeleton className="aspect-4/3 w-full rounded-md" />
        <div className="flex items-start justify-between gap-2">
          <div className="flex-1 space-y-2">
            <Skeleton className="h-5 w-3/4" />
            <Skeleton className="h-4 w-1/2" />
          </div>
          <div className="flex flex-col items-start gap-1">
            <Skeleton className="h-5 w-16" />
            <Skeleton className="h-5 w-20" />
          </div>
        </div>
      </CardHeader>
      <CardContent className="flex-1">
        <div className="flex flex-wrap gap-2">
          <Skeleton className="h-5 w-16" />
          <Skeleton className="h-5 w-20" />
          <Skeleton className="h-5 w-14" />
        </div>
      </CardContent>
      <CardFooter className="flex flex-col gap-2">
        <Skeleton className="h-7 w-24" />
        <Skeleton className="h-9 w-full" />
      </CardFooter>
    </Card>
  )
}
