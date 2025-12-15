"use client"

import { useEffect, useMemo, useState } from "react"
import { ChevronLeft, Folder, FileText, ArrowRight, Loader2 } from "lucide-react"
import { toast } from "sonner"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import type { ProcoreDocumentEntry } from "@/lib/procore/types"
import { getDocuments } from "@/lib/procore/client"

type PickerValue = { folder_id: number; folder_path: string }

type Props = {
  open: boolean
  onOpenChange: (open: boolean) => void
  projectId: number
  title: string
  mode?: "select" | "browse"
  cancelLabel?: string
  confirmLabel?: string
  initialFolderPath?: string
  onConfirm?: (value: PickerValue) => void | Promise<void>
}

const parseFolderPath = (path?: string) =>
  (path ?? "")
    .split("/")
    .map((p) => p.trim())
    .filter(Boolean)

export function ProcoreDocumentPickerDialog({
  open,
  onOpenChange,
  projectId,
  title,
  mode = "select",
  cancelLabel,
  confirmLabel = "Select folder",
  initialFolderPath,
  onConfirm,
}: Props) {
  const [currentFolderId, setCurrentFolderId] = useState<number | null>(null)
  const [folderStack, setFolderStack] = useState<ProcoreDocumentEntry[]>([])
  const [items, setItems] = useState<ProcoreDocumentEntry[]>([])
  const [meta, setMeta] = useState<{ page: number; per_page: number; total: number; total_pages: number } | null>(null)
  const [loading, setLoading] = useState(false)
  const [resolving, setResolving] = useState(false)
  const [page, setPage] = useState(1)
  const [perPage, setPerPage] = useState(10)
  const [sort, setSort] = useState<"name" | "-updated_at">("name")
  const [search, setSearch] = useState("")
  const [submitting, setSubmitting] = useState(false)

  const folderPath = useMemo(() => folderStack.map((f) => f.name).join("/"), [folderStack])
  const canConfirm = folderStack.length > 0

  const goToFolder = (folder: ProcoreDocumentEntry) => {
    setFolderStack((prev) => [...prev, folder])
    setCurrentFolderId(folder.id)
    setPage(1)
  }

  const goUp = () => {
    setFolderStack((prev) => {
      const next = prev.slice(0, -1)
      setCurrentFolderId(next.length ? next[next.length - 1].id : null)
      return next
    })
    setPage(1)
  }

  const resetToRoot = () => {
    setFolderStack([])
    setCurrentFolderId(null)
    setPage(1)
  }

  const resolveInitialPath = useMemo(() => {
    return async (path: string) => {
      const parts = parseFolderPath(path)
      if (!parts.length) return { stack: [] as ProcoreDocumentEntry[], folderId: null as number | null }

      let folderId: number | null = null
      const stack: ProcoreDocumentEntry[] = []
      for (const segment of parts) {
        const res = await getDocuments(projectId, { page: 1, per_page: 200, view: "extended", filters: { folder_id: folderId ?? undefined } })
        const match = res.items.find(
          (entry) => entry.document_type === "folder" && entry.name.toLowerCase() === segment.toLowerCase(),
        )
        if (!match) break
        stack.push(match)
        folderId = match.id
      }
      return { stack, folderId }
    }
  }, [projectId])

  useEffect(() => {
    if (!open) return
    setSearch("")
    setSort("name")
    setPerPage(10)
    setPage(1)

    const init = async () => {
      if (!initialFolderPath) {
        resetToRoot()
        return
      }
      setResolving(true)
      try {
        const resolved = await resolveInitialPath(initialFolderPath)
        setFolderStack(resolved.stack)
        setCurrentFolderId(resolved.folderId)
      } catch (err) {
        const message = err instanceof Error ? err.message : "Unable to load Documents."
        toast.error("Failed to load Documents", { description: message })
        resetToRoot()
      } finally {
        setResolving(false)
      }
    }

    void init()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, projectId])

  useEffect(() => {
    if (!open) return
    let cancelled = false
    setLoading(true)
    getDocuments(projectId, {
      page,
      per_page: perPage,
      view: "extended",
      sort,
      filters: {
        search: search.trim() || undefined,
        folder_id: currentFolderId ?? undefined,
      },
    })
      .then((res) => {
        if (cancelled) return
        setItems(res.items)
        setMeta(res.meta)
      })
      .catch((err) => {
        if (cancelled) return
        const message = err instanceof Error ? err.message : "Unable to load Documents."
        toast.error("Failed to load Documents", { description: message })
        setItems([])
        setMeta(null)
      })
      .finally(() => {
        if (cancelled) return
        setLoading(false)
      })

    return () => {
      cancelled = true
    }
  }, [open, projectId, currentFolderId, page, perPage, search, sort])

  const visibleItems = useMemo(() => {
    const folders = items.filter((i) => i.document_type === "folder").sort((a, b) => a.name.localeCompare(b.name))
    const files = items.filter((i) => i.document_type === "file").sort((a, b) => a.name.localeCompare(b.name))
    return [...folders, ...files]
  }, [items])

  const breadcrumb = useMemo(() => {
    return [{ id: null as number | null, name: "Documents" }, ...folderStack.map((f) => ({ id: f.id, name: f.name }))]
  }, [folderStack])

  const jumpToBreadcrumb = (index: number) => {
    if (index === 0) {
      resetToRoot()
      return
    }
    const nextStack = folderStack.slice(0, index)
    const nextFolder = nextStack[nextStack.length - 1]
    setFolderStack(nextStack)
    setCurrentFolderId(nextFolder?.id ?? null)
    setPage(1)
  }

  const handleConfirm = async () => {
    if (!canConfirm) return
    if (submitting) return
    const activeFolder = folderStack[folderStack.length - 1]
    if (!activeFolder) return
    setSubmitting(true)
    try {
      await onConfirm?.({ folder_id: activeFolder.id, folder_path: folderPath })
      onOpenChange(false)
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <div className="flex flex-col gap-3">
            <div className="flex items-center justify-between gap-3">
              <div className="flex items-center gap-2 text-sm text-muted-foreground flex-wrap">
                {breadcrumb.map((c, idx) => (
                  <button
                    key={`${c.id ?? "root"}-${c.name}`}
                    type="button"
                    className={cn("hover:underline", idx === breadcrumb.length - 1 && "text-foreground font-medium")}
                    onClick={() => jumpToBreadcrumb(idx)}
                    disabled={idx === breadcrumb.length - 1}
                  >
                    {c.name}
                    {idx < breadcrumb.length - 1 ? " / " : ""}
                  </button>
                ))}
              </div>
              <div className="flex items-center gap-2">
                <Button size="sm" variant="outline" onClick={goUp} disabled={folderStack.length === 0 || loading || resolving}>
                  <ChevronLeft className="w-4 h-4 mr-2" />
                  Up
                </Button>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <div className="space-y-2 md:col-span-2">
                <Label>Search</Label>
                <Input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search files and folders…" />
              </div>
              <div className="space-y-2">
                <Label>Sort</Label>
                <Select value={sort} onValueChange={(v) => setSort(v as typeof sort)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="max-h-60 overflow-y-auto">
                    <SelectItem value="name">Name (A–Z)</SelectItem>
                    <SelectItem value="-updated_at">Recently updated</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>

          <div className="border rounded-lg overflow-hidden">
            <table className="w-full text-sm">
              <thead className="bg-muted/50">
                <tr>
                  <th className="text-left p-3 text-xs font-medium text-muted-foreground">Name</th>
                  <th className="text-left p-3 text-xs font-medium text-muted-foreground">Type</th>
                  <th className="text-left p-3 text-xs font-medium text-muted-foreground">Updated</th>
                </tr>
              </thead>
              <tbody>
                {resolving || loading ? (
                  <tr className="border-t">
                    <td colSpan={3} className="p-4 text-sm text-muted-foreground">
                      <span className="inline-flex items-center gap-2">
                        <Loader2 className="w-4 h-4 animate-spin" />
                        Loading Documents…
                      </span>
                    </td>
                  </tr>
                ) : visibleItems.length === 0 ? (
                  <tr className="border-t">
                    <td colSpan={3} className="p-4 text-sm text-muted-foreground">
                      No items found in this folder.
                    </td>
                  </tr>
                ) : (
                  visibleItems.map((entry) => (
                    <tr key={entry.id} className="border-t">
                      <td className="p-3">
                        {entry.document_type === "folder" ? (
                          <button
                            type="button"
                            className="flex items-center gap-2 text-card-foreground font-medium hover:underline"
                            onClick={() => goToFolder(entry)}
                          >
                            <Folder className="w-4 h-4 text-muted-foreground" />
                            {entry.name}
                          </button>
                        ) : (
                          <div className="flex items-center gap-2 text-card-foreground">
                            <FileText className="w-4 h-4 text-muted-foreground" />
                            {entry.name}
                          </div>
                        )}
                      </td>
                      <td className="p-3 text-muted-foreground">{entry.document_type === "folder" ? "Folder" : "File"}</td>
                      <td className="p-3 text-muted-foreground">{entry.updated_at?.slice(0, 10) ?? entry.created_at?.slice(0, 10) ?? "—"}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <Label className="text-xs text-muted-foreground">Rows</Label>
              <Select value={String(perPage)} onValueChange={(v) => setPerPage(Number(v))}>
                <SelectTrigger className="h-9 w-[90px]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="max-h-60 overflow-y-auto">
                  <SelectItem value="10">10</SelectItem>
                  <SelectItem value="25">25</SelectItem>
                  <SelectItem value="50">50</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex items-center gap-2">
              <Button size="sm" variant="outline" disabled={loading || resolving || page <= 1} onClick={() => setPage((p) => Math.max(1, p - 1))}>
                Previous
              </Button>
              <span className="text-xs text-muted-foreground">
                Page {meta?.page ?? page} of {meta?.total_pages ?? 1}
              </span>
              <Button
                size="sm"
                variant="outline"
                disabled={loading || resolving || (meta ? page >= meta.total_pages : false)}
                onClick={() => setPage((p) => p + 1)}
              >
                Next
              </Button>
            </div>
          </div>
        </div>

        <DialogFooter className="gap-2">
          <div className="mr-auto text-xs text-muted-foreground">
            Destination: {folderPath ? `/${folderPath}` : "Select a folder to continue"}
          </div>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            {cancelLabel ?? (mode === "browse" ? "Close" : "Cancel")}
          </Button>
          {mode === "select" && (
            <Button
              className="bg-bannett-navy hover:bg-bannett-navy/90"
              onClick={handleConfirm}
              disabled={!canConfirm || loading || resolving || submitting}
            >
              {submitting ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Working…
                </>
              ) : (
                <>
                  {confirmLabel}
                  <ArrowRight className="w-4 h-4 ml-2" />
                </>
              )}
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
