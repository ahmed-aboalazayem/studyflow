"use client"

import * as React from "react"
import { motion } from "framer-motion"
import { Clock, Flame, Play, BookOpen, CheckCircle2 } from "lucide-react"

interface CardProps {
  children: React.ReactNode
  className?: string
}

const CardBase = ({ children, className = "" }: CardProps) => (
  <div className={`glass border border-white/10 rounded-[40px] p-8 relative overflow-hidden h-full ${className}`}>
    {children}
  </div>
)

/* 1. Study Time Card */
export function StudyTimeCard({ value }: { value: string }) {
  return (
    <CardBase className="flex flex-col justify-between">
      <div className="flex flex-col gap-6">
        <div className="w-12 h-12 bg-black rounded-2xl flex items-center justify-center text-blue-500 shadow-inner">
          <Clock className="w-6 h-6" />
        </div>
        <div>
          <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-white/40 mb-1">Study Time</h3>
          <div className="text-4xl font-black text-white tracking-tight">{value}</div>
        </div>
      </div>
      
      {/* Visual Component: Clock Gauge */}
      <div className="absolute right-[-20px] top-1/2 -translate-y-1/2 w-48 h-48 opacity-40">
        <svg viewBox="0 0 100 100" className="w-full h-full">
          {/* Outer Ring Ticks */}
          {[...Array(60)].map((_, i) => (
            <motion.line
              key={i}
              x1="50" y1="5" x2="50" y2="10"
              transform={`rotate(${i * 6} 50 50)`}
              stroke="white"
              strokeWidth="1"
              initial={{ opacity: 0.1 }}
              animate={{ opacity: i % 5 === 0 ? 0.8 : 0.3 }}
              transition={{ delay: i * 0.01 }}
            />
          ))}
          {/* Inner Circle */}
          <circle cx="50" cy="50" r="30" fill="none" stroke="white" strokeWidth="0.5" strokeDasharray="2 2" />
          <motion.circle 
            cx="75" cy="50" r="8" fill="#3b82f6" fillOpacity="0.2" stroke="#3b82f6" strokeWidth="1"
            animate={{ rotate: 360 }}
            transition={{ duration: 60, repeat: Infinity, ease: "linear" }}
            style={{ originX: "50px", originY: "50px" }}
          />
          <text x="75" y="52" fontSize="7" fontWeight="bold" fill="white" textAnchor="middle" transform="rotate(-360)">{value}</text>
        </svg>
      </div>
    </CardBase>
  )
}

/* 2. Streak Card */
export function StreakCard({ days }: { days: string }) {
  const dayCount = parseInt(days) || 0
  
  return (
    <CardBase className="flex flex-col justify-between">
      <div className="flex flex-col gap-6">
        <div className="w-12 h-12 bg-black rounded-2xl flex items-center justify-center text-orange-500 shadow-inner">
          <Flame className="w-6 h-6" />
        </div>
        <div>
          <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-white/40 mb-1">Current Streak</h3>
          <div className="text-4xl font-black text-white tracking-tight">{days}</div>
        </div>
      </div>

      {/* Visual Component: Stacked 3D Rings */}
      <div className="absolute right-4 bottom-4 w-32 h-32 flex flex-col items-center justify-center">
        <div className="relative">
          {[...Array(8)].map((_, i) => (
             <motion.div
               key={i}
               initial={{ opacity: 0, scale: 0.5, y: 0 }}
               animate={{ opacity: 1 - i * 0.1, scale: 1 - i * 0.05, y: i * -6 }}
               transition={{ delay: i * 0.1 }}
               className="w-24 h-6 border-b-2 border-orange-500/30 rounded-[100%] absolute left-1/2 -translate-x-1/2 bottom-0"
               style={{ background: `linear-gradient(to bottom, transparent, rgba(249, 115, 22, ${0.1 - i * 0.01}))` }}
             />
          ))}
          <motion.div 
            animate={{ y: [0, -10, 0] }}
            transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
            className="absolute left-[30px] bottom-[60px] w-6 h-6 rounded-full bg-orange-600 shadow-[0_0_20px_rgba(249,115,22,0.8)] border border-orange-400"
          />
          <div className="absolute left-[20px] bottom-[50px] bg-black/80 text-[8px] font-black text-white px-2 py-1 rounded-md border border-white/10 uppercase">
            {dayCount}d
          </div>
        </div>
      </div>
    </CardBase>
  )
}

/* 3. Activity Feed Card */
export function ActivityCard({ count, recent }: { count: number, recent: any[] }) {
  return (
    <CardBase className="flex flex-col">
      <div className="flex items-center gap-4 mb-8">
        <div className="w-10 h-10 bg-black rounded-xl flex items-center justify-center text-red-500">
          <CheckCircle2 className="w-5 h-5" />
        </div>
        <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-white/60">Completed Videos</h3>
      </div>

      <div className="flex-1" />

      <div className="mt-6">
        <span className="text-5xl font-black text-white tracking-tighter">{count}</span>
      </div>
    </CardBase>
  )
}

/* 4. Active Courses Card */
export function ActiveCoursesCard({ count, courses }: { count: number, courses: any[] }) {
  return (
    <CardBase className="flex flex-col">
      <div className="flex items-center gap-4 mb-8">
        <div className="w-10 h-10 bg-black rounded-xl flex items-center justify-center text-emerald-500">
          <BookOpen className="w-5 h-5" />
        </div>
        <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-white/60">Active Courses</h3>
      </div>

      <div className="flex-1 space-y-4">
        {courses.slice(0, 4).map((course, i) => (
          <div key={i} className="space-y-1.5 px-1">
             <div className="flex items-center justify-between text-[11px] font-bold">
               <span className="text-white/80 truncate max-w-[140px]">{course.title}</span>
               <span className="text-white/30">{course.progress}%</span>
             </div>
             <div className="h-1 bg-white/5 rounded-full overflow-hidden">
                <motion.div 
                   initial={{ width: 0 }}
                   animate={{ width: `${course.progress}%` }}
                   className="h-full bg-emerald-500/60 rounded-full"
                />
             </div>
          </div>
        ))}
      </div>

      <div className="mt-2 flex items-center gap-6">
        <span className="text-5xl font-black text-white tracking-tighter">{count}</span>
        <div className="w-10 h-10 bg-black rounded-xl flex items-center justify-center text-emerald-500 border border-white/5">
           <Play className="w-5 h-5 fill-current" />
        </div>
      </div>
    </CardBase>
  )
}
