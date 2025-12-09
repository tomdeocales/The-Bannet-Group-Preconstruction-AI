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

export type ModuleType = "dashboard" | "estimator" | "subcontractor" | "zoning" | "procore" | "settings" | "help"

export default function Home() {
  const [activeModule, setActiveModule] = useState<ModuleType>("dashboard")
  const [selectedProject, setSelectedProject] = useState("Riverside Medical Center")

  return (
    <div className="flex h-screen bg-background">
      <Sidebar
        activeModule={activeModule}
        setActiveModule={setActiveModule}
        selectedProject={selectedProject}
        setSelectedProject={setSelectedProject}
      />
      <main className="flex-1 overflow-auto">
        {activeModule === "dashboard" && (
          <Dashboard selectedProject={selectedProject} setActiveModule={setActiveModule} />
        )}
        {activeModule === "estimator" && <AIEstimator selectedProject={selectedProject} />}
        {activeModule === "subcontractor" && <SubcontractorMatching selectedProject={selectedProject} />}
        {activeModule === "zoning" && <ZoningReview selectedProject={selectedProject} />}
        {activeModule === "procore" && <ProcoreSync selectedProject={selectedProject} />}
        {activeModule === "settings" && <SettingsView />}
        {activeModule === "help" && <HelpSupport />}
      </main>
      <Toaster />
    </div>
  )
}
