"use client"

import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { X, Download, Check, AlertTriangle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"

interface WithdrawModalProps {
  isOpen: boolean
  onClose: () => void
  plan: any
}

export function WithdrawModal({ isOpen, onClose, plan }: WithdrawModalProps) {
  const [isWithdrawing, setIsWithdrawing] = useState(false)
  const [isSuccess, setIsSuccess] = useState(false)

  const handleWithdraw = async () => {
    setIsWithdrawing(true)

    // Simulate withdrawal process
    await new Promise((resolve) => setTimeout(resolve, 3000))

    setIsWithdrawing(false)
    setIsSuccess(true)

    // Close modal after success
    setTimeout(() => {
      setIsSuccess(false)
      onClose()
    }, 2000)
  }

  const handleClose = () => {
    if (!isWithdrawing) {
      setIsSuccess(false)
      onClose()
    }
  }

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
              {!isSuccess ? (
                <>
                  <div className="flex items-center justify-between mb-6">
                    <h2 className="text-xl font-bold text-foreground">Withdraw Funds</h2>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={handleClose}
                      className="p-1 h-auto"
                      disabled={isWithdrawing}
                    >
                      <X className="w-5 h-5" />
                    </Button>
                  </div>

                  <div className="space-y-4 mb-6">
                    <div className="flex items-center gap-3 p-4 rounded-2xl bg-green-500/10 border border-green-500/20">
                      <AlertTriangle className="w-5 h-5 text-green-600" />
                      <div>
                        <p className="text-sm font-medium text-green-700">Target Reached!</p>
                        <p className="text-xs text-green-600">You can now withdraw the funds.</p>
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
                          ${plan.current.toLocaleString()} {plan.token}
                        </span>
                      </div>
                      <div className="flex justify-between p-3 rounded-xl bg-white/10">
                        <span className="text-muted-foreground">Participants:</span>
                        <span className="font-medium text-foreground">{plan.participants}</span>
                      </div>
                    </div>

                    <div className="p-4 rounded-2xl bg-orange-500/10 border border-orange-500/20">
                      <p className="text-sm text-orange-700">
                        <strong>Note:</strong> This action will distribute the funds to all participants based on their
                        contributions and mark the plan as completed.
                      </p>
                    </div>
                  </div>

                  <Button
                    onClick={handleWithdraw}
                    disabled={isWithdrawing}
                    className="w-full h-12 rounded-2xl bg-green-600 hover:bg-green-700 text-white font-semibold"
                  >
                    {isWithdrawing ? (
                      <div className="flex items-center gap-2">
                        <motion.div
                          animate={{ rotate: 360 }}
                          transition={{ duration: 1, repeat: Number.POSITIVE_INFINITY, ease: "linear" }}
                          className="w-4 h-4 border-2 border-white border-t-transparent rounded-full"
                        />
                        <span>Processing Withdrawal...</span>
                      </div>
                    ) : (
                      <>
                        <Download className="w-4 h-4 mr-2" />
                        Withdraw ${plan.current.toLocaleString()}
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
                    Funds have been distributed to all participants. Plan marked as completed.
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
