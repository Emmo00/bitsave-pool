"use client";

import { motion } from "framer-motion";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Users, Calendar } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useAccount } from "wagmi";
import { useUserPlans } from "@/hooks/use-user-plans";
import { SUPPORTED_TOKENS } from "@/contracts/config";

export function PreviewCards() {
  const navigate = useNavigate();
  const { isConnected, address } = useAccount();
  const { plans, loading } = useUserPlans();

  if (!isConnected) {
    return (
      <div className="px-4 space-y-6">
        <div className="text-center py-8">
          <p className="text-muted-foreground">Connect your wallet to view your savings plans</p>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="px-4 space-y-6">
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-xl p-4 animate-pulse"
            >
              <div className="h-6 bg-gray-300 rounded mb-4" />
              <div className="h-4 bg-gray-300 rounded" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  // Filter active plans that haven't been withdrawn
  const activePlans = plans.filter(plan => 
    plan.active && !plan.cancelled && !plan.withdrawn
  );

  // Separate owned and joined active plans
  const ownedPlans = activePlans.filter((plan) => 
    address && plan.owner.toLowerCase() === address.toLowerCase()
  );
  const joinedPlans = activePlans.filter((plan) => 
    address && plan.owner.toLowerCase() !== address.toLowerCase()
  );

  return (
    <div className="px-4 space-y-6">
      {/* Plans I Own Section */}
      {ownedPlans.length > 0 && (
        <motion.div
          initial={{ y: 50, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.8, delay: 0.6 }}
        >
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-black text-foreground uppercase tracking-wide">
              PLANS I OWN
            </h3>
            <Button
              variant="ghost"
              size="sm"
              className="text-primary font-bold uppercase"
              onClick={() => navigate("/plans?type=owned")}
            >
              VIEW ALL
            </Button>
          </div>

          <div className="space-y-3">
            {ownedPlans.slice(0, 3).map((plan, index) => (
              <motion.div
                key={plan.id}
                initial={{ x: -30, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                transition={{ duration: 0.6, delay: 0.8 + index * 0.1 }}
              >
                <PlanCard plan={plan} />
              </motion.div>
            ))}
          </div>
        </motion.div>
      )}

      {/* Plans I Participate In Section */}
      {joinedPlans.length > 0 && (
        <motion.div
          initial={{ y: 50, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.8, delay: 1.0 }}
        >
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-black text-foreground uppercase tracking-wide">
              PLANS I PARTICIPATE IN
            </h3>
            <Button
              variant="ghost"
              size="sm"
              className="text-primary font-bold uppercase"
              onClick={() => navigate("/plans?type=joined")}
            >
              VIEW ALL
            </Button>
          </div>

          <div className="space-y-3">
            {joinedPlans.slice(0, 3).map((plan, index) => (
              <motion.div
                key={plan.id}
                initial={{ x: -30, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                transition={{ duration: 0.6, delay: 1.2 + index * 0.1 }}
              >
                <PlanCard plan={plan} />
              </motion.div>
            ))}
          </div>
        </motion.div>
      )}

      {/* Show message if no active plans */}
      {ownedPlans.length === 0 && joinedPlans.length === 0 && (
        <motion.div
          initial={{ y: 50, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.8, delay: 0.6 }}
          className="text-center py-8"
        >
          <p className="text-muted-foreground mb-4">No active savings plans yet</p>
        </motion.div>
      )}

      {/* Action Buttons */}
      <motion.div
        initial={{ y: 30, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.8, delay: 1.4 }}
        className="space-y-3 pt-4"
      >
        <Button
          className="brutalist-button w-full h-12 bg-primary text-primary-foreground"
          size="lg"
          onClick={() => navigate("/create")}
        >
          CREATE SAVINGS PLAN
        </Button>
        <Button
          className="brutalist-button w-full h-12 bg-secondary text-secondary-foreground"
          size="lg"
          onClick={() => navigate("/plans")}
        >
          BROWSE PUBLIC PLANS
        </Button>
      </motion.div>
    </div>
  );
}

function PlanCard({ plan }: { plan: any }) {
  // Calculate progress and formatting
  const progress = plan.target && plan.target > 0n ? Number(plan.deposited) / Number(plan.target) * 100 : 0;
  const deadlineDate = plan.deadline ? new Date(Number(plan.deadline) * 1000) : null;
  
  // Token info
  const tokenInfo = SUPPORTED_TOKENS.find(t => t.address.toLowerCase() === plan.token.toLowerCase());
  const tokenSymbol = tokenInfo ? tokenInfo.symbol : 'Unknown';
  
  // Format amounts
  const formattedTarget = tokenInfo ? 
    Number(plan.target) / (10 ** tokenInfo.decimals) : 
    Number(plan.target);
  const formattedDeposited = tokenInfo ? 
    Number(plan.deposited) / (10 ** tokenInfo.decimals) : 
    Number(plan.deposited);

  return (
    <Card className="brutalist-card p-4 bg-white hover:brutalist-shadow-primary transition-all duration-200">
      <div className="flex items-start justify-between mb-3">
        <div>
          <h4 className="font-black text-foreground text-balance uppercase tracking-wide">
            {plan.name || `Savings Plan #${plan.id}`}
          </h4>
          <p className="text-sm text-muted-foreground font-bold uppercase">{tokenSymbol}</p>
        </div>
        <div className="text-right">
          <p className="text-sm font-black text-foreground">${formattedDeposited.toLocaleString()}</p>
          <p className="text-xs text-muted-foreground font-bold uppercase">
            OF ${formattedTarget.toLocaleString()}
          </p>
        </div>
      </div>

      <div className="space-y-3">
        <div>
          <div className="flex justify-between text-xs text-muted-foreground mb-1">
            <span className="font-bold uppercase">PROGRESS</span>
            <span className="font-bold">{progress.toFixed(1)}%</span>
          </div>
          <div className="h-3 bg-muted border-2 border-black">
            <div
              className="h-full bg-primary border-r-2 border-black transition-all duration-300"
              style={{ width: `${Math.min(progress, 100)}%` }}
            />
          </div>
        </div>

        <div className="flex items-center justify-between text-xs text-muted-foreground">
          <div className="flex items-center gap-1">
            <Users className="w-3 h-3" />
            <span className="font-bold uppercase">{plan.participants || 1} PARTICIPANTS</span>
          </div>
          <div className="flex items-center gap-1">
            <Calendar className="w-3 h-3" />
            <span className="font-bold uppercase">
              {deadlineDate ? deadlineDate.toLocaleDateString() : 'No deadline'}
            </span>
          </div>
        </div>
      </div>
    </Card>
  );
}
