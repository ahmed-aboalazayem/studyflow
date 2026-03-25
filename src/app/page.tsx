"use client"

import Link from "next/link"
import { ArrowRight, Sparkles } from "lucide-react"
import { Button } from "@/components/ui/button"
import { BackgroundEffect } from "@/components/ui/BackgroundEffect"
import { LandingSections } from "@/components/layout/LandingSections"
import { useAuth } from "@/lib/auth-context"

export default function Home() {
  const { user } = useAuth()

  return (
    <main className="relative min-h-screen overflow-x-hidden">
      <BackgroundEffect />
      
      {/* Hero Section */}
      <div className="relative z-10 pt-24 pb-16 md:pt-48 md:pb-32 container mx-auto px-4 sm:px-6 flex flex-col items-center text-center">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 border border-primary/20 text-primary text-xs font-bold uppercase tracking-widest mb-6 md:mb-8">
          <Sparkles className="w-4 h-4" />
          <span>Master Your Learning</span>
        </div>
        
        <h1 className="text-4xl sm:text-5xl md:text-7xl font-black text-transparent bg-clip-text bg-gradient-to-br from-white via-white/90 to-white/40 tracking-tighter max-w-4xl mb-4 md:mb-6 leading-[1.1]">
          The Ultimate Platform to <br className="hidden sm:block"/>
          <span className="text-gradient">Conquer Your Courses</span>
        </h1>
        
        <p className="text-base sm:text-lg md:text-xl text-foreground/60 max-w-2xl mx-auto mb-8 md:mb-10 leading-relaxed font-medium px-2">
          Organize video courses, maintain powerful study streaks, and block out
          distractions with our deep focus mode. Learning has never looked this good.
        </p>

        <Link href={user ? "/dashboard" : "/login"} className="w-full sm:w-auto px-4 sm:px-0">
          <Button className="w-full sm:w-auto h-14 px-8 text-base md:text-lg font-black bg-primary hover:bg-primary/90 text-white shadow-[0_0_40px_rgba(255,31,31,0.3)] hover:shadow-[0_0_60px_rgba(255,31,31,0.5)] transition-all hover:-translate-y-1 rounded-full group">
            {user ? "Go to Dashboard" : "Start Learning Now"}
            <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
          </Button>
        </Link>
      </div>

      <LandingSections />
    </main>
  )
}
