"use client"

import * as React from "react"
import { motion, AnimatePresence } from "framer-motion"
import { useActivityLog, type DailyActivity } from "@/hooks/useActivityLog"
import { useAuth } from "@/lib/auth-context"
import { Flame, Trophy, Calendar, Zap, ChevronRight, Info } from "lucide-react"

const WEEKS = 12
const DAY_LABELS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"]
const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"]

function getLastNWeeks(n: number): string[] {
  const days: string[] = []
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const totalDays = n * 7
  for (let i = totalDays - 1; i >= 0; i--) {
    const d = new Date(today)
    d.setDate(d.getDate() - i)
    days.push(d.toISOString().split("T")[0])
  }
  return days
}

function getIntensity(xp: number): string {
  if (xp === 0) return "bg-white/5 border-white/5"
  if (xp <= 20) return "bg-primary/20 border-primary/20"
  if (xp <= 50) return "bg-primary/50 border-primary/40"
  if (xp <= 100) return "bg-primary/80 border-primary/60"
  return "bg-primary border-primary shadow-[0_0_15px_rgba(255,26,26,0.4)]"
}

export function ActivityHeatmap() {
  const { activityMap } = useActivityLog()
  const { user } = useAuth()
  const [tooltip, setTooltip] = React.useState<{ date: string; data: DailyActivity; x: number; y: number } | null>(null)
  const [mounted, setMounted] = React.useState(false)

  React.useEffect(() => {
    setMounted(true)
  }, [])

  const { days, weeks, monthLabels } = React.useMemo(() => {
    const days = getLastNWeeks(WEEKS)
    const firstDayDate = new Date(days[0])
    const firstDayOfWeek = firstDayDate.getDay()
    
    const weeks: string[][] = []
    let week: string[] = []
    
    // Pad first week
    for (let i = 0; i < firstDayOfWeek; i++) week.push("")
    for (const day of days) {
      week.push(day)
      if (week.length === 7) {
        weeks.push(week)
        week = []
      }
    }
    if (week.length > 0) {
      while (week.length < 7) week.push("")
      weeks.push(week)
    }

    const labels: { name: string; index: number }[] = []
    let lastMonth = -1
    weeks.forEach((wk, i) => {
      const firstValidDate = wk.find(d => d !== "")
      if (firstValidDate) {
        const d = new Date(firstValidDate)
        const month = d.getMonth()
        if (month !== lastMonth) {
          labels.push({ name: MONTHS[month], index: i })
          lastMonth = month
        }
      }
    })

    return { days, weeks, monthLabels: labels }
  }, [])

  const stats = React.useMemo(() => {
    let totalXP = 0
    let totalLessons = 0
    let activeDays = 0
    
    Object.values(activityMap).forEach(day => {
      if (typeof day === 'number') {
        totalXP += day * 10
        totalLessons += day
        if (day > 0) activeDays++
      } else {
        totalXP += day.xp
        totalLessons += day.count
        if (day.count > 0) activeDays++
      }
    })

    return { totalXP, totalLessons, activeDays }
  }, [activityMap])

  const todayISO = React.useMemo(() => new Date().toISOString().split("T")[0], [])

  if (!mounted) {
    return (
      <div className="bg-white/5 border border-white/10 rounded-3xl p-6 glass h-[280px] animate-pulse" />
    )
  }

  return (
    <div className="bg-white/5 border border-white/10 rounded-[2.5rem] p-8 glass relative group/heatmap overflow-hidden shadow-2xl">
      {/* Decorative Glow */}
      <div className="absolute -top-24 -right-24 w-64 h-64 bg-primary/5 blur-[100px] rounded-full pointer-events-none" />
      <div className="absolute -bottom-24 -left-24 w-64 h-64 bg-primary/5 blur-[100px] rounded-full pointer-events-none" />

      {/* Header & Stats Ribbon */}
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-10 gap-6">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Calendar className="w-4 h-4 text-primary" />
            <h3 className="text-xl font-black text-white tracking-tight uppercase">Activity Insights</h3>
          </div>
          <p className="text-xs text-foreground/40 font-bold uppercase tracking-widest pl-6">Deep focus analysis</p>
        </div>

        <div className="flex items-center gap-4">
          <StatBox 
            icon={<Flame className="w-4 h-4" />} 
            value={user?.streak || 0} 
            label="Day Streak" 
            color="text-orange-500"
          />
          <div className="w-px h-8 bg-white/10" />
          <StatBox 
            icon={<Zap className="w-4 h-4" />} 
            value={stats.totalXP} 
            label="Total XP" 
            color="text-yellow-400"
          />
          <div className="w-px h-8 bg-white/10" />
          <StatBox 
            icon={<Trophy className="w-4 h-4" />} 
            value={stats.totalLessons} 
            label="Videos" 
            color="text-primary"
          />
        </div>
      </div>

      <div className="relative overflow-x-auto pb-4 scrollbar-hide">
        <div className="min-w-max">
          {/* Month labels */}
          <div className="flex mb-3 ml-8 relative h-4">
            {monthLabels.map((lbl, i) => (
              <span 
                key={`${lbl.name}-${i}`} 
                className="absolute text-[10px] text-foreground/30 font-black uppercase tracking-[0.2em]"
                style={{ left: `${lbl.index * 1.25}rem` }}
              >
                {lbl.name}
              </span>
            ))}
          </div>

          <div className="flex flex-col gap-1.5">
            {Array.from({ length: 7 }).map((_, dayIdx) => (
              <div key={dayIdx} className="flex items-center gap-1.5">
                <span className="text-[10px] text-foreground/20 font-black w-7 text-right pr-2 tabular-nums">
                  {dayIdx % 2 === 1 ? DAY_LABELS[dayIdx] : ""}
                </span>
                {weeks.map((wk, wkIdx) => {
                  const date = wk[dayIdx]
                  const rawData = date ? activityMap[date] : null
                  const data = typeof rawData === 'number' 
                    ? { count: rawData, xp: rawData * 10, courses: {} } 
                    : (rawData || { count: 0, xp: 0, courses: {} })
                  
                  const isToday = date === todayISO
                  
                  return (
                    <motion.div
                      key={`${wkIdx}-${dayIdx}`}
                      initial={false}
                      whileHover={{ scale: 1.2, zIndex: 10 }}
                      onMouseEnter={(e: React.MouseEvent) => {
                        if (!date) return
                        const rect = e.currentTarget.getBoundingClientRect()
                        setTooltip({ 
                          date, 
                          data, 
                          x: rect.left + rect.width / 2, 
                          y: rect.top - 12 
                        })
                      }}
                      onMouseLeave={() => setTooltip(null)}
                      className={`w-[1.125rem] h-[1.125rem] rounded-[4px] border-[0.5px] cursor-pointer transition-all duration-300 ${
                        date ? getIntensity(data.xp) : "opacity-0 pointer-events-none"
                      } ${isToday ? "ring-2 ring-primary/50 shadow-[0_0_10px_rgba(255,31,31,0.3)]" : ""}`}
                    />
                  )
                })}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Advanced Legend */}
      <div className="flex items-center justify-between mt-8 pt-6 border-t border-white/5">
        <div className="flex items-center gap-3 text-xs text-foreground/30 font-bold uppercase tracking-widest">
          <Info className="w-3.5 h-3.5" />
          <span>Intensity based on daily XP</span>
        </div>
        
        <div className="flex items-center gap-2">
          <span className="text-[10px] text-foreground/20 font-bold uppercase tracking-wider mr-1">Cold</span>
          {[0, 20, 50, 80, 110].map((val, i) => (
            <div 
              key={i} 
              className={`w-3.5 h-3.5 rounded-[3px] border-[0.5px] ${getIntensity(val)}`} 
            />
          ))}
          <span className="text-[10px] text-foreground/20 font-bold uppercase tracking-wider ml-1">Blazing</span>
        </div>
      </div>

      {/* Advanced Deep Insights Tooltip */}
      <AnimatePresence>
        {tooltip && (
          <motion.div
            initial={{ opacity: 0, y: 10, scale: 0.95, x: '-50%' }}
            animate={{ opacity: 1, y: 0, scale: 1, x: '-50%' }}
            exit={{ opacity: 0, scale: 0.95, x: '-50%' }}
            style={{ 
              position: 'fixed', 
              left: tooltip.x, 
              top: tooltip.y,
            }}
            className="z-[100] w-64 bg-zinc-950/90 backdrop-blur-xl border border-white/10 rounded-2xl p-4 shadow-[0_20px_50px_rgba(0,0,0,0.5)] pointer-events-none"
          >
            <div className="flex items-center justify-between mb-3 border-b border-white/5 pb-2">
              <span className="text-xs font-black text-white uppercase tracking-wider">
                {new Date(tooltip.date).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
              </span>
              <div className="px-2 py-0.5 rounded-full bg-primary/10 border border-primary/20 text-[10px] font-black text-primary">
                +{tooltip.data.xp} XP
              </div>
            </div>

            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-[10px] text-foreground/40 font-bold uppercase tracking-widest">Lessons Watched</span>
                <span className="text-sm font-black text-white tabular-nums">{tooltip.data.count}</span>
              </div>

              {tooltip.data.courses && Object.keys(tooltip.data.courses).length > 0 && (
                <div className="space-y-1.5">
                  {Object.entries(tooltip.data.courses).map(([id, info]) => (
                    <div key={id} className="flex items-center gap-2 bg-white/5 rounded-lg p-2 border border-white/5">
                      <div className="w-1.5 h-1.5 rounded-full bg-primary shrink-0" />
                      <span className="text-[10px] text-white/80 font-bold truncate flex-1">{info.name}</span>
                      <span className="text-[10px] text-foreground/40 font-black shrink-0">x{info.count}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

function StatBox({ icon, value, label, color }: { icon: React.ReactNode; value: number | string; label: string; color: string }) {
  return (
    <div className="flex items-center gap-3">
      <div className={`w-8 h-8 rounded-xl bg-white/5 flex items-center justify-center ${color} border border-white/5`}>
        {icon}
      </div>
      <div className="flex flex-col">
        <span className="text-sm font-black text-white leading-none mb-0.5 tabular-nums">{value}</span>
        <span className="text-[9px] text-foreground/40 font-bold uppercase tracking-widest">{label}</span>
      </div>
    </div>
  )
}
