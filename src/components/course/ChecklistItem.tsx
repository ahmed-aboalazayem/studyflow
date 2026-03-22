"use client"

import * as React from "react"
import { motion } from "framer-motion"
import { Check, Clock } from "lucide-react"

export interface ChecklistItemData {
  id: string
  title: string
  duration: string
  completed: boolean
}

interface ChecklistItemProps {
  item: ChecklistItemData
  onToggle: (id: string, completed: boolean) => void
  index: number
}

export function ChecklistItem({ item, onToggle, index }: ChecklistItemProps) {
  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.3, delay: index * 0.05 }}
      whileHover={{ scale: 1.01 }}
      className={`group relative flex items-center gap-4 p-4 rounded-xl border transition-all ${
        item.completed 
          ? "bg-emerald-500/5 border-emerald-500/20" 
          : "bg-white/5 border-white/10 hover:border-white/20"
      }`}
    >
      <button
        onClick={() => onToggle(item.id, !item.completed)}
        className={`relative flex h-6 w-6 shrink-0 items-center justify-center rounded-md border-2 transition-all ${
          item.completed
            ? "bg-emerald-500 border-emerald-500 text-white shadow-[0_0_10px_rgba(16,185,129,0.5)]"
            : "border-muted-foreground bg-transparent hover:border-primary focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 focus:ring-offset-background"
        }`}
      >
        <motion.div
          initial={false}
          animate={{ scale: item.completed ? 1 : 0, opacity: item.completed ? 1 : 0 }}
          transition={{ type: "spring", stiffness: 400, damping: 20 }}
        >
          <Check className="h-4 w-4" strokeWidth={3} />
        </motion.div>
      </button>

      <div className="flex flex-1 items-center justify-between min-w-0 gap-4">
        <label
          className={`text-sm font-medium transition-colors truncate cursor-pointer select-none ${
            item.completed ? "text-foreground/50 line-through" : "text-foreground group-hover:text-white"
          }`}
          onClick={() => onToggle(item.id, !item.completed)}
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
          className="absolute inset-0 rounded-xl bg-emerald-500/10 pointer-events-none"
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 0, scale: 1.05 }}
          transition={{ duration: 0.4 }}
        />
      )}
    </motion.div>
  )
}
