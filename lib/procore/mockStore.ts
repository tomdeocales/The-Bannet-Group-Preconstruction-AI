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
  SyncLogStatus,
  SyncLogType,
} from "@/lib/procore/types"

type ListOptions = {
  page?: number
  per_page?: number
  view?: ProcoreView
  sort?: string
  filters?: Record<string, string | number | boolean | undefined>
}

type AddBiddersInput = {
  projectId: number
  bidPackageId: number
  vendorIds: number[]
  notes?: string
}

type MockDb = {
  company: ProcoreCompany
  projects: ProcoreProject[]
  vendors: ProcoreVendor[]
  vendorIdsByProjectId: Record<number, number[]>
  bidPackagesByProjectId: Record<number, ProcoreBidPackage[]>
  documentsByProjectId: Record<number, ProcoreDocumentEntry[]>
  syncLogsByProjectId: Record<number, SyncLogEntry[]>
  uploadsByUuid: Record<string, ProcoreUpload>
  counters: { syncLogId: number; uploadCounter: number }
}

declare global {
  // eslint-disable-next-line no-var
  var __bannettProcoreMockDb: MockDb | undefined
}

const DEFAULT_PER_PAGE = 10
const COMPANY_ID = 4279305
const COMPANY_NAME = "The Bannett Group, LTD"

const clampInt = (value: unknown, fallback: number) => {
  const n = typeof value === "string" ? Number.parseInt(value, 10) : typeof value === "number" ? value : NaN
  if (!Number.isFinite(n) || n <= 0) return fallback
  return Math.floor(n)
}

const normalize = (value: string) => value.trim().toLowerCase()

const includesSearch = (haystack: string, query?: string) => {
  if (!query) return true
  const needle = normalize(query)
  if (!needle) return true
  const hay = normalize(haystack)
  const tokens = needle.split(/\s+/).filter(Boolean)
  return tokens.every((t) => hay.includes(t))
}

const toIso = (d: Date) => d.toISOString()

const baseNow = () => new Date("2025-12-12T16:00:00.000Z")

const daysAgo = (n: number) => {
  const d = baseNow()
  d.setUTCDate(d.getUTCDate() - n)
  return d
}

const daysFromNow = (n: number) => {
  const d = baseNow()
  d.setUTCDate(d.getUTCDate() + n)
  return d
}

const mulberry32 = (seed: number) => {
  let t = seed >>> 0
  return () => {
    t += 0x6d2b79f5
    let r = Math.imul(t ^ (t >>> 15), 1 | t)
    r ^= r + Math.imul(r ^ (r >>> 7), 61 | r)
    return ((r ^ (r >>> 14)) >>> 0) / 4294967296
  }
}

const pick = <T,>(rng: () => number, arr: T[]) => arr[Math.floor(rng() * arr.length)]

const formatPhone = (rng: () => number) => {
  const area = pick(rng, ["503", "971", "541", "360", "206", "425"])
  const exch = String(Math.floor(200 + rng() * 700)).padStart(3, "0")
  const line = String(Math.floor(1000 + rng() * 9000)).padStart(4, "0")
  return `(${area}) ${exch}-${line}`
}

