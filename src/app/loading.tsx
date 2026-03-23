"use client"

import * as React from "react"
import { Card, CardContent } from "@/components/ui/card"
import { BackgroundEffect } from "@/components/ui/BackgroundEffect"

export default function Loading() {
  return (
    <main className="relative min-h-screen">
      <BackgroundEffect />
      
      <div className="container mx-auto px-4 py-12 relative z-10">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between mb-12 gap-6">
          <div className="space-y-3">
            <div className="h-12 w-64 bg-white/10 rounded-2xl animate-pulse" />
            <div className="h-6 w-80 bg-white/5 rounded-xl animate-pulse" />
          </div>
          <div className="h-12 w-full md:w-80 bg-white/5 rounded-xl animate-pulse border border-white/10 glass" />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
          {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
            <Card key={i} className="h-80 border border-white/5 bg-white/[0.02] glass overflow-hidden rounded-[2rem]">
              <div className="h-48 w-full bg-white/5 animate-pulse" />
              <CardContent className="p-5 space-y-4">
                <div className="h-6 w-3/4 bg-white/10 rounded-lg animate-pulse" />
                <div className="flex justify-between items-center">
                  <div className="h-4 w-1/3 bg-white/5 rounded-md animate-pulse" />
                  <div className="h-4 w-10 bg-white/10 rounded-md animate-pulse" />
                </div>
                <div className="h-2 w-full bg-white/5 rounded-full overflow-hidden">
                  <div className="h-full w-1/4 bg-primary/20 animate-pulse" />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </main>
  )
}
