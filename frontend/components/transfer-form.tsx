"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { AlertCircle, CheckCircle, Send } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

interface TransferFormProps {
  token: string
  onSuccess: () => void
  currentBalance: number
}

export default function TransferForm({ token, onSuccess, currentBalance }: TransferFormProps) {
  const [receiverId, setReceiverId] = useState("")
  const [amount, setAmount] = useState("")
  const [error, setError] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  const [isProcessing, setIsProcessing] = useState(false) // Race condition prevention
  const { toast } = useToast()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")

    // Race Condition Prevention: Prevent multiple simultaneous requests
    if (isProcessing || isLoading) {
      toast({
        title: "Please wait",
        description: "A transaction is already in progress",
      })
      return
    }

    if (!receiverId.trim()) {
      setError("Please enter the recipient User ID")
      return
    }

    const transferAmount = Number.parseFloat(amount)
    if (!amount || transferAmount <= 0) {
      setError("Please enter a valid amount")
      return
    }

    if (transferAmount > currentBalance) {
      setError("Transaction failed: Insufficient funds")
      toast({
        title: "Insufficient Funds",
        description: `You have ₹${currentBalance.toFixed(2)} but tried to send ₹${transferAmount.toFixed(2)}`,
        variant: "destructive",
      })
      return
    }

    setIsLoading(true)
    setIsProcessing(true) // Lock the form

    try {
      const response = await fetch("http://localhost:5000/api/transactions/transfer", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          receiverId,
          amount: Number.parseFloat(amount),
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        // Handle specific error cases
        const errorMsg = data.message || "Transfer failed"
        setError(errorMsg)
        
        // Show toast for better UX
        toast({
          title: "Transfer Failed",
          description: errorMsg,
          variant: "destructive",
        })
        return
      }

      setSuccess(true)
      toast({
        title: "Success! ✅",
        description: `₹${transferAmount.toFixed(2)} sent successfully`,
      })
      onSuccess()

      setTimeout(() => {
        setReceiverId("")
        setAmount("")
        setSuccess(false)
      }, 2000)
    } catch (err) {
      const errorMsg = "Connection error. Please check if the backend is running."
      setError(errorMsg)
      toast({
        title: "Connection Error",
        description: errorMsg,
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
      setIsProcessing(false) // Unlock the form
    }
  }

  return (
    <Card className="p-6 md:p-8 border border-border bg-card shadow-lg">
      <h3 className="text-xl font-bold mb-6 text-foreground flex items-center gap-2">
        <Send className="w-5 h-5 text-primary" />
        Send Money
      </h3>

      {error && (
        <div className="mb-4 p-3 bg-destructive/10 border border-destructive/20 rounded-lg flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-destructive mt-0.5 flex-shrink-0" />
          <p className="text-sm text-destructive">{error}</p>
        </div>
      )}

      {success && (
        <div className="mb-4 p-3 bg-accent/10 border border-accent/20 rounded-lg flex items-start gap-3">
          <CheckCircle className="w-5 h-5 text-accent mt-0.5 flex-shrink-0" />
          <p className="text-sm text-accent">Money sent successfully!</p>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-foreground mb-2">Recipient User ID</label>
          <Input
            type="text"
            placeholder="Enter the User ID of the recipient"
            value={receiverId}
            onChange={(e) => setReceiverId(e.target.value)}
            disabled={isLoading}
            className="bg-input border-border"
            required
          />
          <p className="text-xs text-muted-foreground mt-1">Ask the recipient to share their User ID</p>
        </div>

        <div>
          <label className="block text-sm font-medium text-foreground mb-2">Amount (₹)</label>
          <Input
            type="number"
            placeholder="Enter amount"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            disabled={isLoading}
            className="bg-input border-border"
            step="0.01"
            min="0"
            max={currentBalance}
            required
          />
          <p className="text-xs text-muted-foreground mt-1">
            Available: ₹{currentBalance.toFixed(2)}
          </p>
        </div>

        <Button
          type="submit"
          disabled={isLoading || isProcessing}
          className="w-full bg-primary hover:bg-primary/90 text-primary-foreground font-medium py-2"
        >
          {isLoading || isProcessing ? "Processing..." : "Send Money"}
        </Button>
      </form>
    </Card>
  )
}
