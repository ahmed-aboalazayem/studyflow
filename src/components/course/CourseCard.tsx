"use client"

import * as React from "react"
import Link from "next/link"
import Image from "next/image"
import { motion } from "framer-motion"
import { Card, CardContent } from "@/components/ui/card"
import { BookOpen, Clock, Trash2 } from "lucide-react"
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

export const CourseCard = React.memo(({ course }: CourseCardProps) => {
  const { deleteCourse } = useStore()
  const [showDeleteModal, setShowDeleteModal] = React.useState(false)

  const handleDelete = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setShowDeleteModal(true)
  }

  return (
    <Link href={`/course/${course.id}`}>
      <motion.div
        whileHover={{ y: -8, scale: 1.02 }}
        transition={{ type: "spring", stiffness: 300, damping: 20 }}
        className="will-change-transform"
      >
        <Card className="h-full border border-white/5 hover:border-primary/50 transition-all duration-500 shadow-xl hover:shadow-[0_0_40px_rgba(255,31,31,0.2)] bg-black/20 backdrop-blur-xl overflow-hidden group relative">
          {/* Subtle Glow Effect */}
          <div className="absolute -inset-0.5 bg-gradient-to-r from-primary/20 to-accent/20 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 blur will-change-opacity" />
          
          <div className="relative h-40 sm:h-48 w-full overflow-hidden bg-white/5">
            {course.imageUrl ? (
              <Image
                src={course.imageUrl}
                alt={course.title}
                fill
                className="object-cover transition-transform duration-700 group-hover:scale-110 will-change-transform"
              />
            ) : (
              <div className="absolute inset-0 flex items-center justify-center text-white/10">
                <BookOpen className="w-12 h-12 transition-transform duration-500 group-hover:rotate-12" />
              </div>
            )}
            <div className="absolute inset-0 bg-gradient-to-t from-background via-background/20 to-transparent" />
            
            {course.ownership !== 'shared' && (
              <button
                onClick={handleDelete}
                className="absolute top-3 right-3 p-2 rounded-xl bg-black/60 border border-white/10 text-white/40 hover:text-primary hover:bg-black/80 hover:border-primary/30 transition-all opacity-0 group-hover:opacity-100 z-20 backdrop-blur-md"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            )}
          </div>

          <CardContent className="p-6 relative bg-background/40">
            <h3 className="text-xl font-bold mb-4 text-white group-hover:text-primary transition-colors duration-300 truncate tracking-tight">
              {course.title}
            </h3>
            
            {course.ownership === 'shared' && (
              <div className="flex items-center gap-1.5 mb-2 px-2 py-0.5 rounded-md bg-accent/10 border border-accent/20 w-fit">
                <span className="text-[10px] font-bold text-accent uppercase tracking-wider">Shared by</span>
                <span className="text-[11px] font-bold text-white/80">{course.ownerName}</span>
              </div>
            )}
            
            <div className="flex items-center justify-between text-sm text-foreground/50 mb-4">
              <span className="flex items-center gap-2">
                <div className="p-1 rounded-md bg-primary/10">
                  <BookOpen className="w-3.5 h-3.5 text-primary" />
                </div>
                <span className="font-medium">{course.completedVideos} / {course.totalVideos}</span>
              </span>
              <span className="font-bold text-white tabular-nums">{course.progress}%</span>
            </div>

            <div className="w-full h-1.5 rounded-full bg-white/5 overflow-hidden relative">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${course.progress}%` }}
                transition={{ duration: 1.5, delay: 0.2, ease: [0.22, 1, 0.36, 1] }}
                className="absolute top-0 left-0 h-full bg-gradient-to-r from-primary to-accent shadow-[0_0_15px_rgba(255,31,31,0.5)] rounded-full"
              />
            </div>
          </CardContent>
        </Card>
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
    <Card className="h-full border border-white/5 bg-black/20 backdrop-blur-xl overflow-hidden animate-pulse">
      <div className="h-48 w-full bg-white/5" />
      <CardContent className="p-6 bg-background/40 space-y-4">
        <div className="h-7 w-3/4 bg-white/10 rounded-lg" />
        <div className="flex items-center justify-between">
          <div className="h-5 w-20 bg-white/5 rounded-lg" />
          <div className="h-5 w-10 bg-white/10 rounded-lg" />
        </div>
        <div className="w-full h-1.5 rounded-full bg-white/5" />
      </CardContent>
    </Card>
  )
}
