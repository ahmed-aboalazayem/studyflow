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
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ type: "spring", stiffness: 300, damping: 25 }}
            className="relative w-full max-w-2xl max-h-[85vh] bg-[#0a0a0a] border border-white/10 rounded-3xl shadow-2xl flex flex-col overflow-hidden"
          >
            {/* Header */}
            <div className="p-6 border-b border-white/5 bg-white/5 relative overflow-hidden">
              <div className="absolute top-0 right-0 w-64 h-64 bg-primary/20 blur-[80px] rounded-full pointer-events-none -translate-y-1/2 translate-x-1/2" />
              <div className="flex items-center justify-between relative z-10">
                <div className="flex flex-col">
                  <h2 className="text-2xl font-black text-white flex items-center gap-2">
                    <Trophy className="w-6 h-6 text-primary" />
                    Journey to Greatness
                  </h2>
                  <p className="text-sm font-medium text-foreground/50">
                    You have <span className="text-white font-bold tabular-nums">{xp.toLocaleString()}</span> XP. Keep studying to unlock more!
                  </p>
                </div>
                <button
                  onClick={onClose}
                  className="p-2 rounded-full hover:bg-white/10 text-foreground/50 hover:text-white transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* List */}
            <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-3 custom-scrollbar relative">
              <div className="absolute top-0 bottom-0 left-8 w-px bg-white/10" />
              {LEVELS.map((level, i) => {
                const isUnlocked = xp >= level.minXP
                const isCurrent = levelInfo.current.level === level.level
                const isNext = levelInfo.next?.level === level.level
                
                return (
                  <motion.div
                    key={level.level}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.05 }}
                    className={`relative z-10 flex gap-4 p-4 rounded-2xl border transition-all ${
                      isCurrent ? 'active-level py-6' : ''
                    } ${
                      isUnlocked
                        ? isCurrent
                          ? 'bg-gradient-to-r from-primary/20 to-primary/5 border-primary/40 shadow-[0_0_30px_rgba(255,31,31,0.2)]'
                          : 'bg-white/5 border-white/10'
                        : 'bg-black/40 border-white/5 opacity-50'
                    }`}
                  >
                    {/* Journey Node */}
                    <div className="relative mt-2 flex flex-col items-center shrink-0">
                      <div 
                        className={`w-8 h-8 rounded-full flex items-center justify-center font-black text-sm z-10 shadow-xl ${
                          isUnlocked 
                            ? 'text-white border border-white/20' 
                            : 'bg-black border border-white/10 text-white/30'
                        }`}
                        style={{ background: isUnlocked ? level.color : undefined }}
                      >
                       {level.level}
                      </div>
                    </div>

                    <div className="flex-1 min-w-0 flex flex-col justify-center">
                      <div className="flex items-center gap-2 mb-1">
                        <span 
                          className="text-lg font-black tracking-tight"
                          style={{ color: isUnlocked ? level.color : '#a1a1aa' }}
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
                            Next Target
                          </span>
                        )}
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="flex items-center gap-1.5 text-xs font-bold text-foreground/50 tabular-nums">
                           {isUnlocked ? <Unlock className="w-3 h-3" /> : <Lock className="w-3 h-3" />}
                           {level.minXP.toLocaleString()} XP
                        </span>
                      </div>
                      
                      {isCurrent && levelInfo.next && (
                        <div className="mt-4 w-full max-w-sm">
                          <div className="flex justify-between text-[10px] font-bold text-foreground/50 mb-1.5 uppercase tracking-widest">
                            <span>Progress to {levelInfo.next.name}</span>
                            <span>{levelInfo.progressPercent}%</span>
                          </div>
                          <div className="h-1.5 bg-black/40 rounded-full overflow-hidden">
                            <motion.div 
                              className="h-full rounded-full"
                              style={{ background: levelInfo.current.color }}
                              initial={{ width: 0 }}
                              animate={{ width: `${levelInfo.progressPercent}%` }}
                              transition={{ duration: 1, ease: "easeOut" }}
                            />
                          </div>
                        </div>
                      )}
                    </div>
                  </motion.div>
                )
              })}
            </div>
            
            {/* Gradient Bottom cover for nice fade */}
            <div className="h-16 bg-gradient-to-t from-[#0a0a0a] to-transparent shrink-0 pointer-events-none mt-[-4rem] z-20 relative" />
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  )
}
