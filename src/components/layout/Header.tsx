"use client"

import * as React from "react"
import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import { BookOpen, BarChart3, Plus, LogOut, User } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useAuth } from "@/lib/auth-context"

export function Header() {
  const pathname = usePathname()
  const { user } = useAuth()

  return (
    <header className="fixed top-0 left-0 right-0 z-50 glass border-b border-white/10">
      <div className="container mx-auto px-4 h-16 flex items-center justify-between">
        <div className="flex items-center gap-8">
          <Link href="/" className="flex items-center gap-2 group">
            <div className="w-8 h-8 rounded-xl bg-primary flex items-center justify-center text-white font-bold group-hover:scale-105 transition-transform duration-300 shadow-[0_0_15px_rgba(255,31,31,0.4)]">
              SF
            </div>
            <span className="text-xl font-bold tracking-tight text-white group-hover:text-primary transition-colors">
              StudyFlow
            </span>
          </Link>

          <nav className="hidden md:flex items-center gap-1">
            <Link href="/">
              <Button variant={pathname === "/" ? "glass" : "ghost"} size="sm" className="flex items-center gap-2 rounded-lg">
                <BookOpen className="w-4 h-4" />
                Courses
              </Button>
            </Link>
            <Link href="/progress">
              <Button variant={pathname === "/progress" ? "glass" : "ghost"} size="sm" className="flex items-center gap-2 rounded-lg">
                <BarChart3 className="w-4 h-4" />
                Progress
              </Button>
            </Link>
          </nav>
        </div>

        <div className="flex items-center gap-3">
          {user && (
            <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-lg bg-white/5 border border-white/10 text-sm">
              <User className="w-4 h-4 text-primary" />
              <span className="text-white font-medium">{user.username}</span>
            </div>
          )}

          <Link href="/add-course">
            <Button className="flex items-center gap-2 shadow-[0_0_15px_rgba(255,31,31,0.3)] bg-primary hover:bg-primary/95 text-white active:scale-95 transition-all">
              <Plus className="w-4 h-4" />
              <span className="hidden sm:inline">Add Course</span>
            </Button>
          </Link>
        </div>
      </div>
    </header>
  )
}
