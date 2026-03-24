"use client"

import * as React from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Search } from "lucide-react"
import { Input } from "@/components/ui/input"
import { CourseCard, CourseCardSkeleton } from "@/components/course/CourseCard"
import { useStore } from "@/lib/store"
import { useAuth } from "@/lib/auth-context"
import { BackgroundEffect } from "@/components/ui/BackgroundEffect"
import { LoadingState } from "@/components/ui/LoadingState"

export default function Home() {
  const [searchQuery, setSearchQuery] = React.useState("")
  const { courses, fetchCourses, isLoaded } = useStore()
  const { user, isLoading } = useAuth()
  const router = useRouter()

  React.useEffect(() => {
    fetchCourses()
  }, [fetchCourses])

  const filteredCourses = courses.filter(course =>
    course.title.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const ownedCourses = filteredCourses.filter((c: any) => c.ownership !== 'shared')
  const sharedCourses = filteredCourses.filter((c: any) => c.ownership === 'shared')

  if (!isLoaded || isLoading) {
    return (
      <main className="relative min-h-screen">
        <BackgroundEffect />
        <div className="container mx-auto px-4 py-12 relative z-10">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between mb-12 gap-6">
            <div className="space-y-2">
              <div className="h-12 w-64 bg-white/10 rounded-xl animate-pulse" />
              <div className="h-6 w-96 bg-white/5 rounded-lg animate-pulse" />
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
            {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
              <CourseCardSkeleton key={i} />
            ))}
          </div>
        </div>
      </main>
    )
  }

  return (
    <main className="relative min-h-screen">
      <BackgroundEffect />
      
      <div className="container mx-auto px-4 py-12 relative z-10">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between mb-12 gap-6">
          <div className="space-y-1">
            <h1 className="text-4xl md:text-5xl font-black tracking-tighter text-gradient pb-1">
              {user ? `Welcome back, ${user.displayName || user.username}` : 'My Courses'}
            </h1>
            <p className="text-foreground/40 text-lg font-medium">
              Elevate your knowledge, one lesson at a time.
            </p>
          </div>
          
          <div className="relative w-full md:w-80 group">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground group-focus-within:text-primary transition-colors" />
            <Input 
              type="text" 
              placeholder="Search courses..." 
              className="pl-10 h-12 bg-white/5 border-white/10 glass focus:border-primary/50 text-white rounded-xl transition-all"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>

        {ownedCourses.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
            {ownedCourses.map(course => (
              <CourseCard key={course.id} course={course} />
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-32 text-center glass border-dashed border-white/10 rounded-3xl">
            <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mb-6">
              <Search className="w-8 h-8 text-primary/50" />
            </div>
            <p className="text-2xl font-bold text-white mb-2">No courses yet</p>
            <p className="text-foreground/40 max-w-xs">
              Create your first course to start tracking your progress!
            </p>
          </div>
        )}

        {/* Shared With Me Section */}
        {sharedCourses.length > 0 && (
          <div className="mt-20 pt-10 border-t border-white/5">
            <div className="flex items-center justify-between mb-10">
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-2">
                  <span className="bg-primary text-[10px] font-black px-2 py-0.5 rounded-full text-white uppercase tracking-wider shadow-[0_0_10px_rgba(255,31,31,0.5)]">
                    Shared
                  </span>
                  <h2 className="text-3xl font-black tracking-tight text-white">
                    Shared With Me
                  </h2>
                </div>
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
              {sharedCourses.map(course => (
                <CourseCard key={course.id} course={course} />
              ))}
            </div>
          </div>
        )}
      </div>
    </main>
  )
}
