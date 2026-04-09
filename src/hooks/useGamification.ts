"use client"

import * as React from "react"
import { getLevelInfo, type LevelInfo, XP_PER_VIDEO, XP_PER_FOCUS_SESSION } from "@/lib/gamification"
import { useAuth } from "@/lib/auth-context"
import { updateUserStatsAction } from "@/app/actions"

interface GamificationState {
  xp: number
  levelInfo: LevelInfo
  addXP: (amount: number) => { leveledUp: boolean; newLevel?: number; newLevelName?: string }
  XP_PER_VIDEO: number
  XP_PER_FOCUS_SESSION: number
}

export function useGamification(): GamificationState {
  const { user, updateUser } = useAuth()
  
  const xp = user?.xp || 0

  const addXP = React.useCallback((amount: number) => {
    if (!user) return { leveledUp: false }

    let leveledUp = false
    let newLevel: number | undefined
    let newLevelName: string | undefined

    const nextXP = Math.max(0, xp + amount)
    const prevInfo = getLevelInfo(xp)
    const nextInfo = getLevelInfo(nextXP)

    if (nextInfo.current.level > prevInfo.current.level) {
      leveledUp = true
      newLevel = nextInfo.current.level
      newLevelName = nextInfo.current.name
    }

    updateUser({ xp: nextXP })
    updateUserStatsAction({ xp: nextXP })

    return { leveledUp, newLevel, newLevelName }
  }, [user, xp, updateUser])

  const levelInfo = getLevelInfo(xp)

  return { xp, levelInfo, addXP, XP_PER_VIDEO, XP_PER_FOCUS_SESSION }
}
