"use client"

import * as React from "react"
import { useRouter } from "next/navigation"
import { motion, type Variants } from "framer-motion"
import { Flame, Clock, Calendar, CheckCircle, TrendingUp, BookOpen } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import { useAuth } from "@/lib/auth-context"
import { useStore } from "@/lib/store"
import { BackgroundEffect } from "@/components/ui/BackgroundEffect"
import { LoadingState } from "@/components/ui/LoadingState"

import { parseDurationToSeconds, formatSecondsToFriendly } from "@/lib/utils"
import { StudyTimeCard, StreakCard, ActivityCard, ActiveCoursesCard } from "@/components/ui/StatsCards"

interface ProgressData {
  studyTime: string
  streak: string
  completedVideos: number
  activeCourses: number
  overallProgress: number
  heatmap: { date: string; intensity: number; count: number }[]
  mostActiveCourse: {
    id: string
    title: string
    imageUrl: string
    completedCount: number
    totalItems: number
    progress: number
  } | null
  recentActivity: { title: string; timeLabel: string }[]
}

// Helper to get date string YYYY-MM-DD
const getDateStr = (date: Date) => date.toISOString().split('T')[0]

const itemVars: Variants = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { type: "spring" as const, stiffness: 300, damping: 24 } }
}

export default function ProgressPage() {
  const { user } = useAuth()
  const { courses, courseDetails } = useStore()
  const router = useRouter()
  const [data, setData] = React.useState<ProgressData | null>(null)
  const [loading, setLoading] = React.useState(true)

  // Helper for relative time
  const getRelativeTime = (date: Date) => {
    const now = new Date()
    const diffInSeconds = Math.floor((now.getTime() - new Date(date).getTime()) / 1000)
    if (diffInSeconds < 60) return "just now"
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`
    if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h ago`
    return new Date(date).toLocaleDateString()
  }

  React.useEffect(() => {
    if (user) {
      const allItems = Object.values(courseDetails).flat().flatMap(b => b.items)
      const completedItems = [...allItems].filter(i => i.completed)
        .sort((a, b) => new Date(b.updatedAt!).getTime() - new Date(a.updatedAt!).getTime())
      
      const recentActivity = completedItems.slice(0, 3).map(item => ({
        title: item.title,
        timeLabel: item.updatedAt ? getRelativeTime(new Date(item.updatedAt)) : "just now"
      }))

      // 1. Study Time
      const totalSeconds = completedItems.reduce((acc, i) => acc + parseDurationToSeconds(i.duration), 0)
      const studyTime = formatSecondsToFriendly(totalSeconds)

      // 2. Heatmap & completions by day
      const completionsByDay: Record<string, number> = {}
      completedItems.forEach(i => {
        if (i.updatedAt) {
          const d = getDateStr(new Date(i.updatedAt))
          completionsByDay[d] = (completionsByDay[d] || 0) + 1
        }
      })

      const heatmap = []
      const now = new Date()
      for (let i = 27; i >= 0; i--) {
        const d = new Date(now)
        d.setDate(d.getDate() - i)
        const dStr = getDateStr(d)
        const count = completionsByDay[dStr] || 0
        heatmap.push({
          date: dStr,
          count,
          intensity: count === 0 ? 0 : count === 1 ? 1 : count <= 3 ? 2 : 3
        })
      }

      // 3. Streak
      let streakCount = 0
      let checkDate = new Date()
      while (true) {
        const dStr = getDateStr(checkDate)
        if (completionsByDay[dStr]) {
          streakCount++
          checkDate.setDate(checkDate.getDate() - 1)
        } else {
          if (streakCount === 0) {
             const yesterday = new Date()
             yesterday.setDate(yesterday.getDate() - 1)
             const yStr = getDateStr(yesterday)
             if (completionsByDay[yStr]) {
                checkDate = yesterday
                continue
             }
          }
          break
        }
      }

      // 4. Other stats
      const activeCoursesCount = courses.length
      let totalProgress = 0
      courses.forEach((c: any) => totalProgress += (c.progress || 0))
      const overallProgressCount = courses.length === 0 ? 0 : Math.round(totalProgress / courses.length)

      let mostActive: any = null
      let maxCompleted = -1
      courses.forEach((c: any) => {
        if (c.completedVideos >= maxCompleted && c.totalVideos > 0) {
          maxCompleted = c.completedVideos
          mostActive = {
            id: c.id,
            title: c.title,
            imageUrl: c.imageUrl,
            completedCount: c.completedVideos,
            totalItems: c.totalVideos,
            progress: c.progress
          }
        }
      })

      setData({
        studyTime,
        streak: `${streakCount} Day${streakCount !== 1 ? 's' : ''}`,
        completedVideos: completedItems.length,
        activeCourses: activeCoursesCount,
        overallProgress: overallProgressCount,
        heatmap,
        mostActiveCourse: mostActive,
        recentActivity
      } as any)
      setLoading(false)
    }
  }, [user, courses, courseDetails])

  if (!user) return null

  const heatmapData = data?.heatmap || []
  const overallProgress = data?.overallProgress || 0

  return (
    <main className="relative min-h-screen">
      <BackgroundEffect />
      
      <div className="container mx-auto px-4 py-8 relative z-10">
        <div className="mb-10">
          <h1 className="text-4xl font-black text-gradient tracking-tighter mb-2">My Progress</h1>
          <p className="text-foreground/40">Track your learning journey and study streaks.</p>
        </div>

        {loading ? (
          <LoadingState />
        ) : (
          <>
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8"
            >
              <StudyTimeCard value={data?.studyTime || "0m"} />
              <StreakCard days={data?.streak || "0 Days"} />
              <ActivityCard 
                count={data?.completedVideos || 0} 
                recent={(data as any)?.recentActivity || []} 
              />
              <ActiveCoursesCard 
                count={data?.activeCourses || 0} 
                courses={courses} 
              />
            </motion.div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Overall */}
              <motion.div variants={itemVars} initial="hidden" animate="show" className="lg:col-span-1">
                <Card className="h-full bg-white/5 border-white/10 flex flex-col items-center justify-center p-8 relative overflow-hidden">
                  <div className="absolute top-0 right-0 w-64 h-64 bg-primary/20 rounded-full blur-[80px] -translate-y-1/2 translate-x-1/2" />
                  <h3 className="text-lg font-semibold text-white mb-8 w-full text-left">Overall Completion</h3>
                  <div className="relative w-48 h-48 flex items-center justify-center mb-6">
                    <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
                      <circle cx="50" cy="50" r="46" fill="transparent" stroke="currentColor" strokeWidth="8" className="text-white/10" />
                      <motion.circle 
                        cx="50" cy="50" r="46"
                        fill="transparent" stroke="currentColor" strokeWidth="8"
                        strokeDasharray="289"
                        className="text-primary drop-shadow-[0_0_15px_rgba(255,31,31,0.5)]"
                        initial={{ strokeDashoffset: 289 }}
                        animate={{ strokeDashoffset: 289 - (289 * overallProgress) / 100 }}
                        transition={{ duration: 1.5, ease: "easeOut", delay: 0.5 }}
                      />
                    </svg>
                    <div className="absolute inset-0 flex flex-col items-center justify-center">
                      <span className="text-5xl font-black text-white">{overallProgress}%</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-center text-foreground/80 bg-black/20 px-4 py-2 rounded-full border border-white/5">
                    <TrendingUp className="w-4 h-4 text-emerald-400" />
                    <span>Keep going!</span>
                  </div>
                </Card>
              </motion.div>

              {/* Heatmap & Most Active */}
              <motion.div variants={itemVars} initial="hidden" animate="show" className="lg:col-span-2 space-y-8">
                <Card className="bg-white/5 border-white/10 p-6">
                  <div className="flex items-center justify-between mb-6">
                    <h3 className="text-lg font-semibold text-white">Study Activity (Last 4 Weeks)</h3>
                    <div className="flex items-center gap-2 text-xs text-foreground/60">
                      <span>Less</span>
                      <div className="flex gap-1">
                        <div className="w-3 h-3 rounded-sm bg-white/5" />
                        <div className="w-3 h-3 rounded-sm bg-primary/30" />
                        <div className="w-3 h-3 rounded-sm bg-primary/60" />
                        <div className="w-3 h-3 rounded-sm bg-primary" />
                      </div>
                      <span>More</span>
                    </div>
                  </div>
                  <div className="grid grid-flow-col grid-rows-7 gap-2 overflow-x-auto pb-4">
                    {heatmapData.map((day, i) => (
                      <div 
                        key={i}
                        className={`w-6 h-6 rounded-sm transition-colors cursor-pointer hover:ring-2 hover:ring-white/50 ${
                          day.intensity === 0 ? 'bg-white/5' :
                          day.intensity === 1 ? 'bg-primary/30' :
                          day.intensity === 2 ? 'bg-primary/60 shadow-[0_0_8px_rgba(255,31,31,0.3)]' :
                          'bg-primary shadow-[0_0_12px_rgba(255,31,31,0.6)]'
                        }`}
                        title={`${day.date}: ${day.count} completed`}
                      />
                    ))}
                  </div>
                </Card>

                {data?.mostActiveCourse ? (
                  <Card className="bg-gradient-to-br from-primary/10 to-accent/10 border-white/10 p-6 overflow-hidden relative">
                    <div className="absolute right-0 top-0 w-32 h-32 bg-primary/30 blur-3xl opacity-50" />
                    <h3 className="text-lg font-semibold text-white mb-4">Most Active Course</h3>
                    <div className="flex items-center gap-6">
                      <div className="w-20 h-20 rounded-xl bg-black/40 flex items-center justify-center shrink-0 border border-white/10 shadow-lg">
                        <BookOpen className="w-10 h-10 text-primary" />
                      </div>
                      <div>
                        <h4 className="text-xl font-bold text-white mb-1">{data.mostActiveCourse.title}</h4>
                        <p className="text-foreground/80 mb-3">{data.mostActiveCourse.completedCount} videos completed</p>
                        <div className="flex items-center gap-4 text-sm font-medium">
                          <span className="text-primary">{data.mostActiveCourse.progress}% Complete</span>
                        </div>
                      </div>
                    </div>
                  </Card>
                ) : (
                  <Card className="bg-white/5 border-white/10 p-6">
                    <h3 className="text-lg font-semibold text-white mb-2">Most Active Course</h3>
                    <p className="text-foreground/40">Complete some videos to see your most active course here!</p>
                  </Card>
                )}
              </motion.div>
            </div>
          </>
        )}
      </div>
    </main>
  )
}
