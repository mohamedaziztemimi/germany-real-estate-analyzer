"use client"

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import {
  getSession,
  signIn,
  signOut,
  googleSignIn,
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
    refetchOnMount: true,
  })
}

export function useSignInMutation() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ email, password, remember }: { email: string; password: string; remember: boolean }) =>
      signIn(email, password, remember),
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

export function useGoogleSignInMutation() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ credential, remember }: { credential: string; remember?: boolean }) =>
      googleSignIn(credential, remember ?? true),
    onSuccess: (data) => {
      queryClient.clear()
      queryClient.setQueryData(["auth", "session"], data)
    },
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
    onMutate: async () => {
      await queryClient.cancelQueries({ queryKey: ["auth"] })
      queryClient.setQueryData(["auth", "session"], null)
    },
    onSuccess: () => {
      // Drop any cached auth/session data so guards re-evaluate immediately.
      queryClient.removeQueries({ queryKey: ["auth"] })
    },
    onSettled: () => {
      // Ensure any active auth queries refetch and see the cleared session.
      queryClient.invalidateQueries({ queryKey: ["auth"] })
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
