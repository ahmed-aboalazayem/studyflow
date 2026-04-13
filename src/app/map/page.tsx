"use client"

import * as React from "react"
import { motion, AnimatePresence } from "framer-motion"
import { useStore } from "@/lib/store"
import { useAuth } from "@/lib/auth-context"
import { BackgroundEffect } from "@/components/ui/BackgroundEffect"
import { Flame, Monitor, Map as MapIcon, TreePine, MountainSnow, Tent, Crown, CheckCircle2, ChevronDown, Lock, User } from "lucide-react"
import Link from "next/link"

// ─── Constants ─────────────────────────────────────────────────────────────
const SCALE_FACTOR_DESKTOP = 40
const SCALE_FACTOR_MOBILE  = 20
const MIN_SPACING_DESKTOP  = 220
const MIN_SPACING_MOBILE   = 130
const MAX_SPACING          = 600
const PATH_STROKE          = 10



// ─── Helpers ───────────────────────────────────────────────────────────────
function nodeSpacing(totalVideos: number, isMobile: boolean): number {
  const scale = isMobile ? SCALE_FACTOR_MOBILE : SCALE_FACTOR_DESKTOP
  const min   = isMobile ? MIN_SPACING_MOBILE : MIN_SPACING_DESKTOP
  return Math.min(MAX_SPACING, Math.max(min, totalVideos * scale))
}

// xPercent based on whether the node index is even or odd (zigzag)
function xPct(index: number, isMobile: boolean): number {
  if (isMobile) {
    // Perfectly centered with a tiny organic wobble for mobile
    return 50 + (index % 2 === 0 ? -2 : 2)
  }
  return index % 2 === 0 ? 28 : 72
}

// Gather cumulative Y positions for all nodes
function buildYPositions(blocks: { totalItems: number }[], isMobile: boolean): number[] {
  const positions: number[] = []
  const minSpacing = isMobile ? MIN_SPACING_MOBILE : MIN_SPACING_DESKTOP
  let cumY = minSpacing / 2 // top padding
  for (const block of blocks) {
    positions.push(cumY)
    cumY += nodeSpacing(block.totalItems, isMobile)
  }
  // Final "Zenith" crown node
  positions.push(cumY + minSpacing)
  return positions
}

// Get label color for rank
function rankColors(rank: number) {
  if (rank === 0) return { bg: "from-yellow-500/30 to-yellow-500/10", border: "border-yellow-500/60", text: "text-yellow-400", glow: "shadow-[0_0_30px_rgba(234,179,8,0.4)]" }
  if (rank === 1) return { bg: "from-slate-400/20 to-slate-400/5", border: "border-slate-400/40", text: "text-slate-300", glow: "" }
  return { bg: "from-amber-800/20 to-amber-800/5", border: "border-amber-800/40", text: "text-amber-700", glow: "" }
}



// ─── Avatar Dot ────────────────────────────────────────────────────────────
function AvatarDot({
  currentDayIndex, progressWithinDay, yPositions, nodeCount,
  isMobile, user
}: {
  currentDayIndex: number
  progressWithinDay: number
  yPositions: number[]
  nodeCount: number
  isMobile: boolean
  user: any
}) {
  const dayIdx   = Math.min(currentDayIndex, nodeCount - 1)
  const nextIdx  = Math.min(dayIdx + 1, yPositions.length - 1)

  const curX  = xPct(dayIdx, isMobile)
  const curY  = yPositions[dayIdx]  ?? 0
  const nxtX  = xPct(nextIdx, isMobile)
  const nxtY  = yPositions[nextIdx] ?? curY

  const p = progressWithinDay
  const finalX = curX + (nxtX - curX) * p
  const finalY = curY + (nxtY - curY) * p

  const size   = isMobile ? 48 : 56

  return (
    <motion.div
      layout
      animate={{ left: `${finalX}%`, top: finalY }}
      transition={{ type: "spring", stiffness: 60, damping: 18 }}
      className="absolute pointer-events-auto -translate-x-1/2 -translate-y-1/2 z-40"
    >
      <div className="absolute inset-0 rounded-full blur-xl bg-emerald-400/40 scale-150 animate-pulse pointer-events-none" />

      <div
        className="rounded-full overflow-hidden flex items-center justify-center border-[3px] border-emerald-300 shadow-[0_0_20px_rgba(52,211,153,0.8)] bg-black"
        style={{ width: size, height: size }}
      >
        {user?.imageUrl ? (
          <img src={user.imageUrl} alt="" className="w-full h-full object-cover" />
        ) : (
          <User className="text-white/60" style={{ width: size * 0.45, height: size * 0.45 }} />
        )}
      </div>
    </motion.div>
  )
}


