"use client"

import { useEffect, useState } from "react"
import {
  FileUp,
  Calculator,
  Users,
  AlertTriangle,
  TrendingUp,
  Search,
  Filter,
  Plus,
  FileText,
  Clock,
  ChevronDown,
  ChevronUp,
  Check,
  Bell,
  User,
} from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet"
import { Skeleton } from "@/components/ui/skeleton"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { toast } from "sonner"
import type { ModuleType } from "@/app/page"
import type { ProcoreProject } from "@/lib/procore/types"

interface DashboardProps {
  selectedProject: ProcoreProject
  setActiveModule: (module: ModuleType) => void
  onLogout?: () => void
}

type DashboardPreset = {
  kpis: {
    drawings: { value: string; change: string }
    estimates: { value: string; change: string }
    subs: { value: string; change: string }
    zoning: { value: string; change: string }
  }
  status: { completion: number; budget: string; timeline: string }
}

const dashboardPresets: Record<string, DashboardPreset> = {
  "Riverside Medical Center": {
    kpis: {
      drawings: { value: "24", change: "+8 this week" },
      estimates: { value: "3", change: "2 pending review" },
      subs: { value: "7", change: "5 high confidence" },
      zoning: { value: "2", change: "Action required" },
    },
    status: { completion: 34, budget: "$4.2M", timeline: "18 mo" },
  },
  "Harbor View Office Complex": {
    kpis: {
      drawings: { value: "18", change: "+4 this week" },
      estimates: { value: "2", change: "1 pending review" },
      subs: { value: "4", change: "2 high confidence" },
      zoning: { value: "1", change: "Review required" },
    },
    status: { completion: 19, budget: "$2.8M", timeline: "14 mo" },
  },
  "Westfield Shopping Plaza": {
    kpis: {
      drawings: { value: "31", change: "+11 this week" },
      estimates: { value: "5", change: "3 pending review" },
      subs: { value: "9", change: "6 high confidence" },
      zoning: { value: "3", change: "Action required" },
    },
    status: { completion: 41, budget: "$6.9M", timeline: "22 mo" },
  },
  "Downtown Transit Hub": {
    kpis: {
      drawings: { value: "12", change: "+2 this week" },
      estimates: { value: "1", change: "Drafting" },
      subs: { value: "3", change: "Pending shortlist" },
      zoning: { value: "0", change: "No issues" },
    },
    status: { completion: 11, budget: "$9.6M", timeline: "28 mo" },
  },
  "Lakeside Residential Tower": {
    kpis: {
      drawings: { value: "27", change: "+6 this week" },
      estimates: { value: "4", change: "2 pending review" },
      subs: { value: "6", change: "4 high confidence" },
      zoning: { value: "1", change: "Review required" },
    },
    status: { completion: 29, budget: "$7.4M", timeline: "20 mo" },
  },
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

const randInt = (rng: () => number, min: number, max: number) => min + Math.floor(rng() * (max - min + 1))

const pick = <T,>(rng: () => number, arr: T[]) => arr[Math.floor(rng() * arr.length)]

const formatMoney = (value: number) => `$${Math.round(value).toLocaleString("en-US")}`

const formatMoneyM = (valueMillions: number) => `$${valueMillions.toFixed(1)}M`

const pad2 = (n: number) => String(n).padStart(2, "0")

const formatDateShort = (d: Date) =>
  d.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })

const daysAgo = (base: Date, n: number) => {
  const d = new Date(base)
  d.setDate(d.getDate() - n)
  return d
}

const splitTotal = (rng: () => number, total: number, maxParts: number) => {
  if (!Number.isFinite(total) || total <= 0) return []
  const parts = Math.max(1, Math.min(maxParts, total))
  let remaining = total
  const counts: number[] = []
  for (let i = 0; i < parts; i += 1) {
    const partsLeft = parts - i
    if (partsLeft === 1) {
      counts.push(remaining)
      break
    }
    const minForRest = 1 * (partsLeft - 1)
    const maxForThis = Math.max(1, remaining - minForRest)
    const next = randInt(rng, 1, maxForThis)
    counts.push(next)
    remaining -= next
  }
  return counts
}

const sheetRange = (prefix: string, start: number, count: number) => {
  if (count <= 1) return `${prefix}${pad2(start)}`
  return `${prefix}${pad2(start)}-${prefix}${pad2(start + count - 1)}`
}

const makeBudgetForProject = (rng: () => number, projectName: string) => {
  const n = projectName.toLowerCase()
  if (n.includes("data center")) return formatMoneyM(12 + rng() * 18)
  if (n.includes("transit")) return formatMoneyM(9 + rng() * 14)
  if (n.includes("residential") || n.includes("tower")) return formatMoneyM(7 + rng() * 16)
  if (n.includes("medical") || n.includes("biotech") || n.includes("lab")) return formatMoneyM(4 + rng() * 10)
  if (n.includes("school") || n.includes("k–8") || n.includes("modernization")) return formatMoneyM(6 + rng() * 12)
  if (n.includes("warehouse") || n.includes("logistics")) return formatMoneyM(5 + rng() * 10)
  if (n.includes("hotel")) return formatMoneyM(3 + rng() * 6)
  if (n.includes("retail")) return formatMoneyM(2 + rng() * 5)
  return formatMoneyM(3 + rng() * 10)
}

const generateDashboardPreset = (projectId: number, projectName: string): DashboardPreset => {
  const rng = mulberry32(projectId ^ 0x91a2b3c4)

  const drawings = randInt(rng, 10, 34)
  const drawingsDelta = randInt(rng, 2, 12)

  const estimates = randInt(rng, 1, 6)
  const pendingReview = randInt(rng, 0, Math.min(4, estimates + 1))

  const subs = randInt(rng, 3, 10)
  const highConfidence = randInt(rng, 1, Math.min(7, subs))

  const zoningIssues = randInt(rng, 0, 4)

  const completion = randInt(rng, 8, 55)
  const timelineMonths = randInt(rng, 10, 28)
  const budget = makeBudgetForProject(rng, projectName)

  return {
    kpis: {
      drawings: { value: String(drawings), change: `+${drawingsDelta} this week` },
      estimates:
        pendingReview > 0
          ? { value: String(estimates), change: `${pendingReview} pending review` }
          : { value: String(estimates), change: rng() > 0.6 ? "Drafting" : "In review" },
      subs:
        highConfidence >= 3
          ? { value: String(subs), change: `${highConfidence} high confidence` }
          : { value: String(subs), change: "Pending shortlist" },
      zoning:
        zoningIssues === 0
          ? { value: "0", change: "No issues" }
          : zoningIssues >= 2
            ? { value: String(zoningIssues), change: "Action required" }
            : { value: String(zoningIssues), change: "Review required" },
    },
    status: { completion, budget, timeline: `${timelineMonths} mo` },
  }
}

const kpiData = [
  {
    label: "Drawings Uploaded",
    value: "24",
    change: "+8 this week",
    icon: FileUp,
    color: "bg-bannett-navy",
    details: [
      { sheet: "A01-A12", type: "Architectural", date: "Dec 6, 2025" },
      { sheet: "S01-S08", type: "Structural", date: "Dec 5, 2025" },
      { sheet: "M01-M04", type: "Mechanical", date: "Dec 4, 2025" },
    ],
  },
  {
    label: "Estimates in Progress",
    value: "3",
    change: "2 pending review",
    icon: Calculator,
    color: "bg-bannett-blue",
    details: [
      { name: "Phase 1 - Foundation", status: "In Review", progress: 85 },
      { name: "Phase 2 - Structure", status: "Drafting", progress: 45 },
      { name: "Phase 3 - MEP Rough-in", status: "Parsing", progress: 20 },
    ],
  },
  {
    label: "Sub Matches Pending",
    value: "7",
    change: "5 high confidence",
    icon: Users,
    color: "bg-bannett-light",
    details: [
      { trade: "Electrical", matches: 3, topScore: 94 },
      { trade: "Plumbing", matches: 2, topScore: 89 },
      { trade: "HVAC", matches: 2, topScore: 87 },
    ],
  },
  {
    label: "Zoning Issues",
    value: "2",
    change: "Action required",
    icon: AlertTriangle,
    color: "bg-warning",
    details: [
      { issue: "ADA Compliance - Parking", severity: "High", section: "4.2.1" },
      { issue: "Setback Violation - East", severity: "Medium", section: "6.1.3" },
    ],
  },
]

