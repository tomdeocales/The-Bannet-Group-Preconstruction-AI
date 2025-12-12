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

interface DashboardProps {
  selectedProject: string
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
      details: { package: string; recommendations: { name: string; score: number }[] }
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
        { name: "Summit Mechanical", score: 94 },
        { name: "ElectroPro Services", score: 91 },
        { name: "Cascade Plumbing", score: 88 },
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
        { name: "IronBridge Fabricators", score: 92 },
        { name: "Keystone Steelworks", score: 90 },
        { name: "Liberty Beam Co.", score: 88 },
        { name: "Delaware Valley Steel", score: 86 },
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
          { name: "Coastal Interiors LLC", score: 93 },
          { name: "Bayline Drywall", score: 90 },
          { name: "Union Finishes Group", score: 87 },
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
          { name: "NorthStar Paving", score: 94 },
          { name: "Summit Asphalt Group", score: 91 },
          { name: "BlueLine Striping", score: 89 },
          { name: "TriCounty Pavers", score: 87 },
          { name: "Metro Surface Works", score: 86 },
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
          { name: "Keystone Rebar", score: 93 },
          { name: "IronWorks Rebar Services", score: 90 },
          { name: "Atlantic Reinforcement", score: 88 },
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
          { name: "Summit Glazing Co.", score: 95 },
          { name: "Harbor Glass & Metal", score: 92 },
          { name: "Apex Curtainwall Systems", score: 89 },
          { name: "ClearView Façade Group", score: 87 },
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

const getActivityFeedForProject = (project: string) => activityFeedPresets[project] ?? activityFeed

export function Dashboard({ selectedProject, setActiveModule, onLogout }: DashboardProps) {
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedKpi, setSelectedKpi] = useState<(typeof kpiData)[0] | null>(null)
  const [filterType, setFilterType] = useState<string | null>(null)
  const [selectedActivity, setSelectedActivity] = useState<ActivityFeedItem | null>(() => {
    const feed = getActivityFeedForProject(selectedProject)
    return feed[0] ?? null
  })
  const [isRefreshing, setIsRefreshing] = useState(false)
  const [kpis, setKpis] = useState<typeof kpiData>(kpiData)
  const [activities, setActivities] = useState<ActivityFeedItem[]>(() => getActivityFeedForProject(selectedProject))
  const [projectStatus, setProjectStatus] = useState({ completion: 34, budget: "$4.2M", timeline: "18 mo" })

  useEffect(() => {
    setIsRefreshing(true)
    const t = setTimeout(() => {
      const preset = dashboardPresets[selectedProject] ?? dashboardPresets["Riverside Medical Center"]
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
      const nextActivity = getActivityFeedForProject(selectedProject)
      setActivities(nextActivity)
      setSelectedKpi(null)
      setSelectedActivity(nextActivity[0] ?? null)
      setFilterType(null)
      setSearchQuery("")
      setIsRefreshing(false)
      toast.success("Project loaded", { description: selectedProject })
    }, 650)

    return () => clearTimeout(t)
  }, [selectedProject])

