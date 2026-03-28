"use client"

import * as React from "react"
import { useParams, useRouter } from "next/navigation"
import Link from "next/link"
import { ArrowLeft, Clock, Calendar, Plus, Share2, X, UserPlus, CheckCircle2, Youtube, ExternalLink, ArrowRight, Trash2, Target } from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { DayBlock, type DayBlockData, DayBlockSkeleton } from "@/components/course/DayBlock"
import { useStore } from "@/lib/store"
import { useAuth } from "@/lib/auth-context"
import { BackgroundEffect } from "@/components/ui/BackgroundEffect"
import { Leaderboard } from "@/components/course/Leaderboard"
import { getLeaderboard, shareCourse } from "@/app/actions"
import { FocusMode } from "@/components/course/FocusMode"
import { Modal } from "@/components/ui/Modal"
import { LoadingState } from "@/components/ui/LoadingState"
import { formatSecondsToDuration, parseDurationToSeconds } from "@/lib/utils"
import { useGamification } from "@/hooks/useGamification"
import { useStreaks } from "@/hooks/useStreaks"
import { useActivityLog } from "@/hooks/useActivityLog"
import { useXPToastQueue } from "@/components/ui/XPToast"

export default function CourseDetailPage() {
  const params = useParams()
  const router = useRouter()
  const { 
    courses, 
    courseDetails, 
    fetchCourseDetail,
    deleteCourse,
    addDayBlock, 
    updateCourseBlocks, 
    isLoaded, 
    recentlySharedWith, 
    addRecentlyShared
  } = useStore()
  const { user, isLoading } = useAuth()

  const { addXP, levelInfo, XP_PER_VIDEO } = useGamification()
  const { recordStudy } = useStreaks()
  const { logActivity } = useActivityLog()
  const { enqueue, ToastContainer } = useXPToastQueue()

  const handleItemComplete = React.useCallback(() => {
    const result = addXP(XP_PER_VIDEO)
    enqueue({ xpGain: XP_PER_VIDEO, leveledUp: result.leveledUp, newLevelName: result.newLevelName, color: levelInfo.current.color })
    recordStudy()
    logActivity()
  }, [addXP, XP_PER_VIDEO, enqueue, levelInfo, recordStudy, logActivity])

  const courseId = params.id as string
  const course = courses.find((c: any) => c.id === courseId)
  const blocks = courseDetails[courseId] || []

  const handleAddDay = async () => {
    await addDayBlock(courseId, `Day ${blocks.length + 1} - New Topic`)
  }

  const handleBlockChange = React.useCallback((updatedBlock: DayBlockData) => {
    updateCourseBlocks(courseId, blocks.map(b => b.id === updatedBlock.id ? updatedBlock : b))
  }, [blocks, courseId, updateCourseBlocks])

  const overallProgress = course?.progress || 0

  const totalCourseTime = React.useMemo(() => {
    const totalSecs = blocks.flatMap(b => b.items).reduce((acc, item) => acc + parseDurationToSeconds(item.duration), 0)
    return formatSecondsToDuration(totalSecs)
  }, [blocks])

  const studiedTime = React.useMemo(() => {
    const doneSecs = blocks.flatMap(b => b.items).filter(item => item.completed).reduce((acc, item) => acc + parseDurationToSeconds(item.duration), 0)
    return formatSecondsToDuration(doneSecs)
  }, [blocks])

  const remainingDays = React.useMemo(() => {
    return blocks.filter(b => b.items.length > 0 && !b.items.every(i => i.completed)).length
  }, [blocks])
  const [leaderboardData, setLeaderboardData] = React.useState<any[]>([])
  const [shareUsername, setShareUsername] = React.useState("")
  const [sharing, setSharing] = React.useState(false)
  const [leaderboardLoading, setLeaderboardLoading] = React.useState(true)
  const [modal, setModal] = React.useState<{ isOpen: boolean; title: string; description: string; type: "success" | "error" }>({
    isOpen: false,
    title: "",
    description: "",
    type: "success"
  })
  const [showDeleteModal, setShowDeleteModal] = React.useState(false)

  React.useEffect(() => {
    fetchCourseDetail(courseId)
  }, [courseId, fetchCourseDetail])

  React.useEffect(() => {
    const fetchLeaderboard = async () => {
      setLeaderboardLoading(true)
      const data = await getLeaderboard(courseId)
      setLeaderboardData(data)
      setLeaderboardLoading(false)
    }
    if (isLoaded && course) {
      fetchLeaderboard()
    }
  }, [courseId, course?.completedVideos, isLoaded, course])

  const currentStudyIndex = React.useMemo(() => {
    const idx = blocks.findIndex(block => {
      if (block.items.length === 0) return false;
      return !block.items.every(i => i.completed);
    });
    return idx === -1 ? 0 : idx;
  }, [blocks]);

  // Floating jump button logic
  const currentStudyRef = React.useRef<HTMLDivElement>(null)
  const [showJumpButton, setShowJumpButton] = React.useState(false)
  const [jumpDirection, setJumpDirection] = React.useState<'up' | 'down'>('down')

  React.useEffect(() => {
    if (blocks.length === 0) return

    const checkVisibility = () => {
      if (!currentStudyRef.current) return
      const rect = currentStudyRef.current.getBoundingClientRect()
      const viewH = window.innerHeight
      // If the current block is fully out of view
      if (rect.bottom < 0 || rect.top > viewH) {
        setShowJumpButton(true)
        setJumpDirection(rect.top > viewH ? 'down' : 'up')
      } else {
        setShowJumpButton(false)
      }
    }

    window.addEventListener('scroll', checkVisibility, { passive: true })
    checkVisibility()
    return () => window.removeEventListener('scroll', checkVisibility)
  }, [blocks, currentStudyIndex])

  const scrollToCurrentStudy = () => {
    currentStudyRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' })
  }

  if (isLoading || !isLoaded) {
    return (
      <main className="relative min-h-screen">
        <BackgroundEffect />
        <div className="container mx-auto px-4 py-8 max-w-7xl relative z-10 animate-pulse">
          <div className="h-6 w-32 bg-white/5 rounded-lg mb-8" />
          
          <div className="mb-12">
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-6">
              <div className="space-y-3">
                <div className="h-12 w-96 bg-white/10 rounded-xl" />
                <div className="h-6 w-48 bg-white/5 rounded-lg" />
              </div>
              <div className="flex items-center gap-4">
                <div className="space-y-2 flex flex-col items-end">
                  <div className="h-4 w-16 bg-white/5 rounded-lg" />
                  <div className="h-8 w-12 bg-white/10 rounded-lg" />
                </div>
                <div className="w-14 h-14 rounded-full border-4 border-white/10" />
              </div>
            </div>
            <div className="flex items-center gap-4">
              <div className="h-8 w-24 bg-white/5 rounded-lg" />
              <div className="h-8 w-32 bg-white/5 rounded-lg" />
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 space-y-6">
              {[1, 2, 3].map((i) => (
                <DayBlockSkeleton key={i} />
              ))}
            </div>
            <div className="space-y-6">
              <div className="h-48 w-full bg-white/5 rounded-3xl border border-white/10" />
              <div className="h-64 w-full bg-white/5 rounded-3xl border border-white/10" />
            </div>
          </div>
        </div>
      </main>
    )
  }

  if (!user) return null

  if (!course) {
    return (
      <div className="container mx-auto px-4 py-20 text-center">
        <h1 className="text-2xl font-bold text-white mb-4">Course not found</h1>
        <Link href="/dashboard">
          <Button variant="ghost">Return to Dashboard</Button>
        </Link>
      </div>
    )
  }

  const handleShare = async (target?: string) => {
    const username = target || shareUsername
    if (!username.trim()) return
    setSharing(true)
    const result = await shareCourse(courseId, username)
    setSharing(false)
    if ('error' in result) {
      setModal({
        isOpen: true,
        title: "Sharing Failed",
        description: result.error || "Could not share the course with this user.",
        type: "error"
      })
    } else {
      setModal({
        isOpen: true,
        title: "Course Shared!",
        description: `Successfully shared "${course.title}" with ${username}.`,
        type: "success"
      })
      addRecentlyShared(username)
      if (!target) setShareUsername("")
    }
  }

  return (
    <main className="relative min-h-screen">
      <BackgroundEffect />
      {ToastContainer}
      
      <div className="container mx-auto px-4 py-8 max-w-7xl relative z-10">
        <div className="flex items-center justify-between mb-8">
          <Link href="/dashboard" className="inline-flex items-center gap-2 text-foreground/40 hover:text-primary transition-colors group">
            <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
            Back to Dashboard
          </Link>

          {course.ownership !== 'shared' && (
            <Button 
              variant="ghost" 
              size="sm"
              onClick={() => setShowDeleteModal(true)}
              className="text-foreground/40 hover:text-red-500 hover:border-red-500/50 transition-all border-white/5 bg-white/5"
            >
              <Trash2 className="w-4 h-4 mr-2" />
              Delete Course
            </Button>
          )}
        </div>

        {/* Header Section */}
        <div className="mb-12">
          <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6 mb-8">
            <div className="space-y-4 flex-1">
              <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-black text-white tracking-tighter drop-shadow-2xl leading-tight">
                {course?.title}
              </h1>
              
              <div className="flex flex-wrap gap-2 items-center text-sm font-medium text-foreground/60">
                <span className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/5 border border-white/5">
                  <Clock className="w-4 h-4" />
                  {course.totalVideos} Videos
                </span>
                <span className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/5 border border-white/5">
                  <Calendar className="w-4 h-4" />
                  {blocks.length} Days Planned
                </span>
                <span className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/5 border border-white/5">
                  <Clock className="w-4 h-4 text-primary" />
                  {totalCourseTime} Total
                </span>
                {remainingDays > 0 && (
                  <span className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-amber-500/10 border border-amber-500/20 text-amber-400">
                    <Calendar className="w-4 h-4" />
                    {remainingDays} Days Left
                  </span>
                )}
                {remainingDays === 0 && blocks.length > 0 && (
                  <span className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-400">
                    <CheckCircle2 className="w-4 h-4" />
                    All Done!
                  </span>
                )}
              </div>
            </div>
            
            <div className="flex items-center justify-between lg:justify-end gap-6 bg-white/5 p-5 rounded-3xl border border-white/10 lg:bg-transparent lg:p-0 lg:border-0 lg:rounded-none mt-4 lg:mt-0 shadow-lg lg:shadow-none">
              <div className="flex flex-col items-start lg:items-end w-full">
                <span className="text-[10px] sm:text-[11px] text-foreground/40 uppercase tracking-[0.2em] font-black mb-1">Time Studied</span>
                <span className="text-2xl sm:text-3xl font-black tracking-tighter text-white">
                  {studiedTime}
                </span>
              </div>
              <div className="relative h-20 w-20 sm:h-24 sm:w-24 shrink-0 flex items-center justify-center">
                  <svg className="w-full h-full transform -rotate-90 drop-shadow-xl absolute inset-0" viewBox="0 0 100 100">
                    <defs>
                      <linearGradient id="courseProgressGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                        {overallProgress >= 100 ? (
                          <>
                            <stop offset="0%" stopColor="#34d399" />
                            <stop offset="50%" stopColor="#10b981" />
                            <stop offset="100%" stopColor="#047857" />
                          </>
                        ) : (
                          <>
                            <stop offset="0%" stopColor="#f87171" />
                            <stop offset="50%" stopColor="#ef4444" />
                            <stop offset="100%" stopColor="#b91c1c" />
                          </>
                        )}
                      </linearGradient>
                      <filter id="courseGlow" x="-20%" y="-20%" width="140%" height="140%">
                        <feGaussianBlur stdDeviation="3" result="blur" />
                        <feComposite in="SourceGraphic" in2="blur" operator="over" />
                      </filter>
                    </defs>

                    <motion.circle 
                      cx="50" cy="50" r="48" 
                      fill="none" stroke="currentColor" strokeWidth="0.5" strokeDasharray="3 3"
                      className="text-white/20"
                      animate={{ rotate: -360 }}
                      transition={{ duration: 40, repeat: Infinity, ease: "linear" }}
                      style={{ originX: "50px", originY: "50px" }}
                    />

                    <motion.circle 
                      cx="50" cy="50" r="38" 
                      fill="none" stroke="currentColor" strokeWidth="1.5" strokeDasharray="4 4"
                      className={overallProgress >= 100 ? "text-emerald-500/30" : "text-primary/30"}
                      animate={{ rotate: 360 }}
                      transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
                      style={{ originX: "50px", originY: "50px" }}
                    />

                    <circle cx="50" cy="50" r="44" fill="transparent" stroke="currentColor" strokeWidth="6" className="text-white/5" />
                    <motion.circle 
                      cx="50" cy="50" r="44"
                      fill="transparent" stroke="url(#courseProgressGradient)" strokeWidth="6" strokeLinecap="round"
                      strokeDasharray="276"
                      filter="url(#courseGlow)"
                      initial={{ strokeDashoffset: 276 }}
                      animate={{ strokeDashoffset: 276 - (276 * overallProgress) / 100 }}
                      transition={{ duration: 1.5, ease: "easeOut", delay: 0.2 }}
                    />
                  </svg>
                  {/* Progress % centered inside the circle */}
                  <span className={`absolute inset-0 flex items-center justify-center text-2xl font-black tracking-tight ${overallProgress >= 100 ? "text-emerald-400" : "text-white"}`}>
                    {overallProgress}%
                  </span>
                  {overallProgress >= 100 && (
                    <motion.div
                      initial={{ scale: 0, rotate: -45 }}
                      animate={{ scale: 1, rotate: 0 }}
                      className="absolute -top-1 -right-1 z-10 bg-emerald-500 rounded-full p-1.5 border-2 border-background shadow-[0_0_15px_rgba(16,185,129,0.5)]"
                    >
                      <CheckCircle2 className="w-4 h-4 text-white" />
                    </motion.div>
                  )}
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-6">
            {blocks.map((block, index) => (
              <div key={block.id} ref={index === currentStudyIndex ? currentStudyRef : undefined}>
                <DayBlock block={block} isCurrentStudy={index === currentStudyIndex} onChange={handleBlockChange} onItemComplete={handleItemComplete} />
              </div>
            ))}
            
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.3 }}
            >
              <Button 
                variant="glass" 
                size="lg" 
                className="w-full h-16 border-dashed border-2 bg-transparent hover:bg-white/5 text-foreground/40 hover:text-white group transition-all"
                onClick={handleAddDay}
              >
                <div className="flex items-center gap-2 group-hover:scale-105 transition-transform">
                  <div className="p-1 rounded-full bg-white/10 group-hover:bg-primary group-hover:text-white transition-colors">
                    <Plus className="w-5 h-5" />
                  </div>
                  <span className="font-semibold text-lg">Add New Day</span>
                </div>
              </Button>
            </motion.div>
          </div>

          <div className="space-y-6">
            {/* Share Section */}
            <div className="bg-white/5 border border-white/10 rounded-3xl p-6 glass">
              <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                <UserPlus className="w-5 h-5 text-primary" />
                Share Course
              </h3>
              <div className="space-y-4">
                <div className="flex gap-2">
                  <Input 
                    placeholder="Username..." 
                    value={shareUsername}
                    onChange={(e) => setShareUsername(e.target.value)}
                    className="bg-black/20 border-white/10 focus:border-primary/50 text-white"
                  />
                  <Button 
                    onClick={() => handleShare()}
                    disabled={sharing}
                    className="bg-primary hover:bg-primary/80 transition-all font-bold group"
                  >
                     {sharing ? "..." : "Invite"}
                  </Button>
                </div>

                {recentlySharedWith.length > 0 && (
                  <div className="space-y-2">
                    <p className="text-[10px] font-black uppercase tracking-widest text-white/30">Recently Shared With</p>
                    <div className="flex flex-wrap gap-2">
                      {recentlySharedWith.map(name => (
                        <button
                          key={name}
                          onClick={() => {
                            setShareUsername(name)
                            handleShare(name)
                          }}
                          disabled={sharing}
                          className="px-3 py-1 rounded-full bg-white/5 border border-white/5 hover:border-primary/30 hover:bg-primary/10 text-xs text-foreground/60 hover:text-primary transition-all flex items-center gap-1.5"
                        >
                          <UserPlus className="w-3 h-3" />
                          {name}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>

            <Leaderboard data={leaderboardData} loading={leaderboardLoading} />
          </div>
        </div>
      </div>

      <FocusMode />

      {/* Floating jump-to-current button */}
      <AnimatePresence>
        {showJumpButton && currentStudyIndex !== -1 && (
          <motion.button
            initial={{ opacity: 0, y: 20, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.9 }}
            transition={{ duration: 0.25, ease: 'easeOut' }}
            onClick={scrollToCurrentStudy}
            className="fixed bottom-12 left-1/2 -translate-x-1/2 md:left-auto md:translate-x-0 md:right-36 z-50 flex items-center gap-2.5 px-4 py-3 rounded-2xl bg-primary text-white font-bold text-sm shadow-[0_0_30px_rgba(255,31,31,0.4)] hover:bg-primary/90 hover:shadow-[0_0_40px_rgba(255,31,31,0.6)] active:scale-95 transition-all border border-primary/60 backdrop-blur-sm"
          >
            <Target className="w-4 h-4" />
            Current Day
            {jumpDirection === 'up' ? (
              <ArrowLeft className="w-4 h-4 rotate-90" />
            ) : (
              <ArrowLeft className="w-4 h-4 -rotate-90" />
            )}
          </motion.button>
        )}
      </AnimatePresence>
      
      <Modal 
        isOpen={modal.isOpen}
        onClose={() => setModal(prev => ({ ...prev, isOpen: false }))}
        title={modal.title}
        description={modal.description}
        type={modal.type}
      />

      <Modal 
        isOpen={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        title="Delete Course?"
        description={`Are you sure you want to delete "${course.title}"? This action cannot be undone and all progress will be lost.`}
        type="error"
        actionText="Delete Course"
        onAction={async () => {
          await deleteCourse(course.id)
          router.push('/')
        }}
      />
    </main>
  )
}
