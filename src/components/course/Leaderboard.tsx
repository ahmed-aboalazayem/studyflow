"use client"

import * as React from "react"
import { motion } from "framer-motion"
import { Trophy, Medal, Target, Users, Crown } from "lucide-react"

interface LeaderboardUser {
  username: string
  displayName?: string | null
  imageUrl?: string | null
  totalMinutes: number
  completedCount: number
  latestVideo?: string | null
  latestSection?: string | null
}

interface LeaderboardProps {
  data: LeaderboardUser[]
  loading?: boolean
}

import { formatMinutesToFriendly } from "@/lib/utils"

export const Leaderboard = React.memo(({ data, loading }: LeaderboardProps) => {
  if (loading) {
    return (
      <div className="bg-white/[0.02] border border-white/10 rounded-3xl p-6 glass backdrop-blur-2xl animate-pulse">
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-white/5 w-9 h-9" />
            <div className="h-6 w-32 bg-white/5 rounded-lg" />
          </div>
          <div className="h-4 w-24 bg-white/5 rounded-lg" />
        </div>

        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="flex items-center justify-between p-4 rounded-2xl border border-white/5 bg-white/5">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-xl bg-white/5" />
                <div className="space-y-2">
                  <div className="h-4 w-24 bg-white/10 rounded-lg" />
                  <div className="h-3 w-32 bg-white/5 rounded-lg" />
                </div>
              </div>
              <div className="space-y-2 flex flex-col items-end">
                <div className="h-5 w-16 bg-white/10 rounded-lg" />
                <div className="h-3 w-12 bg-white/5 rounded-lg" />
              </div>
            </div>
          ))}
        </div>
      </div>
    )
  }

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
          
          const diffToFirst = isFirst ? 0 : firstPlace.totalMinutes - user.totalMinutes

          return (
            <motion.div
              key={user.username}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className={`group relative flex items-center justify-between p-4 rounded-2xl border transition-all duration-300 will-change-transform hover:z-50 ${
                isFirst 
                  ? "bg-gradient-to-r from-amber-500/20 to-amber-900/20 border-amber-500/40 shadow-[0_0_30px_rgba(245,158,11,0.2)] scale-[1.02] z-10" 
                  : "bg-white/5 border-white/5 hover:border-white/20 group-hover:bg-white/[0.07]"
              }`}
            >
              <div className="flex items-center gap-4">
                <div className="relative">
                  {isFirst && (
                    <div className="absolute -top-4 -right-3 rotate-[15deg] z-20 text-amber-400 drop-shadow-[0_0_8px_rgba(245,158,11,0.8)] animate-pulse">
                      <Crown className="w-8 h-8 fill-amber-400" />
                    </div>
                  )}
                  <div className={`flex items-center justify-center w-12 h-12 rounded-xl overflow-hidden bg-white/5 border-2 ${isFirst ? 'border-amber-400/50 shadow-[0_0_15px_rgba(245,158,11,0.4)]' : 'border-white/10'}`}>
                    {user.imageUrl ? (
                      <img src={user.imageUrl} alt="" className="w-full h-full object-cover" />
                    ) : (
                      <div className={`flex items-center justify-center w-full h-full font-bold text-lg ${
                        isFirst ? "bg-gradient-to-br from-amber-400 to-amber-600 text-white" : "text-foreground/40"
                      }`}>
                        {isFirst ? <Medal className="w-6 h-6 text-white drop-shadow-md" /> : index + 1}
                      </div>
                    )}
                  </div>
                </div>
                
                <div>
                  <div className={`font-bold transition-colors ${isFirst ? 'text-amber-400 text-lg drop-shadow-[0_0_10px_rgba(245,158,11,0.4)]' : 'text-white group-hover:text-primary'}`}>
                    {user.displayName || user.username}
                  </div>
                  <div className="text-xs text-foreground/40 font-medium flex items-center gap-2 mt-0.5">
                    <Target className={`w-3 h-3 ${isFirst ? 'text-amber-500' : 'text-emerald-500/50'}`} />
                    {user.completedCount} lessons completed
                  </div>
                  {user.latestVideo && (
                    <div className="relative group/tooltip">
                       <div className={`text-[10px] font-medium truncate max-w-[170px] mt-1.5 flex items-center gap-1.5 cursor-help ${isFirst ? 'text-amber-200/60' : 'text-primary/40'}`}>
                         <span className="shrink-0 w-1 h-1 rounded-full bg-current opacity-40" />
                         <span className="italic">Latest: {user.latestVideo}</span>
                       </div>
                       
                       {/* Tooltip */}
                       <div className="absolute left-0 bottom-full mb-3 hidden group-hover/tooltip:block z-[100] animate-in fade-in zoom-in-95 slide-in-from-bottom-2 duration-300">
                         <div className="bg-black border border-white/10 rounded-2xl p-4 shadow-[0_20px_50px_rgba(0,0,0,0.5)] min-w-[240px] backdrop-blur-2xl relative overflow-hidden">
                            {/* Decorative Gradient Background */}
                            <div className="absolute top-0 right-0 w-32 h-32 bg-primary/10 blur-3xl -mr-16 -mt-16 pointer-events-none" />
                            
                            <div className="relative z-10">
                              <div className="flex items-center gap-2 mb-3">
                                <div className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
                                <p className="text-[10px] font-black uppercase tracking-[0.2em] text-white/40">Activity Status</p>
                              </div>

                              <div className="space-y-4">
                                <div>
                                  <p className="text-[9px] font-black uppercase tracking-widest text-primary mb-1.5">Current Section</p>
                                  <p className="text-sm font-black text-white leading-tight tracking-tight drop-shadow-sm">{user.latestSection || 'General'}</p>
                                </div>

                                <div className="h-px w-full bg-gradient-to-r from-white/10 via-white/5 to-transparent" />

                                <div>
                                  <p className="text-[9px] font-black uppercase tracking-widest text-white/30 mb-1.5">Latest Video</p>
                                  <p className="text-xs font-bold text-white/90 italic leading-relaxed line-clamp-2 bg-white/5 p-2 rounded-lg border border-white/5">
                                    "{user.latestVideo}"
                                  </p>
                                </div>
                              </div>
                            </div>
                         </div>
                         {/* Arrow */}
                         <div className="w-3 h-3 bg-black/90 border-r border-b border-white/10 rotate-45 -mt-1.5 ml-6 backdrop-blur-2xl" />
                       </div>
                    </div>
                  )}
                </div>
              </div>

              <div className="text-right">
                <div className={`font-mono font-bold ${isFirst ? "text-amber-400 text-xl drop-shadow-[0_0_8px_rgba(245,158,11,0.5)]" : "text-white text-lg"}`}>
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
})
