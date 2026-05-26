"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Checkbox } from "@/components/ui/checkbox"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Separator } from "@/components/ui/separator"
import { useFilter } from "@/hooks/filter/useFilter"
import { useRouter } from "next/navigation"

const ALL_OPTION = "__all__"

const labelMap: Record<string, string> = {
  gan: "GAN",
  moyu: "MoYu",
  qiyi: "QiYi",
  se: "SE",
  uv: "UV",
  maglev: "MagLev",
  magcore: "MagCore",
  ballcore8m: "BallCore 8M",
  ballcore20m: "BallCore 20M",
}

function formatLabel(value: string) {
  return (
    labelMap[value] ??
    value
      .replace(/_/g, " ")
      .replace(/\b\w/g, (character) => character.toUpperCase())
  )
}

interface ProductFilterCardProps {
  variant?: "quick" | "full"
}

export default function ProductFilterCard({
  variant = "full",
}: ProductFilterCardProps) {
  const router = useRouter()
  const {
    brands,
    categories,
    specs,
    filters,
    sortBy,
    loading,
    error,
    setSearch,
    setMinPrice,
    setMaxPrice,
    setBrandId,
    setCategoryId,
    setEdition,
    setCoatedType,
    setMagnetType,
    setSpringType,
    setCoreMaterial,
    toggleCustomizationType,
  } = useFilter()

  const isQuickVariant = variant === "quick"
  const handleApplyFilters = () => {
    router.push("/products")
  }

  return (
    <Card className={isQuickVariant ? "border-border" : "h-fit"}>
      <CardHeader>
        <CardTitle className="text-base">
          {isQuickVariant ? "Quick filters" : "Filters"}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor={`${variant}-search`}>Search</Label>
          <Input
            id={`${variant}-search`}
            placeholder="Search by name"
            value={filters.search}
            onChange={(event) => setSearch(event.target.value)}
            disabled={loading}
          />
        </div>

        <div className="space-y-2">
          <Label>Brand</Label>
          <Select
            value={filters.brandId || ALL_OPTION}
            onValueChange={(value) =>
              setBrandId(value === ALL_OPTION ? "" : value)
            }
            disabled={loading}
          >
            <SelectTrigger className="w-full">
              <SelectValue placeholder="All brands" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value={ALL_OPTION}>---</SelectItem>
              {brands.map((brand) => (
                <SelectItem key={brand.id} value={brand.id}>
                  {formatLabel(brand.name)}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label>Category</Label>
          <Select
            value={filters.categoryId || ALL_OPTION}
            onValueChange={(value) =>
              setCategoryId(value === ALL_OPTION ? "" : value)
            }
            disabled={loading}
          >
            <SelectTrigger className="w-full">
              <SelectValue placeholder="All categories" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value={ALL_OPTION}>---</SelectItem>
              {categories.map((category) => (
                <SelectItem key={category.id} value={category.id}>
                  {formatLabel(category.name)}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {!isQuickVariant && (
          <div className="space-y-2">
            <Label>Price range</Label>
            <div className="flex gap-2">
              <Input
                id={`${variant}-min-price`}
                placeholder="Min"
                type="number"
                min="0"
                step="1"
                value={filters.minPrice}
                onChange={(event) => setMinPrice(event.target.value)}
                disabled={loading}
              />
              <Input
                id={`${variant}-max-price`}
                placeholder="Max"
                type="number"
                min="0"
                step="1"
                value={filters.maxPrice}
                onChange={(event) => setMaxPrice(event.target.value)}
                disabled={loading}
              />
            </div>
          </div>
        )}

        {!isQuickVariant && (
          <>
            <div className="space-y-2">
              <Label>Edition</Label>
              <Select
                value={filters.edition || ALL_OPTION}
                onValueChange={(value) =>
                  setEdition(value === ALL_OPTION ? "" : value)
                }
                disabled={loading || !specs}
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="All editions" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value={ALL_OPTION}>---</SelectItem>
                  {specs?.edition.map((edition) => (
                    <SelectItem key={edition} value={edition}>
                      {formatLabel(edition)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </>
        )}

        {!isQuickVariant && (
          <>
            <div className="space-y-2">
              <Label>Coated type</Label>
              <Select
                value={filters.coatedType || ALL_OPTION}
                onValueChange={(value) =>
                  setCoatedType(value === ALL_OPTION ? "" : value)
                }
                disabled={loading || !specs}
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="All coated types" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value={ALL_OPTION}>---</SelectItem>
                  {specs?.coated_types.map((coatedType) => (
                    <SelectItem key={coatedType} value={coatedType}>
                      {formatLabel(coatedType)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Magnet type</Label>
              <Select
                value={filters.magnetType || ALL_OPTION}
                onValueChange={(value) =>
                  setMagnetType(value === ALL_OPTION ? "" : value)
                }
                disabled={loading || !specs}
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="All magnet types" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value={ALL_OPTION}>---</SelectItem>
                  {specs?.magnet_types.map((magnetType) => (
                    <SelectItem key={magnetType} value={magnetType}>
                      {formatLabel(magnetType)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Spring type</Label>
              <Select
                value={filters.springType || ALL_OPTION}
                onValueChange={(value) =>
                  setSpringType(value === ALL_OPTION ? "" : value)
                }
                disabled={loading || !specs}
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="All spring types" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value={ALL_OPTION}>---</SelectItem>
                  {specs?.spring_types.map((springType) => (
                    <SelectItem key={springType} value={springType}>
                      {formatLabel(springType)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Core material</Label>
              <Select
                value={filters.coreMaterial || ALL_OPTION}
                onValueChange={(value) =>
                  setCoreMaterial(value === ALL_OPTION ? "" : value)
                }
                disabled={loading || !specs}
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="All core materials" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value={ALL_OPTION}>---</SelectItem>
                  {specs?.core_materials.map((coreMaterial) => (
                    <SelectItem key={coreMaterial} value={coreMaterial}>
                      {formatLabel(coreMaterial)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <Separator />

            <div className="space-y-3">
              <p className="text-sm font-medium text-foreground">
                Customization types
              </p>
              <div className="grid gap-3">
                {specs?.customization_types.map((customizationType) => {
                  const checkboxId = `${variant}-${customizationType}`

                  return (
                    <div
                      key={customizationType}
                      className="flex items-center gap-2"
                    >
                      <Checkbox
                        id={checkboxId}
                        checked={filters.customizationTypes.includes(
                          customizationType
                        )}
                        onCheckedChange={() =>
                          toggleCustomizationType(customizationType)
                        }
                        disabled={loading}
                      />
                      <Label htmlFor={checkboxId} className="text-sm">
                        {formatLabel(customizationType)}
                      </Label>
                    </div>
                  )
                })}
              </div>
            </div>
          </>
        )}

        {error && <p className="text-sm text-destructive">{error}</p>}

        {isQuickVariant && (
          <Button
            variant="default"
            className="w-full"
            disabled={loading}
            onClick={handleApplyFilters}
          >
            View filters
          </Button>
        )}
      </CardContent>
    </Card>
  )
}
