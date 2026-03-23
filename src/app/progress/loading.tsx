"use client"

import * as React from "react"
import { Card } from "@/components/ui/card"
import { BackgroundEffect } from "@/components/ui/BackgroundEffect"

export default function Loading() {
  return (
    <main className="relative min-h-screen">
      <BackgroundEffect />
      
      <div className="container mx-auto px-4 py-8 relative z-10">
        <div className="mb-10">
          <div className="h-12 w-64 bg-white/10 rounded-2xl animate-pulse mb-2" />
          <div className="h-6 w-80 bg-white/5 rounded-xl animate-pulse" />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {[1, 2, 3, 4].map((i) => (
            <Card key={i} className="h-32 border border-white/5 bg-white/[0.02] glass rounded-3xl relative overflow-hidden">
               <div className="absolute inset-0 bg-white/5 animate-pulse" />
            </Card>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <Card className="lg:col-span-1 h-[400px] bg-white/5 border-white/10 glass rounded-3xl relative overflow-hidden">
             <div className="absolute inset-0 bg-white/5 animate-pulse" />
          </Card>
          <div className="lg:col-span-2 space-y-8">
            <Card className="h-[250px] bg-white/5 border-white/10 glass rounded-3xl relative overflow-hidden">
               <div className="absolute inset-0 bg-white/5 animate-pulse" />
            </Card>
            <Card className="h-[150px] bg-white/5 border-white/10 glass rounded-3xl relative overflow-hidden">
               <div className="absolute inset-0 bg-white/5 animate-pulse" />
            </Card>
          </div>
        </div>
      </div>
    </main>
  )
}
