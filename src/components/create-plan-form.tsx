"use client"

import type React from "react"

import { useState, useRef } from "react"
import { motion } from "framer-motion"
import { Plus, X, Target, Users, ArrowRight } from "lucide-react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useToast } from "@/hooks/use-toast"
import type { PlanFormData } from "./create-savings-flow"

interface CreatePlanFormProps {
  initialData: PlanFormData
  onSubmit: (data: PlanFormData) => void
  onNext: () => void
}

const stablecoins = [
  { value: "USDC", label: "USDC", icon: "💰" },
  { value: "DAI", label: "DAI", icon: "🏛️" },
  { value: "USDT", label: "USDT", icon: "💵" },
]

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
    await new Promise((resolve) => setTimeout(resolve, 800))
    setIsValidating(false)

    if (input.endsWith(".eth")) {
      return {
        address: `0x${Math.random().toString(16).substr(2, 40)}`,
        ensName: input,
        avatar: `/placeholder.svg?height=32&width=32&query=avatar for ${input}`,
      }
    } else if (input.startsWith("0x") && input.length === 42) {
      return {
        address: input,
        avatar: `/placeholder.svg?height=32&width=32&query=identicon for ${input.slice(0, 6)}`,
      }
    } else {
      throw new Error("Invalid ENS name or address")
    }
  }

  const handleAddParticipant = async () => {
    if (!participantInput.trim()) return

    try {
      const participant = await validateENS(participantInput.trim())

      if (formData.participants.some((p) => p.address === participant.address)) {
        console.log("[v0] Showing duplicate participant toast")
        toast({
          variant: "destructive",
          title: "PARTICIPANT ALREADY ADDED",
          description: "This participant is already in your savings plan.",
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

      console.log("[v0] Showing success toast for participant")
      toast({
        title: "PARTICIPANT ADDED",
        description: `${participant.ensName || `${participant.address.slice(0, 6)}...${participant.address.slice(-4)}`} has been added to your plan.`,
      })
    } catch (error) {
      console.log("[v0] Showing error toast for invalid ENS:", error)
      toast({
        variant: "destructive",
        title: "INVALID ENS OR ADDRESS",
        description: "Please enter a valid ENS name (e.g., vitalik.eth) or Ethereum address (0x...).",
      })
    }
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      e.preventDefault()
      handleAddParticipant()
    }
  }

  const removeParticipant = (id: string) => {
    setFormData((prev) => ({
      ...prev,
      participants: prev.participants.filter((p) => p.id !== id),
    }))
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
                  Stablecoin
                </Label>
                <Select value={formData.stablecoin} onValueChange={(value) => handleInputChange("stablecoin", value)}>
                  <SelectTrigger className="mt-1 rounded-xl border-0 bg-input">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {stablecoins.map((coin) => (
                      <SelectItem key={coin.value} value={coin.value}>
                        <div className="flex items-center gap-2">
                          <span>{coin.icon}</span>
                          <span>{coin.label}</span>
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
                >
                  {isValidating ? (
                    <motion.div
                      animate={{ rotate: 360 }}
                      transition={{ duration: 1, repeat: Number.POSITIVE_INFINITY, ease: "linear" }}
                      className="w-4 h-4 border-2 border-primary-foreground border-t-transparent rounded-full"
                    />
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
                        src={participant.avatar || "/placeholder.svg"}
                        alt={participant.ensName || participant.address}
                        className="w-8 h-8 rounded-full"
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
