"use client"

import * as React from "react"
import { motion } from "framer-motion"
import { useActivityLog } from "@/hooks/useActivityLog"

function getLastNWeeks(n: number): string[] {
  const days: string[] = []
  const today = new Date()
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
  return "bg-primary border-primary shadow-[0_0_8px_rgba(255,31,31,0.5)]"
}

const WEEKS = 12
const DAY_LABELS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"]

export function ActivityHeatmap() {
  const { activityMap } = useActivityLog()
  const [tooltip, setTooltip] = React.useState<{ date: string; count: number } | null>(null)

  const days = React.useMemo(() => getLastNWeeks(WEEKS), [])

  // Figure out first day's weekday offset so the grid starts on Sunday
  const firstDayOfWeek = new Date(days[0]).getDay()

  // Group into columns of 7 (one week per column)
  const weeks: string[][] = []
  let week: string[] = []
  // Pad the first week
  for (let i = 0; i < firstDayOfWeek; i++) week.push("")
  for (const day of days) {
    week.push(day)
    if (week.length === 7) { weeks.push(week); week = [] }
  }
  if (week.length > 0) {
    while (week.length < 7) week.push("")
    weeks.push(week)
  }

  const totalActivity = React.useMemo(() =>
    Object.values(activityMap).reduce((a, b) => a + b, 0),
  [activityMap])

  const todayISO = new Date().toISOString().split("T")[0]

  return (
    <div className="bg-white/5 border border-white/10 rounded-3xl p-6 glass">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-base font-bold text-white">Your Study Activity</h3>
        <span className="text-foreground/40 text-xs font-medium">
          {totalActivity} videos in {WEEKS} weeks
        </span>
      </div>

      {/* Day labels */}
      <div className="flex gap-1 mb-1 pl-9">
        {DAY_LABELS.map(d => (
          <div key={d} className="w-3.5 text-[8px] text-foreground/30 font-bold text-center">{d[0]}</div>
        ))}
      </div>

      {/* Grid */}
      <div className="flex flex-col gap-1">
        {/* Render 7 rows (days of week) across all weeks */}
        {Array.from({ length: 7 }).map((_, dayIdx) => (
          <div key={dayIdx} className="flex items-center gap-1">
            <span className="text-[8px] text-foreground/30 font-bold w-8 text-right pr-1">
              {dayIdx % 2 === 1 ? DAY_LABELS[dayIdx] : ""}
            </span>
            {weeks.map((wk, wkIdx) => {
              const date = wk[dayIdx]
              const count = date ? (activityMap[date] || 0) : 0
              const isToday = date === todayISO
              return (
                <motion.div
                  key={wkIdx}
                  whileHover={{ scale: 1.3 }}
                  onMouseEnter={() => date ? setTooltip({ date, count }) : null}
                  onMouseLeave={() => setTooltip(null)}
                  className={`relative w-3.5 h-3.5 rounded-sm border cursor-pointer transition-all ${
                    date ? getIntensity(count) : "opacity-0"
                  } ${isToday ? "ring-1 ring-white/40" : ""}`}
                />
              )
            })}
          </div>
        ))}
      </div>

      {/* Tooltip */}
      {tooltip && (
        <div className="mt-3 px-3 py-1.5 bg-black/60 border border-white/10 rounded-lg text-xs text-white/80 inline-block">
          {tooltip.date}: <span className="font-bold text-white">{tooltip.count} video{tooltip.count !== 1 ? "s" : ""}</span>
        </div>
      )}

      {/* Legend */}
      <div className="flex items-center gap-2 mt-3 justify-end">
        <span className="text-[10px] text-foreground/30">Less</span>
        {["bg-white/5", "bg-primary/20", "bg-primary/50", "bg-primary/80", "bg-primary"].map((cls, i) => (
          <div key={i} className={`w-3 h-3 rounded-sm border border-white/10 ${cls}`} />
        ))}
        <span className="text-[10px] text-foreground/30">More</span>
      </div>
    </div>
  )
}
