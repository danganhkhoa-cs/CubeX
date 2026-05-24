interface FormErrors {
  full_name?: string
  username?: string
  email?: string
  password?: string
}

export const validateSignUp = (data: {
  full_name: string
  username: string
  email: string
  password: string
}): FormErrors => {
  const errors: FormErrors = {}

  // Full name validation
  if (!data.full_name.trim()) {
    errors.full_name = "Full name is required"
  }

  // Username validation
  if (!data.username.trim()) {
    errors.username = "Username is required"
  }

  // Email validation
  if (!data.email.trim()) {
    errors.email = "Email is required"
  } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email)) {
    errors.email = "Please enter a valid email address"
  }

  // Password validation
  if (!data.password) {
    errors.password = "Password is required"
  } else if (data.password.length < 6) {
    errors.password = "Password must be at least 6 characters"
  }

  return errors
}
