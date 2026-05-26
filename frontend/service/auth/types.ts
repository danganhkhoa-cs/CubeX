export interface SignUpPayload {
  full_name: string
  username: string
  email: string
  password: string
}

export interface Identity {
  identity_id: string
  id: string
  user_id: string
  identity_data: {
    email: string
    email_verified: boolean
    phone_verified: boolean
    sub: string
  }
  provider: string
  last_sign_in_at: string
  created_at: string
  updated_at: string
  email: string
}

export interface User {
  id: string
  aud: string
  role: string
  email: string
  email_confirmed_at: string | null
  phone: string
  last_sign_in_at: string | null
  app_metadata: {
    provider: string
    providers: string[]
  }
  user_metadata: Record<string, unknown>
  identities: Identity[]
  created_at: string
  updated_at: string
}

export interface Session {
  access_token: string
  token_type: string
  expires_in: number
  expires_at: number
  refresh_token: string
  user: User
}

export interface SignUpResponseData {
  user: User
  session: Session | null
}

export interface SignUpSuccessResponse {
  success: true
  data: SignUpResponseData
}

export interface SignUpErrorResponse {
  success: false
  message: string
}

export type SignUpResponse = SignUpSuccessResponse | SignUpErrorResponse

export interface SignInPayload {
  email: string
  password: string
}

export interface IdentityData {
  email: string
  email_verified: boolean
  full_name: string
  phone_verified: boolean
  sub: string
  username: string
}

export interface UserIdentity {
  identity_id: string
  id: string
  user_id: string
  identity_data: IdentityData
  provider: string
  last_sign_in_at: string
  created_at: string
  updated_at: string
  email: string
}

export interface UserMetadata {
  email: string
  email_verified: boolean
  full_name: string
  phone_verified: boolean
  sub: string
  username: string
}

export interface SignInUser {
  id: string
  aud: string
  role: string
  email: string
  email_confirmed_at: string | null
  phone: string
  confirmation_sent_at: string
  confirmed_at: string
  last_sign_in_at: string
  app_metadata: {
    provider: string
    providers: string[]
  }
  user_metadata: UserMetadata
  identities: UserIdentity[]
  created_at: string
  updated_at: string
  is_anonymous: boolean
}

export interface SignInSuccessResponse {
  success: true
  user: SignInUser
}

export interface SignInErrorResponse {
  success: false
  message: string
}

export type SignInResponse = SignInSuccessResponse | SignInErrorResponse

export interface UserProfile {
  user_id: string
  username: string
  full_name: string
  avatar_url: string | null
  bio: string | null
  street: string | null
  district: string | null
  city: string | null
  phone: string | null
  created_at: string
  role: string
  email: string
}

export interface GetUserSuccessResponse {
  success: true
  user: UserProfile
}

export interface GetUserErrorResponse {
  success: false
  message: string
}

export type GetUserResponse = GetUserSuccessResponse | GetUserErrorResponse

export interface UserProfilePublic {
  user_id: string
  username: string
  full_name: string
  avatar_url: string | null
  bio: string | null
  phone: string | null
  email: string
}

export interface GetUserPublicSuccessResponse {
  success: true
  user: UserProfilePublic
}

export interface GetUserPublicErrorResponse {
  success: false
  message: string
}

export type GetUserPublicResponse =
  | GetUserPublicSuccessResponse
  | GetUserPublicErrorResponse
