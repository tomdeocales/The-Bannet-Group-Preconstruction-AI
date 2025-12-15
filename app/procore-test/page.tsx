"use client"

import { useMemo, useRef, useState } from "react"
import useSWR from "swr"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

const fetcher = (url: string) => fetch(url).then((r) => r.json())

export default function ProcoreTestPage() {
  const { data, error, isLoading } = useSWR("/api/procore/projects?page=1&per_page=50&view=normal", fetcher)
  const iframeRef = useRef<HTMLIFrameElement | null>(null)

  const projects = (data?.items ?? []) as Array<{ id: number; name: string; display_name?: string }>
  const companyId = (data?.company?.id ?? 0) as number

  const [mode, setMode] = useState<"fullscreen" | "sidepanel">("sidepanel")
  const [projectId, setProjectId] = useState<number>(() => projects[0]?.id ?? 0)
  const [view, setView] = useState("drawings")
  const [resourceId, setResourceId] = useState("A01")

  const selectedProject = useMemo(() => projects.find((p) => p.id === projectId) ?? projects[0] ?? null, [projects, projectId])

  if (isLoading) return <p className="p-4 text-sm">Loading projects…</p>

  if (error || data?.error) {
    return <pre className="p-4 text-xs whitespace-pre-wrap">{JSON.stringify(data || error, null, 2)}</pre>
  }

  const effectiveProjectId = selectedProject?.id ?? projects[0]?.id ?? 0
  const src = `/?embedded=1&mode=${mode}&company_id=${encodeURIComponent(String(companyId || 0))}&project_id=${encodeURIComponent(
    String(effectiveProjectId),
  )}&view=${encodeURIComponent(view)}&id=${encodeURIComponent(resourceId)}`

  const postToIframe = (payload: unknown) => {
    const win = iframeRef.current?.contentWindow
    if (!win) return
    win.postMessage(payload, window.location.origin)
  }

  return (
    <div className="p-4 space-y-6">
      <div>
        <h1 className="text-xl font-semibold">Embedded App Preview Harness</h1>
        <p className="text-sm text-muted-foreground">
          Simulates Procore Embedded Apps (full-screen + side panel) using URL context + `postMessage` `setup`.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="space-y-4">
          <div className="space-y-2">
            <Label>Mode</Label>
            <Select value={mode} onValueChange={(v) => setMode(v as "fullscreen" | "sidepanel")}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="sidepanel">Side panel</SelectItem>
                <SelectItem value="fullscreen">Full screen</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>Project</Label>
            <Select value={String(effectiveProjectId)} onValueChange={(v) => setProjectId(Number(v))}>
              <SelectTrigger>
                <SelectValue placeholder="Select a project" />
              </SelectTrigger>
              <SelectContent className="max-h-72 overflow-y-auto">
                {projects.map((p) => (
                  <SelectItem key={p.id} value={String(p.id)}>
                    {p.display_name ?? p.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>View (context.view)</Label>
            <Input value={view} onChange={(e) => setView(e.target.value)} placeholder="e.g. drawings | planroom | documents" />
          </div>

          <div className="space-y-2">
            <Label>Resource ID (context.id)</Label>
            <Input value={resourceId} onChange={(e) => setResourceId(e.target.value)} placeholder="e.g. A01 | 12345" />
          </div>

          <div className="flex flex-wrap gap-2">
            <Button
              onClick={() => {
                postToIframe({
                  type: "setup",
                  context: { company_id: companyId, project_id: effectiveProjectId, view, id: resourceId },
                })
              }}
            >
              Send setup
            </Button>
            <Button variant="outline" onClick={() => postToIframe({ type: "sidepanel:app:visible" })}>
              Visible
            </Button>
            <Button variant="outline" onClick={() => postToIframe({ type: "sidepanel:app:hidden" })}>
              Hidden
            </Button>
            <Button variant="destructive" onClick={() => postToIframe({ type: "sidepanel:app:destroy" })}>
              Destroy
            </Button>
          </div>

          <div className="text-xs text-muted-foreground">
            <p>iframe src:</p>
            <pre className="mt-1 whitespace-pre-wrap bg-muted p-2 rounded">{src}</pre>
          </div>
        </div>

        <div className="lg:col-span-2">
          <div className="rounded-lg border overflow-hidden bg-background">
            <iframe ref={iframeRef} title="Embedded App" src={src} className="w-full h-[78vh]" />
          </div>
        </div>
      </div>
    </div>
  )
}
