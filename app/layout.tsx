import type { Metadata } from 'next'
import './globals.css'

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
        {children}
      </body>
    </html>
  )
}
