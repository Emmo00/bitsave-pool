"use client"

import { motion, AnimatePresence } from "framer-motion"
import { X, UserMinus, AlertTriangle, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { useWriteContract, useWaitForTransactionReceipt, useChainId } from "wagmi"
import { getContractAddress, ABIS } from "@/contracts/config"
import { Address } from "viem"
import { useToast } from "@/hooks/use-toast"

interface RemoveParticipantModalProps {
  isOpen: boolean
  onClose: () => void
  planId: string
  participant: {
    address: Address
    ensName?: string
    avatar?: string
    contribution: bigint
  }
  onSuccess?: () => void
}

export function RemoveParticipantModal({ 
  isOpen, 
  onClose, 
  planId, 
  participant,
  onSuccess 
}: RemoveParticipantModalProps) {
  const { toast } = useToast()
  const chainId = useChainId()

  const { writeContract, data: txHash, isPending } = useWriteContract()
  
  const { isLoading: isConfirming } = useWaitForTransactionReceipt({
    hash: txHash,
  })

  const handleRemoveParticipant = async () => {
    const contractAddress = getContractAddress(chainId, 'BITSAVE_POOLS')
    
    try {
      writeContract({
        address: contractAddress,
        abi: ABIS.BITSAVE_POOLS,
        functionName: 'removeParticipant',
        args: [BigInt(planId), participant.address],
      })

      toast({
        title: "Transaction Submitted",
        description: "Removing participant from the plan...",
      })

      onClose()
      onSuccess?.()
    } catch (error) {
      console.error('Failed to remove participant:', error)
      toast({
        title: "Transaction Failed",
        description: "Failed to remove participant. Please try again.",
        variant: "destructive",
      })
    }
  }

  const displayName = participant.ensName || 
    `${participant.address.slice(0, 6)}...${participant.address.slice(-4)}`

  const hasContribution = participant.contribution > 0n

  if (!isOpen) return null

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center p-4"
      >
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.9, opacity: 0 }}
          className="w-full max-w-md"
        >
          <Card className="neomorphic rounded-3xl p-6 border-0">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-destructive/10 flex items-center justify-center">
                  <UserMinus className="w-5 h-5 text-destructive" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-foreground">Remove Participant</h3>
                  <p className="text-sm text-muted-foreground">Remove participant from this plan</p>
                </div>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={onClose}
                className="p-2 rounded-xl"
              >
                <X className="w-4 h-4" />
              </Button>
            </div>

            <div className="space-y-4">
              {/* Participant Info */}
              <div className="flex items-center gap-3 p-4 rounded-2xl bg-muted/50">
                <img
                  src={participant.avatar || "/placeholder.svg"}
                  alt={displayName}
                  className="w-12 h-12 rounded-full"
                />
                <div className="flex-1">
                  <p className="font-medium text-foreground">{displayName}</p>
                  <p className="text-sm text-muted-foreground">
                    {participant.address.slice(0, 6)}...{participant.address.slice(-4)}
                  </p>
                </div>
              </div>

              {/* Warning if participant has contributions */}
              {hasContribution && (
                <div className="flex items-start gap-3 p-4 bg-yellow-50 border border-yellow-200 rounded-2xl">
                  <AlertTriangle className="w-5 h-5 text-yellow-600 mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="text-sm font-medium text-yellow-800">
                      Cannot Remove Participant
                    </p>
                    <p className="text-sm text-yellow-700 mt-1">
                      This participant has active contributions and cannot be removed until they withdraw their funds.
                    </p>
                  </div>
                </div>
              )}

              {!hasContribution && (
                <div className="flex items-start gap-3 p-4 bg-red-50 border border-red-200 rounded-2xl">
                  <AlertTriangle className="w-5 h-5 text-red-600 mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="text-sm font-medium text-red-800">
                      This action cannot be undone
                    </p>
                    <p className="text-sm text-red-700 mt-1">
                      The participant will be permanently removed from this savings plan.
                    </p>
                  </div>
                </div>
              )}

              <div className="flex gap-3 pt-2">
                <Button
                  variant="outline"
                  onClick={onClose}
                  className="flex-1 h-12 rounded-2xl"
                  disabled={isPending || isConfirming}
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleRemoveParticipant}
                  variant="destructive"
                  className="flex-1 h-12 rounded-2xl"
                  disabled={isPending || isConfirming || hasContribution}
                >
                  {isPending || isConfirming ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Removing...
                    </>
                  ) : (
                    "Remove Participant"
                  )}
                </Button>
              </div>
            </div>
          </Card>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  )
}
