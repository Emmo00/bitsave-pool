"use client"

import { useState, useEffect } from "react"
import { TrendingUp, Check, Clock } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { BaseError, useAccount } from "wagmi"
import { Address } from "viem"
import { useTokenBalance, useTokenAllowance, formatTokenAmount, useTokenApproval, useDeposit, useIsParticipant, useAddParticipant } from "@/contracts/hooks"
import { SUPPORTED_TOKENS } from "@/contracts/config"
import { useToast } from "@/hooks/use-toast"

interface DepositModalProps {
  isOpen: boolean
  onClose: () => void
  plan: {
    id: string
    token: string
    target: number
    current: number
    owner: Address
  }
  onSuccess?: () => void
}

enum DepositStep {
  FORM = "form",
  JOIN_PLAN = "join_plan",
  APPROVE = "approve",
  DEPOSIT = "deposit",
  SUCCESS = "success",
}

const depositSteps = [
  { key: DepositStep.JOIN_PLAN, label: "Join Plan", icon: TrendingUp },
  { key: DepositStep.APPROVE, label: "Approve Token", icon: Clock },
  { key: DepositStep.DEPOSIT, label: "Confirm Deposit", icon: TrendingUp },
]

export function DepositModal({ isOpen, onClose, plan, onSuccess }: DepositModalProps) {
  const [amount, setAmount] = useState("")
  const [currentStep, setCurrentStep] = useState<DepositStep>(DepositStep.FORM)
  // Remove unused chainId variable
  const { address: userAddress } = useAccount()
  const { toast } = useToast()

  // Get token info
  const tokenInfo = SUPPORTED_TOKENS.find(t => t.symbol === plan.token) || SUPPORTED_TOKENS[0]
  
  // Check if user is a participant
  const isParticipant = useIsParticipant(parseInt(plan.id), userAddress)
  
  // Contract hooks - separate hooks for participant addition, approval and deposit
  const { 
    addParticipant, 
    hash: participantHash, 
    error: participantError, 
    isPending: isParticipantPending, 
    isConfirming: isParticipantConfirming, 
    isSuccess: isParticipantSuccess 
  } = useAddParticipant()
  
  const { 
    approveToken, 
    hash: approvalHash, 
    error: approvalError, 
    isPending: isApprovalPending, 
    isConfirming: isApprovalConfirming, 
    isSuccess: isApprovalSuccess 
  } = useTokenApproval()
  
  const { 
    deposit, 
    hash: depositHash, 
    error: depositError, 
    isPending: isDepositPending, 
    isConfirming: isDepositConfirming, 
    isSuccess: isDepositSuccess 
  } = useDeposit()
  
  // Get user's token balance
  const { data: tokenBalance } = useTokenBalance(tokenInfo.address, userAddress)
  
  // Get user's token allowance
  const { data: tokenAllowance, refetch: refetchAllowance } = useTokenAllowance(tokenInfo.address, userAddress)
  
  // Format balances
  const formattedBalance = tokenBalance && typeof tokenBalance === 'bigint'
    ? formatTokenAmount(tokenBalance, tokenInfo.decimals)
    : "0"
  
  const formattedAllowance = tokenAllowance && typeof tokenAllowance === 'bigint'
    ? formatTokenAmount(tokenAllowance, tokenInfo.decimals)
    : "0"

  const parsedAmount = amount ? parseFloat(amount) : 0
  const isValidAmount = parsedAmount > 0 && parsedAmount <= parseFloat(formattedBalance)
  const needsApproval = parsedAmount > parseFloat(formattedAllowance)
  const needsToJoin = !isParticipant && userAddress?.toLowerCase() !== plan.owner.toLowerCase()

  // Combine states for UI logic
  const currentHash = 
    currentStep === DepositStep.JOIN_PLAN ? participantHash :
    currentStep === DepositStep.APPROVE ? approvalHash : 
    depositHash
  const currentError = participantError || approvalError || depositError
  const isProcessing = isParticipantPending || isParticipantConfirming || isApprovalPending || isApprovalConfirming || isDepositPending || isDepositConfirming
  useEffect(() => {
    if (!isOpen) {
      setCurrentStep(DepositStep.FORM)
      setAmount("")
    }
  }, [isOpen])

  // Reset step when modal opens/closes
  useEffect(() => {
    if (!isOpen) {
      setCurrentStep(DepositStep.FORM)
      setAmount("")
    }
  }, [isOpen])

  // Handle participant join completion
  useEffect(() => {
    if (isParticipantSuccess && currentStep === DepositStep.JOIN_PLAN) {
      console.log("Participant join completed successfully")
      toast({
        title: "Joined Plan!",
        description: "You've successfully joined the plan. You can now proceed with the deposit.",
      })
      
      // Reset to form to allow user to proceed
      setCurrentStep(DepositStep.FORM)
    }
  }, [isParticipantSuccess, currentStep, toast])

  // Handle approval completion
  useEffect(() => {
    if (isApprovalSuccess && currentStep === DepositStep.APPROVE) {
      console.log("Approval completed successfully")
      // Approval completed, refetch allowance
      refetchAllowance()
      toast({
        title: "Approval Successful!",
        description: `Approved ${amount} ${tokenInfo.symbol} for spending. You can now proceed with the deposit.`,
      })
      
      // Reset to form to allow user to manually trigger deposit
      setCurrentStep(DepositStep.FORM)
    }
  }, [isApprovalSuccess, currentStep, amount, tokenInfo.symbol, refetchAllowance, toast])

  // Handle deposit completion
  useEffect(() => {
    if (isDepositSuccess && currentStep === DepositStep.DEPOSIT) {
      // Deposit completed
      setCurrentStep(DepositStep.SUCCESS)
      toast({
        title: "Deposit Successful!",
        description: `Successfully deposited ${amount} ${tokenInfo.symbol}`,
      })
      
      // Close modal after success
      setTimeout(() => {
        setCurrentStep(DepositStep.FORM)
        setAmount("")
        onClose()
        onSuccess?.()
      }, 2000)
    }
  }, [isDepositSuccess, currentStep, amount, tokenInfo.symbol, onClose, onSuccess, toast])

  // Handle transaction errors
  useEffect(() => {
    if (currentError) {
      toast({
        title: "Transaction Failed",
        description: currentError.message || "An error occurred during the transaction",
        variant: "destructive",
      })
      setCurrentStep(DepositStep.FORM)
    }
  }, [currentError, toast])

  const handleJoinPlan = async () => {
    if (!userAddress) return
    
    console.log("Joining plan...", { planId: plan.id, userAddress })
    
    setCurrentStep(DepositStep.JOIN_PLAN)
    try {
      await addParticipant(parseInt(plan.id), userAddress)
      console.log("Join plan transaction initiated")
    } catch (error) {
      console.error("Join plan failed:", error)
      toast({
        title: "Join Plan Failed",
        description: (error as BaseError)?.message || "Failed to join the plan",
        variant: "destructive",
      })
      setCurrentStep(DepositStep.FORM)
    }
  }

  const handleApprove = async () => {
    if (!isValidAmount) return
    
    console.log("Starting approval transaction...", { 
      tokenAddress: tokenInfo.address, 
      amount, 
      decimals: tokenInfo.decimals 
    })
    
    setCurrentStep(DepositStep.APPROVE)
    try {
      await approveToken(tokenInfo.address, amount, tokenInfo.decimals)
      console.log("Approval transaction initiated")
    } catch (error) {
      console.error("Approval failed:", error)
      toast({
        title: "Approval Failed",
        description: (error as BaseError)?.message || "Failed to approve token spending",
        variant: "destructive",
      })
      setCurrentStep(DepositStep.FORM)
    }
  }

  const handleDeposit = async () => {
    if (!isValidAmount) return
    
    console.log("Starting deposit transaction...", { 
      planId: plan.id, 
      amount, 
      decimals: tokenInfo.decimals 
    })
    
    setCurrentStep(DepositStep.DEPOSIT)
    try {
      await deposit(parseInt(plan.id), amount, tokenInfo.decimals)
      console.log("Deposit transaction initiated")
    } catch (error) {
      console.error("Deposit failed:", error)
      toast({
        title: "Deposit Failed",
        description: (error as BaseError)?.message || "Failed to deposit funds",
        variant: "destructive",
      })
      setCurrentStep(DepositStep.FORM)
    }
  }

  const handleProceed = () => {
    if (needsToJoin) {
      console.log("User needs to join plan first")
      handleJoinPlan()
    } else if (needsApproval) {
      console.log("Approval needed, starting approval process")
      handleApprove()
    } else {
      console.log("No approval needed, proceeding directly to deposit")
      handleDeposit()
    }
  }

  const handleClose = () => {
    if (currentStep === DepositStep.FORM) {
      setAmount("")
      onClose()
    }
  }

  return (
    <>
      {isOpen && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="w-full max-w-md bg-background rounded-lg shadow-lg">
            <div className="p-6">
              <div className="mb-4">
                <h2 className="text-xl font-semibold">Deposit to Plan</h2>
                <p className="text-sm text-muted-foreground">
                  Add funds to your {tokenInfo.symbol} savings plan
                </p>
              </div>

        {currentStep === DepositStep.FORM ? (
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="amount">Amount to Deposit</Label>
              <div className="relative">
                <Input
                  id="amount"
                  type="number"
                  placeholder="0.00"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  className="pr-16"
                />
                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground">
                  {tokenInfo.symbol}
                </span>
              </div>
              <div className="flex justify-between text-sm text-muted-foreground">
                <span>Balance: {formattedBalance} {tokenInfo.symbol}</span>
                <button
                  type="button"
                  onClick={() => setAmount(formattedBalance)}
                  className="text-primary hover:underline"
                >
                  Use Max
                </button>
              </div>
              {!isValidAmount && parsedAmount > 0 && (
                <p className="text-sm text-destructive">
                  Insufficient balance. You have {formattedBalance} {tokenInfo.symbol}
                </p>
              )}
            </div>

            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">You will receive:</span>
                <span className="text-sm font-medium">{amount || "0"} Pool Tokens</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Transaction type:</span>
                <span className="text-sm font-medium">
                  {needsToJoin 
                    ? needsApproval ? "3-Step Process" : "2-Step Process"
                    : needsApproval ? "2-Step Process" : "Direct Deposit"}
                </span>
              </div>
              {(needsToJoin || needsApproval) && (
                <div className="text-xs text-muted-foreground">
                  {needsToJoin && needsApproval 
                    ? "Step 1: Join plan, Step 2: Approve token, Step 3: Deposit"
                    : needsToJoin
                    ? "Step 1: Join plan, Step 2: Deposit"
                    : "Step 1: Approve token spending, Step 2: Deposit"}
                </div>
              )}
            </div>

            <div className="flex gap-2">
              <Button variant="outline" onClick={handleClose} className="flex-1">
                Cancel
              </Button>
              <Button 
                onClick={handleProceed} 
                disabled={!isValidAmount || isProcessing}
                className="flex-1"
              >
                {isProcessing 
                  ? "Processing..." 
                  : needsToJoin 
                  ? "Join Plan" 
                  : needsApproval 
                  ? "Approve Token" 
                  : "Deposit"}
              </Button>
            </div>
          </div>
        ) : currentStep === DepositStep.SUCCESS ? (
          <div className="flex flex-col items-center text-center space-y-4">
            <div className="h-12 w-12 rounded-full bg-green-100 flex items-center justify-center">
              <Check className="h-6 w-6 text-green-600" />
            </div>
            <div>
              <h3 className="font-semibold">Deposit Successful!</h3>
              <p className="text-sm text-muted-foreground">
                Your {amount} {tokenInfo.symbol} has been deposited
              </p>
            </div>
          </div>
        ) : (
          <div className="space-y-6">
            <div className="flex justify-center">
              <div className="flex space-x-4">
                {depositSteps.map((step) => {
                  const StepIcon = step.icon
                  const isActive = currentStep === step.key
                  const isCompleted = 
                    (step.key === DepositStep.JOIN_PLAN && (currentStep === DepositStep.APPROVE || currentStep === DepositStep.DEPOSIT)) ||
                    (step.key === DepositStep.APPROVE && currentStep === DepositStep.DEPOSIT)

                  return (
                    <div key={step.key} className="flex flex-col items-center space-y-2">
                      <div
                        className={`h-10 w-10 rounded-full flex items-center justify-center border-2 ${
                          isCompleted
                            ? "bg-green-100 border-green-500"
                            : isActive
                              ? "bg-primary border-primary"
                              : "bg-muted border-muted-foreground/30"
                        }`}
                      >
                        {isCompleted ? (
                          <Check className="h-5 w-5 text-green-600" />
                        ) : (
                          <StepIcon
                            className={`h-5 w-5 ${
                              isActive ? "text-primary-foreground animate-spin" : "text-muted-foreground"
                            }`}
                          />
                        )}
                      </div>
                      <span className="text-xs text-center max-w-[60px]">
                        {step.label}
                      </span>
                    </div>
                  )
                })}
              </div>
            </div>

            <div className="text-center space-y-2">
              <p className="font-medium">
                {currentStep === DepositStep.JOIN_PLAN
                  ? "Joining Plan"
                  : currentStep === DepositStep.APPROVE
                  ? "Approving Token Spend"
                  : "Confirming Deposit"}
              </p>
              <p className="text-sm text-muted-foreground">
                {currentStep === DepositStep.JOIN_PLAN
                  ? "Please confirm joining the plan in your wallet"
                  : currentStep === DepositStep.APPROVE
                  ? `Please approve ${amount} ${tokenInfo.symbol} in your wallet`
                  : `Depositing ${amount} ${tokenInfo.symbol} to your savings plan`}
              </p>
              {currentHash && (
                <p className="text-xs text-muted-foreground">
                  Transaction hash: {currentHash.slice(0, 10)}...{currentHash.slice(-8)}
                </p>
              )}
            </div>
          </div>
        )}
            </div>
          </div>
        </div>
      )}
    </>
  )
}
