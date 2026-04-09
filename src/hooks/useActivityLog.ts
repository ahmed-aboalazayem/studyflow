"use client"

import * as React from "react"
import { useAuth } from "@/lib/auth-context"
import { updateUserStatsAction } from "@/app/actions"

function todayISO() {
  return new Date().toISOString().split("T")[0]
}

export function useActivityLog() {
  const { user, updateUser } = useAuth()
  
  // Parse activityData if it's a JSON string or already an object
  const activityMap = React.useMemo(() => {
    if (!user?.activityData) return {}
    if (typeof user.activityData === 'string') {
      try { return JSON.parse(user.activityData) } catch { return {} }
    }
    return user.activityData as Record<string, number>
  }, [user?.activityData])

  const logActivity = React.useCallback(() => {
    if (!user) return
    const today = todayISO()
    
    const nextMap = { ...activityMap, [today]: (activityMap[today] || 0) + 1 }
    
    updateUser({ activityData: nextMap })
    updateUserStatsAction({ activityData: nextMap })
  }, [user, activityMap, updateUser])

  return { activityMap, logActivity }
}
