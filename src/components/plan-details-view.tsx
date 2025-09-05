"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowLeft, Calendar, Users, TrendingUp, Download, X, UserPlus, UserMinus } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CircularProgress } from "./circular-progress";
import { DepositModal } from "./deposit-modal";
import { WithdrawModal } from "./withdraw-modal";
import { CancelModal } from "./cancel-modal";
import { AddParticipantModal } from "./add-participant-modal";
import { RemoveParticipantModal } from "./remove-participant-modal";
import { usePlanData, ParticipantWithContribution } from "@/hooks/use-plan-data";
import { formatUnits } from "viem";

interface PlanDetailsViewProps {
  planId: string;
}

export function PlanDetailsView({ planId }: PlanDetailsViewProps) {
  const [mounted, setMounted] = useState(false);
  const [activeTab, setActiveTab] = useState<"overview" | "participants">("overview");
  const [showDepositModal, setShowDepositModal] = useState(false);
  const [showWithdrawModal, setShowWithdrawModal] = useState(false);
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [showAddParticipantModal, setShowAddParticipantModal] = useState(false);
  const [showRemoveParticipantModal, setShowRemoveParticipantModal] = useState(false);
  const [selectedParticipant, setSelectedParticipant] = useState<ParticipantWithContribution | null>(null);
  
  const navigate = useNavigate();
  
  const { 
    plan, 
    participants, 
    tokenInfo, 
    isOwner, 
    isParticipant, 
    loading, 
    error,
    refetch 
  } = usePlanData(planId);

  useEffect(() => {
    setMounted(true);
  }, []);

  const handleRemoveParticipant = (participant: ParticipantWithContribution) => {
    setSelectedParticipant(participant);
    setShowRemoveParticipantModal(true);
  };

  const handleModalSuccess = () => {
    refetch();
  };

  if (!mounted) {
    return null;
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <h2 className="text-xl font-bold text-foreground mb-2">Loading plan...</h2>
        </div>
      </div>
    );
  }

  if (error || !plan) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-xl font-bold text-foreground mb-2">
            {error ? "Error loading plan" : "Plan not found"}
          </h2>
          <p className="text-muted-foreground mb-4">
            {error ? "Please try again later." : "The requested plan could not be found."}
          </p>
          <Button onClick={() => navigate(-1)}>Go Back</Button>
        </div>
      </div>
    );
  }

  const progress = plan.target > 0n ? Number((plan.deposited * 100n) / plan.target) : 0;
  const isCompleted = progress >= 100;
  const canWithdraw = isOwner && isCompleted && !plan.withdrawn;
  
  // Calculate days left
  const daysLeft = plan.deadline > 0n ? 
    Math.ceil((Number(plan.deadline) * 1000 - Date.now()) / (1000 * 60 * 60 * 24)) : 
    null;

  // Format amounts
  const currentAmount = tokenInfo ? formatUnits(plan.deposited, tokenInfo.decimals) : "0";
  const targetAmount = tokenInfo ? formatUnits(plan.target, tokenInfo.decimals) : "0";

  return (
    <div className="min-h-screen bg-background pb-20">
      {/* Header */}
      <motion.div
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.6 }}
        className="sticky top-0 bg-background/95 backdrop-blur-lg border-b border-border z-10"
      >
        <div className="flex items-center justify-between p-4">
          <Button variant="ghost" size="sm" onClick={() => navigate(-1)} className="p-2">
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <div className="text-center flex-1">
            <h1 className="text-lg font-bold text-foreground text-balance">
              Savings Plan #{plan.id}
            </h1>
            <Badge
              variant={
                isCompleted ? "default" : plan.cancelled ? "destructive" : "secondary"
              }
              className={`text-xs mt-1 ${
                isCompleted
                  ? "bg-green-100 text-green-800"
                  : plan.cancelled
                    ? "bg-red-100 text-red-800"
                    : "bg-primary/10 text-primary"
              }`}
            >
              {isCompleted ? "Completed" : plan.cancelled ? "Cancelled" : "Active"}
            </Badge>
          </div>
          <div className="w-9" /> {/* Spacer */}
        </div>

        {/* Tab Navigation */}
        <div className="px-4 pb-4">
          <div className="flex bg-muted rounded-2xl p-1">
            <button
              onClick={() => setActiveTab("overview")}
              className={`flex-1 py-2 px-4 rounded-xl text-sm font-medium transition-all duration-200 ${
                activeTab === "overview"
                  ? "bg-primary text-primary-foreground shadow-sm"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              Overview
            </button>
            <button
              onClick={() => setActiveTab("participants")}
              className={`flex-1 py-2 px-4 rounded-xl text-sm font-medium transition-all duration-200 ${
                activeTab === "participants"
                  ? "bg-primary text-primary-foreground shadow-sm"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              Participants
            </button>
          </div>
        </div>
      </motion.div>

      {/* Content */}
      <div className="px-4 space-y-6">
        {/* Progress Section */}
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.2 }}
        >
          <Card className="neomorphic rounded-3xl p-6 border-0 text-center">
            <CircularProgress
              progress={progress}
              size={120}
              strokeWidth={8}
              className="mx-auto mb-4"
            />
            <h2 className="text-2xl font-bold text-foreground mb-1">
              {currentAmount} {tokenInfo?.symbol}
            </h2>
            <p className="text-muted-foreground mb-2">
              of {targetAmount} {tokenInfo?.symbol}
            </p>
            <div className="flex items-center justify-center gap-4 text-sm text-muted-foreground">
              {daysLeft !== null && (
                <div className="flex items-center gap-1">
                  <Calendar className="w-4 h-4" />
                  <span>{daysLeft > 0 ? `${daysLeft} days left` : "Overdue"}</span>
                </div>
              )}
              <div className="flex items-center gap-1">
                <Users className="w-4 h-4" />
                <span>{participants.length} participants</span>
              </div>
            </div>
          </Card>
        </motion.div>
        {/* Tab Content */}
        <AnimatePresence mode="wait">
          {activeTab === "overview" && (
            <motion.div
              key="overview"
              initial={{ x: 20, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              exit={{ x: -20, opacity: 0 }}
              transition={{ duration: 0.3 }}
              className="space-y-6"
            >
              {/* Plan Info */}
              <Card className="neomorphic rounded-3xl p-6 border-0">
                <h3 className="text-lg font-semibold text-foreground mb-4">Plan Details</h3>
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-muted-foreground">Owner</span>
                    <span className="font-medium">
                      {plan.owner.slice(0, 6)}...{plan.owner.slice(-4)}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-muted-foreground">Beneficiary</span>
                    <span className="font-medium">
                      {plan.beneficiary.slice(0, 6)}...{plan.beneficiary.slice(-4)}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-muted-foreground">Token</span>
                    <span className="font-medium">{tokenInfo?.name || "Unknown Token"}</span>
                  </div>
                  {plan.deadline > 0n && (
                    <div className="flex justify-between items-center">
                      <span className="text-muted-foreground">Deadline</span>
                      <span className="font-medium">
                        {new Date(Number(plan.deadline) * 1000).toLocaleDateString()}
                      </span>
                    </div>
                  )}
                </div>
              </Card>

              {/* Action Buttons */}
              <div className="space-y-3">
                {plan.active && !plan.withdrawn && isParticipant && (
                  <Button
                    onClick={() => setShowDepositModal(true)}
                    className="w-full h-12 rounded-2xl glow-primary font-semibold"
                  >
                    <TrendingUp className="w-4 h-4 mr-2" />
                    Make Deposit
                  </Button>
                )}

                {canWithdraw && (
                  <Button
                    onClick={() => setShowWithdrawModal(true)}
                    variant="outline"
                    className="w-full h-12 rounded-2xl border-2 border-green-500 text-green-600 hover:bg-green-500 hover:text-white"
                  >
                    <Download className="w-4 h-4 mr-2" />
                    Withdraw Funds
                  </Button>
                )}

                {isOwner && plan.active && (
                  <Button
                    onClick={() => setShowCancelModal(true)}
                    variant="outline"
                    className="w-full h-12 rounded-2xl border-2 border-destructive text-destructive hover:bg-destructive hover:text-destructive-foreground"
                  >
                    <X className="w-4 h-4 mr-2" />
                    Cancel Plan
                  </Button>
                )}
              </div>
            </motion.div>
          )}

          {activeTab === "participants" && (
            <motion.div
              key="participants"
              initial={{ x: 20, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              exit={{ x: -20, opacity: 0 }}
              transition={{ duration: 0.3 }}
            >
              <Card className="neomorphic rounded-3xl p-6 border-0">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-foreground">
                    Participants ({participants.length})
                  </h3>
                  {isOwner && plan.active && (
                    <Button
                      size="sm"
                      onClick={() => setShowAddParticipantModal(true)}
                      className="rounded-xl"
                    >
                      <UserPlus className="w-4 h-4 mr-2" />
                      Add
                    </Button>
                  )}
                </div>
                
                <div className="space-y-3">
                  {participants.map((participant, index) => {
                    const isOwnerParticipant = participant.address.toLowerCase() === plan.owner.toLowerCase();
                    const displayName = participant.ensName || 
                      `${participant.address.slice(0, 6)}...${participant.address.slice(-4)}`;
                    
                    return (
                      <motion.div
                        key={participant.address}
                        initial={{ y: 20, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        transition={{ duration: 0.4, delay: index * 0.1 }}
                        className="flex items-center gap-3 p-4 rounded-2xl bg-muted/50"
                      >
                        <img
                          src={participant.avatar || "/placeholder.svg"}
                          alt={displayName}
                          className="w-12 h-12 rounded-full"
                        />
                        <div className="flex-1">
                          <div className="flex items-center gap-2">
                            <p className="font-medium text-foreground">{displayName}</p>
                            {isOwnerParticipant && (
                              <Badge variant="secondary" className="text-xs">
                                Owner
                              </Badge>
                            )}
                          </div>
                          <p className="text-sm text-muted-foreground">
                            {participant.address.slice(0, 6)}...{participant.address.slice(-4)}
                          </p>
                        </div>
                        <div className="flex items-center gap-2">
                          <div className="text-right">
                            <p className="font-semibold text-foreground">
                              {participant.formattedContribution} {tokenInfo?.symbol}
                            </p>
                            {plan.deposited > 0n && (
                              <p className="text-xs text-muted-foreground">
                                {((Number(participant.contribution) / Number(plan.deposited)) * 100).toFixed(1)}%
                              </p>
                            )}
                          </div>
                          {isOwner && plan.active && !isOwnerParticipant && (
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => handleRemoveParticipant(participant)}
                              className="p-2 text-destructive hover:text-destructive hover:bg-destructive/10"
                            >
                              <UserMinus className="w-4 h-4" />
                            </Button>
                          )}
                        </div>
                      </motion.div>
                    );
                  })}
                </div>

                {isOwner && plan.active && (
                  <div className="mt-6 pt-4 border-t border-border space-y-3">
                    <Button
                      onClick={() => setShowAddParticipantModal(true)}
                      variant="outline"
                      className="w-full h-12 rounded-2xl"
                    >
                      <UserPlus className="w-4 h-4 mr-2" />
                      Add Participant
                    </Button>
                    <Button
                      onClick={() => setShowCancelModal(true)}
                      variant="outline"
                      className="w-full h-12 rounded-2xl border-2 border-destructive text-destructive hover:bg-destructive hover:text-destructive-foreground"
                    >
                      <X className="w-4 h-4 mr-2" />
                      Cancel Plan
                    </Button>
                  </div>
                )}
              </Card>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Modals */}
      {plan && (
        <>
          <DepositModal
            isOpen={showDepositModal}
            onClose={() => setShowDepositModal(false)}
            plan={{
              id: plan.id.toString(),
              token: tokenInfo?.symbol || "Unknown",
              target: Number(formatUnits(plan.target, tokenInfo?.decimals || 18)),
              current: Number(formatUnits(plan.deposited, tokenInfo?.decimals || 18)),
            }}
          />

          <WithdrawModal
            isOpen={showWithdrawModal}
            onClose={() => setShowWithdrawModal(false)}
            plan={{
              id: plan.id.toString(),
              token: tokenInfo?.symbol || "Unknown",
              current: Number(formatUnits(plan.deposited, tokenInfo?.decimals || 18)),
            }}
          />

          <CancelModal 
            isOpen={showCancelModal} 
            onClose={() => setShowCancelModal(false)} 
            plan={{
              id: plan.id.toString(),
              name: `Savings Plan #${plan.id}`,
            }}
          />

          <AddParticipantModal
            isOpen={showAddParticipantModal}
            onClose={() => setShowAddParticipantModal(false)}
            planId={planId}
            onSuccess={handleModalSuccess}
          />

          {selectedParticipant && (
            <RemoveParticipantModal
              isOpen={showRemoveParticipantModal}
              onClose={() => setShowRemoveParticipantModal(false)}
              planId={planId}
              participant={selectedParticipant}
              onSuccess={handleModalSuccess}
            />
          )}
        </>
      )}
    </div>
  );
}