"use client"

import * as React from "react"
import { motion } from "framer-motion"
import { Trophy, Medal, Target, Users } from "lucide-react"

interface LeaderboardUser {
  username: string
  totalMinutes: number
  completedCount: number
}

interface LeaderboardProps {
  data: LeaderboardUser[]
}

import { formatMinutesToFriendly } from "@/lib/utils"

export function Leaderboard({ data }: LeaderboardProps) {
  if (data.length === 0) return null

  const firstPlace = data[0]

  return (
    <div className="bg-white/[0.02] border border-white/10 rounded-3xl p-6 glass backdrop-blur-2xl">
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-xl bg-primary/10 text-primary">
            <Trophy className="w-5 h-5" />
          </div>
          <h2 className="text-xl font-bold text-white tracking-tight">Leaderboard</h2>
        </div>
        <div className="flex items-center gap-2 text-sm text-foreground/40 font-medium">
          <Users className="w-4 h-4" />
          {data.length} Participants
        </div>
      </div>

      <div className="space-y-4">
        {data.slice(0, 5).map((user, index) => {
          const isFirst = index === 0
          const isSecond = index === 1
          const isThird = index === 2
          
          const diffToFirst = isFirst ? 0 : firstPlace.totalMinutes - user.totalMinutes

          return (
            <motion.div
              key={user.username}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className={`group relative flex items-center justify-between p-4 rounded-2xl border transition-all duration-300 ${
                isFirst 
                  ? "bg-primary/10 border-primary/30 shadow-[0_0_20px_rgba(255,31,31,0.1)]" 
                  : "bg-white/5 border-white/5 hover:border-white/20 group-hover:bg-white/[0.07]"
              }`}
            >
              <div className="flex items-center gap-4">
                <div className={`flex items-center justify-center w-10 h-10 rounded-xl font-bold text-lg ${
                  isFirst ? "bg-primary text-white" : "bg-white/5 text-foreground/40"
                }`}>
                  {isFirst ? <Medal className="w-5 h-5" /> : index + 1}
                </div>
                
                <div>
                  <div className="font-bold text-white group-hover:text-primary transition-colors">
                    {user.username}
                  </div>
                  <div className="text-xs text-foreground/40 font-medium flex items-center gap-2 mt-0.5">
                    <Target className="w-3 h-3 text-emerald-500/50" />
                    {user.completedCount} lessons completed
                  </div>
                </div>
              </div>

              <div className="text-right">
                <div className={`font-mono font-bold ${isFirst ? "text-primary text-lg" : "text-white"}`}>
                  {formatMinutesToFriendly(user.totalMinutes)}
                </div>
                {!isFirst && diffToFirst > 0 && (
                  <div className="text-[10px] text-foreground/30 font-bold uppercase tracking-wider mt-1">
                    -{formatMinutesToFriendly(diffToFirst)} to 1st
                  </div>
                )}
              </div>
            </motion.div>
          )
        })}
      </div>
    </div>
  )
}
