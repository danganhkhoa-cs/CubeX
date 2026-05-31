import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Item, ItemGroup } from "@/components/ui/item"
import { Separator } from "@/components/ui/separator"
import { Skeleton } from "@/components/ui/skeleton"

export default function CartSkeleton() {
  return (
    <main className="space-y-6">
      <div className="space-y-2">
        <Skeleton className="h-7 w-32" />
        <Skeleton className="h-4 w-64" />
      </div>

      <Card>
        <CardHeader className="space-y-2">
          <Skeleton className="h-4 w-28" />
        </CardHeader>
        <CardContent>
          <Skeleton className="h-8 w-32" />
        </CardContent>
      </Card>

      <div className="space-y-6">
        {Array.from({ length: 2 }).map((_, groupIndex) => (
          <Card key={`cart-group-skeleton-${groupIndex}`}>
            <CardHeader className="space-y-3">
              <div className="flex items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <Skeleton className="h-4 w-4" />
                  <Skeleton className="h-4 w-28" />
                </div>
                <Skeleton className="h-3 w-16" />
              </div>
              <Separator />
            </CardHeader>
            <CardContent>
              <ItemGroup>
                {Array.from({ length: 3 }).map((_, itemIndex) => (
                  <Item
                    key={`cart-item-skeleton-${groupIndex}-${itemIndex}`}
                    variant="outline"
                  >
                    <Skeleton className="h-4 w-4" />
                    <Skeleton className="h-10 w-10" />
                    <div className="flex flex-1 flex-col gap-2">
                      <Skeleton className="h-4 w-40" />
                      <div className="flex items-center gap-2">
                        <Skeleton className="h-4 w-16" />
                        <Skeleton className="h-4 w-20" />
                      </div>
                    </div>
                    <Skeleton className="ml-auto h-4 w-16" />
                  </Item>
                ))}
              </ItemGroup>
            </CardContent>
          </Card>
        ))}
      </div>
    </main>
  )
}
