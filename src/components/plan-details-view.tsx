"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowLeft, Calendar, Users, TrendingUp, Download, X } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useAccount } from "wagmi";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CircularProgress } from "./circular-progress";
import { DepositModal } from "./deposit-modal";
import { WithdrawModal } from "./withdraw-modal";
import { CancelModal } from "./cancel-modal";
import { 
  usePlan, 
  usePlanParticipants, 
  formatTokenAmount,
  type SavingsPlan 
} from "@/contracts/hooks";
import { SUPPORTED_TOKENS } from "@/contracts/config";
import { Address } from "viem";
import { resolveENSOrAddress, generateFallbackAvatar } from "@/utils/ens";

interface PlanDetailsViewProps {
  planId: string;
}

// Helper function to get token info by address
function getTokenInfo(tokenAddress: Address) {
  return SUPPORTED_TOKENS.find(token => 
    token.address.toLowerCase() === tokenAddress.toLowerCase()
  ) || SUPPORTED_TOKENS[0]; // Default to first token if not found
}

// Helper function to format address for display
function formatAddress(address: Address): string {
  return `${address.slice(0, 6)}...${address.slice(-4)}`;
}

export function PlanDetailsView({ planId }: PlanDetailsViewProps) {
  const [mounted, setMounted] = useState(false);
  const [activeTab, setActiveTab] = useState<"overview" | "participants">("overview");
  const [showDepositModal, setShowDepositModal] = useState(false);
  const [showWithdrawModal, setShowWithdrawModal] = useState(false);
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [participantsWithEns, setParticipantsWithEns] = useState<Array<{
    address: Address;
    ensName?: string;
    avatar?: string;
    displayName: string;
    contribution: number;
  }>>([]);
  const [ensLoading, setEnsLoading] = useState(false);
  
  const navigate = useNavigate();
  const { address: userAddress } = useAccount();

  // Fetch onchain data
  const { data: planData, isLoading: planLoading, error: planError } = usePlan(parseInt(planId));
  const { data: participantsData } = usePlanParticipants(parseInt(planId));

  // Debug logging
  console.log('Plan Details Debug:', {
    planId,
    parsedPlanId: parseInt(planId),
    planData,
    planLoading,
    planError,
    participantsData
  });

  // Type assertion for participants data - it should be an array of addresses
  const participants = (participantsData as Address[]) || [];

  useEffect(() => {
    setMounted(true);
  }, []);

  // Resolve ENS data for participants
  useEffect(() => {
    if (participants && participants.length > 0) {
      setEnsLoading(true);
      
      const resolveParticipants = async () => {
        try {
          const resolvedParticipants = await Promise.all(
            participants.map(async (address: Address) => {
              try {
                const ensData = await resolveENSOrAddress(address);
                return {
                  address,
                  ensName: ensData.ensName,
                  avatar: ensData.avatar || generateFallbackAvatar(address),
                  displayName: ensData.displayName,
                  contribution: Math.floor(Math.random() * 4000) + 1000, // Mock contribution for demo
                };
              } catch (error) {
                console.warn(`Failed to resolve ENS for ${address}:`, error);
                return {
                  address,
                  ensName: undefined,
                  avatar: generateFallbackAvatar(address),
                  displayName: formatAddress(address),
                  contribution: Math.floor(Math.random() * 4000) + 1000, // Mock contribution for demo
                };
              }
            })
          );
          
          setParticipantsWithEns(resolvedParticipants);
        } catch (error) {
          console.error('Error resolving ENS data:', error);
          // Fallback to addresses only
          const fallbackParticipants = participants.map((address: Address) => ({
            address,
            ensName: undefined,
            avatar: generateFallbackAvatar(address),
            displayName: formatAddress(address),
            contribution: Math.floor(Math.random() * 4000) + 1000,
          }));
          setParticipantsWithEns(fallbackParticipants);
        } finally {
          setEnsLoading(false);
        }
      };

      resolveParticipants();
    }
  }, [participants]);

  if (!mounted) {
    return null;
  }

  // Loading state
  if (planLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <h2 className="text-xl font-bold text-foreground mb-2">Loading plan details...</h2>
        </div>
      </div>
    );
  }

  // Error state
  if (planError || !planData) {
    console.error('Plan error details:', { planError, planData, planId });
    
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-xl font-bold text-foreground mb-2">
            {planError ? "Error loading plan" : "Plan not found"}
          </h2>
          <p className="text-muted-foreground mb-4">
            {planError 
              ? `Error: ${planError.message || "Please try again later."}` 
              : `Plan ID ${planId} could not be found. It may not exist or may have been removed.`
            }
          </p>
          <div className="space-y-2">
            <Button onClick={() => navigate(-1)}>Go Back</Button>
            <Button variant="outline" onClick={() => navigate("/plans")}>
              View All Plans
            </Button>
          </div>
        </div>
      </div>
    );
  }

  const plan = planData as SavingsPlan;
  const tokenInfo = getTokenInfo(plan.token);
  
  // Calculate plan metrics
  const targetAmount = parseFloat(formatTokenAmount(plan.target, tokenInfo.decimals));
  const currentAmount = parseFloat(formatTokenAmount(plan.deposited, tokenInfo.decimals));
  const progress = targetAmount > 0 ? (currentAmount / targetAmount) * 100 : 0;
  
  // Plan status
  const isOwner = userAddress && plan.owner.toLowerCase() === userAddress.toLowerCase();
  const isCompleted = progress >= 100;
  const isCancelled = plan.cancelled;
  const isActive = plan.active && !plan.cancelled && !plan.withdrawn;
  const canWithdraw = isOwner && (isCompleted || isCancelled);
  
  // Calculate days left
  const deadlineTimestamp = Number(plan.deadline) * 1000; // Convert to milliseconds
  const daysLeft = Math.ceil((deadlineTimestamp - new Date().getTime()) / (1000 * 60 * 60 * 24));

  // Create plan object in expected format for modals
  const planForModals = {
    id: planId,
    name: `Plan #${planId}`, // In real app, this would come from plan creation event or metadata
    token: tokenInfo.symbol,
    target: targetAmount,
    current: currentAmount,
    participants: participants.length,
    deadline: new Date(deadlineTimestamp).toISOString().split('T')[0],
    status: isActive ? "active" as const : isCancelled ? "cancelled" as const : "completed" as const,
    owner: plan.owner,
    currentUser: userAddress || "0x0000000000000000000000000000000000000000",
    deposits: [], // No longer showing deposits
    participantsList: participantsWithEns,
  };

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
              {planForModals.name}
            </h1>
            <Badge
              variant={
                isCompleted ? "default" : isCancelled ? "destructive" : "secondary"
              }
              className={`text-xs mt-1 ${
                isCompleted
                  ? "bg-green-100 text-green-800"
                  : isCancelled
                    ? "bg-red-100 text-red-800"
                    : "bg-primary/10 text-primary"
              }`}
            >
              {isCompleted ? "Completed" : isCancelled ? "Cancelled" : "Active"}
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
              ${currentAmount.toLocaleString()}
            </h2>
            <p className="text-muted-foreground mb-2">
              of ${targetAmount.toLocaleString()} {tokenInfo.symbol}
            </p>
            <div className="flex items-center justify-center gap-4 text-sm text-muted-foreground">
              <div className="flex items-center gap-1">
                <Calendar className="w-4 h-4" />
                <span>{daysLeft > 0 ? `${daysLeft} days left` : "Overdue"}</span>
              </div>
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
              {/* Action Buttons */}
              <div className="space-y-3">
                {!isCompleted && (
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

                {isOwner && isActive && !isCompleted && (
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
                <h3 className="text-lg font-semibold text-foreground mb-4">
                  All Participants ({participantsWithEns.length})
                </h3>
                
                {ensLoading ? (
                  <div className="flex items-center justify-center py-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                    <span className="ml-2 text-muted-foreground">Resolving ENS names...</span>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {participantsWithEns.map((participant, index) => (
                      <motion.div
                        key={participant.address}
                        initial={{ y: 20, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        transition={{ duration: 0.4, delay: index * 0.1 }}
                        className="flex items-center gap-3 p-4 rounded-2xl bg-muted/50"
                      >
                        <img
                          src={participant.avatar}
                          alt={participant.displayName}
                          className="w-12 h-12 rounded-full"
                          onError={(e) => {
                            // Fallback to generated avatar if image fails to load
                            e.currentTarget.src = generateFallbackAvatar(participant.address);
                          }}
                        />
                        <div className="flex-1">
                          <div className="flex items-center gap-2">
                            <p className="font-medium text-foreground">
                              {participant.displayName}
                            </p>
                            {participant.address.toLowerCase() === plan.owner.toLowerCase() && (
                              <Badge variant="secondary" className="text-xs">
                                Owner
                              </Badge>
                            )}
                          </div>
                          <p className="text-sm text-muted-foreground">
                            {formatAddress(participant.address)}
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="font-semibold text-foreground">
                            ${participant.contribution.toLocaleString()}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {currentAmount > 0 ? ((participant.contribution / currentAmount) * 100).toFixed(1) : '0.0'}%
                          </p>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                )}
              </Card>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Modals */}
      <DepositModal
        isOpen={showDepositModal}
        onClose={() => setShowDepositModal(false)}
        plan={planForModals}
      />

      <WithdrawModal
        isOpen={showWithdrawModal}
        onClose={() => setShowWithdrawModal(false)}
        plan={planForModals}
      />

      <CancelModal 
        isOpen={showCancelModal} 
        onClose={() => setShowCancelModal(false)} 
        plan={planForModals} 
      />
    </div>
  );
}