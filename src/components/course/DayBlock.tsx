"use client"

import * as React from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Plus, Edit2, Play, CheckCircle2, Clock, Trash2, Star } from "lucide-react"
import { useParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { ChecklistItem, type ChecklistItemData } from "./ChecklistItem"
import { formatSecondsToDuration, parseDurationToSeconds } from "@/lib/utils"
import { useStore } from "@/lib/store"
import { Modal } from "@/components/ui/Modal"
import { playSound } from "@/lib/sounds"

export interface DayBlockData {
  id: string
  title: string
  items: ChecklistItemData[]
}

interface DayBlockProps {
  block: DayBlockData
  isCurrentStudy?: boolean
  onChange?: (block: DayBlockData) => void
  onItemComplete?: () => void
}

export const DayBlock = React.memo(({ block: initialBlock, onChange, isCurrentStudy = false, onItemComplete }: DayBlockProps) => {
  const [block, setBlockState] = React.useState(initialBlock)
  const [isCelebrating, setIsCelebrating] = React.useState(false)
  const prevProgressRef = React.useRef(0)

  // Sync when parent updates the block (e.g., after API fetch)
  React.useEffect(() => {
    setBlockState(initialBlock)
  }, [initialBlock])

  const setBlock = React.useCallback((action: React.SetStateAction<DayBlockData>) => {
    setBlockState(prev => {
      const next = typeof action === 'function' ? action(prev) : action
      setTimeout(() => onChange?.(next), 0)
      return next
    })
  }, [onChange])

  const [isEditingTitle, setIsEditingTitle] = React.useState(false)
  const [titleInput, setTitleInput] = React.useState(block.title)
  const [isPasting, setIsPasting] = React.useState(false)
  const [pasteText, setPasteText] = React.useState("")
  const [showDeleteModal, setShowDeleteModal] = React.useState(false)

  const { updateBlockTitle, addItemsToBlock, toggleItem: storeToggleItem, toggleAllInBlock, deleteDayBlock, toggleItemImportant } = useStore()
  const params = useParams()
  const courseId = params.id as string

  const titleInputRef = React.useRef<HTMLInputElement>(null)

  React.useEffect(() => {
    if (isEditingTitle && titleInputRef.current) {
      titleInputRef.current.focus()
    }
  }, [isEditingTitle])

  const handleDeleteBlock = async () => {
    setShowDeleteModal(true)
  }

  const confirmDelete = async () => {
    await deleteDayBlock(courseId, block.id)
    setShowDeleteModal(false)
  }

  const handleTitleSubmit = async (e?: React.FormEvent) => {
    e?.preventDefault()
    if (titleInput.trim()) {
      try {
        await updateBlockTitle(block.id, titleInput.trim())
      } catch (err) {
        console.error("Failed to update block title", err)
      }
    } else {
      setTitleInput(block.title)
    }
    setIsEditingTitle(false)
  }

  const handleProcessPaste = async () => {
    if (!pasteText.trim()) return

    const lines = pasteText.split(/\r?\n/).filter(line => line.trim())
    const newItems: { title: string; duration: string }[] = lines.map((line) => {
      const match = line.match(/(.+?)(?:\s*-\s*|\s+)(\d{1,2}:\d{2}(?::\d{2})?)\s*$/i)
      let title = line.trim()
      let duration = ""

      if (match) {
        title = match[1].trim()
        duration = match[2].trim()
      }

      return { title, duration }
    })

    try {
      await addItemsToBlock(block.id, newItems)
    } catch (err) {
      console.error("Failed to add items", err)
    }

    setPasteText("")
    setIsPasting(false)
  }

  const toggleItem = async (id: string, completed: boolean) => {
    try {
      await storeToggleItem(id, completed)
    } catch (err) {
      console.error("Failed to toggle item", err)
    }
  }

  const doToggleImportant = async (id: string, isImportant: boolean) => {
    try {
      if (toggleItemImportant) {
        await toggleItemImportant(id, isImportant)
      }
    } catch (err) {
      console.error("Failed to toggle important", err)
    }
  }

  const blockDurationSeconds = React.useMemo(() => {
    return block.items.reduce((acc, item) => acc + parseDurationToSeconds(item.duration), 0)
  }, [block.items])

  const completedDurationSeconds = React.useMemo(() => {
    return block.items.reduce((acc, item) => item.completed ? acc + parseDurationToSeconds(item.duration) : acc, 0)
  }, [block.items])

  const progress = blockDurationSeconds === 0 
    ? 0 
    : Math.round((completedDurationSeconds / blockDurationSeconds) * 100)

  // Detect 100% completion → celebration
  React.useEffect(() => {
    if (progress === 100 && prevProgressRef.current < 100 && block.items.length > 0) {
      setIsCelebrating(true)
      playSound('blockComplete')
      setTimeout(() => setIsCelebrating(false), 2500)
    }
    prevProgressRef.current = progress
  }, [progress, block.items.length])

  const blockFormattedTime = formatSecondsToDuration(blockDurationSeconds)

  const importantCount = React.useMemo(() => block.items.filter(i => i.isImportant).length, [block.items])
  const isKingMood = importantCount > 0

  const [isOpen, setIsOpen] = React.useState(isCurrentStudy)

  const toggleAccordion = (e: React.MouseEvent) => {
    // Prevent toggling if clicking on buttons or inputs
    const target = e.target as HTMLElement
    if (target.closest('button') || target.closest('input') || isEditingTitle) return
    setIsOpen(!isOpen)
  }

  return (
    <Card className={`mb-8 overflow-hidden group/card transition-all will-change-[border-color] ${
      isCelebrating
        ? 'border-amber-400/80 bg-amber-500/5 shadow-[0_0_60px_rgba(251,191,36,0.4)]'
        : isKingMood 
          ? 'border-amber-500/40 bg-amber-500/5 shadow-[0_0_40px_rgba(245,158,11,0.15)] hover:border-amber-500/60' 
          : 'border-white/5 bg-black/20 hover:border-white/10'
    }`}>
      {/* Accordion Header */}
      <div 
        className="p-6 cursor-pointer select-none"
        onClick={toggleAccordion}
      >
        <div className="flex items-start justify-between mb-4">
          <div className="flex-1">
            {isEditingTitle ? (
              <form onSubmit={handleTitleSubmit} className="flex items-center gap-2" onClick={e => e.stopPropagation()}>
                <input
                  ref={titleInputRef}
                  value={titleInput}
                  onChange={(e) => setTitleInput(e.target.value)}
                  onBlur={() => handleTitleSubmit()}
                  className="bg-white/10 border border-white/20 rounded-lg px-3 py-1.5 text-xl font-bold text-white focus:outline-none focus:ring-2 focus:ring-primary w-full max-w-sm"
                />
              </form>
            ) : (
              <div className="flex items-center gap-3 group/title">
                <h2 className="text-xl font-bold text-white tracking-tight">{block.title}</h2>
                <button 
                  onClick={(e) => { e.stopPropagation(); setIsEditingTitle(true); }}
                  className="p-1.5 rounded-md opacity-20 group-hover/title:opacity-100 transition-opacity hover:bg-white/10 text-foreground/60 hover:text-white shrink-0"
                >
                  <Edit2 className="w-4 h-4" />
                </button>
                <button 
                  onClick={(e) => { e.stopPropagation(); handleDeleteBlock(); }}
                  className="p-1.5 rounded-md opacity-20 group-hover/title:opacity-100 transition-opacity hover:bg-red-500/10 text-foreground/40 hover:text-red-500 shrink-0"
                  title="Delete Day"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            )}
            
            <div className="flex flex-wrap items-center gap-3 md:gap-4 mt-3 text-xs md:text-sm text-foreground/60">
              <span className={`flex items-center gap-1.5 px-2 py-1 rounded-md ${isKingMood ? 'bg-amber-500/10 text-amber-500/80' : 'bg-white/5'}`}>
                <Play className="w-3.5 h-3.5 text-primary" />
                {block.items.length} Videos
              </span>
              {isKingMood && (
                <span className="flex items-center gap-1.5 bg-amber-500/20 text-amber-400 px-2 py-1 rounded-md font-bold shadow-[0_0_10px_rgba(245,158,11,0.2)]">
                  <Star className="w-3.5 h-3.5 fill-amber-400" />
                  {importantCount} Important
                </span>
              )}
              <span className={`flex items-center gap-1.5 px-2 py-1 rounded-md font-mono ${isKingMood ? 'bg-amber-500/10 text-amber-500/80' : 'bg-white/5'}`}>
                <Clock className="w-3.5 h-3.5" />
                {blockFormattedTime}
              </span>
              <span className="flex items-center gap-1.5 bg-emerald-500/10 text-emerald-400 px-2 py-1 rounded-md font-bold">
                <CheckCircle2 className="w-3.5 h-3.5" />
                {progress}% Complete
              </span>
              
              {block.items.length > 0 && (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    const allDone = block.items.every(i => i.completed);
                    toggleAllInBlock(block.id, !allDone);
                  }}
                  className="md:ml-2 px-2.5 py-1 rounded-md bg-white/5 border border-white/10 text-[10px] font-black uppercase tracking-wider hover:bg-primary/20 hover:border-primary/50 hover:text-white transition-all active:scale-95 flex items-center gap-1.5 group/btn"
                >
                  <div className={`w-1.5 h-1.5 rounded-full ${block.items.every(i => i.completed) ? "bg-emerald-500" : "bg-primary shadow-[0_0_5px_rgba(255,31,31,0.5)]"}`} />
                  {block.items.every(i => i.completed) ? "Uncheck All" : "Check All"}
                </button>
              )}
            </div>
          </div>

          <motion.div
            animate={{ rotate: isOpen ? 180 : 0 }}
            transition={{ duration: 0.3 }}
            className="p-2 rounded-full bg-white/5 text-foreground/40 group-hover/card:text-white group-hover/card:bg-white/10 will-change-transform"
          >
            <Plus className="w-5 h-5" />
          </motion.div>
        </div>

        {/* Improved Progress Bar in Header */}
        <div className="relative w-full h-1.5 bg-white/5 rounded-full overflow-hidden">
          <motion.div
            initial={false}
            animate={{ width: `${progress}%` }}
            transition={{ duration: 1, ease: "circOut" }}
            className={`h-full bg-gradient-to-r ${progress >= 100 ? "from-emerald-500 to-teal-400" : "from-primary to-accent"} shadow-[0_0_10px_rgba(255,31,31,0.5)] will-change-[width]`}
          />
        </div>
      </div>

      {/* Accordion Content */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3, ease: "easeOut" }}
            className="will-change-[height,opacity]"
          >
            <div className="px-6 pb-6 pt-2 border-t border-white/5">
              {/* Items List */}
              <div className="space-y-3 mb-6">
                <AnimatePresence mode="popLayout">
                  {block.items.map((item, index) => (
                    <ChecklistItem 
                      key={item.id} 
                      item={item} 
                      index={index}
                      onToggle={toggleItem}
                      onToggleImportant={doToggleImportant}
                      onComplete={onItemComplete}
                    />
                  ))}
                </AnimatePresence>
                
                {block.items.length === 0 && !isPasting && (
                  <div className="text-center py-8 text-foreground/40 border-2 border-dashed border-white/5 rounded-xl">
                    No videos added yet.
                  </div>
                )}
              </div>

              {/* Bulk Paste Area */}
              {isPasting ? (
                <motion.div 
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="bg-white/5 border border-primary/30 rounded-xl p-4 space-y-3"
                >
                  <textarea
                    value={pasteText}
                    onChange={(e) => setPasteText(e.target.value)}
                    placeholder={"Paste syllabus here...\nReact Basics - 10:30\nHooks Deep Dive - 15:45"}
                    className="w-full h-32 bg-black/40 border border-white/10 rounded-lg p-3 text-sm text-white placeholder:text-foreground/40 focus:outline-none focus:ring-2 focus:ring-primary resize-none"
                  />
                  <div className="flex items-center justify-end gap-2">
                    <Button variant="ghost" size="sm" onClick={() => setIsPasting(false)}>Cancel</Button>
                    <Button size="sm" onClick={handleProcessPaste} className="gap-1.5">
                      <Plus className="w-4 h-4" />
                      Generate List
                    </Button>
                  </div>
                </motion.div>
              ) : (
                <Button 
                  variant="glass" 
                  className="w-full border-dashed border-2 bg-transparent hover:bg-white/5 py-6 text-foreground/60 transition-all hover:text-white"
                  onClick={() => setIsPasting(true)}
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Add Videos (Bulk Paste)
                </Button>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <Modal 
        isOpen={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        title="Delete Day?"
        description={`Are you sure you want to delete "${block.title}"? This will remove all videos in this day. This action cannot be undone.`}
        type="error"
        actionText="Delete Day"
        onAction={confirmDelete}
      />
    </Card>
  )
})
export function DayBlockSkeleton() {
  return (
    <Card className="mb-8 border-white/5 bg-black/20 animate-pulse">
      <div className="p-6">
        <div className="flex items-start justify-between mb-6">
          <div className="flex-1 space-y-3">
            <div className="h-7 w-48 bg-white/10 rounded-lg" />
            <div className="flex items-center gap-4">
              <div className="h-4 w-20 bg-white/5 rounded-lg" />
              <div className="h-4 w-20 bg-white/5 rounded-lg" />
              <div className="h-4 w-24 bg-white/10 rounded-lg" />
            </div>
          </div>
        </div>
        <div className="w-full h-1.5 bg-white/5 rounded-full mb-8" />
        <div className="space-y-3 mb-6">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-12 w-full bg-white/5 rounded-xl border border-white/5" />
          ))}
        </div>
        <div className="h-12 w-full bg-white/5 rounded-xl border-dashed border-2 border-white/5" />
      </div>
    </Card>
  )
}
