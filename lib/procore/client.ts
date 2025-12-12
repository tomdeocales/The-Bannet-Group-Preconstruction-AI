import type {
  ProcoreBidPackage,
  ProcoreCompany,
  ProcoreDocumentEntry,
  ProcorePaginatedResponse,
  ProcoreProject,
  ProcoreUpload,
  ProcoreVendor,
  ProcoreView,
  SyncLogEntry,
} from "@/lib/procore/types"

type QueryValue = string | number | boolean | null | undefined

const withQuery = (path: string, query: Record<string, QueryValue>) => {
  const url = new URL(path, "http://localhost")
  for (const [k, v] of Object.entries(query)) {
    if (v === undefined || v === null || v === "") continue
    url.searchParams.set(k, String(v))
  }
  return url.pathname + (url.search ? url.search : "")
}

async function requestJson<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(path, { credentials: "include", ...init })
  const data = (await res.json()) as T
  if (!res.ok) {
    const message = (data as any)?.error || `Request failed: ${res.status}`
    throw new Error(message)
  }
  return data
}

export type GetProjectsParams = {
  page?: number
  per_page?: number
  view?: ProcoreView
  sort?: string
  filters?: { search?: string; name?: string; by_status?: string }
}

export type GetProjectsResponse = ProcorePaginatedResponse<ProcoreProject> & {
  connected: boolean
  company: ProcoreCompany
}

export async function getProjects(params: GetProjectsParams = {}) {
  const query: Record<string, QueryValue> = {
    page: params.page,
    per_page: params.per_page,
    view: params.view,
    sort: params.sort,
  }
  if (params.filters?.search) query["filters[search]"] = params.filters.search
  if (params.filters?.name) query["filters[name]"] = params.filters.name
  if (params.filters?.by_status) query["filters[by_status]"] = params.filters.by_status

  return requestJson<GetProjectsResponse>(withQuery("/api/procore/projects", query))
}

export type GetVendorsParams = {
  page?: number
  per_page?: number
  view?: ProcoreView
  sort?: string
  filters?: { search?: string }
}

export type GetVendorsResponse = ProcorePaginatedResponse<ProcoreVendor> & {
  project_id: number
}

export async function getVendors(projectId: number, params: GetVendorsParams = {}) {
  const query: Record<string, QueryValue> = {
    page: params.page,
    per_page: params.per_page,
    view: params.view,
    sort: params.sort,
  }
  if (params.filters?.search) query["filters[search]"] = params.filters.search

  return requestJson<GetVendorsResponse>(withQuery(`/api/procore/projects/${projectId}/vendors`, query))
}

export type GetBidPackagesParams = {
  page?: number
  per_page?: number
  view?: ProcoreView
  sort?: string
  filters?: { search?: string }
}

export type GetBidPackagesResponse = ProcorePaginatedResponse<ProcoreBidPackage> & {
  project_id: number
}

export async function getBidPackages(projectId: number, params: GetBidPackagesParams = {}) {
  const query: Record<string, QueryValue> = {
    page: params.page,
    per_page: params.per_page,
    view: params.view,
    sort: params.sort,
  }
  if (params.filters?.search) query["filters[search]"] = params.filters.search

  return requestJson<GetBidPackagesResponse>(withQuery(`/api/procore/projects/${projectId}/bid-packages`, query))
}

export type PostAddBiddersResponse =
  | { ok: true; project_id: number; bid_package_id: number; vendor_ids: number[]; notes: string; created_at: string }
  | { ok: false; error: string }

export async function postAddBidders(projectId: number, bidPackageId: number, vendorIds: number[], notes?: string) {
  return requestJson<PostAddBiddersResponse>(`/api/procore/projects/${projectId}/bid-packages/add-bidders`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ bidPackageId, vendorIds, notes }),
  })
}

export type GetDocumentsParams = {
  page?: number
  per_page?: number
  view?: ProcoreView
  sort?: string
  filters?: { search?: string; folder_id?: number }
}

export type GetDocumentsResponse = ProcorePaginatedResponse<ProcoreDocumentEntry> & {
  project_id: number
}

export async function getDocuments(projectId: number, params: GetDocumentsParams = {}) {
  const query: Record<string, QueryValue> = {
    page: params.page,
    per_page: params.per_page,
    view: params.view,
    sort: params.sort,
  }
  if (params.filters?.search) query["filters[search]"] = params.filters.search
  if (params.filters?.folder_id) query["filters[folder_id]"] = params.filters.folder_id

  return requestJson<GetDocumentsResponse>(withQuery(`/api/procore/projects/${projectId}/documents`, query))
}

export type GetSyncLogsParams = {
  page?: number
  per_page?: number
  filters?: { search?: string }
}

export type GetSyncLogsResponse = ProcorePaginatedResponse<SyncLogEntry> & {
  project_id: number
  last_sync_at: string | null
}

export async function getSyncLogs(projectId: number, params: GetSyncLogsParams = {}) {
  const query: Record<string, QueryValue> = { page: params.page, per_page: params.per_page }
  if (params.filters?.search) query["filters[search]"] = params.filters.search
  return requestJson<GetSyncLogsResponse>(withQuery(`/api/procore/projects/${projectId}/sync-logs`, query))
}

export type CreateUploadResponse = { project_id?: number; company_id?: number; upload: ProcoreUpload }

