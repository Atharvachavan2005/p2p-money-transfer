"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import AuthPage from "@/components/auth-page"
import Dashboard from "@/components/dashboard"
import Snowfall from 'react-snowfall'
import { useSnowColor } from '@/hooks/use-snow-color'

export default function Home() {
  const [isLoggedIn, setIsLoggedIn] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const router = useRouter()
  const snowColor = useSnowColor()

  useEffect(() => {
    const token = localStorage.getItem("token")
    setIsLoggedIn(!!token)
    setIsLoading(false)
  }, [])

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background dark:bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
        </div>
      </div>
    )
  }

  return (
    <main className="min-h-screen w-full bg-lavish dark:bg-lavish-dark transition-colors duration-300">
      <Snowfall color={snowColor} />
      {isLoggedIn ? (
        <Dashboard
          onLogout={() => {
            localStorage.removeItem("token")
            localStorage.removeItem("user")
            setIsLoggedIn(false)
          }}
        />
      ) : (
        <AuthPage onLoginSuccess={() => setIsLoggedIn(true)} />
      )}
    </main>
  )
}
