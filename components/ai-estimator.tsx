"use client"

import React, { useState, useCallback } from "react"
import {
  Upload,
  FileText,
  Check,
  AlertCircle,
  ChevronRight,
  ChevronDown,
  ChevronUp,
  Eye,
  Trash2,
  GripVertical,
  ZoomIn,
  ZoomOut,
  Layers,
  Plus,
  Edit3,
  MessageSquare,
  Split,
  Save,
  ArrowRight,
  Loader2,
  Bell,
  User,
} from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Checkbox } from "@/components/ui/checkbox"
import { Progress } from "@/components/ui/progress"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Textarea } from "@/components/ui/textarea"
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

interface AIEstimatorProps {
  selectedProject: string
  onLogout?: () => void
  setActiveModule?: (module: ModuleType) => void
}

type Step = 1 | 2 | 3 | 4

const mockSheets = [
  { id: "A01", name: "Ground Floor Plan", pages: 2, size: "4.2 MB" },
  { id: "A02", name: "Second Floor Plan", pages: 2, size: "3.8 MB" },
  { id: "A03", name: "Third Floor Plan", pages: 2, size: "3.9 MB" },
  { id: "A04", name: "Roof Plan", pages: 1, size: "2.1 MB" },
  { id: "A05", name: "Building Sections", pages: 4, size: "5.6 MB" },
  { id: "A06", name: "Wall Sections", pages: 6, size: "7.2 MB" },
  { id: "S01", name: "Foundation Plan", pages: 2, size: "4.5 MB" },
  { id: "S02", name: "Framing Plan", pages: 3, size: "5.1 MB" },
  { id: "M01", name: "Mechanical Plan", pages: 2, size: "3.4 MB" },
  { id: "E01", name: "Electrical Plan", pages: 2, size: "3.2 MB" },
  { id: "P01", name: "Plumbing Plan", pages: 2, size: "3.0 MB" },
  { id: "P02", name: "Plumbing Risers", pages: 1, size: "1.8 MB" },
]

const parsedCategories = [
  { name: "Walls", count: 42, icon: "🧱" },
  { name: "Doors", count: 18, icon: "🚪" },
  { name: "Windows", count: 33, icon: "🪟" },
  { name: "Electrical Fixtures", count: 128, icon: "💡" },
  { name: "Structural Elements", count: 22, icon: "🏗️" },
  { name: "Plumbing Fixtures", count: 45, icon: "🚰" },
  { name: "HVAC Equipment", count: 16, icon: "❄️" },
]

const estimateData = [
  {
    category: "03 - Concrete",
    expanded: true,
    items: [
      {
        id: 1,
        description: "Cast-in-place concrete foundations",
        quantity: 1250,
        unit: "CY",
        unitCost: 185,
        total: 231250,
      },
      { id: 2, description: "Reinforcing steel, Grade 60", quantity: 45000, unit: "LB", unitCost: 1.25, total: 56250 },
      { id: 3, description: 'Concrete slab on grade, 6"', quantity: 12500, unit: "SF", unitCost: 8.5, total: 106250 },
    ],
  },
  {
    category: "05 - Metals",
    expanded: false,
    items: [
      { id: 4, description: "Structural steel framing", quantity: 180, unit: "TON", unitCost: 4200, total: 756000 },
      { id: 5, description: 'Steel deck, 3" composite', quantity: 24000, unit: "SF", unitCost: 6.75, total: 162000 },
      { id: 6, description: "Misc. metals and supports", quantity: 1, unit: "LS", unitCost: 85000, total: 85000 },
    ],
  },
  {
    category: "08 - Openings",
    expanded: false,
    items: [
      { id: 7, description: "Hollow metal doors and frames", quantity: 18, unit: "EA", unitCost: 1850, total: 33300 },
      { id: 8, description: "Aluminum storefront system", quantity: 450, unit: "SF", unitCost: 125, total: 56250 },
      { id: 9, description: "Curtain wall system", quantity: 2400, unit: "SF", unitCost: 185, total: 444000 },
    ],
  },
  {
    category: "26 - Electrical",
    expanded: false,
    items: [
      { id: 10, description: "Electrical service, 2000A", quantity: 1, unit: "LS", unitCost: 125000, total: 125000 },
      { id: 11, description: "Branch wiring and devices", quantity: 1, unit: "LS", unitCost: 285000, total: 285000 },
      { id: 12, description: "Lighting fixtures", quantity: 128, unit: "EA", unitCost: 450, total: 57600 },
    ],
  },
]

