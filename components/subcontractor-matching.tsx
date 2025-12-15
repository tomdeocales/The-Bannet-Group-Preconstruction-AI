"use client"

import { useEffect, useMemo, useState } from "react"
import {
  Building2,
  FileText,
  MapPin,
  Star,
  TrendingUp,
  Shield,
  ChevronRight,
  Check,
  AlertCircle,
  ArrowRight,
  Loader2,
  ThumbsUp,
  ThumbsDown,
  ExternalLink,
  Phone,
  Mail,
  Bell,
  User,
} from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Checkbox } from "@/components/ui/checkbox"
import { Progress } from "@/components/ui/progress"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { toast } from "sonner"
import { cn } from "@/lib/utils"
import type { ModuleType } from "@/app/page"
import { getBidPackageBids, getBidPackageDocuments, getBidPackages, getVendors, postAddBidders } from "@/lib/procore/client"
import type { ProcoreBid, ProcoreBidPackage, ProcoreDocumentEntry, ProcoreProject, ProcoreVendor } from "@/lib/procore/types"

interface SubcontractorMatchingProps {
  selectedProject: ProcoreProject
  onLogout?: () => void
  setActiveModule?: (module: ModuleType) => void
}

type Step = 1 | 2 | 3

type SortMode = "Recommended" | "Distance" | "Capacity" | "Price"

type WorkspaceView = "planroom" | "matching"

type VendorRecommendation = {
  id: number
  name: string
  trade: string
  city?: string
  state_code?: string
  business_phone?: string
  updated_at?: string
  distanceMiles: number
  distance: string
  performance: number
  capacity: "Low" | "Medium" | "High"
  pricing: "Competitive" | "Mid-range" | "Premium"
  availability: "Available" | "Limited"
  certifications: string[]
  pastProjects: string[]
  strengths: string[]
  weaknesses: string[]
  riskFactors: string[]
  tradeFit: string
  availabilityWindow: string
  confidence: number
}

type VendorDirectoryContact = { name: string; role: string; email: string; phone: string }

type VendorInsuranceRow = { type: string; policy_number: string; expires_on: string; status: "Active" | "Expiring" | "Expired" }

type VendorSafetyRow = { metric: string; value: string; notes: string }

type VendorPastWorkRow = { project: string; year: number; value: number; performance: number; role: string }

type VendorDirectoryProfile = {
  vendor_id: number
  name: string
  trade: string
  city?: string
  state_code?: string
  business_phone?: string
  website: string
  tags: string[]
  contacts: VendorDirectoryContact[]
  insurance: VendorInsuranceRow[]
  safety: VendorSafetyRow[]
  licenses: Array<{ label: string; value: string }>
  past_work: VendorPastWorkRow[]
}

const slugify = (value: string) =>
  value
    .toLowerCase()
    .replace(/&/g, "and")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "")

const formatIsoDate = (d: Date) => d.toISOString().slice(0, 10)

const monthsFromNow = (n: number) => {
  const d = new Date()
  d.setMonth(d.getMonth() + n)
  return d
}

const makeVendorProfile = (vendor: ProcoreVendor, projectId: number, requirements: string): VendorDirectoryProfile => {
  const rng = mulberry32(vendor.id ^ projectId ^ 0x77aa11)

  const domain = slugify(vendor.name.replace(/\b(inc|llc|co|group|services|contracting|construction|partners)\b/gi, "").trim())
  const website = domain ? `https://www.${domain}.com` : "https://www.vendor-example.com"

  const contactFirst = ["Alex", "Jordan", "Taylor", "Morgan", "Casey", "Riley", "Avery", "Drew", "Cameron", "Parker"]
  const contactLast = ["Nguyen", "Mitchell", "Brooks", "Patel", "Sanchez", "Kim", "Harris", "Lopez", "Reed", "Turner"]
  const roles = ["Estimator", "Project Executive", "Operations Manager", "PM / Coordinator"]

  const mkEmail = (first: string, last: string) => {
    const base = `${first}.${last}`.toLowerCase()
    return `${base}@${domain || "vendor-example"}.com`
  }

  const phone = vendor.business_phone ?? `(503) 555-${String(Math.floor(1000 + rng() * 9000)).padStart(4, "0")}`

  const contacts: VendorDirectoryContact[] = Array.from({ length: 2 + (rng() > 0.7 ? 1 : 0) }).map(() => {
    const first = pick(rng, contactFirst)
    const last = pick(rng, contactLast)
    const role = pick(rng, roles)
    return { name: `${first} ${last}`, role, email: mkEmail(first, last), phone }
  })

  const req = requirements.toLowerCase()
  const tags = [
    vendor.trade_name ?? "Trade",
    vendor.state_code === "WA" ? "WA Licensed" : "OR Licensed",
    req.includes("health") || req.includes("hospital") || req.includes("clinic") ? "Healthcare" : "Commercial",
    rng() > 0.66 ? "Preferred" : rng() > 0.4 ? "Approved" : "Review Required",
  ]

  const insurance: VendorInsuranceRow[] = [
    {
      type: "General Liability",
      policy_number: `GL-${Math.floor(100000 + rng() * 900000)}`,
      expires_on: formatIsoDate(monthsFromNow(3 + Math.floor(rng() * 12))),
      status: rng() > 0.2 ? "Active" : "Expiring",
    },
    {
      type: "Workers' Comp",
      policy_number: `WC-${Math.floor(100000 + rng() * 900000)}`,
      expires_on: formatIsoDate(monthsFromNow(2 + Math.floor(rng() * 10))),
      status: rng() > 0.25 ? "Active" : "Expiring",
    },
    {
      type: "Auto",
      policy_number: `AUTO-${Math.floor(100000 + rng() * 900000)}`,
      expires_on: formatIsoDate(monthsFromNow(4 + Math.floor(rng() * 14))),
      status: rng() > 0.15 ? "Active" : "Expiring",
    },
  ]

  const emr = (0.74 + rng() * 0.46).toFixed(2)
  const trir = (0.6 + rng() * 1.9).toFixed(2)
  const safety: VendorSafetyRow[] = [
    { metric: "EMR", value: emr, notes: Number(emr) <= 1.0 ? "Within target range" : "Review required" },
    { metric: "TRIR", value: trir, notes: Number(trir) <= 1.5 ? "No recent incident trend" : "Elevated rate flagged" },
    { metric: "OSHA 300A", value: rng() > 0.18 ? "On file" : "Missing", notes: "Latest reporting year requested" },
  ]

  const licenses = [
    { label: "License", value: `${vendor.state_code ?? "OR"}-${Math.floor(100000 + rng() * 900000)}` },
    { label: "W-9", value: rng() > 0.12 ? "Received" : "Pending" },
    { label: "Union", value: req.includes("union") ? "Required" : rng() > 0.6 ? "Available" : "Non-union" },
  ]

  const pastPool = [
    "Tenant Improvement — Class A Office",
    "Medical Office Buildout",
    "Retail Shell & Fit-Out",
    "Hospital Expansion (Phase 2)",
    "Transit Hub Renovation",
    "Lab Fit-Out — Higher Ed",
    "Data Center Expansion",
    "Multifamily Podium Renovation",
    "Warehouse Conversion",
  ]
  const rolesPool = ["Prime Sub", "Design-Assist", "Bid-Only", "Value Engineering"]
  const past_work: VendorPastWorkRow[] = Array.from({ length: 10 + Math.floor(rng() * 12) }).map(() => {
    const year = 2019 + Math.floor(rng() * 7)
    const value = 75_000 + rng() * 1_200_000
    const performance = 78 + Math.floor(rng() * 20)
    return { project: pick(rng, pastPool), year, value, performance, role: pick(rng, rolesPool) }
  })

  return {
    vendor_id: vendor.id,
    name: vendor.name,
    trade: vendor.trade_name ?? "Trade",
    city: vendor.city,
    state_code: vendor.state_code,
    business_phone: vendor.business_phone,
    website,
    tags,
    contacts,
    insurance,
    safety,
    licenses,
    past_work,
  }
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

const clamp = (n: number, min: number, max: number) => Math.min(max, Math.max(min, n))

const pick = <T,>(rng: () => number, arr: T[]) => arr[Math.floor(rng() * arr.length)]

const formatShortDate = (iso?: string) => {
  if (!iso) return "—"
  const d = new Date(iso)
  if (Number.isNaN(d.getTime())) return "—"
  return d.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })
}

const capacityScore = (capacity: VendorRecommendation["capacity"]) => {
  if (capacity === "High") return 3
  if (capacity === "Medium") return 2
  return 1
}

const pricingScore = (pricing: VendorRecommendation["pricing"]) => {
  if (pricing === "Competitive") return 3
  if (pricing === "Mid-range") return 2
  return 1
}

