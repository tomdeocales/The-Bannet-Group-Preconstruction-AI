"use client"

import type React from "react"

import { useState, useCallback } from "react"
import {
  Upload,
  FileText,
  Check,
  AlertTriangle,
  ChevronRight,
  ChevronDown,
  AlertCircle,
  ArrowRight,
  Loader2,
  Download,
  Save,
  Plus,
  Edit3,
  Trash2,
  CheckCircle2,
  Info,
  Bell,
  User,
} from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Checkbox } from "@/components/ui/checkbox"
import { Progress } from "@/components/ui/progress"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
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

interface ZoningReviewProps {
  selectedProject: string
  onLogout?: () => void
}

type Step = 1 | 2 | 3 | 4 | 5

const riskFlags = [
  {
    id: 1,
    type: "Fire Code",
    severity: "high",
    title: "Fire Code Concern",
    description:
      "Building exceeds 75 feet in height, requiring additional fire suppression systems per IBC Section 403.",
    recommendation: "Install standpipe system and ensure fire department access on all sides.",
  },
  {
    id: 2,
    type: "ADA",
    severity: "high",
    title: "ADA Compliance Issue",
    description:
      "Accessible parking calculation shows 8 spaces provided, but 12 spaces required per ADA 2010 Standards.",
    recommendation: "Add 4 additional accessible parking spaces with van-accessible markings.",
  },
  {
    id: 3,
    type: "Setback",
    severity: "medium",
    title: "Setback Violation",
    description: "East facade extends 2 feet into required 15-foot setback per Municipal Code 18.20.040.",
    recommendation: "Modify building footprint or apply for variance.",
  },
  {
    id: 4,
    type: "Stormwater",
    severity: "low",
    title: "Stormwater Retention",
    description: "Site impervious surface exceeds threshold for enhanced stormwater management.",
    recommendation: "Install bioswales or retention pond per DEQ requirements.",
  },
]

const detailedFindings = [
  {
    title: "Use Classification",
    content:
      "The proposed use is classified as B (Business) with accessory A-3 (Assembly) use for the first-floor lobby and conference areas. Maximum occupant load calculated at 1,247 persons.",
  },
  {
    title: "Parking Requirements",
    content:
      "Required parking: 1 space per 300 SF of gross floor area. Total required: 245 spaces. Provided: 252 spaces (including 12 accessible). Bicycle parking: 24 spaces required, 30 provided.",
  },
  {
    title: "Setbacks",
    content:
      "Front: 25' required, 28' provided. Side (West): 10' required, 15' provided. Side (East): 15' required, 13' provided (VIOLATION). Rear: 20' required, 45' provided.",
  },
  {
    title: "Stormwater Compliance",
    content:
      "Site creates 2.4 acres of new impervious surface. Enhanced stormwater management required per City Ordinance 2019-42. Recommend bioswales along north and east perimeter.",
  },
  {
    title: "Occupancy Load",
    content:
      "Ground Floor: 450 persons. Second Floor: 380 persons. Third Floor: 380 persons. Mezzanine: 37 persons. Total building occupancy: 1,247 persons.",
  },
]

const initialChecklist = [
  { id: 1, text: "Building permit application submitted", completed: false },
  { id: 2, text: "Environmental review completed", completed: false },
  { id: 3, text: "HVAC engineering review required", completed: false },
  { id: 4, text: "Site inspection scheduled", completed: false },
  { id: 5, text: "Fire marshal sign-off obtained", completed: false },
  { id: 6, text: "ADA compliance verified", completed: false },
  { id: 7, text: "Traffic impact study reviewed", completed: false },
  { id: 8, text: "Stormwater management plan approved", completed: false },
]

