"use client"

import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { X, TrendingUp, Check, Clock, Ligature as Signature, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card } from "@/components/ui/card"

interface DepositModalProps {
  isOpen: boolean
  onClose: () => void
  plan: any
}

enum DepositStep {
  FORM = "form",
  APPROVE = "approve",
  SIGN = "sign",
  FINALIZE = "finalize",
  SUCCESS = "success",
}

const depositSteps = [
  { key: DepositStep.APPROVE, label: "Approve Spend", icon: Clock },
  { key: DepositStep.SIGN, label: "Sign Deposit", icon: Signature },
  { key: DepositStep.FINALIZE, label: "Finalizing Deposit", icon: Loader2 },
]

export function DepositModal({ isOpen, onClose, plan }: DepositModalProps) {
  const [amount, setAmount] = useState("")
  const [currentStep, setCurrentStep] = useState<DepositStep>(DepositStep.FORM)

  const handleDeposit = async () => {
    if (!amount || Number.parseFloat(amount) <= 0) return

    console.log("[v0] Starting deposit process")

    // Step 1: Approve spend
    setCurrentStep(DepositStep.APPROVE)
    await new Promise((resolve) => setTimeout(resolve, 2000))
    console.log("[v0] Approve spend completed")

    // Step 2: Sign deposit
    setCurrentStep(DepositStep.SIGN)
    await new Promise((resolve) => setTimeout(resolve, 2500))
    console.log("[v0] Sign deposit completed")

    // Step 3: Finalize deposit
    setCurrentStep(DepositStep.FINALIZE)
    await new Promise((resolve) => setTimeout(resolve, 2000))
    console.log("[v0] Finalize deposit completed")

    // Success
    setCurrentStep(DepositStep.SUCCESS)

    // Close modal after success
    setTimeout(() => {
      setCurrentStep(DepositStep.FORM)
      setAmount("")
      onClose()
    }, 2000)
  }

  const handleClose = () => {
    if (currentStep === DepositStep.FORM) {
      setAmount("")
      onClose()
    }
  }

  const isProcessing = [DepositStep.APPROVE, DepositStep.SIGN, DepositStep.FINALIZE].includes(currentStep)

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
              {currentStep === DepositStep.FORM ? (
                <>
                  <div className="flex items-center justify-between mb-6">
                    <h2 className="text-xl font-bold text-foreground">Make Deposit</h2>
                    <Button variant="ghost" size="sm" onClick={handleClose} className="p-1 h-auto">
                      <X className="w-5 h-5" />
                    </Button>
                  </div>

                  <div className="space-y-4 mb-6">
                    <div className="text-center p-4 rounded-2xl bg-white/10">
                      <p className="text-sm text-muted-foreground mb-1">Contributing to</p>
                      <p className="font-semibold text-foreground">{plan.name}</p>
                    </div>

                    <div>
                      <Label htmlFor="amount" className="text-sm font-medium text-foreground">
                        Amount ({plan.token})
                      </Label>
                      <Input
                        id="amount"
                        type="number"
                        placeholder="0.00"
                        value={amount}
                        onChange={(e) => setAmount(e.target.value)}
                        className="mt-1 rounded-xl border-0 bg-white/10 text-foreground placeholder:text-muted-foreground"
                      />
                    </div>

                    {amount && Number.parseFloat(amount) > 0 && (
                      <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="p-3 rounded-xl bg-white/10"
                      >
                        <div className="flex justify-between text-sm">
                          <span className="text-muted-foreground">New total:</span>
                          <span className="font-medium text-foreground">
                            ${(plan.current + Number.parseFloat(amount)).toLocaleString()}
                          </span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span className="text-muted-foreground">Progress:</span>
                          <span className="font-medium text-foreground">
                            {(((plan.current + Number.parseFloat(amount)) / plan.target) * 100).toFixed(1)}%
                          </span>
                        </div>
                      </motion.div>
                    )}
                  </div>

                  <Button
                    onClick={handleDeposit}
                    disabled={!amount || Number.parseFloat(amount) <= 0}
                    className="w-full h-12 rounded-2xl glow-primary font-semibold"
                  >
                    <TrendingUp className="w-4 h-4 mr-2" />
                    Deposit ${amount || "0"}
                  </Button>
                </>
              ) : isProcessing ? (
                <div className="py-8">
                  <div className="flex items-center justify-between mb-6">
                    <h2 className="text-xl font-bold text-foreground">Processing Deposit</h2>
                  </div>

                  <div className="space-y-6">
                    {depositSteps.map((step, index) => {
                      const StepIcon = step.icon
                      const isCurrentStep = currentStep === step.key
                      const isCompleted = depositSteps.findIndex((s) => s.key === currentStep) > index

                      return (
                        <motion.div
                          key={step.key}
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: index * 0.1 }}
                          className={`flex items-center gap-4 p-4 rounded-2xl transition-all duration-300 ${
                            isCurrentStep
                              ? "bg-primary/20 border border-primary/30"
                              : isCompleted
                                ? "bg-green-500/20 border border-green-500/30"
                                : "bg-white/5 border border-white/10"
                          }`}
                        >
                          <div
                            className={`w-10 h-10 rounded-full flex items-center justify-center ${
                              isCurrentStep
                                ? "bg-primary text-primary-foreground"
                                : isCompleted
                                  ? "bg-green-500 text-white"
                                  : "bg-white/10 text-muted-foreground"
                            }`}
                          >
                            {isCompleted ? (
                              <Check className="w-5 h-5" />
                            ) : isCurrentStep ? (
                              <motion.div
                                animate={{ rotate: 360 }}
                                transition={{ duration: 1, repeat: Number.POSITIVE_INFINITY, ease: "linear" }}
                              >
                                <StepIcon className="w-5 h-5" />
                              </motion.div>
                            ) : (
                              <StepIcon className="w-5 h-5" />
                            )}
                          </div>

                          <div className="flex-1">
                            <p
                              className={`font-medium ${
                                isCurrentStep || isCompleted ? "text-foreground" : "text-muted-foreground"
                              }`}
                            >
                              {step.label}
                            </p>
                            {isCurrentStep && (
                              <motion.p
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                className="text-sm text-muted-foreground mt-1"
                              >
                                Please wait...
                              </motion.p>
                            )}
                          </div>
                        </motion.div>
                      )
                    })}
                  </div>

                  <div className="mt-6 p-4 rounded-2xl bg-white/10">
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Depositing:</span>
                      <span className="font-medium text-foreground">
                        ${amount} {plan.token}
                      </span>
                    </div>
                  </div>
                </div>
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
                  <h3 className="text-xl font-bold text-foreground mb-2">Deposit Successful!</h3>
                  <p className="text-muted-foreground">
                    Your ${amount} {plan.token} deposit has been added to {plan.name}.
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
