"use client"

import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { LogOut } from "lucide-react"
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

  useEffect(() => {
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
      const response = await fetch("http://localhost:5000/api/transactions/balance", {
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

    const newSocket = io("http://localhost:5000", {
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
      } else if (data.amount) {
        setBalance((prev) => prev + data.amount)
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
      newSocket.close()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.id])

  const handleTransferSuccess = async () => {
    // Fetch updated balance from server
    await fetchBalance()
    // Transaction history will refresh via socket event
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
    <div className="min-h-screen bg-background p-4 md:p-6">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Paisa</h1>
            <p className="text-muted-foreground">Welcome back, {user.username}</p>
          </div>
          <Button onClick={handleLogout} variant="outline" className="flex items-center gap-2 bg-transparent">
            <LogOut className="w-4 h-4" />
            Logout
          </Button>
        </div>

        {/* Balance Card */}
        <Card className="p-6 md:p-8 mb-8 bg-gradient-to-br from-primary to-secondary text-primary-foreground shadow-lg">
          <p className="text-sm opacity-90 mb-2">Your Balance</p>
          <h2 className="text-4xl md:text-5xl font-bold transition-all duration-300">₹{balance.toFixed(2)}</h2>
          <p className="text-sm opacity-75 mt-2">User ID: {user.id}</p>
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
      </div>
    </div>
  )
}
