"use client"

import { useCallback, useEffect, useMemo, useState } from "react"
import {
  AlertTriangle,
  CircleDollarSign,
  Plus,
  RefreshCw,
  Save,
  X,
} from "lucide-react"
import { toast } from "sonner"

import { useAuth } from "@/hooks/auth/useAuth"
import { adminService } from "@/service/admin"
import type { AdminConfigRow } from "@/service/admin/types"
import { productService } from "@/service/products"
import type { ProductBrand, ProductCategory } from "@/service/products/types"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Separator } from "@/components/ui/separator"
import { Skeleton } from "@/components/ui/skeleton"
import { Textarea } from "@/components/ui/textarea"

const SPEC_KEYS = [
  "edition",
  "coated_types",
  "magnet_types",
  "spring_types",
  "core_materials",
  "customization_types",
] as const

type SpecKey = (typeof SPEC_KEYS)[number]

type PlatformFeeDraft = {
  percent: string
  min_fee: string
}

type WalletDraft = {
  escrow_wallet_id: string
  admin_wallet_id: string
}

type CatalogAction =
  | "brand-update"
  | "brand-delete"
  | "category-update"
  | "category-delete"

type SpecsDraft = Record<SpecKey, string[]>
type SpecInputDraft = Record<SpecKey, string>

const SPEC_LABELS: Record<SpecKey, string> = {
  edition: "Edition",
  coated_types: "Coated types",
  magnet_types: "Magnet types",
  spring_types: "Spring types",
  core_materials: "Core materials",
  customization_types: "Customization types",
}

function isObjectRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value)
}

function createEmptySpecs(): SpecsDraft {
  return {
    edition: [],
    coated_types: [],
    magnet_types: [],
    spring_types: [],
    core_materials: [],
    customization_types: [],
  }
}

function createEmptySpecInputs(): SpecInputDraft {
  return {
    edition: "",
    coated_types: "",
    magnet_types: "",
    spring_types: "",
    core_materials: "",
    customization_types: "",
  }
}

function parseStringArray(value: unknown): string[] {
  if (!Array.isArray(value)) return []
  const values = value
    .map((item) => String(item).trim())
    .filter(Boolean)
    .filter((item, index, array) => array.indexOf(item) === index)
  return values
}

function parsePlatformFee(value: unknown): PlatformFeeDraft {
  if (!isObjectRecord(value)) {
    return { percent: "", min_fee: "" }
  }

  const minFee =
    value.min_fee === undefined || value.min_fee === null
      ? ""
      : String(Number(value.min_fee) / 100)

  return {
    percent:
      value.percent === undefined || value.percent === null
        ? ""
        : String(value.percent),
    min_fee: minFee,
  }
}

function parseWallets(value: unknown): WalletDraft {
  if (!isObjectRecord(value)) {
    return { escrow_wallet_id: "", admin_wallet_id: "" }
  }
  return {
    escrow_wallet_id:
      value.escrow_wallet_id === undefined || value.escrow_wallet_id === null
        ? ""
        : String(value.escrow_wallet_id),
    admin_wallet_id:
      value.admin_wallet_id === undefined || value.admin_wallet_id === null
        ? ""
        : String(value.admin_wallet_id),
  }
}

function parseSpecs(value: unknown): {
  specs: SpecsDraft
  extra: Record<string, unknown>
} {
  const specs = createEmptySpecs()
  const extra: Record<string, unknown> = {}

  if (!isObjectRecord(value)) {
    return { specs, extra }
  }

  for (const [key, keyValue] of Object.entries(value)) {
    if ((SPEC_KEYS as readonly string[]).includes(key)) {
      specs[key as SpecKey] = parseStringArray(keyValue)
    } else {
      extra[key] = keyValue
    }
  }

  return { specs, extra }
}

function normalizeSpecsForSave(specs: SpecsDraft): SpecsDraft {
  const next = createEmptySpecs()
  for (const key of SPEC_KEYS) {
    next[key] = parseStringArray(specs[key])
  }
  return next
}

function toJsonText(value: unknown) {
  return JSON.stringify(value, null, 2)
}

function formatDate(value?: string) {
  if (!value) return "-"
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return value
  return date.toLocaleString("en-US")
}

function areStringArraysEqual(a: string[], b: string[]) {
  if (a.length !== b.length) return false
  return a.every((value, index) => value === b[index])
}

