"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowLeft, Check } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { CreatePlanForm } from "./create-plan-form";
import { ConfirmationModal } from "./confirmation-modal";

export interface PlanFormData {
  planName: string;
  targetAmount: string;
  stablecoin: string;
  deadline: string;
  participants: Array<{
    id: string;
    address: string;
    ensName?: string;
    avatar?: string;
  }>;
}

export function CreateSavingsFlow() {
  const [mounted, setMounted] = useState(false);
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState<PlanFormData>({
    planName: "",
    targetAmount: "",
    stablecoin: "USDC",
    deadline: "",
    participants: [],
  });
  const [showConfirmation, setShowConfirmation] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return null;
  }

  const handleFormSubmit = (data: PlanFormData) => {
    setFormData(data);
    setShowConfirmation(true);
  };

  const handleConfirm = () => {
    // The transaction is now handled directly in the ConfirmationModal
    // We just close the modal and navigate on success
    setShowConfirmation(false);
    navigate("/plans");
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <motion.div
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.6 }}
        className="sticky top-0 bg-background/95 backdrop-blur-lg border-b border-border z-10"
      >
        <div className="flex items-center justify-between p-4">
          <Button variant="ghost" size="sm" onClick={() => navigate("/")} className="p-2">
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <h1 className="text-xl font-bold text-foreground">Create Savings Plan</h1>
          <div className="w-9" /> {/* Spacer */}
        </div>

        {/* Progress Indicator */}
        <div className="px-4 pb-4">
          <div className="flex items-center justify-center space-x-2">
            <div
              className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium transition-all duration-300 ${
                step >= 1 ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"
              }`}
            >
              {step > 1 ? <Check className="w-4 h-4" /> : "1"}
            </div>
            <div
              className={`h-1 w-12 rounded-full transition-all duration-300 ${step > 1 ? "bg-primary" : "bg-muted"}`}
            />
            <div
              className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium transition-all duration-300 ${
                step >= 2 ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"
              }`}
            >
              2
            </div>
          </div>
          <div className="flex justify-between text-xs text-muted-foreground mt-2">
            <span>Details</span>
            <span>Confirm & Create</span>
          </div>
        </div>
      </motion.div>

      {/* Form Content */}
      <div className="px-4 py-6">
        <AnimatePresence mode="wait">
          {step === 1 && (
            <motion.div
              key="form"
              initial={{ x: 20, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              exit={{ x: -20, opacity: 0 }}
              transition={{ duration: 0.4 }}
            >
              <CreatePlanForm
                initialData={formData}
                onSubmit={handleFormSubmit}
                onNext={() => setStep(2)}
              />
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Confirmation Modal */}
      <ConfirmationModal
        isOpen={showConfirmation}
        onClose={() => setShowConfirmation(false)}
        onConfirm={handleConfirm}
        planData={formData}
      />
    </div>
  );
}
