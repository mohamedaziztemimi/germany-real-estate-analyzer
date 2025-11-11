"use client"

import { useMutation, useQuery } from "@tanstack/react-query"
import { predictProperty, getAnalyticsSummary } from "./api"
import { sendChatMessage } from "./chat-api"
import type { PropertyPayload, PredictionResponse } from "./schemas"
import type { ChatRequest, ChatResponse } from "./chat-schemas"

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
