"use client"

import * as React from "react"
import Link from "next/link"
import Image from "next/image"
import { motion } from "framer-motion"
import { Card, CardContent } from "@/components/ui/card"
import { BookOpen, Clock } from "lucide-react"

export interface CourseData {
  id: string
  title: string
  imageUrl: string
  progress: number
  totalVideos: number
  completedVideos: number
  ownership?: 'owned' | 'shared'
  ownerName?: string | null
}

interface CourseCardProps {
  course: CourseData
}

export function CourseCard({ course }: CourseCardProps) {
  return (
    <Link href={`/course/${course.id}`}>
      <motion.div
        whileHover={{ y: -8, scale: 1.02 }}
        transition={{ type: "spring", stiffness: 300, damping: 20 }}
      >
        <Card className="h-full border border-white/5 hover:border-primary/50 transition-all duration-500 shadow-xl hover:shadow-[0_0_40px_rgba(255,31,31,0.2)] bg-white/[0.02] glass overflow-hidden group">
          <div className="relative h-48 w-full overflow-hidden bg-white/5">
            {course.imageUrl ? (
              <Image
                src={course.imageUrl}
                alt={course.title}
                fill
                className="object-cover transition-transform duration-500 group-hover:scale-110"
              />
            ) : (
              <div className="absolute inset-0 flex items-center justify-center text-white/20">
                <BookOpen className="w-12 h-12" />
              </div>
            )}
            <div className="absolute inset-0 bg-gradient-to-t from-background to-transparent" />
          </div>

          <CardContent className="p-5 relative">
            <h3 className="text-xl font-bold mb-3 text-white truncate">{course.title}</h3>
            
            <div className="flex items-center justify-between text-sm text-foreground/60 mb-4">
              <span className="flex items-center gap-1.5">
                <BookOpen className="w-4 h-4 text-primary" />
                {course.completedVideos} / {course.totalVideos} videos
              </span>
              <span className="font-medium text-white">{course.progress}%</span>
            </div>

            <div className="w-full h-2 rounded-full bg-white/10 overflow-hidden relative">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${course.progress}%` }}
                transition={{ duration: 1, delay: 0.1, ease: "easeOut" }}
                className="absolute top-0 left-0 h-full bg-gradient-to-r from-primary to-accent shadow-[0_0_15px_rgba(255,31,31,0.5)] rounded-full"
              />
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </Link>
  )
}
