"use client"

import * as React from "react"
import { motion, AnimatePresence } from "framer-motion"
import { X, Flame, Calendar, Trophy, Zap, ChevronRight } from "lucide-react"
import { useStreaks } from "@/hooks/useStreaks"
import { useActivityLog } from "@/hooks/useActivityLog"

interface StreakModalProps {
  isOpen: boolean
  onClose: () => void
}

export function StreakModal({ isOpen, onClose }: StreakModalProps) {
  const { streak, isOnFire } = useStreaks()
  const { activityMap } = useActivityLog()

  // Close on escape
  React.useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose()
    }
    window.addEventListener("keydown", handleEsc)
    return () => window.removeEventListener("keydown", handleEsc)
  }, [onClose])

  // Get last 7 days activity
  const weeklyStatus = React.useMemo(() => {
    const days = []
    const today = new Date()
    for (let i = 6; i >= 0; i--) {
      const d = new Date(today)
      d.setDate(d.getDate() - i)
      const iso = d.toISOString().split("T")[0]
      days.push({
        date: iso,
        label: d.toLocaleDateString('en-US', { weekday: 'short' })[0],
        active: (activityMap[iso] || 0) > 0,
        isToday: i === 0
      })
    }
    return days
  }, [activityMap])

  const milestones = [
    { days: 3, label: "Hustler", icon: <Zap className="w-4 h-4" /> },
    { days: 7, label: "Dedicated", icon: <Trophy className="w-4 h-4" /> },
    { days: 14, label: "Legend", icon: <Flame className="w-4 h-4" /> },
    { days: 30, label: "Scholar", icon: <Trophy className="w-4 h-4" /> },
  ]

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-black/80 backdrop-blur-md"
          />
          
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 30 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 30 }}
            transition={{ type: "spring", damping: 25, stiffness: 300 }}
            className="relative w-[95vw] sm:w-full sm:max-w-lg bg-[#0d0d0d] border border-orange-500/20 rounded-[2.5rem] shadow-[0_0_50px_rgba(249,115,22,0.15)] overflow-hidden flex flex-col"
          >
            {/* Header / Background Glow */}
            <div className="absolute top-0 inset-x-0 h-64 bg-gradient-to-b from-orange-500/10 to-transparent pointer-events-none" />
            
            <div className="p-6 md:p-8 pb-4 flex justify-between items-start relative z-10">
              <div className="flex flex-col">
                <h2 className="text-2xl md:text-3xl font-black text-white tracking-tighter flex items-center gap-2">
                  <Flame className="w-6 h-6 md:w-8 md:h-8 text-orange-500" />
                  Your Journey
                </h2>
                <p className="text-orange-500/60 font-medium text-sm">Keep the flame alive!</p>
              </div>
              <button
                onClick={onClose}
                className="p-2.5 rounded-2xl bg-white/5 border border-white/10 text-white/40 hover:text-white transition-all hover:bg-white/10 active:scale-90"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 md:p-8 pt-0 flex flex-col gap-8 relative z-10 overflow-y-auto max-h-[70vh] custom-scrollbar">
              
              {/* Massive Hero Section */}
              <div className="flex flex-col items-center py-6 relative">
                <motion.div
                  initial={{ scale: 0.8, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ delay: 0.2, type: "spring" }}
                  className="relative"
                >
                  <motion.div
                    animate={isOnFire ? { scale: [1, 1.1, 1], rotate: [-2, 2, -2] } : {}}
                    transition={{ duration: 2, repeat: Infinity }}
                    className="relative z-10"
                  >
                    <Flame className="w-24 h-24 md:w-32 md:h-32 text-orange-500 drop-shadow-[0_0_30px_rgba(249,115,22,0.5)]" />
                  </motion.div>
                  {/* Subtle rings */}
                  <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                    <div className="w-40 h-40 rounded-full border border-orange-500/20 animate-ping opacity-20" />
                  </div>
                </motion.div>
                
                <div className="mt-4 text-center">
                  <motion.span 
                    initial={{ y: 20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ delay: 0.3 }}
                    className="text-6xl md:text-7xl font-black text-white tabular-nums drop-shadow-2xl"
                  >
                    {streak}
                  </motion.span>
                  <div className="text-sm font-black uppercase tracking-[0.3em] text-orange-500/50 mt-[-5px]">
                    Day Streak
                  </div>
                </div>
              </div>

              {/* Weekly View */}
              <div className="p-6 rounded-[2rem] bg-white/5 border border-white/10 backdrop-blur-xl">
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center gap-2">
                    <Calendar className="w-4 h-4 text-white/40" />
                    <span className="text-xs font-black uppercase tracking-widest text-white/60">Weekly Consistency</span>
                  </div>
                  {streak > 0 && (
                    <span className="text-[10px] font-bold text-orange-500 py-1 px-3 rounded-full bg-orange-500/10 border border-orange-500/20 uppercase">
                      Level {Math.floor(streak / 7) + 1} Habit
                    </span>
                  )}
                </div>
                
                <div className="flex justify-between items-center px-1">
                  {weeklyStatus.map((day, i) => (
                    <div key={day.date} className="flex flex-col items-center gap-2 md:gap-3">
                      <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={{ delay: 0.4 + i * 0.05 }}
                        className={`w-8 h-8 md:w-10 md:h-10 rounded-xl md:rounded-2xl flex items-center justify-center transition-all duration-500 border-2 ${
                          day.active 
                            ? "bg-orange-500 border-orange-400 shadow-[0_0_15px_rgba(249,115,22,0.4)] text-white" 
                            : "bg-white/5 border-white/10 text-white/20"
                        } ${day.isToday ? "ring-2 ring-white/20 ring-offset-2 ring-offset-[#0d0d0d]" : ""}`}
                      >
                        {day.active ? <Zap className="w-4 h-4 md:w-5 md:h-5 fill-white" /> : <div className="w-1.5 h-1.5 rounded-full bg-white/10" />}
                      </motion.div>
                      <span className={`text-[10px] font-black uppercase tracking-tighter ${day.isToday ? "text-orange-500" : "text-white/30"}`}>
                        {day.label}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Milestones */}
              <div className="space-y-4">
                <div className="flex items-center gap-2">
                  <Trophy className="w-4 h-4 text-white/40" />
                  <span className="text-xs font-black uppercase tracking-widest text-white/60">Streak Milestones</span>
                </div>
                
                <div className="grid grid-cols-1 gap-2">
                  {milestones.map((m, i) => {
                    const isCompleted = streak >= m.days
                    const isNext = !isCompleted && (i === 0 || streak >= milestones[i-1].days)
                    
                    return (
                      <div 
                        key={m.days} 
                        className={`group p-4 rounded-2xl border transition-all flex items-center justify-between ${
                          isCompleted 
                            ? "bg-orange-500/10 border-orange-500/20" 
                            : isNext 
                            ? "bg-white/5 border-white/10 ring-1 ring-orange-500/30"
                            : "bg-black/20 border-white/5 opacity-40"
                        }`}
                      >
                        <div className="flex items-center gap-4">
                          <div className={`w-10 h-10 rounded-xl flex items-center justify-center transition-colors ${
                            isCompleted ? "bg-orange-500 text-white" : "bg-white/5 text-white/20"
                          }`}>
                            {m.icon}
                          </div>
                          <div className="flex flex-col">
                            <span className={`font-black text-sm ${isCompleted ? "text-white" : "text-white/40"}`}>{m.label}</span>
                            <span className="text-[10px] font-bold text-white/20 uppercase tracking-widest">{m.days} Day Streak</span>
                          </div>
                        </div>
                        {isCompleted ? (
                          <div className="w-6 h-6 rounded-full bg-orange-500/20 flex items-center justify-center">
                            <div className="w-2 h-2 rounded-full bg-orange-500" />
                          </div>
                        ) : isNext ? (
                          <span className="text-[10px] font-black text-orange-500 uppercase tracking-widest">In Progress</span>
                        ) : null}
                      </div>
                    )
                  })}
                </div>
              </div>
            </div>

            {/* Bottom Footer Action */}
            <div className="p-6 md:p-8 pt-4 border-t border-white/5 bg-white/5 mt-auto">
              <button 
                onClick={onClose}
                className="w-full h-12 md:h-14 bg-gradient-to-r from-orange-500 to-red-600 hover:from-orange-400 hover:to-red-500 text-white font-black rounded-2xl shadow-[0_10px_30px_rgba(249,115,22,0.3)] active:scale-95 transition-all flex items-center justify-center gap-2 group"
              >
                Keep Going
                <ChevronRight className="w-5 h-5 transition-transform group-hover:translate-x-1" />
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  )
}
