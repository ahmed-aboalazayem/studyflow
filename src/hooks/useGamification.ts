"use client"

import * as React from "react"
import { getLevelInfo, type LevelInfo, XP_PER_VIDEO, XP_PER_FOCUS_SESSION } from "@/lib/gamification"

const STORAGE_KEY = "studyflow_xp"

interface GamificationState {
  xp: number
  levelInfo: LevelInfo
  addXP: (amount: number) => { leveledUp: boolean; newLevel?: number; newLevelName?: string }
  XP_PER_VIDEO: number
  XP_PER_FOCUS_SESSION: number
}

export function useGamification(): GamificationState {
  const [xp, setXP] = React.useState(0)

  React.useEffect(() => {
    if (typeof window === "undefined") return
    const raw = localStorage.getItem(STORAGE_KEY)
    if (raw) {
      try { setXP(Number(JSON.parse(raw))) } catch {}
    }
  }, [])

  const addXP = React.useCallback((amount: number) => {
    let leveledUp = false
    let newLevel: number | undefined
    let newLevelName: string | undefined

    setXP(prev => {
      const nextXP = prev + amount
      const prevInfo = getLevelInfo(prev)
      const nextInfo = getLevelInfo(nextXP)
      if (nextInfo.current.level > prevInfo.current.level) {
        leveledUp = true
        newLevel = nextInfo.current.level
        newLevelName = nextInfo.current.name
      }
      localStorage.setItem(STORAGE_KEY, JSON.stringify(nextXP))
      return nextXP
    })

    return { leveledUp, newLevel, newLevelName }
  }, [])

  const levelInfo = getLevelInfo(xp)

  return { xp, levelInfo, addXP, XP_PER_VIDEO, XP_PER_FOCUS_SESSION }
}
