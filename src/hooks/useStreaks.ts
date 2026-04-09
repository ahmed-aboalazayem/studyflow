"use client"

import * as React from "react"
import { useAuth } from "@/lib/auth-context"
import { updateUserStatsAction } from "@/app/actions"

function todayISO() {
  return new Date().toISOString().split("T")[0]
}

function yesterdayISO() {
  const d = new Date()
  d.setDate(d.getDate() - 1)
  return d.toISOString().split("T")[0]
}

export function useStreaks() {
  const { user, updateUser } = useAuth()

  const streak = user?.streak || 0
  // Handle case where lastStudyDate is from the database as a string or Date object
  const lastDate = user?.lastStudyDate ? new Date(user.lastStudyDate).toISOString().split("T")[0] : ""

  React.useEffect(() => {
    if (!user) return
    if (lastDate && lastDate !== todayISO() && lastDate !== yesterdayISO() && streak > 0) {
      updateUser({ streak: 0 })
      updateUserStatsAction({ streak: 0 })
    }
  }, [user, lastDate, streak, updateUser])

  const recordStudy = React.useCallback(() => {
    if (!user) return
    const today = todayISO()
    const yesterday = yesterdayISO()

    let newCount = streak
    if (lastDate === today) {
      return
    } else if (lastDate === yesterday) {
      newCount = streak + 1
    } else {
      newCount = 1
    }

    const nextDate = new Date()
    updateUser({ streak: newCount, lastStudyDate: nextDate })
    updateUserStatsAction({ streak: newCount, lastStudyDate: nextDate })
  }, [user, streak, lastDate, updateUser])

  const isOnFire = streak >= 3

  return { streak, recordStudy, isOnFire }
}
