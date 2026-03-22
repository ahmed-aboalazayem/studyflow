"use client"

import * as React from "react"
import { useParams, useRouter } from "next/navigation"
import Link from "next/link"
import { ArrowLeft, Clock, Calendar, Plus, Share2, X, UserPlus } from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { DayBlock, type DayBlockData } from "@/components/course/DayBlock"
import { useStore } from "@/lib/store"
import { useAuth } from "@/lib/auth-context"
import { BackgroundEffect } from "@/components/ui/BackgroundEffect"

export default function CourseDetailPage() {
  const params = useParams()
  const router = useRouter()
  const { courses, courseDetails, addDayBlock, updateCourseBlocks } = useStore()
  const { user } = useAuth()

  const courseId = params.id as string
  const course = courses.find((c: any) => c.id === courseId)
  const blocks = courseDetails[courseId] || []

  const handleAddDay = async () => {
    await addDayBlock(courseId, `Day ${blocks.length + 1} - New Topic`)
  }

  const handleBlockChange = React.useCallback((updatedBlock: DayBlockData) => {
    updateCourseBlocks(courseId, blocks.map(b => b.id === updatedBlock.id ? updatedBlock : b))
  }, [blocks, courseId, updateCourseBlocks])

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

  return (
    <main className="relative min-h-screen">
      <BackgroundEffect />
      
      <div className="container mx-auto px-4 py-8 max-w-4xl relative z-10">
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
                <span className="text-2xl font-bold tracking-tight text-white">{overallProgress}%</span>
              </div>
              <div className="h-12 w-12 rounded-full border-4 border-white/10 relative flex items-center justify-center">
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
                      className="text-primary"
                      initial={{ strokeDashoffset: 289 }}
                      animate={{ strokeDashoffset: 289 - (289 * overallProgress) / 100 }}
                      transition={{ duration: 1, ease: "easeOut" }}
                    />
                 </svg>
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

        <div className="space-y-6">
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
              className="w-full h-16 border-dashed border-2 bg-transparent hover:bg-white/5 text-foreground/60 hover:text-white group transition-all"
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
      </div>
    </main>
  )
}
