"use client"

import { useEffect, useState } from "react"
import { Card } from "@/components/ui/card"
import { ArrowDownLeft, ArrowUpRight, Loader } from "lucide-react"
import { formatDistanceToNow } from "date-fns"

interface Transaction {
  id: string
  transactionId: string
  senderId: string
  receiverId: string
  amount: number
  status: string
  timestamp: string
}

interface TransactionHistoryProps {
  token: string
  userId: string
}

export default function TransactionHistory({ token, userId }: TransactionHistoryProps) {
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    fetchTransactions()
    const interval = setInterval(fetchTransactions, 5000)
    
    // Listen for refresh event from socket updates
    const handleRefresh = () => {
      fetchTransactions()
    }
    window.addEventListener("refresh-transactions", handleRefresh)
    
    return () => {
      clearInterval(interval)
      window.removeEventListener("refresh-transactions", handleRefresh)
    }
  }, [])

  const fetchTransactions = async () => {
    try {
      const response = await fetch("https://p2p-money-transfer-server.vercel.app/api/transactions/history", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })

      if (response.ok) {
        const data = await response.json()
        setTransactions(data)
      } else if (response.status === 401 || response.status === 403) {
        // Token expired or invalid
        localStorage.removeItem("token")
        localStorage.removeItem("user")
        window.location.href = "/"
      }
    } catch (err) {
      console.error("Failed to fetch transactions:", err)
    } finally {
      setIsLoading(false)
    }
  }

  const isOutgoing = (transaction: Transaction) => transaction.senderId === userId

  return (
    <Card className="p-6 md:p-8 border border-border/50 bg-card/80 dark:bg-card/60 shadow-xl backdrop-blur-sm hover:shadow-2xl transition-all duration-300">
      <h3 className="text-2xl font-bold mb-6 text-foreground flex items-center gap-3">
        <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-primary to-accent flex items-center justify-center">
          <ArrowDownLeft className="w-5 h-5 text-primary-foreground" />
        </div>
        Transaction History
      </h3>

      {isLoading ? (
        <div className="flex items-center justify-center py-8">
          <Loader className="w-5 h-5 text-primary animate-spin" />
        </div>
      ) : transactions.length === 0 ? (
        <div className="text-center py-8">
          <p className="text-muted-foreground">No transactions yet</p>
        </div>
      ) : (
        <div className="space-y-3 max-h-[500px] overflow-y-auto pr-2">
          {transactions.map((tx) => (
            <div
              key={tx.id}
              className="flex items-center justify-between p-4 bg-card/40 dark:bg-card/30 border border-border/30 rounded-lg hover:bg-card/60 dark:hover:bg-card/50 hover:border-border/50 transition-all duration-200 backdrop-blur-sm"
            >
              <div className="flex items-center gap-3 flex-1 min-w-0">
                <div className={`p-2.5 rounded-lg ${isOutgoing(tx) ? "bg-destructive/15 dark:bg-destructive/20" : "bg-accent/15 dark:bg-accent/20"}`}>
                  {isOutgoing(tx) ? (
                    <ArrowUpRight className={`w-4 h-4 text-destructive`} />
                  ) : (
                    <ArrowDownLeft className={`w-4 h-4 text-accent`} />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-foreground truncate">
                    {isOutgoing(tx) ? "Sent to" : "Received from"} {isOutgoing(tx) ? tx.receiverId : tx.senderId}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {formatDistanceToNow(new Date(tx.timestamp), { addSuffix: true })}
                  </p>
                </div>
              </div>
              <div className="text-right ml-2">
                <p className={`text-sm font-bold ${isOutgoing(tx) ? "text-destructive" : "text-accent"}`}>
                  {isOutgoing(tx) ? "-" : "+"}₹{tx.amount.toFixed(2)}
                </p>
                <p className="text-xs text-muted-foreground font-medium">{tx.status}</p>
              </div>
            </div>
          ))}
        </div>
      )}
    </Card>
  )
}
