interface SignInErrors {
  email?: string
  password?: string
}

export const validateSignIn = (data: {
  email: string
  password: string
}): SignInErrors => {
  const errors: SignInErrors = {}

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
