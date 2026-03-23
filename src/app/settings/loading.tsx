"use client"

import * as React from "react"
import { Card } from "@/components/ui/card"
import { BackgroundEffect } from "@/components/ui/BackgroundEffect"

export default function Loading() {
  return (
    <main className="relative min-h-screen pt-24 pb-12">
      <BackgroundEffect />
      
      <div className="container mx-auto px-4 max-w-2xl relative z-10">
        <div className="space-y-8">
            <div className="flex items-center justify-between mb-12">
              <div className="space-y-3">
                <div className="h-12 w-48 bg-white/10 rounded-2xl animate-pulse" />
                <div className="h-4 w-64 bg-white/5 rounded-md animate-pulse" />
              </div>
              <div className="h-8 w-24 bg-white/5 rounded-xl border border-white/10 animate-pulse" />
            </div>

            <Card className="glass border border-white/10 rounded-3xl p-8 space-y-8 h-[550px] relative overflow-hidden">
               <div className="absolute inset-8 space-y-8">
                  <div className="h-4 w-32 bg-white/10 rounded-md mb-8 animate-pulse" />
                  <div className="flex flex-col md:flex-row items-center gap-8">
                    <div className="w-32 h-32 rounded-3xl bg-white/5 border-2 border-white/5 animate-pulse" />
                    <div className="flex-1 space-y-3 w-full">
                       <div className="h-3 w-40 bg-white/5 rounded-md animate-pulse" />
                       <div className="grid grid-cols-4 gap-2">
                          {[1,2,3,4].map(i => <div key={i} className="h-10 w-10 bg-white/5 rounded-xl animate-pulse" />)}
                       </div>
                    </div>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-8 border-t border-white/5">
                    <div className="space-y-3">
                       <div className="h-3 w-20 bg-white/5 rounded-md animate-pulse" />
                       <div className="h-12 w-full bg-white/5 rounded-xl animate-pulse" />
                    </div>
                    <div className="space-y-3">
                       <div className="h-3 w-20 bg-white/5 rounded-md animate-pulse" />
                       <div className="h-12 w-full bg-white/5 rounded-xl opacity-40 animate-pulse" />
                    </div>
                  </div>
               </div>
            </Card>

            <div className="flex gap-4">
               <div className="flex-1 h-14 bg-primary/10 rounded-3xl animate-pulse" />
               <div className="w-20 h-14 bg-white/5 rounded-3xl border border-white/10 animate-pulse" />
            </div>
        </div>
      </div>
    </main>
  )
}
