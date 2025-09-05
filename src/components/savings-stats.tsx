import { motion } from "framer-motion";
import { TrendingUp, Target, Calendar, DollarSign } from "lucide-react";
import { useUserSavingsData } from "@/contexts/SavingsContext";
import { useAccount } from "wagmi";

export function SavingsStats() {
  const { isConnected } = useAccount();
  const { totalPlans, activePlans, completedPlans, totalSaved, isLoading, error } = useUserSavingsData();

  if (!isConnected) {
    return (
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        {[1, 2, 3, 4].map((i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
            className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-xl p-4 brutalist-button glassmorphic"
          >
            <div className="text-center">
              <div className="w-8 h-8 bg-gray-300 rounded-full mx-auto mb-2 animate-pulse" />
              <div className="h-4 bg-gray-300 rounded mb-2 animate-pulse" />
              <div className="h-6 bg-gray-300 rounded animate-pulse" />
            </div>
          </motion.div>
        ))}
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        {[1, 2, 3, 4].map((i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
            className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-xl p-4 brutalist-button glassmorphic"
          >
            <div className="text-center">
              <div className="w-8 h-8 bg-gray-300 rounded-full mx-auto mb-2 animate-pulse" />
              <div className="h-4 bg-gray-300 rounded mb-2 animate-pulse" />
              <div className="h-6 bg-gray-300 rounded animate-pulse" />
            </div>
          </motion.div>
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <div className="mb-8 p-4 bg-red-500/10 border border-red-500/20 rounded-xl text-red-400 text-center">
        Error loading savings data: {error}
      </div>
    );
  }

  const stats = [
    {
      icon: Target,
      label: "Total Plans",
      value: totalPlans.toString(),
      color: "text-blue-400",
    },
    {
      icon: TrendingUp,
      label: "Active Plans",
      value: activePlans.toString(),
      color: "text-green-400",
    },
    {
      icon: Calendar,
      label: "Completed",
      value: completedPlans.toString(),
      color: "text-purple-400",
    },
    {
      icon: DollarSign,
      label: "Total Saved",
      value: `${totalSaved} USDC`,
      color: "text-yellow-400",
    },
  ];

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
      {stats.map((stat, index) => (
        <motion.div
          key={stat.label}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: index * 0.1 }}
          className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-xl p-4 brutalist-button glassmorphic hover:scale-105 transition-transform"
        >
          <div className="text-center">
            <stat.icon className={`w-8 h-8 ${stat.color} mx-auto mb-2`} />
            <p className="text-sm text-muted-foreground mb-1">{stat.label}</p>
            <p className="text-xl font-bold text-foreground">{stat.value}</p>
          </div>
        </motion.div>
      ))}
    </div>
  );
}