const seedProjects = (): ProcoreProject[] => {
  const company: ProcoreCompany = { id: COMPANY_ID, name: COMPANY_NAME }
  const base = [
    {
      id: 124512,
      name: "Riverside Medical Center",
      display_name: "Riverside Medical Center",
      project_number: "BG-25-041",
      address: "1120 SE 8th Ave",
      city: "Portland",
      state_code: "OR",
      zip: "97214",
      status: "Active",
      updated_at: toIso(daysAgo(1)),
      created_at: toIso(daysAgo(210)),
    },
    {
      id: 124513,
      name: "Harbor View Office Complex",
      display_name: "Harbor View Office Complex",
      project_number: "BG-25-038",
      address: "501 Dockside Blvd",
      city: "Tacoma",
      state_code: "WA",
      zip: "98402",
      status: "Active",
      updated_at: toIso(daysAgo(2)),
      created_at: toIso(daysAgo(240)),
    },
    {
      id: 124514,
      name: "Westfield Shopping Plaza",
      display_name: "Westfield Shopping Plaza",
      project_number: "BG-25-029",
      address: "2400 Lancaster Dr NE",
      city: "Salem",
      state_code: "OR",
      zip: "97305",
      status: "Preconstruction",
      updated_at: toIso(daysAgo(0)),
      created_at: toIso(daysAgo(160)),
    },
    {
      id: 124515,
      name: "Downtown Transit Hub",
      display_name: "Downtown Transit Hub",
      project_number: "BG-25-017",
      address: "350 5th Ave",
      city: "Eugene",
      state_code: "OR",
      zip: "97401",
      status: "Preconstruction",
      updated_at: toIso(daysAgo(3)),
      created_at: toIso(daysAgo(120)),
    },
    {
      id: 124516,
      name: "Lakeside Residential Tower",
      display_name: "Lakeside Residential Tower",
      project_number: "BG-25-012",
      address: "98 Waterfront Way",
      city: "Vancouver",
      state_code: "WA",
      zip: "98660",
      status: "Active",
      updated_at: toIso(daysAgo(4)),
      created_at: toIso(daysAgo(320)),
    },
    {
      id: 124517,
      name: "Maple Ridge Senior Living Renovation",
      display_name: "Maple Ridge Senior Living Renovation",
      project_number: "BG-25-052",
      address: "7800 Maple Ridge Dr",
      city: "Hillsboro",
      state_code: "OR",
      zip: "97123",
      status: "Preconstruction",
      updated_at: toIso(daysAgo(2)),
      created_at: toIso(daysAgo(90)),
    },
    {
      id: 124518,
      name: "Pine Street Retail Buildout — Suite 210",
      display_name: "Pine Street Retail Buildout — Suite 210",
      project_number: "BG-25-055",
      address: "210 Pine St",
      city: "Portland",
      state_code: "OR",
      zip: "97205",
      status: "Active",
      updated_at: toIso(daysAgo(5)),
      created_at: toIso(daysAgo(75)),
    },
    {
      id: 124519,
      name: "Evergreen Data Center Expansion",
      display_name: "Evergreen Data Center Expansion",
      project_number: "BG-25-034",
      address: "1550 Tech Loop",
      city: "Beaverton",
      state_code: "OR",
      zip: "97005",
      status: "Active",
      updated_at: toIso(daysAgo(6)),
      created_at: toIso(daysAgo(260)),
    },
    {
      id: 124520,
      name: "Cedar Grove K–8 Modernization",
      display_name: "Cedar Grove K–8 Modernization",
      project_number: "BG-25-021",
      address: "410 Cedar Grove Rd",
      city: "Gresham",
      state_code: "OR",
      zip: "97030",
      status: "Preconstruction",
      updated_at: toIso(daysAgo(1)),
      created_at: toIso(daysAgo(140)),
    },
    {
      id: 124521,
      name: "Northpoint Logistics Warehouse",
      display_name: "Northpoint Logistics Warehouse",
      project_number: "BG-25-009",
      address: "8900 NE Airport Way",
      city: "Portland",
      state_code: "OR",
      zip: "97220",
      status: "Active",
      updated_at: toIso(daysAgo(8)),
      created_at: toIso(daysAgo(410)),
    },
    {
      id: 124522,
      name: "Seaside Hotel Lobby Renovation",
      display_name: "Seaside Hotel Lobby Renovation",
      project_number: "BG-25-060",
      address: "12 Oceanfront Ave",
      city: "Seaside",
      state_code: "OR",
      zip: "97138",
      status: "Preconstruction",
      updated_at: toIso(daysAgo(0)),
      created_at: toIso(daysAgo(45)),
    },
    {
      id: 124523,
      name: "Summit Biotech Lab Fit-Out",
      display_name: "Summit Biotech Lab Fit-Out",
      project_number: "BG-25-044",
      address: "600 Innovation Dr",
      city: "Seattle",
      state_code: "WA",
      zip: "98109",
      status: "Active",
      updated_at: toIso(daysAgo(3)),
      created_at: toIso(daysAgo(190)),
    },
  ] satisfies Array<Omit<ProcoreProject, "company" | "country_code" | "address_2">>

  return base.map((p) => ({ ...p, country_code: "US", company }))
}

