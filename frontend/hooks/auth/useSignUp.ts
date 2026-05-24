import { useState } from "react"
import { useRouter } from "next/navigation"
import { authService } from "@/service/auth"
import { validateSignUp } from "./validation"

interface FormData {
  full_name: string
  username: string
  email: string
  password: string
}

interface FormErrors {
  full_name?: string
  username?: string
  email?: string
  password?: string
}

export const useSignUp = () => {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [errors, setErrors] = useState<FormErrors>({})
  const [submitted, setSubmitted] = useState(false)
  const [formData, setFormData] = useState<FormData>({
    full_name: "",
    username: "",
    email: "",
    password: "",
  })

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }))
    // Clear error for this field when user starts typing
    if (errors[name as keyof FormErrors]) {
      setErrors((prev) => ({
        ...prev,
        [name]: undefined,
      }))
    }
  }

  const handleSubmit = async (e: React.SubmitEvent<HTMLFormElement>) => {
    e.preventDefault()
    setErrors({})
    setLoading(true)

    // Validate form
    const validationErrors = validateSignUp(formData)
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors)
      setLoading(false)
      return
    }

    try {
      await authService.signup(formData)
      setSubmitted(true)
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "An error occurred during signup"
      setErrors({ full_name: errorMessage })
    } finally {
      setLoading(false)
    }
  }

  const handleGoToSignIn = () => {
    router.push("/signin")
  }

  return {
    loading,
    errors,
    submitted,
    formData,
    handleInputChange,
    handleSubmit,
    handleGoToSignIn,
  }
}
