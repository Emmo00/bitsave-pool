"use client"

import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Check, X, Calendar, Target, Users, Coins } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import type { PlanFormData } from "./create-savings-flow"

interface ConfirmationModalProps {
  isOpen: boolean
  onClose: () => void
  onConfirm: () => void
  planData: PlanFormData
}

export function ConfirmationModal({ isOpen, onClose, onConfirm, planData }: ConfirmationModalProps) {
  const [isCreating, setIsCreating] = useState(false)
  const [isSuccess, setIsSuccess] = useState(false)

  const handleConfirm = async () => {
    setIsCreating(true)

    // Simulate creation process
    await new Promise((resolve) => setTimeout(resolve, 2000))

    setIsCreating(false)
    setIsSuccess(true)

    // Wait a bit then call onConfirm
    setTimeout(() => {
      onConfirm()
    }, 1500)
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
          onClick={onClose}
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
                  {/* Header */}
                  <div className="flex items-center justify-between mb-6">
                    <h2 className="text-xl font-bold text-foreground">Confirm Plan</h2>
                    <Button variant="ghost" size="sm" onClick={onClose} className="p-1 h-auto" disabled={isCreating}>
                      <X className="w-5 h-5" />
                    </Button>
                  </div>

                  {/* Plan Details */}
                  <div className="space-y-4 mb-6">
                    <div className="flex items-center gap-3 p-4 rounded-2xl bg-white/10">
                      <Target className="w-5 h-5 text-primary" />
                      <div>
                        <p className="font-semibold text-foreground">{planData.planName}</p>
                        <p className="text-sm text-muted-foreground">Plan Name</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-3 p-4 rounded-2xl bg-white/10">
                      <Coins className="w-5 h-5 text-secondary" />
                      <div>
                        <p className="font-semibold text-foreground">
                          ${Number.parseInt(planData.targetAmount || "0").toLocaleString()} {planData.stablecoin}
                        </p>
                        <p className="text-sm text-muted-foreground">Target Amount</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-3 p-4 rounded-2xl bg-white/10">
                      <Calendar className="w-5 h-5 text-accent" />
                      <div>
                        <p className="font-semibold text-foreground">
                          {new Date(planData.deadline).toLocaleDateString()}
                        </p>
                        <p className="text-sm text-muted-foreground">Deadline</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-3 p-4 rounded-2xl bg-white/10">
                      <Users className="w-5 h-5 text-primary" />
                      <div>
                        <p className="font-semibold text-foreground">{planData.participants.length + 1} participants</p>
                        <p className="text-sm text-muted-foreground">Including you</p>
                      </div>
                    </div>

                    {/* Participants List */}
                    {planData.participants.length > 0 && (
                      <div className="p-4 rounded-2xl bg-white/10">
                        <p className="text-sm font-medium text-foreground mb-3">Participants</p>
                        <div className="space-y-2">
                          {planData.participants.map((participant) => (
                            <div key={participant.id} className="flex items-center gap-2">
                              <img
                                src={participant.avatar || "/placeholder.svg"}
                                alt={participant.ensName || participant.address}
                                className="w-6 h-6 rounded-full"
                              />
                              <span className="text-sm text-foreground">
                                {participant.ensName ||
                                  `${participant.address.slice(0, 6)}...${participant.address.slice(-4)}`}
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Action Buttons */}
                  <div className="space-y-3">
                    <Button
                      onClick={handleConfirm}
                      disabled={isCreating}
                      className="w-full h-12 rounded-2xl glow-primary font-semibold"
                    >
                      {isCreating ? (
                        <div className="flex items-center gap-2">
                          <motion.div
                            animate={{ rotate: 360 }}
                            transition={{ duration: 1, repeat: Number.POSITIVE_INFINITY, ease: "linear" }}
                            className="w-4 h-4 border-2 border-primary-foreground border-t-transparent rounded-full"
                          />
                          <span>Creating Plan...</span>
                        </div>
                      ) : (
                        "Create Savings Plan"
                      )}
                    </Button>
                    <Button
                      variant="outline"
                      onClick={onClose}
                      disabled={isCreating}
                      className="w-full h-12 rounded-2xl border-white/20 text-foreground hover:bg-white/10 bg-transparent"
                    >
                      Cancel
                    </Button>
                  </div>
                </>
              ) : (
                /* Success State */
                <div className="text-center py-8">
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ type: "spring", duration: 0.6 }}
                    className="w-16 h-16 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-4"
                  >
                    <Check className="w-8 h-8 text-white" />
                  </motion.div>
                  <h3 className="text-xl font-bold text-foreground mb-2">Plan Created!</h3>
                  <p className="text-muted-foreground">
                    Your savings plan "{planData.planName}" has been created successfully.
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