type ActivityFeedItem =
  | {
      id: number
      message: string
      time: string
      type: "parsing"
      details: {
        sheet: string
        elements: { walls: number; doors: number; windows: number }
        confidence: number
        issues: string[]
      }
    }
  | {
      id: number
      message: string
      time: string
      type: "matching"
      details: { package: string; recommendations: { name: string; score: number; distance: string; capacity: string }[] }
    }
  | {
      id: number
      message: string
      time: string
      type: "zoning"
      details: { document: string; issue: string; requirement: string; recommendation: string }
    }
  | {
      id: number
      message: string
      time: string
      type: "estimate"
      details: { phase: string; totalCost: string; lineItems: number; pendingReview: number }
    }
  | {
      id: number
      message: string
      time: string
      type: "upload"
      details: { sheets: number; totalPages: number; fileSize: string; uploadedBy: string }
    }

const activityFeed: ActivityFeedItem[] = [
  {
    id: 1,
    message: "AI identified 42 wall segments in Sheet A01",
    time: "5 min ago",
    type: "parsing",
    details: {
      sheet: "A01 - Ground Floor Plan",
      elements: { walls: 42, doors: 18, windows: 24 },
      confidence: 94,
      issues: ["Ambiguous boundary near Column C5"],
    },
  },
  {
    id: 2,
    message: "3 subcontractors recommended for MEP package",
    time: "23 min ago",
    type: "matching",
    details: {
      package: "MEP - Mechanical, Electrical, Plumbing",
      recommendations: [
        { name: "Summit Mechanical", score: 94, distance: "7.8 mi", capacity: "High" },
        { name: "ElectroPro Services", score: 91, distance: "11.6 mi", capacity: "Med" },
        { name: "Cascade Plumbing", score: 88, distance: "15.2 mi", capacity: "Med" },
      ],
    },
  },
  {
    id: 3,
    message: "Zoning document flagged ADA compliance issue",
    time: "1 hour ago",
    type: "zoning",
    details: {
      document: "City Planning Ordinance 2024-156",
      issue: "Insufficient accessible parking spaces",
      requirement: "12 spaces required, 8 shown on plans",
      recommendation: "Revise parking layout per ADA 2010 Standards",
    },
  },
  {
    id: 4,
    message: "Estimate draft ready for Phase 1 Foundation",
    time: "2 hours ago",
    type: "estimate",
    details: {
      phase: "Phase 1 - Foundation",
      totalCost: "$1,245,680",
      lineItems: 156,
      pendingReview: 12,
    },
  },
  {
    id: 5,
    message: "New drawing set uploaded: Structural S01-S08",
    time: "3 hours ago",
    type: "upload",
    details: {
      sheets: 8,
      totalPages: 24,
      fileSize: "45.2 MB",
      uploadedBy: "John Mitchell",
    },
  },
  {
    id: 6,
    message: "AI refined 12 curtain wall segments along grid D",
    time: "5 hours ago",
    type: "parsing",
    details: {
      sheet: "A07 - Curtain Wall Elevation",
      elements: { walls: 12, doors: 6, windows: 18 },
      confidence: 89,
      issues: ["Potential duplicate mullion at Axis D4"],
    },
  },
  {
    id: 7,
    message: "Estimate costs re-aligned to 2025 steel index",
    time: "7 hours ago",
    type: "estimate",
    details: {
      phase: "Phase 2 - Structure",
      totalCost: "$2,038,400",
      lineItems: 221,
      pendingReview: 18,
    },
  },
  {
    id: 8,
    message: "Shortlisted 4 steel subs for bid invite",
    time: "9 hours ago",
    type: "matching",
    details: {
      package: "Structural Steel Package",
      recommendations: [
        { name: "IronBridge Fabricators", score: 92, distance: "21.4 mi", capacity: "High" },
        { name: "Keystone Steelworks", score: 90, distance: "26.9 mi", capacity: "Med" },
        { name: "Liberty Beam Co.", score: 88, distance: "34.2 mi", capacity: "Med" },
        { name: "Delaware Valley Steel", score: 86, distance: "41.8 mi", capacity: "Low" },
      ],
    },
  },
  {
    id: 9,
    message: "Zoning review flagged stair pressurization note",
    time: "11 hours ago",
    type: "zoning",
    details: {
      document: "Fire Code Addendum FC-18",
      issue: "Pressurization relief missing on Stair 2",
      requirement: "Provide relief damper per IBC 909.20",
      recommendation: "Coordinate with mechanical for dedicated shaft relief",
    },
  },
  {
    id: 10,
    message: "Existing conditions survey uploaded for level 3",
    time: "Yesterday",
    type: "upload",
    details: {
      sheets: 5,
      totalPages: 12,
      fileSize: "18.6 MB",
      uploadedBy: "Leah Porter",
    },
  },
  {
    id: 11,
    message: "AI reclassified 6 fire-rated doors to 90-minute assemblies",
    time: "Yesterday",
    type: "parsing",
    details: {
      sheet: "A12 - Life Safety Plan",
      elements: { walls: 18, doors: 12, windows: 6 },
      confidence: 91,
      issues: ["Verify hardware for Stair 1 door to meet panic requirements"],
    },
  },
]

