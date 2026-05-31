"use client"

import { useEffect } from "react"
import { useParams, useRouter } from "next/navigation"

import { Spinner } from "@/components/ui/spinner"

export default function ProfileRedirectPage() {
  const router = useRouter()
  const params = useParams<{ id: string }>()
  const userId = Array.isArray(params?.id) ? params.id[0] : params?.id

  useEffect(() => {
    if (userId) {
      router.replace(`/products?seller_id=${userId}`)
    }
  }, [router, userId])

  return (
    <div className="flex min-h-[40vh] items-center justify-center">
      <Spinner className="size-5" />
    </div>
  )
}
