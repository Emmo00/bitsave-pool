"use client"


import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { ArrowLeft, Users, Calendar, Target, TrendingUp } from "lucide-react"
import { useNavigate } from "react-router-dom"
import { useUserPlans } from "@/hooks/use-user-plans"
import { SUPPORTED_TOKENS } from "@/contracts/config"


interface PlansListViewProps {
  type?: "owned" | "joined" | "all"
}

export function PlansListView({ type = "all" }: PlansListViewProps) {
  const [mounted, setMounted] = useState(false)
  const [activeTab, setActiveTab] = useState<"owned" | "joined">(type === "joined" ? "joined" : "owned")
  const navigate = useNavigate()

  // Call hooks before any conditional returns
  const { plans, loading, address } = useUserPlans();

  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) {
    return null
  }
  // "owned" = user is owner, "joined" = user is participant but not owner
  const ownedPlans = plans.filter((plan) => plan.owner.toLowerCase() === address?.toLowerCase());
  const joinedPlans = plans.filter((plan) => plan.owner.toLowerCase() !== address?.toLowerCase());
  const plansToShow = activeTab === "owned" ? ownedPlans : joinedPlans;
  const activePlans = plansToShow.filter((plan) => plan.active && !plan.cancelled && !plan.withdrawn);
  const completedPlans = plansToShow.filter((plan) => !plan.active || plan.cancelled || plan.withdrawn);

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
            </div>
          </div>
        )}
      </motion.div>

      {/* Plans Grid */}
      <div className="px-4 space-y-6">
        {/* Active Plans */}
        {activePlans.length > 0 && (
          <motion.div
            initial={{ y: 30, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            <h2 className="text-lg font-semibold text-foreground mb-4">Active Plans</h2>
            <div className="grid gap-4">
              {activePlans.map((plan, index) => (
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

        {/* Completed Plans */}
        {completedPlans.length > 0 && (
          <motion.div
            initial={{ y: 30, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.4 }}
          >
            <h2 className="text-lg font-semibold text-foreground mb-4">Completed Plans</h2>
            <div className="grid gap-4">
              {completedPlans.map((plan, index) => (
                <motion.div
                  key={plan.id}
                  initial={{ y: 20, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ duration: 0.4, delay: 0.5 + index * 0.1 }}
                >
                  <EnhancedPlanCard plan={plan} />
                </motion.div>
              ))}
            </div>
          </motion.div>
        )}

  {plansToShow.length === 0 && !loading && (
          <motion.div
            initial={{ y: 30, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="text-center py-12"
          >
            <Target className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-foreground mb-2">No plans yet</h3>
            <p className="text-muted-foreground mb-6 text-balance">
              {activeTab === "owned"
                ? "Create your first savings plan to get started"
                : "Join a savings plan to start saving together"}
            </p>
            <Button className="rounded-2xl glow-primary">
              {activeTab === "owned" ? "Create Plan" : "Browse Plans"}
            </Button>
          </motion.div>
        )}
      </div>
    </div>
  )
}


function EnhancedPlanCard({ plan }: { plan: any }) {
  const navigate = useNavigate();
  // Progress: deposited / target
  const progress = plan.target && plan.target > 0n ? Number(plan.deposited) / Number(plan.target) * 100 : 0;
  const isCompleted = !plan.active || plan.cancelled || plan.withdrawn;
  // Deadline is a bigint (seconds), convert to ms
  const deadlineDate = plan.deadline ? new Date(Number(plan.deadline) * 1000) : null;
  const now = new Date();
  const daysLeft = deadlineDate ? Math.ceil((deadlineDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)) : 0;
  // Token symbol
  const tokenInfo = plan.token && plan.token.length === 42 ? SUPPORTED_TOKENS.find((t: any) => t.address.toLowerCase() === plan.token.toLowerCase()) : undefined;
  const tokenSymbol = tokenInfo ? tokenInfo.symbol : plan.token?.slice(0, 6) + '...';

  return (
    <motion.div whileHover={{ scale: 1.02, y: -2 }} whileTap={{ scale: 0.98 }} transition={{ duration: 0.2 }}>
      <Card className="neomorphic rounded-3xl p-6 border-0 hover:glow-secondary transition-all duration-300 cursor-pointer">
        {/* Header */}
        <div className="flex items-start justify-between mb-4">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-1">
              <h3 className="font-bold text-foreground text-balance">Plan #{plan.id}</h3>
              <Badge
                variant={isCompleted ? "default" : "secondary"}
                className={`text-xs ${isCompleted ? "bg-green-600 text-white" : "bg-primary text-primary-foreground"}`}
              >
                {isCompleted ? "Completed" : "Active"}
              </Badge>
            </div>
            <p className="text-sm text-muted-foreground">{tokenSymbol}</p>
          </div>
          <div className="text-right">
            <p className="text-lg font-bold text-foreground">{tokenInfo ? tokenInfo.symbol : ''} {plan.deposited ? Number(plan.deposited) / (tokenInfo ? 10 ** tokenInfo.decimals : 1) : 0}</p>
            <p className="text-xs text-muted-foreground">of {tokenInfo ? tokenInfo.symbol : ''} {plan.target ? Number(plan.target) / (tokenInfo ? 10 ** tokenInfo.decimals : 1) : 0}</p>
          </div>
        </div>

        {/* Progress */}
        <div className="space-y-3 mb-4">
          <div>
            <div className="flex justify-between text-sm mb-2">
              <span className="text-muted-foreground">Progress</span>
              <span className="font-medium text-foreground">{progress.toFixed(1)}%</span>
            </div>
            <Progress value={progress} className="h-3 bg-muted" />
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
            <p className="font-semibold text-foreground">{plan.formattedContribution}</p>
          </div>

          <div className="text-center">
            <div className="flex items-center justify-center gap-1 text-muted-foreground mb-1">
              <Calendar className="w-3 h-3" />
              <span className="text-xs">Deadline</span>
            </div>
            <p
              className={`font-semibold ${isCompleted ? "text-green-600" : daysLeft < 30 ? "text-orange-600" : "text-foreground"}`}
            >
              {isCompleted ? "Done" : daysLeft > 0 ? `${daysLeft}d` : "Overdue"}
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
  );
}