export function ZoningReview({ selectedProject, onLogout }: ZoningReviewProps) {
  const [step, setStep] = useState<Step>(1)
  const [uploadedDocs, setUploadedDocs] = useState<string[]>([])
  const [isDragging, setIsDragging] = useState(false)
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [analysisProgress, setAnalysisProgress] = useState(0)
  const [expandedFlag, setExpandedFlag] = useState<number | null>(null)
  const [checklist, setChecklist] = useState(initialChecklist)
  const [editingItem, setEditingItem] = useState<number | null>(null)
  const [newItemText, setNewItemText] = useState("")
  const [addingItem, setAddingItem] = useState(false)

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)
    setUploadedDocs([
      "City_Planning_Ordinance_2024-156.pdf",
      "Zoning_Map_Section_12A.pdf",
      "Environmental_Impact_Report.pdf",
    ])
    toast.success("3 documents uploaded successfully")
  }, [])

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(true)
  }, [])

  const handleDragLeave = useCallback(() => {
    setIsDragging(false)
  }, [])

  const simulateUpload = () => {
    setUploadedDocs([
      "City_Planning_Ordinance_2024-156.pdf",
      "Zoning_Map_Section_12A.pdf",
      "Environmental_Impact_Report.pdf",
    ])
    toast.success("3 documents uploaded successfully")
  }

  const startAnalysis = () => {
    setIsAnalyzing(true)
    setStep(2)

    const interval = setInterval(() => {
      setAnalysisProgress((prev) => {
        if (prev >= 100) {
          clearInterval(interval)
          setIsAnalyzing(false)
          return 100
        }
        return prev + 4
      })
    }, 100)
  }

  const toggleChecklistItem = (id: number) => {
    setChecklist((prev) => prev.map((item) => (item.id === id ? { ...item, completed: !item.completed } : item)))
  }

  const updateChecklistItem = (id: number, text: string) => {
    setChecklist((prev) => prev.map((item) => (item.id === id ? { ...item, text } : item)))
    setEditingItem(null)
  }

  const deleteChecklistItem = (id: number) => {
    setChecklist((prev) => prev.filter((item) => item.id !== id))
  }

  const addChecklistItem = () => {
    if (newItemText.trim()) {
      setChecklist((prev) => [
        ...prev,
        {
          id: Math.max(...prev.map((i) => i.id)) + 1,
          text: newItemText.trim(),
          completed: false,
        },
      ])
      setNewItemText("")
      setAddingItem(false)
    }
  }

  const exportChecklist = () => {
    toast.success("Checklist exported to PDF")
  }

  const saveToProcore = () => {
    toast.success("Saved to Procore Documents", {
      description: "Zoning review documents have been uploaded to the project folder.",
    })
  }

  return (
    <div className="pt-0 pr-0 pb-1 pl-0 space-y-2 h-full flex flex-col min-h-0">
      {/* Header */}
      <div className="flex items-center justify-between px-6">
        <div>
          <h1 className="text-2xl font-semibold text-foreground">Zoning & Preconstruction Review</h1>
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
            <DropdownMenuContent align="end" className="w-72">
              <DropdownMenuLabel>Notifications</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem className="flex flex-col items-start gap-1">
                <span className="text-sm font-medium">Zoning summary generated</span>
                <span className="text-xs text-muted-foreground">Executive summary ready for download</span>
              </DropdownMenuItem>
              <DropdownMenuItem className="flex flex-col items-start gap-1">
                <span className="text-sm font-medium">Fire code concern</span>
                <span className="text-xs text-muted-foreground">Pressurization relief missing on Stair 2</span>
              </DropdownMenuItem>
              <DropdownMenuItem className="flex flex-col items-start gap-1">
                <span className="text-sm font-medium">ADA parking flag</span>
                <span className="text-xs text-muted-foreground">Add 4 accessible parking spaces</span>
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
                <DropdownMenuItem>Profile</DropdownMenuItem>
                <DropdownMenuItem onClick={onLogout}>Logout</DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </div>

      <Card className="shadow-sm flex-1 min-h-0">
        <CardContent className="p-6 h-full overflow-auto [scrollbar-width:thin] [&::-webkit-scrollbar]:w-0.5 [&::-webkit-scrollbar-track]:bg-transparent [&::-webkit-scrollbar-thumb]:bg-muted [&::-webkit-scrollbar-thumb]:rounded-full">
          {/* Step Indicator */}
          <div className="flex items-center gap-2 mb-8 overflow-x-auto pb-2">
            {[1, 2, 3, 4, 5].map((s) => (
              <div key={s} className="flex items-center flex-shrink-0">
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
                    "ml-2 text-sm hidden sm:inline whitespace-nowrap",
                    step >= s ? "text-foreground" : "text-muted-foreground",
                  )}
                >
                  {s === 1 && "Upload"}
                  {s === 2 && "AI Summary"}
                  {s === 3 && "Findings"}
                  {s === 4 && "Checklist"}
                  {s === 5 && "Export"}
                </span>
                {s < 5 && <ChevronRight className="w-4 h-4 mx-3 text-muted-foreground" />}
              </div>
            ))}
          </div>

      {/* Step 1: Upload */}
      {step === 1 && (
        <div className="space-y-6">
          <Card className="bg-card">
            <CardHeader>
              <CardTitle className="text-card-foreground">Upload Zoning Documents</CardTitle>
            </CardHeader>
            <CardContent>
              <div
                className={cn(
                  "border-2 border-dashed rounded-xl p-12 text-center transition-colors",
                  isDragging
                    ? "border-bannett-navy bg-bannett-navy/5"
                    : "border-border hover:border-bannett-blue hover:bg-muted/60",
                )}
                onDrop={handleDrop}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
              >
                <Upload className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
                <p className="text-lg font-medium mb-2 text-card-foreground">
                  Drag and drop your zoning documents here
                </p>
                <p className="text-sm text-muted-foreground mb-4">
                  Supports PDF files - zoning ordinances, planning reports, etc.
                </p>
                <Button onClick={simulateUpload} className="bg-bannett-navy hover:bg-bannett-navy/90">
                  Browse Files
                </Button>
              </div>
            </CardContent>
          </Card>

          {uploadedDocs.length > 0 && (
            <Card className="bg-card">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-card-foreground">Uploaded Documents ({uploadedDocs.length})</CardTitle>
                  <Badge className="bg-success text-primary-foreground">Ready for Analysis</Badge>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {uploadedDocs.map((doc, i) => (
                    <div key={i} className="flex items-center gap-3 p-3 rounded-lg bg-muted/50">
                      <FileText className="w-5 h-5 text-bannett-navy" />
                      <span className="flex-1 text-sm text-card-foreground">{doc}</span>
                      <Badge variant="secondary">PDF</Badge>
                    </div>
                  ))}
                </div>
                <Button onClick={startAnalysis} className="w-full mt-4 bg-bannett-navy hover:bg-bannett-navy/90">
                  Analyze Documents
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </CardContent>
            </Card>
          )}
        </div>
      )}

      {/* Step 2: AI Summary */}
      {step === 2 && (
        <div className="space-y-6">
          {isAnalyzing && analysisProgress < 100 ? (
            <Card className="bg-card">
              <CardContent className="py-12">
                <div className="flex flex-col items-center justify-center">
                  <Loader2 className="w-12 h-12 animate-spin text-bannett-navy mb-4" />
                  <p className="text-lg font-medium mb-2 text-card-foreground">Analyzing Zoning Documents...</p>
                  <Progress value={analysisProgress} className="w-64 h-2" />
                  <p className="text-sm text-muted-foreground mt-2">{analysisProgress}% complete</p>
                </div>
              </CardContent>
            </Card>
          ) : (
            <>
              {/* Executive Summary */}
              <Card className="bg-card">
                <CardHeader>
                  <CardTitle className="text-card-foreground">Executive Summary</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground leading-relaxed">
                    The proposed Riverside Medical Center development is located in Zone C-3 (Commercial High-Intensity)
                    and requires conditional use approval for healthcare facilities exceeding 50,000 SF. The site meets
                    most zoning requirements with the exception of a minor setback encroachment on the east property
                    line. Key considerations include enhanced stormwater management requirements, ADA parking
                    compliance, and fire code provisions for buildings exceeding 75 feet in height. Four risk flags have
                    been identified requiring attention before permit approval.
                  </p>
                </CardContent>
              </Card>

              {/* Key Restrictions */}
              <Card className="bg-card">
                <CardHeader>
                  <CardTitle className="text-card-foreground">Key Restrictions</CardTitle>
                </CardHeader>
                <CardContent>
                  <table className="w-full">
                    <thead>
                      <tr className="border-b">
                        <th className="text-left py-2 text-sm font-medium text-muted-foreground">Requirement</th>
                        <th className="text-left py-2 text-sm font-medium text-muted-foreground">Value</th>
                        <th className="text-left py-2 text-sm font-medium text-muted-foreground">Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr className="border-b">
                        <td className="py-3 text-sm text-card-foreground">Maximum Height</td>
                        <td className="py-3 text-sm text-card-foreground">120 feet</td>
                        <td className="py-3">
                          <Badge className="bg-success text-primary-foreground">Compliant</Badge>
                        </td>
                      </tr>
                      <tr className="border-b">
                        <td className="py-3 text-sm text-card-foreground">Floor Area Ratio</td>
                        <td className="py-3 text-sm text-card-foreground">4.0 max</td>
                        <td className="py-3">
                          <Badge className="bg-success text-primary-foreground">Compliant</Badge>
                        </td>
                      </tr>
                      <tr className="border-b">
                        <td className="py-3 text-sm text-card-foreground">Lot Coverage</td>
                        <td className="py-3 text-sm text-card-foreground">75% max</td>
                        <td className="py-3">
                          <Badge className="bg-success text-primary-foreground">Compliant</Badge>
                        </td>
                      </tr>
                      <tr className="border-b">
                        <td className="py-3 text-sm text-card-foreground">Setback (East)</td>
                        <td className="py-3 text-sm text-card-foreground">15' required</td>
                        <td className="py-3">
                          <Badge variant="destructive">Violation</Badge>
                        </td>
                      </tr>
                      <tr>
                        <td className="py-3 text-sm text-card-foreground">Parking Ratio</td>
                        <td className="py-3 text-sm text-card-foreground">1:300 SF</td>
                        <td className="py-3">
                          <Badge className="bg-success text-primary-foreground">Compliant</Badge>
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </CardContent>
              </Card>

              {/* Risk Flags */}
              <Card className="bg-card">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-card-foreground">
                    <AlertTriangle className="w-5 h-5 text-warning" />
                    Risk Flags ({riskFlags.length})
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {riskFlags.map((flag) => (
                    <div
                      key={flag.id}
                      className={cn(
                        "p-4 rounded-lg cursor-pointer transition-colors",
                        flag.severity === "high"
                          ? "bg-destructive/10"
                          : flag.severity === "medium"
                            ? "bg-warning/10"
                            : "bg-muted/50",
                      )}
                      onClick={() => setExpandedFlag(expandedFlag === flag.id ? null : flag.id)}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <AlertCircle
                            className={cn(
                              "w-5 h-5",
                              flag.severity === "high"
                                ? "text-destructive"
                                : flag.severity === "medium"
                                  ? "text-warning"
                                  : "text-muted-foreground",
                            )}
                          />
                          <div>
                            <p className="font-medium text-card-foreground">{flag.title}</p>
                            <p className="text-sm text-muted-foreground">{flag.type}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <Badge
                            variant={
                              flag.severity === "high"
                                ? "destructive"
                                : flag.severity === "medium"
                                  ? "secondary"
                                  : "outline"
                            }
                          >
                            {flag.severity}
                          </Badge>
                          <ChevronDown
                            className={cn("w-4 h-4 transition-transform", expandedFlag === flag.id && "rotate-180")}
                          />
                        </div>
                      </div>

                      {expandedFlag === flag.id && (
                        <div className="mt-4 pt-4 border-t border-border space-y-3">
                          <div>
                            <p className="text-sm font-medium text-card-foreground">Issue</p>
                            <p className="text-sm text-muted-foreground">{flag.description}</p>
                          </div>
                          <div>
                            <p className="text-sm font-medium text-card-foreground">Recommendation</p>
                            <p className="text-sm text-muted-foreground">{flag.recommendation}</p>
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </CardContent>
              </Card>

              <div className="flex justify-end">
                <Button onClick={() => setStep(3)} className="bg-bannett-navy hover:bg-bannett-navy/90">
                  View Detailed Findings
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </div>
            </>
          )}
        </div>
      )}

      {/* Step 3: Detailed Findings */}
      {step === 3 && (
        <div className="space-y-6">
          <Card className="bg-card">
            <CardHeader>
              <CardTitle className="text-card-foreground">Detailed Findings</CardTitle>
            </CardHeader>
            <CardContent>
              <Accordion type="single" collapsible className="w-full">
                {detailedFindings.map((finding, i) => (
                  <AccordionItem key={i} value={`item-${i}`}>
                    <AccordionTrigger className="text-left">
                      <div className="flex items-center gap-2">
                        <Info className="w-4 h-4 text-bannett-blue" />
                        {finding.title}
                      </div>
                    </AccordionTrigger>
                    <AccordionContent>
                      <p className="text-muted-foreground leading-relaxed pl-6">{finding.content}</p>
                    </AccordionContent>
                  </AccordionItem>
                ))}
              </Accordion>
            </CardContent>
          </Card>

          <div className="flex justify-end">
            <Button onClick={() => setStep(4)} className="bg-bannett-navy hover:bg-bannett-navy/90">
              Generate Checklist
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          </div>
        </div>
      )}

      {/* Step 4: Checklist */}
      {step === 4 && (
        <div className="space-y-6">
          <Card className="bg-card">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-card-foreground">Preconstruction Checklist</CardTitle>
                <div className="flex items-center gap-2">
                  <Badge variant="outline">
                    {checklist.filter((i) => i.completed).length}/{checklist.length} Complete
                  </Badge>
                  <Button variant="outline" size="sm" onClick={() => setAddingItem(true)}>
                    <Plus className="w-4 h-4 mr-1" />
                    Add Item
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {checklist.map((item) => (
                  <div
                    key={item.id}
                    className={cn(
                      "flex items-center gap-3 p-3 rounded-lg transition-colors",
                      item.completed ? "bg-success/10" : "bg-muted/50",
                    )}
                  >
                    <Checkbox checked={item.completed} onCheckedChange={() => toggleChecklistItem(item.id)} />
                    {editingItem === item.id ? (
                      <Input
                        defaultValue={item.text}
                        className="flex-1"
                        onBlur={(e) => updateChecklistItem(item.id, e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === "Enter") {
                            updateChecklistItem(item.id, e.currentTarget.value)
                          }
                        }}
                        autoFocus
                      />
                    ) : (
                      <span className={cn("flex-1 text-sm", item.completed && "line-through text-muted-foreground")}>
                        {item.text}
                      </span>
                    )}
                    <div className="flex items-center gap-1">
                      <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => setEditingItem(item.id)}>
                        <Edit3 className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-destructive"
                        onClick={() => deleteChecklistItem(item.id)}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                ))}

                {addingItem && (
                  <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/50">
                    <Checkbox disabled />
                    <Input
                      value={newItemText}
                      onChange={(e) => setNewItemText(e.target.value)}
                      placeholder="Enter checklist item..."
                      className="flex-1"
                      onKeyDown={(e) => {
                        if (e.key === "Enter") addChecklistItem()
                        if (e.key === "Escape") setAddingItem(false)
                      }}
                      autoFocus
                    />
                    <Button size="sm" onClick={addChecklistItem}>
                      Add
                    </Button>
                    <Button size="sm" variant="ghost" onClick={() => setAddingItem(false)}>
                      Cancel
                    </Button>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          <div className="flex justify-end gap-3">
            <Button variant="outline" onClick={exportChecklist}>
              <Download className="w-4 h-4 mr-2" />
              Export Checklist
            </Button>
            <Button onClick={() => setStep(5)} className="bg-bannett-navy hover:bg-bannett-navy/90">
              Continue to Export
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          </div>
        </div>
      )}

      {/* Step 5: Export/Save */}
      {step === 5 && (
        <Card className="bg-card">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-card-foreground">
              <CheckCircle2 className="w-6 h-6 text-success" />
              Review Complete
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <p className="text-muted-foreground">
              Your zoning and preconstruction review has been completed. You can now export the findings or save them
              directly to your Procore project documents.
            </p>

            <div className="grid grid-cols-2 gap-4">
              <div className="p-4 rounded-lg bg-muted/50 text-center">
                <p className="text-2xl font-semibold text-bannett-navy">4</p>
                <p className="text-sm text-muted-foreground">Risk Flags Identified</p>
              </div>
              <div className="p-4 rounded-lg bg-muted/50 text-center">
                <p className="text-2xl font-semibold text-success">
                  {checklist.filter((i) => i.completed).length}/{checklist.length}
                </p>
                <p className="text-sm text-muted-foreground">Checklist Complete</p>
              </div>
            </div>

            <div className="flex flex-col gap-3">
              <Button onClick={exportChecklist} variant="outline" className="w-full bg-transparent">
                <Download className="w-4 h-4 mr-2" />
                Export as PDF
              </Button>
              <Button onClick={saveToProcore} className="w-full bg-bannett-navy hover:bg-bannett-navy/90">
                <Save className="w-4 h-4 mr-2" />
                Save to Procore Documents
              </Button>
            </div>

            <Button
              variant="ghost"
              className="w-full"
              onClick={() => {
                setStep(1)
                setUploadedDocs([])
                setAnalysisProgress(0)
                setChecklist(initialChecklist)
              }}
            >
              Start New Review
            </Button>
          </CardContent>
        </Card>
      )}
        </CardContent>
      </Card>
    </div>
  )
}
