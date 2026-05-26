"use client"

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react"

import { productService } from "@/service/products"
import type {
  ProductBrand,
  ProductCategory,
  ProductSpecs,
} from "@/service/products/types"

const initialFilters = {
  search: "",
  minPrice: "",
  maxPrice: "",
  brandId: "",
  categoryId: "",
  edition: "",
  coatedType: "",
  magnetType: "",
  springType: "",
  coreMaterial: "",
  customizationTypes: [] as string[],
}

export type FilterState = typeof initialFilters

interface FilterContextValue {
  brands: ProductBrand[]
  categories: ProductCategory[]
  specs: ProductSpecs | null
  filters: FilterState
  loading: boolean
  error: string | null
  refresh: () => Promise<void>
  setSearch: (value: string) => void
  setMinPrice: (value: string) => void
  setMaxPrice: (value: string) => void
  setBrandId: (value: string) => void
  setCategoryId: (value: string) => void
  setEdition: (value: string) => void
  setCoatedType: (value: string) => void
  setMagnetType: (value: string) => void
  setSpringType: (value: string) => void
  setCoreMaterial: (value: string) => void
  toggleCustomizationType: (value: string) => void
  resetFilters: () => void
}

const FilterContext = createContext<FilterContextValue | null>(null)

export function FilterProvider({ children }: { children: React.ReactNode }) {
  const [brands, setBrands] = useState<ProductBrand[]>([])
  const [categories, setCategories] = useState<ProductCategory[]>([])
  const [specs, setSpecs] = useState<ProductSpecs | null>(null)
  const [filters, setFilters] = useState<FilterState>(initialFilters)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const refresh = useCallback(async () => {
    setLoading(true)
    setError(null)

    try {
      const [brandList, categoryList, specList] = await Promise.all([
        productService.getBrands(),
        productService.getCategories(),
        productService.getSpecs(),
      ])

      setBrands(brandList)
      setCategories(categoryList)
      setSpecs(specList)
    } catch (requestError) {
      setBrands([])
      setCategories([])
      setSpecs(null)
      setError(
        requestError instanceof Error
          ? requestError.message
          : "Failed to load product filters"
      )
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    refresh()
  }, [refresh])

  const setSearch = useCallback((value: string) => {
    setFilters((current) => ({ ...current, search: value }))
  }, [])

  const setMinPrice = useCallback((value: string) => {
    setFilters((current) => ({ ...current, minPrice: value }))
  }, [])

  const setMaxPrice = useCallback((value: string) => {
    setFilters((current) => ({ ...current, maxPrice: value }))
  }, [])

  const setBrandId = useCallback((value: string) => {
    setFilters((current) => ({ ...current, brandId: value }))
  }, [])

  const setCategoryId = useCallback((value: string) => {
    setFilters((current) => ({ ...current, categoryId: value }))
  }, [])

  const setEdition = useCallback((value: string) => {
    setFilters((current) => ({ ...current, edition: value }))
  }, [])

  const setCoatedType = useCallback((value: string) => {
    setFilters((current) => ({ ...current, coatedType: value }))
  }, [])

  const setMagnetType = useCallback((value: string) => {
    setFilters((current) => ({ ...current, magnetType: value }))
  }, [])

  const setSpringType = useCallback((value: string) => {
    setFilters((current) => ({ ...current, springType: value }))
  }, [])

  const setCoreMaterial = useCallback((value: string) => {
    setFilters((current) => ({ ...current, coreMaterial: value }))
  }, [])

  const toggleCustomizationType = useCallback((value: string) => {
    setFilters((current) => {
      const exists = current.customizationTypes.includes(value)

      return {
        ...current,
        customizationTypes: exists
          ? current.customizationTypes.filter((item) => item !== value)
          : [...current.customizationTypes, value],
      }
    })
  }, [])

  const resetFilters = useCallback(() => {
    setFilters(initialFilters)
  }, [])

  const value = useMemo(
    () => ({
      brands,
      categories,
      specs,
      filters,
      loading,
      error,
      refresh,
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
      resetFilters,
    }),
    [
      brands,
      categories,
      specs,
      filters,
      loading,
      error,
      refresh,
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
      resetFilters,
    ]
  )

  return (
    <FilterContext.Provider value={value}>{children}</FilterContext.Provider>
  )
}

export function useFilter() {
  const context = useContext(FilterContext)

  if (!context) {
    throw new Error("useFilter must be used within FilterProvider")
  }

  return context
}
