"use client"

import { useState } from "react"
import {
  RefreshCw,
  Check,
  AlertCircle,
  ChevronRight,
  ChevronDown,
  Link2,
  FileText,
  Users,
  Calculator,
  Edit3,
  RotateCcw,
  Loader2,
  Info,
  Bell,
  User,
} from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
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

interface ProcoreSyncProps {
  selectedProject: string
  onLogout?: () => void
  setActiveModule?: (module: ModuleType) => void
}

const fieldMappings = [
  { aiField: "CSI Category", procoreField: "Cost Code", status: "mapped" },
  { aiField: "Line Item Description", procoreField: "Description", status: "mapped" },
  { aiField: "Quantity", procoreField: "Quantity", status: "mapped" },
  { aiField: "Unit Cost", procoreField: "Unit Price", status: "mapped" },
  { aiField: "Subcontractor Name", procoreField: "Directory Entry", status: "mapped" },
  { aiField: "Drawing Metadata", procoreField: "Document Description", status: "review" },
  { aiField: "Zoning Notes", procoreField: "Project Notes", status: "unmapped" },
]

const syncLogs = [
  {
    id: 1,
    action: "Estimate pushed to Planroom",
    timestamp: "Dec 9, 2025 at 2:34 PM",
    status: "success",
    details: "Phase 1 Foundation estimate ($1,245,680) synced to Budget module",
  },
  {
    id: 2,
    action: "3 subcontractors added to Bid Package",
    timestamp: "Dec 9, 2025 at 11:22 AM",
    status: "success",
    details: "Summit Mechanical, ElectroPro Commercial, Cascade Plumbing added to MEP package",
  },
  {
    id: 3,
    action: "Zoning summary exported to Documents",
    timestamp: "Dec 8, 2025 at 4:15 PM",
    status: "success",
    details: "Zoning review PDF uploaded to Project Documents > Preconstruction",
  },
  {
    id: 4,
    action: "Drawing set sync attempted",
    timestamp: "Dec 8, 2025 at 10:45 AM",
    status: "warning",
    details: "12 sheets uploaded, 2 sheets failed validation (file size exceeded)",
  },
  {
    id: 5,
    action: "Cost code mapping updated",
    timestamp: "Dec 7, 2025 at 3:30 PM",
    status: "success",
    details: "4 new cost code mappings added for electrical division",
  },
  {
    id: 6,
    action: "Subcontractor directory sync",
    timestamp: "Dec 7, 2025 at 9:00 AM",
    status: "error",
    details: "Failed to sync 1 vendor - duplicate entry detected",
  },
]

