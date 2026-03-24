"use client"

import * as React from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Timer, Play, Pause, RotateCcw, X, Coffee, Brain } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Modal } from "@/components/ui/Modal"

export function FocusMode() {
  const [isActive, setIsActive] = React.useState(false)
  const [timeLeft, setTimeLeft] = React.useState(25 * 60)
  const [mode, setMode] = React.useState<'work' | 'break'>('work')
  const [panelOpen, setPanelOpen] = React.useState(false)
  const [modal, setModal] = React.useState<{ isOpen: boolean; title: string; description: string; type: "success" | "info" }>({
    isOpen: false,
    title: "",
    description: "",
    type: "info"
  })

  React.useEffect(() => {
    let interval: NodeJS.Timeout
    if (isActive && timeLeft > 0) {
      interval = setInterval(() => {
        setTimeLeft(prev => prev - 1)
      }, 1000)
    } else if (timeLeft === 0) {
      const nextMode = mode === 'work' ? 'break' : 'work'
      setMode(nextMode)
      setTimeLeft(nextMode === 'work' ? 25 * 60 : 5 * 60)
      setIsActive(false)
      
      setModal({
        isOpen: true,
        title: mode === 'work' ? "Focus Session Complete!" : "Break Over!",
        description: mode === 'work' ? "Time for a well-deserved break. Grab some water! ☕" : "Ready to dive back into deep work? Let's go! 🧠",
        type: mode === 'work' ? "success" : "info"
      })
    }
    return () => clearInterval(interval)
  }, [isActive, timeLeft, mode])

  const toggleTimer = () => setIsActive(!isActive)
  const resetTimer = () => {
    setIsActive(false)
    setTimeLeft(mode === 'work' ? 25 * 60 : 5 * 60)
  }

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }

  return (
    <>
      <Button
        onClick={() => setPanelOpen(true)}
        variant="glass"
        className={`fixed bottom-6 right-6 md:bottom-8 md:right-8 h-18 rounded-full shadow-[0_0_20px_rgba(255,31,31,0.2)] border-primary/40 group z-50 overflow-hidden transition-all duration-500 ease-out bg-black/60 backdrop-blur-3xl hover:border-primary/80 hover:shadow-[0_0_40px_rgba(255,31,31,0.5)] ${
          isActive 
           ? 'w-36 px-5 flex items-center justify-between' 
           : 'w-16 p-0 flex items-center justify-center'
        }`}
      >
        {isActive ? (
          <>
            <div>
              {mode === 'work' ? 
                <Brain className="w-6 h-6 text-primary animate-pulse" /> : 
                <Coffee className="w-6 h-6 text-emerald-500 animate-pulse" />
              }
            </div>
            <span className="text-xl font-black tabular-nums tracking-tighter text-white">
              {formatTime(timeLeft)}
            </span>
          </>
        ) : (
          <Brain className="w-8 h-8 text-primary group-hover:scale-110 transition-transform duration-300" />
        )}
      </Button>

      <AnimatePresence>
        {panelOpen && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            className="fixed bottom-28 right-8 w-80 bg-black/80 backdrop-blur-3xl border border-white/10 rounded-3xl p-6 shadow-2xl z-50 glass"
          >
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-2">
                <div className={`p-2 rounded-lg ${mode === 'work' ? 'bg-primary/20 text-primary' : 'bg-emerald-500/20 text-emerald-500'}`}>
                   {mode === 'work' ? <Brain className="w-4 h-4" /> : <Coffee className="w-4 h-4" />}
                </div>
                <span className="font-bold text-white uppercase tracking-wider text-sm">
                  {mode === 'work' ? 'Focus Session' : 'Short Break'}
                </span>
              </div>
              <button onClick={() => setPanelOpen(false)} className="text-white/40 hover:text-white transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="text-center mb-8">
              <div className="text-6xl font-black text-white tabular-nums tracking-tighter mb-2">
                {formatTime(timeLeft)}
              </div>
              <div className="w-full h-1 bg-white/5 rounded-full overflow-hidden">
                <motion.div 
                  className={`h-full ${mode === 'work' ? 'bg-primary' : 'bg-emerald-500'}`}
                  initial={{ width: "100%" }}
                  animate={{ width: `${(timeLeft / (mode === 'work' ? 25 * 60 : 5 * 60)) * 100}%` }}
                />
              </div>
            </div>

            <div className="flex gap-3">
              <Button 
                onClick={toggleTimer} 
                className={`flex-1 h-12 font-bold ${isActive ? 'bg-white/10 hover:bg-white/20' : 'bg-primary hover:bg-primary/80'}`}
              >
                {isActive ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5 ml-1" />}
                {isActive ? 'Pause' : 'Start'}
              </Button>
              <Button 
                variant="glass" 
                onClick={resetTimer}
                className="w-12 h-12 p-0 border-white/10 hover:border-white/20"
              >
                <RotateCcw className="w-5 h-5" />
              </Button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <Modal 
        isOpen={modal.isOpen}
        onClose={() => setModal(prev => ({ ...prev, isOpen: false }))}
        title={modal.title}
        description={modal.description}
        type={modal.type}
        actionText={modal.type === 'success' ? "Start Break" : "Start Focus"}
        onAction={() => {
          setIsActive(true)
        }}
      />
    </>
  )
}
