"use client"

import { useState } from "react"
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
  ChevronRight,
  Bell,
  User,
} from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet"
import type { ModuleType } from "@/app/page"

interface DashboardProps {
  selectedProject: string
  setActiveModule: (module: ModuleType) => void
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

const activityFeed = [
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

export function Dashboard({ selectedProject, setActiveModule }: DashboardProps) {
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedKpi, setSelectedKpi] = useState<(typeof kpiData)[0] | null>(null)
  const [selectedActivity, setSelectedActivity] = useState<(typeof activityFeed)[0] | null>(null)
  const [filterType, setFilterType] = useState<string | null>(null)

  const filteredActivity = activityFeed.filter((item) => {
    const matchesSearch = item.message.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesFilter = !filterType || item.type === filterType
    return matchesSearch && matchesFilter
  })

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
          <h1 className="text-2xl font-semibold text-foreground">Dashboard</h1>
          <p className="text-sm text-muted-foreground">{today}</p>
        </div>
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="icon" className="relative">
            <Bell className="w-5 h-5" />
            <span className="absolute top-1 right-1 w-2 h-2 bg-destructive rounded-full" />
          </Button>
          <div className="flex items-center gap-2 pl-3 border-l border-border">
            <div className="w-9 h-9 rounded-full bg-bannett-navy flex items-center justify-center">
              <User className="w-5 h-5 text-primary-foreground" />
            </div>
            <div className="text-right">
              <p className="text-sm font-medium text-foreground">Sarah Chen</p>
              <p className="text-xs text-muted-foreground">Project Manager</p>
            </div>
          </div>
        </div>
      </div>

      <Card className="shadow-sm flex-1 min-h-0">
        <CardContent className="space-y-6 p-6 h-full overflow-auto [scrollbar-width:thin] [&::-webkit-scrollbar]:w-0.5 [&::-webkit-scrollbar-track]:bg-transparent [&::-webkit-scrollbar-thumb]:bg-muted [&::-webkit-scrollbar-thumb]:rounded-full">
          {/* KPI Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {kpiData.map((kpi) => (
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

          {/* Main Content Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
            {/* Activity Feed */}
            <div className="lg:col-span-2">
              <div className="flex items-center justify-between px-1 pt-1 pb-3">
                <div className="flex items-center gap-2">
                  <CardTitle className="text-lg text-card-foreground">Recent Activity</CardTitle>
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
                  <Button variant="outline" size="sm" onClick={() => setFilterType(filterType ? null : "parsing")}>
                    <Filter className="w-4 h-4 mr-1" />
                    Filter
                  </Button>
                </div>
              </div>
              <div className="space-y-3 px-1 py-1 max-h-[480px] overflow-y-hidden hover:overflow-y-auto transition-[overflow] [scrollbar-width:thin] [&::-webkit-scrollbar]:w-0.5 [&::-webkit-scrollbar-track]:bg-transparent [&::-webkit-scrollbar-thumb]:bg-muted [&::-webkit-scrollbar-thumb]:rounded-full">
                {filteredActivity.map((item) => (
                  <div
                    key={item.id}
                    className="flex items-start gap-3 p-3 rounded-lg hover:bg-muted/50 cursor-pointer transition-colors"
                    onClick={() => setSelectedActivity(item)}
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
                    <ChevronRight className="w-4 h-4 text-muted-foreground" />
                  </div>
                ))}
              </div>
              <div className="h-px bg-black/15 mt-2" />
            </div>

            {/* Quick Actions */}
            <Card className="bg-card flex flex-col">
              <CardHeader className="pb-3">
                <CardTitle className="text-lg text-card-foreground">Quick Actions</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <Button
                  className="w-full justify-start bg-bannett-navy hover:bg-bannett-navy/90"
                  onClick={() => setActiveModule("estimator")}
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Start New Estimate
                </Button>
                <Button
                  variant="outline"
                  className="w-full justify-start bg-transparent"
                  onClick={() => setActiveModule("zoning")}
                >
                  <FileUp className="w-4 h-4 mr-2" />
                  Upload Zoning Documents
                </Button>
                <Button
                  variant="outline"
                  className="w-full justify-start bg-transparent"
                  onClick={() => setActiveModule("subcontractor")}
                >
                  <Users className="w-4 h-4 mr-2" />
                  Review Sub Recommendations
                </Button>

                {/* Project Stats */}
                <div className="pt-4 mt-4 border-t border-border">
                  <h3 className="text-sm font-medium text-card-foreground mb-3">Project Status</h3>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-muted-foreground">Completion</span>
                      <span className="text-sm font-medium text-card-foreground">34%</span>
                    </div>
                    <div className="w-full h-2 bg-muted rounded-full overflow-hidden">
                      <div className="h-full w-[34%] bg-bannett-navy rounded-full" />
                    </div>
                    <div className="grid grid-cols-2 gap-3 pt-2">
                      <div className="p-3 rounded-lg bg-muted/50">
                        <p className="text-xs text-muted-foreground">Est. Budget</p>
                        <p className="text-lg font-semibold text-card-foreground">$4.2M</p>
                      </div>
                      <div className="p-3 rounded-lg bg-muted/50">
                        <p className="text-xs text-muted-foreground">Timeline</p>
                        <p className="text-lg font-semibold text-card-foreground">18 mo</p>
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

      {/* Activity Detail Modal */}
      <Dialog open={!!selectedActivity} onOpenChange={() => setSelectedActivity(null)}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>{selectedActivity?.message}</DialogTitle>
          </DialogHeader>
          <div className="mt-4 space-y-4">
            {selectedActivity?.type === "parsing" && (
              <>
                <div className="p-4 rounded-lg bg-muted/50">
                  <p className="text-sm font-medium mb-2">Sheet Information</p>
                  <p className="text-sm text-muted-foreground">{selectedActivity.details.sheet}</p>
                </div>
                <div className="grid grid-cols-3 gap-3">
                  <div className="p-3 rounded-lg bg-muted/50 text-center">
                    <p className="text-2xl font-semibold text-bannett-navy">
                      {selectedActivity.details.elements.walls}
                    </p>
                    <p className="text-xs text-muted-foreground">Walls</p>
                  </div>
                  <div className="p-3 rounded-lg bg-muted/50 text-center">
                    <p className="text-2xl font-semibold text-bannett-blue">
                      {selectedActivity.details.elements.doors}
                    </p>
                    <p className="text-xs text-muted-foreground">Doors</p>
                  </div>
                  <div className="p-3 rounded-lg bg-muted/50 text-center">
                    <p className="text-2xl font-semibold text-bannett-light">
                      {selectedActivity.details.elements.windows}
                    </p>
                    <p className="text-xs text-muted-foreground">Windows</p>
                  </div>
                </div>
                <div className="flex items-center justify-between p-3 rounded-lg bg-success/10">
                  <span className="text-sm">Confidence Score</span>
                  <span className="font-semibold text-success">{selectedActivity.details.confidence}%</span>
                </div>
                {selectedActivity.details.issues.length > 0 && (
                  <div className="p-3 rounded-lg bg-warning/10">
                    <p className="text-sm font-medium text-warning mb-1">Issues Detected</p>
                    {selectedActivity.details.issues.map((issue: string, i: number) => (
                      <p key={i} className="text-sm text-muted-foreground">
                        {issue}
                      </p>
                    ))}
                  </div>
                )}
              </>
            )}
            {selectedActivity?.type === "matching" && (
              <>
                <p className="text-sm text-muted-foreground">{selectedActivity.details.package}</p>
                <div className="space-y-2">
                  {selectedActivity.details.recommendations.map((rec: any, i: number) => (
                    <div key={i} className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
                      <span className="font-medium">{rec.name}</span>
                      <Badge className="bg-bannett-navy">{rec.score}% match</Badge>
                    </div>
                  ))}
                </div>
              </>
            )}
            {selectedActivity?.type === "zoning" && (
              <>
                <div className="p-4 rounded-lg bg-warning/10">
                  <p className="text-sm font-medium text-warning mb-2">{selectedActivity.details.issue}</p>
                  <p className="text-sm text-muted-foreground">{selectedActivity.details.requirement}</p>
                </div>
                <div className="p-4 rounded-lg bg-muted/50">
                  <p className="text-sm font-medium mb-1">Recommendation</p>
                  <p className="text-sm text-muted-foreground">{selectedActivity.details.recommendation}</p>
                </div>
              </>
            )}
            {selectedActivity?.type === "estimate" && (
              <>
                <div className="grid grid-cols-2 gap-3">
                  <div className="p-4 rounded-lg bg-muted/50">
                    <p className="text-xs text-muted-foreground">Total Cost</p>
                    <p className="text-xl font-semibold text-bannett-navy">{selectedActivity.details.totalCost}</p>
                  </div>
                  <div className="p-4 rounded-lg bg-muted/50">
                    <p className="text-xs text-muted-foreground">Line Items</p>
                    <p className="text-xl font-semibold">{selectedActivity.details.lineItems}</p>
                  </div>
                </div>
                <div className="p-3 rounded-lg bg-warning/10">
                  <p className="text-sm">{selectedActivity.details.pendingReview} items pending review</p>
                </div>
              </>
            )}
            {selectedActivity?.type === "upload" && (
              <>
                <div className="grid grid-cols-2 gap-3">
                  <div className="p-4 rounded-lg bg-muted/50">
                    <p className="text-xs text-muted-foreground">Sheets</p>
                    <p className="text-xl font-semibold">{selectedActivity.details.sheets}</p>
                  </div>
                  <div className="p-4 rounded-lg bg-muted/50">
                    <p className="text-xs text-muted-foreground">File Size</p>
                    <p className="text-xl font-semibold">{selectedActivity.details.fileSize}</p>
                  </div>
                </div>
                <p className="text-sm text-muted-foreground">Uploaded by {selectedActivity.details.uploadedBy}</p>
              </>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
