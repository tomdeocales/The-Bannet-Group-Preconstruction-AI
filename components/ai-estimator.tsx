"use client"

import React, { useState, useCallback } from "react"
import {
  Upload,
  FileText,
  Check,
  AlertCircle,
  Hand,
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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip"
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
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

type Detection = {
  id: string
  category: (typeof parsedCategories)[number]["name"]
  label: string
  bbox: { x: number; y: number; w: number; h: number } // percentages relative to viewer
  confidence: number
  dimensions: string
  notes: string
}

const mockDetections: Detection[] = [
  {
    id: "W-042",
    category: "Walls",
    label: "Wall segment",
    bbox: { x: 10, y: 12, w: 18, h: 28 },
    confidence: 0.94,
    dimensions: `28'-6" x 10'-0"`,
    notes: "Partition type: 2HR rated (verify detail 3/A5.2)",
  },
  {
    id: "W-053",
    category: "Walls",
    label: "Wall segment",
    bbox: { x: 62, y: 12, w: 26, h: 20 },
    confidence: 0.9,
    dimensions: `34'-0" x 10'-0"`,
    notes: "Ambiguous boundary near Column C5",
  },
  {
    id: "D-018",
    category: "Doors",
    label: "Door opening",
    bbox: { x: 73, y: 60, w: 10, h: 14 },
    confidence: 0.88,
    dimensions: `3'-0" x 7'-0"`,
    notes: "Swing direction inferred (verify schedule A12)",
  },
  {
    id: "WIN-033",
    category: "Windows",
    label: "Window opening",
    bbox: { x: 27, y: 66, w: 22, h: 12 },
    confidence: 0.91,
    dimensions: `6'-0" x 4'-0"`,
    notes: "Storefront system (see elevation A07)",
  },
  {
    id: "LGT-128",
    category: "Electrical Fixtures",
    label: "Light fixture",
    bbox: { x: 38, y: 36, w: 8, h: 8 },
    confidence: 0.86,
    dimensions: `Type A — 2'x4'`,
    notes: "Potential duplicate fixture near Grid D4",
  },
  {
    id: "STR-022",
    category: "Structural Elements",
    label: "Column",
    bbox: { x: 48, y: 18, w: 12, h: 16 },
    confidence: 0.92,
    dimensions: `W14x61`,
    notes: "Matches structural plan S02",
  },
]

const categoryAccent = (category: string) => {
  if (category === "Walls") return "border-bannett-navy bg-bannett-navy/10"
  if (category === "Doors") return "border-bannett-blue bg-bannett-blue/10"
  if (category === "Windows") return "border-bannett-light bg-bannett-light/10"
  if (category === "Electrical Fixtures") return "border-warning bg-warning/10"
  if (category === "Structural Elements") return "border-success bg-success/10"
  if (category === "Plumbing Fixtures") return "border-cyan-600 bg-cyan-600/10"
  if (category === "HVAC Equipment") return "border-sky-600 bg-sky-600/10"
  return "border-muted-foreground/40 bg-muted/20"
}

const categoryConfidence: Record<Detection["category"], number> = {
  Walls: 94,
  Doors: 90,
  Windows: 91,
  "Electrical Fixtures": 86,
  "Structural Elements": 92,
  "Plumbing Fixtures": 88,
  "HVAC Equipment": 89,
}

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

const initialCostCodeMappings = [
  { category: "03 - Concrete", costCode: "03-CONC-001" },
  { category: "05 - Metals", costCode: "05-STEEL-001" },
  { category: "08 - Openings", costCode: "08-OPEN-001" },
  { category: "26 - Electrical", costCode: "26-ELEC-001" },
]

export function AIEstimator({ selectedProject, onLogout, setActiveModule }: AIEstimatorProps) {
  const [step, setStep] = useState<Step>(1)
  const [uploadedSheets, setUploadedSheets] = useState<typeof mockSheets>([])
  const [isDragging, setIsDragging] = useState(false)
  const [draggingSheetId, setDraggingSheetId] = useState<string | null>(null)
  const [dragOverSheetId, setDragOverSheetId] = useState<string | null>(null)
  const [previewSheet, setPreviewSheet] = useState<(typeof mockSheets)[number] | null>(null)
  const [parsingProgress, setParsingProgress] = useState(0)
  const [isParsing, setIsParsing] = useState(false)
  const [selectedCategory, setSelectedCategory] = useState<(typeof parsedCategories)[number]["name"]>("Walls")
  const [zoom, setZoom] = useState(1)
  const [panEnabled, setPanEnabled] = useState(false)
  const [pan, setPan] = useState({ x: 0, y: 0 })
  const [isPanning, setIsPanning] = useState(false)
  const [panStart, setPanStart] = useState<{ x: number; y: number } | null>(null)
  const [viewerLayers, setViewerLayers] = useState({
    detections: true,
    annotations: true,
    grid: false,
  })
  const [selectedDetection, setSelectedDetection] = useState<Detection | null>(null)
  const [estimates, setEstimates] = useState(estimateData)
  const [isSavingDraft, setIsSavingDraft] = useState(false)
  const [addItemOpen, setAddItemOpen] = useState(false)
  const [addItemCategoryMode, setAddItemCategoryMode] = useState<"select" | "custom">("select")
  const [addItemDraft, setAddItemDraft] = useState({
    category: "03 - Concrete",
    description: "",
    quantity: "",
    unit: "EA",
    unitCost: "",
  })
  const [editingItem, setEditingItem] = useState<number | null>(null)
  const [notesOpen, setNotesOpen] = useState<number | null>(null)
  const [notesDraft, setNotesDraft] = useState("")
  const [notesByItem, setNotesByItem] = useState<Record<number, string>>({})
  const [splitModalOpen, setSplitModalOpen] = useState(false)
  const [splitItem, setSplitItem] = useState<(typeof estimateData)[number]["items"][number] | null>(null)
  const [costCodeMappings, setCostCodeMappings] = useState(initialCostCodeMappings)
  const [editMappingOpen, setEditMappingOpen] = useState(false)
  const [mappingDraft, setMappingDraft] = useState<{ category: string; costCode: string } | null>(null)
  const [checklist, setChecklist] = useState({
    quantities: false,
    costCodes: false,
    missingItems: false,
  })
  const [successModalOpen, setSuccessModalOpen] = useState(false)

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)

    const files = Array.from(e.dataTransfer.files ?? [])
    const allowedExtensions = ["pdf", "dwg", "dxf"]

    const invalidType = files.find((f) => {
      const ext = f.name.split(".").pop()?.toLowerCase()
      return ext ? !allowedExtensions.includes(ext) : true
    })
    if (invalidType) {
      toast.error("Unsupported file type", {
        description: `“${invalidType.name}” is not supported. Upload PDF, DWG, or DXF files.`,
      })
      return
    }

    const tooLarge = files.find((f) => f.size > 100 * 1024 * 1024)
    if (tooLarge) {
      toast.error("File exceeds 100MB", { description: `“${tooLarge.name}” is too large for parsing.` })
      return
    }

    // Simulate sheet detection
    setUploadedSheets(mockSheets)
    toast.success("12 sheets detected", { description: "Review sheet order and remove any non-scope pages." })
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
    toast.success("12 sheets detected", { description: "Review sheet order and remove any non-scope pages." })
  }

  const startParsing = () => {
    setParsingProgress(0)
    setIsParsing(true)
    setStep(2)
    setZoom(1)
    setPan({ x: 0, y: 0 })
    setPanEnabled(false)
    setIsPanning(false)
    setPanStart(null)
    setViewerLayers({ detections: true, annotations: true, grid: false })
    setSelectedCategory("Walls")

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

  const removeSheet = (sheetId: string) => {
    setUploadedSheets((prev) => prev.filter((s) => s.id !== sheetId))
    toast.success("Sheet removed", { description: `${sheetId} has been removed from this set.` })
  }

  const reorderSheets = (fromId: string, toId: string) => {
    if (fromId === toId) return
    setUploadedSheets((prev) => {
      const fromIndex = prev.findIndex((s) => s.id === fromId)
      const toIndex = prev.findIndex((s) => s.id === toId)
      if (fromIndex === -1 || toIndex === -1) return prev

      const next = [...prev]
      const [moved] = next.splice(fromIndex, 1)
      next.splice(toIndex, 0, moved)
      return next
    })
    toast.success("Sheet order updated")
  }

  const clampZoom = (next: number) => Math.min(2.5, Math.max(0.5, next))

  const handleZoomIn = () => setZoom((z) => clampZoom(Number((z + 0.1).toFixed(2))))
  const handleZoomOut = () => setZoom((z) => clampZoom(Number((z - 0.1).toFixed(2))))

  const togglePanTool = () => {
    setPanEnabled((prev) => {
      const next = !prev
      toast.message(next ? "Pan tool enabled" : "Pan tool disabled", {
        description: next ? "Click and drag inside the viewer to pan." : "Hover detections for details.",
      })
      return next
    })
  }

  const setViewerLayer = (key: keyof typeof viewerLayers, value: boolean) => {
    setViewerLayers((prev) => {
      const next = { ...prev, [key]: value }
      toast.message("Viewer layers updated", {
        description: `${key.charAt(0).toUpperCase()}${key.slice(1)} ${value ? "shown" : "hidden"}`,
      })
      return next
    })
  }

  const handleViewerMouseDown = (e: React.MouseEvent) => {
    if (!panEnabled) return
    setIsPanning(true)
    setPanStart({ x: e.clientX - pan.x, y: e.clientY - pan.y })
  }

  const handleViewerMouseMove = (e: React.MouseEvent) => {
    if (!panEnabled || !isPanning || !panStart) return
    setPan({ x: e.clientX - panStart.x, y: e.clientY - panStart.y })
  }

  const endPan = () => {
    setIsPanning(false)
    setPanStart(null)
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

  const handleAddLineItem = () => {
    const description = addItemDraft.description.trim()
    const category = addItemDraft.category.trim()
    const quantity = Number(addItemDraft.quantity)
    const unitCost = Number(addItemDraft.unitCost)

    if (!category) {
      toast.error("Select a CSI category")
      return
    }
    if (!description) {
      toast.error("Enter a line item description")
      return
    }
    if (!Number.isFinite(quantity) || quantity <= 0) {
      toast.error("Enter a valid quantity")
      return
    }
    if (!Number.isFinite(unitCost) || unitCost < 0) {
      toast.error("Enter a valid unit cost")
      return
    }

    setEstimates((prev) => {
      const nextId = Math.max(0, ...prev.flatMap((c) => c.items.map((i) => i.id))) + 1
      const newItem = {
        id: nextId,
        description,
        quantity,
        unit: addItemDraft.unit.trim() || "EA",
        unitCost,
        total: quantity * unitCost,
      }

      const hasCategory = prev.some((c) => c.category === category)
      if (!hasCategory) {
        return [{ category, expanded: true, items: [newItem] }, ...prev]
      }

      return prev.map((c) => (c.category === category ? { ...c, expanded: true, items: [...c.items, newItem] } : c))
    })

    toast.success("Line item added", { description: `${category} • ${description}` })
    setAddItemOpen(false)
    setAddItemDraft({ category, description: "", quantity: "", unit: "EA", unitCost: "" })
  }

  const totalEstimate = estimates.reduce(
    (acc, cat) => acc + cat.items.reduce((itemAcc, item) => itemAcc + item.total, 0),
    0,
  )

  const csiCategoryOptions = Array.from(
    new Set([
      ...estimates.map((c) => c.category),
      "01 - General Requirements",
      "02 - Existing Conditions",
      "06 - Wood, Plastics, and Composites",
      "07 - Thermal and Moisture Protection",
      "09 - Finishes",
      "10 - Specialties",
      "21 - Fire Suppression",
      "22 - Plumbing",
      "23 - Heating, Ventilating, and Air Conditioning (HVAC)",
      "27 - Communications",
      "28 - Electronic Safety and Security",
    ]),
  )

  const activeNotesItem =
    notesOpen === null
      ? null
      : estimates.flatMap((c) => c.items).find((i) => i.id === notesOpen) ?? null

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
          <h1 className="text-xl md:text-2xl font-semibold text-foreground">AI Estimator</h1>
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
                  {uploadedSheets.map((sheet) => (
                    <div
                      key={sheet.id}
                      draggable
                      onDragStart={() => setDraggingSheetId(sheet.id)}
                      onDragEnd={() => {
                        setDraggingSheetId(null)
                        setDragOverSheetId(null)
                      }}
                      onDragOver={(e) => {
                        e.preventDefault()
                        setDragOverSheetId(sheet.id)
                      }}
                      onDragLeave={() => {
                        setDragOverSheetId((prev) => (prev === sheet.id ? null : prev))
                      }}
                      onDrop={(e) => {
                        e.preventDefault()
                        if (draggingSheetId) reorderSheets(draggingSheetId, sheet.id)
                        setDraggingSheetId(null)
                        setDragOverSheetId(null)
                      }}
                      className={cn(
                        "flex items-center gap-3 p-3 rounded-lg bg-muted/50 hover:bg-muted transition-colors",
                        draggingSheetId === sheet.id && "opacity-60",
                        dragOverSheetId === sheet.id && draggingSheetId && draggingSheetId !== sheet.id && "ring-2 ring-bannett-blue",
                      )}
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
                      <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => setPreviewSheet(sheet)}>
                        <Eye className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-destructive"
                        onClick={() => removeSheet(sheet.id)}
                      >
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
	                  onClick={() => {
	                    setSelectedCategory(cat.name)
	                    setSelectedDetection(null)
	                  }}
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
                  <Button
                    variant="outline"
                    size="icon"
                    className="h-8 w-8 bg-transparent"
                    onClick={handleZoomOut}
                    disabled={zoom <= 0.5}
                  >
                    <ZoomOut className="w-4 h-4" />
                  </Button>
                  <span className="text-sm text-muted-foreground tabular-nums">{Math.round(zoom * 100)}%</span>
                  <Button
                    variant="outline"
                    size="icon"
                    className="h-8 w-8 bg-transparent"
                    onClick={handleZoomIn}
                    disabled={zoom >= 2.5}
                  >
                    <ZoomIn className="w-4 h-4" />
                  </Button>
                  <Button
                    variant="outline"
                    size="icon"
                    className={cn("h-8 w-8 bg-transparent", panEnabled && "border-bannett-blue text-bannett-blue")}
                    onClick={togglePanTool}
                  >
                    <Hand className="w-4 h-4" />
                  </Button>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="outline" size="icon" className="h-8 w-8 bg-transparent">
                        <Layers className="w-4 h-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-52">
                      <DropdownMenuLabel>Layers</DropdownMenuLabel>
                      <DropdownMenuSeparator />
                      <DropdownMenuCheckboxItem
                        checked={viewerLayers.detections}
                        onCheckedChange={(checked) => setViewerLayer("detections", Boolean(checked))}
                      >
                        Detections
                      </DropdownMenuCheckboxItem>
                      <DropdownMenuCheckboxItem
                        checked={viewerLayers.annotations}
                        onCheckedChange={(checked) => setViewerLayer("annotations", Boolean(checked))}
                      >
                        Annotations
                      </DropdownMenuCheckboxItem>
                      <DropdownMenuCheckboxItem
                        checked={viewerLayers.grid}
                        onCheckedChange={(checked) => setViewerLayer("grid", Boolean(checked))}
                      >
                        Grid
                      </DropdownMenuCheckboxItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
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
                <div
                  className={cn(
                    "h-[400px] bg-muted/30 rounded-lg relative overflow-hidden",
                    panEnabled ? (isPanning ? "cursor-grabbing" : "cursor-grab") : "cursor-default",
                  )}
                  onMouseDown={handleViewerMouseDown}
                  onMouseMove={handleViewerMouseMove}
                  onMouseUp={endPan}
                  onMouseLeave={endPan}
                >
                  <div
                    className={cn(
                      "absolute inset-4 rounded border-2 border-dashed border-muted-foreground/30 bg-background/60 overflow-hidden",
                      viewerLayers.grid &&
                        "bg-[linear-gradient(to_right,rgba(0,0,0,0.06)_1px,transparent_1px),linear-gradient(to_bottom,rgba(0,0,0,0.06)_1px,transparent_1px)] [background-size:24px_24px]",
                    )}
                  >
                    <div className="absolute inset-0" style={{ transform: `translate(${pan.x}px, ${pan.y}px)` }}>
                      <div
                        className="absolute inset-0"
                        style={{ transform: `scale(${zoom})`, transformOrigin: "center" }}
                      >
                        {/* Base plan shapes */}
                        <div className="absolute inset-0">
                          <div className="absolute top-[10%] left-[10%] w-[34%] h-[42%] border border-muted-foreground/25 rounded" />
                          <div className="absolute top-[12%] right-[12%] w-[28%] h-[28%] border border-muted-foreground/25 rounded" />
                          <div className="absolute bottom-[10%] left-[16%] w-[46%] h-[26%] border border-muted-foreground/25 rounded" />
                          <div className="absolute bottom-[12%] right-[10%] w-[22%] h-[34%] border border-muted-foreground/25 rounded" />
                        </div>

                        {/* Detections */}
                        {viewerLayers.detections && (
                          <div className={cn("absolute inset-0", panEnabled && "pointer-events-none")}>
                            {mockDetections.map((d) => {
                              const isSelected = d.category === selectedCategory
                              const isDimmed = d.category !== selectedCategory
                              return (
                                <Tooltip key={d.id}>
                                  <TooltipTrigger asChild>
                                    <button
                                      type="button"
                                      className={cn(
                                        "absolute border-2 rounded transition-all focus:outline-none focus-visible:ring-2 focus-visible:ring-bannett-blue",
                                        categoryAccent(d.category),
                                        isSelected && "ring-2 ring-bannett-blue",
                                        isDimmed && "opacity-25",
                                      )}
                                      style={{
                                        left: `${d.bbox.x}%`,
                                        top: `${d.bbox.y}%`,
                                        width: `${d.bbox.w}%`,
                                        height: `${d.bbox.h}%`,
                                      }}
                                      onClick={() => setSelectedDetection(d)}
                                    />
                                  </TooltipTrigger>
                                  <TooltipContent side="top" sideOffset={6}>
                                    <div className="space-y-1 max-w-[240px]">
                                      <div className="flex items-center justify-between gap-3">
                                        <span className="font-medium">{d.id}</span>
                                        <span className="tabular-nums">{Math.round(d.confidence * 100)}%</span>
                                      </div>
                                      <div>{d.label}</div>
                                      <div className="opacity-90">{d.dimensions}</div>
                                      <div className="opacity-80">{d.notes}</div>
                                    </div>
                                  </TooltipContent>
                                </Tooltip>
                              )
                            })}
                          </div>
                        )}

                        {/* Annotations */}
                        {viewerLayers.annotations && (
                          <div className="absolute inset-0 pointer-events-none">
                            <div className="absolute top-[6%] left-[6%] text-[11px] text-muted-foreground bg-background/70 px-2 py-1 rounded">
                              Sheet A01 — Ground Floor Plan
                            </div>
                            <div className="absolute bottom-[6%] right-[6%] text-[11px] text-muted-foreground bg-background/70 px-2 py-1 rounded">
                              {selectedCategory} overlay
                            </div>
                            {panEnabled && (
                              <div className="absolute top-[6%] right-[6%] text-[11px] text-bannett-blue bg-background/70 px-2 py-1 rounded">
                                Pan mode
                              </div>
                            )}
                          </div>
                        )}
                      </div>
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
                <div className="flex items-center justify-between">
                  <span className="text-sm text-card-foreground">Category Confidence</span>
                  <span className="font-semibold text-success">{categoryConfidence[selectedCategory]}%</span>
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  {selectedCategory} • {parsedCategories.find((c) => c.name === selectedCategory)?.count ?? 0} detections
                </p>
              </div>

              {selectedDetection && (
                <div className="p-3 rounded-lg bg-muted/50 space-y-2">
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-medium text-card-foreground">Selection</p>
                    <Button variant="ghost" size="sm" onClick={() => setSelectedDetection(null)}>
                      Clear
                    </Button>
                  </div>
                  <div className="space-y-1">
                    <p className="text-sm text-card-foreground">
                      {selectedDetection.id} — {selectedDetection.label}
                    </p>
                    <p className="text-xs text-muted-foreground">{selectedDetection.dimensions}</p>
                    <p className="text-xs text-muted-foreground">{selectedDetection.notes}</p>
                  </div>
                  <div className="flex gap-2 pt-1">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => toast.success("Added to review list", { description: `${selectedDetection.id} flagged for QA.` })}
                    >
                      Flag for QA
                    </Button>
                    <Button
                      size="sm"
                      className="bg-bannett-navy hover:bg-bannett-navy/90"
                      onClick={() =>
                        toast.success("Note created", { description: `Note added for ${selectedDetection.id}.` })
                      }
                    >
                      Add Note
                    </Button>
                  </div>
                </div>
              )}

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
                  <Button variant="outline" size="sm" onClick={() => setAddItemOpen(true)}>
                    <Plus className="w-4 h-4 mr-1" />
                    Add Line Item
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      setIsSavingDraft(true)
                      setTimeout(() => {
                        setIsSavingDraft(false)
                        toast.success("Draft saved", { description: "Estimate saved as a draft for review." })
                      }, 900)
                    }}
                    disabled={isSavingDraft}
                  >
                    {isSavingDraft ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-1 animate-spin" />
                        Saving...
                      </>
                    ) : (
                      <>
                        <Save className="w-4 h-4 mr-1" />
                        Save Draft
                      </>
                    )}
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="border rounded-lg overflow-hidden">
                <div className="max-h-[520px] overflow-auto">
                <table className="w-full">
                  <thead className="bg-muted/50 sticky top-0 z-10">
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
                                    onClick={() => {
                                      setNotesOpen(item.id)
                                      setNotesDraft(notesByItem[item.id] ?? "")
                                    }}
                                  >
                                    <MessageSquare className="w-4 h-4" />
                                  </Button>
                                  <Button
                                    variant="ghost"
                                    size="icon"
                                    className="h-7 w-7"
                                    onClick={() => {
                                      setSplitItem(item)
                                      setSplitModalOpen(true)
                                    }}
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
	          <Dialog
	            open={notesOpen !== null}
	            onOpenChange={(open) => {
	              if (!open) {
	                setNotesOpen(null)
	                setNotesDraft("")
	              }
	            }}
	          >
	            <DialogContent className="sm:max-w-lg">
	              <DialogHeader>
	                <DialogTitle>Line Item Notes</DialogTitle>
	                <p className="text-sm text-muted-foreground">
	                  {activeNotesItem?.description ?? (notesOpen ? `Line item #${notesOpen}` : "")}
	                </p>
	              </DialogHeader>
	              <div className="space-y-3">
	                <Textarea
	                  value={notesDraft}
	                  onChange={(e) => setNotesDraft(e.target.value)}
	                  placeholder="Add notes for this line item..."
	                  className="min-h-[220px]"
	                />
	                <div className="flex items-center justify-between text-xs text-muted-foreground">
	                  <span>Saved notes persist for this session.</span>
	                  {notesOpen !== null && notesByItem[notesOpen] && <span>Previously saved</span>}
	                </div>
	              </div>
	              <DialogFooter className="gap-2">
	                <Button
	                  variant="outline"
	                  onClick={() => {
	                    setNotesOpen(null)
	                    setNotesDraft("")
	                  }}
	                >
	                  Close
	                </Button>
	                <Button
	                  className="bg-bannett-navy hover:bg-bannett-navy/90"
	                  onClick={() => {
	                    if (notesOpen === null) return
	                    const next = notesDraft.trim()
	                    setNotesByItem((prev) => ({ ...prev, [notesOpen]: next }))
	                    toast.success("Notes saved", { description: "Line item notes updated." })
	                    setNotesOpen(null)
	                    setNotesDraft("")
	                  }}
	                >
	                  Save Notes
	                </Button>
	              </DialogFooter>
	            </DialogContent>
	          </Dialog>

          {/* Split Modal */}
          <Dialog
            open={splitModalOpen}
            onOpenChange={(open) => {
              setSplitModalOpen(open)
              if (!open) setSplitItem(null)
            }}
          >
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Split Line Item</DialogTitle>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <p className="text-sm text-muted-foreground">
                  Split this item into multiple line items with different quantities or cost codes.
                </p>
                {splitItem && (
                  <div className="p-3 rounded-lg bg-muted/50 text-sm">
                    <p className="font-medium text-card-foreground">{splitItem.description}</p>
                    <p className="text-xs text-muted-foreground mt-1">
                      Current: {splitItem.quantity.toLocaleString()} {splitItem.unit} @ ${splitItem.unitCost.toLocaleString()}
                    </p>
                  </div>
                )}
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
                    setSplitItem(null)
                    toast.success("Line item split successfully")
                  }}
                >
                  Apply Split
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>

          {/* Add Line Item Modal */}
	          <Dialog
	            open={addItemOpen}
	            onOpenChange={(open) => {
	              setAddItemOpen(open)
	              if (!open) {
	                setAddItemCategoryMode("select")
	                setAddItemDraft({ category: "03 - Concrete", description: "", quantity: "", unit: "EA", unitCost: "" })
	              }
	            }}
	          >
	            <DialogContent>
              <DialogHeader>
                <DialogTitle>Add Custom Line Item</DialogTitle>
              </DialogHeader>
	              <div className="space-y-4 py-4">
	                <div className="space-y-2">
	                  <div className="flex items-center justify-between">
	                    <p className="text-sm font-medium text-card-foreground">CSI Category</p>
	                    {addItemCategoryMode === "select" ? (
	                      <Button
	                        type="button"
	                        variant="link"
	                        size="sm"
	                        className="h-auto px-0 py-0 text-xs"
	                        onClick={() => setAddItemCategoryMode("custom")}
	                      >
	                        Type manually
	                      </Button>
	                    ) : (
	                      <Button
	                        type="button"
	                        variant="link"
	                        size="sm"
	                        className="h-auto px-0 py-0 text-xs"
	                        onClick={() => {
	                          setAddItemCategoryMode("select")
	                          if (!csiCategoryOptions.includes(addItemDraft.category)) {
	                            setAddItemDraft((prev) => ({ ...prev, category: csiCategoryOptions[0] ?? "03 - Concrete" }))
	                          }
	                        }}
	                      >
	                        Choose from list
	                      </Button>
	                    )}
	                  </div>

	                  {addItemCategoryMode === "select" ? (
	                    <Select
	                      value={csiCategoryOptions.includes(addItemDraft.category) ? addItemDraft.category : undefined}
	                      onValueChange={(value) => setAddItemDraft((prev) => ({ ...prev, category: value }))}
	                    >
	                      <SelectTrigger className="w-full">
	                        <SelectValue placeholder="Select a CSI category" />
	                      </SelectTrigger>
	                      <SelectContent className="max-h-60">
	                        {csiCategoryOptions.map((cat) => (
	                          <SelectItem key={cat} value={cat}>
	                            {cat}
	                          </SelectItem>
	                        ))}
	                      </SelectContent>
	                    </Select>
	                  ) : (
	                    <Input
	                      value={addItemDraft.category}
	                      onChange={(e) => setAddItemDraft((prev) => ({ ...prev, category: e.target.value }))}
	                      placeholder="e.g., 09 - Finishes"
	                    />
	                  )}
	                </div>
	                <div className="space-y-2">
	                  <p className="text-sm font-medium text-card-foreground">Description</p>
	                  <Input
                    value={addItemDraft.description}
                    onChange={(e) => setAddItemDraft((prev) => ({ ...prev, description: e.target.value }))}
                    placeholder="e.g., Firestopping at penetrations"
                  />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-2">
                    <p className="text-sm font-medium text-card-foreground">Quantity</p>
                    <Input
                      value={addItemDraft.quantity}
                      onChange={(e) => setAddItemDraft((prev) => ({ ...prev, quantity: e.target.value }))}
                      type="number"
                      placeholder="0"
                    />
                  </div>
                  <div className="space-y-2">
                    <p className="text-sm font-medium text-card-foreground">Unit</p>
                    <Input
                      value={addItemDraft.unit}
                      onChange={(e) => setAddItemDraft((prev) => ({ ...prev, unit: e.target.value }))}
                      placeholder="EA"
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <p className="text-sm font-medium text-card-foreground">Unit Cost</p>
                  <Input
                    value={addItemDraft.unitCost}
                    onChange={(e) => setAddItemDraft((prev) => ({ ...prev, unitCost: e.target.value }))}
                    type="number"
                    placeholder="0.00"
                  />
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setAddItemOpen(false)}>
                  Cancel
                </Button>
                <Button className="bg-bannett-navy hover:bg-bannett-navy/90" onClick={handleAddLineItem}>
                  Add Item
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
                      {costCodeMappings.map((m) => (
                        <tr key={m.category} className="border-t">
                          <td className="p-3 text-sm text-card-foreground">{m.category}</td>
                          <td className="p-3 text-sm text-card-foreground">{m.costCode}</td>
                          <td className="p-3">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => {
                                setMappingDraft({ category: m.category, costCode: m.costCode })
                                setEditMappingOpen(true)
                              }}
                            >
                              <Edit3 className="w-4 h-4" />
                            </Button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Edit Mapping Modal */}
              <Dialog
                open={editMappingOpen}
                onOpenChange={(open) => {
                  setEditMappingOpen(open)
                  if (!open) setMappingDraft(null)
                }}
              >
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Edit Cost Code Mapping</DialogTitle>
                  </DialogHeader>
                  {mappingDraft && (
                    <div className="space-y-4 py-4">
                      <div className="space-y-2">
                        <p className="text-sm font-medium text-card-foreground">Estimate Category</p>
                        <Input value={mappingDraft.category} disabled />
                      </div>
                      <div className="space-y-2">
                        <p className="text-sm font-medium text-card-foreground">Procore Cost Code</p>
                        <Input
                          value={mappingDraft.costCode}
                          onChange={(e) =>
                            setMappingDraft((prev) =>
                              prev ? { ...prev, costCode: e.target.value.toUpperCase() } : prev,
                            )
                          }
                          placeholder="e.g., 26-ELEC-001"
                        />
                      </div>
                      <div className="p-3 rounded-lg bg-muted/50 text-sm text-muted-foreground">
                        Mapping updates apply to sync and reporting. Use a consistent cost code format across divisions.
                      </div>
                    </div>
                  )}
                  <DialogFooter>
                    <Button variant="outline" onClick={() => setEditMappingOpen(false)}>
                      Cancel
                    </Button>
                    <Button
                      className="bg-bannett-navy hover:bg-bannett-navy/90"
                      onClick={() => {
                        if (!mappingDraft) return
                        const nextCode = mappingDraft.costCode.trim().toUpperCase()
                        if (!nextCode) {
                          toast.error("Enter a cost code")
                          return
                        }
                        setCostCodeMappings((prev) =>
                          prev.map((m) => (m.category === mappingDraft.category ? { ...m, costCode: nextCode } : m)),
                        )
                        toast.success("Mapping updated", { description: `${mappingDraft.category} → ${nextCode}` })
                        setEditMappingOpen(false)
                        setMappingDraft(null)
                      }}
                    >
                      Save Mapping
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
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

      {/* Sheet Preview */}
      <Dialog open={!!previewSheet} onOpenChange={(open) => !open && setPreviewSheet(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Sheet Preview</DialogTitle>
          </DialogHeader>
          {previewSheet && (
            <div className="space-y-4 py-2">
              <div className="p-3 rounded-lg bg-muted/50">
                <p className="text-sm font-medium text-card-foreground">
                  {previewSheet.id} — {previewSheet.name}
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  {previewSheet.pages} pages • {previewSheet.size}
                </p>
              </div>
              <div className="h-56 rounded-lg bg-muted/30 border border-border flex items-center justify-center">
                <p className="text-sm text-muted-foreground">Rendering preview…</p>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setPreviewSheet(null)}>
              Close
            </Button>
            {previewSheet && (
              <Button
                variant="destructive"
                onClick={() => {
                  removeSheet(previewSheet.id)
                  setPreviewSheet(null)
                }}
              >
                Remove Sheet
              </Button>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>

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
                setDraggingSheetId(null)
                setDragOverSheetId(null)
                setPreviewSheet(null)
                setParsingProgress(0)
                setIsParsing(false)
                setSelectedCategory("Walls")
                setSelectedDetection(null)
                setZoom(1)
                setPan({ x: 0, y: 0 })
                setPanEnabled(false)
                setIsPanning(false)
                setPanStart(null)
                setViewerLayers({ detections: true, annotations: true, grid: false })
                setEstimates(estimateData)
                setIsSavingDraft(false)
                setAddItemOpen(false)
                setAddItemDraft({ category: "03 - Concrete", description: "", quantity: "", unit: "EA", unitCost: "" })
                setEditingItem(null)
                setNotesOpen(null)
                setNotesDraft("")
                setNotesByItem({})
                setSplitModalOpen(false)
                setSplitItem(null)
                setCostCodeMappings(initialCostCodeMappings)
                setEditMappingOpen(false)
                setMappingDraft(null)
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
