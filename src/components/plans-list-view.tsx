"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { ArrowLeft, Users, Calendar, Target, TrendingUp } from "lucide-react"
import { useNavigate } from "react-router-dom"

const mockPlansOwned = [
  {
    id: 1,
    name: "Emergency Fund",
    token: "USDC",
    target: 10000,
    current: 7500,
    participants: 3,
    deadline: "2024-12-31",
    status: "active",
    myContribution: 2500,
  },
  {
    id: 2,
    name: "Vacation Fund",
    token: "DAI",
    target: 5000,
    current: 2800,
    participants: 2,
    deadline: "2024-08-15",
    status: "active",
    myContribution: 1400,
  },
  {
    id: 3,
    name: "New Car Fund",
    token: "USDT",
    target: 25000,
    current: 12000,
    participants: 4,
    deadline: "2025-06-01",
    status: "active",
    myContribution: 3000,
  },
  {
    id: 4,
    name: "Gaming Setup",
    token: "USDC",
    target: 3000,
    current: 3000,
    participants: 1,
    deadline: "2024-03-15",
    status: "completed",
    myContribution: 3000,
  },
  {
    id: 5,
    name: "Investment Portfolio",
    token: "DAI",
    target: 50000,
    current: 18500,
    participants: 5,
    deadline: "2025-12-31",
    status: "active",
    myContribution: 5000,
  },
]

const mockPlansJoined = [
  {
    id: 6,
    name: "House Down Payment",
    token: "USDC",
    target: 50000,
    current: 32000,
    participants: 6,
    deadline: "2025-03-15",
    status: "active",
    myContribution: 8000,
  },
  {
    id: 7,
    name: "Wedding Fund",
    token: "DAI",
    target: 15000,
    current: 9500,
    participants: 2,
    deadline: "2024-10-20",
    status: "active",
    myContribution: 4750,
  },
  {
    id: 8,
    name: "Startup Capital",
    token: "USDT",
    target: 100000,
    current: 45000,
    participants: 8,
    deadline: "2025-08-01",
    status: "active",
    myContribution: 12000,
  },
  {
    id: 9,
    name: "Family Vacation",
    token: "USDC",
    target: 8000,
    current: 8000,
    participants: 4,
    deadline: "2024-01-15",
    status: "completed",
    myContribution: 2000,
  },
]

interface PlansListViewProps {
  type?: "owned" | "joined" | "all"
}

export function PlansListView({ type = "all" }: PlansListViewProps) {
  const [mounted, setMounted] = useState(false)
  const [activeTab, setActiveTab] = useState<"owned" | "joined">(type === "joined" ? "joined" : "owned")
  const navigate = useNavigate()

  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) {
    return null
  }

  const plans = activeTab === "owned" ? mockPlansOwned : mockPlansJoined
  const activePlans = plans.filter((plan) => plan.status === "active")
  const completedPlans = plans.filter((plan) => plan.status === "completed")

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

        {plans.length === 0 && (
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
  const progress = (plan.current / plan.target) * 100
  const isCompleted = plan.status === "completed"
  const daysLeft = Math.ceil((new Date(plan.deadline).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24))
  const navigate = useNavigate()

  return (
    <motion.div whileHover={{ scale: 1.02, y: -2 }} whileTap={{ scale: 0.98 }} transition={{ duration: 0.2 }}>
      <Card className="neomorphic rounded-3xl p-6 border-0 hover:glow-secondary transition-all duration-300 cursor-pointer">
        {/* Header */}
        <div className="flex items-start justify-between mb-4">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-1">
              <h3 className="font-bold text-foreground text-balance">{plan.name}</h3>
              <Badge
                variant={isCompleted ? "default" : "secondary"}
                className={`text-xs ${isCompleted ? "bg-green-600 text-white" : "bg-primary text-primary-foreground"}`}
              >
                {isCompleted ? "Completed" : "Active"}
              </Badge>
            </div>
            <p className="text-sm text-muted-foreground">{plan.token}</p>
          </div>
          <div className="text-right">
            <p className="text-lg font-bold text-foreground">${plan.current.toLocaleString()}</p>
            <p className="text-xs text-muted-foreground">of ${plan.target.toLocaleString()}</p>
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
            <p className="font-semibold text-foreground">{plan.participants}</p>
          </div>

          <div className="text-center">
            <div className="flex items-center justify-center gap-1 text-muted-foreground mb-1">
              <TrendingUp className="w-3 h-3" />
              <span className="text-xs">My Share</span>
            </div>
            <p className="font-semibold text-foreground">${plan.myContribution.toLocaleString()}</p>
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
  )
}