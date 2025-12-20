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
      const response = await fetch("http://localhost:5000/api/transactions/history", {
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
    <Card className="p-6 md:p-8 border border-border bg-card shadow-lg">
      <h3 className="text-xl font-bold mb-6 text-foreground">Transaction History</h3>

      {isLoading ? (
        <div className="flex items-center justify-center py-8">
          <Loader className="w-5 h-5 text-primary animate-spin" />
        </div>
      ) : transactions.length === 0 ? (
        <div className="text-center py-8">
          <p className="text-muted-foreground">No transactions yet</p>
        </div>
      ) : (
        <div className="space-y-3 max-h-[500px] overflow-y-auto">
          {transactions.map((tx) => (
            <div
              key={tx.id}
              className="flex items-center justify-between p-3 bg-muted rounded-lg hover:bg-muted/70 transition-colors"
            >
              <div className="flex items-center gap-3 flex-1 min-w-0">
                <div className={`p-2 rounded-full ${isOutgoing(tx) ? "bg-destructive/10" : "bg-accent/10"}`}>
                  {isOutgoing(tx) ? (
                    <ArrowUpRight className={`w-4 h-4 text-destructive`} />
                  ) : (
                    <ArrowDownLeft className={`w-4 h-4 text-accent`} />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-foreground truncate">
                    {isOutgoing(tx) ? "Sent to" : "Received from"} {isOutgoing(tx) ? tx.receiverId : tx.senderId}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {formatDistanceToNow(new Date(tx.timestamp), { addSuffix: true })}
                  </p>
                </div>
              </div>
              <div className="text-right ml-2">
                <p className={`text-sm font-semibold ${isOutgoing(tx) ? "text-destructive" : "text-accent"}`}>
                  {isOutgoing(tx) ? "-" : "+"}₹{tx.amount.toFixed(2)}
                </p>
                <p className="text-xs text-muted-foreground">{tx.status}</p>
              </div>
            </div>
          ))}
        </div>
      )}
    </Card>
  )
}
