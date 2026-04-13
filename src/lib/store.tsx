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
  deleteAccount as deleteAccountAction,
  toggleItemImportant as toggleItemImportantAction,
  getFolders as getFoldersAction,
  createFolder as createFolderAction,
  deleteFolder as deleteFolderAction,
  moveCourseToFolder as moveCourseToFolderAction,
  renameFolder as renameFolderAction
} from "@/app/actions"

export interface Course {
  id: string
  title: string
  imageUrl: string
  progress: number
  totalVideos: number
  completedVideos: number
  totalTimeSeconds?: number
  completedTimeSeconds?: number
  ownership?: 'owned' | 'shared'
  ownerName?: string | null
  folderId?: string | null
  createdAt: string
}

export interface Folder {
  id: string
  name: string
  createdAt: string
}

interface StoreState {
  courses: Course[]
  folders: Folder[]
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
  toggleItemImportant: (itemId: string, isImportant: boolean) => Promise<void>
  createFolder: (name: string) => Promise<void>
  deleteFolder: (folderId: string) => Promise<void>
  renameFolder: (folderId: string, name: string) => Promise<void>
  moveCourseToFolder: (courseId: string, folderId: string | null) => Promise<void>
  searchQuery: string
  setSearchQuery: (query: string) => void
  isAddFolderModalOpen: boolean
  setIsAddFolderModalOpen: (open: boolean) => void
}

const StoreContext = React.createContext<StoreState | undefined>(undefined)

