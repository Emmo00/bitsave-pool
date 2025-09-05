"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { HeroSection } from "./hero-section";
import { PreviewCards } from "./preview-cards";
import { BottomNavigation } from "./bottom-navigation";
import { SavingsStats } from "./savings-stats";
import { PlansList } from "./plans-list";

export function Dashboard() {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return null;
  }

  return (
    <div className="min-h-screen bg-background pt-8">
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.6 }}
        className="pb-20 px-4"
      >
        <HeroSection />
        
        {/* Smart Contract Integration - Savings Stats */}
        <SavingsStats />
        
        {/* Smart Contract Integration - Plans List */}
        <PlansList />
        
        {/* Keep the existing preview cards for other features */}
        <div className="mt-8">
          <PreviewCards />
        </div>
      </motion.div>
      <BottomNavigation />
    </div>
  );
}
