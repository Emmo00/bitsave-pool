"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { ArrowLeft, Users, Calendar, Target, TrendingUp } from "lucide-react"
import { useNavigate, useSearchParams } from "react-router-dom"
import { useAccount } from "wagmi"
import { formatUnits } from "viem"
import { SUPPORTED_TOKENS } from "@/contracts/config"
import { useUserPlans } from "@/hooks/use-user-plans"

interface PlansListViewProps {
  type?: "owned" | "joined" | "all"
}

export function PlansListView({ type = "all" }: PlansListViewProps) {
  const [mounted, setMounted] = useState(false)
  const [activeTab, setActiveTab] = useState<"owned" | "joined" | "completed">(type === "joined" ? "joined" : "owned")
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const { address, isConnected } = useAccount()
  const { plans, loading } = useUserPlans()

  // Get initial tab from URL params
  useEffect(() => {
    const typeParam = searchParams.get("type") as "owned" | "joined" | "completed"
    if (typeParam && ["owned", "joined", "completed"].includes(typeParam)) {
      setActiveTab(typeParam)
    }
  }, [searchParams])

  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) {
    return null
  }

  if (!isConnected) {
    return (
      <div className="min-h-screen bg-background pb-20">
        <div className="flex items-center justify-between p-4 border-b border-border">
          <Button variant="ghost" size="sm" onClick={() => navigate(-1)} className="p-2">
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <h1 className="text-xl font-bold text-foreground">Savings Plans</h1>
          <div className="w-9" />
        </div>
        <div className="text-center py-16 px-4">
          <Target className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-foreground mb-2">Connect Your Wallet</h2>
          <p className="text-muted-foreground">
            Please connect your wallet to view your savings plans.
          </p>
        </div>
      </div>
    )
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-background pb-20">
        <div className="flex items-center justify-between p-4 border-b border-border">
          <Button variant="ghost" size="sm" onClick={() => navigate(-1)} className="p-2">
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <h1 className="text-xl font-bold text-foreground">Savings Plans</h1>
          <div className="w-9" />
        </div>
        <div className="px-4 pt-6 space-y-4">
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-3xl p-6 animate-pulse"
            >
              <div className="h-6 bg-gray-300 rounded mb-4" />
              <div className="h-3 bg-gray-300 rounded mb-4" />
              <div className="grid grid-cols-3 gap-4">
                <div className="h-4 bg-gray-300 rounded" />
                <div className="h-4 bg-gray-300 rounded" />
                <div className="h-4 bg-gray-300 rounded" />
              </div>
            </div>
          ))}
        </div>
      </div>
    )
  }

  // Filter plans based on the current tab
  const ownedPlans = plans.filter((plan) => 
    address && plan.owner.toLowerCase() === address.toLowerCase() && plan.active && !plan.withdrawn && !plan.cancelled
  )
  const joinedPlans = plans.filter((plan) => 
    address && plan.owner.toLowerCase() !== address.toLowerCase() && plan.active && !plan.withdrawn && !plan.cancelled
  )
  const completedPlans = plans.filter((plan) => plan.withdrawn || plan.cancelled || !plan.active)

  const currentPlans = activeTab === "owned" ? ownedPlans : activeTab === "joined" ? joinedPlans : completedPlans

  if (!mounted) {
    return null
  }

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
          <h1 className="text-xl font-bold text-foreground">Savings Plans</h1>
          <div className="w-9" /> {/* Spacer */}
        </div>

        {/* Tab Navigation */}
        {type === "all" && (
          <div className="px-4 pb-4">
            <div className="flex bg-muted rounded-2xl p-1">
              <button
                onClick={() => setActiveTab("owned")}
                className={`flex-1 py-2 px-4 rounded-xl text-sm font-medium transition-all duration-200 ${
                  activeTab === "owned"
                    ? "bg-primary text-primary-foreground shadow-sm"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                Plans I Own
              </button>
              <button
                onClick={() => setActiveTab("joined")}
                className={`flex-1 py-2 px-4 rounded-xl text-sm font-medium transition-all duration-200 ${
                  activeTab === "joined"
                    ? "bg-primary text-primary-foreground shadow-sm"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                Plans I Joined
              </button>
              <button
                onClick={() => setActiveTab("completed")}
                className={`flex-1 py-2 px-4 rounded-xl text-sm font-medium transition-all duration-200 ${
                  activeTab === "completed"
                    ? "bg-primary text-primary-foreground shadow-sm"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                Completed
              </button>
            </div>
          </div>
        )}
      </motion.div>

      {/* Plans Grid */}
      <div className="px-4 space-y-6">
        {/* Current Plans */}
        {currentPlans.length > 0 && (
          <motion.div
            initial={{ y: 30, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            <div className="grid gap-4 mt-2">
              {currentPlans.map((plan, index) => (
                <motion.div
                  key={plan.id}
                  initial={{ y: 20, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ duration: 0.4, delay: 0.3 + index * 0.1 }}
                >
                  <EnhancedPlanCard plan={plan} />
                </motion.div>
              ))}
            </div>
          </motion.div>
        )}

        {currentPlans.length === 0 && (
          <motion.div
            initial={{ y: 30, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="text-center py-12"
          >
            <Target className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-foreground mb-2">
              {activeTab === "owned" ? "No Plans Created Yet" : activeTab === "joined" ? "No Plans Joined Yet" : "No Completed Plans"}
            </h3>
            <p className="text-muted-foreground mb-6 text-balance">
              {activeTab === "owned"
                ? "Create your first savings plan to get started"
                : activeTab === "joined"
                  ? "Join a savings plan to start saving together"
                  : "Complete plans will appear here when you withdraw or they're cancelled"}
            </p>
            {activeTab === "owned" && (
              <Button className="rounded-2xl glow-primary" onClick={() => navigate("/create")}>
                Create Plan
              </Button>
            )}
          </motion.div>
        )}
      </div>
    </div>
  )
}


function EnhancedPlanCard({ plan }: { plan: any }) {
  const navigate = useNavigate()
  
  // Calculate progress and formatting
  const progress = plan.target && plan.target > 0n ? Number(plan.deposited) / Number(plan.target) * 100 : 0
  const deadlineTimestamp = plan.deadline ? Number(plan.deadline) * 1000 : 0
  const deadlineDate = deadlineTimestamp > 0 && !isNaN(deadlineTimestamp) ? new Date(deadlineTimestamp) : null
  const now = new Date()
  const isExpired = deadlineDate && now > deadlineDate
  const daysLeft = deadlineDate ? Math.max(0, Math.ceil((deadlineDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24))) : 0
  
  // Token info
  const tokenInfo = SUPPORTED_TOKENS.find(t => t.address.toLowerCase() === plan.token.toLowerCase())
  const tokenSymbol = tokenInfo ? tokenInfo.symbol : 'Unknown'
  
  // Debug logging
  console.log('Enhanced Plan Card data:', {
    id: plan.id,
    target: plan.target,
    deposited: plan.deposited,
    targetType: typeof plan.target,
    depositedType: typeof plan.deposited,
    tokenInfo
  });
  
  // Format amounts - use the pre-formatted values from the hook
  const formattedTarget = parseFloat(plan.formattedTarget || '0')
  const formattedDeposited = parseFloat(plan.formattedDeposited || '0')
  const formattedContribution = parseFloat(plan.formattedContribution || '0')

  console.log('Enhanced Formatted amounts:', {
    formattedTarget,
    formattedDeposited,
    formattedContribution,
    planFormattedTarget: plan.formattedTarget,
    planFormattedDeposited: plan.formattedDeposited,
    planFormattedContribution: plan.formattedContribution,
    rawTarget: plan.target,
    rawDeposited: plan.deposited,
    rawContribution: plan.myContribution
  });

  // Determine status
  const isCompleted = !plan.active || plan.cancelled || plan.withdrawn
  const status = plan.withdrawn ? "Withdrawn" : plan.cancelled ? "Cancelled" : !plan.active ? "Completed" : progress >= 100 ? "Target Reached" : "Active"

  return (
    <motion.div whileHover={{ scale: 1.02, y: -2 }} whileTap={{ scale: 0.98 }} transition={{ duration: 0.2 }}>
      <Card className="neomorphic rounded-3xl p-6 border-0 hover:glow-secondary transition-all duration-300 cursor-pointer">
        {/* Header */}
        <div className="flex items-start justify-between mb-4">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-1">
              <h3 className="font-bold text-foreground text-balance">{plan.name || `Savings Plan #${plan.id}`}</h3>
              <Badge
                variant={isCompleted ? "outline" : "default"}
                className={`text-xs ${
                  plan.withdrawn ? "bg-blue-600 text-white" : 
                  plan.cancelled ? "bg-red-600 text-white" : 
                  !plan.active ? "bg-gray-600 text-white" : 
                  progress >= 100 ? "bg-green-600 text-white" : 
                  "bg-primary text-primary-foreground"
                }`}
              >
                {status}
              </Badge>
            </div>
            <p className="text-sm text-muted-foreground">{tokenSymbol}</p>
          </div>
          <div className="text-right">
            <p className="text-lg font-bold text-foreground">{formattedDeposited.toLocaleString()}</p>
            <p className="text-xs text-muted-foreground">of {formattedTarget.toLocaleString()}</p>
          </div>
        </div>

        {/* Progress */}
        <div className="space-y-3 mb-4">
          <div>
            <div className="flex justify-between text-sm mb-2">
              <span className="text-muted-foreground">Progress</span>
              <span className="font-medium text-foreground">{progress.toFixed(1)}%</span>
            </div>
            <Progress value={Math.min(progress, 100)} className="h-3 bg-muted" />
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-3 gap-4 mb-4">
          <div className="text-center">
            <div className="flex items-center justify-center gap-1 text-muted-foreground mb-1">
              <Users className="w-3 h-3" />
              <span className="text-xs">Participants</span>
            </div>
            <p className="font-semibold text-foreground">{plan.participants?.length ?? '-'}</p>
          </div>

          <div className="text-center">
            <div className="flex items-center justify-center gap-1 text-muted-foreground mb-1">
              <TrendingUp className="w-3 h-3" />
              <span className="text-xs">My Share</span>
            </div>
            <p className="font-semibold text-foreground">{formattedContribution.toLocaleString()}</p>
          </div>

          <div className="text-center">
            <div className="flex items-center justify-center gap-1 text-muted-foreground mb-1">
              <Calendar className="w-3 h-3" />
              <span className="text-xs">Deadline</span>
            </div>
            <p
              className={`font-semibold ${
                isCompleted ? "text-gray-600" : 
                isExpired ? "text-red-600" : 
                daysLeft < 30 ? "text-orange-600" : 
                "text-foreground"
              }`}
            >
              {isCompleted ? "Done" : isExpired ? "Expired" : daysLeft > 0 ? `${daysLeft}d` : "Today"}
            </p>
          </div>
        </div>

        {/* Action Button */}
        <Button
          variant={isCompleted ? "outline" : "default"}
          className="w-full rounded-xl"
          size="sm"
          onClick={() => navigate(`/plans/${plan.id}`)}
        >
          {isCompleted ? "View Details" : "Manage Plan"}
        </Button>
      </Card>
    </motion.div>
  )
}