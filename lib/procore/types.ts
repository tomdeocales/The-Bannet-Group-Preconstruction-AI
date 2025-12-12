export type ProcoreView = "minimal" | "normal" | "extended"

export type ProcorePaginationMeta = {
  page: number
  per_page: number
  total: number
  total_pages: number
}

export type ProcorePaginatedResponse<T> = {
  items: T[]
  meta: ProcorePaginationMeta
}

export type ProcoreCompany = {
  id: number
  name: string
}

export type ProcoreProject = {
  id: number
  name: string
  display_name?: string
  project_number?: string
  address?: string
  address_2?: string
  city?: string
  state_code?: string
  zip?: string
  country_code?: string
  company?: ProcoreCompany
  created_at?: string
  updated_at?: string
  status?: string
}

export type ProcoreVendor = {
  id: number
  name: string
  abbreviated_name?: string
  city?: string
  state_code?: string
  business_phone?: string
  trade_id?: number
  trade_name?: string
  created_at?: string
  updated_at?: string
}

export type ProcoreBidPackageStatus = "Draft" | "Open" | "Closed" | "Awarded" | "Canceled"

export type ProcoreBidPackage = {
  id: number
  title: string
  status: ProcoreBidPackageStatus
  due_date?: string
  created_at?: string
  updated_at?: string
}

export type ProcoreDocumentType = "file" | "folder"

export type ProcoreDocumentEntry = {
  id: number
  name: string
  document_type: ProcoreDocumentType
  parent_id?: number | null
  path?: string
  created_at?: string
  updated_at?: string
}

export type ProcoreUpload = {
  uuid: string
  url: string
  fields: Record<string, string>
}

export type SyncLogStatus = "success" | "warning" | "error" | "info"
export type SyncLogType = "estimate_export" | "zoning_export" | "bidder_push" | "auth" | "directory_sync" | "documents_upload"

export type SyncLogEntry = {
  id: number
  project_id: number
  type: SyncLogType
  status: SyncLogStatus
  message: string
  created_at: string
}
