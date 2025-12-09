"use client"

import { useState } from "react"
import { Sidebar } from "@/components/sidebar"
import { Dashboard } from "@/components/dashboard"
import { AIEstimator } from "@/components/ai-estimator"
import { SubcontractorMatching } from "@/components/subcontractor-matching"
import { ZoningReview } from "@/components/zoning-review"
import { ProcoreSync } from "@/components/procore-sync"
import { SettingsView } from "@/components/settings-view"
import { HelpSupport } from "@/components/help-support"
import { Toaster } from "@/components/ui/sonner"
import { Card, CardContent } from "@/components/ui/card"

export type ModuleType = "dashboard" | "estimator" | "subcontractor" | "zoning" | "procore" | "settings" | "help"

export default function Home() {
  const [activeModule, setActiveModule] = useState<ModuleType>("dashboard")
  const [selectedProject, setSelectedProject] = useState("Riverside Medical Center")

  return (
    <div className="flex h-screen bg-sidebar">
      <Sidebar
        activeModule={activeModule}
        setActiveModule={setActiveModule}
        selectedProject={selectedProject}
        setSelectedProject={setSelectedProject}
      />
      <main className="flex-1 h-screen bg-sidebar min-h-0 overflow-hidden">
        <div className="pl-0 pr-2 pt-3 pb-1 h-full bg-sidebar min-h-0">
          {activeModule === "dashboard" ? (
            <div className="h-full min-h-0">
              <Dashboard selectedProject={selectedProject} setActiveModule={setActiveModule} />
            </div>
          ) : (
            <div className="h-full min-h-0 overflow-hidden">
              {activeModule === "estimator" && <AIEstimator selectedProject={selectedProject} />}
              {activeModule === "subcontractor" && <SubcontractorMatching selectedProject={selectedProject} />}
              {activeModule === "zoning" && <ZoningReview selectedProject={selectedProject} />}
              {activeModule === "procore" && <ProcoreSync selectedProject={selectedProject} />}
              {activeModule === "settings" && <SettingsView />}
              {activeModule === "help" && <HelpSupport />}
            </div>
          )}
        </div>
      </main>
      <Toaster />
    </div>
  )
}