const makeRecommendation = (vendor: ProcoreVendor, projectId: number, requirements: string): VendorRecommendation => {
  const rng = mulberry32(vendor.id ^ projectId)

  const distanceMiles = 3 + Math.floor(rng() * 85)
  const performance = 82 + Math.floor(rng() * 17)

  const capacityRoll = rng()
  const capacity: VendorRecommendation["capacity"] = capacityRoll > 0.72 ? "High" : capacityRoll > 0.38 ? "Medium" : "Low"

  const pricingRoll = rng()
  const pricing: VendorRecommendation["pricing"] = pricingRoll > 0.74 ? "Premium" : pricingRoll > 0.38 ? "Mid-range" : "Competitive"

  const availabilityRoll = rng()
  const availability: VendorRecommendation["availability"] = availabilityRoll > 0.78 ? "Limited" : "Available"

  const startWeeks = availability === "Available" ? Math.floor(rng() * 3) : 4 + Math.floor(rng() * 6)
  const availabilityWindow =
    startWeeks === 0 ? "Available now" : availability === "Available" ? `Available in ${startWeeks}–${startWeeks + 2} weeks` : `Lead time ${startWeeks}–${startWeeks + 4} weeks`

  const trade = vendor.trade_name ?? "Trade"

  const certByTrade: Record<string, string[]> = {
    Electrical: ["OSHA 30", "Master Electrician", "NFPA 70E"],
    HVAC: ["OSHA 30", "EPA 608", "NATE Certified"],
    Plumbing: ["OSHA 30", "Master Plumber", "Backflow Certified"],
    "Fire Protection": ["OSHA 30", "NICET II", "NFPA 13"],
    Steel: ["AISC Certified", "OSHA 30", "AWS D1.1"],
    Concrete: ["ACI Certified", "OSHA 30", "Post-Tension Certified"],
    Drywall: ["OSHA 30", "STC Assemblies Experience", "Union/Non-Union Capable"],
    Roofing: ["OSHA 30", "Manufacturer Certified", "Fall Protection"],
    Flooring: ["OSHA 30", "Moisture Mitigation", "Healthcare Flooring"],
    Glazing: ["OSHA 30", "CW & Storefront Systems", "Swing Stage Certified"],
    Painting: ["OSHA 30", "Low-VOC Systems", "SSPC Surface Prep"],
    "Civil/Site": ["OSHA 30", "Erosion Control", "Utility Coordination"],
    Masonry: ["OSHA 30", "CMU Reinforcement", "Seismic Detailing"],
    "Doors & Hardware": ["OSHA 30", "Fire Door Assemblies", "ADA/Hardware Sets"],
    Demolition: ["OSHA 30", "Lead/Asbestos Awareness", "Selective Demo"],
  }

  const certifications = certByTrade[trade] ?? ["OSHA 30", "Licensed Contractor"]

  const pastWorkPool = [
    "Tenant Improvement — Class A Office",
    "Medical Office Buildout",
    "Retail Shell & Fit-Out",
    "Hospital Expansion (Phase 2)",
    "Transit-Oriented Development",
    "Higher Ed Lab Renovation",
    "Multifamily Podium Renovation",
    "Warehouse Conversion",
  ]
  const pastProjects = Array.from({ length: 3 }).map(() => pastWorkPool[Math.floor(rng() * pastWorkPool.length)])

  const requirementsText = requirements.toLowerCase()
  const healthcareFit = requirementsText.includes("health") || requirementsText.includes("hospital") || requirementsText.includes("clinic")
  const unionFit = requirementsText.includes("union")
  const leedFit = requirementsText.includes("leed")

  const tradeFitParts = [
    healthcareFit ? "Healthcare compliance familiarity" : "Strong commercial project fit",
    unionFit ? "Union coordination experience" : "Flexible staffing model",
    leedFit ? "LEED submittal experience" : "Responsive submittal turnaround",
  ]
  const tradeFit = tradeFitParts.join(" • ")

  const strengths: string[] = []
  if (performance >= 92) strengths.push("Consistently strong QA/QC and closeout documentation")
  if (distanceMiles <= 20) strengths.push("Local coverage with quick mobilization")
  if (capacity === "High") strengths.push("Capacity to support accelerated schedule windows")
  if (pricing === "Competitive") strengths.push("Typically competitive pricing for base scope")

  const weaknesses: string[] = []
  if (pricing === "Premium") weaknesses.push("Premium pricing expected for tight turnaround or off-hours work")
  if (availability === "Limited") weaknesses.push("Schedule lead time may impact award timing")
  if (capacity === "Low") weaknesses.push("Limited bandwidth for concurrent packages")

  const riskFactors: string[] = []
  const riskRoll = rng()
  if (riskRoll > 0.7) riskFactors.push("Current backlog trending above target utilization")
  if (riskRoll < 0.25) riskFactors.push("Equipment procurement lead times require early lock-in")
  if (!riskFactors.length) riskFactors.push("No material risk flags detected based on recent activity")

  const distanceFactor = clamp(1 - distanceMiles / 100, 0, 1)
  const capacityFactor = capacityScore(capacity) / 3
  const pricingFactor = pricingScore(pricing) / 3
  const confidence = clamp(
    Math.round(performance * 0.55 + distanceFactor * 100 * 0.2 + capacityFactor * 100 * 0.15 + pricingFactor * 100 * 0.1),
    70,
    98,
  )

  return {
    id: vendor.id,
    name: vendor.name,
    trade,
    city: vendor.city,
    state_code: vendor.state_code,
    business_phone: vendor.business_phone,
    updated_at: vendor.updated_at,
    distanceMiles,
    distance: `${distanceMiles} miles`,
    performance,
    capacity,
    pricing,
    availability,
    certifications,
    pastProjects,
    strengths: strengths.length ? strengths : ["Responsive communication and field coordination"],
    weaknesses: weaknesses.length ? weaknesses : ["No notable weaknesses identified for this scope"],
    riskFactors,
    tradeFit,
    availabilityWindow,
    confidence,
  }
}

