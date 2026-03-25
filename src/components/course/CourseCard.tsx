"use client"

import * as React from "react"
import Link from "next/link"
import Image from "next/image"
import { motion } from "framer-motion"
import { BookOpen, CheckCircle2, Clock, Share2, Trash2 } from "lucide-react"
import { useStore } from "@/lib/store"
import { Modal } from "@/components/ui/Modal"

export interface CourseData {
  id: string
  title: string
  imageUrl: string
  progress: number
  totalVideos: number
  completedVideos: number
  totalTimeSeconds?: number
  completedTimeSeconds?: number
  ownership?: 'owned' | 'shared'
  ownerName?: string | null
}

interface CourseCardProps {
  course: CourseData
}

function formatTime(seconds: number): string {
  if (!seconds || seconds <= 0) return "0m"
  const h = Math.floor(seconds / 3600)
  const m = Math.floor((seconds % 3600) / 60)
  if (h > 0 && m > 0) return `${h}h ${m}m`
  if (h > 0) return `${h}h`
  return `${m}m`
}

const RING_R = 20
const RING_CIRC = 2 * Math.PI * RING_R // ≈ 125.7

export const CourseCard = React.memo(({ course }: CourseCardProps) => {
  const { deleteCourse } = useStore()
  const [showDeleteModal, setShowDeleteModal] = React.useState(false)

  const handleDelete = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setShowDeleteModal(true)
  }

  const isComplete = course.progress >= 100
  const dashOffset = RING_CIRC - (RING_CIRC * Math.min(course.progress, 100)) / 100

  const totalTime = course.totalTimeSeconds ? formatTime(course.totalTimeSeconds) : null
  const studiedTime = course.completedTimeSeconds ? formatTime(course.completedTimeSeconds) : null

  return (
    <Link href={`/course/${course.id}`}>
      <motion.div
        whileHover={{ y: -6, scale: 1.015 }}
        transition={{ type: "spring", stiffness: 300, damping: 22 }}
        className="will-change-transform h-full"
      >
        <div className="h-full flex flex-col rounded-2xl border border-white/8 bg-black/30 backdrop-blur-xl overflow-hidden group relative shadow-xl hover:shadow-[0_8px_40px_rgba(255,31,31,0.18)] hover:border-primary/40 transition-all duration-200">

          {/* Hover glow */}
          <div className="absolute -inset-px rounded-2xl bg-gradient-to-br from-primary/15 via-transparent to-accent/10 opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none z-0" />

          {/* Thumbnail */}
          <div className="relative h-44 w-full overflow-hidden bg-white/5 shrink-0">
            {course.imageUrl ? (
              <Image
                src={course.imageUrl}
                alt={course.title}
                fill
                className="object-cover transition-transform duration-300 group-hover:scale-108 will-change-transform"
              />
            ) : (
              <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-primary/5 to-accent/5">
                <BookOpen className="w-14 h-14 text-white/10 transition-transform duration-500 group-hover:rotate-6" />
              </div>
            )}
            {/* Bottom fade */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />

            {/* Shared badge */}
            {course.ownership === 'shared' && (
              <div className="absolute top-3 left-3 flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-accent/20 border border-accent/30 backdrop-blur-md z-10">
                <Share2 className="w-3 h-3 text-accent" />
                <span className="text-[10px] font-bold text-accent uppercase tracking-wider">Shared</span>
                {course.ownerName && (
                  <span className="text-[10px] text-white/70 font-medium">· {course.ownerName}</span>
                )}
              </div>
            )}

            {/* Delete button */}
            {course.ownership !== 'shared' && (
              <button
                onClick={handleDelete}
                className="absolute top-3 right-3 p-2 rounded-xl bg-black/60 border border-white/10 text-white/40 hover:text-primary hover:bg-black/80 hover:border-primary/30 transition-all opacity-0 group-hover:opacity-100 z-20 backdrop-blur-md"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            )}

            {/* Completed badge */}
            {isComplete && (
              <div className="absolute bottom-3 left-3 flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-500/20 border border-emerald-500/30 backdrop-blur-md z-10">
                <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                <span className="text-[10px] font-bold text-emerald-400 uppercase tracking-wider">Completed</span>
              </div>
            )}
          </div>

          {/* Body */}
          <div className="flex flex-col flex-1 p-5 gap-4 relative z-10">

            {/* Title */}
            <h3 className="text-base font-bold text-white group-hover:text-primary transition-colors duration-200 line-clamp-2 leading-snug tracking-tight">
              {course.title}
            </h3>

            {/* Stats row */}
            <div className="flex items-center gap-3 text-xs text-foreground/50 font-medium mt-auto">
              <span className="flex items-center gap-1.5">
                <BookOpen className="w-3.5 h-3.5 text-primary/70" />
                {course.completedVideos}/{course.totalVideos} lessons
              </span>
              {studiedTime && (
                <>
                  <span className="w-px h-3 bg-white/10" />
                  <span className="flex items-center gap-1.5">
                    <Clock className="w-3.5 h-3.5 text-primary/70" />
                    {studiedTime}
                    {totalTime && <span className="text-foreground/30">/ {totalTime}</span>}
                  </span>
                </>
              )}
            </div>

            {/* Progress row: bar + ring */}
            <div className="flex items-center gap-3">
              {/* Bar */}
              <div className="flex-1 h-1.5 rounded-full bg-white/5 overflow-hidden">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${course.progress}%` }}
                  transition={{ duration: 1.2, delay: 0.15, ease: [0.22, 1, 0.36, 1] }}
                  className={`h-full rounded-full shadow-[0_0_10px_rgba(255,31,31,0.4)] ${
                    isComplete
                      ? "bg-gradient-to-r from-emerald-400 to-emerald-600 shadow-[0_0_10px_rgba(16,185,129,0.4)]"
                      : "bg-gradient-to-r from-primary to-accent"
                  }`}
                />
              </div>

              {/* Mini ring */}
              <div className="relative shrink-0 w-11 h-11 flex items-center justify-center">
                <svg className="w-full h-full -rotate-90" viewBox="0 0 50 50">
                  <circle cx="25" cy="25" r={RING_R} fill="none" stroke="currentColor" strokeWidth="4" className="text-white/8" />
                  <motion.circle
                    cx="25" cy="25" r={RING_R}
                    fill="none"
                    stroke={isComplete ? "url(#completeGrad)" : "url(#progressGrad)"}
                    strokeWidth="4"
                    strokeLinecap="round"
                    strokeDasharray={RING_CIRC}
                    initial={{ strokeDashoffset: RING_CIRC }}
                    animate={{ strokeDashoffset: dashOffset }}
                    transition={{ duration: 1.2, delay: 0.2, ease: [0.22, 1, 0.36, 1] }}
                  />
                  <defs>
                    <linearGradient id="progressGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                      <stop offset="0%" stopColor="#f87171" />
                      <stop offset="100%" stopColor="#b91c1c" />
                    </linearGradient>
                    <linearGradient id="completeGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                      <stop offset="0%" stopColor="#34d399" />
                      <stop offset="100%" stopColor="#059669" />
                    </linearGradient>
                  </defs>
                </svg>
                <span className={`absolute text-[10px] font-black tabular-nums ${isComplete ? "text-emerald-400" : "text-white"}`}>
                  {course.progress}%
                </span>
              </div>
            </div>
          </div>
        </div>
      </motion.div>

      <Modal
        isOpen={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        title="Delete Course?"
        description={`Are you sure you want to delete "${course.title}"? This action cannot be undone and all progress will be lost.`}
        type="error"
        actionText="Delete Course"
        onAction={() => deleteCourse(course.id)}
      />
    </Link>
  )
})

export function CourseCardSkeleton() {
  return (
    <div className="h-full flex flex-col rounded-2xl border border-white/5 bg-black/20 backdrop-blur-xl overflow-hidden animate-pulse">
      <div className="h-44 w-full bg-white/5 shrink-0" />
      <div className="flex flex-col flex-1 p-5 gap-4">
        <div className="h-5 w-3/4 bg-white/10 rounded-lg" />
        <div className="h-4 w-1/2 bg-white/5 rounded-lg" />
        <div className="flex items-center gap-3 mt-auto">
          <div className="flex-1 h-1.5 rounded-full bg-white/5" />
          <div className="w-11 h-11 rounded-full bg-white/5" />
        </div>
      </div>
    </div>
  )
}
