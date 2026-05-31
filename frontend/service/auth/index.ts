import apiClient from "@/lib/api"
import {
  SignUpRequest,
  SignUpResponse,
  SignInRequest,
  SignInResponse,
  GetUserResponse,
  GetUserPublicResponse,
  UpdateProfileRequest,
  UpdateProfileResponse,
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
  updateProfile: async (
    payload: UpdateProfileRequest
  ): Promise<UpdateProfileResponse> => {
    const formData = new FormData()
    if (payload.full_name !== undefined) {
      formData.append("full_name", payload.full_name)
    }
    if (payload.bio !== undefined) {
      formData.append("bio", payload.bio)
    }
    if (payload.street !== undefined) {
      formData.append("street", payload.street)
    }
    if (payload.district !== undefined) {
      formData.append("district", payload.district)
    }
    if (payload.city !== undefined) {
      formData.append("city", payload.city)
    }
    if (payload.phone !== undefined) {
      formData.append("phone", payload.phone)
    }
    if (payload.avatar) {
      formData.append("avatar", payload.avatar)
    }

    const response = await apiClient.patch<UpdateProfileResponse>(
      "/auth/user",
      formData,
      {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      }
    )

    if (!response.data.success) {
      throw new Error(response.data.message)
    }

    return response.data
  },
}
