"use client"

import * as React from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Play, Pause, RotateCcw, X, Coffee, Brain, Volume2, VolumeX } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Modal } from "@/components/ui/Modal"
import { playSound } from "@/lib/sounds"
import { useGamification } from "@/hooks/useGamification"
import { useXPToastQueue } from "@/components/ui/XPToast"

type Soundscape = null | 'rain' | 'lofi' | 'space'

const SOUNDSCAPES: { id: Soundscape; label: string; emoji: string; color: string; url: string }[] = [
  {
    id: 'rain',
    label: 'Rain',
    emoji: '🌧️',
    color: '#38bdf8',
    url: 'https://assets.mixkit.co/active_storage/sfx/2515/2515-preview.mp3'
  },
  {
    id: 'lofi',
    label: 'Lo-Fi',
    emoji: '☕',
    color: '#f59e0b',
    url: 'https://assets.mixkit.co/active_storage/sfx/209/209-preview.mp3'
  },
  {
    id: 'space',
    label: 'Space',
    emoji: '🌌',
    color: '#818cf8',
    url: 'https://assets.mixkit.co/active_storage/sfx/2618/2618-preview.mp3'
  },
]

export function FocusMode() {
  const [isActive, setIsActive] = React.useState(false)
  const [timeLeft, setTimeLeft] = React.useState(25 * 60)
  const [mode, setMode] = React.useState<'work' | 'break'>('work')
  const [panelOpen, setPanelOpen] = React.useState(false)
  const [sessionsCompleted, setSessionsCompleted] = React.useState(0)
  const [sessionTarget] = React.useState(4)
  const [soundscape, setSoundscape] = React.useState<Soundscape>(null)
  const ambientRef = React.useRef<HTMLAudioElement | null>(null)
  const [modal, setModal] = React.useState<{ isOpen: boolean; title: string; description: string; type: "success" | "info" }>({
    isOpen: false,
    title: "",
    description: "",
    type: "info"
  })

  const { addXP, levelInfo, XP_PER_FOCUS_SESSION } = useGamification()
  const { enqueue, ToastContainer } = useXPToastQueue()

  // Ambient soundscape management
  React.useEffect(() => {
    if (ambientRef.current) {
      ambientRef.current.pause()
      ambientRef.current = null
    }
    if (soundscape && panelOpen) {
      const url = SOUNDSCAPES.find(s => s.id === soundscape)?.url
      if (url) {
        const audio = new Audio(url)
        audio.loop = true
        audio.volume = 0.2
        audio.play().catch(() => {})
        ambientRef.current = audio
      }
    }
    return () => {
      ambientRef.current?.pause()
    }
  }, [soundscape, panelOpen])

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

      if (mode === 'work') {
        setSessionsCompleted(prev => prev + 1)
        playSound('focusSuccess')
        // Award XP for completing a focus session
        const result = addXP(XP_PER_FOCUS_SESSION)
        enqueue({
          xpGain: XP_PER_FOCUS_SESSION,
          leveledUp: result.leveledUp,
          newLevelName: result.newLevelName,
          color: levelInfo.current.color
        })
      } else {
        playSound('breakEnd')
      }

      setModal({
        isOpen: true,
        title: mode === 'work' ? "Focus Session Complete!" : "Break Over!",
        description: mode === 'work'
          ? `Amazing job! That's session ${sessionsCompleted + 1} done. Time for a well-deserved break! ☕`
          : "Break's over. Ready to dive back into deep work? Let's go! 🧠",
        type: mode === 'work' ? "success" : "info"
      })
    }
    return () => clearInterval(interval)
  }, [isActive, timeLeft, mode])

  const toggleTimer = () => {
    if (!isActive) {
      if (mode === 'work') playSound('focusStart')
      else playSound('breakStart')
    }
    setIsActive(!isActive)
  }

  const resetTimer = () => {
    setIsActive(false)
    setTimeLeft(mode === 'work' ? 25 * 60 : 5 * 60)
  }

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }

  const activeSoundscape = SOUNDSCAPES.find(s => s.id === soundscape)

  return (
    <>
      {ToastContainer}

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
          <Brain className="w-8 h-8 text-primary group-hover:scale-110 transition-transform duration-150" />
        )}
      </Button>

      <AnimatePresence>
        {panelOpen && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            className="fixed bottom-28 right-8 w-80 bg-black/80 backdrop-blur-3xl border border-white/10 rounded-3xl p-6 shadow-2xl z-50 glass"
            style={activeSoundscape ? {
              borderColor: `${activeSoundscape.color}30`,
              boxShadow: `0 0 40px ${activeSoundscape.color}15, 0 8px 32px rgba(0,0,0,0.4)`
            } : undefined}
          >
            {/* Header */}
            <div className="flex items-center justify-between mb-5">
              <div className="flex items-center gap-2">
                <div className={`p-2 rounded-lg ${mode === 'work' ? 'bg-primary/20 text-primary' : 'bg-emerald-500/20 text-emerald-500'}`}>
                  {mode === 'work' ? <Brain className="w-4 h-4" /> : <Coffee className="w-4 h-4" />}
                </div>
                <span className="font-bold text-white uppercase tracking-wider text-sm">
                  {mode === 'work' ? 'Focus Session' : 'Short Break'}
                </span>
              </div>
              <div className="flex gap-1.5 px-3 py-1 rounded-full bg-white/5 border border-white/10">
                <span className="text-[10px] font-black uppercase text-foreground/40 tracking-widest leading-none mt-0.5">Session</span>
                <span className="text-xs font-bold text-primary leading-none">{sessionsCompleted}</span>
                <span className="text-[10px] font-black uppercase text-foreground/20 leading-none">/</span>
                <span className="text-xs font-bold text-foreground/40 leading-none">{sessionTarget}</span>
              </div>
              <button onClick={() => setPanelOpen(false)} className="text-white/40 hover:text-white transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Timer */}
            <div className="text-center mb-6">
              <div className="text-6xl font-black text-white tabular-nums tracking-tighter mb-3">
                {formatTime(timeLeft)}
              </div>
              <div className="w-full h-1.5 bg-white/5 rounded-full overflow-hidden mb-5">
                <motion.div
                  className={`h-full ${mode === 'work' ? 'bg-primary shadow-[0_0_10px_rgba(255,31,31,0.5)]' : 'bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.5)]'}`}
                  initial={{ width: "100%" }}
                  animate={{ width: `${(timeLeft / (mode === 'work' ? 25 * 60 : 5 * 60)) * 100}%` }}
                  transition={{ duration: 1, ease: "linear" }}
                />
              </div>

              {/* Session Progress Dots */}
              <div className="flex justify-center gap-2">
                {Array.from({ length: sessionTarget }).map((_, i) => (
                  <div
                    key={i}
                    className={`h-1.5 rounded-full transition-all duration-500 ${
                      i < sessionsCompleted
                        ? 'w-6 bg-primary shadow-[0_0_8px_rgba(255,31,31,0.4)]'
                        : 'w-1.5 bg-white/10'
                    }`}
                  />
                ))}
              </div>
            </div>

            {/* Soundscape Selector */}
            <div className="mb-4">
              <p className="text-[10px] font-black uppercase tracking-widest text-foreground/30 mb-2">Ambient Sound</p>
              <div className="flex gap-2">
                <button
                  onClick={() => setSoundscape(null)}
                  className={`flex-1 py-1.5 rounded-xl text-xs font-bold border transition-all flex items-center justify-center gap-1 ${
                    soundscape === null
                      ? 'bg-white/10 border-white/20 text-white'
                      : 'bg-white/5 border-white/5 text-foreground/40 hover:border-white/10'
                  }`}
                >
                  {soundscape === null ? <Volume2 className="w-3 h-3" /> : <VolumeX className="w-3 h-3" />}
                  Off
                </button>
                {SOUNDSCAPES.map(s => (
                  <button
                    key={s.id}
                    onClick={() => setSoundscape(s.id)}
                    className={`flex-1 py-1.5 rounded-xl text-xs font-bold border transition-all ${
                      soundscape === s.id
                        ? 'text-white'
                        : 'bg-white/5 border-white/5 text-foreground/40 hover:border-white/10'
                    }`}
                    style={soundscape === s.id ? {
                      background: `${s.color}20`,
                      borderColor: `${s.color}50`,
                      color: s.color
                    } : undefined}
                  >
                    {s.emoji} {s.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Controls */}
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
