import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { Skeleton } from "@/components/ui/skeleton"

export default function UpdateProductSkeleton() {
  return (
    <main className="space-y-6">
      <Skeleton className="h-8 w-20" />

      <div className="space-y-2">
        <Skeleton className="h-7 w-40" />
        <Skeleton className="h-4 w-72" />
      </div>

      <Card>
        <CardHeader>
          <Skeleton className="h-5 w-28" />
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Skeleton className="h-4 w-12" />
              <Skeleton className="h-10 w-full" />
            </div>
            <div className="space-y-2">
              <Skeleton className="h-4 w-12" />
              <Skeleton className="h-10 w-full" />
            </div>
            <div className="space-y-2">
              <Skeleton className="h-4 w-12" />
              <Skeleton className="h-10 w-full" />
            </div>
            <div className="space-y-2">
              <Skeleton className="h-4 w-16" />
              <Skeleton className="h-10 w-full" />
            </div>
          </div>

          <div className="space-y-2">
            <Skeleton className="h-4 w-20" />
            <Skeleton className="h-28 w-full" />
          </div>

          <Separator />

          <div className="space-y-4">
            <Skeleton className="h-4 w-24" />
            <div className="grid gap-3 sm:grid-cols-3">
              {Array.from({ length: 3 }).map((_, index) => (
                <Skeleton
                  key={`existing-image-skeleton-${index}`}
                  className="aspect-4/3 w-full rounded-md"
                />
              ))}
            </div>
            <Skeleton className="h-10 w-full" />
          </div>

          <Separator />

          <div className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              {Array.from({ length: 5 }).map((_, index) => (
                <div
                  key={`spec-field-skeleton-${index}`}
                  className="space-y-2"
                >
                  <Skeleton className="h-4 w-24" />
                  <Skeleton className="h-10 w-full" />
                </div>
              ))}
            </div>
            <div className="grid gap-3 sm:grid-cols-2">
              {Array.from({ length: 4 }).map((_, index) => (
                <div
                  key={`spec-checkbox-skeleton-${index}`}
                  className="flex items-center gap-2"
                >
                  <Skeleton className="h-4 w-4" />
                  <Skeleton className="h-4 w-32" />
                </div>
              ))}
            </div>
          </div>

          <Skeleton className="h-10 w-full" />
        </CardContent>
      </Card>
    </main>
  )
}

