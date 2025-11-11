"use client"

import { useQuery, useMutation } from "@tanstack/react-query"
import { getSession, signIn, signUp, signOut, type User } from "./auth"

export function useAuth() {
  return useQuery<{ user: User }>({
    queryKey: ["auth", "session"],
    queryFn: getSession,
    retry: false,
    staleTime: Number.POSITIVE_INFINITY,
  })
}

export function useSignInMutation() {
  return useMutation({
    mutationFn: ({ email, password }: { email: string; password: string }) => signIn(email, password),
  })
}

export function useSignUpMutation() {
  return useMutation({
    mutationFn: ({ email, password }: { email: string; password: string }) => signUp(email, password),
  })
}

export function useSignOutMutation() {
  return useMutation({
    mutationFn: signOut,
  })
}
