"use client"

import * as React from "react"
import { Card } from "@/components/ui/card"
import { BackgroundEffect } from "@/components/ui/BackgroundEffect"

export default function Loading() {
  return (
    <main className="relative min-h-screen">
      <BackgroundEffect />
      
      <div className="container mx-auto px-4 py-8 max-w-7xl relative z-10">
        <div className="h-4 w-40 bg-white/5 rounded-md animate-pulse mb-8" />

        <div className="mb-12">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-6">
            <div className="space-y-4 flex-1">
              <div className="h-12 w-2/3 bg-white/10 rounded-2xl animate-pulse" />
              <div className="h-4 w-1/3 bg-white/5 rounded-md animate-pulse" />
            </div>
            <div className="flex items-center gap-4 shrink-0">
               <div className="flex flex-col items-end gap-2">
                  <div className="h-3 w-12 bg-white/5 rounded-sm animate-pulse" />
                  <div className="h-8 w-16 bg-white/10 rounded-md animate-pulse" />
               </div>
               <div className="h-14 w-14 rounded-full border-4 border-white/5 relative flex items-center justify-center animate-pulse">
                  <div className="h-10 w-10 rounded-full bg-white/5" />
               </div>
            </div>
          </div>
          <div className="flex items-center gap-4 text-sm font-medium">
            <div className="h-8 w-28 bg-white/5 border border-white/5 rounded-lg animate-pulse" />
            <div className="h-8 w-36 bg-white/5 border border-white/5 rounded-lg animate-pulse" />
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-6">
            {[1, 2, 3].map(i => (
              <Card key={i} className="h-32 bg-white/5 border border-white/10 rounded-3xl relative overflow-hidden">
                 <div className="absolute inset-0 bg-white/5 animate-pulse" />
              </Card>
            ))}
            <div className="h-16 w-full border-2 border-dashed border-white/10 bg-transparent rounded-2xl animate-pulse" />
          </div>

          <div className="space-y-6">
            <Card className="h-32 bg-white/5 border border-white/10 rounded-3xl relative overflow-hidden">
               <div className="absolute inset-0 bg-white/5 animate-pulse" />
            </Card>
            <Card className="h-72 bg-white/5 border border-white/10 rounded-3xl relative overflow-hidden">
               <div className="absolute inset-0 bg-white/5 animate-pulse" />
            </Card>
            <Card className="h-56 bg-white/5 border border-white/10 rounded-3xl relative overflow-hidden">
               <div className="absolute inset-0 bg-white/5 animate-pulse" />
            </Card>
          </div>
        </div>
      </div>
    </main>
  )
}
