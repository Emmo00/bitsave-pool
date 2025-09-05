"use client"

import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { X, UserPlus, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card } from "@/components/ui/card"
import { useWriteContract, useWaitForTransactionReceipt } from "wagmi"
import { getContractAddress, ABIS } from "@/contracts/config"
import { baseSepolia } from "wagmi/chains"
import { Address } from "viem"
import { resolveENSOrAddress } from "@/utils/ens"
import { useToast } from "@/hooks/use-toast"

interface AddParticipantModalProps {
  isOpen: boolean
  onClose: () => void
  planId: string
  onSuccess?: () => void
}

export function AddParticipantModal({ isOpen, onClose, planId, onSuccess }: AddParticipantModalProps) {
  const [participantInput, setParticipantInput] = useState("")
  const [resolving, setResolving] = useState(false)
  const [resolvedAddress, setResolvedAddress] = useState<Address | null>(null)
  const { toast } = useToast()

  const { writeContract, data: txHash, isPending } = useWriteContract()
  
  const { isLoading: isConfirming } = useWaitForTransactionReceipt({
    hash: txHash,
  })

  const handleResolveAddress = async () => {
    if (!participantInput.trim()) return

    setResolving(true)
    try {
      const { address } = await resolveENSOrAddress(participantInput.trim())
      setResolvedAddress(address as Address)
    } catch (error) {
      console.error('Failed to resolve address:', error)
      toast({
        title: "Invalid Address",
        description: "Could not resolve the provided address or ENS name.",
        variant: "destructive",
      })
      setResolvedAddress(null)
    } finally {
      setResolving(false)
    }
  }

  const handleAddParticipant = async () => {
    if (!resolvedAddress) {
      await handleResolveAddress()
      return
    }

    const contractAddress = getContractAddress(baseSepolia.id, 'BITSAVE_POOLS')
    
    try {
      writeContract({
        address: contractAddress,
        abi: ABIS.BITSAVE_POOLS,
        functionName: 'addParticipant',
        args: [BigInt(planId), resolvedAddress],
      })

      toast({
        title: "Transaction Submitted",
        description: "Adding participant to the plan...",
      })

      setParticipantInput("")
      setResolvedAddress(null)
      onClose()
      onSuccess?.()
    } catch (error) {
      console.error('Failed to add participant:', error)
      toast({
        title: "Transaction Failed",
        description: "Failed to add participant. Please try again.",
        variant: "destructive",
      })
    }
  }

  const handleInputChange = (value: string) => {
    setParticipantInput(value)
    setResolvedAddress(null)
  }

  const isValidInput = participantInput.trim().length > 0
  const showResolvedAddress = resolvedAddress && resolvedAddress !== participantInput

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
                <div className="w-10 h-10 rounded-2xl bg-primary/10 flex items-center justify-center">
                  <UserPlus className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-foreground">Add Participant</h3>
                  <p className="text-sm text-muted-foreground">Add a new participant to this plan</p>
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
              <div>
                <Label htmlFor="participant" className="text-sm font-medium text-foreground">
                  Address or ENS Name
                </Label>
                <Input
                  id="participant"
                  type="text"
                  placeholder="0x... or username.eth"
                  value={participantInput}
                  onChange={(e) => handleInputChange(e.target.value)}
                  className="mt-1 h-12 rounded-2xl bg-muted/50 border-0"
                />
                {showResolvedAddress && (
                  <div className="mt-2 p-3 bg-green-50 border border-green-200 rounded-xl">
                    <p className="text-sm text-green-800">
                      <span className="font-medium">Resolved to:</span> {resolvedAddress}
                    </p>
                  </div>
                )}
              </div>

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
                  onClick={handleAddParticipant}
                  className="flex-1 h-12 rounded-2xl"
                  disabled={!isValidInput || isPending || isConfirming || resolving}
                >
                  {resolving ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Resolving...
                    </>
                  ) : isPending || isConfirming ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Adding...
                    </>
                  ) : resolvedAddress ? (
                    "Add Participant"
                  ) : (
                    "Resolve & Add"
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
