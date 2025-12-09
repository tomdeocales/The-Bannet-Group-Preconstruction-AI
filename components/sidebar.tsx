"use client"

import { useState } from "react"
import Image from "next/image"
import {
  LayoutDashboard,
  Calculator,
  Users,
  FileSearch,
  RefreshCw,
  Search,
  ChevronDown,
  Building2,
  Settings,
  HelpCircle,
  Check,
} from "lucide-react"
import { cn } from "@/lib/utils"
import { Input } from "@/components/ui/input"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import type { ModuleType } from "@/app/page"

const projects = [
  "Riverside Medical Center",
  "Harbor View Office Complex",
  "Westfield Shopping Plaza",
  "Downtown Transit Hub",
  "Lakeside Residential Tower",
]

const navItems = [
  { id: "dashboard" as ModuleType, label: "Dashboard", icon: LayoutDashboard },
  { id: "estimator" as ModuleType, label: "AI Estimator", icon: Calculator },
  { id: "subcontractor" as ModuleType, label: "Subcontractor Matching", icon: Users },
  { id: "zoning" as ModuleType, label: "Zoning Review", icon: FileSearch },
  { id: "procore" as ModuleType, label: "Procore Sync", icon: RefreshCw },
]

interface SidebarProps {
  activeModule: ModuleType
  setActiveModule: (module: ModuleType) => void
  selectedProject: string
  setSelectedProject: (project: string) => void
}

export function Sidebar({ activeModule, setActiveModule, selectedProject, setSelectedProject }: SidebarProps) {
  const [searchQuery, setSearchQuery] = useState("")

  const filteredNav = navItems.filter((item) => item.label.toLowerCase().includes(searchQuery.toLowerCase()))

  return (
    <aside className="w-64 bg-sidebar flex flex-col h-full">
      {/* Logo */}
      <div className="p-4">
        <div className="flex items-center gap-3">
          <Image src="/images/image.png" alt="The Bannett Group Logo" width={40} height={40} className="rounded-lg" />
          <div>
            <h1 className="font-semibold text-sidebar-foreground text-sm">The Bannett Group</h1>
            <p className="text-xs text-muted-foreground">Preconstruction AI</p>
          </div>
        </div>
      </div>
      <div className="mx-4 h-[1px] bg-sidebar-border" />

      {/* Project Selector */}
      <div className="p-4">
        <DropdownMenu>
          <DropdownMenuTrigger className="w-full flex items-center justify-between px-3 py-2 rounded-lg bg-white border border-sidebar-border hover:bg-sidebar-accent/80 transition-colors focus:outline-none focus:ring-0">
            <div className="flex items-center gap-2">
              <Building2 className="w-4 h-4 text-bannett-blue" />
              <span className="text-sm font-medium text-sidebar-foreground truncate max-w-[140px]">
                {selectedProject}
              </span>
            </div>
            <ChevronDown className="w-4 h-4 text-muted-foreground" />
          </DropdownMenuTrigger>
          <DropdownMenuContent align="start" className="w-56">
            {projects.map((project) => (
              <DropdownMenuItem
                key={project}
                onClick={() => setSelectedProject(project)}
                className={cn(
                  "cursor-pointer flex items-center justify-between text-black focus:bg-sidebar-accent/80 focus:text-black",
                )}
              >
                <div className="flex items-center">
                  <Building2 className="w-4 h-4 mr-2" />
                  {project}
                </div>
                {project === selectedProject && <Check className="w-4 h-4 text-black" />}
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
      <div className="mx-4 h-[1px] bg-sidebar-border" />

      {/* Search */}
      <div className="p-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Search..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9 bg-white border border-sidebar-border focus-visible:ring-1 focus-visible:ring-bannett-blue"
          />
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3">
        <ul className="space-y-1">
          {filteredNav.map((item) => (
            <li key={item.id}>
              <button
                onClick={() => setActiveModule(item.id)}
                className={cn(
                  "w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors",
                  activeModule === item.id
                    ? "bg-bannett-navy text-primary-foreground"
                    : "text-sidebar-foreground hover:bg-sidebar-accent",
                )}
              >
                <item.icon className="w-5 h-5" />
                {item.label}
              </button>
            </li>
          ))}
        </ul>
      </nav>

      {/* Footer */}
      <div className="mx-4 h-[1px] bg-sidebar-border" />
      <div className="p-4 space-y-1">
        <button
          onClick={() => setActiveModule("settings")}
          className={cn(
            "w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-colors",
            activeModule === "settings"
              ? "bg-bannett-navy text-primary-foreground"
              : "text-muted-foreground hover:bg-sidebar-accent",
          )}
        >
          <Settings className="w-4 h-4" />
          Settings
        </button>
        <button
          onClick={() => setActiveModule("help")}
          className={cn(
            "w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-colors",
            activeModule === "help"
              ? "bg-bannett-navy text-primary-foreground"
              : "text-muted-foreground hover:bg-sidebar-accent",
          )}
        >
          <HelpCircle className="w-4 h-4" />
          Help & Support
        </button>
      </div>

      {/* Procore Badge */}
      <div className="mx-4 h-[1px] bg-sidebar-border" />
      <div className="p-4">
        <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-sidebar-accent">
          <div className="w-2 h-2 rounded-full bg-success animate-pulse" />
          <span className="text-xs text-muted-foreground">Connected to Procore</span>
        </div>
      </div>
    </aside>
  )
}
