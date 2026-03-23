"use client"

import * as React from "react"
import { motion, AnimatePresence } from "framer-motion"
import { X, CheckCircle2, AlertCircle, Info } from "lucide-react"
import { Button } from "./button"

interface ModalProps {
  isOpen: boolean
  onClose: () => void
  title: string
  description: string
  type?: "success" | "error" | "info"
  actionText?: string
  onAction?: () => void
}

export function Modal({ 
  isOpen, 
  onClose, 
  title, 
  description, 
  type = "info",
  actionText,
  onAction
}: ModalProps) {
  // Close on Esc key
  React.useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose()
    }
    window.addEventListener("keydown", handleEsc)
    return () => window.removeEventListener("keydown", handleEsc)
  }, [onClose])

  const icons = {
    success: <CheckCircle2 className="w-12 h-12 text-emerald-400" />,
    error: <AlertCircle className="w-12 h-12 text-primary" />,
    info: <Info className="w-12 h-12 text-blue-400" />
  }

  const borderColors = {
    success: "border-emerald-500/20",
    error: "border-primary/20",
    info: "border-blue-500/20"
  }

  const bgGlows = {
    success: "bg-emerald-500/5",
    error: "bg-primary/5",
    info: "bg-blue-500/5"
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6">
          {/* Overlay */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
          />

          {/* Modal Content */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            transition={{ type: "spring", damping: 25, stiffness: 300 }}
            className={`relative w-full max-w-md glass border ${borderColors[type]} rounded-[2.5rem] overflow-hidden shadow-2xl ${bgGlows[type]}`}
          >
            {/* Close Button */}
            <button
              onClick={onClose}
              className="absolute top-6 right-6 p-2 rounded-full hover:bg-white/5 transition-colors text-white/40 hover:text-white"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="p-10 pt-12 flex flex-col items-center text-center">
              <div className="mb-6 p-4 rounded-3xl bg-white/5 border border-white/10">
                {icons[type]}
              </div>
              
              <h3 className="text-2xl font-black text-white tracking-tight mb-3">
                {title}
              </h3>
              
              <p className="text-foreground/40 text-lg leading-relaxed mb-10">
                {description}
              </p>

              <div className="flex w-full gap-3 mt-auto">
                {actionText && (
                  <Button
                    onClick={() => {
                      onAction?.()
                      onClose()
                    }}
                    className="flex-1 h-14 bg-white text-black hover:bg-white/90 font-black rounded-2xl active:scale-95 transition-transform"
                  >
                    {actionText}
                  </Button>
                )}
                <Button
                  variant="glass"
                  onClick={onClose}
                  className={`flex-1 h-14 border border-white/10 font-bold rounded-2xl transition-all active:scale-95 ${!actionText ? "w-full" : ""}`}
                >
                  {actionText ? "Cancel" : "Close"}
                </Button>
              </div>
            </div>

            {/* Bottom Accent Line */}
            <div className={`h-1.5 w-full bg-gradient-to-r ${
              type === 'success' ? 'from-emerald-500/0 via-emerald-500/50 to-emerald-500/0' :
              type === 'error' ? 'from-primary/0 via-primary/50 to-primary/0' :
              'from-blue-500/0 via-blue-500/50 to-blue-500/0'
            }`} />
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  )
}
