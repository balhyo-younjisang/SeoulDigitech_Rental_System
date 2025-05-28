import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import { Toaster } from 'react-hot-toast'
import Header from "./components/Header"

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: '디지텍 대여 시스템',
  description: '디지텍 기자재 대여 시스템',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="ko">
      <body className={inter.className}>
        <Header />
        {children}
        <footer className="bg-white mt-8">
          <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
            <p className="text-center text-gray-500 text-sm">
              © 2024 서울디지텍고등학교. All rights reserved.
            </p>
          </div>
        </footer>
        <Toaster position="top-center" />
      </body>
    </html>
  )
}