  const filteredActivity = activities.filter((item) => {
    const matchesSearch = item.message.toLowerCase().includes(searchQuery.toLowerCase())
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
            {selectedProject} • {today}
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
	                  <Button variant="outline" size="sm" onClick={() => {}}>
	                    <Filter className="w-4 h-4 mr-1" />
	                    Filter
	                  </Button>
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
	                      className={`w-full text-left flex items-start gap-3 p-3 rounded-lg cursor-pointer transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-bannett-blue ${
	                        selectedActivity?.id === item.id ? "bg-muted/50" : "hover:bg-muted/50"
	                      }`}
	                      onClick={() => setSelectedActivity(item.id === selectedActivity?.id ? null : item)}
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
	                      <div className="mt-1 rounded-md bg-muted/40 px-3 py-3 space-y-3 text-sm">
	                        {item.type === "parsing" && (
	                          <>
	                            <div className="p-2 rounded-lg bg-muted/60">
	                              <p className="text-xs font-medium mb-1 text-card-foreground">Sheet Information</p>
	                              <p className="text-xs text-muted-foreground">{item.details.sheet}</p>
	                            </div>
	                            <div className="grid grid-cols-3 gap-2">
	                              <div className="p-2 rounded-lg bg-muted/60 text-center">
	                                <p className="text-lg font-semibold text-bannett-navy">{item.details.elements.walls}</p>
	                                <p className="text-[11px] text-muted-foreground">Walls</p>
	                              </div>
	                              <div className="p-2 rounded-lg bg-muted/60 text-center">
	                                <p className="text-lg font-semibold text-bannett-blue">{item.details.elements.doors}</p>
	                                <p className="text-[11px] text-muted-foreground">Doors</p>
	                              </div>
	                              <div className="p-2 rounded-lg bg-muted/60 text-center">
	                                <p className="text-lg font-semibold text-bannett-light">
	                                  {item.details.elements.windows}
	                                </p>
	                                <p className="text-[11px] text-muted-foreground">Windows</p>
	                              </div>
	                            </div>
	                            <div className="flex items-center justify-between p-2 rounded-lg bg-success/10">
	                              <span className="text-xs text-card-foreground">Confidence Score</span>
	                              <span className="font-semibold text-success">{item.details.confidence}%</span>
	                            </div>
	                            {item.details.issues.length > 0 && (
	                              <div className="p-2 rounded-lg bg-warning/10 space-y-1">
	                                <p className="text-xs font-medium text-warning">Issues Detected</p>
	                                {item.details.issues.map((issue, i) => (
	                                  <p key={i} className="text-xs text-muted-foreground">
	                                    {issue}
	                                  </p>
	                                ))}
	                              </div>
	                            )}
	                          </>
	                        )}

	                        {item.type === "matching" && (
	                          <>
	                            <p className="text-xs text-muted-foreground">{item.details.package}</p>
	                            <div className="space-y-1.5">
	                              {item.details.recommendations.map((rec, i) => (
	                                <div
	                                  key={`${rec.name}-${i}`}
	                                  className="flex items-center justify-between p-2 rounded-lg bg-muted/60"
	                                >
	                                  <span className="text-sm font-medium text-card-foreground">{rec.name}</span>
	                                  <Badge className="bg-bannett-navy text-[11px] px-2 py-0">{rec.score}% match</Badge>
	                                </div>
	                              ))}
	                            </div>
	                          </>
	                        )}

	                        {item.type === "zoning" && (
	                          <>
	                            <div className="p-3 rounded-lg bg-warning/10">
	                              <p className="text-sm font-medium text-warning">{item.details.issue}</p>
	                              <p className="text-xs text-muted-foreground mt-1">{item.details.requirement}</p>
	                            </div>
	                            <div className="p-3 rounded-lg bg-muted/60">
	                              <p className="text-sm font-medium mb-1 text-card-foreground">Recommendation</p>
	                              <p className="text-xs text-muted-foreground">{item.details.recommendation}</p>
	                            </div>
	                          </>
	                        )}

	                        {item.type === "estimate" && (
	                          <>
	                            <div className="grid grid-cols-2 gap-2">
	                              <div className="p-3 rounded-lg bg-muted/60">
	                                <p className="text-xs text-muted-foreground">Total Cost</p>
	                                <p className="text-xl font-semibold text-bannett-navy">{item.details.totalCost}</p>
	                              </div>
	                              <div className="p-3 rounded-lg bg-muted/60">
	                                <p className="text-xs text-muted-foreground">Line Items</p>
	                                <p className="text-xl font-semibold text-card-foreground">{item.details.lineItems}</p>
	                              </div>
	                            </div>
	                            <div className="p-2 rounded-lg bg-warning/10">
	                              <p className="text-xs text-card-foreground">
	                                {item.details.pendingReview} items pending review
	                              </p>
	                            </div>
	                          </>
	                        )}

	                        {item.type === "upload" && (
	                          <>
	                            <div className="grid grid-cols-2 gap-2">
	                              <div className="p-3 rounded-lg bg-muted/60">
	                                <p className="text-xs text-muted-foreground">Sheets</p>
	                                <p className="text-xl font-semibold text-card-foreground">{item.details.sheets}</p>
	                              </div>
	                              <div className="p-3 rounded-lg bg-muted/60">
	                                <p className="text-xs text-muted-foreground">File Size</p>
	                                <p className="text-xl font-semibold text-card-foreground">{item.details.fileSize}</p>
	                              </div>
	                            </div>
	                            <p className="text-xs text-muted-foreground">Uploaded by {item.details.uploadedBy}</p>
	                          </>
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
                {selectedKpi.details.map((item: any, i: number) => (
                  <div key={i} className="p-4 rounded-lg bg-muted/50">
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-medium">{item.sheet}</span>
                      <Badge variant="secondary">{item.type}</Badge>
                    </div>
                    <p className="text-sm text-muted-foreground">Uploaded: {item.date}</p>
                  </div>
                ))}
              </>
            )}
            {selectedKpi?.label === "Estimates in Progress" && (
              <>
                {selectedKpi.details.map((item: any, i: number) => (
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
                ))}
              </>
            )}
            {selectedKpi?.label === "Sub Matches Pending" && (
              <>
                {selectedKpi.details.map((item: any, i: number) => (
                  <div key={i} className="p-4 rounded-lg bg-muted/50">
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-medium">{item.trade}</span>
                      <span className="text-sm text-bannett-blue font-medium">{item.topScore}% match</span>
                    </div>
                    <p className="text-sm text-muted-foreground">{item.matches} subcontractors matched</p>
                  </div>
                ))}
              </>
            )}
            {selectedKpi?.label === "Zoning Issues" && (
              <>
                {selectedKpi.details.map((item: any, i: number) => (
                  <div key={i} className="p-4 rounded-lg bg-muted/50">
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-medium">{item.issue}</span>
                      <Badge variant={item.severity === "High" ? "destructive" : "secondary"}>{item.severity}</Badge>
                    </div>
                    <p className="text-sm text-muted-foreground">Section: {item.section}</p>
                  </div>
                ))}
              </>
            )}
          </div>
        </SheetContent>
      </Sheet>

    </div>
  )
}
