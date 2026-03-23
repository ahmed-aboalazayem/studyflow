import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function parseDurationToSeconds(durationStr: string): number {
  if (!durationStr) return 0
  const parts = durationStr.split(':').map(Number)
  if (parts.some(isNaN)) return 0
  if (parts.length === 3) {
    return parts[0] * 3600 + parts[1] * 60 + parts[2]
  } else if (parts.length === 2) {
    return parts[0] * 60 + parts[1]
  } else if (parts.length === 1) {
    return parts[0]
  }
  return 0
}

export function formatSecondsToDuration(totalSeconds: number): string {
  if (!totalSeconds) return "0:00"
  const hours = Math.floor(totalSeconds / 3600)
  const minutes = Math.floor((totalSeconds % 3600) / 60)
  const seconds = totalSeconds % 60

  if (hours > 0) {
    return `${hours}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`
  }
  return `${minutes}:${seconds.toString().padStart(2, '0')}`
}

export function formatSecondsToFriendly(totalSeconds: number): string {
  if (!totalSeconds || totalSeconds < 0) return "0m"
  const hours = Math.floor(totalSeconds / 3600)
  const minutes = Math.floor((totalSeconds % 3600) / 60)
  const remainingSeconds = totalSeconds % 60

  if (hours > 0) {
    return `${hours}h ${minutes}m`
  }
  if (minutes > 0) {
    return `${minutes}m`
  }
  return `${remainingSeconds}s`
}

export function formatMinutesToFriendly(totalMinutes: number): string {
  if (!totalMinutes || totalMinutes < 0) return "0m"
  const hours = Math.floor(totalMinutes / 60)
  const mins = Math.floor(totalMinutes % 60)

  if (hours > 0) {
    return `${hours}h ${mins}m`
  }
  return `${mins}m`
}
