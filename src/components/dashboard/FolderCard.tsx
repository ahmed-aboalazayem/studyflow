"use client"

import * as React from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Folder as FolderIcon, ChevronRight, Trash2, Pencil, Check, X } from "lucide-react"
import { useDroppable } from "@dnd-kit/core"
import { useStore, Course } from "@/lib/store"
import { CourseCard } from "@/components/course/CourseCard"
import { Input } from "@/components/ui/input"

interface FolderCardProps {
  folder: {
    id: string
    name: string
  }
  courses: Course[]
}

export function FolderCard({ folder, courses }: FolderCardProps) {
  const [isOpen, setIsOpen] = React.useState(false)
  const [isEditing, setIsEditing] = React.useState(false)
  const [editName, setEditName] = React.useState(folder.name)
  const { deleteFolder, renameFolder } = useStore()
  
  const { isOver, setNodeRef } = useDroppable({
    id: folder.id,
    data: {
      type: 'folder',
      folderId: folder.id
    }
  })

  const handleRename = async (e?: React.FormEvent) => {
    e?.preventDefault()
    if (editName.trim() && editName !== folder.name) {
      await renameFolder(folder.id, editName.trim())
    }
    setIsEditing(false)
  }

  const handleCancelRename = () => {
    setEditName(folder.name)
    setIsEditing(false)
  }

  return (
    <div 
      ref={setNodeRef}
      className={`relative rounded-3xl transition-all duration-500 overflow-hidden ${
        isOver 
          ? "bg-primary/10 border-2 border-dashed border-primary ring-8 ring-primary/10 scale-[1.01] shadow-[0_0_50px_rgba(255,31,31,0.15)]" 
          : "bg-white/5 border border-white/10 hover:border-white/20 hover:bg-white/[0.07] shadow-xl"
      }`}
    >
      {/* Folder Header */}
      <div 
        onClick={() => !isEditing && setIsOpen(!isOpen)}
        className={`p-5 flex items-center justify-between group transition-colors ${!isEditing ? "cursor-pointer" : "cursor-default"}`}
      >
        <div className="flex items-center gap-4 flex-1">
          <div className={`p-3 rounded-2xl transition-all duration-300 ${isOpen ? "bg-primary shadow-[0_0_20px_rgba(255,31,31,0.4)] text-white scale-110" : "bg-white/5 text-white/40 group-hover:text-white/60 group-hover:bg-white/10"}`}>
            <FolderIcon className="w-6 h-6" />
          </div>
          
          {isEditing ? (
            <form onSubmit={handleRename} className="flex items-center gap-2 flex-1" onClick={e => e.stopPropagation()}>
              <Input
                autoFocus
                value={editName}
                onChange={(e) => setEditName(e.target.value)}
                onBlur={handleRename}
                onKeyDown={(e) => e.key === 'Escape' && handleCancelRename()}
                className="h-10 bg-white/10 border-white/20 focus:border-primary/50 text-white font-bold text-lg rounded-xl"
              />
              <button 
                type="submit"
                className="p-2 rounded-xl bg-primary/20 text-primary hover:bg-primary hover:text-white transition-all"
              >
                <Check className="w-4 h-4" />
              </button>
              <button 
                type="button"
                onClick={handleCancelRename}
                className="p-2 rounded-xl bg-white/5 text-white/40 hover:bg-white/10 hover:text-white transition-all"
              >
                <X className="w-4 h-4" />
              </button>
            </form>
          ) : (
            <div className="flex flex-col">
              <h3 className="text-xl font-black text-white tracking-tight group-hover:text-primary transition-colors">{folder.name}</h3>
              <p className="text-xs font-bold text-white/30 uppercase tracking-widest mt-0.5">
                {courses.length} {courses.length === 1 ? 'Course' : 'Courses'}
              </p>
            </div>
          )}
        </div>

        {!isEditing && (
          <div className="flex items-center gap-1">
            <button
              onClick={(e) => {
                e.stopPropagation()
                setIsEditing(true)
                setEditName(folder.name)
              }}
              className="p-2.5 rounded-xl hover:bg-primary/10 hover:text-primary text-white/10 transition-all opacity-0 group-hover:opacity-100"
              title="Rename Folder"
            >
              <Pencil className="w-4 h-4" />
            </button>
            <button
              onClick={(e) => {
                e.stopPropagation()
                if (confirm(`Delete folder "${folder.name}"? Courses will be moved back to the dashboard.`)) {
                  deleteFolder(folder.id)
                }
              }}
              className="p-2.5 rounded-xl hover:bg-red-500/10 hover:text-red-400 text-white/10 transition-all opacity-0 group-hover:opacity-100"
              title="Delete Folder"
            >
              <Trash2 className="w-4 h-4" />
            </button>
            <motion.div
              animate={{ rotate: isOpen ? 90 : 0 }}
              className="ml-2 text-white/20 group-hover:text-white/40"
            >
              <ChevronRight className="w-5 h-5" />
            </motion.div>
          </div>
        )}
      </div>

      {/* Courses Grid (Collapsible) */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
            className="overflow-hidden"
          >
            <div className="p-6 pt-0">
              <div className="p-6 rounded-2xl bg-black/20 border border-white/5 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3 gap-6">
                {courses.length > 0 ? (
                  courses.map(course => (
                    <CourseCard key={course.id} course={course} />
                  ))
                ) : (
                  <div className="col-span-full py-16 flex flex-col items-center justify-center border-2 border-dashed border-white/5 rounded-3xl bg-white/[0.02]">
                    <div className="p-4 rounded-2xl bg-white/5 mb-4 text-white/20">
                      <FolderIcon className="w-8 h-8" />
                    </div>
                    <p className="text-white/30 font-black uppercase tracking-widest text-xs">Empty Folder</p>
                    <p className="text-white/10 font-bold text-sm mt-1">Drag courses here to organize</p>
                  </div>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Drop indicator overlay */}
      {isOver && (
        <div className="absolute inset-0 pointer-events-none flex items-center justify-center z-50">
          <motion.div 
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="bg-primary px-6 py-3 rounded-2xl text-white font-black text-sm uppercase tracking-widest shadow-[0_0_30px_rgba(255,31,31,0.5)] border border-white/20"
          >
            Add to {folder.name}
          </motion.div>
        </div>
      )}
    </div>
  )
}
