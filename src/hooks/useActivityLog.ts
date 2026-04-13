"use client"

import * as React from "react"
import { useAuth } from "@/lib/auth-context"
import { updateUserStatsAction } from "@/app/actions"

function todayISO() {
  return new Date().toISOString().split("T")[0]
}

export interface DailyActivity {
  count: number
  xp: number
  courses?: Record<string, {
    name: string
    count: number
    xp: number
  }>
}

export type ActivityMap = Record<string, DailyActivity | number>

export function useActivityLog() {
  const { user, updateUser } = useAuth()
  
  const activityMap = React.useMemo(() => {
    if (!user?.activityData) return {} as Record<string, DailyActivity>
    
    let parsed: Record<string, any> = {}
    if (typeof user.activityData === 'string') {
      try { parsed = JSON.parse(user.activityData) } catch { parsed = {} }
    } else {
      parsed = user.activityData
    }

    // Migration/Compatibility: Convert old number-only format to new object format on the fly
    const normalized: Record<string, DailyActivity> = {}
    Object.entries(parsed).forEach(([date, val]) => {
      if (typeof val === 'number') {
        normalized[date] = { count: val, xp: val * 10 } // Estimate 10 XP per old count
      } else {
        normalized[date] = val as DailyActivity
      }
    })
    return normalized
  }, [user?.activityData])

  const logActivity = React.useCallback((options?: { xpGain?: number; courseId?: string; courseName?: string }) => {
    if (!user) return
    const today = todayISO()
    const { xpGain = 10, courseId, courseName } = options || {}
    
    const currentDay = activityMap[today] || { count: 0, xp: 0, courses: {} }
    
    const nextDay: DailyActivity = {
      count: currentDay.count + 1,
      xp: currentDay.xp + xpGain,
      courses: { ...(currentDay.courses || {}) }
    }

    if (courseId && courseName) {
      const courseStats = nextDay.courses![courseId] || { name: courseName, count: 0, xp: 0 }
      nextDay.courses![courseId] = {
        name: courseName,
        count: courseStats.count + 1,
        xp: courseStats.xp + xpGain
      }
    }

    const nextMap = { ...activityMap, [today]: nextDay }
    
    updateUser({ activityData: nextMap })
    updateUserStatsAction({ activityData: nextMap })
  }, [user, activityMap, updateUser])

  return { activityMap, logActivity }
}
