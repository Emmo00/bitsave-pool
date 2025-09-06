"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowLeft, Calendar, Users, TrendingUp, Download, X } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CircularProgress } from "./circular-progress";
import { DepositModal } from "./deposit-modal";
import { WithdrawModal } from "./withdraw-modal";
import { CancelModal } from "./cancel-modal";

// Mock data - in real app this would come from API
const mockPlanDetails = {
  "1": {
    id: "1",
    name: "Emergency Fund",
    token: "USDC",
    target: 10000,
    current: 7500,
    participants: 3,
    deadline: "2024-12-31",
    status: "active" as const,
    owner: "0x1234...5678",
    currentUser: "0x1234...5678", // User is owner
    deposits: [
      {
        id: "1",
        participant: {
          address: "0x1234...5678",
          ensName: "alice.eth",
          avatar: "/alice-avatar.png",
        },
        amount: 2500,
        date: "2024-01-15",
      },
      {
        id: "2",
        participant: { address: "0x9876...4321", ensName: "bob.eth", avatar: "/bob-avatar.jpg" },
        amount: 3000,
        date: "2024-01-20",
      },
      {
        id: "3",
        participant: { address: "0x5555...7777", ensName: null, avatar: "/identicon-0x5555.jpg" },
        amount: 2000,
        date: "2024-02-01",
      },
    ],
    participantsList: [
      {
        address: "0x1234...5678",
        ensName: "alice.eth",
        avatar: "/alice-avatar.png",
        contribution: 2500,
      },
      {
        address: "0x9876...4321",
        ensName: "bob.eth",
        avatar: "/bob-avatar.jpg",
        contribution: 3000,
      },
      {
        address: "0x5555...7777",
        ensName: null,
        avatar: "/identicon-0x5555.jpg",
        contribution: 2000,
      },
    ],
  },
  "2": {
    id: "2",
    name: "Vacation Fund",
    token: "DAI",
    target: 5000,
    current: 2800,
    participants: 2,
    deadline: "2024-08-15",
    status: "active" as const,
    owner: "0x1234...5678",
    currentUser: "0x1234...5678",
    deposits: [
      {
        id: "1",
        participant: {
          address: "0x1234...5678",
          ensName: "alice.eth",
          avatar: "/alice-avatar.png",
        },
        amount: 1500,
        date: "2024-02-10",
      },
      {
        id: "2",
        participant: { address: "0x9876...4321", ensName: "bob.eth", avatar: "/bob-avatar.jpg" },
        amount: 1300,
        date: "2024-02-15",
      },
    ],
    participantsList: [
      {
        address: "0x1234...5678",
        ensName: "alice.eth",
        avatar: "/alice-avatar.png",
        contribution: 1500,
      },
      {
        address: "0x9876...4321",
        ensName: "bob.eth",
        avatar: "/bob-avatar.jpg",
        contribution: 1300,
      },
    ],
  },
  "3": {
    id: "3",
    name: "New Car Fund",
    token: "USDT",
    target: 25000,
    current: 12000,
    participants: 4,
    deadline: "2025-06-01",
    status: "active" as const,
    owner: "0x1234...5678",
    currentUser: "0x1234...5678",
    deposits: [
      {
        id: "1",
        participant: {
          address: "0x1234...5678",
          ensName: "alice.eth",
          avatar: "/alice-avatar.png",
        },
        amount: 4000,
        date: "2024-01-05",
      },
      {
        id: "2",
        participant: { address: "0x9876...4321", ensName: "bob.eth", avatar: "/bob-avatar.jpg" },
        amount: 3500,
        date: "2024-01-12",
      },
      {
        id: "3",
        participant: { address: "0x5555...7777", ensName: null, avatar: "/identicon-0x5555.jpg" },
        amount: 2500,
        date: "2024-01-20",
      },
      {
        id: "4",
        participant: {
          address: "0xaaaa...bbbb",
          ensName: "charlie.eth",
          avatar: "/alice-avatar.png",
        },
        amount: 2000,
        date: "2024-02-01",
      },
    ],
    participantsList: [
      {
        address: "0x1234...5678",
        ensName: "alice.eth",
        avatar: "/alice-avatar.png",
        contribution: 4000,
      },
      {
        address: "0x9876...4321",
        ensName: "bob.eth",
        avatar: "/bob-avatar.jpg",
        contribution: 3500,
      },
      {
        address: "0x5555...7777",
        ensName: null,
        avatar: "/identicon-0x5555.jpg",
        contribution: 2500,
      },
      {
        address: "0xaaaa...bbbb",
        ensName: "charlie.eth",
        avatar: "/alice-avatar.png",
        contribution: 2000,
      },
    ],
  },
  "4": {
    id: "4",
    name: "House Down Payment",
    token: "USDC",
    target: 50000,
    current: 32000,
    participants: 6,
    deadline: "2025-03-15",
    status: "active" as const,
    owner: "0x9876...4321",
    currentUser: "0x1234...5678", // User is participant, not owner
    deposits: [
      {
        id: "1",
        participant: { address: "0x9876...4321", ensName: "bob.eth", avatar: "/bob-avatar.jpg" },
        amount: 8000,
        date: "2024-01-01",
      },
      {
        id: "2",
        participant: {
          address: "0x1234...5678",
          ensName: "alice.eth",
          avatar: "/alice-avatar.png",
        },
        amount: 6000,
        date: "2024-01-08",
      },
      {
        id: "3",
        participant: { address: "0x5555...7777", ensName: null, avatar: "/identicon-0x5555.jpg" },
        amount: 5500,
        date: "2024-01-15",
      },
    ],
    participantsList: [
      {
        address: "0x9876...4321",
        ensName: "bob.eth",
        avatar: "/bob-avatar.jpg",
        contribution: 8000,
      },
      {
        address: "0x1234...5678",
        ensName: "alice.eth",
        avatar: "/alice-avatar.png",
        contribution: 6000,
      },
      {
        address: "0x5555...7777",
        ensName: null,
        avatar: "/identicon-0x5555.jpg",
        contribution: 5500,
      },
      {
        address: "0xaaaa...bbbb",
        ensName: "charlie.eth",
        avatar: "/alice-avatar.png",
        contribution: 4500,
      },
      {
        address: "0xcccc...dddd",
        ensName: "david.eth",
        avatar: "/bob-avatar.jpg",
        contribution: 4000,
      },
      {
        address: "0xeeee...ffff",
        ensName: null,
        avatar: "/identicon-0x5555.jpg",
        contribution: 4000,
      },
    ],
  },
  "5": {
    id: "5",
    name: "Wedding Fund",
    token: "DAI",
    target: 15000,
    current: 9500,
    participants: 2,
    deadline: "2024-10-20",
    status: "active" as const,
    owner: "0x9876...4321",
    currentUser: "0x1234...5678", // User is participant, not owner
    deposits: [
      {
        id: "1",
        participant: { address: "0x9876...4321", ensName: "bob.eth", avatar: "/bob-avatar.jpg" },
        amount: 5000,
        date: "2024-01-10",
      },
      {
        id: "2",
        participant: {
          address: "0x1234...5678",
          ensName: "alice.eth",
          avatar: "/alice-avatar.png",
        },
        amount: 4500,
        date: "2024-01-18",
      },
    ],
    participantsList: [
      {
        address: "0x9876...4321",
        ensName: "bob.eth",
        avatar: "/bob-avatar.jpg",
        contribution: 5000,
      },
      {
        address: "0x1234...5678",
        ensName: "alice.eth",
        avatar: "/alice-avatar.png",
        contribution: 4500,
      },
    ],
  },
};

