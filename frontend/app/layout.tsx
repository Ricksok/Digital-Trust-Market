import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import Layout from '@/components/Layout'
import { QueryProvider } from '@/lib/providers/QueryProvider'
import './globals.css'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'Digital Trust Marketplace',
  description: 'Web3-powered platform connecting investors and fundraisers',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <QueryProvider>
          <Layout>{children}</Layout>
        </QueryProvider>
      </body>
    </html>
  )
}

