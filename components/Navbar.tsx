'use client'

import { useState } from 'react'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { ChefHat, LogIn, LogOut, Menu, X } from 'lucide-react'
import { useAuth } from '@/hooks/useAuth'
import { supabase } from '@/lib/supabase'

const navItems = [
  { href: '/', label: 'Dashboard', tourId: 'menu-dashboard' },
  { href: '/ingredientes', label: 'Insumos', tourId: 'menu-insumos' },
  { href: '/receitas', label: 'Modelos', tourId: 'menu-receitas' },
  { href: '/produtos', label: 'Produtos', tourId: 'menu-produtos' },
  { href: '/vendas', label: 'Vendas', tourId: 'menu-vendas' },
]

export default function Navbar() {
  const pathname = usePathname()
  const router = useRouter()
  const { user } = useAuth()
  const [menuAberto, setMenuAberto] = useState(false)

  const handleLogout = async () => {
    await supabase.auth.signOut()
    setMenuAberto(false)
    router.push('/login')
  }

  const fecharMenu = () => setMenuAberto(false)

  return (
    <nav className="fixed top-0 left-0 right-0 bg-white shadow-md z-50">
      <div className="container mx-auto px-4">
        {/* Barra Principal */}
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center space-x-2" onClick={fecharMenu}>
            <ChefHat className="h-7 w-7 text-orange-500" />
            <span className="text-lg md:text-xl font-bold text-gray-800">Receita Fácil</span>
          </Link>

          {/* Menu Desktop (escondido no mobile) */}
          <div className="hidden md:flex items-center space-x-4">
            {user ? (
              <>
                {navItems.map((item) => {
                  const isActive = pathname === item.href
                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      data-tour={item.tourId}
                      className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                        isActive
                          ? 'bg-orange-100 text-orange-700'
                          : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
                      }`}
                    >
                      {item.label}
                    </Link>
                  )
                })}
                <button
                  onClick={handleLogout}
                  className="flex items-center gap-2 px-3 py-2 rounded-md text-sm font-medium text-gray-600 hover:bg-gray-100 hover:text-gray-900 transition-colors"
                >
                  <LogOut className="h-4 w-4" />
                  Sair
                </button>
              </>
            ) : (
              <Link
                href="/login"
                className="flex items-center gap-2 px-3 py-2 rounded-md text-sm font-medium text-gray-600 hover:bg-gray-100 hover:text-gray-900 transition-colors"
              >
                <LogIn className="h-4 w-4" />
                Entrar
              </Link>
            )}
          </div>

          {/* Botão Hamburguer (apenas mobile) */}
          <button
            onClick={() => setMenuAberto(!menuAberto)}
            className="md:hidden p-2 rounded-md text-gray-600 hover:bg-gray-100 transition-colors"
            aria-label="Menu"
          >
            {menuAberto ? (
              <X className="h-6 w-6" />
            ) : (
              <Menu className="h-6 w-6" />
            )}
          </button>
        </div>

        {/* Menu Mobile (dropdown) */}
        {menuAberto && (
          <div className="md:hidden border-t border-gray-200 py-4">
            {user ? (
              <>
                {navItems.map((item) => {
                  const isActive = pathname === item.href
                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      onClick={fecharMenu}
                      data-tour={item.tourId}
                      className={`block px-4 py-3 rounded-md text-base font-medium transition-colors ${
                        isActive
                          ? 'bg-orange-100 text-orange-700'
                          : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
                      }`}
                    >
                      {item.label}
                    </Link>
                  )
                })}
                <button
                  onClick={handleLogout}
                  className="w-full flex items-center gap-2 px-4 py-3 rounded-md text-base font-medium text-gray-600 hover:bg-gray-100 hover:text-gray-900 transition-colors"
                >
                  <LogOut className="h-5 w-5" />
                  Sair
                </button>
              </>
            ) : (
              <Link
                href="/login"
                onClick={fecharMenu}
                className="flex items-center gap-2 px-4 py-3 rounded-md text-base font-medium text-gray-600 hover:bg-gray-100 hover:text-gray-900 transition-colors"
              >
                <LogIn className="h-5 w-5" />
                Entrar
              </Link>
            )}
          </div>
        )}
      </div>
    </nav>
  )
}