interface PlanDetailsViewProps {
  planId: string;
}

export function PlanDetailsView({ planId }: PlanDetailsViewProps) {
  const [mounted, setMounted] = useState(false);
  const [activeTab, setActiveTab] = useState<"overview" | "participants">("overview");
  const [showDepositModal, setShowDepositModal] = useState(false);
  const [showWithdrawModal, setShowWithdrawModal] = useState(false);
  const [showCancelModal, setShowCancelModal] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return null;
  }

  const plan = mockPlanDetails[planId as keyof typeof mockPlanDetails];

  if (!plan) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-xl font-bold text-foreground mb-2">Plan not found</h2>
          <Button onClick={() => navigate(-1)}>Go Back</Button>
        </div>
      </div>
    );
  }

  const progress = (plan.current / plan.target) * 100;
  const isOwner = plan.owner === plan.currentUser;
  const isCompleted = progress >= 100; // Based on progress instead of status
  const isCancelled = false; // No cancelled plans in mock data
  const canWithdraw = isOwner && progress >= 100;
  const daysLeft = Math.ceil(
    (new Date(plan.deadline).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24)
  );

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
            <h1 className="text-lg font-bold text-foreground text-balance">{plan.name}</h1>
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
              {isCompleted ? "Completed" : "Active"}
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
              ${plan.current.toLocaleString()}
            </h2>
            <p className="text-muted-foreground mb-2">
              of ${plan.target.toLocaleString()} {plan.token}
            </p>
            <div className="flex items-center justify-center gap-4 text-sm text-muted-foreground">
              <div className="flex items-center gap-1">
                <Calendar className="w-4 h-4" />
                <span>{daysLeft > 0 ? `${daysLeft} days left` : "Overdue"}</span>
              </div>
              <div className="flex items-center gap-1">
                <Users className="w-4 h-4" />
                <span>{plan.participants} participants</span>
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
              {/* Recent Deposits */}
              <Card className="neomorphic rounded-3xl p-6 border-0">
                <h3 className="text-lg font-semibold text-foreground mb-4">Recent Deposits</h3>
                <div className="space-y-3">
                  {plan.deposits.map((deposit, index) => (
                    <motion.div
                      key={deposit.id}
                      initial={{ y: 20, opacity: 0 }}
                      animate={{ y: 0, opacity: 1 }}
                      transition={{ duration: 0.4, delay: index * 0.1 }}
                      className="flex items-center gap-3 p-3 rounded-2xl bg-muted/50"
                    >
                      <img
                        src={deposit.participant.avatar || "/placeholder.svg"}
                        alt={deposit.participant.ensName || deposit.participant.address}
                        className="w-10 h-10 rounded-full"
                      />
                      <div className="flex-1">
                        <p className="font-medium text-foreground">
                          {deposit.participant.ensName ||
                            `${deposit.participant.address.slice(0, 6)}...${deposit.participant.address.slice(-4)}`}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          {new Date(deposit.date).toLocaleDateString()}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="font-semibold text-foreground">
                          +${deposit.amount.toLocaleString()}
                        </p>
                        <p className="text-xs text-muted-foreground">{plan.token}</p>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </Card>

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

                {isOwner && plan.status === "active" && (
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
                  All Participants ({plan.participantsList.length})
                </h3>
                <div className="space-y-3">
                  {plan.participantsList.map((participant, index) => (
                    <motion.div
                      key={participant.address}
                      initial={{ y: 20, opacity: 0 }}
                      animate={{ y: 0, opacity: 1 }}
                      transition={{ duration: 0.4, delay: index * 0.1 }}
                      className="flex items-center gap-3 p-4 rounded-2xl bg-muted/50"
                    >
                      <img
                        src={participant.avatar || "/placeholder.svg"}
                        alt={participant.ensName || participant.address}
                        className="w-12 h-12 rounded-full"
                      />
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <p className="font-medium text-foreground">
                            {participant.ensName ||
                              `${participant.address.slice(0, 6)}...${participant.address.slice(-4)}`}
                          </p>
                          {participant.address === plan.owner && (
                            <Badge variant="secondary" className="text-xs">
                              Owner
                            </Badge>
                          )}
                        </div>
                        <p className="text-sm text-muted-foreground">
                          {participant.address.slice(0, 6)}...{participant.address.slice(-4)}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="font-semibold text-foreground">
                          ${participant.contribution.toLocaleString()}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {((participant.contribution / plan.current) * 100).toFixed(1)}%
                        </p>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </Card>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Modals */}
      <DepositModal
        isOpen={showDepositModal}
        onClose={() => setShowDepositModal(false)}
        plan={plan}
      />

      <WithdrawModal
        isOpen={showWithdrawModal}
        onClose={() => setShowWithdrawModal(false)}
        plan={plan}
      />

      <CancelModal isOpen={showCancelModal} onClose={() => setShowCancelModal(false)} plan={plan} />
    </div>
  );
}