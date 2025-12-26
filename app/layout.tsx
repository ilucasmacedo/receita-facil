import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import Navbar from '@/components/Navbar'
import OnboardingTour from '@/components/OnboardingTour'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'Receita Fácil - Gestão de Receitas e Precificação',
  description: 'Aplicativo de precificação de receitas para pequenos empreendedores culinários',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="pt-BR" className="light">
      <body className={`${inter.className} bg-gray-50 text-gray-900`}>
        <Navbar />
        <OnboardingTour />
        <main className="min-h-screen pt-16 bg-gray-50">
          {children}
        </main>
      </body>
    </html>
  )
}