const seedVendors = () => {
  const rng = mulberry32(90210)
  const trades: Array<{ id: number; name: string }> = [
    { id: 101, name: "Electrical" },
    { id: 102, name: "HVAC" },
    { id: 103, name: "Plumbing" },
    { id: 104, name: "Fire Protection" },
    { id: 105, name: "Drywall" },
    { id: 106, name: "Concrete" },
    { id: 107, name: "Roofing" },
    { id: 108, name: "Flooring" },
    { id: 109, name: "Glazing" },
    { id: 110, name: "Painting" },
    { id: 111, name: "Steel" },
    { id: 112, name: "Civil/Site" },
    { id: 113, name: "Masonry" },
    { id: 114, name: "Doors & Hardware" },
    { id: 115, name: "Demolition" },
  ]

  const cityPool = [
    { city: "Portland", state: "OR" },
    { city: "Beaverton", state: "OR" },
    { city: "Hillsboro", state: "OR" },
    { city: "Gresham", state: "OR" },
    { city: "Tigard", state: "OR" },
    { city: "Clackamas", state: "OR" },
    { city: "Vancouver", state: "WA" },
    { city: "Tacoma", state: "WA" },
    { city: "Seattle", state: "WA" },
    { city: "Bellevue", state: "WA" },
    { city: "Eugene", state: "OR" },
    { city: "Salem", state: "OR" },
  ]

  const prefixes = [
    "Summit",
    "Cascade",
    "Evergreen",
    "IronBridge",
    "Keystone",
    "NorthStar",
    "BlueLine",
    "Atlas",
    "Pioneer",
    "Apex",
    "Harbor",
    "Union",
    "Metro",
    "Redwood",
    "Coastal",
    "TriCounty",
    "Cedar",
    "Willamette",
    "Rainier",
    "Columbia",
  ]

  const suffixes = [
    "Services",
    "Group",
    "Contracting",
    "Mechanical",
    "Electric",
    "Plumbing",
    "Fire Protection",
    "Interiors",
    "Builders",
    "Construction",
    "Systems",
    "Solutions",
    "Co.",
    "LLC",
    "Inc",
    "Partners",
    "Industries",
    "Enterprises",
  ]

  const usedNames = new Set<string>()
  const vendors: ProcoreVendor[] = []

  for (let i = 0; i < 84; i += 1) {
    const trade = pick(rng, trades)
    let name = ""
    for (let tries = 0; tries < 20; tries += 1) {
      const candidate = `${pick(rng, prefixes)} ${trade.name} ${pick(rng, suffixes)}`.replace(/\s+/g, " ").trim()
      if (!usedNames.has(candidate)) {
        usedNames.add(candidate)
        name = candidate
        break
      }
    }
    if (!name) name = `${pick(rng, prefixes)} ${trade.name} ${i + 1}`

    const loc = pick(rng, cityPool)
    const id = 9000 + i + 1
    vendors.push({
      id,
      name,
      abbreviated_name: name.replace(/(Services|Group|Contracting|Construction|Solutions|Enterprises|Industries|Partners)\b/g, "").trim(),
      city: loc.city,
      state_code: loc.state,
      business_phone: formatPhone(rng),
      trade_id: trade.id,
      trade_name: trade.name,
      created_at: toIso(daysAgo(500 - i * 3)),
      updated_at: toIso(daysAgo((i % 14) + 1)),
    })
  }

  return { vendors, trades }
}

const seedBidPackages = (projects: ProcoreProject[]) => {
  const rng = mulberry32(12345)
  const statuses: ProcoreBidPackage["status"][] = ["Draft", "Open", "Closed", "Awarded"]
  const templates = [
    "MEP Bid Package",
    "Concrete & Foundations",
    "Structural Steel Package",
    "Interiors — Drywall & ACT",
    "Sitework & Utilities",
    "Roofing & Waterproofing",
    "Doors, Frames & Hardware",
    "Glazing & Curtain Wall",
    "Fire Protection",
    "Finishes — Flooring & Paint",
  ]

  const byProject: Record<number, ProcoreBidPackage[]> = {}

  for (const p of projects) {
    const countRoll = rng()
    const count = countRoll < 0.18 ? 0 : 5 + Math.floor(rng() * 6) // 5–10, sometimes none
    const items: ProcoreBidPackage[] = []
    for (let i = 0; i < count; i += 1) {
      const id = Number(`${p.id}${i + 1}`)
      const title = `${pick(rng, templates)} — ${p.name}`
      const status = pick(rng, statuses)
      const due = toIso(daysFromNow(4 + Math.floor(rng() * 22))).slice(0, 10)
      items.push({
        id,
        title,
        status,
        due_date: due,
        created_at: toIso(daysAgo(30 + i * 2)),
        updated_at: toIso(daysAgo(i % 9)),
      })
    }
    byProject[p.id] = items
  }

  return byProject
}

