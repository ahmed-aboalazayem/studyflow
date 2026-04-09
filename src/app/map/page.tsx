"use client"

import * as React from "react"
import { motion, AnimatePresence } from "framer-motion"
import { useStore } from "@/lib/store"
import { useAuth } from "@/lib/auth-context"
import { BackgroundEffect } from "@/components/ui/BackgroundEffect"
import { getCourseCompetitorProgress } from "@/app/actions"
import {
  TreePine, MountainSnow, Tent, User, Map as MapIcon,
  Crown, CheckCircle2, ChevronDown, Trophy, Lock,
  Flame
} from "lucide-react"
import Link from "next/link"

// ─── Constants ─────────────────────────────────────────────────────────────
const SCALE_FACTOR_DESKTOP = 40
const SCALE_FACTOR_MOBILE  = 20
const MIN_SPACING_DESKTOP  = 220
const MIN_SPACING_MOBILE   = 130
const MAX_SPACING          = 600
const PATH_STROKE          = 10

// ─── Types ─────────────────────────────────────────────────────────────────
interface Competitor {
  userId: number
  username: string
  displayName: string | null
  imageUrl: string | null
  currentDayIndex: number
  progressWithinDay: number
  score: number
  isCurrentUser: boolean
}

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
  competitor, rank, yPositions, nodeCount,
  onHover, hoveredId, isMobile,
  spotIndex, totalInSpot
}: {
  competitor: Competitor
  rank: number
  yPositions: number[]
  nodeCount: number
  onHover: (id: number | null) => void
  hoveredId: number | null
  isMobile: boolean
  spotIndex: number
  totalInSpot: number
}) {
  const isMe = competitor.isCurrentUser
  const isLeader = rank === 0

  const dayIdx   = Math.min(competitor.currentDayIndex, nodeCount - 1)
  const nextIdx  = Math.min(dayIdx + 1, yPositions.length - 1)

  const curX  = xPct(dayIdx, isMobile)
  const curY  = yPositions[dayIdx]  ?? 0
  const nxtX  = xPct(nextIdx, isMobile)
  const nxtY  = yPositions[nextIdx] ?? curY

  const p = competitor.progressWithinDay
  let finalX = curX + (nxtX - curX) * p
  const finalY = curY + (nxtY - curY) * p

  // Collision offset: side-by-side if multiple people in same p
  if (totalInSpot > 1) {
    const spread = isMobile ? 32 : 44 // px
    const totalWidth = (totalInSpot - 1) * spread
    const startOffset = -totalWidth / 2
    const pixelOffset = startOffset + (spotIndex * spread)
    // Convert px offset back to rough % for absolute positioning (approximate based on typical 6xl container)
    // Actually better to just use transform: translateX
  }

  const size   = isMe ? (isMobile ? 48 : 56) : (isMobile ? 36 : 42)
  const zIndex = isMe ? 40 : 30

  return (
    <motion.div
      layout
      animate={{ left: `${finalX}%`, top: finalY }}
      transition={{ type: "spring", stiffness: 60, damping: 18 }}
      className="absolute pointer-events-auto"
      style={{ 
        x: totalInSpot > 1 ? `calc(-50% + ${(spotIndex - (totalInSpot - 1) / 2) * (isMobile ? 32 : 44)}px)` : "-50%", 
        y: "-50%", 
        zIndex 
      }}
      onMouseEnter={() => onHover(competitor.userId)}
      onMouseLeave={() => onHover(null)}
    >
      {/* Glow halo for current user */}
      {isMe && (
        <div className="absolute inset-0 rounded-full blur-xl bg-emerald-400/40 scale-150 animate-pulse pointer-events-none" />
      )}

      {/* Crown for leader */}
      {isLeader && (
        <div className="absolute -top-7 left-1/2 -translate-x-1/2 pointer-events-none z-10">
          <Crown className="w-5 h-5 text-yellow-400 drop-shadow-[0_0_8px_rgba(234,179,8,0.9)]" />
        </div>
      )}

      {/* Avatar image */}
      <div
        className={`rounded-full overflow-hidden flex items-center justify-center border-[3px] ${
          isMe
            ? "border-emerald-300 shadow-[0_0_20px_rgba(52,211,153,0.8)]"
            : isLeader
            ? "border-yellow-400 shadow-[0_0_16px_rgba(234,179,8,0.5)]"
            : "border-white/30 opacity-80"
        }`}
        style={{ width: size, height: size, backgroundColor: "#000" }}
      >
        {competitor.imageUrl ? (
          <img src={competitor.imageUrl} alt="" className="w-full h-full object-cover" />
        ) : (
          <User className="text-white/60" style={{ width: size * 0.45, height: size * 0.45 }} />
        )}
      </div>

      {/* Tooltip */}
      <AnimatePresence>
        {hoveredId === competitor.userId && (
          <motion.div
            initial={{ opacity: 0, y: 6, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 6, scale: 0.9 }}
            transition={{ duration: 0.15 }}
            className="absolute bottom-full left-1/2 -translate-x-1/2 mb-3 whitespace-nowrap z-50 pointer-events-none"
          >
            <div className="glass border border-white/20 rounded-xl px-3 py-2 text-xs font-bold text-white shadow-2xl">
              <span className="text-emerald-400">{competitor.displayName || competitor.username}</span>
              <span className="text-white/40 ml-2">
                Day {competitor.currentDayIndex + 1} · {Math.round(competitor.progressWithinDay * 100)}%
              </span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  )
}

// ─── Main Page ─────────────────────────────────────────────────────────────
export default function MapPage() {
  const { courses, courseDetails, fetchCourses, isLoaded } = useStore()
  const { user, isLoading } = useAuth()

  const [selectedCourseId, setSelectedCourseId] = React.useState<string>("")
  const [competitors, setCompetitors] = React.useState<Competitor[]>([])
  const [loadingCompetitors, setLoadingCompetitors] = React.useState(false)
  const [hoveredUserId, setHoveredUserId] = React.useState<number | null>(null)
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

  // ── fetch competitor positions (poll every 10s)
  const fetchCompetitors = React.useCallback(async () => {
    if (!selectedCourseId) return
    setLoadingCompetitors(true)
    try {
      const data = await getCourseCompetitorProgress(selectedCourseId)
      setCompetitors(data as Competitor[])
    } finally {
      setLoadingCompetitors(false)
    }
  }, [selectedCourseId])

  React.useEffect(() => {
    fetchCompetitors()
    const interval = setInterval(fetchCompetitors, 10_000)
    return () => clearInterval(interval)
  }, [fetchCompetitors])

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

  // Group competitors by position key to handle offsets
  const groupedCompetitors = React.useMemo(() => {
    const groups: Record<string, Competitor[]> = {}
    competitors.forEach(c => {
      const key = `${c.currentDayIndex}-${c.progressWithinDay.toFixed(3)}` // fix minor float diffs
      if (!groups[key]) groups[key] = []
      groups[key].push(c)
    })
    return groups
  }, [competitors])

  // Active path (up to current position)
  const { currentDayIndex, progressWithinDay } = myProgress
  const activeNodeCount = Math.min(currentDayIndex + 2, mapNodes.length)
  const activePathPoints = React.useMemo(() =>
    mapNodes.slice(0, activeNodeCount).map((_, i) => `${xPct(i, isMobile)}%,${yPositions[i] ?? 0}`).join(" ")
  , [mapNodes, yPositions, activeNodeCount, isMobile])

  // Scrolling function
  const scrollToMe = React.useCallback(() => {
    const me = competitors.find(c => c.isCurrentUser) || myProgress
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
  }, [competitors, myProgress, mapNodes, yPositions])

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
            Compete on the same trail — see who reaches <span className="text-yellow-400">The Zenith</span> first.
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
            {mapNodes.length <= 1 ? (
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

                 {/* ── All competitor avatars (including me) ── */}
                {Object.values(groupedCompetitors).map((group) => 
                  group.map((comp, idx) => {
                    // Rank is determined by the index in the original sorted competitors array
                    const originalRank = competitors.findIndex(c => c.userId === comp.userId)
                    return (
                      <AvatarDot
                        key={comp.userId}
                        competitor={comp}
                        rank={originalRank}
                        yPositions={yPositions}
                        nodeCount={mapNodes.length - 1}
                        onHover={setHoveredUserId}
                        hoveredId={hoveredUserId}
                        isMobile={isMobile}
                        spotIndex={idx}
                        totalInSpot={group.length}
                      />
                    )
                  })
                )}

              </div>
            )}
          </div>

          {/* ── LEADERBOARD ──────────────────────────────────────── */}
          <div className="w-full lg:w-72 lg:sticky lg:top-24 shrink-0">
            <div className="glass border border-white/10 rounded-3xl p-5 overflow-hidden relative">
              <div className="absolute top-0 right-0 w-40 h-40 bg-yellow-400/10 blur-2xl rounded-full pointer-events-none" />
              <div className="flex items-center gap-2 mb-5">
                <Trophy className="w-5 h-5 text-yellow-400 drop-shadow-[0_0_8px_rgba(234,179,8,0.8)]" />
                <h2 className="text-white font-black text-lg">Leaderboard</h2>
                {loadingCompetitors && (
                  <div className="ml-auto w-4 h-4 border-2 border-emerald-400/50 border-t-emerald-400 rounded-full animate-spin" />
                )}
              </div>

              {competitors.length === 0 ? (
                <div className="text-center py-8 text-white/30 text-sm">
                  No competitors yet — share this course with friends!
                </div>
              ) : (
                <div className="space-y-3">
                  {competitors.map((comp, rank) => {
                    const colors = rankColors(rank)
                    return (
                      <motion.div
                        key={comp.userId}
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: rank * 0.07 }}
                        className={`flex items-center gap-3 px-4 py-3 rounded-2xl border bg-gradient-to-r ${colors.bg} ${colors.border} ${colors.glow} transition-all`}
                      >
                        {/* Rank badge */}
                        <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-black shrink-0 ${colors.text} border ${colors.border}`}>
                          {rank === 0 ? <Crown className="w-3.5 h-3.5" /> : rank + 1}
                        </div>

                        {/* Avatar */}
                        <div className="w-9 h-9 rounded-full overflow-hidden border border-white/20 shrink-0 bg-black">
                          {comp.imageUrl ? (
                            <img src={comp.imageUrl} alt="" className="w-full h-full object-cover" />
                          ) : (
                            <User className="w-full h-full p-2 text-white/40" />
                          )}
                        </div>

                        {/* Name + stats */}
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center gap-1">
                            <span className={`text-sm font-black truncate ${comp.isCurrentUser ? "text-emerald-400" : "text-white"}`}>
                              {comp.displayName || comp.username}
                            </span>
                            {comp.isCurrentUser && (
                              <span className="text-[9px] font-black text-emerald-500/70 uppercase">You</span>
                            )}
                          </div>
                          <div className="flex items-center gap-1.5 mt-0.5">
                            {/* Mini progress bar */}
                            <div className="flex-1 h-1 bg-black/40 rounded-full overflow-hidden">
                              <div
                                className="h-full bg-emerald-400 rounded-full"
                                style={{ width: `${Math.round(comp.score / Math.max(1, (mapNodes.length - 1)) * 100)}%` }}
                              />
                            </div>
                            <span className="text-[9px] text-white/40 font-bold tabular-nums whitespace-nowrap">
                              Day {comp.currentDayIndex + 1}
                            </span>
                          </div>
                        </div>
                      </motion.div>
                    )
                  })}
                </div>
              )}

              {/* Share hint */}
              {competitors.length <= 1 && selectedCourseId && (
                <Link
                  href={`/course/${selectedCourseId}`}
                  className="mt-5 flex items-center justify-center gap-2 py-3 px-4 rounded-2xl bg-white/5 border border-white/10 text-white/50 text-xs font-bold hover:text-white hover:border-white/20 transition-all"
                >
                  <Flame className="w-4 h-4 text-orange-400" />
                  Share course to compete!
                </Link>
              )}
            </div>
          </div>

        </div>
      </div>
      
      {/* ── Floating Locate Me Button ── */}
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
    </main>
  )
}
