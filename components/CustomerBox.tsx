"use client";

import { motion } from "framer-motion";
import { User, Plus } from "lucide-react";
import { cn } from "@/utils/cn";

interface CustomerBoxProps {
  boxNumber: number;
  customer?: {
    id: string;
    name: string;
    isPaid: boolean;
    isPartial?: boolean;
  } | null;
  onClick: () => void;
}

export function CustomerBox({ boxNumber, customer, onClick }: CustomerBoxProps) {
  if (!customer) {
    return (
      <motion.button
        id={`box-${boxNumber}`}
        whileHover={{ scale: 1.04 }}
        whileTap={{ scale: 0.97 }}
        onClick={onClick}
        className="box-empty rounded-xl p-3 flex flex-col items-center justify-center gap-1 min-h-[80px] group"
      >
        <span className="text-xs font-bold text-dark-500 group-hover:text-brand-400 transition-colors">
          {boxNumber}
        </span>
        <Plus className="w-4 h-4 text-dark-600 group-hover:text-brand-400 transition-colors" />
      </motion.button>
    );
  }

  const isPaid = customer.isPaid;
  const isPartial = customer.isPartial;

  return (
    <motion.button
      id={`box-${boxNumber}`}
      whileHover={{ scale: 1.04 }}
      whileTap={{ scale: 0.97 }}
      onClick={onClick}
      className={cn(
        "rounded-xl p-3 flex flex-col items-start gap-1 min-h-[80px] relative overflow-hidden",
        isPaid ? "box-paid" : isPartial ? "bg-amber-950/40 border border-amber-900/60 hover:border-amber-600 hover:bg-amber-900/40" : "box-unpaid"
      )}
    >
      {/* Glow dot */}
      <div
        className={cn(
          "absolute top-2 right-2 w-2 h-2 rounded-full",
          isPaid ? "bg-green-400" : isPartial ? "bg-amber-400" : "bg-red-400 animate-pulse"
        )}
      />

      <span className={cn(
        "text-xs font-bold",
        isPaid ? "text-green-600" : isPartial ? "text-amber-600" : "text-red-600"
      )}>
        #{boxNumber}
      </span>

      <div className={cn(
        "w-5 h-5 rounded-full flex items-center justify-center",
        isPaid ? "bg-green-700/40" : isPartial ? "bg-amber-700/40" : "bg-red-700/40"
      )}>
        <User className={cn(
          "w-3 h-3",
          isPaid ? "text-green-300" : isPartial ? "text-amber-300" : "text-red-300"
        )} />
      </div>

      <span className={cn(
        "text-[10px] font-medium leading-tight text-left w-full truncate",
        isPaid ? "text-green-200" : isPartial ? "text-amber-200" : "text-red-200"
      )}>
        {customer.name.split(" ")[0]}
      </span>
    </motion.button>
  );
}
