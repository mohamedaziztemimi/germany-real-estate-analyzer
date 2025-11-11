"use client"

import { useMutation, useQuery } from "@tanstack/react-query"
import {
  predictProperty,
  getAnalyticsSummary,
  saveAnalysis,
  getAnalyses,
  getAnalysis,
  updateAnalysis,
  deleteAnalysis,
} from "./api"
import { sendChatMessage } from "./chat-api"
import { getUsers, updateUserRole, getModels, createModel, activateModel, getPredictions } from "./admin-api"
import type {
  PropertyPayload,
  PredictionResponse,
  ChatRequest,
  ChatResponse,
  AnalysisPayload,
  Analysis,
} from "./schemas"

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
  return useMutation({
    mutationFn: deleteAnalysis,
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
  return useMutation({
    mutationFn: ({ userId, role }: { userId: string; role: "user" | "admin" }) => updateUserRole(userId, role),
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
