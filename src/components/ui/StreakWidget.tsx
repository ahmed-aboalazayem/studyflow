"use client"

import * as React from "react"
import { motion } from "framer-motion"
import { Flame } from "lucide-react"
import { useStreaks } from "@/hooks/useStreaks"

interface StreakWidgetProps {
  onClick?: () => void
}

export function StreakWidget({ onClick }: StreakWidgetProps = {}) {
  const { streak, isOnFire } = useStreaks()

  if (streak === 0) return null

  return (
    <motion.button
      onClick={onClick}
      whileHover={onClick ? { scale: 1.05 } : {}}
      whileTap={onClick ? { scale: 0.95 } : {}}
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      className={`flex items-center gap-2 px-4 py-2 rounded-2xl border backdrop-blur-sm transition-all group ${onClick ? 'cursor-pointer hover:shadow-xl' : ''} ${
        isOnFire
          ? "bg-orange-500/10 border-orange-500/30 hover:border-orange-500/50 shadow-[0_0_20px_rgba(249,115,22,0.2)]"
          : "bg-white/5 border-white/10 hover:border-white/20 hover:bg-white/10"
      }`}
    >
      <motion.div
        animate={isOnFire ? { scale: [1, 1.2, 1], rotate: [-5, 5, -5, 0] } : {}}
        transition={{ duration: 1.5, repeat: Infinity, repeatDelay: 1.5 }}
        className="transition-transform group-hover:scale-110"
      >
        <Flame
          className="w-5 h-5"
          style={{ color: streak >= 7 ? "#ef4444" : streak >= 3 ? "#f97316" : "#fb923c" }}
        />
      </motion.div>
      <div className="flex items-baseline gap-1">
        <span
          className="text-xl font-black tabular-nums"
          style={{ color: streak >= 7 ? "#ef4444" : streak >= 3 ? "#f97316" : "#fb923c" }}
        >
          {streak}
        </span>
        <span className="text-[10px] font-bold uppercase tracking-widest text-foreground/40">
          day{streak !== 1 ? "s" : ""}
        </span>
      </div>
      {isOnFire && (
        <span className="text-[10px] font-black uppercase tracking-widest text-orange-400/70 hidden md:inline-block">
          On Fire!
        </span>
      )}
      
      {onClick && (
        <div className="hidden md:flex ml-1 w-0 overflow-hidden group-hover:w-20 transition-all duration-300 opacity-0 group-hover:opacity-100 items-center justify-end">
          <span className="text-[9px] font-black uppercase tracking-widest text-white/50 whitespace-nowrap">View Journey</span>
        </div>
      )}
    </motion.button>
  )
}
