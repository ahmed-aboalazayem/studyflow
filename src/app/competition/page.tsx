"use client"

import * as React from "react"
import { motion } from "framer-motion"
import { Trophy, Users, ArrowRight, Medal, Star } from "lucide-react"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { useStore } from "@/lib/store"
import { BackgroundEffect } from "@/components/ui/BackgroundEffect"
import { Leaderboard } from "@/components/course/Leaderboard"
import { getLeaderboard } from "@/app/actions"
import { LoadingState } from "@/components/ui/LoadingState"

export default function CompetitionPage() {
  const { courses, isLoaded } = useStore()
  const [selectedCourseId, setSelectedCourseId] = React.useState<string | null>(null)
  const [leaderboardData, setLeaderboardData] = React.useState<any[]>([])
  const [loading, setLoading] = React.useState(false)

  // Initially select the first course or first shared course
  React.useEffect(() => {
    if (isLoaded && courses.length > 0 && !selectedCourseId) {
      const firstShared = courses.find((c: any) => c.ownership === 'shared') || courses[0]
      setSelectedCourseId(firstShared.id)
    }
  }, [isLoaded, courses, selectedCourseId])

  React.useEffect(() => {
    const fetchLeaderboard = async () => {
      if (!selectedCourseId) return
      setLoading(true)
      const data = await getLeaderboard(selectedCourseId)
      setLeaderboardData(data)
      setLoading(false)
    }
    fetchLeaderboard()
  }, [selectedCourseId])

  if (!isLoaded) {
    return (
      <main className="relative min-h-screen pt-24 pb-12 text-center">
        <BackgroundEffect />
        <LoadingState />
      </main>
    )
  }

  const selectedCourse = courses.find(c => c.id === selectedCourseId)

  return (
    <main className="relative min-h-screen pt-24 pb-12">
      <BackgroundEffect />
      
      <div className="container mx-auto px-4 relative z-10">
        <div className="mb-12">
          <h1 className="text-4xl font-black text-gradient tracking-tighter mb-2">Competition Hub</h1>
          <p className="text-foreground/40">Compete with friends and track your standing across all courses.</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
          {/* Courses List Sidebar */}
          <div className="lg:col-span-4 space-y-4">
            <h2 className="text-sm font-bold uppercase tracking-widest text-white/40 mb-6 px-1">Active Courses</h2>
            <div className="space-y-3">
              {courses.map((course: any) => (
                <button
                  key={course.id}
                  onClick={() => setSelectedCourseId(course.id)}
                  className={`w-full text-left p-4 rounded-2xl border transition-all duration-300 group ${
                    selectedCourseId === course.id 
                    ? 'bg-primary/20 border-primary/50 shadow-[0_0_20px_rgba(255,31,31,0.2)]' 
                    : 'bg-white/5 border-white/5 hover:border-white/20'
                  }`}
                >
                  <div className="flex items-center gap-4">
                    <div className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 border border-white/10 transition-colors ${
                      selectedCourseId === course.id ? 'bg-primary/40' : 'bg-black/40'
                    }`}>
                      <Trophy className={`w-6 h-6 ${selectedCourseId === course.id ? 'text-white' : 'text-white/20'}`} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className={`font-bold truncate ${selectedCourseId === course.id ? 'text-white' : 'text-white/60'}`}>
                        {course.title}
                      </p>
                      <div className="flex items-center gap-2 mt-0.5">
                        <span className={`text-[10px] font-black uppercase tracking-widest px-1.5 py-0.5 rounded ${
                          course.ownership === 'shared' ? 'bg-accent/20 text-accent' : 'bg-white/10 text-white/40'
                        }`}>
                          {course.ownership}
                        </span>
                        <span className="text-[10px] text-white/40 font-bold uppercase tracking-widest">
                          • {course.progress}%
                        </span>
                      </div>
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Leaderboard Detail */}
          <div className="lg:col-span-8">
            {selectedCourse ? (
              <div className="space-y-8">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 pb-8 border-b border-white/10">
                  <div className="flex items-center gap-6">
                    <div className="w-20 h-20 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center overflow-hidden">
                      {selectedCourse.imageUrl ? (
                        <img src={selectedCourse.imageUrl} alt="" className="w-full h-full object-cover" />
                      ) : (
                        <Star className="w-8 h-8 text-primary" />
                      )}
                    </div>
                    <div>
                      <h2 className="text-3xl font-black text-white mb-2">{selectedCourse.title}</h2>
                      <div className="flex items-center gap-3">
                         <Link href={`/course/${selectedCourse.id}`}>
                           <Button variant="ghost" className="p-0 h-auto text-primary hover:text-primary/80 font-bold uppercase text-[10px] tracking-widest bg-transparent hover:bg-transparent">
                             View Course <ArrowRight className="ml-1 w-3 h-3" />
                           </Button>
                         </Link>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div className="space-y-6">
                    <h3 className="text-xl font-bold text-white flex items-center gap-2">
                      <Medal className="w-5 h-5 text-primary" />
                      Leaderboard
                    </h3>
                    <Leaderboard data={leaderboardData} />
                  </div>

                  <div className="glass border border-white/10 rounded-3xl p-8 space-y-6 flex flex-col items-center justify-center text-center">
                    <div className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center mb-2">
                       <Users className="w-10 h-10 text-primary" />
                    </div>
                    <h4 className="text-2xl font-black text-white">Community Progress</h4>
                    <p className="text-foreground/40 max-w-xs">
                      This course has {leaderboardData.length} participants competing for the top spot. 
                      Keep studying to move up the ranks!
                    </p>
                    <div className="pt-4 w-full">
                       <div className="flex items-center justify-between text-sm font-bold uppercase tracking-widest text-white/20 mb-2">
                         <span>Collective Effort</span>
                         <span>🔥 ACTIVE</span>
                       </div>
                       <div className="h-2 w-full bg-white/5 rounded-full overflow-hidden">
                          <motion.div 
                            initial={{ width: 0 }}
                            animate={{ width: "65%" }}
                            className="h-full bg-primary"
                          />
                       </div>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-32 glass rounded-3xl border-dashed border-white/10">
                <Trophy className="w-16 h-16 text-white/10 mb-6" />
                <p className="text-2xl font-bold text-white mb-2">Select a course</p>
                <p className="text-foreground/40">Select a course from the sidebar to view its leaderboard.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </main>
  )
}
