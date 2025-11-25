"use client"

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import {
  getSession,
  signIn,
  signOut,
  requestPasswordReset,
  resetPassword,
  startSignup,
  completeSignup,
  type User,
} from "./auth"

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
      queryClient.clear()
      queryClient.setQueryData(["auth", "session"], data)
    },
  })
}

export function useSignUpMutation() {
  return useMutation({
    mutationFn: ({ email, password }: { email: string; password: string }) => startSignup(email, password),
  })
}

export function useSignupStartMutation() {
  return useMutation({
    mutationFn: ({ email, password }: { email: string; password: string }) => startSignup(email, password),
  })
}

export function useSignupCompleteMutation() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ email, code }: { email: string; code: string }) => completeSignup(email, code),
    onSuccess: (data) => {
      queryClient.clear()
      queryClient.setQueryData(["auth", "session"], data)
    },
  })
}

export function useSignOutMutation() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: signOut,
    onSuccess: () => {
      queryClient.clear()
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
    mutationFn: ({ email, code, password }: { email: string; code: string; password: string }) =>
      resetPassword(email, code, password),
  })
}
