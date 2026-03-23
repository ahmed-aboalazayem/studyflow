"use client"

import * as React from "react"
import type { CourseData } from "@/components/course/CourseCard"
import type { DayBlockData } from "@/components/course/DayBlock"
import { 
  getCourses, 
  addCourse as addCourseAction, 
  deleteCourse as deleteCourseAction,
  addDayBlock as addDayBlockAction,
  deleteDayBlock as deleteDayBlockAction,
  addItemsToBlock as addItemsToBlockAction,
  toggleItem as toggleItemAction,
  updateBlockTitle as updateBlockTitleAction
} from "@/app/actions"

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

  const fetchCourses = React.useCallback(async () => {
    const data = await getCourses()
    // Transform Prisma data to Store state
    const mappedCourses: CourseData[] = data.map((c: any) => ({
      id: c.id,
      title: c.title,
      imageUrl: c.imageUrl,
      progress: c.progress,
      totalVideos: c.totalVideos,
      completedVideos: c.completedVideos,
      ownership: c.ownership as any,
      ownerName: c.ownerName
    }))
    
    const details: Record<string, DayBlockData[]> = {}
    data.forEach((c: any) => {
      details[c.id] = c.dayBlocks.map((b: any) => ({
        id: b.id,
        title: b.title,
        items: b.items.map((i: any) => ({
          id: i.id,
          title: i.title,
          duration: i.duration,
          completed: i.progress && i.progress.length > 0 ? i.progress[0].completed : false,
          updatedAt: i.updatedAt,
          progress: i.progress
        }))
      }))
    })

    setCourses(mappedCourses)
    setCourseDetails(details)
    setIsLoaded(true)
  }, [])

  // Initial load
  React.useEffect(() => {
    fetchCourses()
  }, [fetchCourses])

  const fetchCourseDetail = React.useCallback(async (courseId: string) => {
    // Already loaded in fetchCourses for now as it fetches the graph
  }, [])

  const addCourse = React.useCallback(async (course: Partial<CourseData>) => {
    const result = await addCourseAction({
      title: course.title || 'Untitled Course',
      imageUrl: course.imageUrl || ''
    })
    
    if ('error' in result) throw new Error(result.error)
    
    await fetchCourses()
    return result as any
  }, [fetchCourses])

  const deleteCourse = React.useCallback(async (id: string) => {
    await deleteCourseAction(id)
    await fetchCourses()
  }, [fetchCourses])

  const addDayBlock = React.useCallback(async (courseId: string, title: string) => {
    const result = await addDayBlockAction(courseId, title)
    if ('error' in result) throw new Error(result.error)
    
    await fetchCourses()
    return result as any
  }, [fetchCourses])

  const deleteDayBlock = React.useCallback(async (courseId: string, blockId: string) => {
    await deleteDayBlockAction(courseId, blockId)
    await fetchCourses()
  }, [fetchCourses])

  const addItemsToBlock = React.useCallback(async (blockId: string, items: { title: string; duration: string }[]) => {
    const result = await addItemsToBlockAction(blockId, items)
    if ('error' in result) throw new Error(result.error)
    
    await fetchCourses()
    return result
  }, [fetchCourses])

  const toggleItem = React.useCallback(async (itemId: string, completed: boolean) => {
    await toggleItemAction(itemId, completed)
    await fetchCourses()
  }, [fetchCourses])

  const updateBlockTitle = React.useCallback(async (blockId: string, title: string) => {
    await updateBlockTitleAction(blockId, title)
    await fetchCourses()
  }, [fetchCourses])

  const updateCourseBlocks = React.useCallback((courseId: string, blocks: DayBlockData[]) => {
    // This was mostly used for local UI updates, but with DB we should ideally 
    // have a proper sort order mutation. For now, we refresh from DB.
    fetchCourses()
  }, [fetchCourses])

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


