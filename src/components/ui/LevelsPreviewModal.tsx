"use client"

import * as React from "react"
import { motion, AnimatePresence } from "framer-motion"
import { X, Lock, Unlock, Star, Flame, Trophy } from "lucide-react"
import { LEVELS } from "@/lib/gamification"
import { useGamification } from "@/hooks/useGamification"

export function LevelsPreviewModal({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
  const { levelInfo, xp } = useGamification()
  
  // Close on escape
  React.useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose()
    }
    window.addEventListener("keydown", handleEsc)
    return () => window.removeEventListener("keydown", handleEsc)
  }, [onClose])

  // Prevent scroll when open
  React.useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = 'unset'
    }
    return () => { document.body.style.overflow = 'unset' }
  }, [isOpen])

  const scrollRef = React.useRef<HTMLDivElement>(null)

  // Auto-scroll to current level
  React.useEffect(() => {
    if (isOpen && scrollRef.current) {
      setTimeout(() => {
        const activeItem = scrollRef.current?.querySelector('.active-level')
        if (activeItem) {
          activeItem.scrollIntoView({ behavior: 'smooth', block: 'center' })
        }
      }, 300)
    }
  }, [isOpen])

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
          />
          <motion.div
  initial={{ opacity: 0, y: 40 }}
  animate={{ opacity: 1, y: 0 }}
  exit={{ opacity: 0, y: 40 }}
  transition={{ type: "spring", stiffness: 260, damping: 22 }}
  className="relative w-[95vw] sm:w-full sm:max-w-2xl max-h-[85vh] bg-[#0a0a0a]/95 backdrop-blur-xl border border-white/10 rounded-3xl shadow-[0_20px_80px_rgba(0,0,0,0.6)] flex flex-col overflow-hidden"
>
  {/* 🔥 Header (Sticky + Blur) */}
  <div className="sticky top-0 z-30 p-4 md:p-6 border-b border-white/5 bg-[#0a0a0a]/80 backdrop-blur-xl">
    <div className="absolute top-0 right-0 w-72 h-72 bg-primary/20 blur-[100px] rounded-full pointer-events-none -translate-y-1/2 translate-x-1/2" />

    <div className="flex items-center justify-between relative z-10">
      <div>
        <h2 className="text-2xl font-black text-white flex items-center gap-2">
          <Trophy className="w-6 h-6 text-primary drop-shadow" />
          Journey to Greatness
        </h2>

        <p className="text-sm text-foreground/60 mt-1">
          You have{" "}
          <span className="text-white font-bold tabular-nums">
            {xp.toLocaleString()}
          </span>{" "}
          XP
        </p>
      </div>

      <button
        onClick={onClose}
        className="p-2.5 rounded-full bg-white/5 hover:bg-white/10 text-white/60 hover:text-white transition-all active:scale-90"
      >
        <X className="w-5 h-5" />
      </button>
    </div>
  </div>

  {/* 🔥 Scroll Area */}
  <div
    ref={scrollRef}
    className="flex-1 overflow-y-auto px-4 sm:px-6 py-6 space-y-4 relative custom-scrollbar"
  >

    {LEVELS.map((level, i) => {
      const isUnlocked = xp >= level.minXP;
      const isCurrent = levelInfo.current.level === level.level;
      const isNext = levelInfo.next?.level === level.level;

      return (
        <motion.div
          key={level.level}
          initial={{ opacity: 0, x: -30 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: i * 0.04 }}
          className={`relative z-10 flex gap-4 p-4 rounded-2xl border transition-all duration-300 ${
            isCurrent
              ? "bg-gradient-to-r from-primary/25 to-primary/5 border-primary/40 shadow-[0_0_40px_rgba(255,31,31,0.25)]"
              : isUnlocked
              ? "bg-white/5 border-white/10 hover:bg-white/10"
              : "bg-black/40 border-white/5 opacity-40"
          }`}
        >
          {/* 🔥 Node */}
          <div className="relative mt-1 flex flex-col items-center shrink-0">
            <div
              className={`w-9 h-9 rounded-full flex items-center justify-center font-black text-sm z-10 shadow-lg ${
                isUnlocked
                  ? "text-white border border-white/20"
                  : "bg-black border border-white/10 text-white/30"
              }`}
              style={{ background: isUnlocked ? level.color : undefined }}
            >
              {level.level}
            </div>

            {/* Glow */}
            {isCurrent && (
              <div className="absolute w-12 h-12 rounded-full bg-primary/30 blur-xl animate-pulse" />
            )}
          </div>

          {/* 🔥 Content */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1 flex-wrap">
              <span
                className="text-lg font-black tracking-tight"
                style={{ color: isUnlocked ? level.color : "#a1a1aa" }}
              >
                {level.name}
              </span>

              {isCurrent && (
                <span className="px-2 py-0.5 rounded-full bg-primary text-white text-[10px] font-black uppercase tracking-widest animate-pulse">
                  Current
                </span>
              )}

              {isNext && (
                <span className="px-2 py-0.5 rounded-full bg-white/10 text-white/60 text-[10px] font-black uppercase tracking-widest">
                  Next
                </span>
              )}
            </div>

            <div className="flex items-center gap-3 text-xs font-bold text-foreground/50 tabular-nums">
              {isUnlocked ? (
                <Unlock className="w-3 h-3" />
              ) : (
                <Lock className="w-3 h-3" />
              )}
              {level.minXP.toLocaleString()} XP
            </div>

            {/* 🔥 Progress */}
            {isCurrent && levelInfo.next && (
              <div className="mt-4">
                <div className="flex justify-between text-[10px] font-bold text-foreground/50 mb-1 uppercase tracking-widest">
                  <span>Progress → {levelInfo.next.name}</span>
                  <span>{levelInfo.progressPercent}%</span>
                </div>

                <div className="h-2 bg-black/40 rounded-full overflow-hidden">
                  <motion.div
                    className="h-full rounded-full shadow-[0_0_10px_rgba(255,31,31,0.6)]"
                    style={{ background: levelInfo.current.color }}
                    initial={{ width: 0 }}
                    animate={{ width: `${levelInfo.progressPercent}%` }}
                    transition={{ duration: 1.2, ease: "easeOut" }}
                  />
                </div>
              </div>
            )}
          </div>
        </motion.div>
      );
    })}
  </div>

  {/* 🔥 Bottom Fade */}
  <div className="pointer-events-none absolute bottom-0 left-0 right-0 h-20 bg-gradient-to-t from-[#0a0a0a] to-transparent" />
</motion.div>
        </div>
      )}
    </AnimatePresence>
  )
}
