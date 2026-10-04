'use client'

import { cn } from '@repo/utils'
import { Search } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'

import { Dialog, DialogContent, DialogDescription, DialogTitle } from './dialog'

export interface SearchCommandItem {
  href: string
  label: string
}

export interface SearchCommandProps {
  items: SearchCommandItem[]
  placeholder?: string
  className?: string
}

export function SearchCommand({
  items,
  placeholder = 'Search pages…',
  className,
}: SearchCommandProps) {
  const router = useRouter()
  const [open, setOpen] = useState(false)
  const [query, setQuery] = useState('')

  useEffect(() => {
    function onKeyDown(event: KeyboardEvent) {
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === 'k') {
        event.preventDefault()
        setOpen((value) => !value)
      }
    }

    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [])

  const normalized = query.trim().toLowerCase()
  const results = normalized
    ? items.filter((item) => item.label.toLowerCase().includes(normalized))
    : items

  function select(href: string) {
    setOpen(false)
    setQuery('')
    router.push(href)
  }

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className={cn(
          'flex h-9 w-full items-center gap-2 rounded-xl border border-border bg-surface px-3 text-ui text-subtle-foreground transition-colors duration-200 hover:border-primary/40 hover:text-muted-foreground focus-visible:shadow-focus focus-visible:outline-none sm:w-56',
          className,
        )}
        aria-label="Search"
      >
        <Search className="size-4 shrink-0" />
        <span className="flex-1 text-left">Search</span>
        <kbd className="rounded border border-border bg-subtle px-1.5 py-0.5 font-mono text-[10px] text-subtle-foreground">
          ⌘K
        </kbd>
      </button>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent hideClose className="max-w-md gap-0 overflow-hidden p-0">
          <DialogTitle className="sr-only">Search</DialogTitle>
          <DialogDescription className="sr-only">
            Search and navigate within this application.
          </DialogDescription>
          <div className="flex items-center gap-2.5 border-b border-border px-4">
            <Search className="size-4 shrink-0 text-subtle-foreground" />
            <input
              autoFocus
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder={placeholder}
              className="h-12 w-full bg-transparent text-ui text-foreground outline-none placeholder:text-subtle-foreground"
            />
          </div>
          <div className="max-h-72 overflow-y-auto p-2">
            {results.length === 0 ? (
              <p className="px-3 py-8 text-center text-small text-muted-foreground">
                No results found.
              </p>
            ) : (
              <ul className="flex flex-col gap-0.5">
                {results.map((item) => (
                  <li key={item.href}>
                    <button
                      type="button"
                      onClick={() => select(item.href)}
                      className="w-full rounded-md px-3 py-2 text-left text-ui text-foreground transition-colors hover:bg-subtle focus-visible:bg-subtle focus-visible:outline-none"
                    >
                      {item.label}
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </>
  )
}