const seedDocuments = (projects: ProcoreProject[]) => {
  const rng = mulberry32(777)
  const byProject: Record<number, ProcoreDocumentEntry[]> = {}

  for (const p of projects) {
    let nextId = Number(`44${String(p.id).slice(-3)}00`)
    const rootFolders = [
      { name: "Drawings" },
      { name: "Specifications" },
      { name: "Preconstruction" },
      { name: "Photos" },
    ]

    const entries: ProcoreDocumentEntry[] = []
    const topFolderIds: Record<string, number> = {}

    for (const f of rootFolders) {
      nextId += 1
      topFolderIds[f.name] = nextId
      entries.push({
        id: nextId,
        name: f.name,
        document_type: "folder",
        parent_id: null,
        path: f.name,
        created_at: toIso(daysAgo(120)),
        updated_at: toIso(daysAgo(3)),
      })
    }

    const preconId = topFolderIds["Preconstruction"]
    const subFolders = [
      { name: "Zoning", parent: preconId },
      { name: "Estimates", parent: preconId },
      { name: "Bid Packages", parent: preconId },
      { name: "Reports", parent: preconId },
    ]

    const subFolderIds: Record<string, number> = {}
    for (const f of subFolders) {
      nextId += 1
      subFolderIds[f.name] = nextId
      entries.push({
        id: nextId,
        name: f.name,
        document_type: "folder",
        parent_id: f.parent,
        path: `Preconstruction/${f.name}`,
        created_at: toIso(daysAgo(110)),
        updated_at: toIso(daysAgo(2)),
      })
    }

    const files: Array<{ folder: string; name: string }> = [
      { folder: "Drawings", name: "Drawings_Set_A01-A12.pdf" },
      { folder: "Drawings", name: "Structural_S01-S08.pdf" },
      { folder: "Specifications", name: "Project_Manual_Vol_1.pdf" },
      { folder: "Specifications", name: "Division_08_Openings.pdf" },
      { folder: "Zoning", name: "Zoning_Summary_Executive.pdf" },
      { folder: "Zoning", name: "Planning_Notes_and_Flags.docx" },
      { folder: "Estimates", name: "Estimate_Draft_Phase_1_Foundation.xlsx" },
      { folder: "Estimates", name: "Estimate_Review_Checklist.pdf" },
      { folder: "Bid Packages", name: "Bid_Package_MEP_Invite_List.xlsx" },
      { folder: "Reports", name: "Preconstruction_Risk_Register.xlsx" },
    ]

    for (const file of files) {
      nextId += 1
      const parent_id = file.folder in topFolderIds ? topFolderIds[file.folder] : subFolderIds[file.folder] ?? preconId
      entries.push({
        id: nextId,
        name: file.name,
        document_type: "file",
        parent_id,
        path:
          file.folder in topFolderIds
            ? `${file.folder}/${file.name}`
            : `Preconstruction/${file.folder}/${file.name}`,
        created_at: toIso(daysAgo(20 + Math.floor(rng() * 40))),
        updated_at: toIso(daysAgo(Math.floor(rng() * 9))),
      })
    }

    byProject[p.id] = entries
  }

  return byProject
}

