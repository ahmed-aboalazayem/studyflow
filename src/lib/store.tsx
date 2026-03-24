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
  toggleAllInBlockAction,
  updateBlockTitle as updateBlockTitleAction,
  deleteAccount as deleteAccountAction
} from "@/app/actions"

export interface Course {
  id: string
  title: string
  imageUrl: string
  progress: number
  totalVideos: number
  completedVideos: number
  ownership?: 'owned' | 'shared'
  ownerName?: string | null
}

interface StoreState {
  courses: Course[]
  courseDetails: Record<string, DayBlockData[]>
  isLoaded: boolean
  addCourse: (course: { title: string; imageUrl: string }) => Promise<any>
  updateCourseBlocks: (courseId: string, blocks: DayBlockData[]) => void
  fetchCourses: () => Promise<void>
  fetchCourseDetail: (courseId: string) => Promise<void>
  addDayBlock: (courseId: string, title: string) => Promise<DayBlockData>
  addItemsToBlock: (blockId: string, items: { title: string; duration: string }[]) => Promise<any>
  toggleItem: (itemId: string, completed: boolean) => Promise<void>
  toggleAllInBlock: (blockId: string, completed: boolean) => Promise<void>
  updateBlockTitle: (blockId: string, title: string) => Promise<void>
  deleteCourse: (courseId: string) => Promise<void>
  deleteDayBlock: (courseId: string, blockId: string) => Promise<void>
  deleteAccount: () => Promise<any>
  recentlySharedWith: string[]
  addRecentlyShared: (username: string) => void
}

const StoreContext = React.createContext<StoreState | undefined>(undefined)

