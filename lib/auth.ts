import { apiFetch, setAccessToken } from "./api"

export interface User {
  id: string
  email: string
  role: string
}

export interface AuthResponse {
  user: User
}

export interface SignupStartResponse {
  message: string
}

type AuthTokens = {
  access_token?: string
  token?: string
  token_type?: string
  refresh_token?: string
}

type AuthLoginResponse = AuthTokens & { user?: User }

async function resolveAuthUser(data: AuthLoginResponse, remember = true): Promise<AuthResponse> {
  const token = data.access_token ?? data.token
  if (token) {
    setAccessToken(token, { remember })
  }

  if (data.user) {
    return { user: data.user }
  }

  // Fallback: fetch current user with the token we just stored
  return getSession()
}

export async function startSignup(email: string, password: string): Promise<SignupStartResponse> {
  return apiFetch<SignupStartResponse>("/auth/signup/start", {
    method: "POST",
    json: { email, password },
  })
}

export async function completeSignup(email: string, code: string): Promise<AuthResponse> {
  const data = await apiFetch<AuthLoginResponse>("/auth/signup/complete", {
    method: "POST",
    json: { email, code },
  })

  return resolveAuthUser(data)
}

export async function signIn(email: string, password: string, remember = true): Promise<AuthResponse> {
  const data = await apiFetch<AuthLoginResponse>("/auth/login", {
    method: "POST",
    json: { email, password },
  })

  return resolveAuthUser(data, remember)
}

export async function googleSignIn(credential: string, remember = true): Promise<AuthResponse> {
  const data = await apiFetch<AuthLoginResponse>("/auth/google", {
    method: "POST",
    json: { credential },
  })
  return resolveAuthUser(data, remember)
}

export async function getSession(): Promise<AuthResponse> {
  return apiFetch<AuthResponse>("/auth/me", { method: "GET" })
}

export async function signOut(): Promise<void> {
  try {
    await apiFetch("/auth/logout", { method: "POST" })
  } finally {
    // Always clear the token locally so UI reflects logout immediately even if the request fails.
    setAccessToken(null)
  }
}

export async function requestPasswordReset(email: string): Promise<{ message: string }> {
  return apiFetch<{ message: string }>("/auth/forgot-password", {
    method: "POST",
    json: { email },
  })
}

export async function resetPassword(email: string, code: string, password: string): Promise<{ message: string }> {
  return apiFetch<{ message: string }>("/auth/reset-password", {
    method: "POST",
    json: { email, code, password },
  })
}
