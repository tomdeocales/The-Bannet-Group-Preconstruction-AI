import type { RequestInit } from "next/dist/server/web/spec-extension/request"

export async function procoreRequest(path: string, token: string, options: RequestInit = {}) {
  const companyId = process.env.PROCORE_COMPANY_ID

  if (!companyId) {
    throw new Error("Missing PROCORE_COMPANY_ID env var")
  }

  const base = process.env.PROCORE_API_BASE
  if (!base) {
    throw new Error("Missing PROCORE_API_BASE env var")
  }

  const url = `${base}${path}`

  const res = await fetch(url, {
    ...options,
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
      "Procore-Company-Id": companyId,
      ...(options.headers || {}),
    },
  })

  const data = await res.json()

  if (!res.ok) {
    console.error("Procore API error", res.status, data)
    throw new Error(`Procore API error: ${res.status}`)
  }

  return data
}
