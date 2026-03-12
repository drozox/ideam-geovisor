import type React from "react"
import type { Metadata } from "next"
import { Geist, Geist_Mono } from "next/font/google"
import "../app/styles/globals.css"
import Providers from "./providers"

const geistSans = Geist({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-geist-sans",
})

const geistMono = Geist_Mono({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-geist-mono",
})

export const metadata: Metadata = {
  title: "IDEAM Geovisor - Estaciones Meteorológicas",
  description: "Visualizador de estaciones meteorológicas de Colombia",
  generator: "custom",
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html
      lang="es"
      className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      suppressHydrationWarning
    >
      <body className="font-sans bg-white text-gray-900">
        <Providers>{children}</Providers>
      </body>
    </html>
  )
}
