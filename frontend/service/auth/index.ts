import apiClient from "@/lib/api"
import {
  SignUpRequest,
  SignUpResponse,
  SignInRequest,
  SignInResponse,
  GetUserResponse,
  GetUserPublicResponse,
} from "./types"

export const authService = {
  signup: async (payload: SignUpRequest): Promise<SignUpResponse> => {
    const response = await apiClient.post<SignUpResponse>(
      "/auth/signup",
      payload
    )

    if (!response.data.success) {
      throw new Error(response.data.message)
    }

    return response.data
  },
  signin: async (payload: SignInRequest): Promise<SignInResponse> => {
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
  getUserPublicInfo: async (userId: string): Promise<GetUserPublicResponse> => {
    const response = await apiClient.get<GetUserPublicResponse>(
      `/auth/user/${userId}`
    )

    return response.data
  },
}
