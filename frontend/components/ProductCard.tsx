import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"

type ProductCardProps = {
  title?: string
  price?: string
  badge?: string
  condition?: string
}

export default function ProductCard({
  title = "Aurora 3x3",
  price = "$128",
  badge = "Rare",
  condition = "Lightly used",
}: ProductCardProps) {
  return (
    <Card className="overflow-hidden">
      <CardHeader className="space-y-3">
        <div className="aspect-[4/3] w-full rounded-md bg-muted" />
        <div className="flex items-center justify-between gap-2">
          <CardTitle className="text-base">{title}</CardTitle>
          <Badge variant="secondary">{badge}</Badge>
        </div>
        <p className="text-sm text-muted-foreground">{condition}</p>
      </CardHeader>
      <CardContent className="text-sm text-muted-foreground">
        Verified seller - Ships in 48h
      </CardContent>
      <CardFooter className="flex items-center justify-between">
        <span className="text-sm font-semibold text-foreground">{price}</span>
        <Button size="sm" variant="outline">
          View
        </Button>
      </CardFooter>
    </Card>
  )
}
