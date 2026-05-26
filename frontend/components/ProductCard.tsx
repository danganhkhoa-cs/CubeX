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
  title: string
  price: number
  images?: string[]
  brandName?: string
  categoryName?: string
  sellerName?: string
  specs?: Record<string, string>
}

const specsLabels: Record<string, string> = {
  normal: "Normal",
  se: "SE",
  limited: "Limited",
  glossy: "Glossy",
  matte: "Matte",
  uv: "UV",
  none: "None",
  standard: "Standard",
  plastic: "Plastic core",
  metal: "Metal core",
}

const specsCustomizationLabels: Record<string, string> = {
  magcore: "CUST: MagCore",
  ballcore8m: "CUST: BallCore 8M",
  ballcore20m: "CUST: BallCore 20M",
  maglev: "CUST: MagLev",
  uv: "CUST: UV",
  other: "CUST: Other",
}

export default function ProductCard({
  title,
  price,
  images,
  brandName,
  categoryName,
  specs,
}: ProductCardProps) {
  const priceLabel = (price / 100).toLocaleString("en-US", {
    style: "currency",
    currency: "USD",
  })

  return (
    <Card className="flex h-full flex-col overflow-hidden">
      <CardHeader className="space-y-3">
        <div
          className="aspect-4/3 w-full rounded-md bg-muted bg-cover bg-center"
          style={{ backgroundImage: `url(${images?.[0] ?? ""})` }}
        />
        <div className="flex items-start justify-between gap-2">
          <CardTitle className="text-base">{title}</CardTitle>
          <div className="flex flex-col items-start gap-1">
            <Badge variant="secondary">{brandName?.toUpperCase() ?? ""}</Badge>
            <Badge variant="ghost">{categoryName}</Badge>
          </div>
        </div>
      </CardHeader>
      <CardContent className="flex-1 text-sm text-muted-foreground">
        {specs && (
          <div className="flex flex-wrap gap-2">
            {Object.entries(specs).map(([k, v]) => {
              if (k === "customization_types") {
                const label = specsCustomizationLabels[v] || v
                return (
                  <Badge key={k} variant="outline">
                    {label}
                  </Badge>
                )
              } else {
                const label = specsLabels[v] || v
                return (
                  <Badge key={k} variant="outline">
                    {label}
                  </Badge>
                )
              }
            })}
          </div>
        )}
      </CardContent>
      <CardFooter className="flex flex-col gap-4">
        <span className="block text-lg font-bold text-foreground">
          {priceLabel}
        </span>
        <Button
          size="sm"
          variant="default"
          className="text-md w-full font-extrabold"
        >
          Add to cart
        </Button>
      </CardFooter>
    </Card>
  )
}
