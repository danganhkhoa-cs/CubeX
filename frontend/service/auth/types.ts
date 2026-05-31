export interface SignUpRequest {
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

export interface SignUpResponse {
  success: true
  data?: SignUpResponseData
  message?: string
}

export interface SignInRequest {
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

export interface SignInResponse {
  success: true
  user?: SignInUser
  message?: string
}

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

export interface GetUserResponse {
  success: true
  user?: UserProfile
  message?: string
}

export interface UserProfilePublic {
  user_id: string
  username: string
  full_name: string
  avatar_url: string | null
  bio: string | null
  phone: string | null
  email: string
}

export interface GetUserPublicResponse {
  success: true
  user?: UserProfilePublic
  message?: string
}

export interface UpdateProfileRequest {
  full_name: string
  bio?: string
  street?: string
  district?: string
  city?: string
  phone?: string
  avatar?: File | null
}

export interface UpdateProfileResponse {
  success: true
  user?: UserProfile
  message?: string
}
