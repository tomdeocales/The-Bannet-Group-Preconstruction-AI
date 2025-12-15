"use client"

import { useEffect, useMemo, useState } from "react"

export type ProcoreEmbedMode = "fullscreen" | "sidepanel"

export type ProcoreEmbeddedContext = {
  company_id?: number
  project_id?: number
  view?: string
  id?: string
  mode?: ProcoreEmbedMode
  visible?: boolean
  origin?: string
  received_at?: string
  raw?: unknown
}

export type ProcoreEmbedState = {
  embedded: boolean
  context: ProcoreEmbeddedContext | null
}

const STORAGE_KEY = "bannett-procore-embed-context-v1"
const EVENT_NAME = "bannett:procore:embed-context"

const toInt = (value: string | null) => {
  if (!value) return undefined
  const n = Number.parseInt(value, 10)
  return Number.isFinite(n) ? n : undefined
}

const parseUrlContext = (): ProcoreEmbedState => {
  if (typeof window === "undefined") return { embedded: false, context: null }

  const url = new URL(window.location.href)
  const embeddedFlag = url.searchParams.get("embedded")
  const modeRaw = url.searchParams.get("mode")
  const mode: ProcoreEmbedMode | undefined = modeRaw === "sidepanel" ? "sidepanel" : modeRaw === "fullscreen" ? "fullscreen" : undefined

  const company_id = toInt(url.searchParams.get("company_id"))
  const project_id = toInt(url.searchParams.get("project_id"))
  const view = url.searchParams.get("view") ?? undefined
  const id = url.searchParams.get("id") ?? undefined

  const embedded = embeddedFlag === "1" || embeddedFlag === "true" || mode !== undefined || company_id !== undefined || project_id !== undefined
  if (!embedded) return { embedded: false, context: null }

  return {
    embedded: true,
    context: {
      company_id,
      project_id,
      view,
      id,
      mode,
      visible: mode === "sidepanel" ? true : undefined,
      origin: window.location.origin,
      received_at: new Date().toISOString(),
      raw: { source: "url" },
    },
  }
}

const safeParseStored = (): ProcoreEmbedState => {
  if (typeof window === "undefined") return { embedded: false, context: null }
  const raw = window.sessionStorage.getItem(STORAGE_KEY)
  if (!raw) return { embedded: false, context: null }
  try {
    const parsed = JSON.parse(raw) as ProcoreEmbedState
    if (typeof parsed?.embedded !== "boolean") return { embedded: false, context: null }
    if (parsed.embedded && parsed.context && typeof parsed.context === "object") return parsed
  } catch {
    // ignore
  }
  return { embedded: false, context: null }
}

export const setProcoreEmbedContext = (next: ProcoreEmbedState, options?: { broadcast?: boolean }) => {
  if (typeof window === "undefined") return
  window.sessionStorage.setItem(STORAGE_KEY, JSON.stringify(next))
  if (options?.broadcast ?? true) {
    window.dispatchEvent(new CustomEvent(EVENT_NAME, { detail: next }))
  }
}

const mergeContext = (prev: ProcoreEmbedState, next: ProcoreEmbedState): ProcoreEmbedState => {
  if (!prev.embedded && next.embedded) return next
  if (prev.embedded && !next.embedded) return prev
  if (!prev.context && next.context) return next
  if (!prev.context || !next.context) return prev

  return {
    embedded: true,
    context: {
      ...prev.context,
      ...next.context,
      company_id: next.context.company_id ?? prev.context.company_id,
      project_id: next.context.project_id ?? prev.context.project_id,
      mode: next.context.mode ?? prev.context.mode,
      view: next.context.view ?? prev.context.view,
      id: next.context.id ?? prev.context.id,
      visible: typeof next.context.visible === "boolean" ? next.context.visible : prev.context.visible,
      origin: next.context.origin ?? prev.context.origin,
      received_at: next.context.received_at ?? prev.context.received_at,
      raw: next.context.raw ?? prev.context.raw,
    },
  }
}

const asSetupMessage = (data: unknown): { context: any } | null => {
  if (!data || typeof data !== "object") return null
  const type = (data as any).type
  if (type !== "setup") return null
  const context = (data as any).context
  if (!context || typeof context !== "object") return null
  return { context }
}

const asSidepanelLifecycleMessage = (
  data: unknown,
): { type: "sidepanel:app:visible" | "sidepanel:app:hidden" | "sidepanel:app:destroy"; context?: any } | null => {
  if (!data || typeof data !== "object") return null
  const type = (data as any).type
  if (type !== "sidepanel:app:visible" && type !== "sidepanel:app:hidden" && type !== "sidepanel:app:destroy") return null
  return { type, context: (data as any).context }
}

export function useProcoreEmbedContext() {
  const initial = useMemo(() => {
    const fromStorage = safeParseStored()
    const fromUrl = parseUrlContext()
    return mergeContext(fromStorage, fromUrl)
  }, [])

  const [state, setState] = useState<ProcoreEmbedState>(initial)

  useEffect(() => {
    setProcoreEmbedContext(state, { broadcast: false })
  }, [state])

  useEffect(() => {
    const onEvent = (ev: Event) => {
      const next = (ev as CustomEvent).detail as ProcoreEmbedState | undefined
      if (!next) return
      setState((prev) => mergeContext(prev, next))
    }
    window.addEventListener(EVENT_NAME, onEvent as EventListener)
    return () => window.removeEventListener(EVENT_NAME, onEvent as EventListener)
  }, [])

  useEffect(() => {
    const onMessage = (event: MessageEvent) => {
      const setup = asSetupMessage(event.data)
      if (setup) {
        const company_id =
          typeof setup.context.company_id === "number" ? setup.context.company_id : toInt(String(setup.context.company_id))
        const project_id =
          typeof setup.context.project_id === "number" ? setup.context.project_id : toInt(String(setup.context.project_id))
        const view = typeof setup.context.view === "string" ? setup.context.view : undefined
        const id = setup.context.id != null ? String(setup.context.id) : undefined
        const mode: ProcoreEmbedMode = "sidepanel"
        const next: ProcoreEmbedState = {
          embedded: true,
          context: {
            company_id,
            project_id,
            view,
            id,
            mode,
            visible: true,
            origin: event.origin,
            received_at: new Date().toISOString(),
            raw: setup.context,
          },
        }
        setState((prev) => mergeContext(prev, next))
        return
      }

      const lifecycle = asSidepanelLifecycleMessage(event.data)
      if (lifecycle) {
        const next: ProcoreEmbedState = {
          embedded: true,
          context: {
            ...(state.context ?? {}),
            mode: (state.context?.mode ?? "sidepanel") as ProcoreEmbedMode,
            visible: lifecycle.type === "sidepanel:app:visible" ? true : lifecycle.type === "sidepanel:app:hidden" ? false : undefined,
            origin: event.origin,
            received_at: new Date().toISOString(),
            raw: lifecycle.context ?? state.context?.raw,
          },
        }
        if (lifecycle.type === "sidepanel:app:destroy") {
          setState({ embedded: false, context: null })
          return
        }
        setState((prev) => mergeContext(prev, next))
      }
    }

    window.addEventListener("message", onMessage)
    return () => window.removeEventListener("message", onMessage)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [state.context])

  return state
}
