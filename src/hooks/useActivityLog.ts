"use client"

import * as React from "react"

const STORAGE_KEY = "studyflow_activity"

function todayISO() {
  return new Date().toISOString().split("T")[0]
}

export function useActivityLog() {
  const [activityMap, setActivityMap] = React.useState<Record<string, number>>({})

  React.useEffect(() => {
    if (typeof window === "undefined") return
    const raw = localStorage.getItem(STORAGE_KEY)
    if (raw) {
      try {
        setActivityMap(JSON.parse(raw))
      } catch {
        setActivityMap({})
      }
    }
  }, [])

  const logActivity = React.useCallback(() => {
    if (typeof window === "undefined") return
    const today = todayISO()
    setActivityMap(prev => {
      const next = { ...prev, [today]: (prev[today] || 0) + 1 }
      localStorage.setItem(STORAGE_KEY, JSON.stringify(next))
      return next
    })
  }, [])

  return { activityMap, logActivity }
}
