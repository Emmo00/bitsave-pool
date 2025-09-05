"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { CheckCircle2, Clock, Loader2, AlertCircle } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useBitSaveContracts } from "@/contracts/hooks";
import { SUPPORTED_TOKENS } from "@/contracts/config";
import { useAccount, useWaitForTransactionReceipt } from "wagmi";
import { PlanFormData } from "./create-savings-flow";

interface CreatePlanTransactionProps {
  planData: PlanFormData;
  onSuccess: () => void;
  onCancel: () => void;
}

type TransactionStep = "signing" | "confirming" | "success" | "error";

export function CreatePlanTransaction({ planData, onSuccess, onCancel }: CreatePlanTransactionProps) {
  const [currentStep, setCurrentStep] = useState<TransactionStep>("signing");
  const [mounted, setMounted] = useState(false);
  const { address } = useAccount();
  
  const {
    createPlan,
    isPending,
    error,
    hash
  } = useBitSaveContracts();

  // Use separate hook for waiting for confirmations
  const { 
    isLoading: isConfirming, 
    isSuccess 
  } = useWaitForTransactionReceipt({
    hash,
    confirmations: 2, // Wait for 2 confirmations
  });

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (isPending) {
      setCurrentStep("signing");
    } else if (isConfirming) {
      setCurrentStep("confirming");
    } else if (isSuccess) {
      setCurrentStep("success");
      // Auto-trigger success callback after a brief delay
      setTimeout(() => {
        onSuccess();
      }, 2000);
    } else if (error) {
      setCurrentStep("error");
    }
  }, [isPending, isConfirming, isSuccess, error, onSuccess]);

  if (!mounted) {
    return null;
  }

  const handleCreatePlan = () => {
    if (!address) return;

    // Find the selected token
    const selectedToken = SUPPORTED_TOKENS.find(token => token.symbol === planData.stablecoin);
    if (!selectedToken) {
      console.error("Token not found:", planData.stablecoin);
      return;
    }

    // Convert deadline to timestamp
    const deadlineTimestamp = BigInt(Math.floor(new Date(planData.deadline).getTime() / 1000));
    
    // Extract participant addresses
    const participantAddresses = planData.participants.map(p => p.address as `0x${string}`);

    createPlan(
      selectedToken.address,
      planData.targetAmount,
      address, // beneficiary is the creator
      deadlineTimestamp,
      participantAddresses
    );
  };

  const steps = [
    {
      key: "signing" as const,
      title: "Sign Creation",
      description: "Confirm the savings plan creation in your wallet",
      icon: Clock,
      active: currentStep === "signing",
      completed: ["confirming", "success"].includes(currentStep),
    },
    {
      key: "confirming" as const,
      title: "Finalizing",
      description: "Waiting for 2 blockchain confirmations",
      icon: Loader2,
      active: currentStep === "confirming",
      completed: currentStep === "success",
    },
  ];

  return (
    <div className="space-y-6">
      {/* Transaction Steps */}
      <div className="space-y-4">
        {steps.map((step, index) => {
          const Icon = step.icon;
          const isActive = step.active;
          const isCompleted = step.completed;
          const isError = currentStep === "error";

          return (
            <motion.div
              key={step.key}
              initial={{ x: 20, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ duration: 0.4, delay: index * 0.1 }}
            >
              <Card className={`p-4 border-2 transition-all duration-300 ${
                isError ? "border-destructive bg-destructive/5" :
                isActive ? "border-primary bg-primary/5" :
                isCompleted ? "border-green-500 bg-green-50" :
                "border-muted"
              }`}>
                <div className="flex items-start gap-3">
                  <div className={`rounded-full p-2 transition-all duration-300 ${
                    isError ? "bg-destructive text-destructive-foreground" :
                    isActive ? "bg-primary text-primary-foreground" :
                    isCompleted ? "bg-green-500 text-white" :
                    "bg-muted text-muted-foreground"
                  }`}>
                    {isError ? (
                      <AlertCircle className="w-4 h-4" />
                    ) : isCompleted ? (
                      <CheckCircle2 className="w-4 h-4" />
                    ) : isActive && (step.key === "confirming" || isPending) ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <Icon className="w-4 h-4" />
                    )}
                  </div>
                  <div className="flex-1 space-y-1">
                    <h3 className="font-semibold text-sm">{step.title}</h3>
                    <p className="text-xs text-muted-foreground">
                      {isError && step.key === "signing" ? "Transaction failed or was rejected" : 
                       step.key === "confirming" && isConfirming ? "Waiting for 2 confirmations..." :
                       step.description}
                    </p>
                    {isActive && step.key === "signing" && !isPending && (
                      <Button 
                        onClick={handleCreatePlan}
                        className="mt-2"
                        size="sm"
                        disabled={!address}
                      >
                        Sign Transaction
                      </Button>
                    )}
                  </div>
                </div>
              </Card>
            </motion.div>
          );
        })}
      </div>

      {/* Plan Summary */}
      <motion.div
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.4, delay: 0.3 }}
      >
        <Card className="p-4 bg-muted/50">
          <h3 className="font-semibold text-sm mb-3">Plan Summary</h3>
          <div className="space-y-2 text-xs">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Plan Name:</span>
              <span className="font-medium">{planData.planName}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Target Amount:</span>
              <span className="font-medium">{planData.targetAmount} {planData.stablecoin}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Deadline:</span>
              <span className="font-medium">{new Date(planData.deadline).toLocaleDateString()}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Participants:</span>
              <span className="font-medium">{planData.participants.length + 1}</span>
            </div>
          </div>
        </Card>
      </motion.div>

      {/* Action Buttons */}
      {(currentStep === "error" || currentStep === "success") && (
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.4 }}
          className="flex gap-3"
        >
          {currentStep === "error" && (
            <>
              <Button variant="outline" onClick={onCancel} className="flex-1">
                Cancel
              </Button>
              <Button onClick={handleCreatePlan} className="flex-1">
                Try Again
              </Button>
            </>
          )}
          {currentStep === "success" && (
            <Button onClick={onSuccess} className="w-full">
              Continue
            </Button>
          )}
        </motion.div>
      )}

      {/* Error Message */}
      {error && (
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.4 }}
        >
          <Card className="p-4 border-destructive bg-destructive/5">
            <div className="flex items-start gap-2">
              <AlertCircle className="w-4 h-4 text-destructive mt-0.5" />
              <div>
                <h4 className="font-semibold text-sm text-destructive">Transaction Failed</h4>
                <p className="text-xs text-destructive/80 mt-1">
                  {error.message || "An error occurred while creating the savings plan."}
                </p>
              </div>
            </div>
          </Card>
        </motion.div>
      )}
    </div>
  );
}
