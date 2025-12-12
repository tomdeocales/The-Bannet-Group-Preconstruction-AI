"use client"

import { useEffect, useMemo, useState } from "react"
import {
  Building2,
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
import { getBidPackages, getVendors, postAddBidders } from "@/lib/procore/client"
import type { ProcoreBidPackage, ProcoreProject, ProcoreVendor } from "@/lib/procore/types"

interface SubcontractorMatchingProps {
  selectedProject: ProcoreProject
  onLogout?: () => void
  setActiveModule?: (module: ModuleType) => void
}

type Step = 1 | 2 | 3

type SortMode = "Recommended" | "Distance" | "Capacity" | "Price"

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
  const [step, setStep] = useState<Step>(1)
  const [isGenerating, setIsGenerating] = useState(false)
  const [isPushing, setIsPushing] = useState(false)
  const [selectedSubs, setSelectedSubs] = useState<number[]>([])
  const [sortMode, setSortMode] = useState<SortMode>("Recommended")
  const [vendors, setVendors] = useState<ProcoreVendor[]>([])
  const [bidPackages, setBidPackages] = useState<ProcoreBidPackage[]>([])
  const [bidPackagesLoading, setBidPackagesLoading] = useState(false)
  const [selectedBidPackageId, setSelectedBidPackageId] = useState<number | null>(null)
  const [reasoningModal, setReasoningModal] = useState<VendorRecommendation | null>(null)
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
    setSelectedSubs([])
    setNotes("")
    setReasoningModal(null)
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
                      onClick={() =>
                        toast.success("Opening in Procore", {
                          description: `Launching ${reasoningModal.name} in Directory.`,
                        })
                      }
                    >
                      <ExternalLink className="w-4 h-4 mr-2" />
                      View in Procore
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
        </CardContent>
      </Card>
    </div>
  )
}
