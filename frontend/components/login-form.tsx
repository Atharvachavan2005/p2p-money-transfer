"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { AlertCircle, CheckCircle } from "lucide-react"

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
      const response = await fetch("http://localhost:5000/api/auth/login", {
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
    <Card className="p-6 md:p-8 border border-border bg-card shadow-lg">
      <h2 className="text-2xl font-bold mb-6 text-foreground">Welcome Back</h2>

      {error && (
        <div className="mb-4 p-3 bg-destructive/10 border border-destructive/20 rounded-lg flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-destructive mt-0.5 flex-shrink-0" />
          <p className="text-sm text-destructive">{error}</p>
        </div>
      )}

      {success && (
        <div className="mb-4 p-3 bg-accent/10 border border-accent/20 rounded-lg flex items-start gap-3">
          <CheckCircle className="w-5 h-5 text-accent mt-0.5 flex-shrink-0" />
          <p className="text-sm text-accent">Login successful! Redirecting...</p>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-foreground mb-2">Username</label>
          <Input
            type="text"
            placeholder="Enter your username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            disabled={isLoading}
            className="bg-input border-border"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-foreground mb-2">Password</label>
          <Input
            type="password"
            placeholder="Enter your password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            disabled={isLoading}
            className="bg-input border-border"
            required
          />
        </div>

        <Button
          type="submit"
          disabled={isLoading}
          className="w-full bg-primary hover:bg-primary/90 text-primary-foreground font-medium py-2"
        >
          {isLoading ? "Logging in..." : "Login"}
        </Button>
      </form>

      <div className="mt-6 text-center">
        <p className="text-sm text-muted-foreground">
          Don't have an account?{" "}
          <button onClick={onSwitchToRegister} className="text-primary hover:underline font-medium">
            Sign up
          </button>
        </p>
      </div>
    </Card>
  )
}
