"use client"

import { useEffect, useState } from "react"
import { Sidebar } from "@/components/sidebar"
import { Dashboard } from "@/components/dashboard"
import { AIEstimator } from "@/components/ai-estimator"
import { SubcontractorMatching } from "@/components/subcontractor-matching"
import { ZoningReview } from "@/components/zoning-review"
import { ProcoreSync } from "@/components/procore-sync"
import { SettingsView } from "@/components/settings-view"
import { HelpSupport } from "@/components/help-support"
import { Login } from "@/components/login"
import { Toaster } from "@/components/ui/sonner"

export type ModuleType = "dashboard" | "estimator" | "subcontractor" | "zoning" | "procore" | "settings" | "help"

export default function Home() {
  const [activeModule, setActiveModule] = useState<ModuleType>("dashboard")
  const [selectedProject, setSelectedProject] = useState("Riverside Medical Center")
  const [isAuthenticated, setIsAuthenticated] = useState(false)

  useEffect(() => {
    if (typeof window !== "undefined") {
      const stored = window.localStorage.getItem("bannett-precon-auth")
      if (stored === "true") {
        setIsAuthenticated(true)
      }
    }
  }, [])

  const handleLogin = (email: string, password: string) => {
    // Accept any non-empty credentials for mock sign-in
    if (email.trim() && password.trim()) {
      setIsAuthenticated(true)
      if (typeof window !== "undefined") {
        window.localStorage.setItem("bannett-precon-auth", "true")
      }
      return { success: true }
    }
    return { success: false, message: "Enter an email and password to continue." }
  }

  const handleLogout = () => {
    setIsAuthenticated(false)
    if (typeof window !== "undefined") {
      window.localStorage.removeItem("bannett-precon-auth")
    }
  }

  if (!isAuthenticated) {
    return <Login onLogin={handleLogin} />
  }

  return (
    <div className="flex h-screen bg-sidebar">
      <Sidebar
        activeModule={activeModule}
        setActiveModule={setActiveModule}
        selectedProject={selectedProject}
        setSelectedProject={setSelectedProject}
        onLogout={handleLogout}
      />
      <main className="flex-1 h-screen bg-sidebar min-h-0 overflow-hidden">
        <div className="pl-0 pr-2 pt-3 pb-1 h-full bg-sidebar min-h-0">
          {activeModule === "dashboard" ? (
            <div className="h-full min-h-0">
              <Dashboard selectedProject={selectedProject} setActiveModule={setActiveModule} onLogout={handleLogout} />
            </div>
          ) : (
            <div className="h-full min-h-0 overflow-hidden">
              {activeModule === "estimator" && <AIEstimator selectedProject={selectedProject} onLogout={handleLogout} />}
              {activeModule === "subcontractor" && (
                <SubcontractorMatching selectedProject={selectedProject} onLogout={handleLogout} />
              )}
              {activeModule === "zoning" && <ZoningReview selectedProject={selectedProject} onLogout={handleLogout} />}
              {activeModule === "procore" && <ProcoreSync selectedProject={selectedProject} onLogout={handleLogout} />}
              {activeModule === "settings" && <SettingsView onLogout={handleLogout} />}
              {activeModule === "help" && <HelpSupport onLogout={handleLogout} />}
            </div>
          )}
        </div>
      </main>
      <Toaster />
    </div>
  )
}
