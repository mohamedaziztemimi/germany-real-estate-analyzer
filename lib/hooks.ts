"use client"

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { predictProperty, getAnalyticsSummary } from "./api"
import {
  saveAnalysis,
  getAnalyses,
  getAnalysis,
  updateAnalysis,
  deleteAnalysis,
  shareAnalysis,
  getSharedAnalyses,
  getShareComments,
  addShareComment,
  deleteShareComment,
  toggleShareCommentLike,
  getShare,
} from "./analyses-api"
import { sendChatMessage } from "./chat-api"
import {
  getUsers,
  updateUserRole,
  getModels,
  createModel,
  activateModel,
  getPredictions,
  updateUser,
  deleteUser,
  createUser,
} from "./admin-api"
import type { PropertyPayload, PredictionResponse } from "./schemas"
import type { ChatRequest, ChatResponse } from "./chat-schemas"
import type { AnalysisPayload, Analysis, AnalysisShareList, AnalysisComment } from "./analyses-schemas"

// Client hooks
export function usePredictMutation() {
  return useMutation<PredictionResponse, Error, PropertyPayload>({
    mutationFn: predictProperty,
    retry: (failureCount, error) => {
      // Only retry on 5xx errors, not 4xx
      const is5xx = error.message?.includes("502") || error.message?.includes("503")
      return is5xx && failureCount < 2
    },
  })
}

export function useAnalyticsSummary() {
  return useQuery({
    queryKey: ["analytics", "summary"],
    queryFn: getAnalyticsSummary,
    staleTime: 5 * 60 * 1000, // 5 minutes
  })
}

export function useChatMutation() {
  return useMutation<ChatResponse, Error, ChatRequest>({
    mutationFn: sendChatMessage,
    retry: (failureCount, error) => {
      const is5xx = error.message?.includes("502") || error.message?.includes("503")
      return is5xx && failureCount < 2
    },
  })
}

export function useAnalysesMutation() {
  return useMutation<Analysis, Error, AnalysisPayload>({
    mutationFn: saveAnalysis,
    retry: (failureCount, error) => {
      const is5xx = error.message?.includes("502") || error.message?.includes("503")
      return is5xx && failureCount < 2
    },
  })
}

export function useAnalysesList(page = 1) {
  return useQuery({
    queryKey: ["analyses", page],
    queryFn: () => getAnalyses(page),
    staleTime: 2 * 60 * 1000,
  })
}

export function useAnalysis(id: string) {
  return useQuery({
    queryKey: ["analyses", id],
    queryFn: () => getAnalysis(id),
    staleTime: 5 * 60 * 1000,
  })
}

export function useUpdateAnalysisMutation() {
  return useMutation<Analysis, Error, { id: string; data: { title?: string; notes?: string } }>({
    mutationFn: ({ id, data }) => updateAnalysis(id, data),
  })
}

export function useDeleteAnalysisMutation() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: deleteAnalysis,
    onSuccess: async () => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ["analyses"] }),
        queryClient.invalidateQueries({ queryKey: ["analytics", "summary"] }),
      ])
    },
  })
}

export function useShareAnalysisMutation() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ analysisId, message }: { analysisId: string; message?: string }) =>
      shareAnalysis(analysisId, { message }),
    onSuccess: async (_data, variables) => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ["analyses"] }),
        queryClient.invalidateQueries({ queryKey: ["analyses", "shared"] }),
        queryClient.invalidateQueries({ queryKey: ["analyses", variables.analysisId] }),
      ])
    },
  })
}

export function useSharedAnalyses() {
  return useQuery<AnalysisShareList>({
    queryKey: ["analyses", "shared"],
    queryFn: getSharedAnalyses,
    staleTime: 2 * 60 * 1000,
  })
}

export function useShareComments(shareId: string | undefined) {
  return useQuery<AnalysisComment[]>({
    queryKey: ["analyses", "shared", shareId, "comments"],
    queryFn: () => getShareComments(shareId!),
    enabled: Boolean(shareId),
    staleTime: 5 * 1000,
  })
}

export function useShare(shareId: string | undefined) {
  return useQuery({
    queryKey: ["analyses", "shares", shareId],
    queryFn: () => getShare(shareId!),
    enabled: Boolean(shareId),
    staleTime: 30 * 1000,
  })
}

export function useAddCommentMutation() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ shareId, body }: { shareId: string; body: string }) => addShareComment(shareId, body),
    onSuccess: async (_data, variables) => {
      await queryClient.invalidateQueries({ queryKey: ["analyses", "shared", variables.shareId, "comments"] })
    },
  })
}

export function useDeleteCommentMutation() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ shareId, commentId }: { shareId: string; commentId: string }) =>
      deleteShareComment(shareId, commentId),
    onSuccess: async (_data, variables) => {
      await queryClient.invalidateQueries({ queryKey: ["analyses", "shared", variables.shareId, "comments"] })
    },
  })
}

export function useToggleCommentLikeMutation() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ shareId, commentId }: { shareId: string; commentId: string }) =>
      toggleShareCommentLike(shareId, commentId),
    onSuccess: (updatedComment, variables) => {
      queryClient.setQueryData<AnalysisComment[] | undefined>(
        ["analyses", "shared", variables.shareId, "comments"],
        (old) => old?.map((comment) => (comment.id === updatedComment.id ? updatedComment : comment)) ?? old,
      )
    },
  })
}

// Admin hooks
export function useUsers() {
  return useQuery({
    queryKey: ["admin", "users"],
    queryFn: getUsers,
    staleTime: 2 * 60 * 1000,
  })
}

export function useUpdateUserRoleMutation() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ userId, role }: { userId: string; role: "user" | "admin" }) => updateUserRole(userId, role),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["admin", "users"] })
    },
  })
}

export function useUpdateUserMutation() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ userId, email, role }: { userId: string; email?: string; role?: "user" | "admin" }) =>
      updateUser(userId, { email, role }),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["admin", "users"] })
    },
  })
}

export function useDeleteUserMutation() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (userId: string) => deleteUser(userId),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["admin", "users"] })
    },
  })
}

export function useCreateUserMutation() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ email, password, role }: { email: string; password: string; role: "user" | "admin" }) =>
      createUser({ email, password, role }),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["admin", "users"] })
    },
  })
}

export function useModels() {
  return useQuery({
    queryKey: ["admin", "models"],
    queryFn: getModels,
    staleTime: 2 * 60 * 1000,
  })
}

export function useCreateModelMutation() {
  return useMutation({
    mutationFn: createModel,
  })
}

export function useActivateModelMutation() {
  return useMutation({
    mutationFn: activateModel,
  })
}

export function usePredictions(page = 1) {
  return useQuery({
    queryKey: ["admin", "predictions", page],
    queryFn: () => getPredictions(page),
    staleTime: 2 * 60 * 1000,
  })
}
