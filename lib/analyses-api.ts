import { apiFetch } from "./api"
import type {
  AnalysisPayload,
  Analysis,
  AnalysisList,
  AnalysisShare,
  AnalysisShareList,
  AnalysisComment,
} from "./analyses-schemas"

// Save new analysis
export async function saveAnalysis(payload: AnalysisPayload): Promise<Analysis> {
  return apiFetch<Analysis>("/analyses", { method: "POST", json: payload })
}

// Get all analyses (paginated)
export async function getAnalyses(page = 1, pageSize = 20): Promise<AnalysisList> {
  return apiFetch<AnalysisList>(`/analyses?page=${page}&page_size=${pageSize}`, { method: "GET" })
}

// Get single analysis by ID
export async function getAnalysis(id: string): Promise<Analysis> {
  return apiFetch<Analysis>(`/analyses/${id}`, { method: "GET" })
}

// Update analysis (title and notes)
export async function updateAnalysis(id: string, data: { title?: string; notes?: string }): Promise<Analysis> {
  return apiFetch<Analysis>(`/analyses/${id}`, { method: "PUT", json: data })
}

// Delete analysis
export async function deleteAnalysis(id: string): Promise<void> {
  await apiFetch<void>(`/analyses/${id}`, { method: "DELETE" })
}

export async function shareAnalysis(analysisId: string, payload: { message?: string }): Promise<AnalysisShare> {
  return apiFetch<AnalysisShare>(`/analyses/${analysisId}/share`, { method: "POST", json: payload })
}

export async function getSharedAnalyses(): Promise<AnalysisShareList> {
  return apiFetch<AnalysisShareList>("/analyses/shared", { method: "GET" })
}

export async function getShareComments(shareId: string): Promise<AnalysisComment[]> {
  return apiFetch<AnalysisComment[]>(`/analyses/shares/${shareId}/comments`, { method: "GET" })
}

export async function addShareComment(shareId: string, body: string): Promise<AnalysisComment> {
  return apiFetch<AnalysisComment>(`/analyses/shares/${shareId}/comments`, { method: "POST", json: { body } })
}

export async function deleteShareComment(shareId: string, commentId: string): Promise<void> {
  await apiFetch<void>(`/analyses/shares/${shareId}/comments/${commentId}`, { method: "DELETE" })
}

export async function toggleShareCommentLike(shareId: string, commentId: string): Promise<AnalysisComment> {
  return apiFetch<AnalysisComment>(`/analyses/shares/${shareId}/comments/${commentId}/like`, { method: "POST" })
}

export async function getShare(shareId: string): Promise<AnalysisShare> {
  return apiFetch<AnalysisShare>(`/analyses/shares/${shareId}`, { method: "GET" })
}
