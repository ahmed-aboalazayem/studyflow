"use client"

import * as React from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Zap, TrendingUp } from "lucide-react"

interface XPToastProps {
  xpGain: number
  leveledUp?: boolean
  newLevelName?: string
  color?: string
  onDone: () => void
}

export function XPToast({ xpGain, leveledUp, newLevelName, color = "#ef4444", onDone }: XPToastProps) {
  React.useEffect(() => {
    const timer = setTimeout(onDone, leveledUp ? 3500 : 2000)
    return () => clearTimeout(timer)
  }, [onDone, leveledUp])

  return (
    <motion.div
      initial={{ opacity: 0, y: 60, scale: 0.8 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: -20, scale: 0.9 }}
      transition={{ type: "spring", stiffness: 300, damping: 25 }}
      className="fixed bottom-28 left-1/2 z-[9999] pointer-events-none"
      style={{ x: "-50%" }}
    >
      {leveledUp ? (
        <div
          className="flex items-center gap-3 px-6 py-4 rounded-2xl border backdrop-blur-xl shadow-2xl"
          style={{
            background: `linear-gradient(135deg, ${color}22, ${color}11)`,
            borderColor: `${color}60`,
            boxShadow: `0 0 40px ${color}40, 0 8px 32px rgba(0,0,0,0.4)`
          }}
        >
          <TrendingUp className="w-7 h-7" style={{ color }} />
          <div>
            <p className="text-white font-black text-base tracking-tight">Level Up! 🎉</p>
            <p className="font-bold text-sm" style={{ color }}>{newLevelName}</p>
          </div>
        </div>
      ) : (
        <div
          className="flex items-center gap-2.5 px-5 py-3 rounded-2xl border backdrop-blur-xl shadow-xl"
          style={{
            background: "rgba(10,10,10,0.85)",
            borderColor: `${color}50`,
            boxShadow: `0 0 20px ${color}30`
          }}
        >
          <Zap className="w-5 h-5" style={{ color }} />
          <span className="text-white font-black text-sm tracking-tight">
            +{xpGain} XP
          </span>
        </div>
      )}
    </motion.div>
  )
}

interface XPToastEntry {
  id: string
  xpGain: number
  leveledUp?: boolean
  newLevelName?: string
  color?: string
}

export function useXPToastQueue() {
  const [toasts, setToasts] = React.useState<XPToastEntry[]>([])

  const enqueue = React.useCallback((entry: Omit<XPToastEntry, "id">) => {
    const id = Math.random().toString(36).slice(2)
    setToasts(prev => [...prev.slice(-1), { ...entry, id }]) // max 2 at a time
  }, [])

  const dismiss = React.useCallback((id: string) => {
    setToasts(prev => prev.filter(t => t.id !== id))
  }, [])

  const ToastContainer = React.useMemo(() => (
    <AnimatePresence>
      {toasts.map(t => (
        <XPToast
          key={t.id}
          xpGain={t.xpGain}
          leveledUp={t.leveledUp}
          newLevelName={t.newLevelName}
          color={t.color}
          onDone={() => dismiss(t.id)}
        />
      ))}
    </AnimatePresence>
  ), [toasts, dismiss])

  return { enqueue, ToastContainer }
}