export function ProcoreSync({ selectedProject, onLogout, setActiveModule }: ProcoreSyncProps) {
  const [isConnected, setIsConnected] = useState(true)
  const [isSyncing, setIsSyncing] = useState(false)
  const [mappings, setMappings] = useState(fieldMappings)
  const [editMappingModal, setEditMappingModal] = useState<(typeof fieldMappings)[0] | null>(null)
  const [expandedLog, setExpandedLog] = useState<number | null>(null)
  const [infoModalOpen, setInfoModalOpen] = useState(false)

  const handleReauthorize = () => {
    setIsSyncing(true)
    setTimeout(() => {
      setIsSyncing(false)
      setIsConnected(true)
      toast.success("Connection reauthorized successfully")
    }, 2000)
  }

  const handleSync = () => {
    setIsSyncing(true)
    setTimeout(() => {
      setIsSyncing(false)
      toast.success("Sync completed successfully", {
        description: "All data has been synchronized with Procore.",
      })
    }, 3000)
  }

  const resetMappings = () => {
    setMappings(fieldMappings)
    toast.success("Field mappings reset to defaults")
  }

  return (
    <div className="pt-0 pr-0 pb-1 pl-0 space-y-2 h-full flex flex-col min-h-0">
      {/* Header */}
      <div className="flex items-center justify-between px-6">
        <div>
          <h1 className="text-2xl font-semibold text-foreground">Procore Sync</h1>
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
                <span className="text-sm font-medium">Planroom sync complete</span>
                <span className="text-xs text-muted-foreground">Foundation estimate pushed</span>
              </DropdownMenuItem>
              <DropdownMenuItem className="flex flex-col items-start gap-1">
                <span className="text-sm font-medium">Bid package updated</span>
                <span className="text-xs text-muted-foreground">3 subs added to MEP package</span>
              </DropdownMenuItem>
              <DropdownMenuItem className="flex flex-col items-start gap-1">
                <span className="text-sm font-medium">Field mapping pending</span>
                <span className="text-xs text-muted-foreground">Zoning notes need mapping</span>
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
      <Tabs defaultValue="status" className="space-y-6">
        <TabsList>
          <TabsTrigger value="status">Connection Status</TabsTrigger>
          <TabsTrigger value="mapping">Field Mapping</TabsTrigger>
          <TabsTrigger value="logs">Sync Logs</TabsTrigger>
        </TabsList>

        {/* Connection Status Tab */}
        <TabsContent value="status" className="space-y-6">
          <Card className="bg-card">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-card-foreground">Connection Status</CardTitle>
                <Button variant="ghost" size="icon" onClick={() => setInfoModalOpen(true)}>
                  <Info className="w-4 h-4" />
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center justify-between p-4 rounded-lg bg-muted/50">
                <div className="flex items-center gap-3">
                  <div
                    className={cn("w-3 h-3 rounded-full", isConnected ? "bg-success animate-pulse" : "bg-destructive")}
                  />
                  <div>
                    <p className="font-medium text-card-foreground">
                      {isConnected ? "Connected to Procore" : "Disconnected"}
                    </p>
                    <p className="text-sm text-muted-foreground">Last sync: Dec 9, 2025 at 2:34 PM</p>
                  </div>
                </div>
                <Badge className={isConnected ? "bg-success text-primary-foreground" : "bg-destructive"}>
                  {isConnected ? "Active" : "Inactive"}
                </Badge>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="p-4 rounded-lg bg-muted/50">
                  <div className="flex items-center gap-2 mb-2">
                    <FileText className="w-4 h-4 text-bannett-navy" />
                    <span className="text-sm font-medium text-card-foreground">Documents</span>
                  </div>
                  <p className="text-2xl font-semibold text-card-foreground">24</p>
                  <p className="text-xs text-muted-foreground">synced this week</p>
                </div>
                <div className="p-4 rounded-lg bg-muted/50">
                  <div className="flex items-center gap-2 mb-2">
                    <Calculator className="w-4 h-4 text-bannett-blue" />
                    <span className="text-sm font-medium text-card-foreground">Estimates</span>
                  </div>
                  <p className="text-2xl font-semibold text-card-foreground">3</p>
                  <p className="text-xs text-muted-foreground">pushed to budget</p>
                </div>
                <div className="p-4 rounded-lg bg-muted/50">
                  <div className="flex items-center gap-2 mb-2">
                    <Users className="w-4 h-4 text-bannett-light" />
                    <span className="text-sm font-medium text-card-foreground">Vendors</span>
                  </div>
                  <p className="text-2xl font-semibold text-card-foreground">12</p>
                  <p className="text-xs text-muted-foreground">in directory</p>
                </div>
              </div>

              <div className="flex gap-3">
                <Button onClick={handleSync} className="bg-bannett-navy hover:bg-bannett-navy/90" disabled={isSyncing}>
                  {isSyncing ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Syncing...
                    </>
                  ) : (
                    <>
                      <RefreshCw className="w-4 h-4 mr-2" />
                      Sync Now
                    </>
                  )}
                </Button>
                <Button variant="outline" onClick={handleReauthorize} disabled={isSyncing}>
                  <Link2 className="w-4 h-4 mr-2" />
                  Reauthorize Connection
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Info Modal */}
          <Dialog open={infoModalOpen} onOpenChange={setInfoModalOpen}>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>About Procore Sync</DialogTitle>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <p className="text-muted-foreground">
                  The Procore Sync layer connects the Preconstruction AI Tool with your Procore project environment.
                  This enables seamless data transfer between systems.
                </p>
                <div className="space-y-2">
                  <h4 className="font-medium text-card-foreground">What gets synced:</h4>
                  <ul className="space-y-1 text-sm text-muted-foreground">
                    <li className="flex items-center gap-2">
                      <Check className="w-4 h-4 text-success" />
                      Estimates to Budget module
                    </li>
                    <li className="flex items-center gap-2">
                      <Check className="w-4 h-4 text-success" />
                      Subcontractors to Directory & Bid Packages
                    </li>
                    <li className="flex items-center gap-2">
                      <Check className="w-4 h-4 text-success" />
                      Documents to Project Documents
                    </li>
                    <li className="flex items-center gap-2">
                      <Check className="w-4 h-4 text-success" />
                      Drawings to Planroom
                    </li>
                  </ul>
                </div>
              </div>
              <DialogFooter>
                <Button onClick={() => setInfoModalOpen(false)}>Close</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </TabsContent>

        {/* Field Mapping Tab */}
        <TabsContent value="mapping" className="space-y-6">
          <Card className="bg-card">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-card-foreground">Field Mapping</CardTitle>
                <Button variant="outline" size="sm" onClick={resetMappings}>
                  <RotateCcw className="w-4 h-4 mr-2" />
                  Reset to Defaults
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground mb-4">
                Configure how data from the Preconstruction AI Tool maps to Procore fields.
              </p>

              <div className="border rounded-lg overflow-hidden">
                <table className="w-full">
                  <thead className="bg-muted/50">
                    <tr>
                      <th className="text-left p-3 text-sm font-medium text-muted-foreground">AI Tool Field</th>
                      <th className="text-center p-3 text-sm font-medium text-muted-foreground"></th>
                      <th className="text-left p-3 text-sm font-medium text-muted-foreground">Procore Field</th>
                      <th className="text-center p-3 text-sm font-medium text-muted-foreground">Status</th>
                      <th className="w-20 p-3"></th>
                    </tr>
                  </thead>
                  <tbody>
                    {mappings.map((mapping, i) => (
                      <tr key={i} className="border-t">
                        <td className="p-3 text-sm text-card-foreground">{mapping.aiField}</td>
                        <td className="p-3 text-center">
                          <ChevronRight className="w-4 h-4 text-muted-foreground inline" />
                        </td>
                        <td className="p-3 text-sm text-card-foreground">{mapping.procoreField}</td>
                        <td className="p-3 text-center">
                          <Badge
                            variant={
                              mapping.status === "mapped"
                                ? "default"
                                : mapping.status === "review"
                                  ? "secondary"
                                  : "outline"
                            }
                            className={mapping.status === "mapped" ? "bg-success" : ""}
                          >
                            {mapping.status === "mapped" && <Check className="w-3 h-3 mr-1" />}
                            {mapping.status === "review" && <AlertCircle className="w-3 h-3 mr-1" />}
                            {mapping.status}
                          </Badge>
                        </td>
                        <td className="p-3">
                          <Button variant="ghost" size="sm" onClick={() => setEditMappingModal(mapping)}>
                            <Edit3 className="w-4 h-4" />
                          </Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>

          {/* Edit Mapping Modal */}
          <Dialog open={!!editMappingModal} onOpenChange={() => setEditMappingModal(null)}>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Edit Field Mapping</DialogTitle>
              </DialogHeader>
              {editMappingModal && (
                <div className="space-y-4 py-4">
                  <div className="space-y-2">
                    <Label>AI Tool Field</Label>
                    <Input value={editMappingModal.aiField} disabled />
                  </div>
                  <div className="space-y-2">
                    <Label>Procore Field</Label>
                    <Select defaultValue={editMappingModal.procoreField}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Cost Code">Cost Code</SelectItem>
                        <SelectItem value="Description">Description</SelectItem>
                        <SelectItem value="Quantity">Quantity</SelectItem>
                        <SelectItem value="Unit Price">Unit Price</SelectItem>
                        <SelectItem value="Directory Entry">Directory Entry</SelectItem>
                        <SelectItem value="Document Description">Document Description</SelectItem>
                        <SelectItem value="Project Notes">Project Notes</SelectItem>
                        <SelectItem value="Custom Field 1">Custom Field 1</SelectItem>
                        <SelectItem value="Custom Field 2">Custom Field 2</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              )}
              <DialogFooter>
                <Button variant="outline" onClick={() => setEditMappingModal(null)}>
                  Cancel
                </Button>
                <Button
                  className="bg-bannett-navy hover:bg-bannett-navy/90"
                  onClick={() => {
                    setEditMappingModal(null)
                    toast.success("Mapping updated successfully")
                  }}
                >
                  Save Mapping
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </TabsContent>

        {/* Sync Logs Tab */}
        <TabsContent value="logs" className="space-y-6">
          <Card className="bg-card">
            <CardHeader>
              <CardTitle className="text-card-foreground">Sync Logs</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {syncLogs.map((log) => (
                  <div
                    key={log.id}
                    className={cn(
                      "p-4 rounded-lg cursor-pointer transition-colors",
                      log.status === "success"
                        ? "bg-muted/50 hover:bg-muted"
                        : log.status === "warning"
                          ? "bg-warning/10 hover:bg-warning/20"
                          : "bg-destructive/10 hover:bg-destructive/20",
                    )}
                    onClick={() => setExpandedLog(expandedLog === log.id ? null : log.id)}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        {log.status === "success" && <Check className="w-5 h-5 text-success" />}
                        {log.status === "warning" && <AlertCircle className="w-5 h-5 text-warning" />}
                        {log.status === "error" && <AlertCircle className="w-5 h-5 text-destructive" />}
                        <div>
                          <p className="font-medium text-card-foreground">{log.action}</p>
                          <p className="text-sm text-muted-foreground">{log.timestamp}</p>
                        </div>
                      </div>
                      <ChevronDown
                        className={cn(
                          "w-4 h-4 text-muted-foreground transition-transform",
                          expandedLog === log.id && "rotate-180",
                        )}
                      />
                    </div>

                    {expandedLog === log.id && (
                      <div className="mt-3 pt-3 border-t border-border">
                        <p className="text-sm text-muted-foreground">{log.details}</p>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
        </CardContent>
      </Card>
    </div>
  )
}
