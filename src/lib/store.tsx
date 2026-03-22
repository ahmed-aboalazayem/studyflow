"use client"

import * as React from "react"
import type { CourseData } from "@/components/course/CourseCard"
import type { DayBlockData } from "@/components/course/DayBlock"

// Storage Keys
const COURSES_KEY = 'studyflow_courses'
const COURSE_DETAILS_KEY = 'studyflow_course_details'

interface StoreState {
  courses: CourseData[]
  courseDetails: Record<string, DayBlockData[]>
  isLoaded: boolean
  addCourse: (course: Partial<CourseData>) => Promise<CourseData>
  updateCourseBlocks: (courseId: string, blocks: DayBlockData[]) => void
  fetchCourses: () => Promise<void>
  fetchCourseDetail: (courseId: string) => Promise<void>
  addDayBlock: (courseId: string, title: string) => Promise<DayBlockData>
  addItemsToBlock: (blockId: string, items: { title: string; duration: string }[]) => Promise<any>
  toggleItem: (itemId: string, completed: boolean) => Promise<void>
  updateBlockTitle: (blockId: string, title: string) => Promise<void>
  deleteCourse: (id: string) => Promise<void>
  deleteDayBlock: (courseId: string, blockId: string) => Promise<void>
}

const StoreContext = React.createContext<StoreState | undefined>(undefined)

