"use client";

import { motion } from "framer-motion";
import { Home, PlusCircle, List } from "lucide-react";
import { useNavigate } from "react-router-dom";

const navItems = [
  { icon: Home, label: "Home", path: "/" },
  { icon: List, label: "Plans", path: "/plans" },
  { icon: PlusCircle, label: "Create", path: "/create" },
];

export function BottomNavigation() {
  const navigate = useNavigate();
  // Get the current page pathname using react-router
  const { pathname } = window.location;

  return (
    <motion.div
      initial={{ y: 100 }}
      animate={{ y: 0 }}
      transition={{ duration: 0.6, delay: 0.8 }}
      className="fixed bottom-0 left-0 right-0 bg-card/95 backdrop-blur-lg border-t border-border z-50"
    >
      <div className="flex items-center justify-center py-2 px-4 max-w-md mx-auto">
        <div className="flex items-center justify-between w-full max-w-xs">
          {navItems.map((item, index) => {
            const isActive =
              pathname === item.path || (item.path === "/plans" && pathname.startsWith("/plans"));

            return (
              <motion.button
                key={item.label}
                whileTap={{ scale: 0.95 }}
                onClick={() => navigate(item.path)}
                className={`flex flex-col items-center justify-center p-2 rounded-xl transition-all duration-200 ${
                  isActive
                    ? "text-primary bg-primary/10"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                <item.icon className="w-5 h-5 mb-1" />
                <span className="text-xs font-medium">{item.label}</span>
              </motion.button>
            );
          })}
        </div>
      </div>
    </motion.div>
  );
}
