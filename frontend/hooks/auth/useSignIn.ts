import { useState } from "react"
import { useRouter } from "next/navigation"
import { authService } from "@/service/auth"
import { useAuth } from "@/hooks/auth/useAuth"
import { validateSignIn } from "./signInValidation"

interface FormData {
  email: string
  password: string
}

interface FormErrors {
  email?: string
  password?: string
}

export const useSignIn = () => {
  const router = useRouter()
  const { refresh } = useAuth()
  const [loading, setLoading] = useState(false)
  const [errors, setErrors] = useState<FormErrors>({})
  const [serverError, setServerError] = useState("") // Separate server error
  const [formData, setFormData] = useState<FormData>({
    email: "",
    password: "",
  })

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }))
    // Clear validation error for this field when user starts typing
    if (errors[name as keyof FormErrors]) {
      setErrors((prev) => ({
        ...prev,
        [name]: undefined,
      }))
    }
    // Clear server error when user starts typing
    if (serverError) {
      setServerError("")
    }
  }

  const handleSubmit = async (e: React.SubmitEvent<HTMLFormElement>) => {
    e.preventDefault()
    setErrors({})
    setServerError("")
    setLoading(true)

    // Validate form
    const validationErrors = validateSignIn(formData)
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors)
      setLoading(false)
      return
    }

    try {
      await authService.signin(formData)
      await refresh()
      router.push("/?login=success")
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "An error occurred during signin"
      setServerError(errorMessage) // Set as server error, not field error
    } finally {
      setLoading(false)
    }
  }

  return {
    loading,
    errors,
    serverError,
    formData,
    handleInputChange,
    handleSubmit,
  }
}