export function SubcontractorMatching({ selectedProject, onLogout, setActiveModule }: SubcontractorMatchingProps) {
  const [workspaceView, setWorkspaceView] = useState<WorkspaceView>("planroom")
  const [step, setStep] = useState<Step>(1)
  const [isGenerating, setIsGenerating] = useState(false)
  const [isPushing, setIsPushing] = useState(false)
  const [selectedSubs, setSelectedSubs] = useState<number[]>([])
  const [sortMode, setSortMode] = useState<SortMode>("Recommended")
  const [vendors, setVendors] = useState<ProcoreVendor[]>([])
  const [bidPackages, setBidPackages] = useState<ProcoreBidPackage[]>([])
  const [bidPackagesLoading, setBidPackagesLoading] = useState(false)
  const [selectedBidPackageId, setSelectedBidPackageId] = useState<number | null>(null)
  const [planroomSearch, setPlanroomSearch] = useState("")
  const [planroomStatus, setPlanroomStatus] = useState<ProcoreBidPackage["status"] | "All">("All")
  const [planroomBids, setPlanroomBids] = useState<ProcoreBid[]>([])
  const [planroomBidsLoading, setPlanroomBidsLoading] = useState(false)
  const [planroomDocs, setPlanroomDocs] = useState<ProcoreDocumentEntry[]>([])
  const [planroomDocsLoading, setPlanroomDocsLoading] = useState(false)
  const [vendorDirectory, setVendorDirectory] = useState<ProcoreVendor[]>([])
  const [vendorDirectoryLoading, setVendorDirectoryLoading] = useState(false)
  const [reasoningModal, setReasoningModal] = useState<VendorRecommendation | null>(null)
  const [vendorProfileId, setVendorProfileId] = useState<number | null>(null)
  const [vendorNotesById, setVendorNotesById] = useState<Record<number, string[]>>({})
  const [vendorNoteDraft, setVendorNoteDraft] = useState("")
  const [profilePastSearch, setProfilePastSearch] = useState("")
  const [profilePastSort, setProfilePastSort] = useState<"year_desc" | "year_asc" | "value_desc">("year_desc")
  const [profilePastPage, setProfilePastPage] = useState(1)
  const [notes, setNotes] = useState("")
  const [formData, setFormData] = useState({
    location: "Portland, OR",
    trade: "",
    budgetMin: "500000",
    budgetMax: "2000000",
    timeline: "6 months",
    requirements: "Healthcare compliance required",
  })

  useEffect(() => {
    const location = [selectedProject.city, selectedProject.state_code].filter(Boolean).join(", ") || "Portland, OR"
    setFormData((prev) => ({ ...prev, location }))
    setStep(1)
    setWorkspaceView("planroom")
    setSelectedSubs([])
    setNotes("")
    setReasoningModal(null)
    setVendorProfileId(null)
    setSortMode("Recommended")
    setVendors([])
  }, [selectedProject.id, selectedProject.city, selectedProject.state_code])

  useEffect(() => {
    let cancelled = false
    setBidPackagesLoading(true)
    getBidPackages(selectedProject.id, { page: 1, per_page: 25, view: "extended" })
      .then((res) => {
        if (cancelled) return
        setBidPackages(res.items)
        setSelectedBidPackageId(res.items[0]?.id ?? null)
      })
      .catch(() => {
        if (cancelled) return
        setBidPackages([])
        setSelectedBidPackageId(null)
      })
      .finally(() => {
        if (cancelled) return
        setBidPackagesLoading(false)
      })
    return () => {
      cancelled = true
    }
  }, [selectedProject.id])

  useEffect(() => {
    if (workspaceView !== "planroom") return
    let cancelled = false
    setVendorDirectoryLoading(true)
    getVendors(selectedProject.id, { page: 1, per_page: 200, view: "normal" })
      .then((res) => {
        if (cancelled) return
        setVendorDirectory(res.items)
      })
      .catch(() => {
        if (cancelled) return
        setVendorDirectory([])
      })
      .finally(() => {
        if (cancelled) return
        setVendorDirectoryLoading(false)
      })
    return () => {
      cancelled = true
    }
  }, [workspaceView, selectedProject.id])

  useEffect(() => {
    if (workspaceView !== "planroom") return
    if (!selectedBidPackageId) {
      setPlanroomBids([])
      setPlanroomDocs([])
      return
    }

    let cancelled = false
    setPlanroomBidsLoading(true)
    setPlanroomDocsLoading(true)

    getBidPackageBids(selectedProject.id, selectedBidPackageId, { page: 1, per_page: 50 })
      .then((res) => {
        if (cancelled) return
        setPlanroomBids(res.items)
      })
      .catch(() => {
        if (cancelled) return
        setPlanroomBids([])
      })
      .finally(() => {
        if (cancelled) return
        setPlanroomBidsLoading(false)
      })

    getBidPackageDocuments(selectedProject.id, selectedBidPackageId, { page: 1, per_page: 50 })
      .then((res) => {
        if (cancelled) return
        setPlanroomDocs(res.items)
      })
      .catch(() => {
        if (cancelled) return
        setPlanroomDocs([])
      })
      .finally(() => {
        if (cancelled) return
        setPlanroomDocsLoading(false)
      })

    return () => {
      cancelled = true
    }
  }, [workspaceView, selectedProject.id, selectedBidPackageId])

  const tradeSearchToken = (tradeValue: string) => {
    if (tradeValue === "electrical") return "Electrical"
    if (tradeValue === "plumbing") return "Plumbing"
    if (tradeValue === "hvac") return "HVAC"
    if (tradeValue === "concrete") return "Concrete"
    if (tradeValue === "steel") return "Steel"
    return ""
  }

  const allowedMepTrades = useMemo(() => new Set(["Electrical", "HVAC", "Plumbing", "Fire Protection"]), [])

  const allRecommendations = useMemo(() => {
    return vendors.map((v) => makeRecommendation(v, selectedProject.id, formData.requirements))
  }, [vendors, selectedProject.id, formData.requirements])

  const filteredRecommendations = useMemo(() => {
    if (!formData.trade) return allRecommendations
    if (formData.trade === "mep") return allRecommendations.filter((r) => allowedMepTrades.has(r.trade))
    const token = tradeSearchToken(formData.trade)
    return token ? allRecommendations.filter((r) => r.trade === token) : allRecommendations
  }, [allRecommendations, allowedMepTrades, formData.trade])

  const rankedRecommendations = useMemo(() => {
    const list = [...filteredRecommendations]
    if (sortMode === "Distance") return list.sort((a, b) => a.distanceMiles - b.distanceMiles)
    if (sortMode === "Capacity") return list.sort((a, b) => capacityScore(b.capacity) - capacityScore(a.capacity))
    if (sortMode === "Price") return list.sort((a, b) => pricingScore(b.pricing) - pricingScore(a.pricing))
    return list.sort((a, b) => b.confidence - a.confidence)
  }, [filteredRecommendations, sortMode])

  const visibleRecommendations = useMemo(() => rankedRecommendations.slice(0, 10), [rankedRecommendations])

  const recById = useMemo(() => new Map(rankedRecommendations.map((r) => [r.id, r])), [rankedRecommendations])

  const selectedRecommendations = useMemo(
    () => selectedSubs.map((id) => recById.get(id)).filter(Boolean) as VendorRecommendation[],
    [recById, selectedSubs],
  )

  const selectedBidPackage = useMemo(
    () => bidPackages.find((b) => b.id === selectedBidPackageId) ?? null,
    [bidPackages, selectedBidPackageId],
  )

  const vendorById = useMemo(() => new Map(vendorDirectory.map((v) => [v.id, v])), [vendorDirectory])

  const planroomBidPackages = useMemo(() => {
    const q = planroomSearch.trim().toLowerCase()
    return bidPackages
      .filter((bp) => (planroomStatus === "All" ? true : bp.status === planroomStatus))
      .filter((bp) => {
        if (!q) return true
        const hay = `${bp.title} ${bp.status} ${bp.due_date ?? ""}`.toLowerCase()
        return hay.includes(q)
      })
      .sort((a, b) => (a.due_date ?? "") < (b.due_date ?? "") ? -1 : 1)
  }, [bidPackages, planroomSearch, planroomStatus])

  const bidStatusBadge = (status: ProcoreBidPackage["status"]) => {
    if (status === "Open") return "bg-success text-primary-foreground"
    if (status === "Closed") return "bg-muted text-foreground"
    if (status === "Awarded") return "bg-bannett-navy text-primary-foreground"
    if (status === "Canceled") return "bg-destructive text-primary-foreground"
    return "bg-muted text-foreground"
  }

  const inferTradeFromPackage = (title: string) => {
    const t = title.toLowerCase()
    if (t.includes("mep")) return "mep"
    if (t.includes("elect")) return "electrical"
    if (t.includes("plumb")) return "plumbing"
    if (t.includes("hvac") || t.includes("mechanical")) return "hvac"
    if (t.includes("concrete") || t.includes("foundation")) return "concrete"
    if (t.includes("steel") || t.includes("metals")) return "steel"
    return ""
  }

  const planroomActivity = useMemo(() => {
    if (!selectedBidPackageId) return []
    const events: Array<{ id: string; at: string; label: string; type: "package" | "doc" | "bid" }> = []

    if (selectedBidPackage?.updated_at) {
      events.push({
        id: `bp-${selectedBidPackage.id}-updated`,
        at: selectedBidPackage.updated_at,
        label: `Bid package updated • ${selectedBidPackage.status}`,
        type: "package",
      })
    }

    for (const doc of planroomDocs) {
      const at = doc.updated_at ?? doc.created_at ?? new Date().toISOString()
      events.push({
        id: `doc-${doc.id}`,
        at,
        label: `Document attached: ${doc.name}`,
        type: "doc",
      })
    }

    for (const bid of planroomBids) {
      const vendor = vendorById.get(bid.vendor_id)
      const invitedAt = bid.created_at ?? bid.updated_at ?? new Date().toISOString()
      events.push({
        id: `bid-${bid.id}-invited`,
        at: invitedAt,
        label: `Bidder invited: ${vendor?.name ?? `Vendor #${bid.vendor_id}`}`,
        type: "bid",
      })
      if (bid.submitted && bid.updated_at) {
        events.push({
          id: `bid-${bid.id}-submitted`,
          at: bid.updated_at,
          label: `Bid submitted: ${vendor?.name ?? `Vendor #${bid.vendor_id}`}`,
          type: "bid",
        })
      }
    }

    return events.sort((a, b) => (a.at < b.at ? 1 : -1)).slice(0, 12)
  }, [planroomBids, planroomDocs, selectedBidPackage, selectedBidPackageId, vendorById])

  const activeVendorProfile = useMemo(() => {
    if (vendorProfileId === null) return null
    const direct = vendorById.get(vendorProfileId) ?? vendors.find((v) => v.id === vendorProfileId) ?? null

    const fallbackFromReasoning =
      reasoningModal && reasoningModal.id === vendorProfileId
        ? ({
            id: reasoningModal.id,
            name: reasoningModal.name,
            trade_name: reasoningModal.trade,
            trade_id: undefined,
            city: reasoningModal.city,
            state_code: reasoningModal.state_code,
            business_phone: reasoningModal.business_phone,
          } satisfies ProcoreVendor)
        : null

    const vendor =
      direct ??
      fallbackFromReasoning ??
      ({
        id: vendorProfileId,
        name: `Vendor #${vendorProfileId}`,
        trade_name: "Trade",
      } satisfies ProcoreVendor)

    return makeVendorProfile(vendor, selectedProject.id, formData.requirements)
  }, [vendorById, vendorProfileId, vendors, reasoningModal, selectedProject.id, formData.requirements])

  useEffect(() => {
    if (vendorProfileId === null) return
    setVendorNoteDraft("")
    setProfilePastPage(1)
    setProfilePastSearch("")
    setProfilePastSort("year_desc")

    setVendorNotesById((prev) => {
      if (prev[vendorProfileId]) return prev
      const rng = mulberry32(vendorProfileId ^ selectedProject.id ^ 0x1122)
      const seeds = [
        "Added to bid list last quarter — follow up on capacity window.",
        "Insurance on file; verify renewal dates before award.",
        rng() > 0.5 ? "Strong closeout documentation on recent TI project." : "Request updated safety metrics for healthcare scope.",
      ]
      return { ...prev, [vendorProfileId]: seeds }
    })
  }, [vendorProfileId, selectedProject.id])

  const profilePastRows = useMemo(() => {
    if (!activeVendorProfile) return { items: [] as VendorPastWorkRow[], total_pages: 1 }
    const q = profilePastSearch.trim().toLowerCase()
    const filtered = activeVendorProfile.past_work.filter((row) => {
      if (!q) return true
      return `${row.project} ${row.role} ${row.year}`.toLowerCase().includes(q)
    })

    const sorted = [...filtered].sort((a, b) => {
      if (profilePastSort === "year_asc") return a.year - b.year
      if (profilePastSort === "value_desc") return b.value - a.value
      return b.year - a.year
    })

    const pageSize = 8
    const total_pages = Math.max(1, Math.ceil(sorted.length / pageSize))
    const safePage = Math.min(Math.max(1, profilePastPage), total_pages)
    const start = (safePage - 1) * pageSize
    return { items: sorted.slice(start, start + pageSize), total_pages }
  }, [activeVendorProfile, profilePastPage, profilePastSearch, profilePastSort])

  const generateRecommendations = async () => {
    if (!formData.trade) {
      toast.error("Select a trade category to continue")
      return
    }

    const token = formData.trade === "mep" ? "" : tradeSearchToken(formData.trade)

    setIsGenerating(true)
    setSelectedSubs([])
    setReasoningModal(null)
    try {
      const [res] = await Promise.all([
        getVendors(selectedProject.id, { page: 1, per_page: 80, view: "extended", filters: { search: token || undefined } }),
        new Promise((r) => setTimeout(r, 1200)),
      ])
      setVendors(res.items)
      setStep(2)
      toast.success("Recommendations generated", { description: `${res.items.length} vendors evaluated.` })
    } catch (err) {
      const message = err instanceof Error ? err.message : "Unable to load vendors."
      toast.error("Failed to generate recommendations", { description: message })
    } finally {
      setIsGenerating(false)
    }
  }

  const toggleSubSelection = (id: number) => {
    setSelectedSubs((prev) => {
      if (prev.includes(id)) return prev.filter((s) => s !== id)
      if (prev.length >= 3) {
        toast.error("Selection limit reached", { description: "Select up to 3 subcontractors to push to Procore." })
        return prev
      }
      return [...prev, id]
    })
  }

  const addVendorNote = () => {
    if (vendorProfileId === null) return
    const note = vendorNoteDraft.trim()
    if (!note) return
    setVendorNotesById((prev) => {
      const existing = prev[vendorProfileId] ?? []
      return { ...prev, [vendorProfileId]: [note, ...existing] }
    })
    setVendorNoteDraft("")
    toast.success("Note added", { description: "Saved to vendor record (mock)." })
  }

  const removeVendorNote = (vendorId: number, index: number) => {
    setVendorNotesById((prev) => {
      const existing = prev[vendorId] ?? []
      return { ...prev, [vendorId]: existing.filter((_, i) => i !== index) }
    })
    toast.message("Note removed", { description: "Vendor note updated (mock)." })
  }

  const pushToProcore = async () => {
    if (!selectedBidPackageId) {
      toast.error("No bid package selected", { description: "Select a bid package to push bidders to Procore." })
      return
    }
    if (selectedSubs.length === 0) {
      toast.error("No subcontractors selected", { description: "Select 1–3 subcontractors to push to Procore." })
      return
    }

    setIsPushing(true)
    try {
      const bpTitle = selectedBidPackage?.title ?? "selected bid package"
      const res = await postAddBidders(selectedProject.id, selectedBidPackageId, selectedSubs, notes)
      if (!res.ok) {
        toast.error("Push failed", { description: res.error })
        return
      }
      toast.success("Bidders added to Procore bid package", {
        description: `${selectedSubs.length} subcontractor${selectedSubs.length === 1 ? "" : "s"} added to ${bpTitle}.`,
      })
      setStep(1)
      setSelectedSubs([])
      setNotes("")
    } catch (err) {
      const message = err instanceof Error ? err.message : "Unable to push bidders."
      toast.error("Push failed", { description: message })
    } finally {
      setIsPushing(false)
    }
  }

  return (
    <div className="pt-0 pr-0 pb-1 pl-0 space-y-2 h-full flex flex-col min-h-0">
      {/* Header */}
      <div className="flex items-center justify-between px-6">
        <div>
          <h1 className="text-xl md:text-2xl font-semibold text-foreground">Subcontractor Matching</h1>
          <p className="text-sm text-muted-foreground">{selectedProject.display_name ?? selectedProject.name}</p>
          <div className="mt-3 flex items-center gap-2">
            <Button
              size="sm"
              variant={workspaceView === "planroom" ? "default" : "outline"}
              className={cn(workspaceView === "planroom" && "bg-bannett-navy hover:bg-bannett-navy/90")}
              onClick={() => setWorkspaceView("planroom")}
            >
              Planroom
            </Button>
            <Button
              size="sm"
              variant={workspaceView === "matching" ? "default" : "outline"}
              className={cn(workspaceView === "matching" && "bg-bannett-navy hover:bg-bannett-navy/90")}
              onClick={() => setWorkspaceView("matching")}
            >
              Matching
            </Button>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="relative">
                <Bell className="w-5 h-5" />
                <span className="absolute top-1 right-1 w-2 h-2 bg-destructive rounded-full" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent
              align="end"
              className="w-72 [&_[data-highlighted]]:bg-accent [&_[data-highlighted]]:text-foreground [&_[data-highlighted]_span]:text-foreground [&_[data-highlighted]_p]:text-foreground"
            >
              <DropdownMenuLabel>Notifications</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem className="flex flex-col items-start gap-1">
                <span className="text-sm font-medium">3 subs shortlisted</span>
                <span className="text-xs text-muted-foreground">MEP package updated</span>
              </DropdownMenuItem>
              <DropdownMenuItem className="flex flex-col items-start gap-1">
                <span className="text-sm font-medium">Bid package pushed</span>
                <span className="text-xs text-muted-foreground">Sent to Procore Planroom</span>
              </DropdownMenuItem>
              <DropdownMenuItem className="flex flex-col items-start gap-1">
                <span className="text-sm font-medium">New zoning flag</span>
                <span className="text-xs text-muted-foreground">ADA parking compliance</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          <div className="flex items-center gap-3 pl-3 border-l border-bannett-navy/50">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  className="pl-1 pr-3 py-1 h-11 rounded-full hover:bg-muted/50 focus-visible:ring-0 focus-visible:outline-none"
                >
                  <div className="flex items-center gap-2">
                    <div className="w-9 h-9 rounded-full bg-bannett-navy flex items-center justify-center">
                      <User className="w-5 h-5 text-primary-foreground" />
                    </div>
                    <div className="text-left">
                      <p className="text-sm font-medium text-foreground leading-tight">Sarah Chen</p>
                      <p className="text-xs text-muted-foreground leading-tight">Project Manager</p>
                    </div>
                  </div>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-48">
                <DropdownMenuLabel>Account</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => setActiveModule?.("settings")}>Profile</DropdownMenuItem>
                <DropdownMenuItem onClick={onLogout}>Logout</DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </div>

      <Card className="shadow-sm flex-1 min-h-0">
        <CardContent className="p-6 h-full overflow-auto [scrollbar-width:thin] [&::-webkit-scrollbar]:w-0.5 [&::-webkit-scrollbar-track]:bg-transparent [&::-webkit-scrollbar-thumb]:bg-muted [&::-webkit-scrollbar-thumb]:rounded-full">
          {workspaceView === "planroom" ? (
            <div className="space-y-6">
              <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
                <div>
                  <h2 className="text-lg font-medium text-foreground">Planroom — Bid Packages</h2>
                  <p className="text-sm text-muted-foreground">
                    Review bid packages, attachments, and bidder roster. Invite bidders via AI Matching.
                  </p>
                </div>
                <Button
                  className="bg-bannett-navy hover:bg-bannett-navy/90"
                  onClick={() => {
                    const inferred = selectedBidPackage ? inferTradeFromPackage(selectedBidPackage.title) : ""
                    setFormData((prev) => ({ ...prev, trade: prev.trade || inferred }))
                    setWorkspaceView("matching")
                    setStep(1)
                    toast.message("Planroom context loaded", {
                      description: selectedBidPackage ? `Ready to invite bidders for: ${selectedBidPackage.title}` : "Select a bid package to continue.",
                    })
                  }}
                >
                  Invite from AI Matching
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
                <Card className="bg-card">
                  <CardHeader>
                    <CardTitle className="text-card-foreground">Bid Packages</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-1 gap-3">
                      <div className="space-y-2">
                        <Label>Search</Label>
                        <Input
                          value={planroomSearch}
                          onChange={(e) => setPlanroomSearch(e.target.value)}
                          placeholder="Search bid packages…"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>Status</Label>
                        <Select value={planroomStatus} onValueChange={(v) => setPlanroomStatus(v as typeof planroomStatus)}>
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent className="max-h-60 overflow-y-auto">
                            <SelectItem value="All">All</SelectItem>
                            <SelectItem value="Draft">Draft</SelectItem>
                            <SelectItem value="Open">Open</SelectItem>
                            <SelectItem value="Closed">Closed</SelectItem>
                            <SelectItem value="Awarded">Awarded</SelectItem>
                            <SelectItem value="Canceled">Canceled</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>

                    {bidPackagesLoading ? (
                      <div className="p-3 rounded-lg bg-muted/50 text-sm text-muted-foreground">Loading bid packages…</div>
                    ) : planroomBidPackages.length === 0 ? (
                      <div className="p-3 rounded-lg bg-muted/50 text-sm text-muted-foreground">
                        No bid packages match your filters.
                      </div>
                    ) : (
                      <div className="space-y-2 max-h-[520px] overflow-y-auto pr-1">
                        {planroomBidPackages.map((bp) => (
                          <button
                            key={bp.id}
                            type="button"
                            onClick={() => setSelectedBidPackageId(bp.id)}
                            className={cn(
                              "w-full text-left p-3 rounded-lg border transition-colors",
                              selectedBidPackageId === bp.id ? "border-bannett-navy bg-bannett-navy/5" : "border-border hover:bg-muted/50",
                            )}
                          >
                            <div className="flex items-start justify-between gap-2">
                              <p className="text-sm font-medium text-card-foreground line-clamp-2">{bp.title}</p>
                              <Badge className={cn("shrink-0", bidStatusBadge(bp.status))}>{bp.status}</Badge>
                            </div>
                            <p className="text-xs text-muted-foreground mt-2">
                              Due: {bp.due_date ?? "—"} • Updated: {formatShortDate(bp.updated_at)}
                            </p>
                          </button>
                        ))}
                      </div>
                    )}
                  </CardContent>
                </Card>

                <Card className="bg-card lg:col-span-2">
                  <CardHeader>
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <CardTitle className="text-card-foreground">Package Details</CardTitle>
                        <p className="text-sm text-muted-foreground">{selectedBidPackage ? selectedBidPackage.title : "Select a bid package"}</p>
                      </div>
                      {selectedBidPackage && (
                        <div className="flex items-center gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() =>
                              toast.success("Opening Planroom", { description: `Launching ${selectedBidPackage.title} in Procore.` })
                            }
                          >
                            <ExternalLink className="w-4 h-4 mr-2" />
                            Open in Procore
                          </Button>
                        </div>
                      )}
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    {!selectedBidPackage ? (
                      <div className="p-4 rounded-lg bg-muted/50 text-sm text-muted-foreground">
                        Select a bid package to view bidder roster and attachments.
                      </div>
                    ) : (
                      <>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                          <div className="p-4 rounded-lg bg-muted/50">
                            <p className="text-xs text-muted-foreground">Status</p>
                            <p className="text-sm font-medium text-card-foreground mt-1">{selectedBidPackage.status}</p>
                          </div>
                          <div className="p-4 rounded-lg bg-muted/50">
                            <p className="text-xs text-muted-foreground">Due date</p>
                            <p className="text-sm font-medium text-card-foreground mt-1">{selectedBidPackage.due_date ?? "—"}</p>
                          </div>
                          <div className="p-4 rounded-lg bg-muted/50">
                            <p className="text-xs text-muted-foreground">Last updated</p>
                            <p className="text-sm font-medium text-card-foreground mt-1">{formatShortDate(selectedBidPackage.updated_at)}</p>
                          </div>
                        </div>

                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                          <div className="space-y-3">
                            <div className="flex items-center justify-between">
                              <p className="text-sm font-medium text-card-foreground">Attachments</p>
                              <Badge variant="secondary">{planroomDocsLoading ? "…" : planroomDocs.length}</Badge>
                            </div>
                            {planroomDocsLoading ? (
                              <div className="p-3 rounded-lg bg-muted/50 text-sm text-muted-foreground">Loading attachments…</div>
                            ) : planroomDocs.length === 0 ? (
                              <div className="p-3 rounded-lg bg-muted/50 text-sm text-muted-foreground">
                                No documents attached to this bid package.
                              </div>
                            ) : (
                              <div className="space-y-2">
                                {planroomDocs.map((doc) => (
                                  <div key={doc.id} className="flex items-center justify-between gap-3 p-3 rounded-lg bg-muted/50">
                                    <div className="min-w-0">
                                      <p className="text-sm font-medium text-card-foreground truncate">{doc.name}</p>
                                      <p className="text-xs text-muted-foreground">Updated: {formatShortDate(doc.updated_at)}</p>
                                    </div>
                                    <Button
                                      size="sm"
                                      variant="outline"
                                      onClick={() => toast.success("Opening document", { description: doc.path ?? doc.name })}
                                    >
                                      <FileText className="w-4 h-4 mr-2" />
                                      View
                                    </Button>
                                  </div>
                                ))}
                              </div>
                            )}
                          </div>

                          <div className="space-y-3">
                            <div className="flex items-center justify-between">
                              <p className="text-sm font-medium text-card-foreground">Bidders</p>
                              <Badge variant="secondary">{planroomBidsLoading ? "…" : planroomBids.length}</Badge>
                            </div>
                            {planroomBidsLoading || vendorDirectoryLoading ? (
                              <div className="p-3 rounded-lg bg-muted/50 text-sm text-muted-foreground">Loading bidder roster…</div>
                            ) : planroomBids.length === 0 ? (
                              <div className="p-3 rounded-lg bg-muted/50 text-sm text-muted-foreground">
                                No bidders yet. Invite bidders using AI Matching.
                              </div>
                            ) : (
                              <div className="border rounded-lg overflow-hidden">
                                <table className="w-full text-sm">
                                  <thead className="bg-muted/50">
                                    <tr>
                                      <th className="text-left p-3 text-xs font-medium text-muted-foreground">Vendor</th>
                                      <th className="text-left p-3 text-xs font-medium text-muted-foreground">Submitted</th>
                                      <th className="text-left p-3 text-xs font-medium text-muted-foreground">Amount</th>
                                      <th className="text-left p-3 text-xs font-medium text-muted-foreground">Updated</th>
                                    </tr>
                                  </thead>
                                  <tbody>
                                    {planroomBids.map((bid) => {
                                      const vendor = vendorById.get(bid.vendor_id)
                                      return (
                                        <tr key={bid.id} className="border-t">
                                          <td className="p-3">
                                            <button
                                              type="button"
                                              className="font-medium text-card-foreground text-left hover:underline"
                                              onClick={() => setVendorProfileId(bid.vendor_id)}
                                            >
                                              {vendor?.name ?? `Vendor #${bid.vendor_id}`}
                                            </button>
                                            <p className="text-xs text-muted-foreground">{vendor?.trade_name ?? "—"}</p>
                                          </td>
                                          <td className="p-3">
                                            <Badge className={bid.submitted ? "bg-success text-primary-foreground" : "bg-muted text-foreground"}>
                                              {bid.submitted ? "Yes" : "No"}
                                            </Badge>
                                          </td>
                                          <td className="p-3 text-card-foreground">
                                            {bid.lump_sum_amount ? `$${Math.round(bid.lump_sum_amount).toLocaleString()}` : "—"}
                                          </td>
                                          <td className="p-3 text-muted-foreground">{formatShortDate(bid.updated_at)}</td>
                                        </tr>
                                      )
                                    })}
                                  </tbody>
                                </table>
                              </div>
                            )}
                            <p className="text-xs text-muted-foreground">
                              Roster mirrors `GET /rest/v1.0/projects/:project_id/bid_packages/:bid_package_id/bids`.
                            </p>
                          </div>
                        </div>

                        <div className="space-y-3">
                          <div className="flex items-center justify-between">
                            <p className="text-sm font-medium text-card-foreground">Planroom Activity</p>
                            <Badge variant="secondary">{planroomActivity.length} events</Badge>
                          </div>
                          {planroomActivity.length === 0 ? (
                            <div className="p-3 rounded-lg bg-muted/50 text-sm text-muted-foreground">
                              No recent activity for this bid package.
                            </div>
                          ) : (
                            <div className="space-y-2">
                              {planroomActivity.map((ev) => (
                                <div key={ev.id} className="flex items-start justify-between gap-3 p-3 rounded-lg bg-muted/50">
                                  <div className="min-w-0">
                                    <p className="text-sm text-card-foreground">{ev.label}</p>
                                    <p className="text-xs text-muted-foreground mt-1">{formatShortDate(ev.at)}</p>
                                  </div>
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      </>
                    )}
                  </CardContent>
                </Card>
              </div>
            </div>
          ) : (
            <>
          {/* Step Indicator */}
          <div className="flex items-center gap-2 mb-8">
            {[1, 2, 3].map((s) => (
              <div key={s} className="flex items-center">
                <div
                  className={cn(
                    "w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium transition-colors",
                    step >= s ? "bg-bannett-navy text-primary-foreground" : "bg-muted text-muted-foreground",
                  )}
                >
                  {step > s ? <Check className="w-4 h-4" /> : s}
                </div>
                <span
                  className={cn(
                    "ml-2 text-sm hidden sm:inline",
                    step >= s ? "text-foreground" : "text-muted-foreground",
                  )}
                >
                  {s === 1 && "Job Details"}
                  {s === 2 && "AI Ranking"}
                  {s === 3 && "Selection"}
                </span>
                {s < 3 && <ChevronRight className="w-4 h-4 mx-3 text-muted-foreground" />}
              </div>
            ))}
          </div>

      {/* Step 1: Job Details */}
      {step === 1 && (
        <Card className="bg-card">
          <CardHeader>
            <CardTitle className="text-card-foreground">Job Details</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Project Location</Label>
                <div className="flex items-center gap-2 p-3 rounded-lg bg-muted/50">
                  <MapPin className="w-4 h-4 text-muted-foreground" />
                  <span className="text-sm">{formData.location}</span>
                </div>
              </div>
              <div className="space-y-2">
                <Label>Trade Category</Label>
                <Select
                  value={formData.trade}
                  onValueChange={(value) => setFormData((prev) => ({ ...prev, trade: value }))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select trade" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="mep">MEP (Full Package)</SelectItem>
                    <SelectItem value="electrical">Electrical</SelectItem>
                    <SelectItem value="plumbing">Plumbing</SelectItem>
                    <SelectItem value="hvac">HVAC</SelectItem>
                    <SelectItem value="concrete">Concrete</SelectItem>
                    <SelectItem value="steel">Structural Steel</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Budget Range (Min)</Label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">$</span>
                  <Input
                    value={formData.budgetMin}
                    onChange={(e) => setFormData((prev) => ({ ...prev, budgetMin: e.target.value }))}
                    className="pl-7"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label>Budget Range (Max)</Label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">$</span>
                  <Input
                    value={formData.budgetMax}
                    onChange={(e) => setFormData((prev) => ({ ...prev, budgetMax: e.target.value }))}
                    className="pl-7"
                  />
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <Label>Timeline</Label>
              <Select
                value={formData.timeline}
                onValueChange={(value) => setFormData((prev) => ({ ...prev, timeline: value }))}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="3 months">3 months</SelectItem>
                  <SelectItem value="6 months">6 months</SelectItem>
                  <SelectItem value="9 months">9 months</SelectItem>
                  <SelectItem value="12 months">12 months</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Special Requirements</Label>
              <Textarea
                value={formData.requirements}
                onChange={(e) => setFormData((prev) => ({ ...prev, requirements: e.target.value }))}
                placeholder="e.g., Healthcare compliance, LEED certification, union labor..."
              />
            </div>

            <Button
              onClick={generateRecommendations}
              className="w-full bg-bannett-navy hover:bg-bannett-navy/90"
              disabled={!formData.trade}
            >
              {isGenerating ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Generating Recommendations...
                </>
              ) : (
                <>
                  Generate Recommendations
                  <ArrowRight className="w-4 h-4 ml-2" />
                </>
              )}
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Step 2: AI Ranking */}
      {step === 2 && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-medium text-foreground">AI Subcontractor Ranking</h2>
              <p className="text-sm text-muted-foreground">Select up to 3 subcontractors for your bid package</p>
            </div>
            <div className="flex items-center gap-2">
              <Select value={sortMode} onValueChange={(value) => setSortMode(value as SortMode)}>
                <SelectTrigger className="w-[220px] h-9">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="max-h-60 overflow-y-auto z-[100]">
                  <SelectItem value="Recommended">Recommended</SelectItem>
                  <SelectItem value="Distance">Distance</SelectItem>
                  <SelectItem value="Capacity">Capacity</SelectItem>
                  <SelectItem value="Price">Price</SelectItem>
                </SelectContent>
              </Select>
              <Badge className="bg-bannett-navy">{selectedSubs.length}/3 Selected</Badge>
            </div>
          </div>

          <div className="space-y-3">
            {visibleRecommendations.length === 0 ? (
              <div className="p-4 rounded-lg bg-muted/50">
                <p className="text-sm text-muted-foreground">No vendors found for the selected trade.</p>
              </div>
            ) : (
              visibleRecommendations.map((sub, index) => (
                <Card
                  key={sub.id}
                  className={cn(
                    "cursor-pointer transition-all bg-card",
                    selectedSubs.includes(sub.id) && "ring-2 ring-bannett-navy",
                  )}
                >
                  <CardContent className="p-4">
                    <div className="flex items-start gap-4">
                      <div className="flex items-center justify-center" onClick={() => toggleSubSelection(sub.id)}>
                        <Checkbox checked={selectedSubs.includes(sub.id)} />
                      </div>

                      <div className="flex-1">
                        <div className="flex items-start justify-between">
                          <div>
                            <div className="flex items-center gap-2">
                              <span className="text-sm font-medium text-muted-foreground">#{index + 1}</span>
                              <h3 className="font-semibold text-card-foreground">{sub.name}</h3>
                              <Badge variant="outline">{sub.trade}</Badge>
                            </div>
                            <div className="flex items-center gap-4 mt-2 text-sm text-muted-foreground">
                              <span className="flex items-center gap-1">
                                <MapPin className="w-3 h-3" />
                                {sub.distance}
                              </span>
                              <span className="flex items-center gap-1">
                                <Star className="w-3 h-3 text-warning" />
                                {sub.performance}% performance
                              </span>
                              <span className="flex items-center gap-1">
                                <TrendingUp className="w-3 h-3" />
                                {sub.pricing}
                              </span>
                            </div>
                            <p className="text-xs text-muted-foreground mt-1">
                              Last updated: {formatShortDate(sub.updated_at)}
                            </p>
                          </div>

                          <div className="flex items-center gap-3">
                            <div className="text-right">
                              <div className="flex items-center gap-1">
                                <span className="text-2xl font-semibold text-bannett-navy">{sub.confidence}%</span>
                              </div>
                              <span className="text-xs text-muted-foreground">Match Score</span>
                            </div>
                          </div>
                        </div>

                        <div className="flex items-center gap-4 mt-3">
                          <Badge
                            variant={sub.capacity === "High" ? "default" : "secondary"}
                            className={sub.capacity === "High" ? "bg-success" : ""}
                          >
                            {sub.capacity} Capacity
                          </Badge>
                          <Badge
                            variant={sub.availability === "Available" ? "default" : "secondary"}
                            className={sub.availability === "Available" ? "bg-success" : "bg-warning text-foreground"}
                          >
                            {sub.availability}
                          </Badge>
                          <div className="flex gap-1">
                            {sub.certifications.slice(0, 2).map((cert) => (
                              <Badge key={cert} variant="outline" className="text-xs">
                                <Shield className="w-3 h-3 mr-1" />
                                {cert}
                              </Badge>
                            ))}
                            {sub.certifications.length > 2 && (
                              <Badge variant="outline" className="text-xs">
                                +{sub.certifications.length - 2}
                              </Badge>
                            )}
                          </div>
                        </div>
                      </div>

                      <Button variant="ghost" size="sm" onClick={() => setReasoningModal(sub)}>
                        View Details
                        <ChevronRight className="w-4 h-4 ml-1" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </div>

          <div className="flex justify-end">
            <Button
              onClick={() => setStep(3)}
              className="bg-bannett-navy hover:bg-bannett-navy/90"
              disabled={selectedSubs.length === 0}
            >
              Continue to Selection
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          </div>

          {/* Reasoning Card Modal */}
          <Dialog open={!!reasoningModal} onOpenChange={() => setReasoningModal(null)}>
            <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle className="flex items-center gap-2">
                  <Building2 className="w-5 h-5" />
                  {reasoningModal?.name}
                </DialogTitle>
              </DialogHeader>

              {reasoningModal && (
                <div className="space-y-6 py-4">
                  {/* Confidence Score */}
                  <div className="flex items-center justify-between p-4 rounded-lg bg-bannett-navy/10">
                    <span className="font-medium text-card-foreground">AI Confidence Score</span>
                    <div className="flex items-center gap-2">
                      <Progress value={reasoningModal.confidence} className="w-32 h-2" />
                      <span className="font-semibold text-bannett-navy">{reasoningModal.confidence}%</span>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div className="p-4 rounded-lg bg-muted/50">
                      <p className="text-xs text-muted-foreground">Trade Fit</p>
                      <p className="text-sm font-medium text-card-foreground mt-1">{reasoningModal.tradeFit}</p>
                      {(reasoningModal.city || reasoningModal.state_code) && (
                        <p className="text-xs text-muted-foreground mt-2">
                          Based in {reasoningModal.city ?? "—"}, {reasoningModal.state_code ?? "—"}
                        </p>
                      )}
                    </div>
                    <div className="p-4 rounded-lg bg-muted/50">
                      <p className="text-xs text-muted-foreground">Availability Window</p>
                      <p className="text-sm font-medium text-card-foreground mt-1">{reasoningModal.availabilityWindow}</p>
                      <p className="text-xs text-muted-foreground mt-2">
                        Capacity: {reasoningModal.capacity} • Pricing: {reasoningModal.pricing}
                      </p>
                    </div>
                  </div>

                  {/* Contact Info */}
                  <div className="flex gap-4">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={async () => {
                        const phone = reasoningModal.business_phone ?? "(503) 555-0123"
                        try {
                          await navigator.clipboard.writeText(phone)
                          toast.success("Phone copied", { description: phone })
                        } catch {
                          toast.success("Phone", { description: phone })
                        }
                      }}
                    >
                      <Phone className="w-4 h-4 mr-2" />
                      {reasoningModal.business_phone ?? "(503) 555-0123"}
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        toast.success("Contact draft created", {
                          description: `Prepared outreach message for ${reasoningModal.name}.`,
                        })
                      }}
                    >
                      <Mail className="w-4 h-4 mr-2" />
                      Contact
                    </Button>
	                  <Button
	                    variant="outline"
	                    size="sm"
	                    onClick={() => {
	                      setReasoningModal(null)
	                      setVendorProfileId(reasoningModal.id)
	                    }}
	                  >
	                    <ExternalLink className="w-4 h-4 mr-2" />
	                    Directory Profile
	                  </Button>
                  </div>

                  {/* Strengths */}
                  <div>
                    <h4 className="font-medium mb-2 flex items-center gap-2 text-card-foreground">
                      <ThumbsUp className="w-4 h-4 text-success" />
                      Strengths
                    </h4>
                    <ul className="space-y-1">
                      {reasoningModal.strengths.map((s, i) => (
                        <li key={i} className="text-sm text-muted-foreground flex items-center gap-2">
                          <Check className="w-3 h-3 text-success" />
                          {s}
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* Weaknesses */}
                  <div>
                    <h4 className="font-medium mb-2 flex items-center gap-2 text-card-foreground">
                      <ThumbsDown className="w-4 h-4 text-destructive" />
                      Weaknesses
                    </h4>
                    <ul className="space-y-1">
                      {reasoningModal.weaknesses.map((w, i) => (
                        <li key={i} className="text-sm text-muted-foreground flex items-center gap-2">
                          <AlertCircle className="w-3 h-3 text-warning" />
                          {w}
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* Past Projects */}
                  <div>
                    <h4 className="font-medium mb-2 text-card-foreground">Past Work</h4>
                    <div className="flex flex-wrap gap-2">
                      {reasoningModal.pastProjects.map((p, i) => (
                        <Badge key={i} variant="secondary">
                          {p}
                        </Badge>
                      ))}
                    </div>
                  </div>

                  {/* Certifications */}
                  <div>
                    <h4 className="font-medium mb-2 text-card-foreground">Certifications</h4>
                    <div className="flex flex-wrap gap-2">
                      {reasoningModal.certifications.map((c, i) => (
                        <Badge key={i} variant="outline">
                          <Shield className="w-3 h-3 mr-1" />
                          {c}
                        </Badge>
                      ))}
                    </div>
                  </div>

                  {/* Risk Factors */}
                  <div className="p-3 rounded-lg bg-warning/10">
                    <h4 className="font-medium mb-2 flex items-center gap-2 text-card-foreground">
                      <AlertCircle className="w-4 h-4 text-warning" />
                      Risk Flags
                    </h4>
                    <ul className="space-y-1">
                      {reasoningModal.riskFactors.map((r, i) => (
                        <li key={i} className="text-sm text-muted-foreground">
                          {r}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              )}

              <DialogFooter>
                <Button variant="outline" onClick={() => setReasoningModal(null)}>
                  Close
                </Button>
                <Button
                  className="bg-bannett-navy hover:bg-bannett-navy/90"
                  onClick={() => {
                    if (reasoningModal) {
                      toggleSubSelection(reasoningModal.id)
                      setReasoningModal(null)
                    }
                  }}
                >
                  {reasoningModal && selectedSubs.includes(reasoningModal.id)
                    ? "Remove from Selection"
                    : "Add to Selection"}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      )}

      {/* Step 3: Selection Confirmation */}
      {step === 3 && (
        <Card className="bg-card">
          <CardHeader>
            <CardTitle className="text-card-foreground">Confirm Selection</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div>
              <h3 className="font-medium mb-3 text-card-foreground">Selected Subcontractors</h3>
              <div className="space-y-3">
                {selectedRecommendations.length === 0 ? (
                  <div className="p-4 rounded-lg bg-muted/50">
                    <p className="text-sm text-muted-foreground">No subcontractors selected.</p>
                  </div>
                ) : (
                  selectedRecommendations.map((sub) => (
                    <div key={sub.id} className="flex items-center justify-between p-4 rounded-lg bg-muted/50">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-bannett-navy flex items-center justify-center">
                          <Building2 className="w-5 h-5 text-primary-foreground" />
                        </div>
                        <div>
                          <p className="font-medium text-card-foreground">{sub.name}</p>
                          <p className="text-sm text-muted-foreground">{sub.trade}</p>
                        </div>
                      </div>
                      <Badge className="bg-bannett-navy">{sub.confidence}% match</Badge>
                    </div>
                  ))
                )}
              </div>
            </div>

            <div className="space-y-2">
              <Label>Bid Package</Label>
              {bidPackagesLoading ? (
                <div className="p-3 rounded-lg bg-muted/50 text-sm text-muted-foreground">Loading bid packages…</div>
              ) : bidPackages.length === 0 ? (
                <div className="p-3 rounded-lg bg-warning/10 text-sm text-card-foreground">
                  No bid packages found for this project. Create one in Procore (Bidding → Bid Packages) to push bidders.
                </div>
              ) : (
                <Select
                  value={selectedBidPackageId ? String(selectedBidPackageId) : ""}
                  onValueChange={(value) => setSelectedBidPackageId(Number(value))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select a bid package" />
                  </SelectTrigger>
                  <SelectContent className="max-h-60 overflow-y-auto z-[100]">
                    {bidPackages.map((bp) => (
                      <SelectItem key={bp.id} value={String(bp.id)}>
                        {bp.title}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
              <p className="text-xs text-muted-foreground">Mock push adds bidders to a Procore bid package.</p>
              {selectedBidPackage && (
                <p className="text-xs text-muted-foreground">
                  Status: {selectedBidPackage.status}
                  {" • "}
                  Due: {selectedBidPackage.due_date ?? "—"}
                  {" • "}
                  Updated: {formatShortDate(selectedBidPackage.updated_at)}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label>Notes for Bid Package</Label>
              <Textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Add any notes or special instructions for this bid package..."
                rows={4}
              />
            </div>

            <div className="p-4 rounded-lg bg-muted/50">
              <h4 className="font-medium mb-2 text-card-foreground">Bid Package Summary</h4>
              <div className="space-y-1 text-sm">
                <div className="flex justify-between text-muted-foreground">
                  <span>Trade</span>
                  <span className="font-medium text-card-foreground">{formData.trade.toUpperCase()}</span>
                </div>
                <div className="flex justify-between text-muted-foreground">
                  <span>Budget Range</span>
                  <span className="font-medium text-card-foreground">
                    ${Number.parseInt(formData.budgetMin).toLocaleString()} - $
                    {Number.parseInt(formData.budgetMax).toLocaleString()}
                  </span>
                </div>
                <div className="flex justify-between text-muted-foreground">
                  <span>Timeline</span>
                  <span className="font-medium text-card-foreground">{formData.timeline}</span>
                </div>
                <div className="flex justify-between text-muted-foreground">
                  <span>Subcontractors</span>
                  <span className="font-medium text-card-foreground">{selectedSubs.length}</span>
                </div>
              </div>
            </div>

            <Button
              onClick={pushToProcore}
              className="w-full bg-bannett-navy hover:bg-bannett-navy/90"
              disabled={isPushing || bidPackagesLoading || bidPackages.length === 0 || !selectedBidPackageId}
            >
              {isPushing ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Pushing…
                </>
              ) : (
                <>
                  Push to Procore Bid Package
                  <ArrowRight className="w-4 h-4 ml-2" />
                </>
              )}
	            </Button>
	          </CardContent>
	        </Card>
	      )}
	            </>
	          )}
	        </CardContent>
	      </Card>

	      {/* Directory vendor profile (mock) */}
	      <Dialog open={vendorProfileId !== null} onOpenChange={(open) => !open && setVendorProfileId(null)}>
	        <DialogContent className="max-w-4xl max-h-[85vh] overflow-y-auto">
	          <DialogHeader>
	            <DialogTitle className="flex flex-col gap-1">
	              <span className="flex items-center gap-2">
	                <Building2 className="w-5 h-5" />
	                {activeVendorProfile?.name ?? "Vendor Profile"}
	              </span>
	              {activeVendorProfile && (
	                <span className="text-xs text-muted-foreground">
	                  Mentioned in Directory • Vendor ID {activeVendorProfile.vendor_id}
	                  {activeVendorProfile.trade ? ` • ${activeVendorProfile.trade}` : ""}
	                </span>
	              )}
	            </DialogTitle>
	          </DialogHeader>

	          {!activeVendorProfile ? (
	            <div className="p-4 rounded-lg bg-muted/50 text-sm text-muted-foreground">Loading vendor profile…</div>
	          ) : (
	            <Tabs key={activeVendorProfile.vendor_id} defaultValue="overview" className="mt-2">
	              <TabsList className="grid grid-cols-5 w-full">
	                <TabsTrigger value="overview">Overview</TabsTrigger>
	                <TabsTrigger value="contacts">Contacts</TabsTrigger>
	                <TabsTrigger value="compliance">Compliance</TabsTrigger>
	                <TabsTrigger value="past">Past Work</TabsTrigger>
	                <TabsTrigger value="notes">Notes</TabsTrigger>
	              </TabsList>

	              <TabsContent value="overview" className="mt-4 space-y-4">
	                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
	                  <div className="p-4 rounded-lg bg-muted/50">
	                    <p className="text-xs text-muted-foreground">Location</p>
	                    <p className="text-sm font-medium text-card-foreground mt-1">
	                      {[activeVendorProfile.city, activeVendorProfile.state_code].filter(Boolean).join(", ") || "—"}
	                    </p>
	                  </div>
	                  <div className="p-4 rounded-lg bg-muted/50">
	                    <p className="text-xs text-muted-foreground">Phone</p>
	                    <p className="text-sm font-medium text-card-foreground mt-1">{activeVendorProfile.business_phone ?? "—"}</p>
	                  </div>
	                  <div className="p-4 rounded-lg bg-muted/50">
	                    <p className="text-xs text-muted-foreground">Website</p>
	                    <p className="text-sm font-medium text-card-foreground mt-1 break-all">{activeVendorProfile.website}</p>
	                  </div>
	                </div>

	                <div className="p-4 rounded-lg bg-bannett-navy/10">
	                  <p className="text-sm font-medium text-card-foreground">Trade fit for this project</p>
	                  <p className="text-sm text-muted-foreground mt-1">
	                    Deterministic profile based on vendor + project context. Use for feasibility / UX validation.
	                  </p>
	                  <div className="flex flex-wrap gap-2 mt-3">
	                    {activeVendorProfile.tags.map((t) => (
	                      <Badge key={t} variant="secondary">
	                        {t}
	                      </Badge>
	                    ))}
	                  </div>
	                </div>

	                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
	                  <div className="p-4 rounded-lg bg-muted/50">
	                    <p className="text-xs text-muted-foreground">Insurance status</p>
	                    <div className="mt-2 space-y-2">
	                      {activeVendorProfile.insurance.map((row) => (
	                        <div key={row.type} className="flex items-center justify-between gap-3">
	                          <span className="text-sm text-card-foreground">{row.type}</span>
	                          <Badge
	                            className={cn(
	                              row.status === "Active"
	                                ? "bg-success text-primary-foreground"
	                                : row.status === "Expiring"
	                                  ? "bg-warning text-foreground"
	                                  : "bg-destructive text-primary-foreground",
	                            )}
	                          >
	                            {row.status}
	                          </Badge>
	                        </div>
	                      ))}
	                    </div>
	                  </div>
	                  <div className="p-4 rounded-lg bg-muted/50">
	                    <p className="text-xs text-muted-foreground">Safety metrics</p>
	                    <div className="mt-2 space-y-2">
	                      {activeVendorProfile.safety.map((row) => (
	                        <div key={row.metric} className="flex items-start justify-between gap-3">
	                          <div className="min-w-0">
	                            <p className="text-sm font-medium text-card-foreground">{row.metric}</p>
	                            <p className="text-xs text-muted-foreground mt-1">{row.notes}</p>
	                          </div>
	                          <span className="text-sm text-card-foreground">{row.value}</span>
	                        </div>
	                      ))}
	                    </div>
	                  </div>
	                </div>
	              </TabsContent>

	              <TabsContent value="contacts" className="mt-4 space-y-4">
	                <div className="border rounded-lg overflow-hidden">
	                  <table className="w-full text-sm">
	                    <thead className="bg-muted/50">
	                      <tr>
	                        <th className="text-left p-3 text-xs font-medium text-muted-foreground">Name</th>
	                        <th className="text-left p-3 text-xs font-medium text-muted-foreground">Role</th>
	                        <th className="text-left p-3 text-xs font-medium text-muted-foreground">Email</th>
	                        <th className="text-left p-3 text-xs font-medium text-muted-foreground">Phone</th>
	                      </tr>
	                    </thead>
	                    <tbody>
	                      {activeVendorProfile.contacts.map((c) => (
	                        <tr key={c.email} className="border-t">
	                          <td className="p-3 font-medium text-card-foreground">{c.name}</td>
	                          <td className="p-3 text-muted-foreground">{c.role}</td>
	                          <td className="p-3">
	                            <button
	                              type="button"
	                              className="text-bannett-navy hover:underline"
	                              onClick={() => toast.success("Draft email created", { description: `Prepared message for ${c.email}` })}
	                            >
	                              {c.email}
	                            </button>
	                          </td>
	                          <td className="p-3">
	                            <button
	                              type="button"
	                              className="text-bannett-navy hover:underline"
	                              onClick={async () => {
	                                try {
	                                  await navigator.clipboard.writeText(c.phone)
	                                  toast.success("Phone copied", { description: c.phone })
	                                } catch {
	                                  toast.message("Phone", { description: c.phone })
	                                }
	                              }}
	                            >
	                              {c.phone}
	                            </button>
	                          </td>
	                        </tr>
	                      ))}
	                    </tbody>
	                  </table>
	                </div>
	                <p className="text-xs text-muted-foreground">
	                  Mirrors Procore Directory vendor contacts behavior (mocked, deterministic).
	                </p>
	              </TabsContent>

	              <TabsContent value="compliance" className="mt-4 space-y-4">
	                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
	                  <div className="p-4 rounded-lg bg-muted/50">
	                    <p className="text-sm font-medium text-card-foreground">Insurance</p>
	                    <div className="mt-3 space-y-3">
	                      {activeVendorProfile.insurance.map((row) => (
	                        <div key={row.type} className="flex items-start justify-between gap-3">
	                          <div className="min-w-0">
	                            <p className="text-sm font-medium text-card-foreground">{row.type}</p>
	                            <p className="text-xs text-muted-foreground mt-1">
	                              Policy {row.policy_number} • Expires {row.expires_on}
	                            </p>
	                          </div>
	                          <Badge
	                            className={cn(
	                              row.status === "Active"
	                                ? "bg-success text-primary-foreground"
	                                : row.status === "Expiring"
	                                  ? "bg-warning text-foreground"
	                                  : "bg-destructive text-primary-foreground",
	                            )}
	                          >
	                            {row.status}
	                          </Badge>
	                        </div>
	                      ))}
	                    </div>
	                  </div>
	                  <div className="p-4 rounded-lg bg-muted/50">
	                    <p className="text-sm font-medium text-card-foreground">Licenses & docs</p>
	                    <div className="mt-3 space-y-3">
	                      {activeVendorProfile.licenses.map((row) => (
	                        <div key={row.label} className="flex items-center justify-between gap-3">
	                          <span className="text-sm text-card-foreground">{row.label}</span>
	                          <span className="text-sm text-muted-foreground">{row.value}</span>
	                        </div>
	                      ))}
	                    </div>
	                  </div>
	                </div>
	                <div className="p-4 rounded-lg bg-muted/50">
	                  <p className="text-sm font-medium text-card-foreground">Safety</p>
	                  <div className="mt-3 grid grid-cols-1 md:grid-cols-3 gap-3">
	                    {activeVendorProfile.safety.map((row) => (
	                      <div key={row.metric} className="p-3 rounded-lg bg-background">
	                        <p className="text-xs text-muted-foreground">{row.metric}</p>
	                        <p className="text-sm font-medium text-card-foreground mt-1">{row.value}</p>
	                        <p className="text-xs text-muted-foreground mt-2">{row.notes}</p>
	                      </div>
	                    ))}
	                  </div>
	                </div>
	              </TabsContent>

	              <TabsContent value="past" className="mt-4 space-y-4">
	                <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-3">
	                  <div className="space-y-2">
	                    <Label>Search past work</Label>
	                    <Input value={profilePastSearch} onChange={(e) => setProfilePastSearch(e.target.value)} placeholder="Search projects…" />
	                  </div>
	                  <div className="space-y-2">
	                    <Label>Sort</Label>
	                    <Select value={profilePastSort} onValueChange={(v) => setProfilePastSort(v as typeof profilePastSort)}>
	                      <SelectTrigger className="w-[220px]">
	                        <SelectValue />
	                      </SelectTrigger>
	                      <SelectContent className="max-h-60 overflow-y-auto z-[100]">
	                        <SelectItem value="year_desc">Year (newest)</SelectItem>
	                        <SelectItem value="year_asc">Year (oldest)</SelectItem>
	                        <SelectItem value="value_desc">Contract value</SelectItem>
	                      </SelectContent>
	                    </Select>
	                  </div>
	                </div>

	                <div className="border rounded-lg overflow-hidden">
	                  <table className="w-full text-sm">
	                    <thead className="bg-muted/50">
	                      <tr>
	                        <th className="text-left p-3 text-xs font-medium text-muted-foreground">Project</th>
	                        <th className="text-left p-3 text-xs font-medium text-muted-foreground">Role</th>
	                        <th className="text-left p-3 text-xs font-medium text-muted-foreground">Year</th>
	                        <th className="text-left p-3 text-xs font-medium text-muted-foreground">Value</th>
	                        <th className="text-left p-3 text-xs font-medium text-muted-foreground">Perf</th>
	                      </tr>
	                    </thead>
	                    <tbody>
	                      {profilePastRows.items.length === 0 ? (
	                        <tr className="border-t">
	                          <td className="p-4 text-sm text-muted-foreground" colSpan={5}>
	                            No past work matches your search.
	                          </td>
	                        </tr>
	                      ) : (
	                        profilePastRows.items.map((row) => (
	                          <tr key={`${row.project}-${row.year}`} className="border-t">
	                            <td className="p-3 font-medium text-card-foreground">{row.project}</td>
	                            <td className="p-3 text-muted-foreground">{row.role}</td>
	                            <td className="p-3 text-muted-foreground">{row.year}</td>
	                            <td className="p-3 text-card-foreground">${Math.round(row.value).toLocaleString()}</td>
	                            <td className="p-3">
	                              <Badge variant="secondary">{row.performance}%</Badge>
	                            </td>
	                          </tr>
	                        ))
	                      )}
	                    </tbody>
	                  </table>
	                </div>

	                <div className="flex items-center justify-between">
	                  <p className="text-xs text-muted-foreground">
	                    Page {Math.min(profilePastPage, profilePastRows.total_pages)} of {profilePastRows.total_pages}
	                  </p>
	                  <div className="flex items-center gap-2">
	                    <Button
	                      size="sm"
	                      variant="outline"
	                      disabled={profilePastPage <= 1}
	                      onClick={() => setProfilePastPage((p) => Math.max(1, p - 1))}
	                    >
	                      Previous
	                    </Button>
	                    <Button
	                      size="sm"
	                      variant="outline"
	                      disabled={profilePastPage >= profilePastRows.total_pages}
	                      onClick={() => setProfilePastPage((p) => Math.min(profilePastRows.total_pages, p + 1))}
	                    >
	                      Next
	                    </Button>
	                  </div>
	                </div>
	              </TabsContent>

	              <TabsContent value="notes" className="mt-4 space-y-4">
	                <div className="space-y-2">
	                  <Label>Add note</Label>
	                  <Textarea
	                    value={vendorNoteDraft}
	                    onChange={(e) => setVendorNoteDraft(e.target.value)}
	                    placeholder="Add a note visible to Bannett team members..."
	                    rows={3}
	                  />
	                  <div className="flex items-center justify-end gap-2">
	                    <Button variant="outline" onClick={() => setVendorNoteDraft("")} disabled={!vendorNoteDraft.trim()}>
	                      Clear
	                    </Button>
	                    <Button className="bg-bannett-navy hover:bg-bannett-navy/90" onClick={addVendorNote} disabled={!vendorNoteDraft.trim()}>
	                      Save Note
	                    </Button>
	                  </div>
	                </div>

	                <div className="space-y-2">
	                  <p className="text-sm font-medium text-card-foreground">Vendor notes</p>
	                  {(vendorNotesById[activeVendorProfile.vendor_id] ?? []).length === 0 ? (
	                    <div className="p-4 rounded-lg bg-muted/50 text-sm text-muted-foreground">No notes yet.</div>
	                  ) : (
	                    <div className="space-y-2">
	                      {(vendorNotesById[activeVendorProfile.vendor_id] ?? []).map((note, idx) => (
	                        <div key={`${idx}-${note.slice(0, 12)}`} className="p-3 rounded-lg bg-muted/50">
	                          <div className="flex items-start justify-between gap-3">
	                            <p className="text-sm text-card-foreground whitespace-pre-wrap">{note}</p>
	                            <Button
	                              size="sm"
	                              variant="ghost"
	                              onClick={() => removeVendorNote(activeVendorProfile.vendor_id, idx)}
	                            >
	                              Remove
	                            </Button>
	                          </div>
	                        </div>
	                      ))}
	                    </div>
	                  )}
	                </div>
	              </TabsContent>
	            </Tabs>
	          )}

	          <DialogFooter className="gap-2">
	            <div className="mr-auto text-xs text-muted-foreground">
	              Directory profile is mocked — fields align to Procore Directory shapes.
	            </div>
	            <Button variant="outline" onClick={() => setVendorProfileId(null)}>
	              Close
	            </Button>
	            {activeVendorProfile && workspaceView === "matching" && (
	              <Button
	                className="bg-bannett-navy hover:bg-bannett-navy/90"
	                onClick={() => toggleSubSelection(activeVendorProfile.vendor_id)}
	              >
	                {selectedSubs.includes(activeVendorProfile.vendor_id) ? "Remove from Selection" : "Add to Selection"}
	              </Button>
	            )}
	          </DialogFooter>
	        </DialogContent>
	      </Dialog>
	    </div>
	  )
}
