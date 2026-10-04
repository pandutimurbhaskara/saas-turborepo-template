'use client'

import { Tabs, TabsList, TabsTrigger } from '@repo/ui'
import { useTheme } from 'next-themes'

const THEME_OPTIONS = [
  { value: 'light', label: 'Light' },
  { value: 'dark', label: 'Dark' },
  { value: 'system', label: 'System' },
] as const

export function ThemePreference() {
  const { theme, setTheme } = useTheme()

  return (
    <Tabs value={theme ?? 'system'} onValueChange={setTheme}>
      <TabsList>
        {THEME_OPTIONS.map((option) => (
          <TabsTrigger key={option.value} value={option.value}>
            {option.label}
          </TabsTrigger>
        ))}
      </TabsList>
    </Tabs>
  )
}
