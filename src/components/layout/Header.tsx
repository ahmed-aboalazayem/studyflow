"use client"

import * as React from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { BookOpen, BarChart3, Plus, LogOut, User, Trophy, Menu, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useAuth } from "@/lib/auth-context"

export function Header() {
  const pathname = usePathname()
  const { user, logout } = useAuth()
  const [isMenuOpen, setIsMenuOpen] = React.useState(false)

  return (
    <header className="fixed top-0 left-0 right-0 z-50 border-b border-white/10 bg-black/30 backdrop-blur-md">
      <div className="container mx-auto px-4 h-16 flex items-center justify-between">
        
        {/* Logo */}
        <div className="flex items-center gap-8">
          <Link href="/" className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-primary flex items-center justify-center text-white font-bold shadow-[0_0_15px_rgba(255,31,31,0.4)]">
              SF
            </div>
            <span className="text-xl font-bold tracking-tight text-white">
              StudyFlow
            </span>
          </Link>

          {/* Nav - Desktop */}
          <nav className="hidden md:flex items-center gap-1">
            <Link href="/">
              <Button
                variant={pathname === "/" ? "glass" : "ghost"}
                size="sm"
                className="flex items-center gap-2 rounded-lg"
              >
                <BookOpen className="w-4 h-4" />
                Courses
              </Button>
            </Link>

            <Link href="/progress">
              <Button
                variant={pathname === "/progress" ? "glass" : "ghost"}
                size="sm"
                className="flex items-center gap-2 rounded-lg"
              >
                <BarChart3 className="w-4 h-4" />
                Progress
              </Button>
            </Link>

            <Link href="/competition">
              <Button
                variant={pathname === "/competition" ? "glass" : "ghost"}
                size="sm"
                className="flex items-center gap-2 rounded-lg"
              >
                <Trophy className="w-4 h-4 text-yellow-400 drop-shadow-[0_0_8px_rgba(250,204,21,0.4)]" />
                Competition
              </Button>
            </Link>
          </nav>
        </div>

        {/* Right Side */}
        <div className="flex items-center gap-2 sm:gap-3">
          {user && (
            <Link
              href="/settings"
              className="hidden md:flex items-center gap-2 px-3 py-1.5 rounded-lg bg-white/5 border border-white/10 text-sm"
            >
              {user.imageUrl ? (
                <img
                  src={user.imageUrl}
                  alt=""
                  className="w-5 h-5 rounded-full object-cover border border-primary/30"
                />
              ) : (
                <User className="w-4 h-4 text-primary" />
              )}
              <span className="text-white font-medium">
                {user.displayName || user.username}
              </span>
            </Link>
          )}

          <Link href="/add-course" className="hidden sm:block">
            <Button className="flex items-center gap-2 shadow-[0_0_15px_rgba(255,31,31,0.3)] bg-primary text-white active:scale-95 transition-all">
              <Plus className="w-4 h-4" />
              <span>Add Course</span>
            </Button>
          </Link>

          {user && (
            <Button
              variant="ghost"
              size="sm"
              className="hidden sm:flex text-white/40"
              onClick={() => logout()}
            >
              <LogOut className="w-4 h-4" />
            </Button>
          )}

          {/* Mobile Menu Toggle */}
          <Button
            variant="ghost"
            size="sm"
            className="md:hidden text-white"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
          >
            {isMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </Button>
        </div>
      </div>

      {/* Mobile Menu Overlay */}
      {isMenuOpen && (
        <div className="md:hidden absolute top-16 left-0 right-0 bg-black/95 backdrop-blur-xl border-b border-white/10 p-4 space-y-4 animate-in fade-in slide-in-from-top-4 duration-300">
          <nav className="grid grid-cols-1 gap-2">
            <Link href="/" onClick={() => setIsMenuOpen(false)}>
              <Button variant={pathname === "/" ? "glass" : "ghost"} className="w-full justify-start gap-3">
                <BookOpen className="w-5 h-5" />
                Courses
              </Button>
            </Link>
            <Link href="/progress" onClick={() => setIsMenuOpen(false)}>
              <Button variant={pathname === "/progress" ? "glass" : "ghost"} className="w-full justify-start gap-3">
                <BarChart3 className="w-5 h-5" />
                Progress
              </Button>
            </Link>
            <Link href="/competition" onClick={() => setIsMenuOpen(false)}>
              <Button variant={pathname === "/competition" ? "glass" : "ghost"} className="w-full justify-start gap-3">
                <Trophy className="w-5 h-5 text-yellow-500" />
                Competition
              </Button>
            </Link>
            <Link href="/settings" onClick={() => setIsMenuOpen(false)}>
              <Button variant={pathname === "/settings" ? "glass" : "ghost"} className="w-full justify-start gap-3">
                <User className="w-5 h-5 text-primary" />
                Settings
              </Button>
            </Link>
          </nav>
          
          <div className="pt-4 border-t border-white/5 flex flex-col gap-3">
            <Link href="/add-course" onClick={() => setIsMenuOpen(false)}>
              <Button className="w-full gap-2 bg-primary">
                <Plus className="w-5 h-5" />
                Add Course
              </Button>
            </Link>
            {user && (
              <Button 
                variant="ghost" 
                className="w-full justify-start gap-3 text-red-500" 
                onClick={() => { logout(); setIsMenuOpen(false); }}
              >
                <LogOut className="w-5 h-5" />
                Logout
              </Button>
            )}
          </div>
        </div>
      )}
    </header>
  )
}