"use client"

import * as React from "react"
import { useParams, useRouter } from "next/navigation"
import Link from "next/link"
import { ArrowLeft, Clock, Calendar, Plus, Share2, X, UserPlus, CheckCircle2 } from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { DayBlock, type DayBlockData } from "@/components/course/DayBlock"
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
  const { courses, courseDetails, addDayBlock, updateCourseBlocks, isLoaded } = useStore()
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

  if (isLoading || !isLoaded) {
    return (
      <main className="relative min-h-screen">
        <BackgroundEffect />
        <div className="container mx-auto px-4 py-20 relative z-10">
          <LoadingState />
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

  const overallProgress = course.progress || 0
  const [leaderboardData, setLeaderboardData] = React.useState<any[]>([])
  const [shareUsername, setShareUsername] = React.useState("")
  const [sharing, setSharing] = React.useState(false)
  const [modal, setModal] = React.useState<{ isOpen: boolean; title: string; description: string; type: "success" | "error" }>({
    isOpen: false,
    title: "",
    description: "",
    type: "success"
  })

  React.useEffect(() => {
    const fetchLeaderboard = async () => {
      const data = await getLeaderboard(courseId)
      setLeaderboardData(data)
    }
    fetchLeaderboard()
  }, [courseId, course.completedVideos]) // Refresh when progress changes

  const handleShare = async () => {
    if (!shareUsername.trim()) return
    setSharing(true)
    const result = await shareCourse(courseId, shareUsername)
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
        description: `Successfully shared "${course.title}" with ${shareUsername}.`,
        type: "success"
      })
      setShareUsername("")
    }
  }

  return (
    <main className="relative min-h-screen">
      <BackgroundEffect />
      
      <div className="container mx-auto px-4 py-8 max-w-7xl relative z-10">
        <Link href="/" className="inline-flex items-center gap-2 text-foreground/40 hover:text-primary transition-colors mb-8 group">
          <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
          Back to Dashboard
        </Link>

        <div className="mb-12">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-6">
            <div>
              <h1 className="text-4xl font-extrabold text-white tracking-tight mb-3">
                {course.title}
              </h1>
              <p className="text-foreground/60 max-w-2xl">{course.totalVideos} lessons total</p>
            </div>
            <div className="flex items-center gap-4 shrink-0">
              <div className="flex flex-col items-end">
                <span className="text-sm text-foreground/50 uppercase tracking-wider font-semibold mb-1">Overall</span>
                <span className={`text-2xl font-bold tracking-tight ${overallProgress >= 100 ? "text-emerald-400" : "text-white"}`}>
                  {overallProgress}%
                </span>
              </div>
              <div className={`h-14 w-14 rounded-full border-4 border-white/10 relative flex items-center justify-center transition-all duration-500 ${overallProgress >= 100 ? "shadow-[0_0_20px_rgba(16,185,129,0.4)] scale-110" : ""}`}>
                  <svg className="w-full h-full transform -rotate-90 absolute inset-0" viewBox="0 0 100 100">
                    <circle cx="50" cy="50" r="46" fill="transparent" stroke="currentColor" strokeWidth="8" className="text-white/5" />
                    <motion.circle 
                      cx="50" 
                      cy="50" 
                      r="46" 
                      fill="transparent" 
                      stroke="currentColor" 
                      strokeWidth="8" 
                      strokeDasharray="289"
                      strokeDashoffset={289 - (289 * overallProgress) / 100}
                      className={overallProgress >= 100 ? "text-emerald-500" : "text-primary"}
                      initial={{ strokeDashoffset: 289 }}
                      animate={{ strokeDashoffset: 289 - (289 * overallProgress) / 100 }}
                      transition={{ duration: 1.5, ease: "easeOut" }}
                    />
                  </svg>
                  {overallProgress >= 100 && (
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      className="absolute -top-1 -right-1 bg-emerald-500 rounded-full p-1 border-2 border-background shadow-lg"
                    >
                      <CheckCircle2 className="w-3 h-3 text-white" />
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
              <div className="flex gap-2">
                <Input 
                  placeholder="Username..." 
                  value={shareUsername}
                  onChange={(e) => setShareUsername(e.target.value)}
                  className="bg-black/20 border-white/10 focus:border-primary/50 text-white"
                />
                <Button 
                  onClick={handleShare}
                  disabled={sharing}
                  className="bg-primary hover:bg-primary/80 transition-all font-bold group"
                >
                   {sharing ? "..." : "Invite"}
                </Button>
              </div>
            </div>

            <Leaderboard data={leaderboardData} />

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
    </main>
  )
}