const activityFeedPresets: Record<string, ActivityFeedItem[]> = {
  "Riverside Medical Center": activityFeed,
  "Harbor View Office Complex": [
    {
      id: 1,
      message: "AI identified 18 door openings with hardware notes in Sheet A03",
      time: "7 min ago",
      type: "parsing",
      details: {
        sheet: "A03 - Core Plans",
        elements: { walls: 28, doors: 18, windows: 12 },
        confidence: 92,
        issues: ["Door tag D-12 overlaps keynote cloud near Grid B2"],
      },
    },
    {
      id: 2,
      message: "Estimate draft updated for Tenant Fit-Out (Level 5)",
      time: "31 min ago",
      type: "estimate",
      details: { phase: "Tenant Fit-Out - Level 5", totalCost: "$842,190", lineItems: 112, pendingReview: 9 },
    },
    {
      id: 3,
      message: "Shortlisted 3 drywall subs for interiors package",
      time: "1 hour ago",
      type: "matching",
      details: {
        package: "Interiors - Drywall & ACT",
        recommendations: [
          { name: "Coastal Interiors LLC", score: 93, distance: "8.6 mi", capacity: "High" },
          { name: "Bayline Drywall", score: 90, distance: "14.1 mi", capacity: "Med" },
          { name: "Union Finishes Group", score: 87, distance: "22.7 mi", capacity: "Med" },
        ],
      },
    },
    {
      id: 4,
      message: "New drawing set uploaded: Tenant Plan T01-T06",
      time: "2 hours ago",
      type: "upload",
      details: { sheets: 6, totalPages: 18, fileSize: "22.9 MB", uploadedBy: "Maya Brooks" },
    },
    {
      id: 5,
      message: "Zoning review flagged signage variance requirement",
      time: "4 hours ago",
      type: "zoning",
      details: {
        document: "Downtown Overlay District Guidelines",
        issue: "Tenant signage exceeds allowable projection",
        requirement: "Max 18 in projection from facade plane",
        recommendation: "Revise signage details or submit variance package with elevations",
      },
    },
    {
      id: 6,
      message: "AI refined 9 storefront segments along south elevation",
      time: "Yesterday",
      type: "parsing",
      details: {
        sheet: "A08 - Storefront Elevations",
        elements: { walls: 9, doors: 4, windows: 22 },
        confidence: 90,
        issues: ["Confirm mullion spacing at bay 3 matches schedule"],
      },
    },
  ],
  "Westfield Shopping Plaza": [
    {
      id: 1,
      message: "Parking layout flagged for accessible route continuity",
      time: "12 min ago",
      type: "zoning",
      details: {
        document: "Site Plan Review Checklist",
        issue: "Accessible route interrupted at curb return",
        requirement: "Continuous accessible route to primary entrances required",
        recommendation: "Add ramped curb cut and update striping/detail callouts",
      },
    },
    {
      id: 2,
      message: "Estimate draft ready for Sitework & Utilities",
      time: "46 min ago",
      type: "estimate",
      details: { phase: "Sitework & Utilities", totalCost: "$1,112,740", lineItems: 138, pendingReview: 14 },
    },
    {
      id: 3,
      message: "AI identified 33 window openings on facade elevations",
      time: "2 hours ago",
      type: "parsing",
      details: {
        sheet: "A09 - Facade Elevations",
        elements: { walls: 18, doors: 10, windows: 33 },
        confidence: 91,
        issues: ["Potential duplicate opening tag near Grid F7"],
      },
    },
    {
      id: 4,
      message: "5 subcontractors recommended for paving package",
      time: "3 hours ago",
      type: "matching",
      details: {
        package: "Civil - Paving & Striping",
        recommendations: [
          { name: "NorthStar Paving", score: 94, distance: "6.4 mi", capacity: "High" },
          { name: "Summit Asphalt Group", score: 91, distance: "12.9 mi", capacity: "Med" },
          { name: "BlueLine Striping", score: 89, distance: "18.5 mi", capacity: "Med" },
          { name: "TriCounty Pavers", score: 87, distance: "26.1 mi", capacity: "Low" },
          { name: "Metro Surface Works", score: 86, distance: "33.7 mi", capacity: "Low" },
        ],
      },
    },
    {
      id: 5,
      message: "New drawing set uploaded: Civil C01-C07",
      time: "Yesterday",
      type: "upload",
      details: { sheets: 7, totalPages: 21, fileSize: "31.4 MB", uploadedBy: "Ethan Ramirez" },
    },
    {
      id: 6,
      message: "AI refined 22 wall segments for tenant demising partitions",
      time: "Yesterday",
      type: "parsing",
      details: {
        sheet: "A02 - Demising Plans",
        elements: { walls: 22, doors: 8, windows: 6 },
        confidence: 88,
        issues: ["Verify fire rating callouts on partitions adjacent to corridor"],
      },
    },
  ],
  "Downtown Transit Hub": [
    {
      id: 1,
      message: "Zoning review flagged stormwater detention volume shortfall",
      time: "18 min ago",
      type: "zoning",
      details: {
        document: "Stormwater Management Ordinance (SMO-2023)",
        issue: "Detention volume appears undersized for 10-year event",
        requirement: "Provide calculations demonstrating compliance with SMO-2023 Table 4",
        recommendation: "Update hydrology calcs and adjust basin grading/overflow details",
      },
    },
    {
      id: 2,
      message: "AI identified 22 structural elements on concourse framing plan",
      time: "54 min ago",
      type: "parsing",
      details: {
        sheet: "S02 - Concourse Framing",
        elements: { walls: 14, doors: 6, windows: 4 },
        confidence: 89,
        issues: ["Confirm column grid match between S02 and architectural A04"],
      },
    },
    {
      id: 3,
      message: "Estimate draft updated for Foundations & Piers",
      time: "2 hours ago",
      type: "estimate",
      details: { phase: "Foundations & Piers", totalCost: "$2,904,330", lineItems: 205, pendingReview: 21 },
    },
    {
      id: 4,
      message: "3 subcontractors recommended for reinforcing steel package",
      time: "4 hours ago",
      type: "matching",
      details: {
        package: "Concrete - Reinforcing Steel",
        recommendations: [
          { name: "Keystone Rebar", score: 93, distance: "9.2 mi", capacity: "High" },
          { name: "IronWorks Rebar Services", score: 90, distance: "16.8 mi", capacity: "Med" },
          { name: "Atlantic Reinforcement", score: 88, distance: "28.4 mi", capacity: "Med" },
        ],
      },
    },
    {
      id: 5,
      message: "New document uploaded: Geotechnical Report Rev B",
      time: "Yesterday",
      type: "upload",
      details: { sheets: 1, totalPages: 64, fileSize: "9.8 MB", uploadedBy: "Jordan Lee" },
    },
  ],
  "Lakeside Residential Tower": [
    {
      id: 1,
      message: "AI identified 45 plumbing fixtures across typical unit plans",
      time: "9 min ago",
      type: "parsing",
      details: {
        sheet: "P01 - Typical Floor Plumbing",
        elements: { walls: 16, doors: 10, windows: 8 },
        confidence: 90,
        issues: ["Verify stacked wet wall alignment at Unit 10B"],
      },
    },
    {
      id: 2,
      message: "Estimate draft ready for Unit Interiors (Finishes)",
      time: "38 min ago",
      type: "estimate",
      details: { phase: "Unit Interiors - Finishes", totalCost: "$3,118,920", lineItems: 248, pendingReview: 17 },
    },
    {
      id: 3,
      message: "Shortlisted 4 glazing subs for curtain wall package",
      time: "2 hours ago",
      type: "matching",
      details: {
        package: "Facade - Curtain Wall & Glazing",
        recommendations: [
          { name: "Summit Glazing Co.", score: 95, distance: "7.1 mi", capacity: "High" },
          { name: "Harbor Glass & Metal", score: 92, distance: "13.6 mi", capacity: "Med" },
          { name: "Apex Curtainwall Systems", score: 89, distance: "21.8 mi", capacity: "Med" },
          { name: "ClearView Façade Group", score: 87, distance: "29.4 mi", capacity: "Low" },
        ],
      },
    },
    {
      id: 4,
      message: "Zoning review flagged height variance documentation",
      time: "6 hours ago",
      type: "zoning",
      details: {
        document: "Waterfront Height Overlay",
        issue: "Height exceeds base allowance by 8 ft",
        requirement: "Variance request with shadow study required",
        recommendation: "Prepare shadow study and submit variance packet with elevations/renderings",
      },
    },
    {
      id: 5,
      message: "New drawing set uploaded: Facade Elevations A10-A14",
      time: "Yesterday",
      type: "upload",
      details: { sheets: 5, totalPages: 15, fileSize: "27.6 MB", uploadedBy: "Natalie Kim" },
    },
  ],
}

