'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { supabase } from '@/lib/supabase'
import { useAuth } from '@/hooks/useAuth'
import { Receita } from '@/types/database'
import { 
  Archive,
  ArrowLeft,
  Loader2,
  RotateCcw,
  Calendar,
  DollarSign,
  Package,
  TrendingUp
} from 'lucide-react'

export default function ReceitasDesativadasPage() {
  const { user, loading: authLoading } = useAuth()
  const [receitas, setReceitas] = useState<Receita[]>([])
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (user) {
      loadReceitas()
    }
  }, [user])

  const loadReceitas = async () => {
    if (!user) return
    setLoading(true)
    try {
      const { data, error } = await supabase
        .from('receitas')
        .select('*')
        .eq('user_id', user.id)
        .eq('ativo', false) // Apenas receitas desativadas
        .order('data_desativacao', { ascending: false })

      if (error) throw error
      setReceitas(data || [])
    } catch (error: any) {
      console.error('Erro ao carregar receitas desativadas:', error)
      alert(`Erro ao carregar receitas: ${error.message}`)
    } finally {
      setLoading(false)
    }
  }

  const handleReativar = async (id: string, nome: string) => {
    if (!confirm(`Deseja reativar a receita "${nome}"?\n\nEla voltará a aparecer nas listas ativas.`)) return

    try {
      const { data, error } = await supabase.rpc('reativar_receita', {
        receita_id_param: id
      })
      
      if (error) throw error
      
      const resultado = data?.[0]
      if (resultado?.sucesso) {
        alert(`✅ ${resultado.mensagem}`)
        await loadReceitas()
      } else {
        alert(`❌ ${resultado?.mensagem || 'Erro ao reativar'}`)
      }
    } catch (error: any) {
      console.error('Erro ao reativar:', error)
      alert(`Erro ao reativar: ${error.message}`)
    }
  }

  if (authLoading) {
    return (
      <div className="container mx-auto px-4 py-8 flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-orange-500" />
      </div>
    )
  }

  if (!user) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-md mx-auto bg-white p-6 rounded-lg shadow-md">
          <h2 className="text-xl font-semibold mb-4">Acesso Restrito</h2>
          <p className="text-gray-600">Você precisa estar logado.</p>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-3 sm:px-4 py-6 sm:py-8 max-w-7xl">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-800 flex items-center gap-2">
          <Archive className="h-7 sm:h-8 w-7 sm:w-8 text-gray-500" />
          Receitas Desativadas
        </h1>
        <Link
          href="/receitas"
          className="flex items-center justify-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-md transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          Voltar para Ativas
        </Link>
      </div>

      {/* Informação */}
      <div className="bg-blue-50 border-l-4 border-blue-400 p-4 mb-6">
        <div className="flex">
          <div className="flex-shrink-0">
            <Package className="h-5 w-5 text-blue-400" />
          </div>
          <div className="ml-3">
            <p className="text-sm text-blue-700">
              <strong>Receitas desativadas</strong> não aparecem nas listas de produção e vendas, 
              mas seu histórico e estatísticas são preservados. Você pode reativá-las a qualquer momento.
            </p>
          </div>
        </div>
      </div>

      {/* Contador */}
      <div className="mb-6">
        <p className="text-gray-600">
          {loading ? (
            <span className="flex items-center gap-2">
              <Loader2 className="h-4 w-4 animate-spin" />
              Carregando...
            </span>
          ) : receitas.length === 0 ? (
            'Nenhuma receita desativada'
          ) : (
            `${receitas.length} receita${receitas.length !== 1 ? 's' : ''} desativada${receitas.length !== 1 ? 's' : ''}`
          )}
        </p>
      </div>

      {/* Lista de Receitas */}
      {receitas.length === 0 ? (
        <div className="bg-white rounded-lg shadow-md p-8 text-center">
          <Archive className="h-16 w-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-600 mb-2">
            Nenhuma receita desativada
          </h3>
          <p className="text-gray-500 mb-4">
            Todas as suas receitas estão ativas no momento.
          </p>
          <Link
            href="/receitas"
            className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-md transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
            Ver Receitas Ativas
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
          {receitas.map((receita) => (
            <div
              key={receita.id}
              className="bg-white rounded-lg shadow-md overflow-hidden border-2 border-gray-200 opacity-75 hover:opacity-100 transition-opacity"
            >
              {/* Foto */}
              {receita.foto_url ? (
                <div className="h-48 overflow-hidden bg-gray-100">
                  <img
                    src={receita.foto_url}
                    alt={receita.nome}
                    className="w-full h-full object-cover"
                  />
                </div>
              ) : (
                <div className="h-48 bg-gray-200 flex items-center justify-center">
                  <Archive className="h-16 w-16 text-gray-400" />
                </div>
              )}

              {/* Conteúdo */}
              <div className="p-4">
                <h3 className="text-lg font-semibold text-gray-800 mb-2 line-through">
                  {receita.nome}
                </h3>

                {/* Motivo */}
                {receita.motivo_desativacao && (
                  <p className="text-sm text-gray-600 mb-3 italic">
                    {receita.motivo_desativacao}
                  </p>
                )}

                {/* Data de desativação */}
                {receita.data_desativacao && (
                  <div className="flex items-center gap-2 text-sm text-gray-500 mb-3">
                    <Calendar className="h-4 w-4" />
                    <span>
                      Desativada em {new Date(receita.data_desativacao).toLocaleDateString('pt-BR')}
                    </span>
                  </div>
                )}

                {/* Informações */}
                <div className="space-y-2 mb-4">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Rendimento:</span>
                    <span className="font-medium">{receita.rendimento_porcoes} porções</span>
                  </div>
                  {receita.custo_total !== undefined && (
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Custo:</span>
                      <span className="font-medium text-blue-600">
                        R$ {receita.custo_total.toFixed(2)}
                      </span>
                    </div>
                  )}
                  {receita.preco_venda !== undefined && (
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Preço Venda:</span>
                      <span className="font-medium text-green-600">
                        R$ {receita.preco_venda.toFixed(2)}
                      </span>
                    </div>
                  )}
                </div>

                {/* Botão Reativar */}
                <button
                  onClick={() => handleReativar(receita.id, receita.nome)}
                  className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-green-600 hover:bg-green-700 text-white font-medium rounded-md transition-colors"
                >
                  <RotateCcw className="h-4 w-4" />
                  Reativar Receita
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

