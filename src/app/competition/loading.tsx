"use client"

import * as React from "react"
import { Card } from "@/components/ui/card"
import { BackgroundEffect } from "@/components/ui/BackgroundEffect"

export default function Loading() {
  return (
    <main className="relative min-h-screen pt-24 pb-12">
      <BackgroundEffect />
      
      <div className="container mx-auto px-4 relative z-10">
        <div className="mb-12">
          <div className="h-12 w-64 bg-white/10 rounded-2xl animate-pulse mb-2" />
          <div className="h-6 w-80 bg-white/5 rounded-xl animate-pulse" />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
          {/* Sidebar Skeleton */}
          <div className="lg:col-span-4 space-y-4">
            <div className="h-4 w-32 bg-white/10 rounded-full animate-pulse mb-6 px-1" />
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="h-20 w-full bg-white/5 rounded-2xl border border-white/5 animate-pulse" />
            ))}
          </div>

          {/* Main Content Skeleton */}
          <div className="lg:col-span-8 space-y-8">
            <div className="flex items-center gap-6 pb-8 border-b border-white/10">
              <div className="w-20 h-20 rounded-2xl bg-white/5 border border-white/10 animate-pulse shrink-0" />
              <div className="space-y-3 flex-1">
                <div className="h-10 w-3/4 bg-white/10 rounded-xl animate-pulse" />
                <div className="h-4 w-1/4 bg-white/5 rounded-md animate-pulse" />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="space-y-6">
                <div className="h-6 w-32 bg-white/10 rounded-md animate-pulse" />
                <Card className="h-[400px] bg-white/5 border-white/10 rounded-3xl relative overflow-hidden">
                   <div className="absolute inset-0 bg-white/5 animate-pulse" />
                </Card>
              </div>
              <Card className="mt-12 h-[350px] bg-white/5 border-white/10 rounded-3xl relative overflow-hidden">
                 <div className="absolute inset-0 bg-white/5 animate-pulse" />
              </Card>
            </div>
          </div>
        </div>
      </div>
    </main>
  )
}
