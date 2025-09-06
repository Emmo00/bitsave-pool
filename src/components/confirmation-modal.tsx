"use client"

import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Check, X, Calendar, Target, Users, Coins, Loader2, CheckCircle2, Clock, AlertCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { SUPPORTED_TOKENS } from "@/contracts/config"
import { useBitSaveContracts } from "@/contracts/hooks"
import { useAccount, useWaitForTransactionReceipt } from "wagmi"
import type { PlanFormData } from "./create-savings-flow"

interface ConfirmationModalProps {
  isOpen: boolean
  onClose: () => void
  onConfirm: () => void
  planData: PlanFormData
}

type TransactionStep = "idle" | "signing" | "confirming" | "success" | "error"

export function ConfirmationModal({ isOpen, onClose, onConfirm, planData }: ConfirmationModalProps) {
  const [currentStep, setCurrentStep] = useState<TransactionStep>("idle")
  const { address } = useAccount()
  
  const {
    createPlan,
    isPending,
    error,
    hash
  } = useBitSaveContracts()

  // Use separate hook for waiting for confirmations
  const { 
    isLoading: isConfirming, 
    isSuccess 
  } = useWaitForTransactionReceipt({
    hash,
    confirmations: 2, // Wait for 2 confirmations
  })

  // Get the token info from supported tokens
  const selectedToken = SUPPORTED_TOKENS.find(token => token.symbol === planData.stablecoin)

  useEffect(() => {
    if (isPending) {
      setCurrentStep("signing")
    } else if (isConfirming) {
      setCurrentStep("confirming")
    } else if (isSuccess) {
      setCurrentStep("success")
      // Auto-trigger success callback after a brief delay
      setTimeout(() => {
        onConfirm()
      }, 2000)
    } else if (error) {
      setCurrentStep("error")
    }
  }, [isPending, isConfirming, isSuccess, error, onConfirm])

  const handleConfirm = () => {
    if (!address) return

    // Find the selected token
    const selectedToken = SUPPORTED_TOKENS.find(token => token.symbol === planData.stablecoin)
    if (!selectedToken) {
      console.error("Token not found:", planData.stablecoin)
      return
    }

    // Convert deadline to timestamp
    const deadlineTimestamp = BigInt(Math.floor(new Date(planData.deadline).getTime() / 1000))
    
    // Extract participant addresses
    const participantAddresses = planData.participants.map(p => p.address as `0x${string}`)

    // Start the transaction
    setCurrentStep("signing")
    createPlan(
      planData.planName,
      selectedToken.address,
      planData.targetAmount,
      address, // beneficiary is the creator
      deadlineTimestamp,
      participantAddresses
    )
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
              {currentStep === "success" ? (
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
              ) : currentStep === "signing" || currentStep === "confirming" ? (
                /* Transaction Steps */
                <div className="space-y-6">
                  <div className="flex items-center justify-between mb-6">
                    <h2 className="text-xl font-bold text-foreground">Creating Plan</h2>
                    <Button variant="ghost" size="sm" onClick={onClose} className="p-1 h-auto" disabled>
                      <X className="w-5 h-5" />
                    </Button>
                  </div>

                  {/* Transaction Steps */}
                  <div className="space-y-4">
                    {/* Step 1: Signing */}
                    <motion.div
                      initial={{ x: 20, opacity: 0 }}
                      animate={{ x: 0, opacity: 1 }}
                      transition={{ duration: 0.4 }}
                    >
                      <Card className={`p-4 border-2 transition-all duration-300 ${
                        currentStep === "signing" ? "border-primary bg-primary/5" : "border-green-500 bg-green-50"
                      }`}>
                        <div className="flex items-start gap-3">
                          <div className={`rounded-full p-2 transition-all duration-300 ${
                            currentStep === "signing" ? "bg-primary text-primary-foreground" : "bg-green-500 text-white"
                          }`}>
                            {currentStep === "signing" ? (
                              <Loader2 className="w-4 h-4 animate-spin" />
                            ) : (
                              <CheckCircle2 className="w-4 h-4" />
                            )}
                          </div>
                          <div className="flex-1 space-y-1">
                            <h4 className="font-medium text-foreground">Sign Creation</h4>
                            <p className="text-sm text-muted-foreground">
                              Confirm the savings plan creation in your wallet
                            </p>
                          </div>
                        </div>
                      </Card>
                    </motion.div>

                    {/* Step 2: Confirming */}
                    <motion.div
                      initial={{ x: 20, opacity: 0 }}
                      animate={{ x: 0, opacity: 1 }}
                      transition={{ duration: 0.4, delay: 0.1 }}
                    >
                      <Card className={`p-4 border-2 transition-all duration-300 ${
                        currentStep === "confirming" ? "border-primary bg-primary/5" : "border-muted"
                      }`}>
                        <div className="flex items-start gap-3">
                          <div className={`rounded-full p-2 transition-all duration-300 ${
                            currentStep === "confirming" ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"
                          }`}>
                            {currentStep === "confirming" ? (
                              <Loader2 className="w-4 h-4 animate-spin" />
                            ) : (
                              <Clock className="w-4 h-4" />
                            )}
                          </div>
                          <div className="flex-1 space-y-1">
                            <h4 className="font-medium text-foreground">Finalizing</h4>
                            <p className="text-sm text-muted-foreground">
                              Waiting for blockchain confirmations
                            </p>
                          </div>
                        </div>
                      </Card>
                    </motion.div>
                  </div>
                </div>
              ) : currentStep === "error" ? (
                /* Error State */
                <div className="space-y-6">
                  <div className="flex items-center justify-between mb-6">
                    <h2 className="text-xl font-bold text-foreground">Transaction Failed</h2>
                    <Button variant="ghost" size="sm" onClick={onClose} className="p-1 h-auto">
                      <X className="w-5 h-5" />
                    </Button>
                  </div>

                  <div className="text-center py-8">
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ type: "spring", duration: 0.6 }}
                      className="w-16 h-16 bg-red-500 rounded-full flex items-center justify-center mx-auto mb-4"
                    >
                      <AlertCircle className="w-8 h-8 text-white" />
                    </motion.div>
                    <h3 className="text-xl font-bold text-foreground mb-2">Transaction Failed</h3>
                    <p className="text-muted-foreground mb-4">
                      {error?.message || "Something went wrong while creating your savings plan."}
                    </p>
                    <Button
                      onClick={() => setCurrentStep("idle")}
                      className="w-full h-12 rounded-2xl glow-primary font-semibold"
                    >
                      Try Again
                    </Button>
                  </div>
                </div>
              ) : (
                /* Initial Confirmation State */
                <>
                  {/* Header */}
                  <div className="flex items-center justify-between mb-6">
                    <h2 className="text-xl font-bold text-foreground">Confirm Plan</h2>
                    <Button variant="ghost" size="sm" onClick={onClose} className="p-1 h-auto">
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
                        <p className="text-sm text-muted-foreground">
                          Target Amount {selectedToken ? `(${selectedToken.name})` : ''}
                        </p>
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
                      disabled={currentStep !== "idle"}
                      className="w-full h-12 rounded-2xl glow-primary font-semibold"
                    >
                      Create Savings Plan
                    </Button>
                    <Button
                      variant="outline"
                      onClick={onClose}
                      disabled={currentStep !== "idle"}
                      className="w-full h-12 rounded-2xl border-white/20 text-foreground hover:bg-white/10 bg-transparent"
                    >
                      Cancel
                    </Button>
                  </div>
                </>
              )}
            </Card>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
