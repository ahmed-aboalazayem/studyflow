export const XP_PER_VIDEO = 10
export const XP_PER_FOCUS_SESSION = 50

export interface Level {
  level: number
  name: string
  minXP: number
  color: string
  glow: string
}

export const LEVELS: Level[] = [
  { level: 1,  name: "Beginner",       minXP: 0,     color: "#6b7280", glow: "rgba(107,114,128,0.4)" },
  { level: 2,  name: "Curious",        minXP: 100,   color: "#60a5fa", glow: "rgba(96,165,250,0.4)" },
  { level: 3,  name: "Learner",        minXP: 250,   color: "#34d399", glow: "rgba(52,211,153,0.4)" },
  { level: 4,  name: "Student",        minXP: 500,   color: "#a78bfa", glow: "rgba(167,139,250,0.4)" },
  { level: 5,  name: "Practitioner",   minXP: 850,   color: "#f59e0b", glow: "rgba(245,158,11,0.4)" },
  { level: 6,  name: "Enthusiast",     minXP: 1300,  color: "#fb7185", glow: "rgba(251,113,133,0.4)" },
  { level: 7,  name: "Dedicated",      minXP: 1850,  color: "#38bdf8", glow: "rgba(56,189,248,0.4)" },
  { level: 8,  name: "Scholar",        minXP: 2500,  color: "#818cf8", glow: "rgba(129,140,248,0.4)" },
  { level: 9,  name: "Expert",         minXP: 3300,  color: "#f97316", glow: "rgba(249,115,22,0.4)" },
  { level: 10, name: "Mastermind",     minXP: 4200,  color: "#ec4899", glow: "rgba(236,72,153,0.4)" },
  { level: 11, name: "Prodigy",        minXP: 5300,  color: "#14b8a6", glow: "rgba(20,184,166,0.4)" },
  { level: 12, name: "Virtuoso",       minXP: 6600,  color: "#6366f1", glow: "rgba(99,102,241,0.4)" },
  { level: 13, name: "Sage",           minXP: 8100,  color: "#eab308", glow: "rgba(234,179,8,0.4)" },
  { level: 14, name: "Guardian",       minXP: 9800,  color: "#ef4444", glow: "rgba(239,68,68,0.4)" },
  { level: 15, name: "Architect",      minXP: 11800, color: "#8b5cf6", glow: "rgba(139,92,246,0.4)" },
  { level: 16, name: "Innovator",      minXP: 14100, color: "#06b6d4", glow: "rgba(6,182,212,0.4)" },
  { level: 17, name: "Luminary",       minXP: 16700, color: "#f43f5e", glow: "rgba(244,63,94,0.4)" },
  { level: 18, name: "Legend",         minXP: 19600, color: "#d97706", glow: "rgba(217,119,6,0.4)" },
  { level: 19, name: "Grand Master",   minXP: 22900, color: "#7c3aed", glow: "rgba(124,58,237,0.5)" },
  { level: 20, name: "GOAT 🐐",        minXP: 26700, color: "#dc2626", glow: "rgba(220,38,38,0.6)" },
]

export interface LevelInfo {
  current: Level
  next: Level | null
  xpIntoLevel: number
  xpToNext: number
  progressPercent: number
}

export function getLevelInfo(xp: number): LevelInfo {
  let current = LEVELS[0]
  for (const lvl of LEVELS) {
    if (xp >= lvl.minXP) current = lvl
    else break
  }
  const nextIdx = LEVELS.indexOf(current) + 1
  const next = nextIdx < LEVELS.length ? LEVELS[nextIdx] : null
  const xpIntoLevel = xp - current.minXP
  const xpToNext = next ? next.minXP - current.minXP : 1
  const progressPercent = next ? Math.round((xpIntoLevel / xpToNext) * 100) : 100
  return { current, next, xpIntoLevel, xpToNext, progressPercent }
}
