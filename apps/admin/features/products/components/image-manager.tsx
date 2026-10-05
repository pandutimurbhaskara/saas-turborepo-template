'use client'

import { MAX_PRODUCT_IMAGES, MAX_PRODUCT_IMAGE_BYTES, PRODUCT_IMAGE_MIME_TYPES } from '@repo/types'
import { ImagePlus, X } from 'lucide-react'
import Image from 'next/image'
import { useRef, useState } from 'react'

import { createUploadUrlAction } from '@/features/products/actions'

export interface ManagedImage {
  key: string
  url: string
}

export interface ImageManagerProps {
  initialImages?: ManagedImage[]
}

export function ImageManager({ initialImages = [] }: ImageManagerProps) {
  const inputRef = useRef<HTMLInputElement>(null)
  const [images, setImages] = useState<ManagedImage[]>(initialImages)
  const [error, setError] = useState<string | null>(null)
  const [uploading, setUploading] = useState(false)

  async function handleFiles(files: FileList | null) {
    if (!files || files.length === 0 || uploading) return

    setError(null)
    setUploading(true)

    try {
      const remaining = MAX_PRODUCT_IMAGES - images.length
      if (remaining <= 0) {
        setError(`You can upload at most ${MAX_PRODUCT_IMAGES} images.`)
        return
      }

      if (files.length > remaining) {
        setError(
          `Only the first ${remaining} image(s) were added — the limit is ${MAX_PRODUCT_IMAGES}.`,
        )
      }

      for (const file of Array.from(files).slice(0, remaining)) {
        if (!(PRODUCT_IMAGE_MIME_TYPES as readonly string[]).includes(file.type)) {
          setError(`Unsupported file type: ${file.type || file.name}.`)
          continue
        }
        if (file.size > MAX_PRODUCT_IMAGE_BYTES) {
          setError(`${file.name} is larger than 5 MB.`)
          continue
        }

        const result = await createUploadUrlAction(file.type)
        if (!result.ok) {
          setError(result.message)
          continue
        }

        const response = await fetch(result.uploadUrl, {
          method: 'PUT',
          headers: { 'Content-Type': file.type },
          body: file,
        })
        if (!response.ok) {
          setError(`Upload failed for ${file.name}.`)
          continue
        }

        setImages((current) => [...current, { key: result.key, url: result.publicUrl }])
      }
    } finally {
      setUploading(false)
      if (inputRef.current) inputRef.current.value = ''
    }
  }

  return (
    <div className="flex flex-col gap-3">
      {images.map((image) => (
        <input key={image.key} type="hidden" name="imageKeys" value={image.key} />
      ))}

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
        {images.map((image) => (
          <div
            key={image.key}
            className="group relative aspect-square overflow-hidden rounded-lg border border-border"
          >
            <Image src={image.url} alt="" fill sizes="320px" className="object-cover" />
            <button
              type="button"
              onClick={() =>
                setImages((current) => current.filter((entry) => entry.key !== image.key))
              }
              className="absolute right-2 top-2 rounded-md bg-black/60 p-1 text-white opacity-0 transition-opacity group-hover:opacity-100 focus-visible:opacity-100"
              aria-label="Remove image"
            >
              <X className="size-3.5" />
            </button>
          </div>
        ))}

        {images.length < MAX_PRODUCT_IMAGES && (
          <button
            type="button"
            onClick={() => inputRef.current?.click()}
            disabled={uploading}
            className="flex aspect-square flex-col items-center justify-center gap-2 rounded-lg border border-dashed border-border text-subtle-foreground transition-colors hover:border-primary hover:text-primary disabled:opacity-50"
          >
            <ImagePlus className="size-5" />
            <span className="text-caption">{uploading ? 'Uploading…' : 'Add image'}</span>
          </button>
        )}
      </div>

      <input
        ref={inputRef}
        type="file"
        accept={PRODUCT_IMAGE_MIME_TYPES.join(',')}
        multiple
        className="hidden"
        onChange={(event) => void handleFiles(event.target.files)}
      />

      {error && <p className="text-small text-error">{error}</p>}

      <p className="text-caption text-subtle-foreground">
        JPEG, PNG, WebP or AVIF up to 5 MB each. The first image is used as the product thumbnail.
      </p>
    </div>
  )
}
