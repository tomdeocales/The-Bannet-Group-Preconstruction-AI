import type {
  ProcoreBidPackage,
  ProcoreBid,
  ProcoreCompany,
  ProcoreCostCode,
  ProcoreDocumentEntry,
  ProcoreDrawingSet,
  ProcoreDrawingUpload,
  ProcoreEmbeddedAppConfig,
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
  appConfig: ProcoreEmbeddedAppConfig
  projects: ProcoreProject[]
  vendors: ProcoreVendor[]
  costCodes: ProcoreCostCode[]
  vendorIdsByProjectId: Record<number, number[]>
  bidPackagesByProjectId: Record<number, ProcoreBidPackage[]>
  bidsByProjectId: Record<number, Record<number, ProcoreBid[]>>
  bidPackageDocumentsByProjectId: Record<number, Record<number, ProcoreDocumentEntry[]>>
  documentsByProjectId: Record<number, ProcoreDocumentEntry[]>
  drawingSetsByProjectId: Record<number, ProcoreDrawingSet[]>
  drawingUploadsByProjectId: Record<number, ProcoreDrawingUpload[]>
  syncLogsByProjectId: Record<number, SyncLogEntry[]>
  uploadsByUuid: Record<string, ProcoreUpload>
  counters: { syncLogId: number; uploadCounter: number; drawingUploadId: number; bidId: number }
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

const seedAppConfig = (projects: ProcoreProject[]): ProcoreEmbeddedAppConfig => {
  const now = toIso(daysAgo(0))
  return {
    app_name: "The Bannett Group — Preconstruction AI Tool",
    installed: true,
    version_key: "bannett-precon-ai-tool@mock-1.0.0",
    configuration_name: "Bannett Preconstruction (Embedded App)",
    enabled_project_ids: projects.map((p) => p.id),
    required_permissions: [
      {
        area: "Projects",
        level: "read",
        description: "Read project metadata for selectors and context routing.",
        endpoint_examples: ["/rest/v1.0/projects"],
      },
      {
        area: "Directory (Vendors)",
        level: "read",
        description: "List project vendors for subcontractor matching and bid invites.",
        endpoint_examples: ["/rest/v1.0/projects/:project_id/vendors"],
      },
      {
        area: "Preconstruction (Planroom / Bidding)",
        level: "write",
        description: "Read bid packages and create bidder entries (bids) in a bid package.",
        endpoint_examples: [
          "/rest/v1.1/projects/:project_id/bid_packages",
          "/rest/v1.0/projects/:project_id/bid_packages/:bid_package_id/bids",
        ],
      },
      {
        area: "Documents",
        level: "write",
        description: "Prepare uploads and (when implemented) associate exports into project Documents.",
        endpoint_examples: ["/rest/v2.0/projects/:project_id/documents", "/rest/v1.1/projects/:project_id/uploads"],
      },
    ],
    notes: [
      "Installed by a Company Admin via Procore App Management using the App Version Key.",
      "Configuration must be applied to projects to appear under “Select an App” in Procore.",
      "In live mode, missing OAuth scopes/permissions will result in 401/403 responses from Procore APIs.",
    ],
    created_at: now,
    updated_at: now,
  }
}

const seedCostCodes = (): ProcoreCostCode[] => {
  const now = toIso(daysAgo(0))
  const mk = (id: number, full_code: string, name: string): ProcoreCostCode => ({
    id,
    full_code,
    name,
    created_at: toIso(daysAgo(420)),
    updated_at: now,
  })

  return [
    mk(501, "01 10 00", "Summary of Work"),
    mk(502, "01 25 00", "Substitution Procedures"),
    mk(503, "01 30 00", "Administrative Requirements"),
    mk(504, "01 50 00", "Temporary Facilities and Controls"),
    mk(505, "02 41 19", "Selective Demolition"),
    mk(506, "03 30 00", "Cast-in-Place Concrete"),
    mk(507, "03 35 00", "Concrete Finishing"),
    mk(508, "04 20 00", "Unit Masonry"),
    mk(509, "05 12 00", "Structural Steel Framing"),
    mk(510, "05 50 00", "Metal Fabrications"),
    mk(511, "06 10 00", "Rough Carpentry"),
    mk(512, "07 21 00", "Thermal Insulation"),
    mk(513, "07 27 00", "Air Barriers"),
    mk(514, "07 52 00", "Modified Bituminous Membrane Roofing"),
    mk(515, "08 11 13", "Hollow Metal Doors and Frames"),
    mk(516, "08 41 13", "Aluminum-Framed Entrances and Storefronts"),
    mk(517, "09 21 16", "Gypsum Board Assemblies"),
    mk(518, "09 29 00", "Gypsum Board"),
    mk(519, "09 51 13", "Acoustical Panel Ceilings"),
    mk(520, "09 65 00", "Resilient Flooring"),
    mk(521, "09 91 13", "Exterior Painting"),
    mk(522, "10 14 00", "Signage"),
    mk(523, "21 13 13", "Wet-Pipe Sprinkler Systems"),
    mk(524, "22 05 00", "Common Work Results for Plumbing"),
    mk(525, "22 40 00", "Plumbing Fixtures"),
    mk(526, "23 05 00", "Common Work Results for HVAC"),
    mk(527, "23 31 00", "HVAC Ducts and Casings"),
    mk(528, "23 37 00", "Air Outlets and Inlets"),
    mk(529, "26 05 00", "Common Work Results for Electrical"),
    mk(530, "26 05 19", "Low-Voltage Electrical Power Conductors and Cables"),
    mk(531, "26 51 00", "Interior Lighting"),
    mk(532, "27 05 00", "Common Work Results for Communications"),
    mk(533, "28 31 00", "Fire Detection and Alarm"),
  ]
}

const seedDrawingSets = (projects: ProcoreProject[]) => {
  const rng = mulberry32(8675309)
  const byProject: Record<number, ProcoreDrawingSet[]> = {}

  for (const p of projects) {
    const baseId = Number(`77${String(p.id).slice(-3)}`)
    const isPrecon = normalize(p.status ?? "").includes("preconstruction")
    const names = isPrecon ? ["Issued for Bid", "Permit Set"] : ["IFC Set", "Bulletin / Addendum"]
    byProject[p.id] = names.map((name, idx) => ({
      id: baseId + idx + 1,
      name,
      created_at: toIso(daysAgo(90 + Math.floor(rng() * 40))),
      updated_at: toIso(daysAgo(Math.floor(rng() * 6))),
    }))
  }

  return byProject
}

const seedDrawingUploads = (projects: ProcoreProject[], drawingSetsByProjectId: Record<number, ProcoreDrawingSet[]>) => {
  const rng = mulberry32(24680)
  const byProject: Record<number, ProcoreDrawingUpload[]> = {}
  let id = 2000

  for (const p of projects) {
    const sets = drawingSetsByProjectId[p.id] ?? []
    const count = 1 + Math.floor(rng() * 3)
    const items: ProcoreDrawingUpload[] = []
    for (let i = 0; i < count; i += 1) {
      id += 1
      const set = sets.length ? pick(rng, sets) : null
      const sheets = 6 + Math.floor(rng() * 14)
      const pages = sheets * (2 + Math.floor(rng() * 3))
      items.push({
        id,
        filename: `${p.project_number ?? `PRJ-${p.id}`}_Drawings_${i + 1}.pdf`,
        drawing_set_id: set?.id ?? null,
        status: rng() > 0.12 ? "complete" : "processing",
        sheet_count: sheets,
        page_count: pages,
        created_at: toIso(daysAgo(12 + Math.floor(rng() * 18))),
        updated_at: toIso(daysAgo(Math.floor(rng() * 5))),
      })
    }
    byProject[p.id] = items.sort((a, b) => (a.created_at < b.created_at ? 1 : -1))
  }

  return { byProject, nextId: id + 1 }
}

const seedBidPackageDocuments = (
  projects: ProcoreProject[],
  documentsByProjectId: Record<number, ProcoreDocumentEntry[]>,
  bidPackagesByProjectId: Record<number, ProcoreBidPackage[]>,
) => {
  const rng = mulberry32(606060)
  const byProject: Record<number, Record<number, ProcoreDocumentEntry[]>> = {}

  const attachmentTemplates = [
    { prefix: "Scope_Narrative", ext: "pdf" },
    { prefix: "Bid_Form", ext: "xlsx" },
    { prefix: "Addendum_1", ext: "pdf" },
    { prefix: "Specs_Excerpt", ext: "pdf" },
  ]

  for (const p of projects) {
    const docs = [...(documentsByProjectId[p.id] ?? [])]
    const bidPackagesFolder = docs.find((d) => d.document_type === "folder" && d.path === "Preconstruction/Bid Packages") ?? null
    const packages = bidPackagesByProjectId[p.id] ?? []
    const mapping: Record<number, ProcoreDocumentEntry[]> = {}

    if (!bidPackagesFolder || packages.length === 0) {
      byProject[p.id] = mapping
      continue
    }

    let nextId = docs.reduce((acc, d) => Math.max(acc, d.id), 0)

    for (const bp of packages) {
      const countRoll = rng()
      const count = countRoll < 0.25 ? 1 : countRoll < 0.75 ? 2 : 3
      const picked = Array.from({ length: count }).map(() => pick(rng, attachmentTemplates))
      const attachments: ProcoreDocumentEntry[] = []

      for (const t of picked) {
        nextId += 1
        const name = `${t.prefix}_${bp.id}.${t.ext}`
        const created_at = toIso(daysAgo(12 + Math.floor(rng() * 28)))
        const updated_at = toIso(daysAgo(Math.floor(rng() * 6)))
        const entry: ProcoreDocumentEntry = {
          id: nextId,
          name,
          document_type: "file",
          parent_id: bidPackagesFolder.id,
          path: `Preconstruction/Bid Packages/${name}`,
          created_at,
          updated_at,
        }
        docs.push(entry)
        attachments.push(entry)
      }

      mapping[bp.id] = attachments
    }

    documentsByProjectId[p.id] = docs
    byProject[p.id] = mapping
  }

  return byProject
}

const seedBidPackageBids = (
  projects: ProcoreProject[],
  vendorIdsByProjectId: Record<number, number[]>,
  bidPackagesByProjectId: Record<number, ProcoreBidPackage[]>,
) => {
  const rng = mulberry32(505050)
  const byProject: Record<number, Record<number, ProcoreBid[]>> = {}
  let id = 3000

  for (const p of projects) {
    const vendorIds = vendorIdsByProjectId[p.id] ?? []
    const packages = bidPackagesByProjectId[p.id] ?? []
    const mapping: Record<number, ProcoreBid[]> = {}

    for (const bp of packages) {
      const count = Math.min(vendorIds.length, 2 + Math.floor(rng() * 4)) // 2–5
      const picked = new Set<number>()
      while (picked.size < count && vendorIds.length) {
        picked.add(pick(rng, vendorIds))
      }

      const bids: ProcoreBid[] = []
      for (const vendor_id of picked) {
        id += 1
        const submitted = rng() > 0.55
        const baseAmount = 85_000 + rng() * 640_000
        bids.push({
          id,
          bid_package_id: bp.id,
          vendor_id,
          submitted,
          lump_sum_amount: submitted ? Math.round(baseAmount) : null,
          bidder_comments: submitted ? "Included standard exclusions and clarifications." : "Invitation acknowledged.",
          is_bidder_committed: rng() > 0.8,
          created_at: toIso(daysAgo(8 + Math.floor(rng() * 10))),
          updated_at: toIso(daysAgo(Math.floor(rng() * 4))),
        })
      }

      mapping[bp.id] = bids.sort((a, b) => (a.updated_at ?? "") < (b.updated_at ?? "") ? 1 : -1)
    }

    byProject[p.id] = mapping
  }

  return { byProject, nextId: id + 1 }
}

const seedDb = (): MockDb => {
  const projects = seedProjects()
  const { vendors } = seedVendors()
  const bidPackagesByProjectId = seedBidPackages(projects)
  const documentsByProjectId = seedDocuments(projects)
  const syncSeed = seedSyncLogs(projects)
  const appConfig = seedAppConfig(projects)
  const costCodes = seedCostCodes()
  const drawingSetsByProjectId = seedDrawingSets(projects)
  const drawingUploadSeed = seedDrawingUploads(projects, drawingSetsByProjectId)

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

  const bidPackageDocumentsByProjectId = seedBidPackageDocuments(projects, documentsByProjectId, bidPackagesByProjectId)
  const bidSeed = seedBidPackageBids(projects, vendorIdsByProjectId, bidPackagesByProjectId)

  return {
    company: { id: COMPANY_ID, name: COMPANY_NAME },
    appConfig,
    projects,
    vendors,
    costCodes,
    vendorIdsByProjectId,
    bidPackagesByProjectId,
    bidsByProjectId: bidSeed.byProject,
    bidPackageDocumentsByProjectId,
    documentsByProjectId,
    drawingSetsByProjectId,
    drawingUploadsByProjectId: drawingUploadSeed.byProject,
    syncLogsByProjectId: syncSeed.byProject,
    uploadsByUuid: {},
    counters: { syncLogId: syncSeed.nextId, uploadCounter: 0, drawingUploadId: drawingUploadSeed.nextId, bidId: bidSeed.nextId },
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

export function listBidPackageBids(projectId: number, bidPackageId: number, options: ListOptions = {}): ProcorePaginatedResponse<ProcoreBid> {
  const page = clampInt(options.page, 1)
  const per_page = clampInt(options.per_page, DEFAULT_PER_PAGE)
  const bidsByPackage = db.bidsByProjectId[projectId] ?? {}
  const bids = bidsByPackage[bidPackageId] ?? []
  return paginate(bids, page, per_page)
}

export function listBidPackageDocuments(projectId: number, bidPackageId: number): ProcoreDocumentEntry[] {
  const docsByPackage = db.bidPackageDocumentsByProjectId[projectId] ?? {}
  return docsByPackage[bidPackageId] ?? []
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

export function listProjectCostCodes(projectId: number, options: ListOptions = {}): ProcorePaginatedResponse<ProcoreCostCode> {
  const page = clampInt(options.page, 1)
  const per_page = clampInt(options.per_page, DEFAULT_PER_PAGE)
  const search = options.filters?.["search"] as string | undefined

  const filtered = db.costCodes
    .filter((c) => includesSearch(`${c.full_code} ${c.name}`, search))
    .sort((a, b) => a.full_code.localeCompare(b.full_code))

  return paginate(filtered, page, per_page)
}

export function listProjectDrawingSets(projectId: number, options: ListOptions = {}): ProcorePaginatedResponse<ProcoreDrawingSet> {
  const page = clampInt(options.page, 1)
  const per_page = clampInt(options.per_page, DEFAULT_PER_PAGE)
  const search = options.filters?.["search"] as string | undefined
  const sets = db.drawingSetsByProjectId[projectId] ?? []
  const filtered = sets.filter((s) => includesSearch(`${s.name}`, search)).sort((a, b) => a.name.localeCompare(b.name))
  return paginate(filtered, page, per_page)
}

export function listProjectDrawingUploads(projectId: number, options: ListOptions = {}): ProcorePaginatedResponse<ProcoreDrawingUpload> {
  const page = clampInt(options.page, 1)
  const per_page = clampInt(options.per_page, DEFAULT_PER_PAGE)
  const search = options.filters?.["search"] as string | undefined
  const uploads = db.drawingUploadsByProjectId[projectId] ?? []
  const filtered = uploads
    .filter((u) => includesSearch(`${u.filename} ${u.status}`, search))
    .sort((a, b) => (a.created_at < b.created_at ? 1 : -1))
  return paginate(filtered, page, per_page)
}

const nextDrawingUploadId = () => {
  db.counters.drawingUploadId += 1
  return db.counters.drawingUploadId
}

export function createDrawingUpload(projectId: number, params: { filename: string; drawing_set_id?: number | null; sheet_count?: number; page_count?: number }) {
  const now = toIso(new Date())
  const upload: ProcoreDrawingUpload = {
    id: nextDrawingUploadId(),
    filename: params.filename,
    drawing_set_id: params.drawing_set_id ?? null,
    status: "processing",
    sheet_count: params.sheet_count,
    page_count: params.page_count,
    created_at: now,
    updated_at: now,
  }

  const prev = db.drawingUploadsByProjectId[projectId] ?? []
  db.drawingUploadsByProjectId[projectId] = [upload, ...prev]

  appendSyncLog(projectId, {
    type: "drawing_upload",
    status: "info",
    message: `Drawing upload created: ${params.filename}`,
  })

  return upload
}

const nextSyncLogId = () => {
  db.counters.syncLogId += 1
  return db.counters.syncLogId
}

const nextBidId = () => {
  db.counters.bidId += 1
  return db.counters.bidId
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

  const bidsByProject = db.bidsByProjectId[projectId] ?? {}
  const existingBids = bidsByProject[bidPackageId] ?? []
  const existingVendorIds = new Set(existingBids.map((b) => b.vendor_id))
  const newBids: ProcoreBid[] = []
  for (const vendor_id of vendorIds) {
    if (existingVendorIds.has(vendor_id)) continue
    newBids.push({
      id: nextBidId(),
      bid_package_id: bidPackageId,
      vendor_id,
      submitted: false,
      lump_sum_amount: null,
      bidder_comments: notes ?? "",
      is_bidder_committed: false,
      created_at: now,
      updated_at: now,
    })
  }
  db.bidsByProjectId[projectId] = {
    ...bidsByProject,
    [bidPackageId]: [...newBids, ...existingBids].sort((a, b) => (a.updated_at ?? "") < (b.updated_at ?? "") ? 1 : -1),
  }

  const dateTag = now.slice(0, 10)
  const doc = createProjectDocument(projectId, {
    folder_path: "Preconstruction/Bid Packages",
    name: `Bid_Invite_List_${bidPackageId}_${dateTag}.xlsx`,
  })
  if (doc) {
    appendSyncLog(projectId, {
      type: "documents_upload",
      status: "info",
      message: `Saved to Documents: ${doc.path}`,
    })
  }

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

const nextDocumentId = (projectId: number) => {
  const docs = db.documentsByProjectId[projectId] ?? []
  const max = docs.reduce((acc, d) => Math.max(acc, d.id), 0)
  return max + 1
}

const normalizeName = (value: string) => value.trim().toLowerCase()

const findFolder = (projectId: number, parentId: number | null, name: string) => {
  const docs = db.documentsByProjectId[projectId] ?? []
  const target = normalizeName(name)
  return (
    docs.find(
      (d) => d.document_type === "folder" && (d.parent_id ?? null) === parentId && normalizeName(d.name) === target,
    ) ?? null
  )
}

const createFolder = (projectId: number, parentId: number | null, name: string, path: string) => {
  const id = nextDocumentId(projectId)
  const now = toIso(new Date())
  const folder: ProcoreDocumentEntry = {
    id,
    name,
    document_type: "folder",
    parent_id: parentId,
    path,
    created_at: now,
    updated_at: now,
  }
  db.documentsByProjectId[projectId] = [...(db.documentsByProjectId[projectId] ?? []), folder]
  return folder
}

const ensureFolderPath = (projectId: number, folderPath: string) => {
  const parts = folderPath
    .split("/")
    .map((p) => p.trim())
    .filter(Boolean)
  if (!parts.length) return null

  let parentId: number | null = null
  let currentPath = ""

  for (const part of parts) {
    currentPath = currentPath ? `${currentPath}/${part}` : part
    const existing = findFolder(projectId, parentId, part)
    if (existing) {
      parentId = existing.id
      continue
    }
    const created = createFolder(projectId, parentId, part, currentPath)
    parentId = created.id
  }

  return parentId
}

export function createProjectDocument(projectId: number, params: { folder_path: string; name: string }) {
  const folderId = ensureFolderPath(projectId, params.folder_path)
  if (!folderId) return null

  const id = nextDocumentId(projectId)
  const now = toIso(new Date())
  const entry: ProcoreDocumentEntry = {
    id,
    name: params.name,
    document_type: "file",
    parent_id: folderId,
    path: `${params.folder_path}/${params.name}`.replace(/\/{2,}/g, "/"),
    created_at: now,
    updated_at: now,
  }

  db.documentsByProjectId[projectId] = [...(db.documentsByProjectId[projectId] ?? []), entry]
  return entry
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

  return upload
}

export function getCompany() {
  return db.company
}

export function getAppConfig() {
  return db.appConfig
}

export function isAppEnabledForProject(projectId: number) {
  return db.appConfig.enabled_project_ids.includes(projectId)
}

export function enableAppForProject(projectId: number) {
  if (!db.appConfig.enabled_project_ids.includes(projectId)) {
    db.appConfig.enabled_project_ids = [...db.appConfig.enabled_project_ids, projectId]
    db.appConfig.updated_at = toIso(new Date())
  }
  return db.appConfig
}

export function disableAppForProject(projectId: number) {
  if (db.appConfig.enabled_project_ids.includes(projectId)) {
    db.appConfig.enabled_project_ids = db.appConfig.enabled_project_ids.filter((id) => id !== projectId)
    db.appConfig.updated_at = toIso(new Date())
  }
  return db.appConfig
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
