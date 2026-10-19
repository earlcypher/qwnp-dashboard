import type { Metadata } from 'next'
import './globals.css'
import { APP_ENV } from '../lib/environment'

export const metadata: Metadata = {
  title: 'Qwen Proxy Dashboard',
  description: 'Manage API keys for Qwen Proxy',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className="antialiased">
        {APP_ENV === 'staging' && (
          <div role="status" className="sticky top-0 z-50 border-b border-amber-700/50 bg-amber-400 px-4 py-2 text-center text-sm font-semibold tracking-wide text-slate-950">
            STAGING — test database and proxy keys; shared Qwen session
          </div>
        )}
        {children}
      </body>
    </html>
  )
}
