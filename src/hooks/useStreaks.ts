"use client"

import * as React from "react"

interface StreakData {
  count: number
  lastStudyDate: string // ISO date string YYYY-MM-DD
}

const STORAGE_KEY = "studyflow_streak"

function todayISO() {
  return new Date().toISOString().split("T")[0]
}

function yesterdayISO() {
  const d = new Date()
  d.setDate(d.getDate() - 1)
  return d.toISOString().split("T")[0]
}

export function useStreaks() {
  const [streak, setStreak] = React.useState(0)

  React.useEffect(() => {
    if (typeof window === "undefined") return
    const raw = localStorage.getItem(STORAGE_KEY)
    if (raw) {
      try {
        const data: StreakData = JSON.parse(raw)
        // If last study was not today or yesterday, streak should be 0
        if (data.lastStudyDate !== todayISO() && data.lastStudyDate !== yesterdayISO()) {
          const reset: StreakData = { count: 0, lastStudyDate: data.lastStudyDate }
          localStorage.setItem(STORAGE_KEY, JSON.stringify(reset))
          setStreak(0)
        } else {
          setStreak(data.count)
        }
      } catch {
        setStreak(0)
      }
    }
  }, [])

  const recordStudy = React.useCallback(() => {
    if (typeof window === "undefined") return
    const today = todayISO()
    const yesterday = yesterdayISO()
    const raw = localStorage.getItem(STORAGE_KEY)
    let data: StreakData = { count: 0, lastStudyDate: "" }
    if (raw) {
      try { data = JSON.parse(raw) } catch {}
    }

    let newCount = data.count
    if (data.lastStudyDate === today) {
      // Already recorded today, no change
      return
    } else if (data.lastStudyDate === yesterday) {
      newCount = data.count + 1
    } else {
      // Gap in study, reset to 1
      newCount = 1
    }

    const next: StreakData = { count: newCount, lastStudyDate: today }
    localStorage.setItem(STORAGE_KEY, JSON.stringify(next))
    setStreak(newCount)
  }, [])

  const isOnFire = streak >= 3

  return { streak, recordStudy, isOnFire }
}
