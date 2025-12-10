"use client"

import { useState } from "react"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { AlertCircle, ArrowRight, ArrowLeft, Lock, Mail } from "lucide-react"

interface LoginProps {
  onLogin: (email: string, password: string) => { success: boolean; message?: string }
}

export function Login({ onLogin }: LoginProps) {
  const [step, setStep] = useState<"email" | "password">("email")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)

  const handleEmailSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!email.trim()) {
      setError("Enter your work email")
      return
    }
    setError("")
    setStep("password")
  }

  const handlePasswordSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    const result = onLogin(email, password)
    if (!result.success) {
      setError(result.message || "Unable to sign in")
      setLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-[#fafafa] px-4">
      <div className="max-w-xl w-full flex flex-col items-center gap-8 text-center">
        <div className="h-16 w-16 flex items-center justify-center">
          <Image src="/images/image.png" alt="The Bannett Group" width={48} height={48} className="rounded-xl" />
        </div>
        <div className="space-y-2">
          <h1 className="text-3xl font-semibold text-foreground">Welcome</h1>
          <p className="text-sm text-muted-foreground">
            Log in to The Bannett Group
            <br />
            Preconstruction AI workspace.
          </p>
        </div>

        {step === "email" && (
          <form onSubmit={handleEmailSubmit} className="w-full max-w-md space-y-4">
            <div className="text-left space-y-2">
              <label className="text-sm font-medium text-foreground">Email address*</label>
              <div className="relative">
                <Mail className="w-4 h-4 text-muted-foreground absolute left-3 top-1/2 -translate-y-1/2" />
                <Input
                  type="email"
                  className="pl-10 h-11 border border-border"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@bannett.com"
                  required
                />
              </div>
            </div>
            {error && (
              <div className="flex items-start gap-2 text-destructive text-sm">
                <AlertCircle className="w-4 h-4 mt-0.5" />
                <span>{error}</span>
              </div>
            )}
            <Button type="submit" className="w-full h-11 bg-bannett-navy hover:bg-bannett-navy/90 text-white">
              Continue
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          </form>
        )}

        {step === "password" && (
          <form onSubmit={handlePasswordSubmit} className="w-full max-w-md space-y-4">
            <div className="flex items-center justify-between text-left">
              <div className="space-y-1">
                <p className="text-sm text-muted-foreground">Signed in as</p>
                <p className="text-base font-medium text-foreground">{email}</p>
              </div>
              <button
                type="button"
                className="text-sm text-bannett-navy hover:underline flex items-center gap-1"
                onClick={() => {
                  setPassword("")
                  setStep("email")
                }}
              >
                <ArrowLeft className="w-4 h-4" />
                Change
              </button>
            </div>
            <div className="text-left space-y-2">
              <label className="text-sm font-medium text-foreground">Password</label>
              <div className="relative">
                <Lock className="w-4 h-4 text-muted-foreground absolute left-3 top-1/2 -translate-y-1/2" />
                <Input
                  type="password"
                  className="pl-10 h-11 border border-border"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter your password"
                  required
                />
              </div>
            </div>
            {error && (
              <div className="flex items-start gap-2 text-destructive text-sm">
                <AlertCircle className="w-4 h-4 mt-0.5" />
                <span>{error}</span>
              </div>
            )}
            <Button
              type="submit"
              disabled={loading}
              className="w-full h-11 bg-bannett-navy hover:bg-bannett-navy/90 text-white"
            >
              {loading ? "Signing in..." : "Sign in"}
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          </form>
        )}
      </div>
    </div>
  )
}
