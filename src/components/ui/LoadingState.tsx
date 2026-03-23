"use client"

import * as React from "react"
import { motion } from "framer-motion"

export function LoadingState() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] gap-8 py-20 relative overflow-hidden">
      {/* Background Glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[400px] h-[400px] bg-primary/10 rounded-full blur-[100px] pointer-events-none" />
      
      <div className="relative">
        {/* Outer Ring */}
        <motion.div 
          animate={{ rotate: 360 }}
          transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
          className="w-24 h-24 border-2 border-white/5 border-t-primary/40 rounded-full relative z-10"
        />
        
        {/* Inner Spinning Glow */}
        <motion.div 
          animate={{ rotate: -360 }}
          transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
          className="absolute inset-2 border-4 border-transparent border-t-primary rounded-full z-10 shadow-[0_0_15px_rgba(255,15,15,0.4)]"
        />
        
        {/* Core Pulse */}
        <motion.div 
          animate={{ 
            scale: [0.8, 1.2, 0.8],
            opacity: [0.3, 0.7, 0.3]
          }}
          transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
          className="absolute inset-8 bg-primary rounded-full z-10 shadow-[0_0_20px_rgba(255,31,31,0.6)]"
        />
      </div>

      <div className="space-y-4 text-center relative z-10 max-w-sm px-6">
        <h2 className="text-2xl font-black text-white tracking-[0.3em] uppercase italic text-gradient animate-pulse-slow">
          Synchronizing
        </h2>
        <div className="h-1 w-24 bg-gradient-to-r from-transparent via-primary/50 to-transparent mx-auto" />
        <p className="text-foreground/40 text-xs font-bold uppercase tracking-widest leading-relaxed">
          Establishing connection to the <span className="text-primary/60">StudyFlow</span> neural network
        </p>
      </div>
      
      {/* Technical Scaffolding Effect */}
      <div className="absolute bottom-10 left-1/2 -translate-x-1/2 flex gap-4 opacity-20">
        {[1, 2, 3].map(i => (
          <motion.div 
            key={i}
            animate={{ height: [4, 12, 4] }}
            transition={{ duration: 1, repeat: Infinity, delay: i * 0.2 }}
            className="w-1 bg-primary rounded-full"
          />
        ))}
      </div>
    </div>
  )
}