export function AIEstimator({ selectedProject, onLogout, setActiveModule }: AIEstimatorProps) {
  const [step, setStep] = useState<Step>(1)
  const [uploadedSheets, setUploadedSheets] = useState<typeof mockSheets>([])
  const [isDragging, setIsDragging] = useState(false)
  const [parsingProgress, setParsingProgress] = useState(0)
  const [isParsing, setIsParsing] = useState(false)
  const [selectedCategory, setSelectedCategory] = useState("Walls")
  const [estimates, setEstimates] = useState(estimateData)
  const [editingItem, setEditingItem] = useState<number | null>(null)
  const [notesOpen, setNotesOpen] = useState<number | null>(null)
  const [splitModalOpen, setSplitModalOpen] = useState(false)
  const [checklist, setChecklist] = useState({
    quantities: false,
    costCodes: false,
    missingItems: false,
  })
  const [successModalOpen, setSuccessModalOpen] = useState(false)

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)
    // Simulate file upload
    setUploadedSheets(mockSheets)
    toast.success("12 sheets detected and ready for parsing")
  }, [])

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(true)
  }, [])

  const handleDragLeave = useCallback(() => {
    setIsDragging(false)
  }, [])

  const simulateUpload = () => {
    setUploadedSheets(mockSheets)
    toast.success("12 sheets detected and ready for parsing")
  }

  const startParsing = () => {
    setIsParsing(true)
    setStep(2)

    const interval = setInterval(() => {
      setParsingProgress((prev) => {
        if (prev >= 100) {
          clearInterval(interval)
          setIsParsing(false)
          return 100
        }
        return prev + 5
      })
    }, 150)
  }

  const toggleCategory = (categoryName: string) => {
    setEstimates((prev) =>
      prev.map((cat) => (cat.category === categoryName ? { ...cat, expanded: !cat.expanded } : cat)),
    )
  }

  const updateItemCost = (itemId: number, newCost: number) => {
    setEstimates((prev) =>
      prev.map((cat) => ({
        ...cat,
        items: cat.items.map((item) =>
          item.id === itemId ? { ...item, unitCost: newCost, total: item.quantity * newCost } : item,
        ),
      })),
    )
  }

  const totalEstimate = estimates.reduce(
    (acc, cat) => acc + cat.items.reduce((itemAcc, item) => itemAcc + item.total, 0),
    0,
  )

  const handleApprove = () => {
    if (!checklist.quantities || !checklist.costCodes || !checklist.missingItems) {
      toast.error("Please complete all checklist items before approving")
      return
    }
    setSuccessModalOpen(true)
  }

  return (
    <div className="pt-0 pr-0 pb-1 pl-0 space-y-2 h-full flex flex-col min-h-0">
      {/* Header */}
      <div className="flex items-center justify-between px-6">
        <div>
          <h1 className="text-3xl md:text-4xl font-semibold text-foreground">AI Estimator</h1>
          <p className="text-sm text-muted-foreground">{selectedProject}</p>
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
                <span className="text-xs text-muted-foreground">Foundation package at 85% complete</span>
              </DropdownMenuItem>
              <DropdownMenuItem className="flex flex-col items-start gap-1">
                <span className="text-sm font-medium">Parsing complete</span>
                <span className="text-xs text-muted-foreground">12 sheets processed successfully</span>
              </DropdownMenuItem>
              <DropdownMenuItem className="flex flex-col items-start gap-1">
                <span className="text-sm font-medium">Zoning alert</span>
                <span className="text-xs text-muted-foreground">ADA parking compliance flagged</span>
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
          {/* Step Indicator */}
          <div className="flex items-center gap-2 mb-8">
            {[1, 2, 3, 4].map((s) => (
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
                  {s === 1 && "Upload"}
                  {s === 2 && "Parsing"}
                  {s === 3 && "Estimate"}
                  {s === 4 && "Review"}
                </span>
                {s < 4 && <ChevronRight className="w-4 h-4 mx-3 text-muted-foreground" />}
              </div>
            ))}
          </div>

      {/* Step 1: Upload */}
      {step === 1 && (
        <div className="space-y-6">
          <Card className="bg-card">
            <CardHeader>
              <CardTitle className="text-card-foreground">Upload Construction Drawings</CardTitle>
            </CardHeader>
            <CardContent>
              <div
                className={cn(
                  "border-[1.25px] border-dashed rounded-xl p-12 text-center transition-colors [border-style:dashed] [border-image:repeating-linear-gradient(90deg,rgba(0,0,0,0.2),rgba(0,0,0,0.2) 3px,transparent 3px,transparent 6px)_1] border-image-slice-1",
                  isDragging
                    ? "border-bannett-navy bg-bannett-navy/5"
                    : "border-border hover:bg-[#f9f9f9]",
                )}
                onDrop={handleDrop}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
              >
                <Upload className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
                <p className="text-lg font-medium text-card-foreground mb-2">Drag and drop your drawing files here</p>
                <p className="text-sm text-muted-foreground mb-4">Supports PDF, DWG, DXF files up to 100MB each</p>
                <Button onClick={simulateUpload} className="bg-bannett-navy hover:bg-bannett-navy/90">
                  Browse Files
                </Button>
              </div>
            </CardContent>
          </Card>

          {uploadedSheets.length > 0 && (
            <Card className="bg-card">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-card-foreground">Detected Sheets ({uploadedSheets.length})</CardTitle>
                  <Badge className="bg-success text-primary-foreground">Ready for Parsing</Badge>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-2 max-h-[300px] overflow-y-auto">
                  {uploadedSheets.map((sheet, i) => (
                    <div
                      key={sheet.id}
                      className="flex items-center gap-3 p-3 rounded-lg bg-muted/50 hover:bg-muted transition-colors"
                    >
                      <GripVertical className="w-4 h-4 text-muted-foreground cursor-grab" />
                      <FileText className="w-5 h-5 text-bannett-navy" />
                      <div className="flex-1">
                        <p className="text-sm font-medium text-card-foreground">
                          {sheet.id} - {sheet.name}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {sheet.pages} pages • {sheet.size}
                        </p>
                      </div>
                      <Button variant="ghost" size="icon" className="h-8 w-8">
                        <Eye className="w-4 h-4" />
                      </Button>
                      <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive">
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  ))}
                </div>
                <Button onClick={startParsing} className="w-full mt-4 bg-bannett-navy hover:bg-bannett-navy/90">
                  Continue to Parsing
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </CardContent>
            </Card>
          )}
        </div>
      )}

      {/* Step 2: Parsing */}
      {step === 2 && (
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Left Sidebar - Categories */}
          <Card className="bg-card">
            <CardHeader>
              <CardTitle className="text-sm text-card-foreground">Parsed Categories</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {parsedCategories.map((cat) => (
                <button
                  key={cat.name}
                  onClick={() => setSelectedCategory(cat.name)}
                  className={cn(
                    "w-full flex items-center justify-between p-3 rounded-lg text-sm transition-colors",
                    selectedCategory === cat.name
                      ? "bg-bannett-navy text-primary-foreground"
                      : "hover:bg-muted text-card-foreground",
                  )}
                >
                  <span>{cat.name}</span>
                  <Badge variant={selectedCategory === cat.name ? "secondary" : "outline"}>{cat.count}</Badge>
                </button>
              ))}
            </CardContent>
          </Card>

          {/* Main - Drawing Viewer */}
          <Card className="lg:col-span-2 bg-card">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-card-foreground">Drawing Viewer</CardTitle>
                <div className="flex items-center gap-2">
                  <Button variant="outline" size="icon" className="h-8 w-8 bg-transparent">
                    <ZoomOut className="w-4 h-4" />
                  </Button>
                  <span className="text-sm text-muted-foreground">100%</span>
                  <Button variant="outline" size="icon" className="h-8 w-8 bg-transparent">
                    <ZoomIn className="w-4 h-4" />
                  </Button>
                  <Button variant="outline" size="icon" className="h-8 w-8 bg-transparent">
                    <Layers className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              {isParsing && parsingProgress < 100 ? (
                <div className="h-[400px] flex flex-col items-center justify-center">
                  <Loader2 className="w-12 h-12 animate-spin text-bannett-navy mb-4" />
                  <p className="text-lg font-medium mb-2 text-card-foreground">Analyzing Drawings...</p>
                  <Progress value={parsingProgress} className="w-64 h-2" />
                  <p className="text-sm text-muted-foreground mt-2">{parsingProgress}% complete</p>
                </div>
              ) : (
                <div className="h-[400px] bg-muted/30 rounded-lg flex items-center justify-center relative overflow-hidden">
                  {/* Simulated floor plan with highlights */}
                  <div className="absolute inset-4 border-2 border-dashed border-muted-foreground/30 rounded">
                    <div className="absolute top-4 left-4 w-24 h-32 border-2 border-bannett-navy bg-bannett-navy/10 rounded" />
                    <div className="absolute top-4 right-4 w-32 h-24 border-2 border-bannett-navy bg-bannett-navy/10 rounded" />
                    <div className="absolute bottom-4 left-1/4 w-40 h-20 border-2 border-bannett-blue bg-bannett-blue/10 rounded" />
                    <div className="absolute bottom-4 right-8 w-20 h-28 border-2 border-bannett-light bg-bannett-light/10 rounded" />
                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2">
                      <p className="text-sm text-muted-foreground">Sheet A01 - Ground Floor Plan</p>
                      <p className="text-xs text-muted-foreground text-center mt-1">
                        Hover over highlighted areas to see details
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Right Panel - Summary */}
          <Card className="bg-card">
            <CardHeader>
              <CardTitle className="text-sm text-card-foreground">Extraction Summary</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="p-3 rounded-lg bg-success/10">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-sm text-card-foreground">Confidence Score</span>
                  <span className="font-semibold text-success">94%</span>
                </div>
              </div>

              <div>
                <p className="text-sm font-medium mb-2 text-card-foreground">Detected Issues</p>
                <div className="space-y-2">
                  <div className="p-2 rounded bg-warning/10 text-sm">
                    <AlertCircle className="w-4 h-4 inline mr-2 text-warning" />
                    Ambiguous boundary near Column C5
                  </div>
                  <div className="p-2 rounded bg-warning/10 text-sm">
                    <AlertCircle className="w-4 h-4 inline mr-2 text-warning" />
                    Potential duplicate wall segment detected
                  </div>
                </div>
              </div>

              <div>
                <p className="text-sm font-medium mb-2 text-card-foreground">Element Totals</p>
                <div className="space-y-1 text-sm">
                  <div className="flex justify-between text-muted-foreground">
                    <span>Total elements</span>
                    <span className="font-medium text-card-foreground">304</span>
                  </div>
                  <div className="flex justify-between text-muted-foreground">
                    <span>Sheets processed</span>
                    <span className="font-medium text-card-foreground">12</span>
                  </div>
                  <div className="flex justify-between text-muted-foreground">
                    <span>Processing time</span>
                    <span className="font-medium text-card-foreground">2m 34s</span>
                  </div>
                </div>
              </div>

              <Button
                onClick={() => setStep(3)}
                className="w-full bg-bannett-navy hover:bg-bannett-navy/90"
                disabled={isParsing && parsingProgress < 100}
              >
                Generate Draft Estimate
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Step 3: Estimate */}
      {step === 3 && (
        <div className="space-y-6">
          <Card className="bg-card">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-card-foreground">Draft Estimate</CardTitle>
                  <p className="text-sm text-muted-foreground mt-1">Total: ${totalEstimate.toLocaleString()}</p>
                </div>
                <div className="flex items-center gap-2">
                  <Button variant="outline" size="sm">
                    <Plus className="w-4 h-4 mr-1" />
                    Add Line Item
                  </Button>
                  <Button variant="outline" size="sm">
                    <Save className="w-4 h-4 mr-1" />
                    Save Draft
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="border rounded-lg overflow-hidden">
                <table className="w-full">
                  <thead className="bg-muted/50">
                    <tr>
                      <th className="text-left p-3 text-sm font-medium text-muted-foreground">
                        CSI Category / Description
                      </th>
                      <th className="text-right p-3 text-sm font-medium text-muted-foreground">Quantity</th>
                      <th className="text-center p-3 text-sm font-medium text-muted-foreground">Unit</th>
                      <th className="text-right p-3 text-sm font-medium text-muted-foreground">Unit Cost</th>
                      <th className="text-right p-3 text-sm font-medium text-muted-foreground">Total</th>
                      <th className="w-24 p-3"></th>
                    </tr>
                  </thead>
                  <tbody>
                    {estimates.map((category) => (
                      <React.Fragment key={category.category}>
                        <tr
                          className="bg-muted/30 cursor-pointer hover:bg-muted/50"
                          onClick={() => toggleCategory(category.category)}
                        >
                          <td colSpan={5} className="p-3">
                            <div className="flex items-center gap-2">
                              {category.expanded ? (
                                <ChevronDown className="w-4 h-4" />
                              ) : (
                                <ChevronUp className="w-4 h-4" />
                              )}
                              <span className="font-medium text-card-foreground">{category.category}</span>
                              <Badge variant="secondary" className="ml-2">
                                {category.items.length} items
                              </Badge>
                            </div>
                          </td>
                          <td className="p-3 text-right font-medium text-card-foreground">
                            ${category.items.reduce((acc, item) => acc + item.total, 0).toLocaleString()}
                          </td>
                        </tr>
                        {category.expanded &&
                          category.items.map((item) => (
                            <tr key={item.id} className="border-t hover:bg-muted/20">
                              <td className="p-3 pl-10 text-sm text-card-foreground">{item.description}</td>
                              <td className="p-3 text-right text-sm text-card-foreground">
                                {item.quantity.toLocaleString()}
                              </td>
                              <td className="p-3 text-center text-sm text-muted-foreground">{item.unit}</td>
                              <td className="p-3 text-right">
                                {editingItem === item.id ? (
                                  <Input
                                    type="number"
                                    defaultValue={item.unitCost}
                                    className="w-24 h-8 text-right"
                                    onBlur={(e) => {
                                      updateItemCost(item.id, Number.parseFloat(e.target.value))
                                      setEditingItem(null)
                                    }}
                                    autoFocus
                                  />
                                ) : (
                                  <span
                                    className="cursor-pointer hover:text-bannett-blue text-sm text-card-foreground"
                                    onClick={() => setEditingItem(item.id)}
                                  >
                                    ${item.unitCost.toLocaleString()}
                                  </span>
                                )}
                              </td>
                              <td className="p-3 text-right font-medium text-sm text-card-foreground">
                                ${item.total.toLocaleString()}
                              </td>
                              <td className="p-3">
                                <div className="flex items-center gap-1">
                                  <Button
                                    variant="ghost"
                                    size="icon"
                                    className="h-7 w-7"
                                    onClick={() => setNotesOpen(item.id)}
                                  >
                                    <MessageSquare className="w-4 h-4" />
                                  </Button>
                                  <Button
                                    variant="ghost"
                                    size="icon"
                                    className="h-7 w-7"
                                    onClick={() => setSplitModalOpen(true)}
                                  >
                                    <Split className="w-4 h-4" />
                                  </Button>
                                </div>
                              </td>
                            </tr>
                          ))}
                      </React.Fragment>
                    ))}
                  </tbody>
                </table>
              </div>

              <div className="flex justify-end mt-4">
                <Button onClick={() => setStep(4)} className="bg-bannett-navy hover:bg-bannett-navy/90">
                  Review & Finalize Estimate
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Notes Modal */}
          <Dialog open={notesOpen !== null} onOpenChange={() => setNotesOpen(null)}>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Line Item Notes</DialogTitle>
              </DialogHeader>
              <div className="mt-4 space-y-4">
                <Textarea placeholder="Add notes for this line item..." className="min-h-[200px]" />
                <Button className="w-full bg-bannett-navy hover:bg-bannett-navy/90">Save Notes</Button>
              </div>
            </DialogContent>
          </Dialog>

          {/* Split Modal */}
          <Dialog open={splitModalOpen} onOpenChange={setSplitModalOpen}>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Split Line Item</DialogTitle>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <p className="text-sm text-muted-foreground">
                  Split this item into multiple line items with different quantities or cost codes.
                </p>
                <div className="space-y-3">
                  <div className="p-3 rounded-lg bg-muted/50">
                    <p className="text-sm font-medium">Split 1</p>
                    <div className="grid grid-cols-2 gap-2 mt-2">
                      <Input placeholder="Quantity" type="number" />
                      <Input placeholder="Cost Code" />
                    </div>
                  </div>
                  <div className="p-3 rounded-lg bg-muted/50">
                    <p className="text-sm font-medium">Split 2</p>
                    <div className="grid grid-cols-2 gap-2 mt-2">
                      <Input placeholder="Quantity" type="number" />
                      <Input placeholder="Cost Code" />
                    </div>
                  </div>
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setSplitModalOpen(false)}>
                  Cancel
                </Button>
                <Button
                  className="bg-bannett-navy hover:bg-bannett-navy/90"
                  onClick={() => {
                    setSplitModalOpen(false)
                    toast.success("Line item split successfully")
                  }}
                >
                  Apply Split
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      )}

      {/* Step 4: Review */}
      {step === 4 && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <Card className="lg:col-span-2 bg-card">
            <CardHeader>
              <CardTitle className="text-card-foreground">Final Review</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Approval Checklist */}
              <div>
                <h3 className="font-medium mb-3 text-card-foreground">Approval Checklist</h3>
                <div className="space-y-3">
                  <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/50">
                    <Checkbox
                      checked={checklist.quantities}
                      onCheckedChange={(checked) =>
                        setChecklist((prev) => ({ ...prev, quantities: checked as boolean }))
                      }
                    />
                    <span className="text-sm text-card-foreground">All quantities have been validated</span>
                  </div>
                  <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/50">
                    <Checkbox
                      checked={checklist.costCodes}
                      onCheckedChange={(checked) =>
                        setChecklist((prev) => ({ ...prev, costCodes: checked as boolean }))
                      }
                    />
                    <span className="text-sm text-card-foreground">Cost codes have been properly mapped</span>
                  </div>
                  <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/50">
                    <Checkbox
                      checked={checklist.missingItems}
                      onCheckedChange={(checked) =>
                        setChecklist((prev) => ({ ...prev, missingItems: checked as boolean }))
                      }
                    />
                    <span className="text-sm text-card-foreground">Missing items have been addressed</span>
                  </div>
                </div>
              </div>

              {/* Cost Code Mapping */}
              <div>
                <h3 className="font-medium mb-3 text-card-foreground">Cost Code Mapping</h3>
                <div className="border rounded-lg overflow-hidden">
                  <table className="w-full">
                    <thead className="bg-muted/50">
                      <tr>
                        <th className="text-left p-3 text-sm font-medium text-muted-foreground">Estimate Category</th>
                        <th className="text-left p-3 text-sm font-medium text-muted-foreground">Procore Cost Code</th>
                        <th className="w-20 p-3"></th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr className="border-t">
                        <td className="p-3 text-sm text-card-foreground">03 - Concrete</td>
                        <td className="p-3 text-sm text-card-foreground">03-CONC-001</td>
                        <td className="p-3">
                          <Button variant="ghost" size="sm">
                            <Edit3 className="w-4 h-4" />
                          </Button>
                        </td>
                      </tr>
                      <tr className="border-t">
                        <td className="p-3 text-sm text-card-foreground">05 - Metals</td>
                        <td className="p-3 text-sm text-card-foreground">05-STEEL-001</td>
                        <td className="p-3">
                          <Button variant="ghost" size="sm">
                            <Edit3 className="w-4 h-4" />
                          </Button>
                        </td>
                      </tr>
                      <tr className="border-t">
                        <td className="p-3 text-sm text-card-foreground">08 - Openings</td>
                        <td className="p-3 text-sm text-card-foreground">08-OPEN-001</td>
                        <td className="p-3">
                          <Button variant="ghost" size="sm">
                            <Edit3 className="w-4 h-4" />
                          </Button>
                        </td>
                      </tr>
                      <tr className="border-t">
                        <td className="p-3 text-sm text-card-foreground">26 - Electrical</td>
                        <td className="p-3 text-sm text-card-foreground">26-ELEC-001</td>
                        <td className="p-3">
                          <Button variant="ghost" size="sm">
                            <Edit3 className="w-4 h-4" />
                          </Button>
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* AI Suggestions Panel */}
          <Card className="bg-card">
            <CardHeader>
              <CardTitle className="text-sm text-card-foreground">AI Suggestions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="p-3 rounded-lg bg-warning/10">
                <div className="flex items-start gap-2">
                  <AlertCircle className="w-4 h-4 text-warning mt-0.5" />
                  <div>
                    <p className="text-sm font-medium text-card-foreground">Electrical Labor Underestimated</p>
                    <p className="text-xs text-muted-foreground mt-1">
                      Based on similar projects, electrical labor costs may be 15-20% higher than estimated.
                    </p>
                  </div>
                </div>
              </div>

              <div className="p-3 rounded-lg bg-warning/10">
                <div className="flex items-start gap-2">
                  <AlertCircle className="w-4 h-4 text-warning mt-0.5" />
                  <div>
                    <p className="text-sm font-medium text-card-foreground">Possible Duplicate Fixtures</p>
                    <p className="text-xs text-muted-foreground mt-1">
                      Detected potential duplicate lighting fixtures in sections A01 and A03.
                    </p>
                  </div>
                </div>
              </div>

              <div className="p-3 rounded-lg bg-bannett-navy/10">
                <div className="flex items-start gap-2">
                  <Check className="w-4 h-4 text-bannett-navy mt-0.5" />
                  <div>
                    <p className="text-sm font-medium text-card-foreground">Concrete Pricing Validated</p>
                    <p className="text-xs text-muted-foreground mt-1">
                      Current concrete pricing aligns with market rates for this region.
                    </p>
                  </div>
                </div>
              </div>

              <div className="pt-4 border-t border-border">
                <div className="p-4 rounded-lg bg-muted/50 text-center">
                  <p className="text-2xl font-semibold text-bannett-navy">${totalEstimate.toLocaleString()}</p>
                  <p className="text-sm text-muted-foreground">Final Estimate Total</p>
                </div>
              </div>

              <Button onClick={handleApprove} className="w-full bg-bannett-navy hover:bg-bannett-navy/90">
                <Check className="w-4 h-4 mr-2" />
                Approve Estimate
              </Button>
            </CardContent>
          </Card>
        </div>
      )}

        </CardContent>
      </Card>

      {/* Success Modal */}
      <Dialog open={successModalOpen} onOpenChange={setSuccessModalOpen}>
        <DialogContent className="text-center">
          <div className="w-16 h-16 rounded-full bg-success/20 flex items-center justify-center mx-auto mb-4">
            <Check className="w-8 h-8 text-success" />
          </div>
          <DialogHeader>
            <DialogTitle className="text-center">Estimate Approved!</DialogTitle>
          </DialogHeader>
          <p className="text-muted-foreground">
            Your estimate has been approved and synced to Procore. The project team has been notified.
          </p>
          <DialogFooter className="justify-center mt-4">
            <Button
              onClick={() => {
                setSuccessModalOpen(false)
                setStep(1)
                setUploadedSheets([])
                setParsingProgress(0)
                setChecklist({ quantities: false, costCodes: false, missingItems: false })
              }}
              className="bg-bannett-navy hover:bg-bannett-navy/90"
            >
              Start New Estimate
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
