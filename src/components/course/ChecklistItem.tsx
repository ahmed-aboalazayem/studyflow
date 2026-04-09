"use client"

import * as React from "react"
import { motion } from "framer-motion"
import { Check, Clock } from "lucide-react"
import { playSound } from "@/lib/sounds"

export interface ChecklistItemData {
  id: string
  title: string
  duration: string
  completed: boolean
  isImportant?: boolean
  updatedAt?: string
  progress?: { completed: boolean }[]
}

interface ChecklistItemProps {
  item: ChecklistItemData
  onToggle: (id: string, completed: boolean) => void
  onToggleImportant: (id: string, isImportant: boolean) => void
  index: number
  onToggleXP?: (isCompleted: boolean) => void
}

export const ChecklistItem = React.memo(({ item, onToggle, onToggleImportant, index, onToggleXP }: ChecklistItemProps) => {
  const handleCheckToggle = React.useCallback(() => {
    const newCompletedState = !item.completed;
    if (newCompletedState) {
      playSound('taskComplete')
    } else {
      playSound('taskUndo')
    }
    onToggleXP?.(newCompletedState)
    onToggle(item.id, newCompletedState)
  }, [item.id, item.completed, onToggle, onToggleXP])

  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ type: "spring", stiffness: 100, damping: 15, delay: index * 0.05 }}
      className={`group relative flex items-center gap-3 p-3 sm:p-4 rounded-xl border transition-colors duration-300 will-change-transform ${
        item.isImportant 
          ? `important bg-yellow-500/20 border-yellow-500/50 shadow-[0_0_20px_rgba(234,179,8,0.2)] ${item.completed ? 'opacity-80' : ''}`
          : item.completed 
            ? "bg-emerald-500/5 border-emerald-500/20" 
            : "bg-white/5 border-white/10 hover:border-white/20"
      }`}
    >
      <button
        onClick={() => onToggleImportant(item.id, !item.isImportant)}
        className={`relative flex items-center justify-center shrink-0 p-1.5 rounded-full transition-all duration-150 ${
          item.isImportant 
            ? "text-yellow-400 drop-shadow-[0_0_10px_rgba(234,179,8,0.9)]" 
            : "text-foreground/30 hover:text-yellow-400/70 hover:bg-yellow-400/10"
        }`}
        title={item.isImportant ? "Unmark as important" : "Mark as important"}
      >
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill={item.isImportant ? "currentColor" : "none"} stroke="currentColor" strokeWidth={item.isImportant ? "0" : "2"} strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5">
           <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon>
        </svg>
      </button>
      <button
        onClick={handleCheckToggle}
        className={`relative flex h-6 w-6 shrink-0 items-center justify-center rounded-md border-2 transition-all will-change-transform ${
          item.completed
            ? "bg-emerald-500 border-emerald-500 text-white shadow-[0_0_10px_rgba(16,185,129,0.5)]"
            : "border-muted-foreground bg-transparent hover:border-primary focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 focus:ring-offset-background"
        }`}
      >
        <motion.div
          initial={false}
          animate={{ scale: item.completed ? 1 : 0, opacity: item.completed ? 1 : 0 }}
          transition={{ type: "spring", stiffness: 400, damping: 20 }}
          className="will-change-transform"
        >
          <Check className="h-4 w-4" strokeWidth={3} />
        </motion.div>
      </button>

      <div className="flex flex-1 items-center justify-between min-w-0 gap-4">
        <label
          className={`text-xs sm:text-sm transition-colors cursor-pointer select-none leading-tight ${
            item.isImportant
              ? `text-yellow-400 font-bold drop-shadow-[0_0_8px_rgba(234,179,8,0.5)] ${item.completed ? 'line-through opacity-80' : ''}`
              : item.completed 
                ? "text-foreground/50 font-medium line-through" 
                : "text-foreground font-medium group-hover:text-white"
          }`}
          onClick={handleCheckToggle}
        >
          {item.title}
        </label>
        
        {item.duration && (
          <div className="shrink-0 flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-white/5 text-xs text-foreground/60 font-mono">
            <Clock className="w-3 h-3" />
            {item.duration}
          </div>
        )}
      </div>

      {item.completed && (
        <motion.div
          className="absolute inset-0 rounded-xl bg-emerald-500/10 pointer-events-none will-change-opacity"
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 0, scale: 1.05 }}
          transition={{ duration: 0.4 }}
        />
      )}
    </motion.div>
  )
})