export function StoreProvider({ children }: { children: React.ReactNode }) {
  const [courses, setCourses] = React.useState<Course[]>([])
  const [courseDetails, setCourseDetails] = React.useState<Record<string, DayBlockData[]>>({})
  const [isLoaded, setIsLoaded] = React.useState(false)
  const [recentlySharedWith, setRecentlySharedWith] = React.useState<string[]>([])

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
    // Load recently shared from localStorage
    const saved = localStorage.getItem('studyflow_recent_shares')
    if (saved) {
      try {
        setRecentlySharedWith(JSON.parse(saved))
      } catch (e) {
        console.error('Failed to parse recent shares', e)
      }
    }
  }, [fetchCourses])

  const addRecentlyShared = React.useCallback((username: string) => {
    setRecentlySharedWith(prev => {
      const filtered = prev.filter(u => u !== username)
      const next = [username, ...filtered].slice(0, 5) // Keep last 5
      localStorage.setItem('studyflow_recent_shares', JSON.stringify(next))
      return next
    })
  }, [])

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

  const deleteAccount = React.useCallback(async () => {
    const res = await deleteAccountAction()
    if (res.success) {
      setCourses([])
      setCourseDetails({})
      setIsLoaded(false)
      window.location.href = '/login'
    }
    return res
  }, [])

  const addItemsToBlock = React.useCallback(async (blockId: string, items: { title: string; duration: string }[]) => {
    const result = await addItemsToBlockAction(blockId, items)
    if ('error' in result) throw new Error(result.error)
    
    await fetchCourses()
    return result
  }, [fetchCourses])

  const toggleItem = React.useCallback(async (itemId: string, completed: boolean) => {
    // 1. Find the item and course first to avoid stale state in calculations
    let targetCourseId: string | undefined;
    
    // We search through the current state to find which course this item belongs to
    // This allows us to update the course progress correctly
    for (const [id, blocks] of Object.entries(courseDetails)) {
      if (blocks.some(b => b.items.some(i => i.id === itemId))) {
        targetCourseId = id;
        break;
      }
    }

    if (!targetCourseId) {
      // Fallback: just hit the API and refresh
      await toggleItemAction(itemId, completed)
      await fetchCourses()
      return
    }

    // 2. Optimistic Update Course Details
    setCourseDetails(prev => {
      const courseBlocks = prev[targetCourseId!];
      if (!courseBlocks) return prev;

      const nextBlocks = courseBlocks.map(block => {
        const itemIdx = block.items.findIndex(i => i.id === itemId);
        if (itemIdx === -1) return block;

        const nextItems = [...block.items];
        nextItems[itemIdx] = { ...nextItems[itemIdx], completed };
        return { ...block, items: nextItems };
      });

      return { ...prev, [targetCourseId!]: nextBlocks };
    });

    // 3. Optimistic Update Courses List (Progress)
    setCourses(prev => prev.map(c => {
      if (c.id !== targetCourseId) return c;
      
      const delta = completed ? 1 : -1;
      const nextCompleted = Math.max(0, Math.min(c.totalVideos, c.completedVideos + delta));
      return {
        ...c,
        completedVideos: nextCompleted,
        progress: c.totalVideos === 0 ? 0 : Math.round((nextCompleted / c.totalVideos) * 100)
      };
    }));

    // 4. Server Update
    try {
      const result = await toggleItemAction(itemId, completed)
      if ('error' in result) throw new Error(result.error)
      // Final sync to ensure everything matches server truth (e.g. updatedAt timestamps)
      await fetchCourses()
    } catch (err) {
      console.error("Failed to toggle item", err)
      // Rollback on error
      await fetchCourses()
    }
  }, [courseDetails, fetchCourses])

  const toggleAllInBlock = React.useCallback(async (blockId: string, completed: boolean) => {
    // 1. Find courseId first
    let targetCourseId: string | undefined;
    for (const [id, blocks] of Object.entries(courseDetails)) {
      if (blocks.some(b => b.id === blockId)) {
        targetCourseId = id;
        break;
      }
    }

    if (!targetCourseId) {
      await toggleAllInBlockAction(blockId, completed)
      await fetchCourses()
      return
    }

    // 2. Optimistic Update Course Details
    setCourseDetails(prev => {
      const courseBlocks = prev[targetCourseId!];
      if (!courseBlocks) return prev;

      const nextBlocks = courseBlocks.map(block => {
        if (block.id !== blockId) return block;
        return {
          ...block,
          items: block.items.map(item => ({ ...item, completed }))
        };
      });

      return { ...prev, [targetCourseId!]: nextBlocks };
    });

    // 3. Optimistic Update Courses List (Progress)
    setCourses(prev => prev.map(c => {
      if (c.id !== targetCourseId) return c;
      
      const blocks = courseDetails[targetCourseId!];
      const targetBlock = blocks.find(b => b.id === blockId);
      if (!targetBlock) return c;

      // Calculate how many were completed in this block before the change
      const previousBlockCompleted = targetBlock.items.filter(i => i.completed).length;
      const nextBlockCompleted = completed ? targetBlock.items.length : 0;
      const delta = nextBlockCompleted - previousBlockCompleted;

      const nextCompleted = Math.max(0, Math.min(c.totalVideos, c.completedVideos + delta));
      return {
        ...c,
        completedVideos: nextCompleted,
        progress: c.totalVideos === 0 ? 0 : Math.round((nextCompleted / c.totalVideos) * 100)
      };
    }));

    // 4. Server Update
    try {
      const result = await toggleAllInBlockAction(blockId, completed)
      if ('error' in result) throw new Error(result.error)
      await fetchCourses()
    } catch (err) {
      console.error("Failed to toggle all in block", err)
      await fetchCourses()
    }
  }, [courseDetails, fetchCourses])

  const updateBlockTitle = React.useCallback(async (blockId: string, title: string) => {
    // Optimistic Update
    setCourseDetails(prev => {
      const next = { ...prev }
      for (const courseId in next) {
        const blockIdx = next[courseId].findIndex(b => b.id === blockId)
        if (blockIdx > -1) {
          const nextBlocks = [...next[courseId]]
          nextBlocks[blockIdx] = { ...nextBlocks[blockIdx], title }
          next[courseId] = nextBlocks
          break
        }
      }
      return next
    })

    try {
      await updateBlockTitleAction(blockId, title)
      await fetchCourses()
    } catch (err) {
      console.error("Failed to update block title", err)
      await fetchCourses()
    }
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
      addDayBlock, addItemsToBlock, toggleItem, toggleAllInBlock, updateBlockTitle,
      deleteCourse, deleteDayBlock, deleteAccount,
      recentlySharedWith, addRecentlyShared
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


