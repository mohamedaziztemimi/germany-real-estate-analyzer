"use client"

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { getSession, signIn, signUp, signOut, requestPasswordReset, resetPassword, type User } from "./auth"

export function useAuth() {
  return useQuery<{ user: User }>({
    queryKey: ["auth", "session"],
    queryFn: getSession,
    retry: false,
    staleTime: Number.POSITIVE_INFINITY,
  })
}

export function useSignInMutation() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ email, password }: { email: string; password: string }) => signIn(email, password),
    onSuccess: (data) => {
      queryClient.setQueryData(["auth", "session"], data)
    },
  })
}

export function useSignUpMutation() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ email, password }: { email: string; password: string }) => signUp(email, password),
    onSuccess: (data) => {
      queryClient.setQueryData(["auth", "session"], data)
    },
  })
}

export function useSignOutMutation() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: signOut,
    onSuccess: () => {
      queryClient.setQueryData(["auth", "session"], null)
      queryClient.removeQueries({ queryKey: ["auth", "session"] })
    },
  })
}

export function useForgotPasswordMutation() {
  return useMutation({
    mutationFn: ({ email }: { email: string }) => requestPasswordReset(email),
  })
}

export function useResetPasswordMutation() {
  return useMutation({
    mutationFn: ({ token, password }: { token: string; password: string }) => resetPassword(token, password),
  })
}