function compareNameWithOtherLast(a: string, b: string) {
  const aTrimmed = a.trim()
  const bTrimmed = b.trim()
  const aIsOther = aTrimmed.toLowerCase() === "other"
  const bIsOther = bTrimmed.toLowerCase() === "other"

  if (aIsOther && !bIsOther) return 1
  if (!aIsOther && bIsOther) return -1

  return aTrimmed.localeCompare(bTrimmed, undefined, {
    sensitivity: "base",
  })
}

function SpecsField({
  field,
  values,
  inputValue,
  onInputChange,
  onAdd,
  onRemove,
}: {
  field: SpecKey
  values: string[]
  inputValue: string
  onInputChange: (value: string) => void
  onAdd: () => void
  onRemove: (value: string) => void
}) {
  return (
    <div className="space-y-3">
      <div className="space-y-2">
        <Label>{SPEC_LABELS[field]}</Label>
        {values.length > 0 ? (
          <div className="flex flex-wrap gap-2">
            {values.map((option) => (
              <Badge key={`${field}-${option}`} variant="outline">
                <span className="inline-flex items-center gap-1">
                  {option}
                  <button
                    type="button"
                    className="inline-flex cursor-pointer items-center"
                    onClick={() => onRemove(option)}
                    aria-label={`Remove ${option}`}
                  >
                    <X className="size-3" />
                  </button>
                </span>
              </Badge>
            ))}
          </div>
        ) : (
          <p className="text-sm text-muted-foreground">No options yet.</p>
        )}
      </div>
      <div className="flex items-end gap-2">
        <div className="flex-1 space-y-2">
          <Label htmlFor={`spec-input-${field}`}>Add option</Label>
          <Input
            id={`spec-input-${field}`}
            value={inputValue}
            onChange={(event) => onInputChange(event.target.value)}
            placeholder={`Add ${SPEC_LABELS[field].toLowerCase()} option`}
            className="border-b-transparent px-2 focus-visible:border-b-transparent"
          />
        </div>
        <Button type="button" variant="outline" onClick={onAdd}>
          <Plus />
          Add
        </Button>
      </div>
    </div>
  )
}

