"use client"

import * as React from "react"
import { useParams, useRouter } from "next/navigation"
import Link from "next/link"
import { ArrowLeft, Clock, Calendar, Plus, Share2, X, UserPlus, CheckCircle2, Youtube, ExternalLink, ArrowRight, Trash2 } from "lucide-react"
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
import { NoteSection } from "@/components/course/NoteSection"
import { Modal } from "@/components/ui/Modal"
import { LoadingState } from "@/components/ui/LoadingState"

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
        <Link href="/">
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
      
      <div className="container mx-auto px-4 py-8 max-w-7xl relative z-10">
        <div className="flex items-center justify-between mb-8">
          <Link href="/" className="inline-flex items-center gap-2 text-foreground/40 hover:text-primary transition-colors group">
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
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-8 mb-8">
            <div className="space-y-4 flex-1">
              <h1 className="text-4xl md:text-6xl font-black text-white tracking-tighter drop-shadow-2xl leading-none">
                {course?.title}
              </h1>
              
              <div className="flex flex-col gap-3">
                <p className="text-foreground/40 text-lg font-medium">{course?.totalVideos} lessons total</p>
              </div>
            </div>
            
            <div className="flex items-center gap-6 shrink-0 bg-white/5 p-4 rounded-3xl border border-white/10 md:bg-transparent md:p-0 md:border-0 md:rounded-none">
              <div className="flex flex-col items-end">
                <span className="text-[10px] text-foreground/40 uppercase tracking-[0.2em] font-black mb-1">Course Progress</span>
                <span className={`text-3xl font-black tracking-tighter ${overallProgress >= 100 ? "text-emerald-400" : "text-white"}`}>
                  {overallProgress}%
                </span>
              </div>
              <div className={`h-16 w-16 md:h-20 md:w-20 rounded-full border-4 border-white/10 relative flex items-center justify-center transition-all duration-700 ${overallProgress >= 100 ? "shadow-[0_0_30px_rgba(16,185,129,0.3)] scale-110" : "shadow-[0_0_20px_rgba(255,31,31,0.1)]"}`}>
                  <svg className="w-full h-full transform -rotate-90 absolute inset-0" viewBox="0 0 100 100">
                    <circle cx="50" cy="50" r="44" fill="transparent" stroke="currentColor" strokeWidth="8" className="text-white/5" />
                    <motion.circle 
                      cx="50" 
                      cy="50" 
                      r="44" 
                      fill="transparent" 
                      stroke="currentColor" 
                      strokeWidth="8" 
                      strokeDasharray="276"
                      strokeDashoffset={276 - (276 * overallProgress) / 100}
                      className={overallProgress >= 100 ? "text-emerald-500" : "text-primary"}
                      initial={{ strokeDashoffset: 276 }}
                      animate={{ strokeDashoffset: 276 - (276 * overallProgress) / 100 }}
                      transition={{ duration: 1.5, ease: "circOut" }}
                    />
                  </svg>
                  {overallProgress >= 100 && (
                    <motion.div
                      initial={{ scale: 0, rotate: -45 }}
                      animate={{ scale: 1, rotate: 0 }}
                      className="absolute -top-1 -right-1 bg-emerald-500 rounded-full p-1.5 border-2 border-background shadow-[0_0_15px_rgba(16,185,129,0.5)]"
                    >
                      <CheckCircle2 className="w-4 h-4 text-white" />
                    </motion.div>
                  )}
              </div>
            </div>
          </div>

          <div className="flex items-center gap-4 text-sm font-medium text-foreground/60">
            <span className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/5 border border-white/5">
              <Clock className="w-4 h-4" />
              {course.totalVideos} Videos
            </span>
            <span className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/5 border border-white/5">
              <Calendar className="w-4 h-4" />
              {blocks.length} Days Planned
            </span>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-6">
            {blocks.map(block => (
              <DayBlock key={block.id} block={block} onChange={handleBlockChange} />
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

            <NoteSection courseId={courseId} />
          </div>
        </div>
      </div>

      <FocusMode />
      
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
