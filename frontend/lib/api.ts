import axios from "axios"
import type { AxiosError, InternalAxiosRequestConfig } from "axios"

const baseURL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api"

type RetriableRequestConfig = InternalAxiosRequestConfig & {
  _retry?: boolean
}

type ApiErrorResponse = {
  message?: string
  error?: string
}

let refreshSessionPromise: Promise<void> | null = null

const apiClient = axios.create({
  baseURL,
  headers: {
    "Content-Type": "application/json",
  },
  withCredentials: true,
})

function refreshSession() {
  if (!refreshSessionPromise) {
    refreshSessionPromise = axios
      .post(`${baseURL}/auth/refresh`, undefined, {
        withCredentials: true,
      })
      .then(() => undefined)
      .finally(() => {
        refreshSessionPromise = null
      })
  }

  return refreshSessionPromise
}

function getApiErrorMessage(error: AxiosError) {
  const data = error.response?.data

  if (data && typeof data === "object") {
    const apiError = data as ApiErrorResponse
    if (apiError.message) return apiError.message
    if (apiError.error) return apiError.error
  }

  return error.message || "Request failed"
}

function normalizeApiError(error: AxiosError) {
  return new Error(getApiErrorMessage(error))
}

apiClient.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const request = error.config as RetriableRequestConfig | undefined
    const status = error.response?.status
    const url = request?.url || ""

    if (
      status !== 401 ||
      !request ||
      request._retry ||
      url.includes("/auth/refresh") ||
      url.includes("/auth/signin")
    ) {
      return Promise.reject(normalizeApiError(error))
    }

    request._retry = true

    try {
      await refreshSession()
      return apiClient(request)
    } catch {
      return Promise.reject(normalizeApiError(error))
    }
  }
)

export default apiClient
