"use client"

import * as React from "react"
import { motion } from "framer-motion"
import { FileText, Save, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { updateCourseNote, getCourseNote } from "@/app/actions"

interface NoteSectionProps {
  courseId: string
}

export function NoteSection({ courseId }: NoteSectionProps) {
  const [content, setContent] = React.useState("")
  const [saving, setSaving] = React.useState(false)
  const [loading, setLoading] = React.useState(true)

  React.useEffect(() => {
    const fetchNote = async () => {
      const note = await getCourseNote(courseId)
      if (note) setContent(note.content)
      setLoading(false)
    }
    fetchNote()
  }, [courseId])

  const handleSave = async () => {
    setSaving(true)
    await updateCourseNote(courseId, content)
    setSaving(false)
  }

  if (loading) return null

  return (
    <div className="bg-white/5 border border-white/10 rounded-3xl p-6 glass">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-bold text-white flex items-center gap-2">
          <FileText className="w-5 h-5 text-primary" />
          Study Notes
        </h3>
        <Button 
          variant="ghost" 
          size="sm" 
          onClick={handleSave}
          disabled={saving}
          className="text-primary hover:text-primary/80 hover:bg-primary/10 transition-all font-bold"
        >
          {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
          <span className="ml-2 uppercase text-[10px] tracking-widest">Auto-Save</span>
        </Button>
      </div>

      <textarea
        value={content}
        onChange={(e) => setContent(e.target.value)}
        placeholder="Focus on what matters... Write your thoughts here."
        className="w-full h-48 bg-black/20 border border-white/5 focus:border-primary/50 text-white rounded-2xl p-4 resize-none transition-all outline-none text-sm leading-relaxed placeholder:text-white/10"
      />
      <p className="text-[10px] text-foreground/30 font-medium mt-3 uppercase tracking-wider text-right">
        Persistently saved to your account
      </p>
    </div>
  )
}
