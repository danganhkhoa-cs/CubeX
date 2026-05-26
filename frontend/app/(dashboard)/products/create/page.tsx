"use client"

import { useEffect, useRef, useState } from "react"
import type { ChangeEvent } from "react"

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
import { useFilter } from "@/hooks/filter/useFilter"
import { productService } from "@/service/products"
import { toast } from "sonner"

const EMPTY_OPTION = "__empty__"

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

export default function Page() {
  const { brands, categories, specs, loading, error } = useFilter()
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
  const [mainImage, setMainImage] = useState<File | null>(null)
  const [mainImagePreview, setMainImagePreview] = useState<string | null>(null)
  const [moreImages, setMoreImages] = useState<File[]>([])
  const [moreImagePreviews, setMoreImagePreviews] = useState<string[]>([])
  const [submitting, setSubmitting] = useState(false)
  const [formError, setFormError] = useState<string | null>(null)
  const [uploadError, setUploadError] = useState<string | null>(null)
  const mainImageInputRef = useRef<HTMLInputElement | null>(null)
  const moreImagesInputRef = useRef<HTMLInputElement | null>(null)

  useEffect(() => {
    return () => {
      if (mainImagePreview) {
        URL.revokeObjectURL(mainImagePreview)
      }
      moreImagePreviews.forEach((preview) => URL.revokeObjectURL(preview))
    }
  }, [mainImagePreview, moreImagePreviews])

  const toggleCustomizationType = (value: string) => {
    setCustomizationTypes((current) => {
      const exists = current.includes(value)
      return exists
        ? current.filter((item) => item !== value)
        : [...current, value]
    })
  }

  const handleMainImageChange = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]

    if (mainImagePreview) {
      URL.revokeObjectURL(mainImagePreview)
    }

    if (!file) {
      setMainImage(null)
      setMainImagePreview(null)
      return
    }

    setMainImage(file)
    setMainImagePreview(URL.createObjectURL(file))
  }

  const handleMoreImagesChange = (event: ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files ?? [])

    if (files.length === 0) {
      return
    }

    const previews = files.map((file) => URL.createObjectURL(file))
    setMoreImages((current) => [...current, ...files])
    setMoreImagePreviews((current) => [...current, ...previews])

    if (moreImagesInputRef.current) {
      moreImagesInputRef.current.value = ""
    }
  }

  const removeMainImage = () => {
    if (mainImagePreview) {
      URL.revokeObjectURL(mainImagePreview)
    }
    setMainImage(null)
    setMainImagePreview(null)
    if (mainImageInputRef.current) {
      mainImageInputRef.current.value = ""
    }
  }

  const removeMoreImage = (index: number) => {
    setMoreImages((current) => current.filter((_, i) => i !== index))
    setMoreImagePreviews((current) => {
      const preview = current[index]
      if (preview) {
        URL.revokeObjectURL(preview)
      }
      return current.filter((_, i) => i !== index)
    })
  }

  const handleSubmit = async () => {
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

    if (!mainImage) {
      setFormError("Add a main image.")
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
      const uploadFiles = [mainImage, ...moreImages].filter(
        (file): file is File => Boolean(file)
      )
      const { urls, errors: uploadErrors } =
        await productService.uploadImages(uploadFiles)

      if (uploadErrors && uploadErrors.length > 0) {
        setUploadError("Some images failed to upload.")
      }

      await productService.createProduct({
        title: trimmedTitle,
        price: Math.round(priceValue * 100),
        brand_id: brandId,
        category_id: categoryId,
        images: urls,
        description: description.trim() || null,
        specs: Object.keys(specsPayload).length > 0 ? specsPayload : null,
      })

      toast.success("Listing created")

      setTitle("")
      setPrice("")
      setBrandId("")
      setCategoryId("")
      setDescription("")
      setEdition("")
      setCoatedType("")
      setMagnetType("")
      setSpringType("")
      setCoreMaterial("")
      setCustomizationTypes([])
      removeMainImage()
      setMoreImages([])
      moreImagePreviews.forEach((preview) => URL.revokeObjectURL(preview))
      setMoreImagePreviews([])
    } catch (err) {
      setFormError(
        err instanceof Error ? err.message : "Failed to create listing."
      )
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <main className="space-y-6">
      <header>
        <h1 className="text-2xl font-semibold">Create listing</h1>
        <p className="text-sm text-muted-foreground">
          Share your Rubik's cube with full specs and trusted seller details.
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
                disabled={submitting}
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
                disabled={submitting}
              />
            </div>
            <div className="space-y-2">
              <Label>Brand</Label>
              <Select
                value={brandId || EMPTY_OPTION}
                onValueChange={(value) =>
                  setBrandId(value === EMPTY_OPTION ? "" : value)
                }
                disabled={loading || submitting}
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
                disabled={loading || submitting}
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
              disabled={submitting}
            />
          </div>

          <Separator />

          <div className="space-y-4">
            <div className="space-y-3">
              <Label>Main image</Label>
              <div className="flex flex-col gap-3 md:flex-row md:items-center">
                <Input
                  ref={mainImageInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleMainImageChange}
                  disabled={submitting}
                  className="md:flex-1"
                />
                {mainImage && (
                  <Button
                    type="button"
                    variant="destructive"
                    onClick={removeMainImage}
                    disabled={submitting}
                    className="md:w-40"
                  >
                    Remove
                  </Button>
                )}
              </div>
              {mainImagePreview && (
                <div
                  className="aspect-4/3 w-full max-w-xs rounded-md bg-muted bg-cover bg-center"
                  style={{ backgroundImage: `url(${mainImagePreview})` }}
                />
              )}
            </div>

            <div className="space-y-3">
              <Label>More images</Label>
              <Input
                ref={moreImagesInputRef}
                type="file"
                accept="image/*"
                multiple
                onChange={handleMoreImagesChange}
                disabled={submitting}
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
                        disabled={submitting}
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
                  disabled={loading || !specs || submitting}
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
                  disabled={loading || !specs || submitting}
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
                  disabled={loading || !specs || submitting}
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
                  disabled={loading || !specs || submitting}
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
                  disabled={loading || !specs || submitting}
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
                        disabled={loading || submitting}
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

          {error && <p className="text-sm text-destructive">{error}</p>}
          {formError && <p className="text-sm text-destructive">{formError}</p>}

          <Button
            className="w-full"
            onClick={handleSubmit}
            disabled={submitting || loading}
          >
            {submitting ? "Creating..." : "Create listing"}
          </Button>
        </CardContent>
      </Card>
    </main>
  )
}