const generateActivityFeed = (projectId: number, projectName: string): ActivityFeedItem[] => {
  const rng = mulberry32(projectId ^ 0x22334455)

  const times = ["5 min ago", "19 min ago", "46 min ago", "1 hour ago", "2 hours ago", "4 hours ago", "Yesterday"]
  const sheets = [
    "A01 - Ground Floor Plan",
    "A02 - Level 2 Plan",
    "A03 - Core Plans",
    "A07 - Curtain Wall Elevation",
    "S01 - Foundation Plan",
    "S02 - Framing Plan",
    "E01 - Lighting Plan",
    "M01 - Mechanical Plan",
    "P01 - Typical Floor Plumbing",
  ]
  const issuesPool = [
    "Ambiguous boundary near Column C5",
    "Potential duplicate wall segment detected",
    "Door tag overlaps keynote cloud near Grid B2",
    "Potential duplicate fixture near Grid D4",
    "Verify fire rating callouts adjacent to corridor",
    "Confirm mullion spacing matches schedule",
  ]
  const uploaders = ["Sarah Chen", "John Mitchell", "Leah Porter", "Maya Brooks", "Ethan Ramirez", "Natalie Kim"]
  const recNames = [
    "Summit Mechanical",
    "ElectroPro Services",
    "Cascade Plumbing",
    "IronBridge Fabricators",
    "Keystone Steelworks",
    "Coastal Interiors LLC",
    "NorthStar Paving",
    "Harbor Glass & Metal",
    "Apex Curtainwall Systems",
    "BlueLine Striping",
  ]
  const packages = [
    "MEP - Mechanical, Electrical, Plumbing",
    "Interiors - Drywall & ACT",
    "Structural Steel Package",
    "Civil - Paving & Striping",
    "Fire Protection Package",
    "Doors, Frames & Hardware",
  ]
  const zoningDocs = [
    "City Planning Ordinance 2024-156",
    "Stormwater Management Ordinance (SMO-2023)",
    "Downtown Overlay District Guidelines",
    "Fire Code Addendum FC-18",
  ]
  const zoningIssues = [
    {
      issue: "ADA compliance - accessible parking count",
      requirement: "Accessible parking must meet ADA 2010 Standards",
      recommendation: "Revise stall count and route details; update striping callouts",
    },
    {
      issue: "Stormwater detention volume shortfall",
      requirement: "Provide calcs demonstrating compliance with SMO-2023 Table 4",
      recommendation: "Update hydrology calcs and adjust basin grading/overflow details",
    },
    {
      issue: "Setback variance documentation needed",
      requirement: "Variance request package with elevations required",
      recommendation: "Prepare variance narrative and include shadow study if applicable",
    },
  ]
  const phases = ["Phase 1 - Foundation", "Phase 2 - Structure", "MEP Rough-in", "Interiors - Finishes", "Sitework & Utilities"]

  const items: ActivityFeedItem[] = []
  let id = projectId % 1000

  const mkParsing = () => {
    const sheet = pick(rng, sheets)
    const walls = randInt(rng, 18, 65)
    const doors = randInt(rng, 6, 24)
    const windows = randInt(rng, 6, 45)
    const confidence = randInt(rng, 84, 96)
    const issueCount = rng() > 0.6 ? 2 : 1
    const issues = Array.from({ length: issueCount }).map(() => pick(rng, issuesPool))
    id += 1
    items.push({
      id,
      message: `AI identified ${walls} wall segments in Sheet ${sheet.split(" ")[0]}`,
      time: pick(rng, times),
      type: "parsing",
      details: {
        sheet,
        elements: { walls, doors, windows },
        confidence,
        issues,
      },
    })
  }

  const mkMatching = () => {
    const pkg = pick(rng, packages)
    const count = randInt(rng, 3, 5)
    const start = randInt(rng, 0, Math.max(0, recNames.length - count))
    const capacities = ["Low", "Med", "High"]
    const baseMiles = 4 + rng() * 18
    const recs = recNames.slice(start, start + count).map((name, idx) => {
      const score = 94 - idx * randInt(rng, 1, 4)
      const miles = (baseMiles + idx * (1.4 + rng() * 6.2)).toFixed(1)
      return { name, score, distance: `${miles} mi`, capacity: pick(rng, capacities) }
    })
    id += 1
    items.push({
      id,
      message: `${count} subcontractors recommended for ${pkg.split(" - ")[0]} package`,
      time: pick(rng, times),
      type: "matching",
      details: { package: pkg, recommendations: recs },
    })
  }

  const mkZoning = () => {
    const doc = pick(rng, zoningDocs)
    const z = pick(rng, zoningIssues)
    id += 1
    items.push({
      id,
      message: `Zoning document flagged ${z.issue}`,
      time: pick(rng, times),
      type: "zoning",
      details: { document: doc, issue: z.issue, requirement: z.requirement, recommendation: z.recommendation },
    })
  }

  const mkEstimate = () => {
    const phase = pick(rng, phases)
    const base = 650_000 + rng() * 3_250_000
    const lineItems = randInt(rng, 95, 265)
    const pending = randInt(rng, 0, 24)
    id += 1
    items.push({
      id,
      message: `Estimate draft ready for ${phase}`,
      time: pick(rng, times),
      type: "estimate",
      details: { phase, totalCost: formatMoney(base), lineItems, pendingReview: pending },
    })
  }

  const mkUpload = () => {
    const sets = ["Architectural A01-A12", "Structural S01-S08", "MEP M01-M04", "Civil C01-C07", "Life Safety A11-A12"]
    const setName = pick(rng, sets)
    const sheetsCount = randInt(rng, 4, 14)
    const pages = sheetsCount * randInt(rng, 2, 4)
    const sizeMb = (12 + rng() * 44).toFixed(1)
    id += 1
    items.push({
      id,
      message: `New drawing set uploaded: ${setName}`,
      time: pick(rng, times),
      type: "upload",
      details: { sheets: sheetsCount, totalPages: pages, fileSize: `${sizeMb} MB`, uploadedBy: pick(rng, uploaders) },
    })
  }

  const sequence = [mkParsing, mkMatching, mkZoning, mkEstimate, mkUpload, mkParsing, mkEstimate, mkMatching]
  for (const fn of sequence) fn()

  if (items[0]) items[0] = { ...items[0], message: `${items[0].message} — ${projectName}` }
  return items
}

const getActivityFeedForProject = (projectName: string, projectId: number) =>
  activityFeedPresets[projectName] ?? generateActivityFeed(projectId, projectName)

