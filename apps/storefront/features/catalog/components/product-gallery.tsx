'use client'

import { cn } from '@repo/utils'
import { ImageIcon } from 'lucide-react'
import Image from 'next/image'
import { useState } from 'react'

export interface GalleryImage {
  url: string
  alt: string | null
}

export interface ProductGalleryProps {
  name: string
  images: GalleryImage[]
}

export function ProductGallery({ name, images }: ProductGalleryProps) {
  const [activeIndex, setActiveIndex] = useState(0)

  if (images.length === 0) {
    return (
      <div className="relative flex aspect-square items-center justify-center overflow-hidden rounded-xl border border-border bg-subtle text-subtle-foreground">
        <ImageIcon className="size-8" />
      </div>
    )
  }

  const active = images[Math.min(activeIndex, images.length - 1)]

  return (
    <div className="flex flex-col gap-3">
      <div className="relative aspect-square overflow-hidden rounded-xl border border-border bg-subtle">
        {active && (
          <Image
            src={active.url}
            alt={active.alt ?? name}
            fill
            sizes="(max-width: 1024px) 100vw, 50vw"
            className="object-cover"
            priority
          />
        )}
      </div>

      {images.length > 1 && (
        <div className="flex flex-wrap gap-2">
          {images.map((image, index) => (
            <button
              key={image.url}
              type="button"
              onClick={() => setActiveIndex(index)}
              aria-label={`View image ${index + 1}`}
              className={cn(
                'relative size-16 overflow-hidden rounded-md border bg-subtle transition-colors',
                index === activeIndex ? 'border-primary' : 'border-border hover:border-primary/50',
              )}
            >
              <Image src={image.url} alt="" fill sizes="64px" className="object-cover" />
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
