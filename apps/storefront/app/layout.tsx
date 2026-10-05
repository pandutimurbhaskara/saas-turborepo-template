import { getCurrentUser } from '@repo/auth'
import {
  Brand,
  Button,
  SiteFooter,
  SiteHeader,
  ThemeProvider,
  ThemeToggle,
  UserMenu,
} from '@repo/ui'
import type { Metadata } from 'next'
import Link from 'next/link'

import { CartLink } from '@/components/cart-link'
import { signOutAction } from '@/lib/actions'
import { APP_DESCRIPTION, APP_NAME } from '@/lib/app'

import './globals.css'

export const metadata: Metadata = {
  title: {
    default: `${APP_NAME} — Online store`,
    template: `%s · ${APP_NAME}`,
  },
  description: APP_DESCRIPTION,
}

const NAVIGATION = [
  { href: '/', label: 'Home' },
  { href: '/products', label: 'Products' },
]

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const user = await getCurrentUser()

  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://api.fontshare.com" />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://api.fontshare.com/v2/css?f[]=general-sans@600,700&display=swap"
          rel="stylesheet"
        />
        <link
          href="https://fonts.googleapis.com/css2?family=DM+Sans:opsz,wght@9..40,400..700&family=JetBrains+Mono:wght@400;500&display=swap"
          rel="stylesheet"
        />
      </head>
      <body>
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <div className="flex min-h-dvh flex-col">
            <SiteHeader
              brand={<Brand name={APP_NAME} />}
              navigation={NAVIGATION}
              searchItems={NAVIGATION}
              actions={
                <div className="flex items-center gap-2">
                  <CartLink />
                  <ThemeToggle />
                  {user ? (
                    <UserMenu
                      name={user.name}
                      email={user.email}
                      image={user.image}
                      signOutAction={signOutAction}
                      links={[
                        { href: '/dashboard', label: 'Dashboard' },
                        { href: '/orders', label: 'Orders' },
                        { href: '/profile', label: 'Profile' },
                        { href: '/settings', label: 'Settings' },
                      ]}
                    />
                  ) : (
                    <>
                      <Button variant="ghost" size="sm" asChild>
                        <Link href="/login">Sign in</Link>
                      </Button>
                      <Button size="sm" asChild>
                        <Link href="/register">Create account</Link>
                      </Button>
                    </>
                  )}
                </div>
              }
            />
            <main className="flex-1">{children}</main>
            <SiteFooter
              brand={<Brand name={APP_NAME} />}
              description={APP_DESCRIPTION}
              columns={[
                {
                  title: 'Shop',
                  links: [
                    { label: 'Home', href: '/' },
                    { label: 'Products', href: '/products' },
                    { label: 'Cart', href: '/cart' },
                  ],
                },
                {
                  title: 'Account',
                  links: [
                    { label: 'Sign in', href: '/login' },
                    { label: 'Create account', href: '/register' },
                    { label: 'Orders', href: '/orders' },
                  ],
                },
              ]}
              copyright={`© ${new Date().getFullYear()} ${APP_NAME}. Built on the shared Turborepo foundation.`}
            />
          </div>
        </ThemeProvider>
      </body>
    </html>
  )
}
