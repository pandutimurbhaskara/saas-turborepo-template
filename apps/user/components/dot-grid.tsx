'use client'

import { cn } from '@repo/utils'
import { useEffect, useRef } from 'react'

const SPACING = 28
const BASE_RADIUS = 1
const INFLUENCE_RADIUS = 140

export interface DotGridProps {
  className?: string
}

export function DotGrid({ className }: DotGridProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const context = canvas.getContext('2d')
    if (!context) return

    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    const pointer = { x: Number.NEGATIVE_INFINITY, y: Number.NEGATIVE_INFINITY }
    let frame = 0

    function colors() {
      const styles = getComputedStyle(document.documentElement)
      return {
        base: getComputedStyle(canvas!).color,
        accent: styles.getPropertyValue('--color-primary').trim() || '#6366f1',
      }
    }

    function draw() {
      frame = 0
      if (!canvas || !context) return

      const { width, height } = canvas.getBoundingClientRect()
      const scale = window.devicePixelRatio || 1

      if (
        canvas.width !== Math.floor(width * scale) ||
        canvas.height !== Math.floor(height * scale)
      ) {
        canvas.width = Math.floor(width * scale)
        canvas.height = Math.floor(height * scale)
      }

      context.setTransform(scale, 0, 0, scale, 0, 0)
      context.clearRect(0, 0, width, height)

      const { base, accent } = colors()

      for (let x = SPACING / 2; x < width; x += SPACING) {
        for (let y = SPACING / 2; y < height; y += SPACING) {
          const distance = Math.hypot(x - pointer.x, y - pointer.y)
          const proximity = Math.max(0, 1 - distance / INFLUENCE_RADIUS)

          context.beginPath()
          context.arc(x, y, BASE_RADIUS + proximity * 1.6, 0, Math.PI * 2)
          context.fillStyle = proximity > 0.05 ? accent : base
          context.globalAlpha = 0.35 + proximity * 0.65
          context.fill()
        }
      }

      context.globalAlpha = 1
    }

    function scheduleDraw() {
      if (frame) return
      frame = window.requestAnimationFrame(draw)
    }

    function onPointerMove(event: PointerEvent) {
      const rect = canvas!.getBoundingClientRect()
      pointer.x = event.clientX - rect.left
      pointer.y = event.clientY - rect.top
      scheduleDraw()
    }

    function onPointerLeave() {
      pointer.x = Number.NEGATIVE_INFINITY
      pointer.y = Number.NEGATIVE_INFINITY
      scheduleDraw()
    }

    const resizeObserver = new ResizeObserver(scheduleDraw)
    resizeObserver.observe(canvas)
    scheduleDraw()

    if (!reduceMotion) {
      window.addEventListener('pointermove', onPointerMove, { passive: true })
      window.addEventListener('pointerleave', onPointerLeave)
    }

    return () => {
      resizeObserver.disconnect()
      window.removeEventListener('pointermove', onPointerMove)
      window.removeEventListener('pointerleave', onPointerLeave)
      if (frame) window.cancelAnimationFrame(frame)
    }
  }, [])

  return (
    <canvas
      ref={canvasRef}
      aria-hidden="true"
      className={cn('pointer-events-none absolute inset-0 size-full text-border', className)}
    />
  )
}
