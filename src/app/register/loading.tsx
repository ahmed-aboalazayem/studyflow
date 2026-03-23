"use client"

export default function Loading() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-[#070707] p-4 bg-[radial-gradient(ellipse_at_bottom,_var(--tw-gradient-stops))] from-blue-900/20 via-black to-black animate-pulse">
      <div className="w-full max-w-md h-[400px] bg-white/5 border border-white/10 rounded-3xl glass" />
    </div>
  )
}