export default function AdminConfigPage() {
  const { user, loading: authLoading } = useAuth()

  const [configRows, setConfigRows] = useState<AdminConfigRow[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [savingId, setSavingId] = useState<string | null>(null)

  const [platformFee, setPlatformFee] = useState<PlatformFeeDraft>({
    percent: "",
    min_fee: "",
  })
  const [platformFeeBaseline, setPlatformFeeBaseline] =
    useState<PlatformFeeDraft>({
      percent: "",
      min_fee: "",
    })

  const [wallets, setWallets] = useState<WalletDraft>({
    escrow_wallet_id: "",
    admin_wallet_id: "",
  })
  const [walletsBaseline, setWalletsBaseline] = useState<WalletDraft>({
    escrow_wallet_id: "",
    admin_wallet_id: "",
  })

  const [specs, setSpecs] = useState<SpecsDraft>(createEmptySpecs())
  const [specsBaseline, setSpecsBaseline] =
    useState<SpecsDraft>(createEmptySpecs())
  const [specInputs, setSpecInputs] = useState<SpecInputDraft>(
    createEmptySpecInputs()
  )
  const [specsExtra, setSpecsExtra] = useState<Record<string, unknown>>({})

  const [brands, setBrands] = useState<ProductBrand[]>([])
  const [categories, setCategories] = useState<ProductCategory[]>([])
  const [newBrandName, setNewBrandName] = useState("")
  const [newCategoryName, setNewCategoryName] = useState("")
  const [brandSearch, setBrandSearch] = useState("")
  const [categorySearch, setCategorySearch] = useState("")
  const [brandRenameDrafts, setBrandRenameDrafts] = useState<
    Record<string, string>
  >({})
  const [categoryRenameDrafts, setCategoryRenameDrafts] = useState<
    Record<string, string>
  >({})
  const [catalogActionKey, setCatalogActionKey] = useState<string | null>(null)
  const [catalogConfirm, setCatalogConfirm] = useState<{
    action: CatalogAction
    id: string
  } | null>(null)

  const [otherDrafts, setOtherDrafts] = useState<Record<string, string>>({})
  const [otherBaseline, setOtherBaseline] = useState<Record<string, string>>({})

  const isAdmin = user?.role === "admin"

  const rowById = useMemo(() => {
    return Object.fromEntries(configRows.map((row) => [row.id, row]))
  }, [configRows])

  const loadConfig = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const [data, brandList, categoryList] = await Promise.all([
        adminService.getConfig(),
        productService.getBrands(),
        productService.getCategories(),
      ])
      setConfigRows(data)
      setBrands(brandList)
      setCategories(categoryList)
      setBrandRenameDrafts(
        Object.fromEntries(brandList.map((brand) => [brand.id, brand.name]))
      )
      setCategoryRenameDrafts(
        Object.fromEntries(
          categoryList.map((category) => [category.id, category.name])
        )
      )

      const platformRow = data.find((row) => row.id === "platform_fee")
      const walletRow = data.find((row) => row.id === "system_wallets")
      const specsRow = data.find((row) => row.id === "specs")

      const parsedPlatform = parsePlatformFee(platformRow?.value)
      setPlatformFee(parsedPlatform)
      setPlatformFeeBaseline(parsedPlatform)

      const parsedWallets = parseWallets(walletRow?.value)
      setWallets(parsedWallets)
      setWalletsBaseline(parsedWallets)

      const parsedSpecs = parseSpecs(specsRow?.value)
      setSpecs(parsedSpecs.specs)
      setSpecsBaseline(parsedSpecs.specs)
      setSpecsExtra(parsedSpecs.extra)
      setSpecInputs(createEmptySpecInputs())

      const nextOtherDrafts: Record<string, string> = {}
      for (const row of data) {
        if (
          row.id === "platform_fee" ||
          row.id === "system_wallets" ||
          row.id === "specs"
        ) {
          continue
        }
        nextOtherDrafts[row.id] = toJsonText(row.value)
      }
      setOtherDrafts(nextOtherDrafts)
      setOtherBaseline(nextOtherDrafts)
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Failed to load config"
      setError(message)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    if (authLoading || !isAdmin) return
    const timer = setTimeout(() => {
      void loadConfig()
    }, 0)
    return () => clearTimeout(timer)
  }, [authLoading, isAdmin, loadConfig])

  const platformFeeDirty = useMemo(() => {
    return (
      platformFee.percent !== platformFeeBaseline.percent ||
      platformFee.min_fee !== platformFeeBaseline.min_fee
    )
  }, [platformFee, platformFeeBaseline])

  const walletsDirty = useMemo(() => {
    return (
      wallets.escrow_wallet_id !== walletsBaseline.escrow_wallet_id ||
      wallets.admin_wallet_id !== walletsBaseline.admin_wallet_id
    )
  }, [wallets, walletsBaseline])

  const specsDirty = useMemo(() => {
    return SPEC_KEYS.some(
      (key) => !areStringArraysEqual(specs[key], specsBaseline[key])
    )
  }, [specs, specsBaseline])

  const otherRows = useMemo(() => {
    return configRows.filter(
      (row) =>
        row.id !== "platform_fee" &&
        row.id !== "system_wallets" &&
        row.id !== "specs"
    )
  }, [configRows])

  const filteredBrands = useMemo(() => {
    const keyword = brandSearch.trim().toLowerCase()
    const source = keyword
      ? brands.filter((brand) => brand.name.toLowerCase().includes(keyword))
      : brands
    return [...source].sort((a, b) => compareNameWithOtherLast(a.name, b.name))
  }, [brandSearch, brands])

  const filteredCategories = useMemo(() => {
    const keyword = categorySearch.trim().toLowerCase()
    const source = keyword
      ? categories.filter((category) =>
          category.name.toLowerCase().includes(keyword)
        )
      : categories
    return [...source].sort((a, b) => compareNameWithOtherLast(a.name, b.name))
  }, [categorySearch, categories])

  const isOtherDirty = useCallback(
    (id: string) => otherDrafts[id] !== otherBaseline[id],
    [otherBaseline, otherDrafts]
  )

  const savePlatformFee = async () => {
    const percent = Number(platformFee.percent)
    const minFee = Number(platformFee.min_fee)
    if (!Number.isFinite(percent) || !Number.isFinite(minFee)) {
      toast.error("Platform fee fields must be valid numbers")
      return
    }

    const payload = {
      percent: Math.trunc(percent),
      min_fee: Math.round(minFee * 100),
    }

    setSavingId("platform_fee")
    try {
      const updated = await adminService.updateConfig("platform_fee", payload)
      setConfigRows((prev) =>
        prev.map((row) => (row.id === updated.id ? updated : row))
      )
      const parsed = parsePlatformFee(updated.value)
      setPlatformFee(parsed)
      setPlatformFeeBaseline(parsed)
      toast.success('Updated "platform_fee"')
    } catch (err) {
      toast.error(
        err instanceof Error ? err.message : 'Failed to update "platform_fee"'
      )
    } finally {
      setSavingId(null)
    }
  }

  const saveWallets = async () => {
    if (!wallets.escrow_wallet_id.trim() || !wallets.admin_wallet_id.trim()) {
      toast.error("Both wallet ids are required")
      return
    }

    const payload = {
      escrow_wallet_id: wallets.escrow_wallet_id.trim(),
      admin_wallet_id: wallets.admin_wallet_id.trim(),
    }

    setSavingId("system_wallets")
    try {
      const updated = await adminService.updateConfig("system_wallets", payload)
      setConfigRows((prev) =>
        prev.map((row) => (row.id === updated.id ? updated : row))
      )
      const parsed = parseWallets(updated.value)
      setWallets(parsed)
      setWalletsBaseline(parsed)
      toast.success('Updated "system_wallets"')
    } catch (err) {
      toast.error(
        err instanceof Error ? err.message : 'Failed to update "system_wallets"'
      )
    } finally {
      setSavingId(null)
    }
  }

  const saveSpecs = async () => {
    const normalized = normalizeSpecsForSave(specs)
    const payload: Record<string, unknown> = {
      ...specsExtra,
    }

    for (const key of SPEC_KEYS) {
      payload[key] = normalized[key]
    }

    setSavingId("specs")
    try {
      const updated = await adminService.updateConfig("specs", payload)
      setConfigRows((prev) =>
        prev.map((row) => (row.id === updated.id ? updated : row))
      )
      const parsed = parseSpecs(updated.value)
      setSpecs(parsed.specs)
      setSpecsBaseline(parsed.specs)
      setSpecsExtra(parsed.extra)
      setSpecInputs(createEmptySpecInputs())
      toast.success('Updated "specs"')
    } catch (err) {
      toast.error(
        err instanceof Error ? err.message : 'Failed to update "specs"'
      )
    } finally {
      setSavingId(null)
    }
  }

  const saveOtherConfig = async (id: string) => {
    const raw = otherDrafts[id]
    let parsed: unknown
    try {
      parsed = JSON.parse(raw)
    } catch {
      toast.error(`Invalid JSON for "${id}"`)
      return
    }

    setSavingId(id)
    try {
      const updated = await adminService.updateConfig(id, parsed)
      setConfigRows((prev) =>
        prev.map((row) => (row.id === updated.id ? updated : row))
      )
      const nextText = toJsonText(updated.value)
      setOtherDrafts((prev) => ({ ...prev, [id]: nextText }))
      setOtherBaseline((prev) => ({ ...prev, [id]: nextText }))
      toast.success(`Updated "${id}"`)
    } catch (err) {
      toast.error(
        err instanceof Error ? err.message : `Failed to update "${id}"`
      )
    } finally {
      setSavingId(null)
    }
  }

  const addSpecOption = (field: SpecKey) => {
    const raw = specInputs[field].trim()
    if (!raw) return
    setSpecs((prev) => {
      if (prev[field].includes(raw)) return prev
      return { ...prev, [field]: [...prev[field], raw] }
    })
    setSpecInputs((prev) => ({ ...prev, [field]: "" }))
  }

  const removeSpecOption = (field: SpecKey, option: string) => {
    setSpecs((prev) => ({
      ...prev,
      [field]: prev[field].filter((value) => value !== option),
    }))
  }

  const refreshCatalog = useCallback(async () => {
    const [brandList, categoryList] = await Promise.all([
      productService.getBrands(),
      productService.getCategories(),
    ])
    setBrands(brandList)
    setCategories(categoryList)
    setBrandRenameDrafts(
      Object.fromEntries(brandList.map((brand) => [brand.id, brand.name]))
    )
    setCategoryRenameDrafts(
      Object.fromEntries(
        categoryList.map((category) => [category.id, category.name])
      )
    )
  }, [])

  const handleAddBrand = async () => {
    const name = newBrandName.trim()
    if (!name) {
      toast.error("Brand name is required")
      return
    }
    setCatalogActionKey("brand:add")
    try {
      await adminService.addBrand(name)
      setNewBrandName("")
      await refreshCatalog()
      toast.success("Brand added")
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to add brand")
    } finally {
      setCatalogActionKey(null)
    }
  }

  const handleRenameBrand = async (id: string) => {
    const newName = (brandRenameDrafts[id] || "").trim()
    if (!newName) {
      toast.error("Brand name is required")
      return
    }
    setCatalogActionKey(`brand:rename:${id}`)
    try {
      await adminService.renameBrand(id, newName)
      await refreshCatalog()
      toast.success("Brand updated")
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to update brand")
    } finally {
      setCatalogActionKey(null)
    }
  }

  const handleDeleteBrand = async (id: string) => {
    setCatalogActionKey(`brand:delete:${id}`)
    try {
      await adminService.deleteBrand(id)
      await refreshCatalog()
      toast.success("Brand deleted")
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to delete brand")
    } finally {
      setCatalogActionKey(null)
    }
  }

  const handleAddCategory = async () => {
    const name = newCategoryName.trim()
    if (!name) {
      toast.error("Category name is required")
      return
    }
    setCatalogActionKey("category:add")
    try {
      await adminService.addCategory(name)
      setNewCategoryName("")
      await refreshCatalog()
      toast.success("Category added")
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to add category")
    } finally {
      setCatalogActionKey(null)
    }
  }

  const handleRenameCategory = async (id: string) => {
    const newName = (categoryRenameDrafts[id] || "").trim()
    if (!newName) {
      toast.error("Category name is required")
      return
    }
    setCatalogActionKey(`category:rename:${id}`)
    try {
      await adminService.renameCategory(id, newName)
      await refreshCatalog()
      toast.success("Category updated")
    } catch (err) {
      toast.error(
        err instanceof Error ? err.message : "Failed to update category"
      )
    } finally {
      setCatalogActionKey(null)
    }
  }

  const handleDeleteCategory = async (id: string) => {
    setCatalogActionKey(`category:delete:${id}`)
    try {
      await adminService.deleteCategory(id)
      await refreshCatalog()
      toast.success("Category deleted")
    } catch (err) {
      toast.error(
        err instanceof Error ? err.message : "Failed to delete category"
      )
    } finally {
      setCatalogActionKey(null)
    }
  }

  const handleConfirmCatalogAction = async () => {
    if (!catalogConfirm) return
    const { action, id } = catalogConfirm

    if (action === "brand-update") {
      await handleRenameBrand(id)
      setCatalogConfirm(null)
      return
    }

    if (action === "brand-delete") {
      await handleDeleteBrand(id)
      setCatalogConfirm(null)
      return
    }

    if (action === "category-update") {
      await handleRenameCategory(id)
      setCatalogConfirm(null)
      return
    }

    await handleDeleteCategory(id)
    setCatalogConfirm(null)
  }

  const getCatalogConfirmContent = () => {
    if (!catalogConfirm) {
      return {
        title: "Confirm action",
        description: "Are you sure?",
        actionLabel: "Confirm",
        destructive: false,
      }
    }

    if (catalogConfirm.action === "brand-update") {
      return {
        title: "Update brand",
        description: `Confirm updating this brand name to "${(
          brandRenameDrafts[catalogConfirm.id] || ""
        ).trim()}"?`,
        actionLabel: "Update",
        destructive: false,
      }
    }

    if (catalogConfirm.action === "brand-delete") {
      return {
        title: "Delete brand",
        description:
          "Are you sure you want to delete this brand? This action cannot be undone.",
        actionLabel: "Delete",
        destructive: true,
      }
    }

    if (catalogConfirm.action === "category-update") {
      return {
        title: "Update category",
        description: `Confirm updating this category name to "${(
          categoryRenameDrafts[catalogConfirm.id] || ""
        ).trim()}"?`,
        actionLabel: "Update",
        destructive: false,
      }
    }

    return {
      title: "Delete category",
      description:
        "Are you sure you want to delete this category? This action cannot be undone.",
      actionLabel: "Delete",
      destructive: true,
    }
  }

  if (authLoading) {
    return (
      <main className="space-y-6">
        <Skeleton className="h-8 w-56" />
        <Card>
          <CardContent className="space-y-4 py-6">
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-32 w-full" />
          </CardContent>
        </Card>
      </main>
    )
  }

  if (!isAdmin) {
    return (
      <main className="space-y-6">
        <header>
          <h1 className="text-2xl font-semibold">System config</h1>
          <p className="text-sm text-muted-foreground">
            You do not have permission to access this page.
          </p>
        </header>
      </main>
    )
  }

  return (
    <main className="space-y-6">
      <header className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold">System config</h1>
          <p className="text-sm text-muted-foreground">
            Structured editors for fee, wallets, and specs. Save converts values
            back to JSON and updates config.
          </p>
        </div>
        <Button
          variant="outline"
          onClick={() => void loadConfig()}
          disabled={loading || !!savingId}
        >
          <RefreshCw className={loading ? "animate-spin" : ""} />
          Refresh
        </Button>
      </header>

      {error && (
        <div className="flex items-center gap-2 border border-destructive/30 bg-destructive/5 px-3 py-2 text-sm text-destructive">
          <AlertTriangle className="size-4" />
          <span>{error}</span>
        </div>
      )}

      {loading ? (
        <Card>
          <CardContent className="space-y-4 py-6">
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-40 w-full" />
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          <Card>
            <CardHeader className="space-y-2">
              <div className="flex items-center gap-2">
                <CardTitle className="text-base">Platform fee</CardTitle>
                <Badge variant={platformFeeDirty ? "destructive" : "outline"}>
                  {platformFeeDirty ? "Unsaved changes" : "Saved"}
                </Badge>
              </div>
              <p className="text-xs text-muted-foreground">
                Updated: {formatDate(rowById.platform_fee?.updated_at)} |
                Created: {formatDate(rowById.platform_fee?.created_at)}
              </p>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="platform-fee-percent">Percent</Label>
                  <Input
                    id="platform-fee-percent"
                    className="px-2"
                    inputMode="numeric"
                    value={platformFee.percent}
                    onChange={(event) =>
                      setPlatformFee((prev) => ({
                        ...prev,
                        percent: event.target.value,
                      }))
                    }
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="platform-fee-min-fee">Min fee</Label>
                  <div className="relative">
                    <Input
                      id="platform-fee-min-fee"
                      inputMode="decimal"
                      value={platformFee.min_fee}
                      onChange={(event) =>
                        setPlatformFee((prev) => ({
                          ...prev,
                          min_fee: event.target.value,
                        }))
                      }
                    />
                  </div>
                </div>
              </div>
              <div className="flex justify-end">
                <Button
                  variant={platformFeeDirty ? "default" : "secondary"}
                  disabled={
                    !platformFeeDirty || !!savingId || !rowById.platform_fee
                  }
                  onClick={() => void savePlatformFee()}
                >
                  <Save />
                  {savingId === "platform_fee" ? "Saving..." : "Save"}
                </Button>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="space-y-2">
              <div className="flex items-center gap-2">
                <CardTitle className="text-base">System wallets</CardTitle>
                <Badge variant={walletsDirty ? "destructive" : "outline"}>
                  {walletsDirty ? "Unsaved changes" : "Saved"}
                </Badge>
              </div>
              <p className="text-xs text-muted-foreground">
                Updated: {formatDate(rowById.system_wallets?.updated_at)} |
                Created: {formatDate(rowById.system_wallets?.created_at)}
              </p>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4">
                <div className="space-y-2">
                  <Label htmlFor="wallet-escrow-id">Escrow wallet id</Label>
                  <Input
                    id="wallet-escrow-id"
                    className="px-2"
                    value={wallets.escrow_wallet_id}
                    onChange={(event) =>
                      setWallets((prev) => ({
                        ...prev,
                        escrow_wallet_id: event.target.value,
                      }))
                    }
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="wallet-admin-id">Admin wallet id</Label>
                  <Input
                    id="wallet-admin-id"
                    className="px-2"
                    value={wallets.admin_wallet_id}
                    onChange={(event) =>
                      setWallets((prev) => ({
                        ...prev,
                        admin_wallet_id: event.target.value,
                      }))
                    }
                  />
                </div>
              </div>
              <div className="flex justify-end">
                <Button
                  variant={walletsDirty ? "default" : "secondary"}
                  disabled={
                    !walletsDirty || !!savingId || !rowById.system_wallets
                  }
                  onClick={() => void saveWallets()}
                >
                  <Save />
                  {savingId === "system_wallets" ? "Saving..." : "Save"}
                </Button>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="space-y-2">
              <div className="flex items-center gap-2">
                <CardTitle className="text-base">Specs options</CardTitle>
                <Badge variant={specsDirty ? "destructive" : "outline"}>
                  {specsDirty ? "Unsaved changes" : "Saved"}
                </Badge>
              </div>
              <p className="text-xs text-muted-foreground">
                Updated: {formatDate(rowById.specs?.updated_at)} | Created:{" "}
                {formatDate(rowById.specs?.created_at)}
              </p>
            </CardHeader>
            <CardContent className="space-y-4">
              {SPEC_KEYS.map((field, index) => (
                <div key={field} className="space-y-4">
                  {index > 0 ? <Separator /> : null}
                  <SpecsField
                    field={field}
                    values={specs[field]}
                    inputValue={specInputs[field]}
                    onInputChange={(value) =>
                      setSpecInputs((prev) => ({ ...prev, [field]: value }))
                    }
                    onAdd={() => addSpecOption(field)}
                    onRemove={(option) => removeSpecOption(field, option)}
                  />
                </div>
              ))}
              <div className="flex justify-end">
                <Button
                  variant={specsDirty ? "default" : "secondary"}
                  disabled={!specsDirty || !!savingId || !rowById.specs}
                  onClick={() => void saveSpecs()}
                >
                  <Save />
                  {savingId === "specs" ? "Saving..." : "Save"}
                </Button>
              </div>
            </CardContent>
          </Card>

          <div className="grid gap-6 lg:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Brands</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="brand-search">Search brands</Label>
                  <Input
                    id="brand-search"
                    className="px-2"
                    value={brandSearch}
                    onChange={(event) => setBrandSearch(event.target.value)}
                    placeholder="Type to filter brands..."
                  />
                </div>
                <div className="flex items-end gap-2">
                  <div className="flex-1 space-y-2">
                    <Label htmlFor="new-brand-name">Add brand</Label>
                    <Input
                      id="new-brand-name"
                      className="px-2"
                      value={newBrandName}
                      onChange={(event) => setNewBrandName(event.target.value)}
                      placeholder="Add new brand"
                      disabled={!!catalogActionKey}
                    />
                  </div>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => void handleAddBrand()}
                    disabled={!!catalogActionKey}
                  >
                    <Plus />
                    Add
                  </Button>
                </div>
                <div className="space-y-2">
                  {filteredBrands.length === 0 ? (
                    <p className="text-sm text-muted-foreground">
                      {brands.length === 0
                        ? "No brands found."
                        : "No brands match your search."}
                    </p>
                  ) : (
                    filteredBrands.map((brand) => {
                      const renameKey = `brand:rename:${brand.id}`
                      const deleteKey = `brand:delete:${brand.id}`
                      const isRenaming = catalogActionKey === renameKey
                      const isDeleting = catalogActionKey === deleteKey
                      return (
                        <div
                          key={brand.id}
                          className="grid gap-2 rounded-sm border border-border p-3"
                        >
                          <div className="space-y-2">
                            <Label htmlFor={`brand-${brand.id}`}>Name</Label>
                            <Input
                              id={`brand-${brand.id}`}
                              className="px-2"
                              value={brandRenameDrafts[brand.id] ?? brand.name}
                              onChange={(event) =>
                                setBrandRenameDrafts((prev) => ({
                                  ...prev,
                                  [brand.id]: event.target.value,
                                }))
                              }
                              disabled={!!catalogActionKey}
                            />
                          </div>
                          <div className="flex justify-end gap-2">
                            <Button
                              variant="outline"
                              type="button"
                              disabled={!!catalogActionKey}
                              onClick={() =>
                                setCatalogConfirm({
                                  action: "brand-update",
                                  id: brand.id,
                                })
                              }
                            >
                              <Save />
                              {isRenaming ? "Saving..." : "Update"}
                            </Button>
                            <Button
                              variant="destructive"
                              type="button"
                              disabled={!!catalogActionKey}
                              onClick={() =>
                                setCatalogConfirm({
                                  action: "brand-delete",
                                  id: brand.id,
                                })
                              }
                            >
                              {isDeleting ? "Deleting..." : "Delete"}
                            </Button>
                          </div>
                        </div>
                      )
                    })
                  )}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-base">Categories</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="category-search">Search categories</Label>
                  <Input
                    id="category-search"
                    className="px-2"
                    value={categorySearch}
                    onChange={(event) => setCategorySearch(event.target.value)}
                    placeholder="Type to filter categories..."
                  />
                </div>
                <div className="flex items-end gap-2">
                  <div className="flex-1 space-y-2">
                    <Label htmlFor="new-category-name">Add category</Label>
                    <Input
                      id="new-category-name"
                      className="px-2"
                      value={newCategoryName}
                      onChange={(event) =>
                        setNewCategoryName(event.target.value)
                      }
                      placeholder="Add new category"
                      disabled={!!catalogActionKey}
                    />
                  </div>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => void handleAddCategory()}
                    disabled={!!catalogActionKey}
                  >
                    <Plus />
                    Add
                  </Button>
                </div>
                <div className="space-y-2">
                  {filteredCategories.length === 0 ? (
                    <p className="text-sm text-muted-foreground">
                      {categories.length === 0
                        ? "No categories found."
                        : "No categories match your search."}
                    </p>
                  ) : (
                    filteredCategories.map((category) => {
                      const renameKey = `category:rename:${category.id}`
                      const deleteKey = `category:delete:${category.id}`
                      const isRenaming = catalogActionKey === renameKey
                      const isDeleting = catalogActionKey === deleteKey
                      return (
                        <div
                          key={category.id}
                          className="grid gap-2 rounded-md border border-border p-3"
                        >
                          <div className="space-y-2">
                            <Label htmlFor={`category-${category.id}`}>
                              Name
                            </Label>
                            <Input
                              id={`category-${category.id}`}
                              className="px-2"
                              value={
                                categoryRenameDrafts[category.id] ??
                                category.name
                              }
                              onChange={(event) =>
                                setCategoryRenameDrafts((prev) => ({
                                  ...prev,
                                  [category.id]: event.target.value,
                                }))
                              }
                              disabled={!!catalogActionKey}
                            />
                          </div>
                          <div className="flex justify-end gap-2">
                            <Button
                              variant="outline"
                              type="button"
                              disabled={!!catalogActionKey}
                              onClick={() =>
                                setCatalogConfirm({
                                  action: "category-update",
                                  id: category.id,
                                })
                              }
                            >
                              <Save />
                              {isRenaming ? "Saving..." : "Update"}
                            </Button>
                            <Button
                              variant="destructive"
                              type="button"
                              disabled={!!catalogActionKey}
                              onClick={() =>
                                setCatalogConfirm({
                                  action: "category-delete",
                                  id: category.id,
                                })
                              }
                            >
                              {isDeleting ? "Deleting..." : "Delete"}
                            </Button>
                          </div>
                        </div>
                      )
                    })
                  )}
                </div>
              </CardContent>
            </Card>
          </div>

          {otherRows.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Other configs</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {otherRows.map((row, index) => {
                  const dirty = isOtherDirty(row.id)
                  return (
                    <div key={row.id} className="space-y-3">
                      {index > 0 ? <Separator /> : null}
                      <div className="flex items-center gap-2">
                        <p className="text-sm font-semibold">{row.id}</p>
                        <Badge variant={dirty ? "secondary" : "outline"}>
                          {dirty ? "Unsaved changes" : "Saved"}
                        </Badge>
                      </div>
                      <Textarea
                        className="min-h-40 rounded-md border border-input px-3 py-2 font-mono text-xs"
                        value={otherDrafts[row.id] || ""}
                        onChange={(event) =>
                          setOtherDrafts((prev) => ({
                            ...prev,
                            [row.id]: event.target.value,
                          }))
                        }
                        spellCheck={false}
                      />
                      <div className="flex justify-end">
                        <Button
                          variant={dirty ? "default" : "secondary"}
                          disabled={!dirty || !!savingId}
                          onClick={() => void saveOtherConfig(row.id)}
                        >
                          <Save />
                          {savingId === row.id ? "Saving..." : "Save"}
                        </Button>
                      </div>
                    </div>
                  )
                })}
              </CardContent>
            </Card>
          )}
        </div>
      )}

      <AlertDialog
        open={!!catalogConfirm}
        onOpenChange={(open) => {
          if (!open && !catalogActionKey) {
            setCatalogConfirm(null)
          }
        }}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              {getCatalogConfirmContent().title}
            </AlertDialogTitle>
            <AlertDialogDescription>
              {getCatalogConfirmContent().description}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={!!catalogActionKey}>
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              className={
                getCatalogConfirmContent().destructive
                  ? "bg-destructive/10 text-destructive hover:bg-destructive/20"
                  : undefined
              }
              disabled={!!catalogActionKey}
              onClick={() => void handleConfirmCatalogAction()}
            >
              {getCatalogConfirmContent().actionLabel}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </main>
  )
}