const seedSyncLogs = (projects: ProcoreProject[]) => {
  const rng = mulberry32(31337)
  const byProject: Record<number, SyncLogEntry[]> = {}
  let id = 1000

  const baseMessages = [
    { type: "estimate_export" as const, status: "success" as const, msg: "Estimate exported to Budget module." },
    { type: "bidder_push" as const, status: "success" as const, msg: "Bidders added to bid package." },
    { type: "zoning_export" as const, status: "success" as const, msg: "Zoning summary uploaded to Documents." },
    { type: "documents_upload" as const, status: "warning" as const, msg: "Upload completed with validation warnings." },
    { type: "directory_sync" as const, status: "error" as const, msg: "Directory sync failed for 1 vendor (duplicate)." },
    { type: "auth" as const, status: "info" as const, msg: "Procore connection authorized." },
  ]

  for (const p of projects) {
    const entries: SyncLogEntry[] = []
    const count = 5 + Math.floor(rng() * 4)
    for (let i = 0; i < count; i += 1) {
      const base = pick(rng, baseMessages)
      id += 1
      entries.push({
        id,
        project_id: p.id,
        type: base.type,
        status: base.status,
        message: `${base.msg} (${p.project_number ?? p.name})`,
        created_at: toIso(daysAgo(1 + Math.floor(rng() * 9))),
      })
    }
    byProject[p.id] = entries.sort((a, b) => (a.created_at < b.created_at ? 1 : -1))
  }

  return { byProject, nextId: id + 1 }
}

const seedDb = (): MockDb => {
  const projects = seedProjects()
  const { vendors } = seedVendors()
  const bidPackagesByProjectId = seedBidPackages(projects)
  const documentsByProjectId = seedDocuments(projects)
  const syncSeed = seedSyncLogs(projects)

  const rng = mulberry32(424242)
  const vendorIdsByProjectId: Record<number, number[]> = {}
  for (const p of projects) {
    const count = 26 + Math.floor(rng() * 22) // 26–47 vendors per project
    const ids = new Set<number>()
    while (ids.size < Math.min(count, vendors.length)) {
      ids.add(pick(rng, vendors).id)
    }
    vendorIdsByProjectId[p.id] = Array.from(ids)
  }

  return {
    company: { id: COMPANY_ID, name: COMPANY_NAME },
    projects,
    vendors,
    vendorIdsByProjectId,
    bidPackagesByProjectId,
    documentsByProjectId,
    syncLogsByProjectId: syncSeed.byProject,
    uploadsByUuid: {},
    counters: { syncLogId: syncSeed.nextId, uploadCounter: 0 },
  }
}

const db: MockDb = globalThis.__bannettProcoreMockDb ?? seedDb()
globalThis.__bannettProcoreMockDb = db

const paginate = <T,>(items: T[], page: number, per_page: number): ProcorePaginatedResponse<T> => {
  const total = items.length
  const total_pages = Math.max(1, Math.ceil(total / per_page))
  const safePage = Math.min(Math.max(1, page), total_pages)
  const start = (safePage - 1) * per_page
  const end = start + per_page
  return {
    items: items.slice(start, end),
    meta: { page: safePage, per_page, total, total_pages },
  }
}

const viewProject = (p: ProcoreProject, view: ProcoreView) => {
  if (view === "minimal") return { id: p.id, name: p.name, display_name: p.display_name } satisfies ProcoreProject
  if (view === "extended") return p
  return {
    id: p.id,
    name: p.name,
    display_name: p.display_name,
    project_number: p.project_number,
    city: p.city,
    state_code: p.state_code,
    updated_at: p.updated_at,
    status: p.status,
  } satisfies ProcoreProject
}

const viewVendor = (v: ProcoreVendor, view: ProcoreView) => {
  if (view === "minimal") return { id: v.id, name: v.name, trade_id: v.trade_id, trade_name: v.trade_name } satisfies ProcoreVendor
  if (view === "extended") return v
  return {
    id: v.id,
    name: v.name,
    city: v.city,
    state_code: v.state_code,
    business_phone: v.business_phone,
    trade_id: v.trade_id,
    trade_name: v.trade_name,
    updated_at: v.updated_at,
  } satisfies ProcoreVendor
}

const viewBidPackage = (b: ProcoreBidPackage, view: ProcoreView) => {
  if (view === "minimal") return { id: b.id, title: b.title, status: b.status, due_date: b.due_date } satisfies ProcoreBidPackage
  if (view === "extended") return b
  return {
    id: b.id,
    title: b.title,
    status: b.status,
    due_date: b.due_date,
    updated_at: b.updated_at,
  } satisfies ProcoreBidPackage
}

