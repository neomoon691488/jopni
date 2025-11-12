import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'Школьная Социальная Сеть',
  description: 'Социальная сеть для общения школьников',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="ru">
      <body>{children}</body>
    </html>
  )
}

