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
    <div className="min-h-screen bg-lavish dark:bg-lavish-dark flex items-center justify-center p-4 relative overflow-hidden">
      {/* Decorative elements */}
      <div className="absolute top-0 left-0 w-96 h-96 bg-gradient-to-br from-primary/10 to-accent/5 rounded-full blur-3xl -translate-x-1/2 -translate-y-1/2 dark:from-primary/5 dark:to-accent/10"></div>
      <div className="absolute bottom-0 right-0 w-96 h-96 bg-gradient-to-tl from-accent/10 to-primary/5 rounded-full blur-3xl translate-x-1/2 translate-y-1/2 dark:from-accent/5 dark:to-primary/10"></div>

      <div className="w-full max-w-md relative z-10">
        <div className="text-center mb-10">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-xl bg-gradient-to-br from-primary to-accent mb-4 shadow-lg">
            <span className="text-2xl font-bold text-primary-foreground">₹</span>
          </div>
          <h1 className="text-5xl font-bold bg-gradient-to-r from-primary via-accent to-secondary bg-clip-text text-transparent mb-2">
            P2P Ledger
          </h1>
          <p className="text-muted-foreground text-base font-medium">Fast • Secure • Simple</p>
        </div>

        <div className="relative">
          {isLogin ? (
            <LoginForm onSuccess={onLoginSuccess} onSwitchToRegister={() => setIsLogin(false)} />
          ) : (
            <RegisterForm onSuccess={() => setIsLogin(true)} onSwitchToLogin={() => setIsLogin(true)} />
          )}
        </div>

        {/* Footer note */}
        <div className="mt-8 text-center text-xs text-muted-foreground">
          <p>💳 Starting balance: ₹1,000 • 🔒 Secure transactions • ⚡ Real-time updates</p>
        </div>
      </div>
    </div>
  )
}
