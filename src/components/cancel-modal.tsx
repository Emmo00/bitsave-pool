"use client"

import { motion, AnimatePresence } from "framer-motion"
import { X, AlertTriangle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { useWriteContract, useWaitForTransactionReceipt, useChainId } from "wagmi"
import { getContractAddress, ABIS } from "@/contracts/config"
import { useToast } from "@/hooks/use-toast"

interface CancelModalProps {
  isOpen: boolean
  onClose: () => void
  plan: {
    id: string
    name: string
  }
  onSuccess?: () => void
}

export function CancelModal({ isOpen, onClose, plan, onSuccess }: CancelModalProps) {
  const { toast } = useToast()
  const chainId = useChainId()

  const { writeContract, data: txHash, isPending } = useWriteContract()
  
  const { isLoading: isConfirming } = useWaitForTransactionReceipt({
    hash: txHash,
  })

  const handleCancel = async () => {
    const contractAddress = getContractAddress(chainId, 'BITSAVE_POOLS')
    
    try {
      writeContract({
        address: contractAddress,
        abi: ABIS.BITSAVE_POOLS,
        functionName: 'cancelPlan',
        args: [BigInt(plan.id)],
      })

      toast({
        title: "Transaction Submitted",
        description: "Cancelling the savings plan...",
      })

      onClose()
      onSuccess?.()
    } catch (error) {
      console.error('Failed to cancel plan:', error)
      toast({
        title: "Transaction Failed",
        description: "Failed to cancel the plan. Please try again.",
        variant: "destructive",
      })
    }
  }

  const handleClose = () => {
    if (!isPending && !isConfirming) {
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
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            className="w-full max-w-md"
            onClick={(e) => e.stopPropagation()}
          >
            <Card className="neomorphic rounded-3xl p-6 border-0">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-2xl bg-destructive/10 flex items-center justify-center">
                    <AlertTriangle className="w-5 h-5 text-destructive" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-foreground">Cancel Plan</h3>
                    <p className="text-sm text-muted-foreground">This action cannot be undone</p>
                  </div>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleClose}
                  className="p-2 rounded-xl"
                  disabled={isPending || isConfirming}
                >
                  <X className="w-4 h-4" />
                </Button>
              </div>

              <div className="space-y-4">
                <div className="p-4 bg-red-50 border border-red-200 rounded-2xl">
                  <div className="flex items-start gap-3">
                    <AlertTriangle className="w-5 h-5 text-red-600 mt-0.5 flex-shrink-0" />
                    <div>
                      <p className="text-sm font-medium text-red-800">
                        Warning: This will cancel {plan.name}
                      </p>
                      <p className="text-sm text-red-700 mt-1">
                        All participants will be able to withdraw their contributions, but the plan will be permanently cancelled.
                      </p>
                    </div>
                  </div>
                </div>

                <div className="flex gap-3">
                  <Button
                    variant="outline"
                    onClick={handleClose}
                    className="flex-1 h-12 rounded-2xl"
                    disabled={isPending || isConfirming}
                  >
                    Keep Plan
                  </Button>
                  <Button
                    onClick={handleCancel}
                    variant="destructive"
                    className="flex-1 h-12 rounded-2xl"
                    disabled={isPending || isConfirming}
                  >
                    {isPending || isConfirming ? (
                      <>
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                        Cancelling...
                      </>
                    ) : (
                      "Cancel Plan"
                    )}
                  </Button>
                </div>
              </div>
            </Card>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
