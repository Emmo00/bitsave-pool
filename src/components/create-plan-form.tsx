"use client"

import type React from "react"

import { useState, useRef } from "react"
import { motion } from "framer-motion"
import { Plus, X, Target, Users, ArrowRight, Loader2 } from "lucide-react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useToast } from "@/hooks/use-toast"
import { resolveENSOrAddress, generateFallbackAvatar, ENSResolutionError } from "@/utils/ens"
import { SUPPORTED_TOKENS } from "@/contracts/config"
import type { PlanFormData } from "./create-savings-flow"

interface CreatePlanFormProps {
  initialData: PlanFormData
  onSubmit: (data: PlanFormData) => void
  onNext: () => void
}

// Generate token options with icons from supported tokens
const getTokenIcon = (symbol: string) => {
  const iconMap: Record<string, string> = {
    USDC: "💰",
    DAI: "🏛️",
    USDT: "💵",
    ETH: "💎",
    WETH: "🔷",
  }
  return iconMap[symbol] || "🪙"
}

export function CreatePlanForm({ initialData, onSubmit, onNext }: CreatePlanFormProps) {
  const [formData, setFormData] = useState<PlanFormData>(initialData)
  const [participantInput, setParticipantInput] = useState("")
  const [isValidating, setIsValidating] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)
  const { toast } = useToast()

  const handleInputChange = (field: keyof PlanFormData, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
  }

  const validateENS = async (input: string): Promise<{ address: string; ensName?: string; avatar?: string }> => {
    setIsValidating(true)
    
    try {
      const resolved = await resolveENSOrAddress(input)
      return {
        address: resolved.address,
        ensName: resolved.ensName,
        avatar: resolved.avatar || generateFallbackAvatar(resolved.address),
      }
    } catch (error) {
      throw new Error(error instanceof Error ? error.message : "Failed to resolve ENS or address")
    } finally {
      setIsValidating(false)
    }
  }

  const handleAddParticipant = async () => {
    if (!participantInput.trim()) return

    try {
      const participant = await validateENS(participantInput.trim())

      if (formData.participants.some((p) => p.address === participant.address)) {
        toast({
          variant: "destructive",
          title: "👥 ALREADY IN PLAN",
          description: "This participant is already part of your savings plan.",
        })
        return
      }

      setFormData((prev) => ({
        ...prev,
        participants: [
          ...prev.participants,
          {
            id: Math.random().toString(36).substr(2, 9),
            ...participant,
          },
        ],
      }))
      setParticipantInput("")

      toast({
        title: "✅ PARTICIPANT ADDED",
        description: `${participant.ensName || `${participant.address.slice(0, 6)}...${participant.address.slice(-4)}`} joined your savings plan!`,
        duration: 3000, // Auto dismiss success toasts after 3 seconds
      })
    } catch (error) {
      if (error instanceof ENSResolutionError) {
        // Handle specific ENS resolution errors with tailored messages
        switch (error.code) {
          case 'INVALID_FORMAT':
            toast({
              variant: "destructive",
              title: "🤔 INVALID FORMAT",
              description: error.message,
            })
            break
          case 'ENS_NOT_FOUND':
            toast({
              variant: "destructive",
              title: "🔍 ENS NOT FOUND",
              description: error.message,
            })
            break
          case 'NETWORK_ERROR':
            toast({
              variant: "destructive",
              title: "🌐 NETWORK ISSUE",
              description: error.message,
            })
            break
          case 'INVALID_ADDRESS':
            toast({
              variant: "destructive",
              title: "❌ INVALID ADDRESS",
              description: error.message,
            })
            break
          default:
            toast({
              variant: "destructive",
              title: "⚠️ RESOLUTION FAILED",
              description: error.message,
            })
        }
      } else {
        // Fallback for any other errors
        toast({
          variant: "destructive",
          title: "❌ UNEXPECTED ERROR",
          description: "Something went wrong while adding the participant. Please try again.",
        })
      }
    }
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      e.preventDefault()
      handleAddParticipant()
    }
  }

  const removeParticipant = (id: string) => {
    const participant = formData.participants.find(p => p.id === id)
    setFormData((prev) => ({
      ...prev,
      participants: prev.participants.filter((p) => p.id !== id),
    }))
    
    if (participant) {
      toast({
        title: "🗑️ PARTICIPANT REMOVED",
        description: `${participant.ensName || `${participant.address.slice(0, 6)}...${participant.address.slice(-4)}`} was removed from your plan.`,
        duration: 3000, // Auto dismiss after 3 seconds
      })
    }
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onSubmit(formData)
    onNext()
  }

  const isFormValid = formData.planName && formData.targetAmount && formData.deadline

  return (
    <form onSubmit={handleSubmit} className="space-y-6 pb-20">
      <motion.div
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.4, delay: 0.1 }}
      >
        <Card className="neomorphic rounded-3xl p-6 border-0">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-2xl bg-primary/10 flex items-center justify-center">
              <Target className="w-5 h-5 text-primary" />
            </div>
            <div>
              <h3 className="font-semibold text-foreground">Plan Details</h3>
              <p className="text-sm text-muted-foreground">Set your savings goal</p>
            </div>
          </div>

          <div className="space-y-4">
            <div>
              <Label htmlFor="planName" className="text-sm font-medium text-foreground">
                Plan Name
              </Label>
              <Input
                id="planName"
                placeholder="e.g., Emergency Fund, Vacation, New Car"
                value={formData.planName}
                onChange={(e) => handleInputChange("planName", e.target.value)}
                className="mt-1 rounded-xl border-0 bg-input"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="targetAmount" className="text-sm font-medium text-foreground">
                  Target Amount
                </Label>
                <Input
                  id="targetAmount"
                  type="number"
                  placeholder="10000"
                  value={formData.targetAmount}
                  onChange={(e) => handleInputChange("targetAmount", e.target.value)}
                  className="mt-1 rounded-xl border-0 bg-input"
                />
              </div>

              <div>
                <Label htmlFor="stablecoin" className="text-sm font-medium text-foreground">
                  Token
                </Label>
                <Select value={formData.stablecoin} onValueChange={(value) => handleInputChange("stablecoin", value)}>
                  <SelectTrigger className="mt-1 rounded-xl border-0 bg-input">
                    <SelectValue>
                      {formData.stablecoin && (
                        <div className="flex items-center gap-2">
                          <span>{getTokenIcon(formData.stablecoin)}</span>
                          <span>{formData.stablecoin}</span>
                        </div>
                      )}
                    </SelectValue>
                  </SelectTrigger>
                  <SelectContent>
                    {SUPPORTED_TOKENS.map((token) => (
                      <SelectItem key={token.symbol} value={token.symbol}>
                        <div className="flex items-center gap-2">
                          <span>{getTokenIcon(token.symbol)}</span>
                          <div className="flex flex-col">
                            <span className="font-medium">{token.symbol}</span>
                            <span className="text-xs text-muted-foreground">{token.name}</span>
                          </div>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div>
              <Label htmlFor="deadline" className="text-sm font-medium text-foreground">
                Deadline
              </Label>
              <Input
                id="deadline"
                type="date"
                value={formData.deadline}
                onChange={(e) => handleInputChange("deadline", e.target.value)}
                className="mt-1 rounded-xl border-0 bg-input"
                min={new Date().toISOString().split("T")[0]}
              />
            </div>
          </div>
        </Card>
      </motion.div>

      <motion.div
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.4, delay: 0.2 }}
      >
        <Card className="neomorphic rounded-3xl p-6 border-0">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-2xl bg-secondary/10 flex items-center justify-center">
              <Users className="w-5 h-5 text-secondary" />
            </div>
            <div>
              <h3 className="font-semibold text-foreground">Participants</h3>
              <p className="text-sm text-muted-foreground">Add people to save together</p>
            </div>
          </div>

          <div className="space-y-4">
            <div>
              <Label htmlFor="participants" className="text-sm font-medium text-foreground">
                Add Participant
              </Label>
              <p className="text-xs text-muted-foreground mt-1 mb-2">
                Try: vitalik.eth, ens.eth, or any Ethereum address (0x...)
              </p>
              <div className="flex gap-2 mt-1">
                <Input
                  ref={inputRef}
                  id="participants"
                  placeholder="ENS name (vitalik.eth) or address (0x...)"
                  value={participantInput}
                  onChange={(e) => setParticipantInput(e.target.value)}
                  onKeyPress={handleKeyPress}
                  className="rounded-xl border-0 bg-input"
                  disabled={isValidating}
                />
                <Button
                  type="button"
                  onClick={handleAddParticipant}
                  disabled={!participantInput.trim() || isValidating}
                  className="rounded-xl px-4"
                  title={isValidating ? "Resolving ENS..." : "Add participant"}
                >
                  {isValidating ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <Plus className="w-4 h-4" />
                  )}
                </Button>
              </div>
            </div>

            {formData.participants.length > 0 && (
              <div className="space-y-2">
                <p className="text-sm font-medium text-foreground">Participants ({formData.participants.length})</p>
                <div className="space-y-2">
                  {formData.participants.map((participant, index) => (
                    <motion.div
                      key={participant.id}
                      initial={{ scale: 0.8, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      transition={{ duration: 0.3, delay: index * 0.1 }}
                      className="flex items-center gap-3 p-3 rounded-2xl bg-muted/50"
                    >
                      <img
                        src={participant.avatar}
                        alt={participant.ensName || participant.address}
                        className="w-8 h-8 rounded-full object-cover"
                        onError={(e) => {
                          // Fallback to generated avatar if image fails to load
                          const target = e.target as HTMLImageElement
                          target.src = generateFallbackAvatar(participant.address)
                        }}
                      />
                      <div className="flex-1">
                        <p className="text-sm font-medium text-foreground">
                          {participant.ensName ||
                            `${participant.address.slice(0, 6)}...${participant.address.slice(-4)}`}
                        </p>
                        {participant.ensName && (
                          <p className="text-xs text-muted-foreground">
                            {participant.address.slice(0, 6)}...{participant.address.slice(-4)}
                          </p>
                        )}
                      </div>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => removeParticipant(participant.id)}
                        className="p-1 h-auto text-muted-foreground hover:text-destructive"
                      >
                        <X className="w-4 h-4" />
                      </Button>
                    </motion.div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </Card>
      </motion.div>

      <motion.div
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.4, delay: 0.3 }}
        className="fixed bottom-20 left-4 right-4"
      >
        <Button
          type="submit"
          disabled={!isFormValid}
          className="w-full h-12 rounded-2xl glow-primary font-semibold"
          size="lg"
        >
          <span>Continue to Review</span>
          <ArrowRight className="w-4 h-4 ml-2" />
        </Button>
      </motion.div>
    </form>
  )
}