// ─── Main Page ─────────────────────────────────────────────────────────────
export default function MapPage() {
  const { courses, courseDetails, fetchCourses, isLoaded } = useStore()
  const { user, isLoading } = useAuth()

  const [selectedCourseId, setSelectedCourseId] = React.useState<string>("")
  const [isMobile, setIsMobile] = React.useState(false)
  const [mounted, setMounted] = React.useState(false)

  // ── responsive check
  React.useEffect(() => {
    setMounted(true)
    const checkMobile = () => setIsMobile(window.innerWidth < 768)
    checkMobile()
    window.addEventListener("resize", checkMobile)
    return () => window.removeEventListener("resize", checkMobile)
  }, [])

  // ── fetch courses on mount
  React.useEffect(() => { fetchCourses() }, [fetchCourses])

  // ── auto-select first course
  React.useEffect(() => {
    if (courses.length > 0 && !selectedCourseId) {
      setSelectedCourseId(courses[0].id)
    }
  }, [courses, selectedCourseId])



  // ── Core data
  const activeCourse = courses.find(c => c.id === selectedCourseId)
  const rawBlocks    = courseDetails[selectedCourseId] || []

  // Enrich blocks
  const enrichedBlocks = React.useMemo(() => rawBlocks.map(block => {
    const total     = block.items.length
    const completed = block.items.filter(i => i.completed).length
    return {
      ...block,
      totalItems: total,
      completedItems: completed,
      isCompleted: total > 0 && completed === total,
      progressPercent: total > 0 ? completed / total : 0,
    }
  }), [rawBlocks])

  // Build all nodes (blocks + crown)
  const mapNodes = React.useMemo(() => {
    const isFullyDone = enrichedBlocks.length > 0 && enrichedBlocks.every(b => b.isCompleted)
    return [
      ...enrichedBlocks,
      {
        id: "zenith", title: "The Zenith", totalItems: 0, completedItems: 0,
        isCompleted: isFullyDone, progressPercent: isFullyDone ? 1 : 0, items: []
      } as any
    ]
  }, [enrichedBlocks])

  // Responsive positions
  const yPositions = React.useMemo(() => buildYPositions(mapNodes, isMobile), [mapNodes, isMobile])
  const totalMapHeight = (yPositions[yPositions.length - 1] ?? 400) + (isMobile ? MIN_SPACING_MOBILE : MIN_SPACING_DESKTOP)

  // My progress
  const myProgress = React.useMemo(() => {
    let currentDayIndex = enrichedBlocks.length > 0 ? enrichedBlocks.length - 1 : 0
    let progressWithinDay = 1
    let isFinished = true

    for (let i = 0; i < enrichedBlocks.length; i++) {
      if (!enrichedBlocks[i].isCompleted) {
        currentDayIndex  = i
        progressWithinDay = enrichedBlocks[i].progressPercent
        isFinished = false
        break
      }
    }
    return { currentDayIndex, progressWithinDay, isFinished }
  }, [enrichedBlocks])

  // SVG path string for all nodes
  const pathPoints = React.useMemo(() =>
    mapNodes.map((_, i) => `${xPct(i, isMobile)}%,${yPositions[i] ?? 0}`).join(" ")
  , [mapNodes, yPositions, isMobile])



  // Active path (up to current position)
  const { currentDayIndex, progressWithinDay } = myProgress
  const activeNodeCount = Math.min(currentDayIndex + 2, mapNodes.length)
  const activePathPoints = React.useMemo(() =>
    mapNodes.slice(0, activeNodeCount).map((_, i) => `${xPct(i, isMobile)}%,${yPositions[i] ?? 0}`).join(" ")
  , [mapNodes, yPositions, activeNodeCount, isMobile])

  // Scrolling function
  const scrollToMe = React.useCallback(() => {
    const me = myProgress
    // Calculate estimated Y
    const dayIdx = Math.min(me.currentDayIndex, mapNodes.length - 1)
    const nextIdx = Math.min(dayIdx + 1, yPositions.length - 1)
    const curY = yPositions[dayIdx] ?? 0
    const nxtY = yPositions[nextIdx] ?? curY
    const p = (me as any).progressWithinDay ?? 0
    const finalY = curY + (nxtY - curY) * p
    
    // Add header offset
    window.scrollTo({
      top: finalY + 200, // Roughly maps to the 24px + 12px padding top
      behavior: 'smooth'
    })
  }, [myProgress, mapNodes, yPositions])

  if (!isLoaded || isLoading || !mounted) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-black">
        <div className="flex flex-col items-center gap-4 animate-pulse">
          <MapIcon className="w-10 h-10 text-emerald-500" />
          <p className="text-emerald-500/50 font-black uppercase tracking-[0.3em]">Rendering Map…</p>
        </div>
      </div>
    )
  }

  return (
    <main className="relative min-h-screen bg-black overflow-x-hidden pb-40">
      <BackgroundEffect />
      {/* Nature atmosphere */}
      <div className="absolute inset-0 bg-gradient-to-b from-[#011a0e]/90 via-[#021f12]/60 to-black pointer-events-none" />

      {/* Rolling hills silhouette */}
      <div className="absolute bottom-0 left-0 right-0 h-64 pointer-events-none opacity-20"
        style={{ background: "radial-gradient(ellipse 140% 80% at 50% 110%, #052e1a 0%, transparent 70%)" }} />

      <div className="container mx-auto px-2 md:px-4 pt-24 relative z-10 max-w-6xl">

        {/* ── Header ─────────────────────────────────────────── */}
        <div className="text-center mb-12">
          <h1 className="text-3xl md:text-6xl font-black text-white tracking-tighter mb-3 flex items-center justify-center gap-3">
            <MapIcon className="w-8 h-8 md:w-10 md:h-10 text-emerald-400" />
            Adventure Map
          </h1>
          <p className="text-emerald-100/40 text-sm md:text-lg font-medium">
            Your personal progress trail to <span className="text-yellow-400">The Zenith</span>.
          </p>
        </div>

        {/* ── Course Selector ─────────────────────────────────── */}
        <div className="max-w-lg mx-auto relative mb-12 z-50 px-2">
          <div className="absolute inset-y-0 right-6 flex items-center pointer-events-none">
            <ChevronDown className="w-5 h-5 text-emerald-400" />
          </div>
          <select
            value={selectedCourseId}
            onChange={e => setSelectedCourseId(e.target.value)}
            className="w-full appearance-none bg-black/70 border border-emerald-500/30 text-white rounded-2xl px-6 py-3 md:py-4 text-base md:text-lg font-bold shadow-[0_0_30px_rgba(16,185,129,0.1)] focus:outline-none focus:border-emerald-400 focus:shadow-[0_0_40px_rgba(16,185,129,0.3)] transition-all backdrop-blur-sm cursor-pointer"
          >
            <option value="" disabled className="bg-black text-sm">Select Course…</option>
            {courses.map(course => (
              <option key={course.id} value={course.id} className="bg-black text-white text-sm">
                {course.title}  ({course.progress}%)
              </option>
            ))}
          </select>
        </div>

        {/* ── Two-column layout: Map | Leaderboard ─────────────── */}
        <div className="flex flex-col lg:flex-row gap-8 items-start">

          {/* ── MAP ──────────────────────────────────────────────── */}
          <div className="flex-1 relative min-w-0">
            {isMobile ? (
              <div className="flex flex-col items-center justify-center py-20 px-6 glass rounded-3xl border border-white/10 text-center relative overflow-hidden">
                <div className="absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-transparent via-emerald-500/50 to-transparent" />
                
                <div className="w-20 h-20 rounded-2xl bg-emerald-500/10 flex items-center justify-center mb-8 border border-emerald-500/20">
                  <Monitor className="w-10 h-10 text-emerald-400 animate-pulse" />
                </div>

                <h2 className="text-2xl font-black text-white mb-4 tracking-tight">
                  Desktop Experience Required
                </h2>
                
                <p className="text-emerald-100/60 font-medium mb-12 text-sm max-w-xs mx-auto leading-relaxed">
                  Open StudyFlow on your laptop to explore the full interactive Adventure Map and track your competition journey.
                </p>

                <div className="w-full space-y-4 relative">
                  <div className="absolute left-1/2 -top-6 -translate-x-1/2 w-px h-6 bg-gradient-to-b from-transparent to-emerald-500/30" />
                  
                  {[
                    "The best view comes after the hardest climb.",
                    "Focus today, lead tomorrow.",
                    "Consistency is the key to mastery."
                  ].map((quote, i) => (
                    <motion.div
                      key={i}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.2 + i * 0.1 }}
                      className="px-6 py-4 rounded-2xl bg-white/5 border border-white/5 italic text-emerald-400/80 text-sm font-medium"
                    >
                      "{quote}"
                    </motion.div>
                  ))}
                </div>
              </div>
            ) : mapNodes.length <= 1 ? (
              <div className="text-center py-32 glass border-dashed border-emerald-500/20 rounded-3xl">
                <TreePine className="w-16 h-16 text-emerald-500/30 mx-auto mb-6" />
                <p className="text-2xl font-bold text-white mb-2">Uncharted Territory</p>
                <p className="text-emerald-100/50 max-w-xs mx-auto">
                  Add sections to this course to generate your adventure map!
                </p>
                <Link href={`/course/${selectedCourseId}`} className="inline-block mt-6 px-6 py-3 bg-emerald-600 text-white font-bold rounded-xl hover:bg-emerald-500 transition-colors">
                  Open Course →
                </Link>
              </div>
            ) : (

              <div className="relative w-full" style={{ height: totalMapHeight }}>

                {/* ── SVG Paths ──  */}
                <svg className="absolute inset-0 w-full h-full pointer-events-none" overflow="visible">
                  {/* Background trail */}
                  <polyline
                    points={pathPoints}
                    fill="none"
                    stroke="rgba(6,78,44,0.35)"
                    strokeWidth={PATH_STROKE}
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeDasharray="14 10"
                  />
                  {/* Active glowing trail */}
                  {activeNodeCount >= 2 && (
                    <polyline
                      points={activePathPoints}
                      fill="none"
                      stroke="#34d399"
                      strokeWidth={PATH_STROKE}
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      filter="url(#glow)"
                    />
                  )}
                  {/* Milestone dots on inactive trail */}
                  {mapNodes.slice(0, -1).map((_, i) => {
                    const ax = xPct(i, isMobile), ay = yPositions[i] ?? 0
                    const bx = xPct(i + 1, isMobile), by = yPositions[i + 1] ?? ay
                    return [0.33, 0.66].map((t, j) => (
                      <circle
                        key={`dot-${i}-${j}`}
                        cx={`${ax + (bx - ax) * t}%`}
                        cy={ay + (by - ay) * t}
                        r={isMobile ? 3 : 4}
                        fill={i < currentDayIndex ? "#34d399" : "rgba(255,255,255,0.15)"}
                      />
                    ))
                  })}
                  <defs>
                    <filter id="glow">
                      <feGaussianBlur stdDeviation="4" result="blur" />
                      <feMerge><feMergeNode in="blur" /><feMergeNode in="SourceGraphic" /></feMerge>
                    </filter>
                  </defs>
                </svg>

                {/* ── Nodes ── */}
                {mapNodes.map((node, i) => {
                  const isFinal    = i === mapNodes.length - 1
                  const isCompleted = node.isCompleted
                  const isCurrent  = i === currentDayIndex && !myProgress.isFinished
                  const isLocked   = i > currentDayIndex && !isFinal && !isCompleted

                  const cx = xPct(i, isMobile)
                  const cy = yPositions[i] ?? 0

                  const diffLevel = node.totalItems > 8 ? "hard" : node.totalItems > 4 ? "medium" : "easy"

                  return (
                    <motion.div
                      key={node.id}
                      initial={{ opacity: 0, scale: 0.5 }}
                      whileInView={{ opacity: isLocked ? 0.3 : 1, scale: 1 }}
                      viewport={{ once: true, margin: "-80px" }}
                      transition={{ type: "spring", stiffness: 180, damping: 22, delay: i * 0.06 }}
                      className="absolute flex flex-col items-center -translate-x-1/2 -translate-y-1/2 z-10 w-32 md:w-44"
                      style={{ left: `${cx}%`, top: cy, filter: isLocked ? "blur(2px) grayscale(1)" : "none" }}
                    >
                      {/* ── Node circle ── */}
                      <div
                        className={`relative flex items-center justify-center rounded-full border-[4px] transition-all duration-300 cursor-pointer group
                          ${isCompleted ? "border-emerald-400 bg-emerald-950 shadow-[0_0_35px_rgba(52,211,153,0.55)]"
                          : isCurrent  ? "border-white bg-black shadow-[0_0_50px_rgba(255,255,255,0.45)]"
                          : isFinal && myProgress.isFinished ? "border-yellow-400 bg-black shadow-[0_0_60px_rgba(234,179,8,0.7)]"
                          : "border-white/10 bg-[#050505]"
                        }`}
                        style={{ width: isFinal ? 96 : 80, height: isFinal ? 96 : 80 }}
                      >
                        {isFinal ? (
                          <Crown className={`w-8 h-8 md:w-10 md:h-10 ${myProgress.isFinished ? "text-yellow-400 drop-shadow-[0_0_12px_rgba(250,204,21,1)]" : "text-white/20"}`} />
                        ) : diffLevel === "hard" ? (
                          <MountainSnow className={`w-7 h-7 md:w-9 md:h-9 ${isCompleted ? "text-emerald-400" : isCurrent ? "text-white" : "text-white/20"}`} />
                        ) : diffLevel === "medium" ? (
                          <TreePine className={`w-7 h-7 md:w-9 md:h-9 ${isCompleted ? "text-emerald-400" : isCurrent ? "text-white" : "text-white/20"}`} />
                        ) : (
                          <Tent className={`w-7 h-7 md:w-9 md:h-9 ${isCompleted ? "text-emerald-400" : isCurrent ? "text-white" : "text-white/20"}`} />
                        )}

                        {/* Locked layer */}
                        {isLocked && (
                          <div className="absolute inset-0 flex items-center justify-center rounded-full bg-black/60">
                            <Lock className="w-4 h-4 text-white/40" />
                          </div>
                        )}

                        {/* Pulse ring for current node */}
                        {isCurrent && (
                          <div className="absolute inset-0 rounded-full border-2 border-white/40 animate-ping pointer-events-none" />
                        )}
                      </div>

                      {/* ── Node label ── */}
                      <div className="mt-3 text-center max-w-[160px]">
                        <p className={`font-black text-xs md:text-sm leading-tight drop-shadow ${isCompleted || isCurrent ? "text-white" : "text-white/30"}`}>
                          {node.title}
                        </p>
                        {!isFinal && (
                          <p className={`mt-1 text-[10px] font-bold flex items-center justify-center gap-1 ${isCompleted ? "text-emerald-400" : "text-white/30"}`}>
                            {isCompleted && <CheckCircle2 className="w-3 h-3" />}
                            {node.completedItems}/{node.totalItems}
                          </p>
                        )}
                        {isFinal && myProgress.isFinished && (
                          <p className="mt-1 text-[10px] font-black text-yellow-400 uppercase tracking-widest animate-pulse">
                            🎉 Completed!
                          </p>
                        )}
                      </div>
                    </motion.div>
                  )
                })}

{/* Current User Avatar Dot */}
                      <AvatarDot
                        currentDayIndex={currentDayIndex}
                        progressWithinDay={progressWithinDay}
                        yPositions={yPositions}
                        nodeCount={mapNodes.length - 1}
                        isMobile={isMobile}
                        user={user}
                      />

              </div>
            )}
          </div>



        </div>
      </div>
      
      {/* ── Floating Locate Me Button (Desktop Only) ── */}
      {!isMobile && (
        <div className="fixed bottom-8 right-8 z-[60] group">
          <div className="absolute -inset-2 bg-emerald-500/20 blur-xl rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
          <button
            onClick={scrollToMe}
            className="relative w-14 h-14 bg-black/60 backdrop-blur-xl border border-white/10 rounded-full flex items-center justify-center text-white/60 hover:text-emerald-400 hover:border-emerald-500/40 shadow-2xl transition-all active:scale-90"
          >
            <User className="w-6 h-6" />
            <motion.div 
              animate={{ scale: [1, 1.2, 1] }}
              transition={{ duration: 2, repeat: Infinity }}
              className="absolute -top-1 -right-1 w-4 h-4 bg-emerald-500 rounded-full border-2 border-black flex items-center justify-center"
            >
              <div className="w-1.5 h-1.5 bg-white rounded-full" />
            </motion.div>
          </button>
          <div className="absolute right-full mr-4 top-1/2 -translate-y-1/2 px-3 py-1.5 bg-zinc-900 border border-white/10 rounded-lg text-[10px] font-black uppercase tracking-widest text-white opacity-0 group-hover:opacity-100 transition-all pointer-events-none whitespace-nowrap">
            Locate Me
          </div>
        </div>
      )}
    </main>
  )
}
