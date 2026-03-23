"use client"

import * as React from "react"
import { Card } from "@/components/ui/card"
import { BackgroundEffect } from "@/components/ui/BackgroundEffect"

export default function Loading() {
  return (
    <main className="relative min-h-screen">
      <BackgroundEffect />
      
      <div className="container mx-auto px-4 py-8 relative z-10">
        <div className="h-4 w-32 bg-white/5 rounded-md animate-pulse mb-8" />

        <div className="flex flex-col md:flex-row gap-8 items-start">
          {/* Form Section Skeleton */}
          <div className="flex-1 w-full">
            <Card className="p-8 w-full border border-white/10 bg-black/40 xl:p-10 h-[500px] rounded-[2rem] relative overflow-hidden">
               <div className="space-y-8 absolute inset-8">
                  <div className="h-8 w-1/2 bg-white/10 rounded-lg animate-pulse mb-10" />
                  <div className="space-y-3">
                    <div className="h-4 w-24 bg-white/5 rounded-md animate-pulse" />
                    <div className="h-12 w-full bg-white/5 rounded-xl animate-pulse" />
                  </div>
                  <div className="space-y-3">
                    <div className="h-4 w-24 bg-white/5 rounded-md animate-pulse" />
                    <div className="h-32 w-full bg-white/5 rounded-2xl border-2 border-dashed border-white/10 animate-pulse" />
                  </div>
                  <div className="h-12 w-full bg-primary/10 rounded-xl animate-pulse mt-10" />
               </div>
            </Card>
          </div>

          {/* Preview Section Skeleton */}
          <div className="w-full md:w-80 lg:w-[350px] shrink-0 hidden md:block">
            <div className="h-4 w-24 bg-white/5 rounded-full animate-pulse mb-4 uppercase tracking-widest text-[10px]" />
            <div className="h-80 w-full bg-white/5 border border-white/10 rounded-[2rem] relative overflow-hidden">
               <div className="absolute inset-0 bg-white/5 animate-pulse" />
            </div>
          </div>
        </div>
      </div>
    </main>
  )
}
