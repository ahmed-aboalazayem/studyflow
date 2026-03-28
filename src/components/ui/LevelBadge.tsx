"use client"

import * as React from "react"
import { motion } from "framer-motion"
import { Zap, ChevronUp } from "lucide-react"
import { useGamification } from "@/hooks/useGamification"

export function LevelBadge() {
  const { xp, levelInfo } = useGamification()
  const { current, next, progressPercent } = levelInfo

  return (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex items-center gap-3 px-4 py-2.5 rounded-2xl border backdrop-blur-sm"
      style={{
        background: `linear-gradient(135deg, ${current.color}15, ${current.color}08)`,
        borderColor: `${current.color}40`,
        boxShadow: `0 0 20px ${current.glow}`
      }}
    >
      {/* Level icon */}
      <div
        className="w-9 h-9 rounded-xl flex items-center justify-center font-black text-sm shrink-0"
        style={{ background: `${current.color}25`, color: current.color }}
      >
        {current.level}
      </div>

      <div className="min-w-0">
        <div className="flex items-center gap-1.5 mb-0.5">
          <span className="text-xs font-black uppercase tracking-widest" style={{ color: current.color }}>
            {current.name}
          </span>
          {next && (
            <ChevronUp className="w-3 h-3 text-foreground/30" />
          )}
        </div>
        {/* XP bar */}
        <div className="w-24 h-1.5 bg-white/10 rounded-full overflow-hidden">
          <motion.div
            className="h-full rounded-full"
            style={{ background: current.color }}
            initial={{ width: 0 }}
            animate={{ width: `${progressPercent}%` }}
            transition={{ duration: 0.8, ease: "easeOut" }}
          />
        </div>
      </div>

      <div className="flex items-center gap-1 text-foreground/50 shrink-0">
        <Zap className="w-3.5 h-3.5" style={{ color: current.color }} />
        <span className="text-xs font-bold tabular-nums">{xp.toLocaleString()}</span>
      </div>
    </motion.div>
  )
}
