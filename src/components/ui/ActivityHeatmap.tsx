"use client"

import * as React from "react"
import { motion, AnimatePresence } from "framer-motion"
import { useActivityLog } from "@/hooks/useActivityLog"

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

function getIntensity(count: number): string {
  if (count === 0) return "bg-white/5 border-white/5"
  if (count <= 2) return "bg-primary/20 border-primary/20"
  if (count <= 5) return "bg-primary/50 border-primary/40"
  if (count <= 9) return "bg-primary/80 border-primary/60"
  return "bg-primary border-primary shadow-[0_0_15px_rgba(255,26,26,0.4)]"
}

export function ActivityHeatmap() {
  const { activityMap } = useActivityLog()
  const [tooltip, setTooltip] = React.useState<{ date: string; count: number; x: number; y: number } | null>(null)
  const [mounted, setMounted] = React.useState(false)

  React.useEffect(() => {
    setMounted(true)
  }, [])

  const { days, weeks, monthLabels } = React.useMemo(() => {
    const days = getLastNWeeks(WEEKS)
    const firstDayOfWeek = new Date(days[0]).getDay()
    
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

    // Month labels logic - more robust version
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

  const windowActivity = React.useMemo(() => {
    if (!mounted) return 0
    return days.reduce((acc: number, date: string) => acc + (activityMap[date] || 0), 0)
  }, [days, activityMap, mounted])

  const todayISO = React.useMemo(() => new Date().toISOString().split("T")[0], [])

  if (!mounted) {
    return (
      <div className="bg-white/5 border border-white/10 rounded-3xl p-6 glass h-[250px] animate-pulse" />
    )
  }

  return (
    <div className="bg-white/5 border border-white/10 rounded-3xl p-6 glass relative group/heatmap">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-base font-bold text-white mb-0.5">Your Study Activity</h3>
          <p className="text-[10px] text-foreground/40 font-medium">Activity in the last {WEEKS} weeks</p>
        </div>
        <div className="flex flex-col items-end">
          <span className="text-primary text-lg font-bold leading-none">{windowActivity}</span>
          <span className="text-foreground/30 text-[10px] font-medium uppercase tracking-wider">Videos Watched</span>
        </div>
      </div>

      <div className="relative overflow-x-auto pb-2 scrollbar-hide">
        <div className="min-w-max">
          {/* Month labels */}
          <div className="flex mb-2 ml-8 relative h-4">
            {monthLabels.map((lbl: { name: string; index: number }, i: number) => (
              <span 
                key={`${lbl.name}-${i}`} 
                className="absolute text-[9px] text-foreground/30 font-bold uppercase tracking-tighter"
                style={{ left: `${lbl.index * 1.125}rem` }}
              >
                {lbl.name}
              </span>
            ))}
          </div>

          <div className="flex flex-col gap-1">
            {Array.from({ length: 7 }).map((_, dayIdx: number) => (
              <div key={dayIdx} className="flex items-center gap-1">
                <span className="text-[9px] text-foreground/20 font-bold w-7 text-right pr-1.5 tabular-nums">
                  {dayIdx % 2 === 1 ? DAY_LABELS[dayIdx] : ""}
                </span>
                {weeks.map((wk: string[], wkIdx: number) => {
                  const date = wk[dayIdx]
                  const count = date ? (activityMap[date] || 0) : 0
                  const isToday = date === todayISO
                  
                  return (
                    <motion.div
                      key={`${wkIdx}-${dayIdx}`}
                      onMouseEnter={(e: React.MouseEvent) => {
                        if (!date) return
                        const rect = e.currentTarget.getBoundingClientRect()
                        setTooltip({ 
                          date, 
                          count, 
                          x: rect.left + rect.width / 2, 
                          y: rect.top - 10 
                        })
                      }}
                      onMouseLeave={() => setTooltip(null)}
                      className={`w-3.5 h-3.5 rounded-[3px] border-[0.5px] cursor-pointer transition-all duration-300 ${
                        date ? getIntensity(count) : "opacity-0 pointer-events-none"
                      } ${isToday ? "ring-1 ring-white/50" : ""}`}
                    />
                  )
                })}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Improved Tooltip */}
      <AnimatePresence>
        {tooltip && (
          <motion.div
            initial={{ opacity: 0, y: 5, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            style={{ 
              position: 'fixed', 
              left: tooltip.x, 
              top: tooltip.y, 
              transform: 'translateX(-50%) translateY(-100%)' 
            }}
            className="z-50 px-3 py-1.5 bg-zinc-900 border border-white/10 rounded-lg text-[10px] text-white shadow-2xl pointer-events-none"
          >
            <div className="font-bold border-b border-white/5 pb-1 mb-1 whitespace-nowrap">
              {new Date(tooltip.date).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
            </div>
            <div className="text-foreground/60">
              <span className="text-primary font-bold">{tooltip.count}</span> video{tooltip.count !== 1 ? 's' : ''} watched
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Legend */}
      <div className="flex items-center gap-2 mt-4 justify-end">
        <span className="text-[9px] text-foreground/20 font-bold uppercase tracking-wider">Less</span>
        {[0, 2, 5, 8, 10].map((val, i) => (
          <div 
            key={i} 
            className={`w-2.5 h-2.5 rounded-[2px] border-[0.5px] ${getIntensity(val)}`} 
          />
        ))}
        <span className="text-[9px] text-foreground/20 font-bold uppercase tracking-wider">More</span>
      </div>
    </div>
  )
}
