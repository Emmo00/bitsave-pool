"use client";

import { motion } from "framer-motion";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Users, Calendar } from "lucide-react";
import { useNavigate } from "react-router-dom";

const mockPlansOwned = [
  {
    id: 1,
    name: "Emergency Fund",
    token: "USDC",
    target: 10000,
    current: 7500,
    participants: 3,
    deadline: "2024-12-31",
  },
  {
    id: 2,
    name: "Vacation Fund",
    token: "DAI",
    target: 5000,
    current: 2800,
    participants: 2,
    deadline: "2024-08-15",
  },
  {
    id: 3,
    name: "New Car Fund",
    token: "USDT",
    target: 25000,
    current: 12000,
    participants: 4,
    deadline: "2025-06-01",
  },
];

const mockPlansJoined = [
  {
    id: 4,
    name: "House Down Payment",
    token: "USDC",
    target: 50000,
    current: 32000,
    participants: 6,
    deadline: "2025-03-15",
  },
  {
    id: 5,
    name: "Wedding Fund",
    token: "DAI",
    target: 15000,
    current: 9500,
    participants: 2,
    deadline: "2024-10-20",
  },
];

export function PreviewCards() {
  const navigate = useNavigate();

  return (
    <div className="px-4 space-y-6">
      {/* Plans I Own Section */}
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
            onClick={() => navigate("/plans/my-plans")}
          >
            VIEW ALL
          </Button>
        </div>

        <div className="space-y-3">
          {mockPlansOwned.slice(0, 3).map((plan, index) => (
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

      {/* Plans I Participate In Section */}
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
            onClick={() => navigate("/plans/joined")}
          >
            VIEW ALL
          </Button>
        </div>

        <div className="space-y-3">
          {mockPlansJoined.slice(0, 3).map((plan, index) => (
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
  const progress = (plan.current / plan.target) * 100;

  return (
    <Card className="brutalist-card p-4 bg-white hover:brutalist-shadow-primary transition-all duration-200">
      <div className="flex items-start justify-between mb-3">
        <div>
          <h4 className="font-black text-foreground text-balance uppercase tracking-wide">
            {plan.name}
          </h4>
          <p className="text-sm text-muted-foreground font-bold uppercase">{plan.token}</p>
        </div>
        <div className="text-right">
          <p className="text-sm font-black text-foreground">${plan.current.toLocaleString()}</p>
          <p className="text-xs text-muted-foreground font-bold uppercase">
            OF ${plan.target.toLocaleString()}
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
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>

        <div className="flex items-center justify-between text-xs text-muted-foreground">
          <div className="flex items-center gap-1">
            <Users className="w-3 h-3" />
            <span className="font-bold uppercase">{plan.participants} PARTICIPANTS</span>
          </div>
          <div className="flex items-center gap-1">
            <Calendar className="w-3 h-3" />
            <span className="font-bold uppercase">
              {new Date(plan.deadline).toLocaleDateString()}
            </span>
          </div>
        </div>
      </div>
    </Card>
  );
}
