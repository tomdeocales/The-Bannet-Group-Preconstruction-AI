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
import { getProjects } from "@/lib/procore/client"
import type { ProcoreProject } from "@/lib/procore/types"

export type ModuleType = "dashboard" | "estimator" | "subcontractor" | "zoning" | "procore" | "settings" | "help"

const DEFAULT_PROJECT: ProcoreProject = { id: 124512, name: "Riverside Medical Center", display_name: "Riverside Medical Center" }

export default function Home() {
  const [activeModule, setActiveModule] = useState<ModuleType>("dashboard")
  const [selectedProject, setSelectedProject] = useState<ProcoreProject>(DEFAULT_PROJECT)
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [projects, setProjects] = useState<ProcoreProject[]>([])
  const [projectsLoading, setProjectsLoading] = useState(false)
  const [procoreConnected, setProcoreConnected] = useState(true)

  useEffect(() => {
    if (typeof window !== "undefined") {
      const stored = window.localStorage.getItem("bannett-precon-auth")
      if (stored === "true") {
        setIsAuthenticated(true)
      }
    }
  }, [])

  useEffect(() => {
    if (!isAuthenticated) return

    let preferredProjectId = DEFAULT_PROJECT.id

    const storedProject = typeof window !== "undefined" ? window.localStorage.getItem("bannett-selected-project") : null
    if (storedProject) {
      try {
        const parsed = JSON.parse(storedProject) as { id?: number; name?: string }
        if (typeof parsed.id === "number" && parsed.id > 0) {
          preferredProjectId = parsed.id
          setSelectedProject({ id: parsed.id, name: parsed.name ?? "Project" })
        }
      } catch {
        // ignore
      }
    }

    let cancelled = false
    setProjectsLoading(true)
    getProjects({ page: 1, per_page: 50, view: "normal" })
      .then((res) => {
        if (cancelled) return
        setProcoreConnected(res.connected)
        setProjects(res.items)

        const match = res.items.find((p) => p.id === preferredProjectId) ?? res.items[0]
        if (match) {
          setSelectedProject(match)
          if (typeof window !== "undefined") {
            window.localStorage.setItem("bannett-selected-project", JSON.stringify({ id: match.id, name: match.name }))
          }
        }
      })
      .catch(() => {
        if (cancelled) return
        setProjects([])
        setProcoreConnected(false)
      })
      .finally(() => {
        if (cancelled) return
        setProjectsLoading(false)
      })

    return () => {
      cancelled = true
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isAuthenticated])

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

  const handleSelectProject = (project: ProcoreProject) => {
    setSelectedProject(project)
    if (typeof window !== "undefined") {
      window.localStorage.setItem("bannett-selected-project", JSON.stringify({ id: project.id, name: project.name }))
    }
  }

  return (
    <div className="flex h-screen bg-sidebar">
      <Sidebar
        activeModule={activeModule}
        setActiveModule={setActiveModule}
        selectedProject={selectedProject}
        setSelectedProject={handleSelectProject}
        projects={projects}
        projectsLoading={projectsLoading}
        procoreConnected={procoreConnected}
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
              {activeModule === "estimator" && (
                <AIEstimator
                  selectedProject={selectedProject}
                  onLogout={handleLogout}
                  setActiveModule={setActiveModule}
                />
              )}
              {activeModule === "subcontractor" && (
                <SubcontractorMatching
                  selectedProject={selectedProject}
                  onLogout={handleLogout}
                  setActiveModule={setActiveModule}
                />
              )}
              {activeModule === "zoning" && (
                <ZoningReview
                  selectedProject={selectedProject}
                  onLogout={handleLogout}
                  setActiveModule={setActiveModule}
                />
              )}
              {activeModule === "procore" && (
                <ProcoreSync selectedProject={selectedProject} onLogout={handleLogout} setActiveModule={setActiveModule} />
              )}
              {activeModule === "settings" && <SettingsView onLogout={handleLogout} setActiveModule={setActiveModule} />}
              {activeModule === "help" && <HelpSupport onLogout={handleLogout} setActiveModule={setActiveModule} />}
            </div>
          )}
        </div>
      </main>
      <Toaster />
    </div>
  )
}
