"use client"

import * as React from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { motion } from "framer-motion"
import { Search } from "lucide-react"
import { Input } from "@/components/ui/input"
import { CourseCard, CourseCardSkeleton } from "@/components/course/CourseCard"
import { useStore, Course } from "@/lib/store"
import { useAuth } from "@/lib/auth-context"
import { BackgroundEffect } from "@/components/ui/BackgroundEffect"
import { LevelBadge } from "@/components/ui/LevelBadge"
import { StreakWidget } from "@/components/ui/StreakWidget"
import { ActivityHeatmap } from "@/components/ui/ActivityHeatmap"
import { LevelsPreviewModal } from "@/components/ui/LevelsPreviewModal"
import { FolderCard } from "@/components/dashboard/FolderCard"
import { AddFolderModal } from "@/components/dashboard/AddFolderModal"
import { FolderPlus, LayoutGrid } from "lucide-react"
import { 
  DndContext, 
  DragEndEvent, 
  PointerSensor, 
  useSensor, 
  useSensors,
  useDroppable
} from "@dnd-kit/core"

export default function Dashboard() {
  const { 
    courses, folders, fetchCourses, isLoaded, moveCourseToFolder,
    searchQuery, isAddFolderModalOpen, setIsAddFolderModalOpen 
  } = useStore()
  const { user, isLoading } = useAuth()
  const router = useRouter()
  
  const [isLevelsModalOpen, setIsLevelsModalOpen] = React.useState(false)

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    })
  )

  React.useEffect(() => {
    fetchCourses()
  }, [fetchCourses])

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event
    if (!over) return

    const courseId = active.id as string
    const targetId = over.id as string

    // If target is a folder id, move there. If target is 'root', move to null.
    const destinationFolderId = targetId === 'dashboard-root' ? null : targetId
    
    // Check if it's actually changing folder
    const course = courses.find(c => c.id === courseId)
    if (course && course.folderId !== destinationFolderId) {
      moveCourseToFolder(courseId, destinationFolderId)
    }
  }

  const filteredCourses = courses.filter(course =>
    course.title.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const ownedCourses = filteredCourses.filter((c: any) => c.ownership !== 'shared')
  const sharedCourses = filteredCourses.filter((c: any) => c.ownership === 'shared')

  // Group owned courses by folder
  const unorganizedCourses = ownedCourses.filter(c => !c.folderId)

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
      
      <DndContext sensors={sensors} onDragEnd={handleDragEnd}>
        <div className="container mx-auto px-4 py-12 relative z-10">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between mb-12 gap-6">
          <div className="space-y-1">
            <h1 className="text-4xl md:text-5xl font-black tracking-tighter text-gradient pb-1">
              {user ? `Welcome back, ${user.displayName || user.username}` : 'My Courses'}
            </h1>
            <p className="text-foreground/40 text-lg font-medium">
              Elevate your knowledge, one lesson at a time.
            </p>
            {/* Streak & Level widgets */}
            <div className="flex flex-wrap items-center gap-3 mt-3">
              <LevelBadge onClick={() => setIsLevelsModalOpen(true)} />
              <StreakWidget />
            </div>
          </div>
        </div>

        {ownedCourses.length > 0 ? (
          <div className="space-y-12">
            {/* Folders Section */}
            {folders.length > 0 && (
              <div className="grid grid-cols-1 gap-6">
                {folders.map(folder => (
                  <FolderCard 
                    key={folder.id} 
                    folder={folder} 
                    courses={ownedCourses.filter(c => c.folderId === folder.id)} 
                  />
                ))}
              </div>
            )}

            {/* Unorganized / Root Droppable Section */}
            <RootDroppable 
              courses={unorganizedCourses} 
              hasFolders={folders.length > 0} 
            />
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
                  <span className="bg-primary text-[10px] font-black px-2 py-0.5 rounded-full text-white uppercase tracking-wider shadow-[0_0_15px_rgba(255,31,31,0.5)]">
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
        {/* Activity Heatmap */}
        <div className="mt-16">
          <ActivityHeatmap />
        </div>
      </div>
      </DndContext>
      
      <LevelsPreviewModal isOpen={isLevelsModalOpen} onClose={() => setIsLevelsModalOpen(false)} />
      <AddFolderModal isOpen={isAddFolderModalOpen} onClose={() => setIsAddFolderModalOpen(false)} />
    </main>
  )
}

function RootDroppable({ courses, hasFolders }: { courses: Course[], hasFolders: boolean }) {
  const { isOver, setNodeRef } = useDroppable({
    id: 'dashboard-root',
  })

  return (
    <div 
      ref={setNodeRef}
      className={`relative min-h-[200px] rounded-[2.5rem] transition-all duration-500 ${
        isOver 
          ? "bg-primary/5 border-2 border-dashed border-primary/30 p-10 -m-10 ring-8 ring-primary/5" 
          : hasFolders ? "bg-black/10 border border-white/5 p-8" : ""
      }`}
    >
      {hasFolders && (
        <div className="flex items-center gap-3 mb-8">
          <div className="p-2 rounded-lg bg-white/5">
            <LayoutGrid className="w-4 h-4 text-white/40" />
          </div>
          <h2 className="text-xs font-black uppercase tracking-[0.2em] text-white/30">General Courses</h2>
          <div className="flex-1 h-px bg-gradient-to-r from-white/10 to-transparent ml-4" />
        </div>
      )}
      
      {courses.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
          {courses.map(course => (
            <CourseCard key={course.id} course={course} />
          ))}
        </div>
      ) : hasFolders ? (
        <div className="py-24 flex flex-col items-center justify-center border-2 border-dashed border-white/5 rounded-[2rem] bg-white/[0.01]">
          <div className="w-12 h-12 rounded-2xl bg-white/5 flex items-center justify-center mb-4 text-white/10">
            <LayoutGrid className="w-6 h-6" />
          </div>
          <p className="text-white/20 font-bold">All courses are organized in folders!</p>
          <p className="text-white/5 text-xs mt-1 uppercase tracking-widest font-black">Drag here to unorganize</p>
        </div>
      ) : null}

      {/* Drop indicator overlay for Root */}
      {isOver && (
        <div className="absolute inset-0 pointer-events-none flex items-center justify-center z-50">
          <motion.div 
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="bg-white/10 backdrop-blur-xl px-6 py-3 rounded-2xl text-white font-black text-sm uppercase tracking-widest border border-white/20 shadow-2xl"
          >
            Move to Dashboard Root
          </motion.div>
        </div>
      )}
    </div>
  )
}

