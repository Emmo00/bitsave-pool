"use client"

import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { X, Download, Check, AlertTriangle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { useWithdraw } from "@/contracts/hooks"

interface WithdrawModalProps {
  isOpen: boolean
  onClose: () => void
  plan: any
  onSuccess?: () => void
}

export function WithdrawModal({ isOpen, onClose, plan, onSuccess }: WithdrawModalProps) {
  const { withdrawToBeneficiary, isPending, isConfirming, isSuccess, error } = useWithdraw()
  const [hasCompletedWithdraw, setHasCompletedWithdraw] = useState(false)

  // Reset state when modal opens
  useEffect(() => {
    if (isOpen) {
      setHasCompletedWithdraw(false)
    }
  }, [isOpen])

  // Handle successful withdrawal
  useEffect(() => {
    if (isSuccess && !hasCompletedWithdraw) {
      setHasCompletedWithdraw(true)
      onSuccess?.() // Call refresh function from parent
      
      // Close modal after success
      setTimeout(() => {
        onClose()
      }, 2000)
    }
  }, [isSuccess, hasCompletedWithdraw, onSuccess, onClose])

  const handleWithdraw = async () => {
    try {
      await withdrawToBeneficiary(Number(plan.id))
    } catch (error) {
      console.error("Withdrawal failed:", error)
    }
  }

  const handleClose = () => {
    if (!isPending && !isConfirming) {
      setHasCompletedWithdraw(false)
      onClose()
    }
  }

  const isProcessing = isPending || isConfirming

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
          onClick={handleClose}
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.9, opacity: 0, y: 20 }}
            transition={{ type: "spring", duration: 0.5 }}
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-md"
          >
            <Card className="liquid-glass rounded-3xl p-6 border border-white/20">
              {!hasCompletedWithdraw ? (
                <>
                  <div className="flex items-center justify-between mb-6">
                    <h2 className="text-xl font-bold text-foreground">Withdraw Funds</h2>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={handleClose}
                      className="p-1 h-auto"
                      disabled={isProcessing}
                    >
                      <X className="w-5 h-5" />
                    </Button>
                  </div>

                  <div className="space-y-4 mb-6">
                    <div className="flex items-center gap-3 p-4 rounded-2xl bg-green-500/10 border border-green-500/20">
                      <AlertTriangle className="w-5 h-5 text-green-600" />
                      <div>
                        <p className="text-sm font-medium text-green-700">Target Reached!</p>
                        <p className="text-xs text-green-600">You can now withdraw the funds to the beneficiary.</p>
                      </div>
                    </div>

                    <div className="space-y-3">
                      <div className="flex justify-between p-3 rounded-xl bg-white/10">
                        <span className="text-muted-foreground">Plan:</span>
                        <span className="font-medium text-foreground">{plan.name}</span>
                      </div>
                      <div className="flex justify-between p-3 rounded-xl bg-white/10">
                        <span className="text-muted-foreground">Total Amount:</span>
                        <span className="font-medium text-foreground">
                          {plan.current.toLocaleString()} {plan.token}
                        </span>
                      </div>
                      <div className="flex justify-between p-3 rounded-xl bg-white/10">
                        <span className="text-muted-foreground">Beneficiary:</span>
                        <span className="font-medium text-foreground">{plan.beneficiary}</span>
                      </div>
                    </div>

                    <div className="p-4 rounded-2xl bg-blue-500/10 border border-blue-500/20">
                      <p className="text-sm text-blue-700">
                        <strong>Note:</strong> This action will withdraw all funds to the beneficiary address 
                        and mark the plan as "withdrawn".
                      </p>
                    </div>

                    {error && (
                      <div className="p-4 rounded-2xl bg-red-500/10 border border-red-500/20">
                        <p className="text-sm text-red-700">
                          <strong>Error:</strong> {error.message || "Withdrawal failed. Please try again."}
                        </p>
                      </div>
                    )}
                  </div>

                  <Button
                    onClick={handleWithdraw}
                    disabled={isProcessing}
                    className="w-full h-12 rounded-2xl bg-green-600 hover:bg-green-700 text-white font-semibold"
                  >
                    {isProcessing ? (
                      <div className="flex items-center gap-2">
                        <motion.div
                          animate={{ rotate: 360 }}
                          transition={{ duration: 1, repeat: Number.POSITIVE_INFINITY, ease: "linear" }}
                          className="w-4 h-4 border-2 border-white border-t-transparent rounded-full"
                        />
                        <span>
                          {isPending ? "Confirming..." : "Processing Withdrawal..."}
                        </span>
                      </div>
                    ) : (
                      <>
                        <Download className="w-4 h-4 mr-2" />
                        Withdraw {plan.current.toLocaleString()} {plan.token}
                      </>
                    )}
                  </Button>
                </>
              ) : (
                <div className="text-center py-8">
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ type: "spring", duration: 0.6 }}
                    className="w-16 h-16 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-4"
                  >
                    <Check className="w-8 h-8 text-white" />
                  </motion.div>
                  <h3 className="text-xl font-bold text-foreground mb-2">Withdrawal Complete!</h3>
                  <p className="text-muted-foreground">
                    Funds have been withdrawn to the beneficiary. Plan status updated to "withdrawn".
                  </p>
                </div>
              )}
            </Card>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
