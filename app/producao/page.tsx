'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Loader2 } from 'lucide-react'

export default function ProducaoRedirect() {
  const router = useRouter()

  useEffect(() => {
    router.replace('/produtos')
  }, [router])

  return (
    <div className="container mx-auto px-4 py-8 flex items-center justify-center min-h-screen">
      <div className="text-center">
        <Loader2 className="h-8 w-8 animate-spin text-orange-500 mx-auto mb-4" />
        <p className="text-gray-600">Redirecionando para Produtos...</p>
      </div>
    </div>
  )
}
