"use client"

import { useState } from "react"
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

interface SubcontractorMatchingProps {
  selectedProject: string
  onLogout?: () => void
}

type Step = 1 | 2 | 3

const subcontractors = [
  {
    id: 1,
    name: "Summit Mechanical Solutions",
    trade: "HVAC",
    distance: "12 miles",
    performance: 94,
    capacity: "High",
    pricing: "Mid-range",
    availability: "Available",
    certifications: ["OSHA 30", "EPA 608", "NATE Certified"],
    pastProjects: ["City Hospital HVAC Retrofit", "Tech Park Building C", "Riverside Commons"],
    strengths: [
      "Excellent track record with healthcare facilities",
      "Strong safety record",
      "Responsive communication",
    ],
    weaknesses: ["Higher than average change order rate", "Limited night shift availability"],
    riskFactors: ["Current workload at 75% capacity"],
    confidence: 94,
  },
  {
    id: 2,
    name: "ElectroPro Commercial",
    trade: "Electrical",
    distance: "8 miles",
    performance: 91,
    capacity: "Medium",
    pricing: "Competitive",
    availability: "Available",
    certifications: ["OSHA 30", "Master Electrician", "LEED AP"],
    pastProjects: ["Downtown Office Tower", "Retail Plaza Phase 2", "Industrial Park Expansion"],
    strengths: ["Fast turnaround on RFIs", "Excellent quality control", "Strong BIM capabilities"],
    weaknesses: ["Premium pricing for expedited work"],
    riskFactors: ["Key project manager recently departed"],
    confidence: 91,
  },
  {
    id: 3,
    name: "Cascade Plumbing & Fire",
    trade: "Plumbing",
    distance: "15 miles",
    performance: 88,
    capacity: "High",
    pricing: "Competitive",
    availability: "Limited",
    certifications: ["OSHA 30", "Master Plumber", "Backflow Certified"],
    pastProjects: ["Medical Center West Wing", "Luxury Condos Phase 1", "University Science Building"],
    strengths: ["Healthcare experience", "24/7 emergency response", "In-house fabrication"],
    weaknesses: ["Limited availability until Q2", "Higher mobilization costs"],
    riskFactors: ["Currently managing 5 active projects"],
    confidence: 88,
  },
  {
    id: 4,
    name: "Atlas Structural Steel",
    trade: "Steel",
    distance: "22 miles",
    performance: 92,
    capacity: "Medium",
    pricing: "Premium",
    availability: "Available",
    certifications: ["AISC Certified", "OSHA 30", "AWS D1.1"],
    pastProjects: ["Airport Terminal Expansion", "Sports Arena", "High-Rise Tower A"],
    strengths: ["Complex structural experience", "Excellent detailing", "On-time delivery record"],
    weaknesses: ["Premium pricing", "Long lead times for custom work"],
    riskFactors: ["Supply chain dependencies"],
    confidence: 92,
  },
  {
    id: 5,
    name: "Foundation Masters Inc",
    trade: "Concrete",
    distance: "5 miles",
    performance: 89,
    capacity: "High",
    pricing: "Mid-range",
    availability: "Available",
    certifications: ["ACI Certified", "OSHA 30", "Post-Tension Certified"],
    pastProjects: ["Parking Structure D", "Warehouse District", "Mixed-Use Development"],
    strengths: ["Local presence", "Quick mobilization", "Reliable scheduling"],
    weaknesses: ["Limited decorative concrete experience"],
    riskFactors: ["Seasonal workforce fluctuation"],
    confidence: 89,
  },
]

export function SubcontractorMatching({ selectedProject, onLogout }: SubcontractorMatchingProps) {
  const [step, setStep] = useState<Step>(1)
  const [isGenerating, setIsGenerating] = useState(false)
  const [selectedSubs, setSelectedSubs] = useState<number[]>([])
  const [reasoningModal, setReasoningModal] = useState<(typeof subcontractors)[0] | null>(null)
  const [notes, setNotes] = useState("")
  const [formData, setFormData] = useState({
    location: "Portland, OR",
    trade: "",
    budgetMin: "500000",
    budgetMax: "2000000",
    timeline: "6 months",
    requirements: "Healthcare compliance required",
  })

  const generateRecommendations = () => {
    setIsGenerating(true)
    setTimeout(() => {
      setIsGenerating(false)
      setStep(2)
    }, 2000)
  }

  const toggleSubSelection = (id: number) => {
    setSelectedSubs((prev) =>
      prev.includes(id) ? prev.filter((s) => s !== id) : prev.length < 3 ? [...prev, id] : prev,
    )
  }

  const pushToProcore = () => {
    toast.success("Subcontractors pushed to Procore Bid Package", {
      description: "3 subcontractors have been added to the MEP bid package.",
    })
    setStep(1)
    setSelectedSubs([])
    setNotes("")
  }

  return (
    <div className="pt-0 pr-0 pb-1 pl-0 space-y-2 h-full flex flex-col min-h-0">
      {/* Header */}
      <div className="flex items-center justify-between px-6">
        <div>
          <h1 className="text-2xl font-semibold text-foreground">Subcontractor Matching</h1>
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
            <Badge className="bg-bannett-navy">{selectedSubs.length}/3 Selected</Badge>
          </div>

          <div className="space-y-3">
            {subcontractors.map((sub, index) => (
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
            ))}
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

                  {/* Contact Info */}
                  <div className="flex gap-4">
                    <Button variant="outline" size="sm">
                      <Phone className="w-4 h-4 mr-2" />
                      (503) 555-0123
                    </Button>
                    <Button variant="outline" size="sm">
                      <Mail className="w-4 h-4 mr-2" />
                      Contact
                    </Button>
                    <Button variant="outline" size="sm">
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
                    <h4 className="font-medium mb-2 text-card-foreground">Relevant Past Projects</h4>
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
                      Risk Factors
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
                {subcontractors
                  .filter((s) => selectedSubs.includes(s.id))
                  .map((sub) => (
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
                  ))}
              </div>
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

            <Button onClick={pushToProcore} className="w-full bg-bannett-navy hover:bg-bannett-navy/90">
              Push to Procore Bid Package
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          </CardContent>
        </Card>
      )}
        </CardContent>
      </Card>
    </div>
  )
}
