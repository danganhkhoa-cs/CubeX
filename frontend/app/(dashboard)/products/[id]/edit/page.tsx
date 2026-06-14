"use client"

import { useEffect, useMemo, useRef, useState } from "react"
import type { ChangeEvent } from "react"
import { useParams, useRouter, useSearchParams } from "next/navigation"
import { ArrowLeft } from "lucide-react"
import { toast } from "sonner"

import UpdateProductSkeleton from "@/components/UpdateProductSkeleton"
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
import { Textarea } from "@/components/ui/textarea"
import { useAuth } from "@/hooks/auth/useAuth"
import { useFilter } from "@/hooks/filter/useFilter"
import { productService } from "@/service/products"
import type { ProductDetail } from "@/service/products/types"
import { Spinner } from "@/components/ui/spinner"

const EMPTY_OPTION = "__empty__"

function formatLabel(value: string) {
  if (!value) return value
  return value.charAt(0).toUpperCase() + value.slice(1)
}

function getSpecString(
  specs: Record<string, string | string[]> | undefined,
  key: string
) {
  const value = specs?.[key]
  return typeof value === "string" ? value : ""
}

function getSpecStringArray(
  specs: Record<string, string | string[]> | undefined,
  key: string
) {
  const value = specs?.[key]
  if (!Array.isArray(value)) return []
  return value.filter((item): item is string => typeof item === "string")
}

