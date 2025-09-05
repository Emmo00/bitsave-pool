"use client"

import { motion } from "framer-motion"
import { Card } from "@/components/ui/card"

export function HeroSection() {
  return (
    <div className="px-4 pt-8 pb-6">
      <motion.div
        initial={{ y: 30, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.8, delay: 0.2 }}
        className="text-center mb-8"
      >
        <h1 className="text-4xl font-black text-foreground mb-2 text-balance uppercase tracking-wider">BITSAVE POOL</h1>
        <p className="text-muted-foreground text-balance font-bold uppercase text-sm tracking-wide">
          SAVE TOGETHER, ACHIEVE MORE
        </p>
      </motion.div>

      <motion.div
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.8, delay: 0.4 }}
      >
        <Card className="brutalist-card p-6 mx-4 bg-white">
          <div className="text-center">
            <p className="text-sm text-muted-foreground mb-2 font-bold uppercase tracking-wide">
              TOTAL AMOUNT LOCKED IN SAVINGS
            </p>
            <motion.div
              initial={{ scale: 0.8 }}
              animate={{ scale: 1 }}
              transition={{
                duration: 1.2,
                delay: 0.6,
                type: "spring",
                stiffness: 100,
              }}
            >
              <h2 className="text-5xl font-black text-primary mb-1">$127,450.32</h2>
            </motion.div>
            <div className="flex items-center justify-center gap-2 text-sm">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: "100%" }}
                transition={{ duration: 1, delay: 0.8 }}
                className="h-4 bg-primary border-2 border-black"
              />
            </div>
            <p className="text-xs text-muted-foreground mt-2 font-bold uppercase tracking-wide">
              ACROSS 24 ACTIVE SAVINGS PLANS
            </p>
          </div>
        </Card>
      </motion.div>
    </div>
  )
}
