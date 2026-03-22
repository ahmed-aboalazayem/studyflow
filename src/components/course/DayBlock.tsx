"use client"

import * as React from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Plus, Edit2, Play, CheckCircle2, Clock, Trash2 } from "lucide-react"
import { useParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { ChecklistItem, type ChecklistItemData } from "./ChecklistItem"
import { parseDurationToSeconds, formatSecondsToDuration } from "@/lib/utils"
import { useStore } from "@/lib/store"

export interface DayBlockData {
  id: string
  title: string
  items: ChecklistItemData[]
}

interface DayBlockProps {
  block: DayBlockData
  onChange?: (block: DayBlockData) => void
}

export function DayBlock({ block: initialBlock, onChange }: DayBlockProps) {
  const [block, setBlockState] = React.useState(initialBlock)

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

  const { updateBlockTitle, addItemsToBlock, toggleItem: storeToggleItem, deleteDayBlock } = useStore()
  const params = useParams()
  const courseId = params.id as string

  const titleInputRef = React.useRef<HTMLInputElement>(null)

  React.useEffect(() => {
    if (isEditingTitle && titleInputRef.current) {
      titleInputRef.current.focus()
    }
  }, [isEditingTitle])

  const handleDeleteBlock = async () => {
    if (confirm(`Are you sure you want to delete "${block.title}"?`)) {
      await deleteDayBlock(courseId, block.id)
    }
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

  const progress = block.items.length === 0 
    ? 0 
    : Math.round((block.items.filter(i => i.completed).length / block.items.length) * 100)

  const blockDurationSeconds = React.useMemo(() => {
    return block.items.reduce((acc, item) => acc + parseDurationToSeconds(item.duration), 0)
  }, [block.items])
  const blockFormattedTime = formatSecondsToDuration(blockDurationSeconds)

  return (
    <Card className="mb-8 border-white/5 bg-black/20">
      <div className="p-6">
        <div className="flex items-start justify-between mb-6">
          <div className="flex-1">
            {isEditingTitle ? (
              <form onSubmit={handleTitleSubmit} className="flex items-center gap-2">
                <input
                  ref={titleInputRef}
                  value={titleInput}
                  onChange={(e) => setTitleInput(e.target.value)}
                  onBlur={() => handleTitleSubmit()}
                  className="bg-white/10 border border-white/20 rounded-lg px-3 py-1.5 text-xl font-bold text-white focus:outline-none focus:ring-2 focus:ring-primary w-full max-w-sm"
                />
              </form>
            ) : (
              <div className="flex items-center gap-3 group">
                <h2 className="text-xl font-bold text-white tracking-tight">{block.title}</h2>
                <button 
                  onClick={() => setIsEditingTitle(true)}
                  className="p-1.5 rounded-md opacity-0 group-hover:opacity-100 transition-opacity hover:bg-white/10 text-foreground/60 hover:text-white"
                >
                  <Edit2 className="w-4 h-4" />
                </button>
                <button 
                  onClick={handleDeleteBlock}
                  className="p-1.5 rounded-md opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-500/10 text-foreground/40 hover:text-red-500"
                  title="Delete Day"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            )}
            
            <div className="flex items-center gap-4 mt-2 text-sm text-foreground/60">
              <span className="flex items-center gap-1.5">
                <Play className="w-3.5 h-3.5" />
                {block.items.length} Videos
              </span>
              <span className="flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5" />
                {blockFormattedTime}
              </span>
              <span className="flex items-center gap-1.5 text-primary">
                <CheckCircle2 className="w-3.5 h-3.5" />
                {progress}% Complete
              </span>
            </div>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="w-full h-1.5 bg-white/5 rounded-full overflow-hidden mb-8">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${progress}%` }}
            transition={{ duration: 0.5, ease: "easeOut" }}
            className="h-full bg-gradient-to-r from-primary to-accent shadow-[0_0_10px_rgba(255,31,31,0.5)]"
          />
        </div>

        {/* Items List */}
        <div className="space-y-3 mb-6">
          <AnimatePresence>
            {block.items.map((item, index) => (
              <ChecklistItem 
                key={item.id} 
                item={item} 
                index={index}
                onToggle={toggleItem} 
              />
            ))}
          </AnimatePresence>
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
            className="w-full border-dashed border-2 bg-transparent hover:bg-white/5 py-6 text-foreground/60"
            onClick={() => setIsPasting(true)}
          >
            <Plus className="w-4 h-4 mr-2" />
            Add Videos (Bulk Paste)
          </Button>
        )}
      </div>
    </Card>
  )
}