const viewDocument = (d: ProcoreDocumentEntry, view: ProcoreView) => {
  if (view === "minimal") return { id: d.id, name: d.name, document_type: d.document_type, parent_id: d.parent_id } satisfies ProcoreDocumentEntry
  if (view === "extended") return d
  return {
    id: d.id,
    name: d.name,
    document_type: d.document_type,
    parent_id: d.parent_id,
    updated_at: d.updated_at,
    path: d.path,
  } satisfies ProcoreDocumentEntry
}

export function listProjects(options: ListOptions = {}): ProcorePaginatedResponse<ProcoreProject> {
  const page = clampInt(options.page, 1)
  const per_page = clampInt(options.per_page, DEFAULT_PER_PAGE)
  const view = options.view ?? "normal"

  const search = (options.filters?.["search"] as string | undefined) ?? (options.filters?.["name"] as string | undefined)
  const byStatus = options.filters?.["by_status"] as string | undefined

  const filtered = db.projects
    .filter((p) => includesSearch(`${p.name} ${p.display_name ?? ""} ${p.project_number ?? ""}`, search))
    .filter((p) => {
      if (!byStatus || byStatus === "All") return true
      return normalize(p.status ?? "") === normalize(byStatus)
    })
    .sort((a, b) => (a.updated_at ?? "") < (b.updated_at ?? "") ? 1 : -1)
    .map((p) => viewProject(p, view))

  return paginate(filtered, page, per_page)
}

export function listProjectVendors(projectId: number, options: ListOptions = {}): ProcorePaginatedResponse<ProcoreVendor> {
  const page = clampInt(options.page, 1)
  const per_page = clampInt(options.per_page, DEFAULT_PER_PAGE)
  const view = options.view ?? "normal"
  const search = options.filters?.["search"] as string | undefined

  const vendorIds = db.vendorIdsByProjectId[projectId] ?? []
  const vendorSet = new Set(vendorIds)

  const filtered = db.vendors
    .filter((v) => vendorSet.has(v.id))
    .filter((v) => includesSearch(`${v.name} ${v.trade_name ?? ""} ${v.city ?? ""} ${v.state_code ?? ""}`, search))

  const sort = options.sort ?? ""
  const sorted = [...filtered].sort((a, b) => {
    if (sort === "name") return a.name.localeCompare(b.name)
    if (sort === "-name") return b.name.localeCompare(a.name)
    if (sort === "updated_at") return (a.updated_at ?? "").localeCompare(b.updated_at ?? "")
    if (sort === "-updated_at") return (b.updated_at ?? "").localeCompare(a.updated_at ?? "")
    return a.name.localeCompare(b.name)
  })

  return paginate(sorted.map((v) => viewVendor(v, view)), page, per_page)
}

export function listProjectBidPackages(projectId: number, options: ListOptions = {}): ProcorePaginatedResponse<ProcoreBidPackage> {
  const page = clampInt(options.page, 1)
  const per_page = clampInt(options.per_page, DEFAULT_PER_PAGE)
  const view = options.view ?? "normal"
  const search = options.filters?.["search"] as string | undefined

  const packages = db.bidPackagesByProjectId[projectId] ?? []
  const filtered = packages
    .filter((b) => includesSearch(`${b.title} ${b.status}`, search))
    .sort((a, b) => (a.due_date ?? "") < (b.due_date ?? "") ? -1 : 1)
    .map((b) => viewBidPackage(b, view))

  return paginate(filtered, page, per_page)
}

