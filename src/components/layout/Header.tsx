"use client"

import * as React from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { motion, AnimatePresence } from "framer-motion"
import { 
  BookOpen, 
  BarChart3, 
  Map as MapIcon, 
  Search, 
  Plus, 
  FolderPlus,
  LogOut,
  User,
  Settings,
  ChevronDown
} from "lucide-react"
import { useAuth } from "@/lib/auth-context"
import { useStore } from "@/lib/store"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"

export function Header() {
  const pathname = usePathname()
  const { user, logout } = useAuth()
  const { searchQuery, setSearchQuery, setIsAddFolderModalOpen } = useStore()
  
  const [isSearchExpanded, setIsSearchExpanded] = React.useState(false)
  const [isProfileOpen, setIsProfileOpen] = React.useState(false)
  const [isAddOpen, setIsAddOpen] = React.useState(false)

  const navItems = [
    { label: "Courses", href: "/dashboard", icon: BookOpen },
    { label: "Progress", href: "/progress", icon: BarChart3 },
    { label: "Map", href: "/map", icon: MapIcon },
  ]

  return (
    <header className="fixed top-0 left-0 right-0 z-50 h-20 px-6 flex items-center justify-between glass border-b border-white/5 backdrop-blur-3xl">
      <div className="flex items-center gap-12">
        {/* Logo */}
        <Link href="/dashboard" className="flex items-center gap-3 active:scale-95 transition-transform group">
          <motion.div 
            whileHover={{ scale: 1.1, rotate: 5 }}
            className="w-10 h-10 rounded-2xl bg-primary flex items-center justify-center text-white font-bold shadow-[0_0_20px_rgba(255,31,31,0.5)]"
          >
            SF
          </motion.div>
          <span className="text-2xl font-black tracking-tighter text-white">StudyFlow</span>
        </Link>

        {/* Main Nav */}
        <nav className="hidden md:flex items-center gap-1">
          {navItems.map((item) => {
            const isActive = pathname === item.href
            return (
              <Link key={item.href} href={item.href}>
                <div className={`
                  relative px-5 py-2.5 rounded-2xl transition-all duration-300 group
                  ${isActive ? "text-primary font-bold" : "text-white/40 hover:text-white hover:bg-white/5"}
                `}>
                  {isActive && (
                    <motion.div 
                      layoutId="navActiveHeader"
                      className="absolute inset-0 bg-primary/10 rounded-2xl -z-10"
                      transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                    />
                  )}
                  <div className="flex items-center gap-2.5">
                    <item.icon className={`w-4 h-4 transition-transform duration-300 group-hover:scale-110 ${isActive ? "text-primary" : ""}`} />
                    <span className="text-sm font-bold tracking-tight">{item.label}</span>
                  </div>
                </div>
              </Link>
            )
          })}
        </nav>
      </div>

      <div className="flex items-center gap-4">
        {/* Search Bar */}
        <motion.div 
          initial={false}
          animate={{ width: isSearchExpanded ? 300 : 40 }}
          className="relative group h-10 overflow-hidden"
        >
          <div className="absolute right-0 top-0 bottom-0 w-10 flex items-center justify-center z-10">
            <button 
              onClick={() => setIsSearchExpanded(!isSearchExpanded)}
              className="text-white/40 hover:text-white transition-colors"
            >
              <Search className="w-5 h-5" />
            </button>
          </div>
          <Input 
            placeholder="Quick search..."
            className={`h-full bg-white/5 border-white/10 glass focus:border-primary/40 text-sm rounded-full pl-4 pr-10 transition-opacity duration-300 ${isSearchExpanded ? "opacity-100" : "opacity-0"}`}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onFocus={() => setIsSearchExpanded(true)}
          />
        </motion.div>

        {/* Add Context Action */}
        <div className="relative">
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setIsAddOpen(!isAddOpen)}
            className="w-10 h-10 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-white/40 hover:text-primary hover:border-primary/40 transition-all hover:bg-primary/5"
          >
            <Plus className={`w-6 h-6 transition-transform duration-300 ${isAddOpen ? "rotate-45" : ""}`} />
          </motion.button>

          <AnimatePresence>
            {isAddOpen && (
              <motion.div
                initial={{ opacity: 0, y: 10, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 10, scale: 0.95 }}
                className="absolute right-0 mt-4 w-56 bg-black/40 backdrop-blur-2xl border border-white/10 rounded-2xl p-2 shadow-2xl overflow-hidden"
              >
                <Link href="/add-course" onClick={() => setIsAddOpen(false)}>
                  <button className="flex items-center gap-3 w-full px-4 py-3 rounded-xl text-white/60 hover:text-white hover:bg-white/10 transition-all text-sm font-bold group">
                    <div className="p-1.5 rounded-lg bg-primary/10 text-primary group-hover:bg-primary group-hover:text-white transition-all">
                      <Plus className="w-4 h-4" />
                    </div>
                    Add Course
                  </button>
                </Link>
                <button 
                  onClick={() => { setIsAddFolderModalOpen(true); setIsAddOpen(false); }}
                  className="flex items-center gap-3 w-full px-4 py-3 rounded-xl text-white/60 hover:text-white hover:bg-white/10 transition-all text-sm font-bold group"
                >
                  <div className="p-1.5 rounded-lg bg-white/5 text-white/40 group-hover:bg-white/10 group-hover:text-white transition-all">
                    <FolderPlus className="w-4 h-4" />
                  </div>
                  New Folder
                </button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Profile Dropdown */}
        <div className="relative ml-2">
          <button 
            onClick={() => setIsProfileOpen(!isProfileOpen)}
            className="flex items-center gap-3 group px-1 rounded-full hover:bg-white/5 transition-all outline-none"
          >
            <div className="relative">
              {user?.imageUrl ? (
                <img src={user.imageUrl} className="w-9 h-9 rounded-full object-cover border border-white/10 group-hover:border-primary/50 transition-colors" />
              ) : (
                <div className="w-9 h-9 rounded-full bg-white/5 flex items-center justify-center text-white/40 border border-white/10 group-hover:border-primary/50 transition-colors">
                  <User className="w-5 h-5" />
                </div>
              )}
              <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-emerald-500 rounded-full border-2 border-[#020202]" />
            </div>
            <ChevronDown className={`w-4 h-4 text-white/20 group-hover:text-white transition-all duration-300 ${isProfileOpen ? "rotate-180" : ""}`} />
          </button>

          <AnimatePresence>
            {isProfileOpen && (
              <>
                <div className="fixed inset-0 z-[-1]" onClick={() => setIsProfileOpen(false)} />
                <motion.div
                  initial={{ opacity: 0, y: 10, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 10, scale: 0.95 }}
                  className="absolute right-0 mt-4 w-64 bg-black/40 backdrop-blur-2xl border border-white/10 rounded-2xl p-2 shadow-2xl overflow-hidden"
                >
                  <div className="px-4 py-3 mb-2 flex flex-col">
                    <span className="font-bold text-white text-sm">{user?.displayName || user?.username}</span>
                    <span className="text-[10px] text-white/20 uppercase font-black tracking-widest mt-0.5">Premium Scholar</span>
                  </div>
                  <div className="h-px bg-white/5 mx-2 mb-2" />
                  
                  <Link href="/settings" onClick={() => setIsProfileOpen(false)}>
                    <button className="flex items-center gap-3 w-full px-4 py-3 rounded-xl text-white/60 hover:text-white hover:bg-white/10 transition-all text-sm font-bold">
                      <Settings className="w-4 h-4" />
                      Account Settings
                    </button>
                  </Link>
                  
                  <button 
                    onClick={() => logout()}
                    className="flex items-center gap-3 w-full px-4 py-3 rounded-xl text-red-500/60 hover:text-red-500 hover:bg-red-500/5 transition-all text-sm font-bold mt-1"
                  >
                    <LogOut className="w-4 h-4" />
                    Sign Out
                  </button>
                </motion.div>
              </>
            )}
          </AnimatePresence>
        </div>
      </div>
    </header>
  )
}
