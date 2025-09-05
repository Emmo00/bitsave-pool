import { motion } from "framer-motion";
import { Target, Users, Clock, TrendingUp, ArrowRight } from "lucide-react";
import { useAccount } from "wagmi";
import { formatDistanceToNow } from "date-fns";
import { useNavigate } from "react-router-dom";
import { useUserPlans } from "@/hooks/use-user-plans";
import { SUPPORTED_TOKENS } from "@/contracts/config";

export function PlansList() {
  const { isConnected } = useAccount();
  const navigate = useNavigate();
  const { plans, loading, address } = useUserPlans();

  if (!isConnected) {
    return (
      <div className="space-y-6">
        <h3 className="text-xl font-bold text-foreground mb-4">Your Savings Plans</h3>
        <div className="text-center py-8 text-muted-foreground">
          Connect your wallet to view your savings plans
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="space-y-6">
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

  // Separate owned and joined plans
  const ownedPlans = plans.filter((plan) => 
    address && plan.owner.toLowerCase() === address.toLowerCase()
  );
  const joinedPlans = plans.filter((plan) => 
    address && plan.owner.toLowerCase() !== address.toLowerCase()
  );

  const activePlans = plans.filter(plan => plan.active && !plan.cancelled && !plan.withdrawn);

  if (plans.length === 0) {
    return (
      <div className="space-y-6">
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
    <div className="space-y-6">
      {/* Plans I Own Section */}
      {ownedPlans.length > 0 && (
        <div>
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-xl font-bold text-foreground">Plans I Own</h3>
            <button 
              onClick={() => navigate("/plans?type=owned")}
              className="text-sm text-primary hover:text-primary/80 flex items-center gap-1"
            >
              View All <ArrowRight className="w-4 h-4" />
            </button>
          </div>
          <div className="space-y-4">
            {ownedPlans.slice(0, 2).map((plan, index) => (
              <PlanCard key={plan.id} plan={plan} index={index} />
            ))}
          </div>
        </div>
      )}

      {/* Plans I Participate In Section */}
      {joinedPlans.length > 0 && (
        <div>
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-xl font-bold text-foreground">Plans I Participate In</h3>
            <button 
              onClick={() => navigate("/plans?type=joined")}
              className="text-sm text-primary hover:text-primary/80 flex items-center gap-1"
            >
              View All <ArrowRight className="w-4 h-4" />
            </button>
          </div>
          <div className="space-y-4">
            {joinedPlans.slice(0, 2).map((plan, index) => (
              <PlanCard key={plan.id} plan={plan} index={index} />
            ))}
          </div>
        </div>
      )}

      {/* Show create button if no plans */}
      {ownedPlans.length === 0 && joinedPlans.length === 0 && (
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
      )}
    </div>
  );
}

function PlanCard({ plan, index }: { plan: any; index: number }) {
  const navigate = useNavigate();
  
  // Calculate progress and formatting
  const progress = plan.target && plan.target > 0n ? Number(plan.deposited) / Number(plan.target) * 100 : 0;
  const deadlineDate = plan.deadline ? new Date(Number(plan.deadline) * 1000) : null;
  const now = new Date();
  const isExpired = deadlineDate && now > deadlineDate;
  const daysLeft = deadlineDate ? Math.max(0, Math.ceil((deadlineDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24))) : 0;
  
  // Token info
  const tokenInfo = SUPPORTED_TOKENS.find(t => t.address.toLowerCase() === plan.token.toLowerCase());
  const tokenSymbol = tokenInfo ? tokenInfo.symbol : 'Unknown';
  
  // Format amounts
  const formattedTarget = tokenInfo ? 
    `${tokenSymbol} ${Number(plan.target) / (10 ** tokenInfo.decimals)}` : 
    `${Number(plan.target)}`;
  const formattedDeposited = tokenInfo ? 
    `${tokenSymbol} ${Number(plan.deposited) / (10 ** tokenInfo.decimals)}` : 
    `${Number(plan.deposited)}`;
  const formattedContribution = tokenInfo ? 
    `${tokenSymbol} ${Number(plan.myContribution) / (10 ** tokenInfo.decimals)}` : 
    `${Number(plan.myContribution)}`;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.1 }}
      className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-xl p-6 brutalist-button glassmorphic hover:scale-[1.02] transition-transform cursor-pointer"
      onClick={() => navigate(`/plans/${plan.id}`)}
    >
      <div className="flex justify-between items-start mb-4">
        <div>
          <h4 className="text-lg font-semibold text-foreground">
            Savings Plan #{plan.id}
          </h4>
          <div className="flex items-center gap-2 mt-1">
            <span
              className={`px-2 py-1 text-xs rounded-full ${
                plan.active && !isExpired && !plan.cancelled
                  ? "bg-green-500/20 text-green-400"
                  : progress >= 100
                    ? "bg-blue-500/20 text-blue-400"
                    : "bg-gray-500/20 text-gray-400"
              }`}
            >
              {plan.active && !isExpired && !plan.cancelled
                ? "Active"
                : progress >= 100
                  ? "Completed"
                  : isExpired || plan.cancelled
                    ? "Expired"
                    : "Inactive"}
            </span>
            <span className="text-sm text-muted-foreground">{tokenSymbol}</span>
          </div>
        </div>
        <div className="text-right">
          <p className="text-sm text-muted-foreground">Progress</p>
          <p className="text-lg font-bold text-foreground">
            {progress.toFixed(1)}%
          </p>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="w-full bg-gray-700 rounded-full h-2 mb-4">
        <motion.div
          className="bg-gradient-to-r from-blue-500 to-purple-500 h-2 rounded-full"
          initial={{ width: 0 }}
          animate={{ width: `${Math.min(progress, 100)}%` }}
          transition={{ duration: 1, delay: index * 0.2 }}
        />
      </div>

      {/* Plan Details */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
        <div className="flex items-center gap-2">
          <Target className="w-4 h-4 text-blue-400" />
          <div>
            <p className="text-muted-foreground">Target</p>
            <p className="font-semibold">{formattedTarget}</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <TrendingUp className="w-4 h-4 text-green-400" />
          <div>
            <p className="text-muted-foreground">Deposited</p>
            <p className="font-semibold">{formattedDeposited}</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Users className="w-4 h-4 text-purple-400" />
          <div>
            <p className="text-muted-foreground">My Contribution</p>
            <p className="font-semibold">{formattedContribution}</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Clock className="w-4 h-4 text-yellow-400" />
          <div>
            <p className="text-muted-foreground">
              {isExpired ? "Expired" : "Time Left"}
            </p>
            <p className="font-semibold">
              {isExpired
                ? formatDistanceToNow(deadlineDate, { addSuffix: true })
                : `${daysLeft} days`}
            </p>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
