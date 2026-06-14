import { useState } from "react"
import { getSupabaseBrowserClient } from "@/lib/supabase"

interface ForgotPasswordErrors {
  email?: string
}

export const useForgotPassword = () => {
  const [email, setEmail] = useState("")
  const [loading, setLoading] = useState(false)
  const [submitted, setSubmitted] = useState(false)
  const [errors, setErrors] = useState<ForgotPasswordErrors>({})
  const [serverError, setServerError] = useState("")

  const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setEmail(event.target.value)
    if (errors.email) {
      setErrors({})
    }
    if (serverError) {
      setServerError("")
    }
  }

  const handleSubmit = async (event: React.SubmitEvent<HTMLFormElement>) => {
    event.preventDefault()
    setErrors({})
    setServerError("")

    const trimmedEmail = email.trim()
    if (!trimmedEmail) {
      setErrors({ email: "Email is required" })
      return
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmedEmail)) {
      setErrors({ email: "Please enter a valid email address" })
      return
    }

    setLoading(true)
    try {
      const supabase = getSupabaseBrowserClient()
      const redirectTo =
        typeof window !== "undefined"
          ? `${window.location.origin}/reset-password`
          : undefined

      const { error } = await supabase.auth.resetPasswordForEmail(
        trimmedEmail,
        { redirectTo }
      )

      if (error) {
        throw error
      }

      setSubmitted(true)
    } catch (err) {
      setServerError(
        err instanceof Error
          ? err.message
          : "Failed to send password reset email"
      )
    } finally {
      setLoading(false)
    }
  }

  return {
    email,
    loading,
    submitted,
    errors,
    serverError,
    handleInputChange,
    handleSubmit,
  }
}
