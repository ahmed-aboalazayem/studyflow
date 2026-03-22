"use client"

import * as React from "react"
import { useRouter } from "next/navigation"
import { motion, type Variants } from "framer-motion"
import { Flame, Clock, Calendar, CheckCircle, TrendingUp, BookOpen } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import { useAuth } from "@/lib/auth-context"
import { useStore } from "@/lib/store"
import { BackgroundEffect } from "@/components/ui/BackgroundEffect"

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
}

export default function ProgressPage() {
  const { user } = useAuth()
  const { courses, courseDetails } = useStore()
  const router = useRouter()
  const [data, setData] = React.useState<ProgressData | null>(null)
  const [loading, setLoading] = React.useState(true)

  React.useEffect(() => {
    if (user && courses.length > 0) {
      // Calculate progress data locally
      const allItems = Object.values(courseDetails).flat().flatMap(b => b.items)
      const completedVideosCount = allItems.filter(i => i.completed).length
      const activeCoursesCount = courses.length
      
      let totalProgress = 0
      courses.forEach((c: any) => totalProgress += (c.progress || 0))
      const overallProgressCount = courses.length === 0 ? 0 : Math.round(totalProgress / courses.length)

      // Find most active course
      let mostActive: any = null
      let maxCompleted = -1
      courses.forEach((c: any) => {
        if (c.completedVideos > maxCompleted) {
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
        studyTime: "Mock 0h 0m", 
        streak: "Mock 1 Day",
        completedVideos: completedVideosCount,
        activeCourses: activeCoursesCount,
        overallProgress: overallProgressCount,
        heatmap: [], 
        mostActiveCourse: mostActive
      })
      setLoading(false)
    } else if (user && courses.length === 0) {
      setData({
        studyTime: "0h 0m",
        streak: "0 Days",
        completedVideos: 0,
        activeCourses: 0,
        overallProgress: 0,
        heatmap: [],
        mostActiveCourse: null
      })
      setLoading(false)
    }
  }, [user, courses, courseDetails])

  const containerVars: Variants = {
    hidden: { opacity: 0 },
    show: { opacity: 1, transition: { staggerChildren: 0.1 } }
  }

  const itemVars: Variants = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 300, damping: 24 } }
  }

  if (!user) return null

  const stats = [
    { label: "Study Time", value: data?.studyTime || "0h 0m", icon: Clock, color: "text-blue-400" },
    { label: "Current Streak", value: data?.streak || "0 Days", icon: Flame, color: "text-orange-400" },
    { label: "Completed Videos", value: String(data?.completedVideos || 0), icon: CheckCircle, color: "text-primary" },
    { label: "Active Courses", value: String(data?.activeCourses || 0), icon: BookOpen, color: "text-emerald-400" },
  ]

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
          <div className="flex items-center justify-center py-20">
            <div className="animate-spin w-8 h-8 border-2 border-primary border-t-transparent rounded-full" />
          </div>
        ) : (
          <>
            <motion.div 
              variants={containerVars}
              initial="hidden"
              animate="show"
              className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8"
            >
              {stats.map((stat, i) => {
                const Icon = stat.icon
                return (
                  <motion.div key={i} variants={itemVars}>
                    <Card className="bg-white/5 border-white/10 hover:bg-white/10 transition-colors">
                      <CardContent className="p-6">
                        <div className="flex items-center justify-between mb-4">
                          <div className={`p-3 rounded-xl bg-black/30 ${stat.color}`}>
                            <Icon className="w-6 h-6" />
                          </div>
                          {i === 1 && (
                            <span className="flex h-3 w-3 relative">
                              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-orange-400 opacity-75"></span>
                              <span className="relative inline-flex rounded-full h-3 w-3 bg-orange-500"></span>
                            </span>
                          )}
                        </div>
                        <h3 className="text-sm font-medium text-foreground/60 uppercase tracking-widest mb-1">{stat.label}</h3>
                        <p className="text-3xl font-bold text-white">{stat.value}</p>
                      </CardContent>
                    </Card>
                  </motion.div>
                )
              })}
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