export function StoreProvider({ children }: { children: React.ReactNode }) {
  const [courses, setCourses] = React.useState<Course[]>([])
  const [folders, setFolders] = React.useState<Folder[]>([])
  const [courseDetails, setCourseDetails] = React.useState<Record<string, DayBlockData[]>>({})
  const [isLoaded, setIsLoaded] = React.useState(false)
  const [searchQuery, setSearchQuery] = React.useState("")
  const [isAddFolderModalOpen, setIsAddFolderModalOpen] = React.useState(false)

  const fetchCourses = React.useCallback(async () => {
    const data = await getCourses()
    // Transform Prisma data to Store state
    const mappedCourses: Course[] = data.map((c: any) => ({
      id: c.id,
      title: c.title,
      imageUrl: c.imageUrl,
      progress: c.progress,
      totalVideos: c.totalVideos,
      completedVideos: c.completedVideos,
      totalTimeSeconds: c.totalTimeSeconds,
      completedTimeSeconds: c.completedTimeSeconds,
      ownership: c.ownership as any,
      ownerName: c.ownerName,
      folderId: c.folderId,
      createdAt: c.createdAt?.toString() ?? new Date().toISOString()
    }))

    const folderData = await getFoldersAction()
    const mappedFolders: Folder[] = folderData.map((f: any) => ({
      id: f.id,
      name: f.name,
      createdAt: f.createdAt?.toString() ?? new Date().toISOString()
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
          isImportant: i.isImportant || false,
          completed: i.progress && i.progress.length > 0 ? i.progress[0].completed : false,
          updatedAt: i.updatedAt,
          progress: i.progress
        }))
      }))
    })

    setCourses(mappedCourses)
    setFolders(mappedFolders)
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
      
      const targetBlock = courseDetails[targetCourseId!].find(b => b.items.some(i => i.id === itemId));
      const targetItem = targetBlock?.items.find(i => i.id === itemId);
      let durationSecs = 0;
      if (targetItem) {
        const parts = targetItem.duration.split(':').map(Number);
        if (parts.length === 2) durationSecs = parts[0]*60 + parts[1];
        else if (parts.length === 3) durationSecs = parts[0]*3600 + parts[1]*60 + parts[2];
      }
      
      const deltaCount = completed ? 1 : -1;
      const nextCompletedCount = Math.max(0, Math.min(c.totalVideos, c.completedVideos + deltaCount));
      const deltaSecs = completed ? durationSecs : -durationSecs;
      const totalSecs = c.totalTimeSeconds || 0;
      const completedSecs = Math.max(0, Math.min(totalSecs, (c.completedTimeSeconds || 0) + deltaSecs));
      
      return {
        ...c,
        completedVideos: nextCompletedCount,
        completedTimeSeconds: completedSecs,
        progress: totalSecs === 0 ? 0 : Math.round((completedSecs / totalSecs) * 100)
      };
    }));

    // 4. Server Update
    try {
      const result = await toggleItemAction(itemId, completed)
      if ('error' in result) throw new Error(result.error)
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

      // Calculate time delta
      let blockTotalSecs = 0;
      let blockCompletedSecs = 0;
      targetBlock.items.forEach(i => {
        let sec = 0;
        const parts = i.duration.split(':').map(Number);
        if (parts.length === 2) sec = parts[0]*60 + parts[1];
        else if (parts.length === 3) sec = parts[0]*3600 + parts[1]*60 + parts[2];
        blockTotalSecs += sec;
        if (i.completed) blockCompletedSecs += sec;
      });
      const nextBlockCompletedSecs = completed ? blockTotalSecs : 0;
      const deltaSecs = nextBlockCompletedSecs - blockCompletedSecs;
      const totalSecs = c.totalTimeSeconds || 0;
      const completedSecs = Math.max(0, Math.min(totalSecs, (c.completedTimeSeconds || 0) + deltaSecs));

      return {
        ...c,
        completedVideos: nextCompleted,
        completedTimeSeconds: completedSecs,
        progress: totalSecs === 0 ? 0 : Math.round((completedSecs / totalSecs) * 100)
      };
    }));

    // 4. Server Update
    try {
      const result = await toggleAllInBlockAction(blockId, completed)
      if ('error' in result) throw new Error(result.error)
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

  const toggleItemImportant = React.useCallback(async (itemId: string, isImportant: boolean) => {
    let targetCourseId: string | undefined;
    for (const [id, blocks] of Object.entries(courseDetails)) {
      if (blocks.some(b => b.items.some(i => i.id === itemId))) {
        targetCourseId = id;
        break;
      }
    }

    if (!targetCourseId) {
      await toggleItemImportantAction(itemId, isImportant)
      await fetchCourses()
      return
    }

    // Optimistic Update
    setCourseDetails(prev => {
      const courseBlocks = prev[targetCourseId!];
      if (!courseBlocks) return prev;

      const nextBlocks = courseBlocks.map(block => {
        const itemIdx = block.items.findIndex(i => i.id === itemId);
        if (itemIdx === -1) return block;
        const nextItems = [...block.items];
        nextItems[itemIdx] = { ...nextItems[itemIdx], isImportant };
        return { ...block, items: nextItems };
      });

      return { ...prev, [targetCourseId!]: nextBlocks };
    });

    try {
      const result = await toggleItemImportantAction(itemId, isImportant)
      if ('error' in result) throw new Error(result.error)
    } catch (err) {
      console.error("Failed to toggle important", err)
      await fetchCourses()
    }
  }, [courseDetails, fetchCourses])

  const createFolder = React.useCallback(async (name: string) => {
    // Optimistic Update
    const tempId = `temp-${Date.now()}`
    const newFolder: Folder = {
      id: tempId,
      name,
      createdAt: new Date().toISOString()
    }
    setFolders(prev => [newFolder, ...prev])

    try {
      await createFolderAction(name)
      await fetchCourses()
    } catch (err) {
      console.error("Failed to create folder", err)
      await fetchCourses()
    }
  }, [fetchCourses])

  const deleteFolder = React.useCallback(async (id: string) => {
    // Optimistic Update
    setFolders(prev => prev.filter(f => f.id !== id))
    // Move courses back to root optimistically
    setCourses(prev => prev.map(c => c.id === id ? { ...c, folderId: null } : c))

    try {
      await deleteFolderAction(id)
      await fetchCourses()
    } catch (err) {
      console.error("Failed to delete folder", err)
      await fetchCourses()
    }
  }, [fetchCourses])

  const renameFolder = React.useCallback(async (id: string, name: string) => {
    // Optimistic Update
    setFolders(prev => prev.map(f => f.id === id ? { ...f, name } : f))

    try {
      await renameFolderAction(id, name)
    } catch (err) {
      console.error("Failed to rename folder", err)
      await fetchCourses()
    }
  }, [fetchCourses])

  const moveCourseToFolder = React.useCallback(async (courseId: string, folderId: string | null) => {
    // Optimistic Update
    setCourses(prev => prev.map(c => c.id === courseId ? { ...c, folderId } : c))

    try {
      await moveCourseToFolderAction(courseId, folderId)
    } catch (err) {
      console.error("Failed to move course", err)
      await fetchCourses()
    }
  }, [fetchCourses])

  return (
    <StoreContext.Provider value={{
      courses, folders, courseDetails, isLoaded,
      addCourse, updateCourseBlocks,
      fetchCourses, fetchCourseDetail,
      addDayBlock, addItemsToBlock, toggleItem, toggleAllInBlock, updateBlockTitle, toggleItemImportant,
      deleteCourse, deleteDayBlock, deleteAccount,
      createFolder, deleteFolder, renameFolder, moveCourseToFolder,
      searchQuery, setSearchQuery,
      isAddFolderModalOpen, setIsAddFolderModalOpen
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


