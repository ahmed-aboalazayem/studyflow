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
  children?: React.ReactNode
}

export function Modal({
  isOpen,
  onClose,
  title,
  description,
  type = "info",
  actionText,
  onAction,
  children,
}: ModalProps) {
  React.useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose()
    }
    window.addEventListener("keydown", handleEsc)
    return () => window.removeEventListener("keydown", handleEsc)
  }, [onClose])

  const icons = {
    success: <CheckCircle2 className="w-12 h-12 text-emerald-500" />,
    error: <AlertCircle className="w-12 h-12 text-red-500" />,
    info: <Info className="w-12 h-12 text-blue-500" />,
  }

  const accent = {
    success: "border-emerald-500",
    error: "border-red-500",
    info: "border-blue-500",
  }

  const accentBg = {
    success: "bg-emerald-50",
    error: "bg-red-50",
    info: "bg-blue-50",
  }

  const accentButton = {
    success: "bg-emerald-600 hover:bg-emerald-700",
    error: "bg-red-600 hover:bg-red-700",
    info: "bg-blue-600 hover:bg-blue-700",
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          {/* Overlay */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-black/70"
          />

          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.92, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.92, y: 20 }}
            transition={{ type: "spring", stiffness: 260, damping: 22 }}
            className={`relative w-full max-w-md bg-black/90 backdrop-blur-2xl rounded-2xl shadow-2xl border border-white/10 overflow-hidden`}
          >
            {/* Header Accent */}
            <div className={`h-1.5 w-full ${type === 'success' ? 'bg-emerald-500' : type === 'error' ? 'bg-primary' : 'bg-primary/50'}`} />

            {/* Close Button */}
            <button
              onClick={onClose}
              className="absolute top-4 right-4 p-2 rounded-lg hover:bg-white/5 transition"
            >
              <X className="w-5 h-5 text-white/40" />
            </button>

            <div className="p-8 text-center">
              {/* Icon */}
              {type !== 'info' && (
                <div
                  className={`mx-auto mb-5 w-16 h-16 flex items-center justify-center rounded-full ${type === 'success' ? 'bg-emerald-500/10' : 'bg-primary/10'}`}
                >
                  {icons[type]}
                </div>
              )}

              {/* Title */}
              <h3 className="text-xl font-bold text-white mb-2">
                {title}
              </h3>

              {/* Description */}
              <p className="text-white/40 text-sm leading-relaxed mb-6">
                {description}
              </p>

              {/* Children (e.g. Forms) */}
              {children && (
                <div className="text-left mb-6">
                  {children}
                </div>
              )}

              {/* Buttons (only if actionText is present, or if no children) */}
              {!children && (
                <div className="flex gap-3">
                  {actionText && (
                    <Button
                      onClick={() => {
                        onAction?.()
                        onClose()
                      }}
                      className={`flex-1 text-white font-semibold rounded-lg h-11 transition bg-primary hover:bg-primary/80`}
                    >
                      {actionText}
                    </Button>
                  )}

                  <Button
                    onClick={onClose}
                    variant="ghost"
                    className={`flex-1 text-white/40 h-11 rounded-lg font-medium hover:bg-white/5 ${
                      !actionText ? "w-full" : ""
                    }`}
                  >
                    {actionText ? "Cancel" : "Close"}
                  </Button>
                </div>
              )}
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  )
}