export function StoreProvider({ children }: { children: React.ReactNode }) {
  const [courses, setCourses] = React.useState<CourseData[]>([])
  const [courseDetails, setCourseDetails] = React.useState<Record<string, DayBlockData[]>>({})
  const [isLoaded, setIsLoaded] = React.useState(false)

  // Load initial data from localStorage
  React.useEffect(() => {
    const storedCourses = localStorage.getItem(COURSES_KEY)
    const storedDetails = localStorage.getItem(COURSE_DETAILS_KEY)

    if (storedCourses) {
      setCourses(JSON.parse(storedCourses))
    }
    if (storedDetails) {
      setCourseDetails(JSON.parse(storedDetails))
    }
    setIsLoaded(true)
  }, [])

  // Sync to localStorage
  React.useEffect(() => {
    if (isLoaded) {
      localStorage.setItem(COURSES_KEY, JSON.stringify(courses))
      localStorage.setItem(COURSE_DETAILS_KEY, JSON.stringify(courseDetails))
    }
  }, [courses, courseDetails, isLoaded])

  const fetchCourses = React.useCallback(async () => {
    // Already loaded in useEffect, but we keep the signature
    setIsLoaded(true)
  }, [])

  const fetchCourseDetail = React.useCallback(async (courseId: string) => {
    // Already loaded in useEffect
  }, [])

  const addCourse = React.useCallback(async (course: Partial<CourseData>) => {
    const newCourse: CourseData = {
      id: `course-${Date.now()}`,
      title: course.title || 'Untitled Course',
      imageUrl: course.imageUrl || '',
      progress: 0,
      totalVideos: 0,
      completedVideos: 0,
      ownership: 'owned' as const,
      ownerName: 'Guest'
    }
    setCourses(prev => [newCourse, ...prev])
    setCourseDetails(prev => ({ ...prev, [newCourse.id]: [] }))
    return newCourse
  }, [])

  const deleteCourse = React.useCallback(async (id: string) => {
    setCourses(prev => prev.filter(c => c.id !== id))
    setCourseDetails(prev => {
      const newDetails = { ...prev }
      delete newDetails[id]
      return newDetails
    })
  }, [])

  const addDayBlock = React.useCallback(async (courseId: string, title: string) => {
    const newBlock: DayBlockData = {
      id: `block-${Date.now()}`,
      title,
      items: []
    }
    setCourseDetails(prev => ({
      ...prev,
      [courseId]: [...(prev[courseId] || []), newBlock]
    }))
    return newBlock
  }, [])
  const deleteDayBlock = React.useCallback(async (courseId: string, blockId: string) => {
    setCourseDetails(prev => {
      const next = { ...prev }
      const blocks = next[courseId] || []
      const updatedBlocks = blocks.filter(b => b.id !== blockId)
      next[courseId] = updatedBlocks
      
      // Calculate new progress
      setCourses(coursesPrev => coursesPrev.map(c => {
        if (c.id === courseId) {
          let total = 0
          let completed = 0
          updatedBlocks.forEach(b => {
            total += b.items.length
            completed += b.items.filter(i => i.completed).length
          })
          const progress = total === 0 ? 0 : Math.round((completed / total) * 100)
          return { ...c, totalVideos: total, completedVideos: completed, progress }
        }
        return c
      }))
      
      return next
    })
  }, [])

  const addItemsToBlock = React.useCallback(async (blockId: string, items: { title: string; duration: string }[]) => {
    let newItemsWithId: any[] = []
    setCourseDetails(prev => {
      const next = { ...prev }
      for (const courseId in next) {
        const blocks = next[courseId]
        const blockIndex = blocks.findIndex(b => b.id === blockId)
        if (blockIndex !== -1) {
          const updatedBlocks = [...blocks]
          newItemsWithId = items.map((it, idx) => ({
            id: `item-${Date.now()}-${idx}`,
            title: it.title,
            duration: it.duration,
            completed: false
          }))
          updatedBlocks[blockIndex] = {
            ...updatedBlocks[blockIndex],
            items: [...updatedBlocks[blockIndex].items, ...newItemsWithId]
          }
          next[courseId] = updatedBlocks
          break
        }
      }
      return next
    })
    return newItemsWithId
  }, [])

  const toggleItem = React.useCallback(async (itemId: string, completed: boolean) => {
    setCourseDetails(prev => {
      const next = { ...prev }
      let foundCourseId = ''
      for (const courseId in next) {
        const blocks = next[courseId]
        const updatedBlocks = blocks.map(block => {
          const itemIndex = block.items.findIndex(i => i.id === itemId)
          if (itemIndex !== -1) {
            foundCourseId = courseId
            const updatedItems = [...block.items]
            updatedItems[itemIndex] = { ...updatedItems[itemIndex], completed }
            return { ...block, items: updatedItems }
          }
          return block
        })
        next[courseId] = updatedBlocks
      }

      // Update course progress if found
      if (foundCourseId) {
        setCourses(coursesPrev => coursesPrev.map(c => {
          if (c.id === foundCourseId) {
            let total = 0
            let completedCount = 0
            next[foundCourseId].forEach(b => {
              total += b.items.length
              completedCount += b.items.filter(i => i.completed).length
            })
            const progress = total === 0 ? 0 : Math.round((completedCount / total) * 100)
            return { ...c, totalVideos: total, completedVideos: completedCount, progress }
          }
          return c
        }))
      }
      
      return next
    })
  }, [])

  const updateBlockTitle = React.useCallback(async (blockId: string, title: string) => {
    setCourseDetails(prev => {
      const next = { ...prev }
      for (const courseId in next) {
        const blocks = next[courseId]
        const blockIndex = blocks.findIndex(b => b.id === blockId)
        if (blockIndex !== -1) {
          const updatedBlocks = [...blocks]
          updatedBlocks[blockIndex] = { ...updatedBlocks[blockIndex], title }
          next[courseId] = updatedBlocks
          break
        }
      }
      return next
    })
  }, [])

  const updateCourseBlocks = React.useCallback((courseId: string, blocks: DayBlockData[]) => {
    setCourseDetails(prev => ({ ...prev, [courseId]: blocks }))
    setCourses(prev => prev.map(c => {
      if (c.id === courseId) {
        let total = 0
        let completed = 0
        blocks.forEach(b => {
          total += b.items.length
          completed += b.items.filter(i => i.completed).length
        })
        const progress = total === 0 ? 0 : Math.round((completed / total) * 100)
        return { ...c, totalVideos: total, completedVideos: completed, progress }
      }
      return c
    }))
  }, [])

  return (
    <StoreContext.Provider value={{
      courses, courseDetails, isLoaded,
      addCourse, updateCourseBlocks,
      fetchCourses, fetchCourseDetail,
      addDayBlock, addItemsToBlock, toggleItem, updateBlockTitle,
      deleteCourse, deleteDayBlock
    }}>
      {children}
    </StoreContext.Provider>
  )
}

export function useStore() {
  const context = React.useContext(StoreContext)
  if (!context) throw new Error("useStore must be used within StoreProvider")
  return context
}

