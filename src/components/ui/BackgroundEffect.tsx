"use client"

import React, { useEffect, useRef } from 'react'

export const BackgroundEffect = React.memo(() => {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext('2d', { alpha: false }) // Optimization: hint no alpha needed for background
    if (!ctx) return

    let animationFrameId: number
    let stars: { x: number; y: number; size: number; opacity: number; speed: number }[] = []

    const resizeCanvas = () => {
      canvas.width = window.innerWidth
      canvas.height = window.innerHeight
      initStars()
    }

    const initStars = () => {
      stars = []
      // Use a higher divisor (8000 instead of 4000) to reduce star count by half
      const starCount = Math.floor((canvas.width * canvas.height) / 8000)
      for (let i = 0; i < starCount; i++) {
        stars.push({
          x: Math.random() * canvas.width,
          y: Math.random() * canvas.height,
          size: Math.random() * 1.2, // Slightly smaller stars
          opacity: Math.random(),
          speed: Math.random() * 0.015 // Slower, more subtle animation
        })
      }
    }

    const draw = () => {
      // Use a flat background color to clear instead of transparent clearRect
      ctx.fillStyle = '#030303'
      ctx.fillRect(0, 0, canvas.width, canvas.height)
      
      ctx.fillStyle = 'white' // Set fillStyle once for all stars
      stars.forEach(star => {
        ctx.globalAlpha = star.opacity // Use globalAlpha for opacity changes
        ctx.beginPath()
        ctx.arc(star.x, star.y, star.size, 0, Math.PI * 2)
        ctx.fill()

        star.opacity += star.speed
        if (star.opacity > 0.8 || star.opacity < 0.1) {
          star.speed = -star.speed
        }
      })

      animationFrameId = requestAnimationFrame(draw)
    }

    window.addEventListener('resize', resizeCanvas)
    resizeCanvas()
    draw()

    return () => {
      window.removeEventListener('resize', resizeCanvas)
      cancelAnimationFrame(animationFrameId)
    }
  }, [])

  return (
    <div className="fixed inset-0 z-[-1] overflow-hidden pointer-events-none bg-[#030303]">
      <canvas
        ref={canvasRef}
        className="absolute inset-0 opacity-40 will-change-transform"
      />
      {/* Reduced blur radius for better performance */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-primary/5 rounded-full blur-[100px] pointer-events-none" />
      <div className="absolute bottom-[-10%] left-1/2 -translate-x-1/2 w-[70%] h-[200px] bg-primary/3 rounded-full blur-[80px] pointer-events-none" />
    </div>
  )
})
