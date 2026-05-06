import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'LəçinSatış - Çörək Satış Sistemi',
  description: 'Telegram Mini App ilə çörək satış və logistikası idarəetmə sistemi',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="az">
      <head>
        <script src="https://telegram.org/js/telegram-web-app.js" async />
        <script src="https://cdn.jsdelivr.net/npm/qrcode@1.5.3/build/qrcode.min.js" async />
      </head>
      <body className="antialiased">
        {children}
      </body>
    </html>
  )
}