export function listProjectDocuments(projectId: number, options: ListOptions = {}): ProcorePaginatedResponse<ProcoreDocumentEntry> {
  const page = clampInt(options.page, 1)
  const per_page = clampInt(options.per_page, DEFAULT_PER_PAGE)
  const view = options.view ?? "normal"
  const search = options.filters?.["search"] as string | undefined
  const folderIdRaw = options.filters?.["folder_id"]
  const folder_id = typeof folderIdRaw === "string" ? Number.parseInt(folderIdRaw, 10) : typeof folderIdRaw === "number" ? folderIdRaw : null

  const docs = db.documentsByProjectId[projectId] ?? []
  const filtered = docs
    .filter((d) => (folder_id === null ? d.parent_id === null : d.parent_id === folder_id))
    .filter((d) => includesSearch(`${d.name} ${d.path ?? ""} ${d.document_type}`, search))

  const sort = options.sort ?? ""
  const sorted = [...filtered].sort((a, b) => {
    if (sort === "name") return a.name.localeCompare(b.name)
    if (sort === "-name") return b.name.localeCompare(a.name)
    if (sort === "updated_at") return (a.updated_at ?? "").localeCompare(b.updated_at ?? "")
    if (sort === "-updated_at") return (b.updated_at ?? "").localeCompare(a.updated_at ?? "")
    return a.name.localeCompare(b.name)
  })

  return paginate(sorted.map((d) => viewDocument(d, view)), page, per_page)
}

const nextSyncLogId = () => {
  db.counters.syncLogId += 1
  return db.counters.syncLogId
}

export function appendSyncLog(projectId: number, entry: Omit<SyncLogEntry, "id" | "project_id" | "created_at"> & { created_at?: string }) {
  const next: SyncLogEntry = {
    id: nextSyncLogId(),
    project_id: projectId,
    created_at: entry.created_at ?? toIso(new Date()),
    type: entry.type,
    status: entry.status,
    message: entry.message,
  }
  const prev = db.syncLogsByProjectId[projectId] ?? []
  db.syncLogsByProjectId[projectId] = [next, ...prev]
  return next
}

export function listProjectSyncLogs(projectId: number, options: ListOptions = {}) {
  const page = clampInt(options.page, 1)
  const per_page = clampInt(options.per_page, DEFAULT_PER_PAGE)
  const search = options.filters?.["search"] as string | undefined
  const logs = db.syncLogsByProjectId[projectId] ?? []
  const filtered = logs.filter((l) => includesSearch(`${l.message} ${l.type} ${l.status}`, search))
  return paginate(filtered, page, per_page)
}

export function addBidders(input: AddBiddersInput) {
  const { projectId, bidPackageId, vendorIds, notes } = input
  const bidPackages = db.bidPackagesByProjectId[projectId] ?? []
  const target = bidPackages.find((b) => b.id === bidPackageId)

  if (!target) {
    return { ok: false as const, error: "Bid package not found" }
  }

  const now = toIso(new Date())
  target.updated_at = now

  appendSyncLog(projectId, {
    type: "bidder_push",
    status: "success",
    message: `Added ${vendorIds.length} bidder(s) to “${target.title}”.`,
  })

  return {
    ok: true as const,
    project_id: projectId,
    bid_package_id: bidPackageId,
    vendor_ids: vendorIds,
    notes: notes ?? "",
    created_at: now,
  }
}

const makeUuid = (n: number) => {
  const hex = n.toString(16).padStart(8, "0")
  return `mock-${hex}-bannett-${hex}`
}

export function createUpload(params: { projectId?: number; companyId?: number; filename: string; contentType: string; size: number }): ProcoreUpload {
  db.counters.uploadCounter += 1
  const uuid = makeUuid(db.counters.uploadCounter)

  const upload: ProcoreUpload = {
    uuid,
    url: "https://uploads.procore.com/mock",
    fields: {
      key: `uploads/${uuid}/${params.filename}`,
      "Content-Type": params.contentType,
      "x-amz-meta-filename": params.filename,
      "x-amz-meta-size": String(params.size),
      policy: "mock-policy",
      "x-amz-signature": "mock-signature",
    },
  }

  db.uploadsByUuid[uuid] = upload

  if (params.projectId) {
    appendSyncLog(params.projectId, {
      type: "documents_upload",
      status: "info",
      message: `Prepared upload for “${params.filename}”.`,
    })
  }

  return upload
}

export function getCompany() {
  return db.company
}

export function getProjectById(projectId: number) {
  return db.projects.find((p) => p.id === projectId) ?? null
}

export function getVendorById(vendorId: number) {
  return db.vendors.find((v) => v.id === vendorId) ?? null
}

export function getLastSyncAt(projectId: number) {
  const logs = db.syncLogsByProjectId[projectId] ?? []
  return logs[0]?.created_at ?? null
}

export const getMockDbSnapshot = () => ({
  company: db.company,
  projects: db.projects,
})