export function Dashboard({ selectedProject, setActiveModule, onLogout }: DashboardProps) {
  const projectKey = selectedProject.display_name ?? selectedProject.name
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedKpi, setSelectedKpi] = useState<(typeof kpiData)[0] | null>(null)
  const [filterType, setFilterType] = useState<string | null>(null)
  const [selectedActivity, setSelectedActivity] = useState<ActivityFeedItem | null>(() => {
    const initial = getActivityFeedForProject(projectKey, selectedProject.id)
    return initial[0] ?? null
  })
  const [isRefreshing, setIsRefreshing] = useState(false)
  const [kpis, setKpis] = useState<typeof kpiData>(kpiData)
  const [activities, setActivities] = useState<ActivityFeedItem[]>(() =>
    getActivityFeedForProject(projectKey, selectedProject.id),
  )
  const [projectStatus, setProjectStatus] = useState({ completion: 34, budget: "$4.2M", timeline: "18 mo" })

  const selectedKpiCount = selectedKpi ? Number.parseInt(String(selectedKpi.value), 10) || 0 : 0
  const baseDate = new Date("2025-12-12T16:00:00.000Z")

  useEffect(() => {
    setIsRefreshing(true)
    const t = setTimeout(() => {
      const preset =
        dashboardPresets[projectKey] ??
        generateDashboardPreset(selectedProject.id, selectedProject.display_name ?? selectedProject.name)
      setKpis((prev) =>
        prev.map((kpi) => {
          if (kpi.label === "Drawings Uploaded") return { ...kpi, ...preset.kpis.drawings }
          if (kpi.label === "Estimates in Progress") return { ...kpi, ...preset.kpis.estimates }
          if (kpi.label === "Sub Matches Pending") return { ...kpi, ...preset.kpis.subs }
          if (kpi.label === "Zoning Issues") return { ...kpi, ...preset.kpis.zoning }
          return kpi
        }),
      )
      setProjectStatus(preset.status)
      const nextActivity = getActivityFeedForProject(projectKey, selectedProject.id)
      setActivities(nextActivity)
      setSelectedKpi(null)
      setSelectedActivity(nextActivity[0] ?? null)
      setFilterType(null)
      setSearchQuery("")
      setIsRefreshing(false)
      toast.success("Project loaded", { description: projectKey })
    }, 650)

    return () => clearTimeout(t)
  }, [projectKey, selectedProject.id])

  const activityText = (item: ActivityFeedItem) => {
    const base = `${item.message} ${item.time} ${item.type}`
    if (item.type === "parsing") return `${base} ${item.details.sheet} ${item.details.issues.join(" ")}`
    if (item.type === "matching")
      return `${base} ${item.details.package} ${item.details.recommendations.map((r) => r.name).join(" ")}`
    if (item.type === "zoning")
      return `${base} ${item.details.document} ${item.details.issue} ${item.details.requirement} ${item.details.recommendation}`
    if (item.type === "estimate") return `${base} ${item.details.phase} ${item.details.totalCost}`
    if (item.type === "upload") return `${base} ${item.details.uploadedBy} ${item.details.fileSize}`
    return base
  }

  const filteredActivity = activities.filter((item) => {
    const matchesSearch = activityText(item).toLowerCase().includes(searchQuery.toLowerCase())
    const matchesFilter = !filterType || item.type === filterType
    return matchesSearch && matchesFilter
  })

  const quickActions = [
    {
      id: "new-estimate",
      label: "Start New Estimate",
      keywords: "estimate drawings upload parsing review",
      onClick: () => setActiveModule("estimator" as ModuleType),
      variant: "default" as const,
      icon: Plus,
      className: "w-full justify-start bg-bannett-navy hover:bg-bannett-navy/90",
    },
    {
      id: "upload-zoning",
      label: "Upload Zoning Documents",
      keywords: "zoning review documents upload compliance",
      onClick: () => setActiveModule("zoning" as ModuleType),
      variant: "outline" as const,
      icon: FileUp,
      className: "w-full justify-start bg-transparent",
    },
    {
      id: "review-subs",
      label: "Review Sub Recommendations",
      keywords: "subcontractor matching bid vendors recommendations",
      onClick: () => setActiveModule("subcontractor" as ModuleType),
      variant: "outline" as const,
      icon: Users,
      className: "w-full justify-start bg-transparent",
    },
  ]

  const today = new Date().toLocaleDateString("en-US", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  })

  return (
    <div className="pt-0 pr-0 pb-1 pl-0 space-y-2 h-full flex flex-col min-h-0">
      {/* Header */}
      <div className="flex items-center justify-between px-6">
        <div>
          <h1 className="text-xl md:text-2xl font-semibold text-foreground">Dashboard</h1>
          <p className="text-sm text-muted-foreground">
            {projectKey} • {today}
          </p>
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
                <span className="text-sm font-medium">Estimate draft ready</span>
                <span className="text-xs text-muted-foreground">Phase 1 Foundation awaiting review</span>
              </DropdownMenuItem>
              <DropdownMenuItem className="flex flex-col items-start gap-1">
                <span className="text-sm font-medium">Zoning alert</span>
                <span className="text-xs text-muted-foreground">ADA parking compliance flagged</span>
              </DropdownMenuItem>
              <DropdownMenuItem className="flex flex-col items-start gap-1">
                <span className="text-sm font-medium">3 subs matched</span>
                <span className="text-xs text-muted-foreground">MEP package updated</span>
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
        <CardContent className="space-y-6 p-6 h-full overflow-auto [scrollbar-width:thin] [&::-webkit-scrollbar]:w-0.5 [&::-webkit-scrollbar-track]:bg-transparent [&::-webkit-scrollbar-thumb]:bg-muted [&::-webkit-scrollbar-thumb]:rounded-full">
          {/* KPI Cards */}
	          {isRefreshing ? (
	            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
	              {Array.from({ length: 4 }).map((_, i) => (
	                <Card key={i} className="bg-card">
                  <CardContent className="p-5 space-y-3">
                    <Skeleton className="h-4 w-28" />
                    <Skeleton className="h-10 w-16" />
                    <Skeleton className="h-4 w-24" />
                  </CardContent>
	                </Card>
	              ))}
	            </div>
	          ) : (
	            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
	              {kpis.map((kpi) => (
	                <Card
	                  key={kpi.label}
	                  className="cursor-pointer hover:shadow-md transition-shadow bg-card"
	                  onClick={() => setSelectedKpi(kpi)}
                >
                  <CardContent className="p-5">
                    <div className="flex items-start justify-between">
                      <div>
                        <p className="text-sm text-muted-foreground mb-1">{kpi.label}</p>
                        <p className="text-3xl font-semibold text-card-foreground">{kpi.value}</p>
                        <div className="flex items-center gap-1 mt-2">
                          <TrendingUp className="w-3 h-3 text-success" />
                          <span className="text-xs text-muted-foreground">{kpi.change}</span>
                        </div>
                      </div>
                      <div className={`w-12 h-12 rounded-xl ${kpi.color} flex items-center justify-center`}>
                        <kpi.icon className="w-6 h-6 text-primary-foreground" />
                      </div>
                    </div>
                  </CardContent>
	                </Card>
	              ))}
	            </div>
	          )}

	          {/* Main Content Grid */}
	          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
            {/* Activity Feed */}
            <div className="lg:col-span-2">
              <div className="flex items-center justify-between px-1 pt-1 pb-3">
                <div className="flex items-center gap-2">
                  <CardTitle className="text-2xl font-semibold text-card-foreground">Recent Activity</CardTitle>
                  <Badge variant="secondary">{filteredActivity.length} updates</Badge>
                </div>
                <div className="flex items-center gap-2">
	                  <div className="relative">
	                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
	                    <Input
	                      placeholder="Search activity..."
	                      className="pl-9 w-48 h-9"
	                      value={searchQuery}
	                      onChange={(e) => setSearchQuery(e.target.value)}
	                    />
	                  </div>
	                  <DropdownMenu>
	                    <DropdownMenuTrigger asChild>
	                      <Button variant="outline" size="sm">
	                        <Filter className="w-4 h-4 mr-1" />
	                        Filter
	                      </Button>
	                    </DropdownMenuTrigger>
	                    <DropdownMenuContent align="end" className="w-48">
	                      <DropdownMenuLabel>Filter Activity</DropdownMenuLabel>
	                      <DropdownMenuSeparator />
	                      <DropdownMenuItem onClick={() => setFilterType(null)}>
	                        <div className="flex items-center justify-between w-full">
	                          <span>All activity</span>
	                          {!filterType && <Check className="w-4 h-4" />}
	                        </div>
	                      </DropdownMenuItem>
	                      {(["parsing", "matching", "estimate", "zoning", "upload"] as ActivityFeedItem["type"][]).map(
	                        (type) => (
	                          <DropdownMenuItem key={type} onClick={() => setFilterType(type)}>
	                            <div className="flex items-center justify-between w-full capitalize">
	                              <span>{type}</span>
	                              {filterType === type && <Check className="w-4 h-4" />}
	                            </div>
	                          </DropdownMenuItem>
	                        ),
	                      )}
	                      <DropdownMenuSeparator />
	                      <DropdownMenuItem
	                        onClick={() => {
	                          setFilterType(null)
	                          setSearchQuery("")
	                        }}
	                      >
	                        Clear
	                      </DropdownMenuItem>
	                    </DropdownMenuContent>
	                  </DropdownMenu>
	                </div>
	              </div>
	          {isRefreshing ? (
            <div className="space-y-3 px-1 py-1 max-h-[480px] overflow-hidden pb-2 border-b border-border">
              {Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="flex items-start gap-3 p-3 rounded-lg bg-muted/30">
                  <Skeleton className="h-8 w-8 rounded-full" />
                  <div className="flex-1 space-y-2">
                    <Skeleton className="h-4 w-[85%]" />
                    <Skeleton className="h-3 w-20" />
                  </div>
                  <Skeleton className="h-4 w-4" />
                </div>
              ))}
            </div>
	          ) : (
	            <div className="space-y-3 px-1 py-1 max-h-[480px] overflow-y-hidden hover:overflow-y-auto transition-[overflow] [scrollbar-width:thin] [&::-webkit-scrollbar]:w-0.5 [&::-webkit-scrollbar-track]:bg-transparent [&::-webkit-scrollbar-thumb]:bg-muted [&::-webkit-scrollbar-thumb]:rounded-full pb-2 border-b border-border">
	              {filteredActivity.length === 0 ? (
	                <div className="p-4 rounded-lg bg-muted/30">
	                  <p className="text-sm text-muted-foreground">No activity matches your search/filter.</p>
	                </div>
	              ) : (
	                filteredActivity.map((item) => (
	                  <div key={item.id} className="space-y-2">
	                    <button
	                      type="button"
	                      aria-expanded={selectedActivity?.id === item.id}
	                      aria-controls={`activity-details-${item.id}`}
	                      className="w-full text-left flex items-start gap-3 p-3 rounded-lg cursor-pointer transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-bannett-blue hover:bg-muted/50"
	                      onClick={() => setSelectedActivity((prev) => (prev?.id === item.id ? null : item))}
	                    >
	                      <div className="w-8 h-8 rounded-full bg-bannett-navy/10 flex items-center justify-center flex-shrink-0">
	                        {item.type === "parsing" && <FileText className="w-4 h-4 text-bannett-navy" />}
	                        {item.type === "matching" && <Users className="w-4 h-4 text-bannett-blue" />}
	                        {item.type === "zoning" && <AlertTriangle className="w-4 h-4 text-warning" />}
	                        {item.type === "estimate" && <Calculator className="w-4 h-4 text-bannett-light" />}
	                        {item.type === "upload" && <FileUp className="w-4 h-4 text-success" />}
	                      </div>
	                      <div className="flex-1 min-w-0">
	                        <p className="text-sm text-card-foreground">{item.message}</p>
	                        <div className="flex items-center gap-2 mt-1">
	                          <Clock className="w-3 h-3 text-muted-foreground" />
	                          <span className="text-xs text-muted-foreground">{item.time}</span>
	                        </div>
	                      </div>
	                      {selectedActivity?.id === item.id ? (
	                        <ChevronUp className="w-4 h-4 text-muted-foreground mt-1" />
	                      ) : (
	                        <ChevronDown className="w-4 h-4 text-muted-foreground mt-1" />
	                      )}
			                    </button>
			                    {selectedActivity?.id === item.id && (
			                      <div
			                        id={`activity-details-${item.id}`}
			                        className="w-full box-border p-3 rounded-lg bg-muted/30 border border-border"
			                      >
			                        <div className="text-xs text-muted-foreground mb-3">
			                          {projectKey} • {item.time}
			                        </div>

			                        {item.type === "parsing" && (
			                          <div className="space-y-3 text-sm">
	                            <div className="p-3 rounded-lg bg-muted/50 space-y-1">
	                              <p className="text-[11px] font-medium text-card-foreground">Sheet</p>
	                              <p className="text-sm text-muted-foreground">{item.details.sheet}</p>
	                            </div>
	                            <div className="grid grid-cols-3 gap-2">
	                              <div className="p-3 rounded-lg bg-muted/50 text-center">
	                                <p className="text-lg font-semibold text-bannett-navy">{item.details.elements.walls}</p>
	                                <p className="text-[11px] text-muted-foreground">Walls</p>
	                              </div>
	                              <div className="p-3 rounded-lg bg-muted/50 text-center">
	                                <p className="text-lg font-semibold text-bannett-blue">{item.details.elements.doors}</p>
	                                <p className="text-[11px] text-muted-foreground">Doors</p>
	                              </div>
	                              <div className="p-3 rounded-lg bg-muted/50 text-center">
	                                <p className="text-lg font-semibold text-bannett-light">{item.details.elements.windows}</p>
	                                <p className="text-[11px] text-muted-foreground">Windows</p>
	                              </div>
	                            </div>
	                            <div className="flex items-center justify-between p-3 rounded-lg bg-success/10">
	                              <span className="text-xs text-card-foreground">Confidence</span>
	                              <span className="font-semibold text-success">{item.details.confidence}%</span>
	                            </div>
	                            {item.details.issues.length > 0 && (
	                              <div className="p-3 rounded-lg bg-warning/10 space-y-1">
	                                <p className="text-[11px] font-medium text-warning">Issues</p>
	                                {item.details.issues.map((issue, i) => (
	                                  <p key={i} className="text-xs text-muted-foreground">
	                                    {issue}
	                                  </p>
	                                ))}
	                              </div>
	                            )}
	                          </div>
	                        )}

	                        {item.type === "matching" && (
	                          <div className="space-y-3 text-sm">
	                            <div className="p-3 rounded-lg bg-muted/50">
	                              <p className="text-[11px] font-medium text-card-foreground mb-1">Package</p>
	                              <p className="text-sm text-muted-foreground">{item.details.package}</p>
	                            </div>
	                            <div className="space-y-2">
	                              {item.details.recommendations.map((rec, i) => (
	                                <div
	                                  key={`${rec.name}-${i}`}
	                                  className="flex items-center justify-between p-3 rounded-lg bg-muted/50"
	                                >
	                                  <div className="min-w-0">
	                                    <p className="text-sm font-medium text-card-foreground truncate">{rec.name}</p>
	                                    <p className="text-xs text-muted-foreground">
	                                      {rec.distance} • {rec.capacity} capacity
	                                    </p>
	                                  </div>
	                                  <div className="text-right">
	                                    <p className="text-sm font-semibold text-bannett-blue">{rec.score}%</p>
	                                    <p className="text-[11px] text-muted-foreground">Match</p>
	                                  </div>
	                                </div>
	                              ))}
	                            </div>
	                          </div>
	                        )}

	                        {item.type === "zoning" && (
	                          <div className="space-y-3 text-sm">
	                            <div className="p-3 rounded-lg bg-muted/50">
	                              <p className="text-[11px] font-medium text-card-foreground mb-1">Document</p>
	                              <p className="text-sm text-muted-foreground">{item.details.document}</p>
	                            </div>
	                            <div className="p-3 rounded-lg bg-warning/10 space-y-1">
	                              <p className="text-[11px] font-medium text-warning">Flag</p>
	                              <p className="text-sm font-medium text-warning">{item.details.issue}</p>
	                              <p className="text-xs text-muted-foreground">{item.details.requirement}</p>
	                            </div>
	                            <div className="p-3 rounded-lg bg-muted/50">
	                              <p className="text-[11px] font-medium text-card-foreground">Recommendation</p>
	                              <p className="text-sm text-muted-foreground">{item.details.recommendation}</p>
	                            </div>
	                          </div>
	                        )}

	                        {item.type === "estimate" && (
	                          <div className="space-y-3 text-sm">
	                            <div className="p-3 rounded-lg bg-muted/50 space-y-1">
	                              <p className="text-[11px] font-medium text-card-foreground">Phase</p>
	                              <p className="text-sm text-muted-foreground">{item.details.phase}</p>
	                            </div>
	                            <div className="grid grid-cols-2 gap-2">
	                              <div className="p-3 rounded-lg bg-muted/50">
	                                <p className="text-xs text-muted-foreground">Total</p>
	                                <p className="text-xl font-semibold text-bannett-navy">{item.details.totalCost}</p>
	                              </div>
	                              <div className="p-3 rounded-lg bg-muted/50">
	                                <p className="text-xs text-muted-foreground">Line Items</p>
	                                <p className="text-xl font-semibold text-card-foreground">{item.details.lineItems}</p>
	                              </div>
	                            </div>
	                            <div className="p-3 rounded-lg bg-warning/10">
	                              <p className="text-sm text-card-foreground">{item.details.pendingReview} items pending review</p>
	                            </div>
	                          </div>
	                        )}

			                        {item.type === "upload" && (
			                          <div className="space-y-3 text-sm">
	                            <div className="grid grid-cols-2 gap-2">
	                              <div className="p-3 rounded-lg bg-muted/50">
	                                <p className="text-xs text-muted-foreground">Sheets</p>
	                                <p className="text-xl font-semibold text-card-foreground">{item.details.sheets}</p>
	                              </div>
	                              <div className="p-3 rounded-lg bg-muted/50">
	                                <p className="text-xs text-muted-foreground">File Size</p>
	                                <p className="text-xl font-semibold text-card-foreground">{item.details.fileSize}</p>
	                              </div>
	                            </div>
	                            <div className="p-3 rounded-lg bg-muted/50">
	                              <p className="text-xs text-muted-foreground">Uploaded by</p>
	                              <p className="text-sm font-medium text-card-foreground">{item.details.uploadedBy}</p>
	                            </div>
	                          </div>
			                        )}
		                      </div>
			                    )}
			                  </div>
			                ))
			              )}
	            </div>
	          )}
        </div>

        {/* Quick Actions */}
        <Card className="bg-card flex flex-col">
          <CardHeader className="pb-3">
                <CardTitle className="text-2xl font-semibold text-card-foreground">Quick Actions</CardTitle>
              </CardHeader>
	              <CardContent className="space-y-3">
	                {isRefreshing ? (
	                  <div className="space-y-3">
	                    <Skeleton className="h-10 w-full" />
	                    <Skeleton className="h-10 w-full" />
	                    <Skeleton className="h-10 w-full" />
	                  </div>
	                ) : (
	                  quickActions.map((action) => (
	                    <Button
	                      key={action.id}
	                      className={action.className}
	                      variant={action.variant}
                      onClick={action.onClick}
                    >
	                      <action.icon className="w-4 h-4 mr-2" />
	                      {action.label}
	                    </Button>
	                  ))
	                )}

	                {/* Project Stats */}
	                <div className="pt-4 mt-4 border-t border-border">
	                  <h3 className="text-sm font-medium text-card-foreground mb-3">Project Status</h3>
	                  <div className="space-y-3">
	                    <div className="flex items-center justify-between">
	                      <span className="text-sm text-muted-foreground">Completion</span>
	                      <span className="text-sm font-medium text-card-foreground">{projectStatus.completion}%</span>
	                    </div>
	                    <div className="w-full h-2 bg-muted rounded-full overflow-hidden">
	                      <div
	                        className="h-full bg-bannett-navy rounded-full transition-[width] duration-500"
	                        style={{ width: `${projectStatus.completion}%` }}
	                      />
	                    </div>
	                    <div className="grid grid-cols-2 gap-3 pt-2">
	                      <div className="p-3 rounded-lg bg-muted/50">
	                        <p className="text-xs text-muted-foreground">Est. Budget</p>
	                        <p className="text-lg font-semibold text-card-foreground">{projectStatus.budget}</p>
	                      </div>
	                      <div className="p-3 rounded-lg bg-muted/50">
	                        <p className="text-xs text-muted-foreground">Timeline</p>
	                        <p className="text-lg font-semibold text-card-foreground">{projectStatus.timeline}</p>
	                      </div>
	                    </div>
	                  </div>
	                </div>
	              </CardContent>
	            </Card>
	          </div>
	        </CardContent>
      </Card>

      {/* KPI Detail Sheet */}
      <Sheet open={!!selectedKpi} onOpenChange={() => setSelectedKpi(null)}>
        <SheetContent className="w-[400px] sm:w-[540px]">
          <SheetHeader>
            <SheetTitle className="flex items-center gap-2">
              {selectedKpi && <selectedKpi.icon className="w-5 h-5" />}
              {selectedKpi?.label}
            </SheetTitle>
          </SheetHeader>
          <div className="mt-6 space-y-4">
            {selectedKpi?.label === "Drawings Uploaded" && (
              <>
                {(() => {
                  const rng = mulberry32(selectedProject.id ^ 0x51aa10)
                  const disciplines = [
                    { prefix: "A", type: "Architectural" },
                    { prefix: "S", type: "Structural" },
                    { prefix: "M", type: "Mechanical" },
                    { prefix: "E", type: "Electrical" },
                    { prefix: "P", type: "Plumbing" },
                    { prefix: "C", type: "Civil" },
                  ]
                  const maxParts = selectedKpiCount >= 20 ? 4 : 3
                  const counts = splitTotal(rng, selectedKpiCount, maxParts)
                  const pool = [...disciplines]
                  const picked: Array<(typeof disciplines)[number]> = []
                  while (picked.length < counts.length && pool.length) {
                    picked.push(pool.splice(Math.floor(rng() * pool.length), 1)[0]!)
                  }

                  const details = counts.map((count, idx) => {
                    const d = picked[idx] ?? disciplines[0]!
                    const startMax = Math.max(1, 99 - count + 1)
                    const start = randInt(rng, 1, startMax)
                    const range = sheetRange(d.prefix, start, count)
                    const date = formatDateShort(daysAgo(baseDate, randInt(rng, 0, 6)))
                    return { sheet: `${range} (${count} sheets)`, type: d.type, date }
                  })

                  return details.map((item, i) => (
                    <div key={i} className="p-4 rounded-lg bg-muted/50">
                      <div className="flex items-center justify-between mb-2">
                        <span className="font-medium">{item.sheet}</span>
                        <Badge variant="secondary">{item.type}</Badge>
                      </div>
                      <p className="text-sm text-muted-foreground">Uploaded: {item.date}</p>
                    </div>
                  ))
                })()}
              </>
            )}
            {selectedKpi?.label === "Estimates in Progress" && (
              <>
                {(() => {
                  const rng = mulberry32(selectedProject.id ^ 0x51aa20)
                  const phases = [
                    "Phase 1 - Foundation",
                    "Phase 2 - Structure",
                    "MEP Rough-in",
                    "Interiors - Finishes",
                    "Sitework & Utilities",
                    "Envelope - Curtain Wall",
                    "Fire Protection",
                  ]
                  const pending = Number.parseInt(selectedKpi.change.match(/(\d+)\s+pending review/i)?.[1] ?? "0", 10) || 0
                  const inReviewCount = Math.min(pending, selectedKpiCount)
                  const count = Math.max(1, Math.min(selectedKpiCount, 6))

                  const pool = [...phases]
                  const names: string[] = []
                  while (names.length < count && pool.length) {
                    names.push(pool.splice(Math.floor(rng() * pool.length), 1)[0]!)
                  }

                  const details = names.map((name, idx) => {
                    if (idx < inReviewCount) return { name, status: "In Review", progress: randInt(rng, 78, 95) }
                    const statusPool = ["Drafting", "Parsing", "Cost Coding", "Awaiting Inputs"] as const
                    const status = pick(rng, [...statusPool])
                    const progress =
                      status === "Parsing"
                        ? randInt(rng, 12, 35)
                        : status === "Drafting"
                          ? randInt(rng, 35, 70)
                          : status === "Cost Coding"
                            ? randInt(rng, 55, 85)
                            : randInt(rng, 20, 60)
                    return { name, status, progress }
                  })

                  return details.map((item, i) => (
                    <div key={i} className="p-4 rounded-lg bg-muted/50">
                      <div className="flex items-center justify-between mb-2">
                        <span className="font-medium">{item.name}</span>
                        <Badge variant={item.status === "In Review" ? "default" : "secondary"}>{item.status}</Badge>
                      </div>
                      <div className="w-full h-2 bg-muted rounded-full overflow-hidden">
                        <div
                          className="h-full bg-bannett-navy rounded-full transition-all"
                          style={{ width: `${item.progress}%` }}
                        />
                      </div>
                      <p className="text-xs text-muted-foreground mt-1">{item.progress}% complete</p>
                    </div>
                  ))
                })()}
              </>
            )}
            {selectedKpi?.label === "Sub Matches Pending" && (
              <>
                {(() => {
                  const rng = mulberry32(selectedProject.id ^ 0x51aa30)
                  const trades = [
                    "Electrical",
                    "Plumbing",
                    "HVAC",
                    "Fire Protection",
                    "Drywall",
                    "Concrete",
                    "Steel",
                    "Flooring",
                    "Roofing",
                    "Glazing",
                  ]
                  const counts = splitTotal(rng, selectedKpiCount, 4)
                  const pool = [...trades]
                  const picked: string[] = []
                  while (picked.length < counts.length && pool.length) {
                    picked.push(pool.splice(Math.floor(rng() * pool.length), 1)[0]!)
                  }
                  const details = counts.map((matches, idx) => ({
                    trade: picked[idx] ?? "Trade",
                    matches,
                    topScore: randInt(rng, 84, 97),
                  }))

                  return details.map((item, i) => (
                    <div key={i} className="p-4 rounded-lg bg-muted/50">
                      <div className="flex items-center justify-between mb-2">
                        <span className="font-medium">{item.trade}</span>
                        <span className="text-sm text-bannett-blue font-medium">{item.topScore}% match</span>
                      </div>
                      <p className="text-sm text-muted-foreground">{item.matches} subcontractors matched</p>
                    </div>
                  ))
                })()}
              </>
            )}
            {selectedKpi?.label === "Zoning Issues" && (
              <>
                {selectedKpiCount === 0 ? (
                  <div className="p-4 rounded-lg bg-muted/50">
                    <p className="text-sm text-muted-foreground">No zoning issues detected for this project.</p>
                  </div>
                ) : (
                  (() => {
                    const rng = mulberry32(selectedProject.id ^ 0x51aa40)
                    const issues = [
                      { issue: "ADA compliance - accessible route continuity", section: "4.2.1" },
                      { issue: "Setback variance required - east property line", section: "6.1.3" },
                      { issue: "Stormwater detention calcs require update", section: "8.4.2" },
                      { issue: "Fire code - stair pressurization note", section: "9.09.20" },
                      { issue: "Parking count mismatch in narrative", section: "5.3.1" },
                    ]
                    const pool = [...issues]
                    const details = Array.from({ length: Math.min(selectedKpiCount, pool.length) }).map(() => {
                      const next = pool.splice(Math.floor(rng() * pool.length), 1)[0]!
                      const severity = rng() > 0.66 ? "High" : rng() > 0.33 ? "Medium" : "Low"
                      return { ...next, severity }
                    })

                    return details.map((item, i) => (
                      <div key={i} className="p-4 rounded-lg bg-muted/50">
                        <div className="flex items-center justify-between mb-2">
                          <span className="font-medium">{item.issue}</span>
                          <Badge variant={item.severity === "High" ? "destructive" : "secondary"}>{item.severity}</Badge>
                        </div>
                        <p className="text-sm text-muted-foreground">Section: {item.section}</p>
                      </div>
                    ))
                  })()
                )}
              </>
            )}
          </div>
        </SheetContent>
      </Sheet>

      {/* Activity Detail Modal (replaced by inline expansion)
      <Dialog
        open={!!selectedActivity}
        onOpenChange={(open) => {
          if (!open) setSelectedActivity(null)
        }}
      >
        <DialogContent className="sm:max-w-2xl max-h-[80vh] overflow-y-auto">
          {selectedActivity && (
            <>
              <DialogHeader>
                <DialogTitle className="flex items-center gap-2">
                  {selectedActivity.type === "parsing" && <FileText className="w-5 h-5 text-bannett-navy" />}
                  {selectedActivity.type === "matching" && <Users className="w-5 h-5 text-bannett-blue" />}
                  {selectedActivity.type === "zoning" && <AlertTriangle className="w-5 h-5 text-warning" />}
                  {selectedActivity.type === "estimate" && <Calculator className="w-5 h-5 text-bannett-light" />}
                  {selectedActivity.type === "upload" && <FileUp className="w-5 h-5 text-success" />}
                  <span className="text-card-foreground">{selectedActivity.message}</span>
                </DialogTitle>
                <p className="text-sm text-muted-foreground">
                  {projectKey} • {selectedActivity.time}
                </p>
              </DialogHeader>

              <div className="space-y-4 py-2 text-sm">
                {selectedActivity.type === "parsing" && (
                  <>
                    <div className="p-3 rounded-lg bg-muted/50 space-y-2">
                      <p className="text-xs font-medium text-card-foreground">Sheet</p>
                      <p className="text-sm text-muted-foreground">{selectedActivity.details.sheet}</p>
                    </div>
                    <div className="grid grid-cols-3 gap-2">
                      <div className="p-3 rounded-lg bg-muted/50 text-center">
                        <p className="text-lg font-semibold text-bannett-navy">{selectedActivity.details.elements.walls}</p>
                        <p className="text-[11px] text-muted-foreground">Walls</p>
                      </div>
                      <div className="p-3 rounded-lg bg-muted/50 text-center">
                        <p className="text-lg font-semibold text-bannett-blue">{selectedActivity.details.elements.doors}</p>
                        <p className="text-[11px] text-muted-foreground">Doors</p>
                      </div>
                      <div className="p-3 rounded-lg bg-muted/50 text-center">
                        <p className="text-lg font-semibold text-bannett-light">
                          {selectedActivity.details.elements.windows}
                        </p>
                        <p className="text-[11px] text-muted-foreground">Windows</p>
                      </div>
                    </div>
                    <div className="flex items-center justify-between p-3 rounded-lg bg-success/10">
                      <span className="text-xs text-card-foreground">Confidence</span>
                      <span className="font-semibold text-success">{selectedActivity.details.confidence}%</span>
                    </div>
                    {selectedActivity.details.issues.length > 0 && (
                      <div className="p-3 rounded-lg bg-warning/10 space-y-1">
                        <p className="text-xs font-medium text-warning">Issues</p>
                        {selectedActivity.details.issues.map((issue, i) => (
                          <p key={i} className="text-xs text-muted-foreground">
                            {issue}
                          </p>
                        ))}
                      </div>
                    )}
                  </>
                )}

                {selectedActivity.type === "matching" && (
                  <>
                    <div className="p-3 rounded-lg bg-muted/50">
                      <p className="text-xs font-medium text-card-foreground mb-1">Package</p>
                      <p className="text-sm text-muted-foreground">{selectedActivity.details.package}</p>
                    </div>
                    <div className="space-y-2">
                      {selectedActivity.details.recommendations.map((rec, i) => (
                        <div
                          key={`${rec.name}-${i}`}
                          className="flex items-center justify-between p-3 rounded-lg bg-muted/50"
                        >
                          <span className="text-sm font-medium text-card-foreground">{rec.name}</span>
                          <Badge className="bg-bannett-navy text-[11px] px-2 py-0">{rec.score}% match</Badge>
                        </div>
                      ))}
                    </div>
                  </>
                )}

                {selectedActivity.type === "zoning" && (
                  <>
                    <div className="p-3 rounded-lg bg-muted/50 space-y-1">
                      <p className="text-xs font-medium text-card-foreground">Document</p>
                      <p className="text-sm text-muted-foreground">{selectedActivity.details.document}</p>
                    </div>
                    <div className="p-3 rounded-lg bg-warning/10 space-y-1">
                      <p className="text-sm font-medium text-warning">{selectedActivity.details.issue}</p>
                      <p className="text-xs text-muted-foreground">{selectedActivity.details.requirement}</p>
                    </div>
                    <div className="p-3 rounded-lg bg-muted/50">
                      <p className="text-sm font-medium mb-1 text-card-foreground">Recommendation</p>
                      <p className="text-sm text-muted-foreground">{selectedActivity.details.recommendation}</p>
                    </div>
                  </>
                )}

                {selectedActivity.type === "estimate" && (
                  <>
                    <div className="p-3 rounded-lg bg-muted/50 space-y-1">
                      <p className="text-xs font-medium text-card-foreground">Phase</p>
                      <p className="text-sm text-muted-foreground">{selectedActivity.details.phase}</p>
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      <div className="p-3 rounded-lg bg-muted/50">
                        <p className="text-xs text-muted-foreground">Total</p>
                        <p className="text-xl font-semibold text-bannett-navy">{selectedActivity.details.totalCost}</p>
                      </div>
                      <div className="p-3 rounded-lg bg-muted/50">
                        <p className="text-xs text-muted-foreground">Line Items</p>
                        <p className="text-xl font-semibold text-card-foreground">{selectedActivity.details.lineItems}</p>
                      </div>
                    </div>
                    <div className="p-3 rounded-lg bg-warning/10">
                      <p className="text-sm text-card-foreground">
                        {selectedActivity.details.pendingReview} items pending review
                      </p>
                    </div>
                  </>
                )}

                {selectedActivity.type === "upload" && (
                  <>
                    <div className="grid grid-cols-2 gap-2">
                      <div className="p-3 rounded-lg bg-muted/50">
                        <p className="text-xs text-muted-foreground">Sheets</p>
                        <p className="text-xl font-semibold text-card-foreground">{selectedActivity.details.sheets}</p>
                      </div>
                      <div className="p-3 rounded-lg bg-muted/50">
                        <p className="text-xs text-muted-foreground">File Size</p>
                        <p className="text-xl font-semibold text-card-foreground">{selectedActivity.details.fileSize}</p>
                      </div>
                    </div>
                    <div className="p-3 rounded-lg bg-muted/50">
                      <p className="text-xs text-muted-foreground">Uploaded by</p>
                      <p className="text-sm font-medium text-card-foreground">{selectedActivity.details.uploadedBy}</p>
                    </div>
                  </>
                )}
              </div>

              <DialogFooter className="gap-2">
                <Button variant="outline" onClick={() => setSelectedActivity(null)}>
                  Close
                </Button>
                {selectedActivity.type === "matching" && (
                  <Button
                    className="bg-bannett-navy hover:bg-bannett-navy/90"
                    onClick={() => {
                      setSelectedActivity(null)
                      setActiveModule("subcontractor")
                    }}
                  >
                    Open Sub Matching
                  </Button>
                )}
                {(selectedActivity.type === "parsing" || selectedActivity.type === "estimate" || selectedActivity.type === "upload") && (
                  <Button
                    className="bg-bannett-navy hover:bg-bannett-navy/90"
                    onClick={() => {
                      setSelectedActivity(null)
                      setActiveModule("estimator")
                    }}
                  >
                    Open AI Estimator
                  </Button>
                )}
                {selectedActivity.type === "zoning" && (
                  <Button
                    className="bg-bannett-navy hover:bg-bannett-navy/90"
                    onClick={() => {
                      setSelectedActivity(null)
                      setActiveModule("zoning")
                    }}
                  >
                    Open Zoning Review
                  </Button>
                )}
              </DialogFooter>
            </>
          )}
        </DialogContent>
      </Dialog>
      */}

    </div>
  )
}
