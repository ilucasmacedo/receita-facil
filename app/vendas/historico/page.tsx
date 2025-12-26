'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { supabase } from '@/lib/supabase'
import { useAuth } from '@/hooks/useAuth'
import { Venda, ItemVendaComReceita } from '@/types/vendas'
import { 
  Calendar,
  DollarSign,
  TrendingUp,
  User,
  FileText,
  Loader2,
  ArrowLeft,
  Eye,
  Package
} from 'lucide-react'
import { FiltroGenerico, PeriodoFiltro, RangeFiltro } from '@/components/FiltroGenerico'
import { calcularPeriodo, estaNoRange } from '@/lib/filtros-utils'

export default function HistoricoVendasPage() {
  const { user, loading: authLoading } = useAuth()
  const [vendas, setVendas] = useState<Venda[]>([])
  const [loading, setLoading] = useState(false)
  const [vendaSelecionada, setVendaSelecionada] = useState<string | null>(null)
  const [itensVenda, setItensVenda] = useState<ItemVendaComReceita[]>([])
  const [loadingItens, setLoadingItens] = useState(false)

  // Estados de filtro
  const primeiroDiaMes = new Date()
  primeiroDiaMes.setDate(1)
  const [dataInicio, setDataInicio] = useState(primeiroDiaMes.toISOString().split('T')[0])
  const [dataFim, setDataFim] = useState(new Date().toISOString().split('T')[0])
  const [valorMin, setValorMin] = useState('')
  const [valorMax, setValorMax] = useState('')
  const [ticketMin, setTicketMin] = useState('')
  const [ticketMax, setTicketMax] = useState('')

  useEffect(() => {
    if (user) {
      loadVendas()
    }
  }, [user])

  // Recarregar quando filtros de período mudarem
  useEffect(() => {
    if (user) {
      loadVendas()
    }
  }, [dataInicio, dataFim])

  const handlePresetPeriodo = (preset: string) => {
    if (!preset) return
    const { inicio, fim } = calcularPeriodo(preset)
    setDataInicio(inicio)
    setDataFim(fim)
  }

  const handleLimparFiltros = () => {
    const primeiroDia = new Date()
    primeiroDia.setDate(1)
    setDataInicio(primeiroDia.toISOString().split('T')[0])
    setDataFim(new Date().toISOString().split('T')[0])
    setValorMin('')
    setValorMax('')
    setTicketMin('')
    setTicketMax('')
  }

  const loadVendas = async () => {
    if (!user) return
    setLoading(true)
    try {
      let query = supabase
        .from('vendas')
        .select('*')
        .eq('user_id', user.id)
      
      // Filtro de período
      query = query.gte('data_venda', `${dataInicio}T00:00:00`)
      query = query.lte('data_venda', `${dataFim}T23:59:59`)
      
      query = query.order('data_venda', { ascending: false })

      const { data, error } = await query

      if (error) throw error
      setVendas(data || [])
    } catch (error: any) {
      console.error('Erro ao carregar vendas:', error)
      alert(`Erro ao carregar vendas: ${error.message}`)
    } finally {
      setLoading(false)
    }
  }

  // Filtrar vendas localmente (para filtros de valor e ticket)
  const vendasFiltradas = vendas.filter(venda => {
    // Filtro de valor total
    if (!estaNoRange(venda.valor_total, valorMin, valorMax)) return false

    // Filtro de ticket médio (valor total / quantidade de itens)
    // Para ticket médio, vamos considerar o valor da venda como um todo
    if (ticketMin || ticketMax) {
      if (!estaNoRange(venda.valor_total, ticketMin, ticketMax)) return false
    }

    return true
  })

  const loadItensVenda = async (vendaId: string) => {
    setLoadingItens(true)
    try {
      const { data, error } = await supabase
        .from('itens_venda')
        .select(`
          *,
          receitas (
            nome,
            foto_url
          )
        `)
        .eq('venda_id', vendaId)

      if (error) throw error
      setItensVenda(data || [])
      setVendaSelecionada(vendaId)
    } catch (error: any) {
      console.error('Erro ao carregar itens:', error)
      alert(`Erro ao carregar itens: ${error.message}`)
    } finally {
      setLoadingItens(false)
    }
  }

  const calcularEstatisticas = () => {
    const totalVendas = vendasFiltradas.length
    const valorTotal = vendasFiltradas.reduce((acc, v) => acc + v.valor_total, 0)
    const lucroTotal = vendasFiltradas.reduce((acc, v) => acc + v.lucro_total, 0)
    const ticketMedio = totalVendas > 0 ? valorTotal / totalVendas : 0

    return { totalVendas, valorTotal, lucroTotal, ticketMedio }
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

  const stats = calcularEstatisticas()

  return (
    <div className="container mx-auto px-3 sm:px-4 py-6 sm:py-8 max-w-7xl">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-800 flex items-center gap-2">
          <Calendar className="h-7 sm:h-8 w-7 sm:w-8 text-blue-500" />
          Histórico de Vendas
        </h1>
        <Link
          href="/vendas"
          className="flex items-center justify-center gap-2 px-4 py-2 bg-green-600 hover:bg-green-700 text-white font-medium rounded-md transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          Nova Venda
        </Link>
      </div>

      {/* Filtros */}
      <FiltroGenerico titulo="Filtrar Vendas" onLimpar={handleLimparFiltros}>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          <div className="sm:col-span-2 lg:col-span-2">
            <PeriodoFiltro
              dataInicio={dataInicio}
              dataFim={dataFim}
              onChangeInicio={setDataInicio}
              onChangeFim={setDataFim}
              onPresetChange={handlePresetPeriodo}
            />
          </div>
          <RangeFiltro
            label="Valor da Venda (R$)"
            valueMin={valorMin}
            valueMax={valorMax}
            onChangeMin={setValorMin}
            onChangeMax={setValorMax}
            placeholderMin="Mínimo"
            placeholderMax="Máximo"
            type="number"
          />
          <RangeFiltro
            label="Ticket Médio (R$)"
            valueMin={ticketMin}
            valueMax={ticketMax}
            onChangeMin={setTicketMin}
            onChangeMax={setTicketMax}
            placeholderMin="Mínimo"
            placeholderMax="Máximo"
            type="number"
            className="sm:col-span-2 lg:col-span-1"
          />
        </div>
        {(valorMin || valorMax || ticketMin || ticketMax) && (
          <div className="text-sm text-gray-600 mt-2">
            Mostrando {vendasFiltradas.length} de {vendas.length} venda(s)
          </div>
        )}
      </FiltroGenerico>

      {/* Estatísticas */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <div className="bg-white rounded-lg shadow-md p-4">
          <div className="flex items-center gap-2 mb-2">
            <Package className="h-5 w-5 text-blue-500" />
            <p className="text-sm text-gray-600">Total de Vendas</p>
          </div>
          <p className="text-2xl font-bold text-gray-900">{stats.totalVendas}</p>
        </div>

        <div className="bg-white rounded-lg shadow-md p-4">
          <div className="flex items-center gap-2 mb-2">
            <DollarSign className="h-5 w-5 text-green-500" />
            <p className="text-sm text-gray-600">Faturamento</p>
          </div>
          <p className="text-2xl font-bold text-green-600">R$ {stats.valorTotal.toFixed(2)}</p>
        </div>

        <div className="bg-white rounded-lg shadow-md p-4">
          <div className="flex items-center gap-2 mb-2">
            <TrendingUp className="h-5 w-5 text-blue-500" />
            <p className="text-sm text-gray-600">Lucro Total</p>
          </div>
          <p className="text-2xl font-bold text-blue-600">R$ {stats.lucroTotal.toFixed(2)}</p>
        </div>

        <div className="bg-white rounded-lg shadow-md p-4">
          <div className="flex items-center gap-2 mb-2">
            <DollarSign className="h-5 w-5 text-purple-500" />
            <p className="text-sm text-gray-600">Ticket Médio</p>
          </div>
          <p className="text-2xl font-bold text-purple-600">R$ {stats.ticketMedio.toFixed(2)}</p>
        </div>
      </div>

      {/* Lista de Vendas */}
      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        <div className="px-4 sm:px-6 py-4 border-b border-gray-200 bg-gray-50">
          <h2 className="text-lg sm:text-xl font-semibold text-gray-700">
            Vendas Realizadas ({vendas.length})
          </h2>
        </div>

        {loading ? (
          <div className="p-8 text-center">
            <Loader2 className="h-6 w-6 animate-spin text-green-500 mx-auto" />
            <p className="mt-2 text-gray-600">Carregando vendas...</p>
          </div>
        ) : vendas.length === 0 ? (
          <div className="p-8 text-center text-gray-500">
            <Calendar className="h-16 w-16 mx-auto mb-4 text-gray-300" />
            <p className="mb-2">Nenhuma venda realizada ainda</p>
            <p className="text-sm">Faça sua primeira venda para começar!</p>
          </div>
        ) : (
          <div className="divide-y divide-gray-200">
            {vendasFiltradas.map((venda) => (
              <div key={venda.id} className="p-4 sm:p-6 hover:bg-gray-50 transition-colors">
                <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
                  {/* Informações da Venda */}
                  <div className="flex-1">
                    <div className="flex items-start gap-3 mb-3">
                      <Calendar className="h-5 w-5 text-gray-400 mt-0.5 flex-shrink-0" />
                      <div>
                        <p className="text-sm text-gray-600">
                          {new Date(venda.data_venda).toLocaleString('pt-BR', {
                            day: '2-digit',
                            month: '2-digit',
                            year: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit'
                          })}
                        </p>
                        {venda.cliente_nome && (
                          <p className="text-sm text-gray-900 font-medium mt-1 flex items-center gap-2">
                            <User className="h-4 w-4" />
                            {venda.cliente_nome}
                          </p>
                        )}
                        {venda.observacoes && (
                          <p className="text-xs text-gray-500 mt-1 flex items-start gap-2">
                            <FileText className="h-3 w-3 mt-0.5 flex-shrink-0" />
                            {venda.observacoes}
                          </p>
                        )}
                      </div>
                    </div>

                    {/* Valores */}
                    <div className="grid grid-cols-3 gap-3 text-sm">
                      <div>
                        <p className="text-gray-600">Valor</p>
                        <p className="font-semibold text-green-600">R$ {venda.valor_total.toFixed(2)}</p>
                      </div>
                      <div>
                        <p className="text-gray-600">Custo</p>
                        <p className="font-semibold text-red-600">R$ {venda.custo_total.toFixed(2)}</p>
                      </div>
                      <div>
                        <p className="text-gray-600">Lucro</p>
                        <p className="font-semibold text-blue-600">R$ {venda.lucro_total.toFixed(2)}</p>
                      </div>
                    </div>
                  </div>

                  {/* Botão Ver Detalhes */}
                  <button
                    onClick={() => loadItensVenda(venda.id)}
                    className="flex items-center justify-center gap-2 px-4 py-2 bg-blue-100 hover:bg-blue-200 text-blue-700 text-sm font-medium rounded-md transition-colors"
                  >
                    <Eye className="h-4 w-4" />
                    Ver Itens
                  </button>
                </div>

                {/* Modal de Itens (inline) */}
                {vendaSelecionada === venda.id && (
                  <div className="mt-4 pt-4 border-t border-gray-200">
                    <h4 className="font-semibold text-gray-900 mb-3">Itens da Venda:</h4>
                    {loadingItens ? (
                      <div className="text-center py-4">
                        <Loader2 className="h-5 w-5 animate-spin text-blue-500 mx-auto" />
                      </div>
                    ) : (
                      <div className="space-y-2">
                        {itensVenda.map((item) => (
                          <div key={item.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-md">
                            <div>
                              <p className="font-medium text-gray-900">{item.receitas.nome}</p>
                              <p className="text-sm text-gray-600">
                                {item.quantidade}x R$ {item.preco_unitario.toFixed(2)}
                              </p>
                            </div>
                            <div className="text-right">
                              <p className="font-semibold text-green-600">R$ {item.subtotal.toFixed(2)}</p>
                              <p className="text-xs text-blue-600">Lucro: R$ {item.lucro.toFixed(2)}</p>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                    <button
                      onClick={() => setVendaSelecionada(null)}
                      className="mt-3 text-sm text-blue-600 hover:text-blue-700 font-medium"
                    >
                      Fechar
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

