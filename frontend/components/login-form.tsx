"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { AlertCircle, CheckCircle } from "lucide-react"
import { GithubIcon } from "@/components/ui/github-icon"

interface LoginFormProps {
  onSuccess: () => void
  onSwitchToRegister: () => void
}

export default function LoginForm({ onSuccess, onSwitchToRegister }: LoginFormProps) {
  const [username, setUsername] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [success, setSuccess] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setIsLoading(true)

    try {
      const response = await fetch("https://p2p-money-transfer-server.vercel.app/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password }),
      })

      const data = await response.json()

      if (!response.ok) {
        setError(data.message || "Login failed")
        return
      }

      localStorage.setItem("token", data.token)
      localStorage.setItem("user", JSON.stringify(data.user))
      setSuccess(true)

      setTimeout(() => {
        onSuccess()
      }, 1000)
    } catch (err) {
      setError("Connection error. Please check if the backend is running.")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Card className="auth-card-gradient p-8 border-0 shadow-2xl">
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">Welcome Back</h2>
          <p className="text-muted-foreground mt-2 text-sm">Enter your credentials to continue</p>
        </div>
        <a
          href="https://github.com/Atharvachavan2005/p2p-money-transfer"
          target="_blank"
          rel="noopener noreferrer"
          aria-label="View GitHub Repository"
          className="ml-2 hover:text-primary transition-colors"
        >
          <GithubIcon size={28} />
        </a>
      </div>

      {error && (
        <div className="mb-4 p-4 bg-destructive/10 border border-destructive/20 rounded-lg flex items-start gap-3 backdrop-blur-sm">
          <AlertCircle className="w-5 h-5 text-destructive mt-0.5 flex-shrink-0" />
          <p className="text-sm text-destructive font-medium">{error}</p>
        </div>
      )}

      {success && (
        <div className="mb-4 p-4 bg-accent/10 border border-accent/20 rounded-lg flex items-start gap-3 backdrop-blur-sm">
          <CheckCircle className="w-5 h-5 text-accent mt-0.5 flex-shrink-0" />
          <p className="text-sm text-accent font-medium">Login successful! Redirecting...</p>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-5">
        <div>
          <label className="block text-sm font-semibold text-foreground mb-2">Username</label>
          <Input
            type="text"
            placeholder="john_doe"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            disabled={isLoading}
            className="input-premium h-11"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-semibold text-foreground mb-2">Password</label>
          <Input
            type="password"
            placeholder="••••••••"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            disabled={isLoading}
            className="input-premium h-11"
            required
          />
        </div>

        <Button
          type="submit"
          disabled={isLoading}
          className="btn-premium w-full text-primary-foreground font-semibold py-2.5 h-11 mt-2"
        >
          {isLoading ? "Logging in..." : "Login"}
        </Button>
      </form>

      <div className="mt-8 text-center border-t border-border/50 pt-6">
        <p className="text-sm text-muted-foreground">
          Don't have an account?{" "}
          <button onClick={onSwitchToRegister} className="text-primary hover:text-accent font-semibold transition-colors">
            Create one
          </button>
        </p>
      </div>
    </Card>
  )
}
