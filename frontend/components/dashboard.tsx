"use client"

import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { LogOut, Moon, Sun } from "lucide-react"
import { GithubIcon } from "@/components/ui/github-icon"
import { useTheme } from "next-themes"
import TransferForm from "@/components/transfer-form"
import TransactionHistory from "@/components/transaction-history"
import { useToast } from "@/hooks/use-toast"
import io, { type Socket } from "socket.io-client"

interface User {
  id: string
  username: string
  balance: number
}

interface DashboardProps {
  onLogout: () => void
}

export default function Dashboard({ onLogout }: DashboardProps) {
  const [user, setUser] = useState<User | null>(null)
  const [balance, setBalance] = useState(0)
  const [socket, setSocket] = useState<Socket | null>(null)
  const { toast } = useToast()
  const { theme, setTheme } = useTheme()
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
    const userData = localStorage.getItem("user")
    if (userData) {
      const parsedUser = JSON.parse(userData)
      setUser(parsedUser)
      setBalance(parsedUser.balance)
    }
  }, [])

  const fetchBalance = async () => {
    const token = localStorage.getItem("token")
    if (!token) return

    try {
      const response = await fetch("https://p2p-money-transfer-server.vercel.app/api/transactions/balance", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })

      if (response.ok) {
        const data = await response.json()
        setBalance(data.balance)
        // Update user object with new balance
        if (user) {
          const updatedUser = { ...user, balance: data.balance }
          setUser(updatedUser)
          localStorage.setItem("user", JSON.stringify(updatedUser))
        }
      } else if (response.status === 401 || response.status === 403) {
        // Token expired or invalid
        localStorage.removeItem("token")
        localStorage.removeItem("user")
        onLogout()
      }
    } catch (err) {
      console.error("Failed to fetch balance:", err)
    }
  }

  useEffect(() => {
    if (!user) return

    // Fetch initial balance
    fetchBalance()
    
    // Aggressive polling every 1 second for instant updates (Socket.IO doesn't work on Vercel)
    const balanceInterval = setInterval(fetchBalance, 1000)
    
    // Refresh when user returns to tab (for cross-tab updates)
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        fetchBalance()
        window.dispatchEvent(new Event("refresh-transactions"))
      }
    }
    document.addEventListener('visibilitychange', handleVisibilityChange)

    const newSocket = io("https://p2p-money-transfer-server.vercel.app", {
      reconnection: true,
    })

    newSocket.on("connect", () => {
      newSocket.emit("join", user.id)
    })

    newSocket.on("balance_update", (data: { message: string; amount?: number; newBalance?: number }) => {
      // Update balance from server if provided, otherwise calculate
      if (data.newBalance !== undefined) {
        setBalance(data.newBalance)
        // Update user object
        if (user) {
          const updatedUser = { ...user, balance: data.newBalance }
          setUser(updatedUser)
          localStorage.setItem("user", JSON.stringify(updatedUser))
        }
      } else if (data.amount !== undefined) {
        const amount = data.amount
        setBalance((prev) => prev + amount)
      } else {
        // Fallback: fetch balance from server
        fetchBalance()
      }

      // Show notification
      if (data.message.includes("received")) {
        toast({
          title: "Money Received! 💰",
          description: data.message,
        })
      } else {
        toast({
          title: "Transfer Successful ✅",
          description: data.message,
        })
      }

      // Refresh transaction history after a short delay
      setTimeout(() => {
        window.dispatchEvent(new Event("refresh-transactions"))
      }, 500)
    })

    newSocket.on("disconnect", () => {
      console.log("Disconnected from socket")
    })

    setSocket(newSocket)

    return () => {
      clearInterval(balanceInterval)
      document.removeEventListener('visibilitychange', handleVisibilityChange)
      newSocket.close()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.id])

  const handleTransferSuccess = async () => {
    // Immediately fetch updated balance from server
    await fetchBalance()
    // Trigger immediate transaction history refresh
    window.dispatchEvent(new Event("refresh-transactions"))
  }

  const handleLogout = () => {
    if (socket) {
      socket.close()
    }
    onLogout()
  }

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-lavish dark:bg-lavish-dark p-4 md:p-6">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
              P2P Ledger System
            </h1>
            <p className="text-muted-foreground mt-1">Welcome back, <span className="font-semibold text-foreground">{user.username}</span></p>
          </div>
          <div className="flex items-center gap-2">
            {mounted && (
              <>
                <Button
                  onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
                  variant="ghost"
                  size="icon"
                  className="rounded-full w-10 h-10"
                  aria-label="Toggle dark mode"
                >
                  {theme === "dark" ? (
                    <Sun className="w-5 h-5 text-yellow-400" />
                  ) : (
                    <Moon className="w-5 h-5 text-slate-600" />
                  )}
                </Button>
                <a
                  href="https://github.com/Atharvachavan2005/p2p-money-transfer"
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="View GitHub Repository"
                  className="ml-1 hover:text-primary transition-colors"
                >
                  <GithubIcon size={28} />
                </a>
              </>
            )}
            <Button onClick={handleLogout} variant="outline" className="flex items-center gap-2">
              <LogOut className="w-4 h-4" />
              Logout
            </Button>
          </div>
        </div>

        {/* Balance Card - Lavish Design */}
        <Card className="p-8 md:p-10 mb-8 balance-gradient text-primary-foreground shadow-2xl border-0 overflow-hidden relative">
          <div className="absolute inset-0 bg-white/10 dark:bg-white/5 backdrop-blur-sm"></div>
          <div className="relative z-10">
            <p className="text-sm opacity-90 mb-2 font-medium tracking-wide">YOUR BALANCE</p>
            <h2 className="text-5xl md:text-6xl font-bold transition-all duration-300 mb-4">₹{balance.toFixed(2)}</h2>
            <div className="flex items-center gap-2 text-sm opacity-85">
              <span className="inline-block w-2 h-2 rounded-full bg-white/70"></span>
              <p>Username: <span className="font-semibold">{user.username}</span></p>
            </div>
          </div>
        </Card>

        <div className="grid md:grid-cols-2 gap-8">
          {/* Transfer Section */}
          <div>
            <TransferForm 
              token={localStorage.getItem("token") || ""} 
              onSuccess={handleTransferSuccess}
              currentBalance={balance}
            />
          </div>

          {/* Transaction History */}
          <div>
            <TransactionHistory token={localStorage.getItem("token") || ""} userId={user.id} />
          </div>
        </div>
        
        {/* Made with love footer */}
        <div className="mt-12 pb-6 text-center text-sm text-muted-foreground/70">
          <p>Made with ❤️ by <span className="font-semibold text-foreground">Atharva Pravin Chavan</span></p>
        </div>
      </div>
    </div>
  )
}
