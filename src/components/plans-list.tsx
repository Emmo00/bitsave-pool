import { motion } from "framer-motion";
import { Target, Users, Clock, TrendingUp } from "lucide-react";
import { useUserSavingsData } from "@/contexts/SavingsContext";
import { useAccount } from "wagmi";
import { formatDistanceToNow } from "date-fns";
import { useNavigate } from "react-router-dom";

export function PlansList() {
  const { isConnected } = useAccount();
  const navigate = useNavigate();
  const { plans, isLoading, error } = useUserSavingsData();

  if (!isConnected) {
    return (
      <div className="space-y-4">
        <h3 className="text-xl font-bold text-foreground mb-4">Your Savings Plans</h3>
        <div className="text-center py-8 text-muted-foreground">
          Connect your wallet to view your savings plans
        </div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="space-y-4">
        <h3 className="text-xl font-bold text-foreground mb-4">Your Savings Plans</h3>
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-xl p-6 animate-pulse"
            >
              <div className="h-6 bg-gray-300 rounded mb-4" />
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="h-4 bg-gray-300 rounded" />
                <div className="h-4 bg-gray-300 rounded" />
                <div className="h-4 bg-gray-300 rounded" />
                <div className="h-4 bg-gray-300 rounded" />
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-4">
        <h3 className="text-xl font-bold text-foreground mb-4">Your Savings Plans</h3>
        <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-xl text-red-400 text-center">
          Error loading plans: {error}
        </div>
      </div>
    );
  }

  if (plans.length === 0) {
    return (
      <div className="space-y-4">
        <h3 className="text-xl font-bold text-foreground mb-4">Your Savings Plans</h3>
        <div className="text-center py-8">
          <Target className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
          <p className="text-muted-foreground mb-4">No savings plans yet</p>
          <button
            className="px-6 py-2 bg-primary text-primary-foreground rounded-xl font-semibold brutalist-button hover:scale-105 transition-transform"
            onClick={() => navigate("/create")}
          >
            Create Your First Plan
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <h3 className="text-xl font-bold text-foreground mb-4">Your Savings Plans</h3>
      <div className="space-y-4">
        {plans.map((plan, index) => (
          <motion.div
            key={plan.id.toString()}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-xl p-6 brutalist-button glassmorphic hover:scale-[1.02] transition-transform cursor-pointer"
          >
            <div className="flex justify-between items-start mb-4">
              <div>
                <h4 className="text-lg font-semibold text-foreground">
                  Savings Plan #{plan.id.toString()}
                </h4>
                <div className="flex items-center gap-2 mt-1">
                  <span
                    className={`px-2 py-1 text-xs rounded-full ${
                      plan.active && !plan.isExpired
                        ? "bg-green-500/20 text-green-400"
                        : plan.progressPercentage >= 100
                          ? "bg-blue-500/20 text-blue-400"
                          : "bg-gray-500/20 text-gray-400"
                    }`}
                  >
                    {plan.active && !plan.isExpired
                      ? "Active"
                      : plan.progressPercentage >= 100
                        ? "Completed"
                        : plan.isExpired
                          ? "Expired"
                          : "Inactive"}
                  </span>
                  <span className="text-sm text-muted-foreground">{plan.tokenSymbol}</span>
                </div>
              </div>
              <div className="text-right">
                <p className="text-sm text-muted-foreground">Progress</p>
                <p className="text-lg font-bold text-foreground">
                  {plan.progressPercentage.toFixed(1)}%
                </p>
              </div>
            </div>

            {/* Progress Bar */}
            <div className="w-full bg-gray-700 rounded-full h-2 mb-4">
              <motion.div
                className="bg-gradient-to-r from-blue-500 to-purple-500 h-2 rounded-full"
                initial={{ width: 0 }}
                animate={{ width: `${Math.min(plan.progressPercentage, 100)}%` }}
                transition={{ duration: 1, delay: index * 0.2 }}
              />
            </div>

            {/* Plan Details */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
              <div className="flex items-center gap-2">
                <Target className="w-4 h-4 text-blue-400" />
                <div>
                  <p className="text-muted-foreground">Target</p>
                  <p className="font-semibold">{plan.formattedTarget}</p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-green-400" />
                <div>
                  <p className="text-muted-foreground">Deposited</p>
                  <p className="font-semibold">{plan.formattedDeposited}</p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <Users className="w-4 h-4 text-purple-400" />
                <div>
                  <p className="text-muted-foreground">Your Contribution</p>
                  <p className="font-semibold">{plan.formattedUserContribution}</p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-yellow-400" />
                <div>
                  <p className="text-muted-foreground">
                    {plan.isExpired ? "Expired" : "Time Left"}
                  </p>
                  <p className="font-semibold">
                    {plan.isExpired
                      ? formatDistanceToNow(new Date(Number(plan.deadline) * 1000), {
                          addSuffix: true,
                        })
                      : `${plan.daysRemaining} days`}
                  </p>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-2 mt-4">
              {plan.active && !plan.isExpired && plan.progressPercentage < 100 && (
                <button className="px-4 py-2 bg-blue-500 text-white rounded-lg text-sm font-semibold hover:bg-blue-600 transition-colors">
                  Add Funds
                </button>
              )}
              {plan.progressPercentage >= 100 && !plan.withdrawn && (
                <button className="px-4 py-2 bg-green-500 text-white rounded-lg text-sm font-semibold hover:bg-green-600 transition-colors">
                  Withdraw
                </button>
              )}
              <button className="px-4 py-2 bg-gray-600 text-white rounded-lg text-sm font-semibold hover:bg-gray-700 transition-colors">
                View Details
              </button>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
