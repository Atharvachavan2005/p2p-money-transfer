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
    <Card className="p-6 md:p-8 border border-border bg-card shadow-lg">
      <h2 className="text-2xl font-bold mb-6 text-foreground">Create Account</h2>

      {error && (
        <div className="mb-4 p-3 bg-destructive/10 border border-destructive/20 rounded-lg flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-destructive mt-0.5 flex-shrink-0" />
          <p className="text-sm text-destructive">{error}</p>
        </div>
      )}

      {success && (
        <div className="mb-4 p-3 bg-accent/10 border border-accent/20 rounded-lg flex items-start gap-3">
          <CheckCircle className="w-5 h-5 text-accent mt-0.5 flex-shrink-0" />
          <p className="text-sm text-accent">Account created! Redirecting to login...</p>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-foreground mb-2">Username</label>
          <Input
            type="text"
            placeholder="Choose a username"
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
            placeholder="Create a password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            disabled={isLoading}
            className="bg-input border-border"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-foreground mb-2">Confirm Password</label>
          <Input
            type="password"
            placeholder="Confirm your password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
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
          {isLoading ? "Creating account..." : "Sign Up"}
        </Button>
      </form>

      <div className="mt-6 text-center">
        <p className="text-sm text-muted-foreground">
          Already have an account?{" "}
          <button onClick={onSwitchToLogin} className="text-primary hover:underline font-medium">
            Log in
          </button>
        </p>
      </div>
    </Card>
  )
}
