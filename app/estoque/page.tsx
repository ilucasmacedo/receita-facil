'use client'

import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import { useAuth } from '@/hooks/useAuth'
import { Ingrediente } from '@/types/database'
import { HistoricoEstoque } from '@/types/vendas'
import { 
  Package,
  TrendingUp,
  TrendingDown,
  AlertTriangle,
  History,
  Loader2,
  RefreshCw
} from 'lucide-react'

export default function EstoquePage() {
  const { user, loading: authLoading } = useAuth()
  const [ingredientes, setIngredientes] = useState<Ingrediente[]>([])
  const [historico, setHistorico] = useState<HistoricoEstoque[]>([])
  const [loading, setLoading] = useState(false)
  const [ingredienteSelecionado, setIngredienteSelecionado] = useState<string | null>(null)

  useEffect(() => {
    if (user) {
      loadEstoque()
    }
  }, [user])

  const loadEstoque = async () => {
    if (!user) return
    setLoading(true)
    try {
      const { data, error } = await supabase
        .from('ingredientes')
        .select('*')
        .eq('user_id', user.id)
        .order('nome', { ascending: true })

      if (error) throw error
      setIngredientes(data || [])
    } catch (error: any) {
      console.error('Erro ao carregar estoque:', error)
      alert(`Erro ao carregar estoque: ${error.message}`)
    } finally {
      setLoading(false)
    }
  }

  const loadHistoricoIngrediente = async (ingredienteId: string) => {
    try {
      const { data, error } = await supabase
        .from('historico_estoque')
        .select('*')
        .eq('ingrediente_id', ingredienteId)
        .order('data_movimentacao', { ascending: false })
        .limit(20)

      if (error) throw error
      setHistorico(data || [])
      setIngredienteSelecionado(ingredienteId)
    } catch (error: any) {
      console.error('Erro ao carregar histórico:', error)
      alert(`Erro ao carregar histórico: ${error.message}`)
    }
  }

  const getStatusEstoque = (quantidade: number, unidade: string) => {
    // Define limites de estoque baixo baseado na unidade
    const limites: Record<string, number> = {
      'g': 100,
      'kg': 0.5,
      'ml': 100,
      'L': 0.5,
      'un': 5
    }

    const limite = limites[unidade] || 10

    if (quantidade <= 0) {
      return { cor: 'bg-red-100 text-red-800 border-red-300', texto: 'SEM ESTOQUE', icone: AlertTriangle }
    } else if (quantidade <= limite) {
      return { cor: 'bg-yellow-100 text-yellow-800 border-yellow-300', texto: 'ESTOQUE BAIXO', icone: AlertTriangle }
    } else {
      return { cor: 'bg-green-100 text-green-800 border-green-300', texto: 'OK', icone: Package }
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
          <Package className="h-7 sm:h-8 w-7 sm:w-8 text-purple-500" />
          Controle de Estoque
        </h1>
        <button
          onClick={loadEstoque}
          disabled={loading}
          className="flex items-center justify-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-md transition-colors disabled:opacity-50"
        >
          <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
          Atualizar
        </button>
      </div>

      {/* Resumo */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <div className="bg-white rounded-lg shadow-md p-4">
          <div className="flex items-center gap-2 mb-2">
            <Package className="h-5 w-5 text-blue-500" />
            <p className="text-sm text-gray-600">Total de Itens</p>
          </div>
          <p className="text-2xl font-bold text-gray-900">{ingredientes.length}</p>
        </div>

        <div className="bg-white rounded-lg shadow-md p-4">
          <div className="flex items-center gap-2 mb-2">
            <TrendingUp className="h-5 w-5 text-green-500" />
            <p className="text-sm text-gray-600">Com Estoque</p>
          </div>
          <p className="text-2xl font-bold text-green-600">
            {ingredientes.filter(i => i.quantidade_total > 0).length}
          </p>
        </div>

        <div className="bg-white rounded-lg shadow-md p-4">
          <div className="flex items-center gap-2 mb-2">
            <AlertTriangle className="h-5 w-5 text-yellow-500" />
            <p className="text-sm text-gray-600">Estoque Baixo</p>
          </div>
          <p className="text-2xl font-bold text-yellow-600">
            {ingredientes.filter(i => {
              const status = getStatusEstoque(i.quantidade_total, i.unidade)
              return status.texto === 'ESTOQUE BAIXO'
            }).length}
          </p>
        </div>

        <div className="bg-white rounded-lg shadow-md p-4">
          <div className="flex items-center gap-2 mb-2">
            <TrendingDown className="h-5 w-5 text-red-500" />
            <p className="text-sm text-gray-600">Sem Estoque</p>
          </div>
          <p className="text-2xl font-bold text-red-600">
            {ingredientes.filter(i => i.quantidade_total <= 0).length}
          </p>
        </div>
      </div>

      {/* Lista de Estoque */}
      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        <div className="px-4 sm:px-6 py-4 border-b border-gray-200 bg-gray-50">
          <h2 className="text-lg sm:text-xl font-semibold text-gray-700">
            Estoque Atual ({ingredientes.length} itens)
          </h2>
        </div>

        {loading ? (
          <div className="p-8 text-center">
            <Loader2 className="h-6 w-6 animate-spin text-purple-500 mx-auto" />
            <p className="mt-2 text-gray-600">Carregando estoque...</p>
          </div>
        ) : ingredientes.length === 0 ? (
          <div className="p-8 text-center text-gray-500">
            <Package className="h-16 w-16 mx-auto mb-4 text-gray-300" />
            <p className="mb-2">Nenhum ingrediente cadastrado</p>
            <p className="text-sm">Cadastre ingredientes primeiro</p>
          </div>
        ) : (
          <div className="divide-y divide-gray-200">
            {ingredientes.map((ingrediente) => {
              const status = getStatusEstoque(ingrediente.quantidade_total, ingrediente.unidade)
              const StatusIcon = status.icone
              const custoTotal = ingrediente.preco_compra
              const custoUnitario = ingrediente.quantidade_total > 0 
                ? (ingrediente.preco_compra / ingrediente.quantidade_total) 
                : 0

              return (
                <div key={ingrediente.id} className="p-4 sm:p-6 hover:bg-gray-50 transition-colors">
                  <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
                    {/* Informações */}
                    <div className="flex-1">
                      <div className="flex items-start gap-3 mb-3">
                        <Package className="h-5 w-5 text-gray-400 mt-0.5 flex-shrink-0" />
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <h3 className="text-base sm:text-lg font-semibold text-gray-900">
                              {ingrediente.nome}
                            </h3>
                            {ingrediente.tipo_origem === 'producao_propria' && (
                              <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-green-100 text-green-800">
                                Produção Própria
                              </span>
                            )}
                          </div>
                          
                          {/* Badge de Status */}
                          <div className={`inline-flex items-center gap-1 px-2 py-1 rounded-md text-xs font-medium border-2 ${status.cor} mb-2`}>
                            <StatusIcon className="h-3 w-3" />
                            {status.texto}
                          </div>
                        </div>
                      </div>

                      {/* Detalhes */}
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-sm">
                        <div>
                          <p className="text-gray-600">Quantidade</p>
                          <p className="font-semibold text-gray-900">
                            {ingrediente.quantidade_total.toFixed(2)} {ingrediente.unidade}
                          </p>
                        </div>
                        <div>
                          <p className="text-gray-600">Custo Total</p>
                          <p className="font-semibold text-gray-900">R$ {custoTotal.toFixed(2)}</p>
                        </div>
                        <div>
                          <p className="text-gray-600">Custo Unitário</p>
                          <p className="font-semibold text-green-600">
                            R$ {custoUnitario.toFixed(4)}/{ingrediente.unidade}
                          </p>
                        </div>
                        <div>
                          <p className="text-gray-600">Valor em Estoque</p>
                          <p className="font-semibold text-blue-600">
                            R$ {(ingrediente.quantidade_total * custoUnitario).toFixed(2)}
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* Botão Histórico */}
                    <button
                      onClick={() => loadHistoricoIngrediente(ingrediente.id)}
                      className="flex items-center justify-center gap-2 px-4 py-2 bg-purple-100 hover:bg-purple-200 text-purple-700 text-sm font-medium rounded-md transition-colors"
                    >
                      <History className="h-4 w-4" />
                      <span className="hidden sm:inline">Ver Histórico</span>
                      <span className="sm:hidden">Histórico</span>
                    </button>
                  </div>

                  {/* Histórico (inline) */}
                  {ingredienteSelecionado === ingrediente.id && (
                    <div className="mt-4 pt-4 border-t border-gray-200">
                      <h4 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                        <History className="h-4 w-4" />
                        Histórico de Movimentações:
                      </h4>
                      {historico.length === 0 ? (
                        <p className="text-sm text-gray-500">Nenhuma movimentação registrada</p>
                      ) : (
                        <div className="space-y-2 max-h-64 overflow-y-auto">
                          {historico.map((h) => (
                            <div key={h.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-md text-sm">
                              <div className="flex items-center gap-3">
                                {h.tipo_movimentacao === 'entrada_compra' ? (
                                  <TrendingUp className="h-4 w-4 text-green-600" />
                                ) : (
                                  <TrendingDown className="h-4 w-4 text-red-600" />
                                )}
                                <div>
                                  <p className="font-medium text-gray-900">
                                    {h.tipo_movimentacao === 'entrada_compra' ? 'Entrada (Compra)' : 'Saída (Venda)'}
                                  </p>
                                  <p className="text-xs text-gray-600">
                                    {new Date(h.data_movimentacao).toLocaleString('pt-BR')}
                                  </p>
                                  {h.observacao && (
                                    <p className="text-xs text-gray-500 italic">{h.observacao}</p>
                                  )}
                                </div>
                              </div>
                              <div className="text-right">
                                <p className={`font-semibold ${
                                  h.tipo_movimentacao === 'entrada_compra' ? 'text-green-600' : 'text-red-600'
                                }`}>
                                  {h.tipo_movimentacao === 'entrada_compra' ? '+' : '-'}
                                  {h.quantidade.toFixed(2)} {ingrediente.unidade}
                                </p>
                                {h.quantidade_anterior !== null && h.quantidade_nova !== null && (
                                  <p className="text-xs text-gray-500">
                                    {h.quantidade_anterior.toFixed(2)} → {h.quantidade_nova.toFixed(2)}
                                  </p>
                                )}
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                      <button
                        onClick={() => setIngredienteSelecionado(null)}
                        className="mt-3 text-sm text-purple-600 hover:text-purple-700 font-medium"
                      >
                        Fechar
                      </button>
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}

