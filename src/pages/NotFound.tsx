import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { Ghost } from "lucide-react";

export default function NotFound() {
  const navigate = useNavigate();
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-background px-4">
      <motion.div
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.7, type: "spring" }}
        className="brutalist-card glassmorphic p-10 rounded-3xl shadow-2xl border-4 border-black/80 bg-white/60 backdrop-blur-lg flex flex-col items-center"
      >
        <Ghost className="w-20 h-20 text-primary mb-4 drop-shadow-lg" />
        <h1 className="text-6xl font-black text-foreground mb-2 tracking-tight brutalist-shadow-primary">404</h1>
        <h2 className="text-2xl font-bold text-foreground mb-4 uppercase tracking-widest">Page Not Found</h2>
        <p className="text-muted-foreground text-center mb-8 max-w-xs">
          Oops! The page you are looking for doesn't exist or has been moved.
        </p>
        <Button
          className="brutalist-button bg-primary text-primary-foreground px-8 py-3 text-lg rounded-xl shadow-lg hover:scale-105 transition-transform"
          onClick={() => navigate("/")}
        >
          Go Home
        </Button>
      </motion.div>
    </div>
  );
}
