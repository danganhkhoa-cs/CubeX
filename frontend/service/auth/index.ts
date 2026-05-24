import apiClient from "@/lib/api"
import {
  SignUpPayload,
  SignUpResponse,
  SignInPayload,
  SignInResponse,
  GetUserResponse,
} from "./types"

export const authService = {
  signup: async (payload: SignUpPayload): Promise<SignUpResponse> => {
    const response = await apiClient.post<SignUpResponse>(
      "/auth/signup",
      payload
    )

    if (!response.data.success) {
      throw new Error(response.data.message)
    }

    return response.data
  },
  signin: async (payload: SignInPayload): Promise<SignInResponse> => {
    const response = await apiClient.post<SignInResponse>(
      "/auth/signin",
      payload
    )

    if (!response.data.success) {
      throw new Error(response.data.message)
    }

    return response.data
  },
  logout: async (): Promise<void> => {
    await apiClient.post("/auth/signout")
  },
  getUserInfo: async (): Promise<GetUserResponse> => {
    const response = await apiClient.get<GetUserResponse>("/auth/user")

    return response.data
  },
}
