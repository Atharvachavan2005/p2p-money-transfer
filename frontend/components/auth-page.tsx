"use client"

import { useState } from "react"
import LoginForm from "@/components/login-form"
import RegisterForm from "@/components/register-form"

interface AuthPageProps {
  onLoginSuccess: () => void
}

export default function AuthPage({ onLoginSuccess }: AuthPageProps) {
  const [isLogin, setIsLogin] = useState(true)

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-background flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-foreground mb-2">Paisa</h1>
          <p className="text-muted-foreground">Fast, secure money transfer</p>
        </div>

        {isLogin ? (
          <LoginForm onSuccess={onLoginSuccess} onSwitchToRegister={() => setIsLogin(false)} />
        ) : (
          <RegisterForm onSuccess={() => setIsLogin(true)} onSwitchToLogin={() => setIsLogin(true)} />
        )}
      </div>
    </div>
  )
}
