import { useEffect, useState } from "react"
import { getSupabaseBrowserClient } from "@/lib/supabase"

interface ResetPasswordErrors {
  password?: string
  confirmPassword?: string
}

export const useResetPassword = () => {
  const [password, setPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [loading, setLoading] = useState(false)
  const [ready, setReady] = useState(false)
  const [submitted, setSubmitted] = useState(false)
  const [errors, setErrors] = useState<ResetPasswordErrors>({})
  const [serverError, setServerError] = useState("")

  useEffect(() => {
    let mounted = true

    try {
      const supabase = getSupabaseBrowserClient()
      const {
        data: { subscription },
      } = supabase.auth.onAuthStateChange((event) => {
        if (event === "PASSWORD_RECOVERY" && mounted) {
          setReady(true)
        }
      })

      void supabase.auth.getSession().then(({ data }) => {
        if (mounted && data.session) {
          setReady(true)
        }
      })

      return () => {
        mounted = false
        subscription.unsubscribe()
      }
    } catch (err) {
      setServerError(
        err instanceof Error
          ? err.message
          : "Failed to initialize password recovery"
      )
      return () => {
        mounted = false
      }
    }
  }, [])

  const handlePasswordChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setPassword(event.target.value)
    if (errors.password) {
      setErrors((current) => ({ ...current, password: undefined }))
    }
    if (serverError) {
      setServerError("")
    }
  }

  const handleConfirmPasswordChange = (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    setConfirmPassword(event.target.value)
    if (errors.confirmPassword) {
      setErrors((current) => ({ ...current, confirmPassword: undefined }))
    }
    if (serverError) {
      setServerError("")
    }
  }

  const handleSubmit = async (event: React.SubmitEvent<HTMLFormElement>) => {
    event.preventDefault()
    setErrors({})
    setServerError("")

    if (!password) {
      setErrors({ password: "Password is required" })
      return
    }
    if (password.length < 6) {
      setErrors({ password: "Password must be at least 6 characters" })
      return
    }
    if (password !== confirmPassword) {
      setErrors({ confirmPassword: "Passwords do not match" })
      return
    }

    setLoading(true)
    try {
      const supabase = getSupabaseBrowserClient()
      const { error } = await supabase.auth.updateUser({ password })

      if (error) {
        throw error
      }

      setSubmitted(true)
      setPassword("")
      setConfirmPassword("")
    } catch (err) {
      setServerError(
        err instanceof Error ? err.message : "Failed to update password"
      )
    } finally {
      setLoading(false)
    }
  }

  return {
    password,
    confirmPassword,
    loading,
    ready,
    submitted,
    errors,
    serverError,
    handlePasswordChange,
    handleConfirmPasswordChange,
    handleSubmit,
  }
}
