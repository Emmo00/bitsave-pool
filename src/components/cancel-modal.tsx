"use client"

import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { X, AlertTriangle, Check } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"

interface CancelModalProps {
  isOpen: boolean
  onClose: () => void
  plan: any
}

export function CancelModal({ isOpen, onClose, plan }: CancelModalProps) {
  const [isCancelling, setIsCancelling] = useState(false)
  const [isSuccess, setIsSuccess] = useState(false)

  const handleCancel = async () => {
    setIsCancelling(true)

    // Simulate cancellation process
    await new Promise((resolve) => setTimeout(resolve, 2000))

    setIsCancelling(false)
    setIsSuccess(true)

    // Close modal after success
    setTimeout(() => {
      setIsSuccess(false)
      onClose()
    }, 2000)
  }

  const handleClose = () => {
    if (!isCancelling) {
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
            <Card className="liquid-glass rounded-3xl p-6 border border-red-500/20 glow-destructive">
              {!isSuccess ? (
                <>
                  <div className="flex items-center justify-between mb-6">
                    <h2 className="text-xl font-bold text-foreground">Cancel Plan</h2>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={handleClose}
                      className="p-1 h-auto"
                      disabled={isCancelling}
                    >
                      <X className="w-5 h-5" />
                    </Button>
                  </div>

                  <div className="space-y-4 mb-6">
                    <div className="flex items-center gap-3 p-4 rounded-2xl bg-red-500/10 border border-red-500/20">
                      <AlertTriangle className="w-5 h-5 text-red-600" />
                      <div>
                        <p className="text-sm font-medium text-red-700">Warning</p>
                        <p className="text-xs text-red-600">This action cannot be undone.</p>
                      </div>
                    </div>

                    <div className="space-y-3">
                      <div className="flex justify-between p-3 rounded-xl bg-white/10">
                        <span className="text-muted-foreground">Plan:</span>
                        <span className="font-medium text-foreground">{plan.name}</span>
                      </div>
                      <div className="flex justify-between p-3 rounded-xl bg-white/10">
                        <span className="text-muted-foreground">Current Amount:</span>
                        <span className="font-medium text-foreground">
                          ${plan.current.toLocaleString()} {plan.token}
                        </span>
                      </div>
                      <div className="flex justify-between p-3 rounded-xl bg-white/10">
                        <span className="text-muted-foreground">Participants:</span>
                        <span className="font-medium text-foreground">{plan.participants}</span>
                      </div>
                    </div>

                    <div className="p-4 rounded-2xl bg-red-500/10 border border-red-500/20">
                      <p className="text-sm text-red-700">
                        Cancelling this plan will refund all participants their contributions and permanently close the
                        savings plan.
                      </p>
                    </div>
                  </div>

                  <div className="space-y-3">
                    <Button
                      onClick={handleCancel}
                      disabled={isCancelling}
                      className="w-full h-12 rounded-2xl bg-red-600 hover:bg-red-700 text-white font-semibold"
                    >
                      {isCancelling ? (
                        <div className="flex items-center gap-2">
                          <motion.div
                            animate={{ rotate: 360 }}
                            transition={{ duration: 1, repeat: Number.POSITIVE_INFINITY, ease: "linear" }}
                            className="w-4 h-4 border-2 border-white border-t-transparent rounded-full"
                          />
                          <span>Cancelling Plan...</span>
                        </div>
                      ) : (
                        <>
                          <AlertTriangle className="w-4 h-4 mr-2" />
                          Yes, Cancel Plan
                        </>
                      )}
                    </Button>
                    <Button
                      variant="outline"
                      onClick={handleClose}
                      disabled={isCancelling}
                      className="w-full h-12 rounded-2xl border-white/20 text-foreground hover:bg-white/10 bg-transparent"
                    >
                      Keep Plan Active
                    </Button>
                  </div>
                </>
              ) : (
                <div className="text-center py-8">
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ type: "spring", duration: 0.6 }}
                    className="w-16 h-16 bg-red-500 rounded-full flex items-center justify-center mx-auto mb-4"
                  >
                    <Check className="w-8 h-8 text-white" />
                  </motion.div>
                  <h3 className="text-xl font-bold text-foreground mb-2">Plan Cancelled</h3>
                  <p className="text-muted-foreground">All participants have been refunded their contributions.</p>
                </div>
              )}
            </Card>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
