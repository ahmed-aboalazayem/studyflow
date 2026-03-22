"use client"

import * as React from "react"
import { motion } from "framer-motion"
import { Upload, Image as ImageIcon, Save, ArrowLeft } from "lucide-react"
import Link from "next/link"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { CourseCard } from "@/components/course/CourseCard"
import { useRouter } from "next/navigation"
import { useStore } from "@/lib/store"
import { useAuth } from "@/lib/auth-context"
import { BackgroundEffect } from "@/components/ui/BackgroundEffect"

export default function AddCoursePage() {
  const [title, setTitle] = React.useState("")
  const [imageUrl, setImageUrl] = React.useState("")
  const [isHovering, setIsHovering] = React.useState(false)
  const { addCourse } = useStore()
  const { user, isLoading } = useAuth()
  const router = useRouter()

  React.useEffect(() => {
    if (!isLoading && !user) router.push("/login")
  }, [user, isLoading, router])

  const handleCreateCourse = async () => {
    if (!title.trim()) return
    const newCourse = {
      id: `course-${Date.now()}`,
      title,
      imageUrl,
      progress: 0,
      totalVideos: 0,
      completedVideos: 0
    }
    const result: any = await addCourse(newCourse, [])
    router.push(`/course/${result?.id || newCourse.id}`)
  }

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    setIsHovering(true)
  }

  const handleDragLeave = () => {
    setIsHovering(false)
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    setIsHovering(false)
    const file = e.dataTransfer.files[0]
    if (file && file.type.startsWith("image/")) {
      const reader = new FileReader()
      reader.onload = (ev) => {
        setImageUrl(ev.target?.result as string)
      }
      reader.readAsDataURL(file)
    }
  }

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      const reader = new FileReader()
      reader.onload = (ev) => {
        setImageUrl(ev.target?.result as string)
      }
      reader.readAsDataURL(file)
    }
  }

  if (isLoading || !user) return null

  return (
    <main className="relative min-h-screen">
      <BackgroundEffect />
      
      <div className="container mx-auto px-4 py-8 relative z-10">
        <Link href="/" className="inline-flex items-center gap-2 text-foreground/40 hover:text-primary transition-colors mb-8 group">
          <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
          Back to Dashboard
        </Link>

        <div className="flex flex-col md:flex-row gap-8 items-start">
          {/* Form Section */}
          <div className="flex-1 w-full relative">
            <div className="absolute -inset-1 bg-gradient-to-r from-primary to-accent rounded-[2rem] blur opacity-20"></div>
            <Card className="relative p-8 w-full border border-white/10 bg-black/40 xl:p-10">
              <h1 className="text-3xl font-bold text-white mb-6 tracking-tight">Create New Course</h1>
              
              <div className="space-y-8">
                <div className="space-y-3">
                  <label className="text-sm font-medium text-white/80">Course Title</label>
                  <Input
                    placeholder="e.g. Advanced System Design"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    className="h-12 text-base"
                  />
                </div>

                <div className="space-y-3">
                  <label className="text-sm font-medium text-white/80">Course Thumbnail</label>
                  <div
                    onDragOver={handleDragOver}
                    onDragLeave={handleDragLeave}
                    onDrop={handleDrop}
                    className={`relative flex flex-col items-center justify-center p-12 border-2 border-dashed rounded-2xl transition-all ${
                      isHovering 
                        ? "border-primary bg-primary/10 scale-[1.02]" 
                        : "border-white/10 bg-white/5 hover:bg-white/10"
                    }`}
                  >
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleFileSelect}
                      className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                    />
                    
                    {imageUrl ? (
                      <motion.div
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="flex flex-col items-center gap-3 text-primary"
                      >
                        <ImageIcon className="w-10 h-10" />
                        <span className="font-medium text-sm">Image Ready</span>
                      </motion.div>
                    ) : (
                      <div className="flex flex-col items-center gap-3 text-foreground/60 pointer-events-none">
                        <div className="p-4 bg-white/5 rounded-full">
                          <Upload className="w-8 h-8" />
                        </div>
                        <p className="text-center font-medium">Click or drag image here</p>
                        <p className="text-sm opacity-60">Supports JPG, PNG, WebP</p>
                      </div>
                    )}
                  </div>
                </div>

                <Button size="lg" className="w-full gap-2 text-md h-12" onClick={handleCreateCourse}>
                  <Save className="w-5 h-5" />
                  Create Course
                </Button>
              </div>
            </Card>
          </div>

          {/* Live Preview Section */}
          <div className="w-full md:w-80 lg:w-[350px] shrink-0 sticky top-24 hidden md:block">
            <h3 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground mb-4">Live Preview</h3>
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
            >
              <CourseCard
                course={{
                  id: "preview",
                  title: title || "Your Course Title",
                  imageUrl: imageUrl,
                  progress: 0,
                  totalVideos: 0,
                  completedVideos: 0
                }}
              />
            </motion.div>
          </div>
        </div>
      </div>
    </main>
  )
}
