"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowLeft, Calendar, Users, TrendingUp, Download, X } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useAccount, useChainId } from "wagmi";
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
  useNextPlanId,
  formatTokenAmount,
  type SavingsPlan 
} from "@/contracts/hooks";
import { SUPPORTED_TOKENS, getContractAddress, ABIS } from "@/contracts/config";
import { Address } from "viem";
import { resolveENSOrAddress, generateFallbackAvatar } from "@/utils/ens";

interface PlanDetailsViewProps {
  planId: string;
}

// Helper function to get token info by address
function getTokenInfo(tokenAddress: Address | undefined) {
  if (!tokenAddress) {
    return SUPPORTED_TOKENS[0]; // Default to first token if address is undefined
  }
  return SUPPORTED_TOKENS.find(token => 
    token.address && token.address.toLowerCase() === tokenAddress.toLowerCase()
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
  const [contributionData, setContributionData] = useState<{ [address: string]: bigint }>({});
  
  const navigate = useNavigate();
  const { address: userAddress } = useAccount();
  const chainId = useChainId();

  // Validate planId
  const numericPlanId = parseInt(planId);
  
  // Handle invalid plan ID
  if (isNaN(numericPlanId) || numericPlanId < 0) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-xl font-bold text-foreground mb-2">Invalid Plan ID</h2>
          <p className="text-muted-foreground mb-4">
            The plan ID "{planId}" is not valid. Plan IDs must be positive numbers.
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

  // Fetch onchain data
  const { data: planData, isLoading: planLoading, error: planError } = usePlan(numericPlanId);
  const { data: participantsData } = usePlanParticipants(numericPlanId);
  const { data: nextPlanId } = useNextPlanId();

  // Debug logging
  console.log('Plan Details Debug:', {
    planId,
    numericPlanId,
    planData,
    planLoading,
    planError,
    participantsData,
    nextPlanId
  });

  // Type assertion for participants data - it should be an array of addresses
  const participants = (participantsData as Address[]) || [];

  useEffect(() => {
    setMounted(true);
  }, []);

  // Fetch individual contributions manually to avoid hook rules violations
  useEffect(() => {
    const fetchContributions = async () => {
      if (!participants.length || !planData) return;
      
      try {
        const { readContract } = await import('viem/actions');
        const { createPublicClient, http } = await import('viem');
        const { baseSepolia } = await import('viem/chains');
        
        const publicClient = createPublicClient({
          chain: baseSepolia,
          transport: http()
        });
        
        const contributions: { [address: string]: bigint } = {};
        
        // Fetch contributions for each participant
        for (const address of participants) {
          try {
            const result = await readContract(publicClient, {
              address: getContractAddress(chainId, "BITSAVE_POOLS"),
              abi: ABIS.BITSAVE_POOLS,
              functionName: "getContribution",
              args: [BigInt(numericPlanId), address]
            });
            
            contributions[address] = result as bigint;
          } catch (error) {
            console.warn(`Failed to fetch contribution for ${address}:`, error);
            contributions[address] = BigInt(0);
          }
        }
        
        setContributionData(contributions);
      } catch (error) {
        console.error('Error fetching contributions:', error);
      }
    };

    fetchContributions();
  }, [participants, numericPlanId, planData]);

  // Resolve ENS data for participants
  useEffect(() => {
    if (participants && participants.length > 0 && Object.keys(contributionData).length > 0 && planData) {
      setEnsLoading(true);
      
      const resolveParticipants = async () => {
        try {
          const plan = planData as SavingsPlan;
          const tokenInfo = getTokenInfo(plan?.token);
          
          const resolvedParticipants = await Promise.all(
            participants.map(async (address: Address) => {
              try {
                const ensData = await resolveENSOrAddress(address);
                
                // Get real contribution amount
                const contributionBigInt = contributionData[address] || BigInt(0);
                const contributionAmount = parseFloat(formatTokenAmount(contributionBigInt, tokenInfo.decimals));
                
                return {
                  address,
                  ensName: ensData.ensName,
                  avatar: ensData.avatar || generateFallbackAvatar(address),
                  displayName: ensData.displayName,
                  contribution: contributionAmount,
                };
              } catch (error) {
                console.warn(`Failed to resolve ENS for ${address}:`, error);
                
                // Get real contribution amount even if ENS fails
                const contributionBigInt = contributionData[address] || BigInt(0);
                const contributionAmount = parseFloat(formatTokenAmount(contributionBigInt, tokenInfo.decimals));
                
                return {
                  address,
                  ensName: undefined,
                  avatar: generateFallbackAvatar(address),
                  displayName: formatAddress(address),
                  contribution: contributionAmount,
                };
              }
            })
          );
          
          setParticipantsWithEns(resolvedParticipants);
        } catch (error) {
          console.error('Error resolving ENS data:', error);
          // Fallback to addresses only with real contribution data
          const plan = planData as SavingsPlan;
          const tokenInfo = getTokenInfo(plan?.token);
          
          const fallbackParticipants = participants.map((address: Address) => {
            const contributionBigInt = contributionData[address] || BigInt(0);
            const contributionAmount = parseFloat(formatTokenAmount(contributionBigInt, tokenInfo.decimals));
              
            return {
              address,
              ensName: undefined,
              avatar: generateFallbackAvatar(address),
              displayName: formatAddress(address),
              contribution: contributionAmount,
            };
          });
          setParticipantsWithEns(fallbackParticipants);
        } finally {
          setEnsLoading(false);
        }
      };

      resolveParticipants();
    }
  }, [participants, contributionData, planData]);

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
    console.error('Plan error details:', { 
      planError, 
      planData, 
      planId,
      numericPlanId,
      nextPlanId,
      errorMessage: planError?.message,
      errorCause: planError?.cause
    });
    
    // Check if plan ID is valid based on nextPlanId
    const maxValidPlanId = nextPlanId ? Number(nextPlanId) - 1 : 0;
    const isPlanIdOutOfRange = nextPlanId && numericPlanId >= Number(nextPlanId);
    
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center max-w-md mx-auto px-4">
          <h2 className="text-xl font-bold text-foreground mb-2">
            {planError ? "Error loading plan" : "Plan not found"}
          </h2>
          <p className="text-muted-foreground mb-4">
            {planError 
              ? `Error: ${planError.message || "Unable to connect to smart contract. Please check your wallet connection and network."}`
              : isPlanIdOutOfRange
                ? `Plan ID ${numericPlanId} doesn't exist. The highest plan ID is ${maxValidPlanId}. ${maxValidPlanId === 0 ? "No plans have been created yet." : ""}`
                : `Plan ID ${numericPlanId} could not be found. This could mean:
                   • The plan doesn't exist
                   • The plan was created on a different network  
                   • You're not connected to the right network (Base Sepolia)`
            }
          </p>
          <div className="space-y-2">
            <Button onClick={() => navigate(-1)}>Go Back</Button>
            <Button variant="outline" onClick={() => navigate("/plans")}>
              View All Plans
            </Button>
            {maxValidPlanId > 0 && (
              <Button variant="outline" onClick={() => navigate(`/plans/${maxValidPlanId}`)}>
                View Latest Plan (#{maxValidPlanId})
              </Button>
            )}
          </div>
          
          {/* Debug info in development */}
          {process.env.NODE_ENV === 'development' && (
            <details className="mt-4 text-left text-xs text-muted-foreground">
              <summary className="cursor-pointer">Debug Info</summary>
              <pre className="mt-2 p-2 bg-muted rounded text-xs overflow-auto">
                {JSON.stringify({ 
                  planId, 
                  numericPlanId, 
                  nextPlanId: Number(nextPlanId), 
                  maxValidPlanId,
                  isPlanIdOutOfRange,
                  planError, 
                  planData 
                }, null, 2)}
              </pre>
            </details>
          )}
        </div>
      </div>
    );
  }

  const plan = planData as SavingsPlan;
  const tokenInfo = getTokenInfo(plan?.token);
  
  // Calculate plan metrics with safety checks
  const targetAmount = plan?.target ? parseFloat(formatTokenAmount(plan.target, tokenInfo.decimals)) : 0;
  const currentAmount = plan?.deposited ? parseFloat(formatTokenAmount(plan.deposited, tokenInfo.decimals)) : 0;
  const progress = targetAmount > 0 ? (currentAmount / targetAmount) * 100 : 0;
  
  // Plan status with safety checks
  const isOwner = userAddress && plan?.owner && plan.owner.toLowerCase() === userAddress.toLowerCase();
  const isCompleted = progress >= 100;
  const isCancelled = plan?.cancelled || false;
  const isActive = plan?.active && !plan?.cancelled && !plan?.withdrawn;
  const canWithdraw = isOwner && (isCompleted || isCancelled);
  
  // Calculate days left with safety checks
  const deadlineTimestamp = plan?.deadline ? Number(plan.deadline) * 1000 : Date.now(); // Convert to milliseconds
  const isValidTimestamp = deadlineTimestamp && deadlineTimestamp > 0 && !isNaN(deadlineTimestamp);
  const daysLeft = isValidTimestamp 
    ? Math.ceil((deadlineTimestamp - new Date().getTime()) / (1000 * 60 * 60 * 24))
    : 0;

  // Create plan object in expected format for modals
  const planForModals = {
    id: planId,
    name: plan?.name || `Savings Plan #${planId}`,
    token: tokenInfo.symbol,
    target: targetAmount,
    current: currentAmount,
    participants: participants.length,
    deadline: isValidTimestamp ? new Date(deadlineTimestamp).toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
    status: isActive ? "active" as const : isCancelled ? "cancelled" as const : "completed" as const,
    owner: plan?.owner || "0x0000000000000000000000000000000000000000",
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
                    <span className="ml-2 text-muted-foreground">Resolving participant data...</span>
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
                            {participant.address && plan?.owner && participant.address.toLowerCase() === plan.owner.toLowerCase() && (
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
                            {participant.contribution > 0 
                              ? `${participant.contribution.toLocaleString()} ${tokenInfo.symbol}` 
                              : `0 ${tokenInfo.symbol}`
                            }
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