"use client"

import * as React from "react"
import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import { BookOpen, BarChart3, Plus, LogOut, User } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useAuth } from "@/lib/auth-context"

export function Header() {
  const pathname = usePathname()
  const { user, logout } = useAuth()

  return (
    <header className="fixed top-0 left-0 right-0 z-50 glass border-b border-white/10">
      <div className="container mx-auto px-4 h-16 flex items-center justify-between">
        <div className="flex items-center gap-8">
          <Link href="/" className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-primary flex items-center justify-center text-white font-bold shadow-[0_0_15px_rgba(255,31,31,0.4)]">
              SF
            </div>
            <span className="text-xl font-bold tracking-tight text-white">
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
            <Link href="/competition">
              <Button variant={pathname === "/competition" ? "glass" : "ghost"} size="sm" className="flex items-center gap-2 rounded-lg">
                <Plus className="w-4 h-4 rotate-45" />
                Competition
              </Button>
            </Link>
          </nav>
        </div>

        <div className="flex items-center gap-3">
          {user && (
            <Link href="/settings" className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-lg bg-white/5 border border-white/10 text-sm">
              {user.imageUrl ? (
                <img src={user.imageUrl} alt="" className="w-5 h-5 rounded-full object-cover border border-primary/30" />
              ) : (
                <User className="w-4 h-4 text-primary" />
              )}
              <span className="text-white font-medium">{user.displayName || user.username}</span>
            </Link>
          )}

          <Link href="/add-course">
            <Button className="flex items-center gap-2 shadow-[0_0_15px_rgba(255,31,31,0.3)] bg-primary text-white active:scale-95 transition-all">
              <Plus className="w-4 h-4" />
              <span className="hidden sm:inline">Add Course</span>
            </Button>
          </Link>

          {user && (
            <Button 
              variant="ghost" 
              size="sm" 
              className="text-white/40"
              onClick={() => logout()}
            >
              <LogOut className="w-4 h-4" />
            </Button>
          )}
        </div>
      </div>
    </header>
  )
}
