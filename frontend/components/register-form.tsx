"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { AlertCircle, CheckCircle } from "lucide-react"

interface RegisterFormProps {
  onSuccess: () => void
  onSwitchToLogin: () => void
}

export default function RegisterForm({ onSuccess, onSwitchToLogin }: RegisterFormProps) {
  const [username, setUsername] = useState("")
  const [password, setPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [error, setError] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [success, setSuccess] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")

    if (password !== confirmPassword) {
      setError("Passwords do not match")
      return
    }

    if (password.length < 6) {
      setError("Password must be at least 6 characters")
      return
    }

    setIsLoading(true)

    try {
      const response = await fetch("http://localhost:5000/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password }),
      })

      const data = await response.json()

      if (!response.ok) {
        setError(data.message || "Registration failed")
        return
      }

      setSuccess(true)

      setTimeout(() => {
        onSuccess()
        setUsername("")
        setPassword("")
        setConfirmPassword("")
      }, 2000)
    } catch (err) {
      setError("Connection error. Please check if the backend is running.")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Card className="auth-card-gradient p-8 border-0 shadow-2xl">
      <div className="mb-8">
        <h2 className="text-3xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">Create Account</h2>
        <p className="text-muted-foreground mt-2 text-sm">Join our platform and start transferring money</p>
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
          <p className="text-sm text-accent font-medium">Account created! Redirecting to login...</p>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-5">
        <div>
          <label className="block text-sm font-semibold text-foreground mb-2">Username</label>
          <Input
            type="text"
            placeholder="Choose a unique username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            disabled={isLoading}
            className="input-premium h-11"
            required
          />
          <p className="text-xs text-muted-foreground mt-1">3-20 characters, lowercase and underscores only</p>
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
          <p className="text-xs text-muted-foreground mt-1">At least 6 characters</p>
        </div>

        <div>
          <label className="block text-sm font-semibold text-foreground mb-2">Confirm Password</label>
          <Input
            type="password"
            placeholder="••••••••"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
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
          {isLoading ? "Creating account..." : "Sign Up"}
        </Button>
      </form>

      <div className="mt-8 text-center border-t border-border/50 pt-6">
        <p className="text-sm text-muted-foreground">
          Already have an account?{" "}
          <button onClick={onSwitchToLogin} className="text-primary hover:text-accent font-semibold transition-colors">
            Log in
          </button>
        </p>
      </div>
    </Card>
  )
}