export default function EditProductPage() {
  const params = useParams<{ id: string }>()
  const router = useRouter()
  const searchParams = useSearchParams()
  const productId = Array.isArray(params?.id) ? params.id[0] : params?.id
  const returnTo = searchParams.get("returnTo") || ""

  const { user, loading: authLoading } = useAuth()
  const { brands, categories, specs, loading, error } = useFilter()

  const [product, setProduct] = useState<ProductDetail | null>(null)
  const [pageLoading, setPageLoading] = useState(true)
  const [pageError, setPageError] = useState<string | null>(null)

  const [title, setTitle] = useState("")
  const [price, setPrice] = useState("")
  const [brandId, setBrandId] = useState("")
  const [categoryId, setCategoryId] = useState("")
  const [description, setDescription] = useState("")
  const [edition, setEdition] = useState("")
  const [coatedType, setCoatedType] = useState("")
  const [magnetType, setMagnetType] = useState("")
  const [springType, setSpringType] = useState("")
  const [coreMaterial, setCoreMaterial] = useState("")
  const [customizationTypes, setCustomizationTypes] = useState<string[]>([])
  const [existingImages, setExistingImages] = useState<string[]>([])
  const [moreImages, setMoreImages] = useState<File[]>([])
  const [moreImagePreviews, setMoreImagePreviews] = useState<string[]>([])
  const [submitting, setSubmitting] = useState(false)
  const [formError, setFormError] = useState<string | null>(null)
  const [uploadError, setUploadError] = useState<string | null>(null)
  const moreImagesInputRef = useRef<HTMLInputElement | null>(null)
  const previewUrlsRef = useRef<string[]>([])

  const isOwnProfile = product?.seller_id === user?.user_id
  const isUnavailable = !!product && (product.is_sold || product.is_deleted)

  const defaultBackPath = useMemo(() => {
    if (productId) {
      return `/products/${productId}`
    }
    return "/products"
  }, [productId])

  useEffect(() => {
    return () => {
      previewUrlsRef.current.forEach((preview) => URL.revokeObjectURL(preview))
    }
  }, [])

  useEffect(() => {
    let mounted = true

    async function loadProduct() {
      if (!productId) {
        if (mounted) {
          setPageError("Product ID is required.")
          setPageLoading(false)
        }
        return
      }

      setPageLoading(true)
      setPageError(null)

      try {
        const data = await productService.getProductById(productId)
        if (!mounted) return

        setProduct(data)
        setTitle(data.title)
        setPrice((data.price / 100).toString())
        setBrandId(data.brand_id)
        setCategoryId(data.category_id)
        setDescription(data.description || "")
        setExistingImages(data.images || [])
        setEdition(getSpecString(data.specs, "edition"))
        setCoatedType(getSpecString(data.specs, "coated_type"))
        setMagnetType(getSpecString(data.specs, "magnet_type"))
        setSpringType(getSpecString(data.specs, "spring_type"))
        setCoreMaterial(getSpecString(data.specs, "core_material"))
        setCustomizationTypes(
          getSpecStringArray(data.specs, "customization_types")
        )
      } catch (requestError) {
        if (mounted) {
          setPageError(
            requestError instanceof Error
              ? requestError.message
              : "Failed to load product"
          )
        }
      } finally {
        if (mounted) {
          setPageLoading(false)
        }
      }
    }

    loadProduct()

    return () => {
      mounted = false
    }
  }, [productId])

  const toggleCustomizationType = (value: string) => {
    setCustomizationTypes((current) => {
      const exists = current.includes(value)
      return exists
        ? current.filter((item) => item !== value)
        : [...current, value]
    })
  }

  const handleMoreImagesChange = (event: ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files ?? [])
    if (files.length === 0) {
      return
    }

    const previews = files.map((file) => URL.createObjectURL(file))
    setMoreImages((current) => [...current, ...files])
    setMoreImagePreviews((current) => {
      const next = [...current, ...previews]
      previewUrlsRef.current = next
      return next
    })

    if (moreImagesInputRef.current) {
      moreImagesInputRef.current.value = ""
    }
  }

  const removeExistingImage = (index: number) => {
    setExistingImages((current) => current.filter((_, i) => i !== index))
  }

  const removeMoreImage = (index: number) => {
    setMoreImages((current) => current.filter((_, i) => i !== index))
    setMoreImagePreviews((current) => {
      const preview = current[index]
      if (preview) {
        URL.revokeObjectURL(preview)
      }
      const next = current.filter((_, i) => i !== index)
      previewUrlsRef.current = next
      return next
    })
  }

  const handleSubmit = async () => {
    if (!product || !productId) return
    if (!isOwnProfile) {
      setFormError("You can only update your own listing.")
      return
    }
    if (isUnavailable) {
      setFormError("This listing can no longer be updated.")
      return
    }

    setFormError(null)

    const trimmedTitle = title.trim()
    const priceValue = Number(price)

    if (!trimmedTitle) {
      setFormError("Title is required.")
      return
    }

    if (!price || Number.isNaN(priceValue) || priceValue <= 0) {
      setFormError("Enter a valid price.")
      return
    }

    if (!brandId) {
      setFormError("Select a brand.")
      return
    }

    if (!categoryId) {
      setFormError("Select a category.")
      return
    }

    const specsPayload: Record<string, string | string[]> = {}

    if (edition) specsPayload.edition = edition
    if (coatedType) specsPayload.coated_type = coatedType
    if (magnetType) specsPayload.magnet_type = magnetType
    if (springType) specsPayload.spring_type = springType
    if (coreMaterial) specsPayload.core_material = coreMaterial
    if (customizationTypes.length > 0) {
      specsPayload.customization_types = customizationTypes
    }

    setSubmitting(true)

    try {
      setUploadError(null)

      let uploadedUrls: string[] = []
      if (moreImages.length > 0) {
        const { urls, errors: uploadErrors } =
          await productService.uploadImages(moreImages)
        uploadedUrls = urls
        if (uploadErrors && uploadErrors.length > 0) {
          setUploadError("Some new images failed to upload.")
        }
      }

      const finalImages = [...existingImages, ...uploadedUrls]
      if (finalImages.length === 0) {
        setFormError("Add at least one image.")
        return
      }

      await productService.updateProduct(productId, {
        title: trimmedTitle,
        price: Math.round(priceValue * 100),
        brand_id: brandId,
        category_id: categoryId,
        images: finalImages,
        description: description.trim() || null,
        specs: Object.keys(specsPayload).length > 0 ? specsPayload : null,
      })

      toast.success("Listing updated")
      const destination = returnTo || defaultBackPath
      router.push(destination)
    } catch (requestError) {
      setFormError(
        requestError instanceof Error
          ? requestError.message
          : "Failed to update listing."
      )
    } finally {
      setSubmitting(false)
    }
  }

  if (authLoading || pageLoading) {
    return <UpdateProductSkeleton />
  }

  if (pageError || !product) {
    return (
      <main className="space-y-6">
        <Card>
          <CardContent className="p-6 text-sm text-destructive">
            {pageError || "Product not found."}
          </CardContent>
        </Card>
      </main>
    )
  }

  if (!isOwnProfile) {
    return (
      <main className="space-y-6">
        <Card>
          <CardContent className="p-6 text-sm text-destructive">
            You can only update your own listing.
          </CardContent>
        </Card>
      </main>
    )
  }

  return (
    <main className="space-y-6">
      <Button
        variant="ghost"
        size="sm"
        className="inline-flex items-center gap-2"
        onClick={() => router.push(returnTo || defaultBackPath)}
      >
        <ArrowLeft className="size-4" />
        Back
      </Button>

      <header>
        <h1 className="text-2xl font-semibold">Update listing</h1>
        <p className="text-sm text-muted-foreground">
          Edit your listing details, images, and specs.
        </p>
      </header>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Listing details</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="title">Title</Label>
              <Input
                id="title"
                placeholder="Name of your cube"
                value={title}
                onChange={(event) => setTitle(event.target.value)}
                disabled={submitting || isUnavailable}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="price">Price</Label>
              <Input
                id="price"
                type="number"
                min="0"
                step="0.01"
                placeholder="120"
                value={price}
                onChange={(event) => setPrice(event.target.value)}
                disabled={submitting || isUnavailable}
              />
            </div>
            <div className="space-y-2">
              <Label>Brand</Label>
              <Select
                value={brandId || EMPTY_OPTION}
                onValueChange={(value) =>
                  setBrandId(value === EMPTY_OPTION ? "" : value)
                }
                disabled={loading || submitting || isUnavailable}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select brand" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value={EMPTY_OPTION}>----------</SelectItem>
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
                value={categoryId || EMPTY_OPTION}
                onValueChange={(value) =>
                  setCategoryId(value === EMPTY_OPTION ? "" : value)
                }
                disabled={loading || submitting || isUnavailable}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select category" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value={EMPTY_OPTION}>----------</SelectItem>
                  {categories.map((category) => (
                    <SelectItem key={category.id} value={category.id}>
                      {formatLabel(category.name)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              rows={5}
              placeholder="Share the story, condition, and shipping details."
              value={description}
              onChange={(event) => setDescription(event.target.value)}
              disabled={submitting || isUnavailable}
            />
          </div>

          <Separator />

          <div className="space-y-4">
            <div className="space-y-3">
              <Label>Current images</Label>
              {existingImages.length > 0 ? (
                <div className="grid gap-3 sm:grid-cols-3">
                  {existingImages.map((imageUrl, index) => (
                    <div key={`${imageUrl}-${index}`} className="space-y-2">
                      <div
                        className="aspect-4/3 rounded-md bg-muted bg-cover bg-center"
                        style={{ backgroundImage: `url(${imageUrl})` }}
                      />
                      <Button
                        type="button"
                        variant="destructive"
                        size="sm"
                        className="w-full"
                        onClick={() => removeExistingImage(index)}
                        disabled={submitting || isUnavailable}
                      >
                        Remove
                      </Button>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-muted-foreground">
                  No current images.
                </p>
              )}
            </div>

            <div className="space-y-3">
              <Label>Add more images</Label>
              <Input
                ref={moreImagesInputRef}
                type="file"
                accept="image/*"
                multiple
                onChange={handleMoreImagesChange}
                disabled={submitting || isUnavailable}
              />
              {moreImagePreviews.length > 0 && (
                <div className="grid gap-3 sm:grid-cols-3">
                  {moreImagePreviews.map((preview, index) => (
                    <div key={preview} className="space-y-2">
                      <div
                        className="aspect-4/3 rounded-md bg-muted bg-cover bg-center"
                        style={{ backgroundImage: `url(${preview})` }}
                      />
                      <Button
                        type="button"
                        variant="destructive"
                        size="sm"
                        className="w-full"
                        onClick={() => removeMoreImage(index)}
                        disabled={submitting || isUnavailable}
                      >
                        Remove
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {uploadError && (
              <p className="text-sm text-destructive">{uploadError}</p>
            )}
          </div>

          <Separator />

          <div className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label>Edition</Label>
                <Select
                  value={edition || EMPTY_OPTION}
                  onValueChange={(value) =>
                    setEdition(value === EMPTY_OPTION ? "" : value)
                  }
                  disabled={loading || !specs || submitting || isUnavailable}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select edition" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value={EMPTY_OPTION}>----------</SelectItem>
                    {specs?.edition.map((value) => (
                      <SelectItem key={value} value={value}>
                        {formatLabel(value)}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Coated type</Label>
                <Select
                  value={coatedType || EMPTY_OPTION}
                  onValueChange={(value) =>
                    setCoatedType(value === EMPTY_OPTION ? "" : value)
                  }
                  disabled={loading || !specs || submitting || isUnavailable}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select coated type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value={EMPTY_OPTION}>----------</SelectItem>
                    {specs?.coated_types.map((value) => (
                      <SelectItem key={value} value={value}>
                        {formatLabel(value)}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Magnet type</Label>
                <Select
                  value={magnetType || EMPTY_OPTION}
                  onValueChange={(value) =>
                    setMagnetType(value === EMPTY_OPTION ? "" : value)
                  }
                  disabled={loading || !specs || submitting || isUnavailable}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select magnet type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value={EMPTY_OPTION}>----------</SelectItem>
                    {specs?.magnet_types.map((value) => (
                      <SelectItem key={value} value={value}>
                        {formatLabel(value)}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Spring type</Label>
                <Select
                  value={springType || EMPTY_OPTION}
                  onValueChange={(value) =>
                    setSpringType(value === EMPTY_OPTION ? "" : value)
                  }
                  disabled={loading || !specs || submitting || isUnavailable}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select spring type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value={EMPTY_OPTION}>----------</SelectItem>
                    {specs?.spring_types.map((value) => (
                      <SelectItem key={value} value={value}>
                        {formatLabel(value)}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Core material</Label>
                <Select
                  value={coreMaterial || EMPTY_OPTION}
                  onValueChange={(value) =>
                    setCoreMaterial(value === EMPTY_OPTION ? "" : value)
                  }
                  disabled={loading || !specs || submitting || isUnavailable}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select core material" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value={EMPTY_OPTION}>----------</SelectItem>
                    {specs?.core_materials.map((value) => (
                      <SelectItem key={value} value={value}>
                        {formatLabel(value)}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-3">
              <p className="text-sm font-medium text-foreground">
                Customization types
              </p>
              <div className="grid gap-3 sm:grid-cols-2">
                {specs?.customization_types.map((customizationType) => {
                  const checkboxId = `customization-${customizationType}`

                  return (
                    <div
                      key={customizationType}
                      className="flex items-center gap-2"
                    >
                      <Checkbox
                        id={checkboxId}
                        checked={customizationTypes.includes(customizationType)}
                        onCheckedChange={() =>
                          toggleCustomizationType(customizationType)
                        }
                        disabled={loading || submitting || isUnavailable}
                      />
                      <Label htmlFor={checkboxId} className="text-sm">
                        {formatLabel(customizationType)}
                      </Label>
                    </div>
                  )
                })}
              </div>
            </div>
          </div>

          {isUnavailable && (
            <p className="text-sm text-destructive">
              Sold or deleted listings cannot be updated.
            </p>
          )}
          {error && <p className="text-sm text-destructive">{error}</p>}
          {formError && <p className="text-sm text-destructive">{formError}</p>}

          <Button
            className="w-full"
            onClick={handleSubmit}
            disabled={submitting || loading || isUnavailable}
          >
            {submitting ? (
              <span className="flex items-center gap-2">
                <Spinner />
                Updating...
              </span>
            ) : (
              "Update listing"
            )}
          </Button>
        </CardContent>
      </Card>
    </main>
  )
}
