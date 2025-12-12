"use client"

import useSWR from "swr"

const fetcher = (url: string) => fetch(url).then((r) => r.json())

export default function ProcoreTestPage() {
  const { data, error, isLoading } = useSWR("/api/procore/projects", fetcher)

  if (isLoading) return <p className="p-4 text-sm">Loading projects…</p>

  if (error || data?.error) {
    return <pre className="p-4 text-xs whitespace-pre-wrap">{JSON.stringify(data || error, null, 2)}</pre>
  }

  return (
    <div className="p-4 space-y-4">
      <h1 className="text-xl font-semibold">Procore Projects (Sandbox)</h1>
      <pre className="text-xs whitespace-pre-wrap bg-muted p-3 rounded-md">{JSON.stringify(data, null, 2)}</pre>
    </div>
  )
}
