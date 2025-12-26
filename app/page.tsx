'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { supabase } from '@/lib/supabase'
import { useAuth } from '@/hooks/useAuth'
import { 
  TrendingUp, 
  DollarSign, 
  ShoppingCart, 
  Package,
  AlertTriangle,
  ArrowRight,
  Loader2
} from 'lucide-react'
import { FiltroGenerico, PeriodoFiltro } from '@/components/FiltroGenerico'
import { calcularPeriodo } from '@/lib/filtros-utils'

interface Estatisticas {
  totalVendas: number
  faturamentoMes: number
  lucroMes: number
  ticketMedio: number
  estoqueTotal: number
  estoqueBaixo: number
  semEstoque: number
  receitasCadastradas: number
}

export default function DashboardPage() {
  const { user, loading: authLoading } = useAuth()
  const [stats, setStats] = useState<Estatisticas | null>(null)
  const [loading, setLoading] = useState(false)
  const [alertasEstoque, setAlertasEstoque] = useState<any[]>([])

  // Estados de filtro de período
  const inicioMesPadrao = new Date()
  inicioMesPadrao.setDate(1)
  const [dataInicio, setDataInicio] = useState(inicioMesPadrao.toISOString().split('T')[0])
  const [dataFim, setDataFim] = useState(new Date().toISOString().split('T')[0])

  useEffect(() => {
    if (user) {
      loadEstatisticas()
      loadAlertasEstoque()
    }
  }, [user])

  // Recarregar quando período mudar
  useEffect(() => {
    if (user) {
      loadEstatisticas()
    }
  }, [dataInicio, dataFim])

  const handlePresetPeriodo = (preset: string) => {
    if (!preset) return
    const { inicio, fim } = calcularPeriodo(preset)
    setDataInicio(inicio)
    setDataFim(fim)
  }

  const handleLimparFiltros = () => {
    const primeiroDiaMes = new Date()
    primeiroDiaMes.setDate(1)
    setDataInicio(primeiroDiaMes.toISOString().split('T')[0])
    setDataFim(new Date().toISOString().split('T')[0])
  }

  const loadEstatisticas = async () => {
    if (!user) return
    setLoading(true)
    
    try {
      // Vendas do período filtrado
      const { data: vendas } = await supabase
        .from('vendas')
        .select('valor_total, lucro_total')
        .eq('user_id', user.id)
        .gte('data_venda', `${dataInicio}T00:00:00`)
        .lte('data_venda', `${dataFim}T23:59:59`)

      const totalVendas = vendas?.length || 0
      const faturamentoMes = vendas?.reduce((acc, v) => acc + v.valor_total, 0) || 0
      const lucroMes = vendas?.reduce((acc, v) => acc + v.lucro_total, 0) || 0
      const ticketMedio = totalVendas > 0 ? faturamentoMes / totalVendas : 0

      // Estoque
      const { data: ingredientes } = await supabase
        .from('ingredientes')
        .select('quantidade_total, estoque_minimo, unidade')
        .eq('user_id', user.id)

      const estoqueTotal = ingredientes?.length || 0
      const semEstoque = ingredientes?.filter(i => i.quantidade_total <= 0).length || 0
      const estoqueBaixo = ingredientes?.filter(i => 
        i.quantidade_total > 0 && i.quantidade_total <= (i.estoque_minimo || 0)
      ).length || 0

      // Receitas
      const { data: receitas } = await supabase
        .from('receitas')
        .select('id')
        .eq('user_id', user.id)

      const receitasCadastradas = receitas?.length || 0

      setStats({
        totalVendas,
        faturamentoMes,
        lucroMes,
        ticketMedio,
        estoqueTotal,
        estoqueBaixo,
        semEstoque,
        receitasCadastradas
      })
    } catch (error: any) {
      console.error('Erro ao carregar estatísticas:', error)
    } finally {
      setLoading(false)
    }
  }

  const loadAlertasEstoque = async () => {
    if (!user) return

    try {
      const { data } = await supabase
        .from('ingredientes')
        .select('id, nome, quantidade_total, estoque_minimo, unidade')
        .eq('user_id', user.id)
        .or('quantidade_total.eq.0,quantidade_total.lte.estoque_minimo')
        .order('quantidade_total', { ascending: true })
        .limit(5)

      setAlertasEstoque(data || [])
    } catch (error: any) {
      console.error('Erro ao carregar alertas:', error)
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
      <div className="container mx-auto px-4 py-8 max-w-md">
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-2xl font-bold mb-4">Bem-vindo ao Receita Fácil! 👋</h2>
          <p className="text-gray-600 mb-4">
            Faça login para acessar seu painel de controle.
          </p>
          <Link
            href="/login"
            className="block w-full bg-green-600 hover:bg-green-700 text-white font-medium py-3 px-6 rounded-md text-center transition-colors"
          >
            Fazer Login
          </Link>
        </div>
      </div>
    )
  }

  const formatarPeriodo = () => {
    const inicio = new Date(dataInicio + 'T00:00:00')
    const fim = new Date(dataFim + 'T00:00:00')
    
    if (dataInicio === dataFim) {
      return inicio.toLocaleDateString('pt-BR')
    }
    
    return `${inicio.toLocaleDateString('pt-BR')} - ${fim.toLocaleDateString('pt-BR')}`
  }

  return (
    <div className="container mx-auto px-3 sm:px-4 py-6 sm:py-8 max-w-7xl">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-800 mb-2">
          Dashboard
        </h1>
        <p className="text-gray-600">
          Bem-vindo de volta! Aqui está um resumo do seu negócio.
        </p>
      </div>

      {/* Filtros */}
      <FiltroGenerico titulo="Filtrar Período" onLimpar={handleLimparFiltros}>
        <PeriodoFiltro
          dataInicio={dataInicio}
          dataFim={dataFim}
          onChangeInicio={setDataInicio}
          onChangeFim={setDataFim}
          onPresetChange={handlePresetPeriodo}
        />
      </FiltroGenerico>

      {/* Cards de Estatísticas */}
      <div className="mb-6">
        <h2 className="text-lg font-semibold text-gray-700 mb-4 flex items-center gap-2">
          <TrendingUp className="h-5 w-5 text-blue-500" />
          Vendas: {formatarPeriodo()}
        </h2>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Total de Vendas */}
          <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg shadow-md p-4 border-2 border-blue-200">
            <div className="flex items-center gap-2 mb-2">
              <ShoppingCart className="h-5 w-5 text-blue-600" />
              <p className="text-sm text-blue-800 font-medium">Vendas</p>
            </div>
            <p className="text-3xl font-bold text-blue-900">
              {loading ? '...' : stats?.totalVendas || 0}
            </p>
            <p className="text-xs text-blue-700 mt-1">Total no mês</p>
          </div>

          {/* Faturamento */}
          <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-lg shadow-md p-4 border-2 border-green-200">
            <div className="flex items-center gap-2 mb-2">
              <DollarSign className="h-5 w-5 text-green-600" />
              <p className="text-sm text-green-800 font-medium">Faturamento</p>
            </div>
            <p className="text-2xl sm:text-3xl font-bold text-green-900">
              {loading ? '...' : `R$ ${(stats?.faturamentoMes || 0).toFixed(2)}`}
            </p>
            <p className="text-xs text-green-700 mt-1">Total em vendas</p>
          </div>

          {/* Lucro */}
          <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-lg shadow-md p-4 border-2 border-purple-200">
            <div className="flex items-center gap-2 mb-2">
              <TrendingUp className="h-5 w-5 text-purple-600" />
              <p className="text-sm text-purple-800 font-medium">Lucro</p>
            </div>
            <p className="text-2xl sm:text-3xl font-bold text-purple-900">
              {loading ? '...' : `R$ ${(stats?.lucroMes || 0).toFixed(2)}`}
            </p>
            <p className="text-xs text-purple-700 mt-1">Lucro líquido</p>
          </div>

          {/* Ticket Médio */}
          <div className="bg-gradient-to-br from-orange-50 to-orange-100 rounded-lg shadow-md p-4 border-2 border-orange-200">
            <div className="flex items-center gap-2 mb-2">
              <DollarSign className="h-5 w-5 text-orange-600" />
              <p className="text-sm text-orange-800 font-medium">Ticket Médio</p>
            </div>
            <p className="text-2xl sm:text-3xl font-bold text-orange-900">
              {loading ? '...' : `R$ ${(stats?.ticketMedio || 0).toFixed(2)}`}
            </p>
            <p className="text-xs text-orange-700 mt-1">Por venda</p>
          </div>
        </div>
      </div>

      {/* Alertas de Estoque */}
      {alertasEstoque.length > 0 && (
        <div className="mb-6">
          <h2 className="text-lg font-semibold text-gray-700 mb-4 flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-red-500" />
            ⚠️ Alertas de Estoque
          </h2>
          <div className="bg-red-50 border-2 border-red-200 rounded-lg p-4">
            <div className="space-y-2">
              {alertasEstoque.map(item => (
                <div key={item.id} className="flex items-center justify-between p-3 bg-white rounded-md border border-red-200">
                  <div className="flex items-center gap-3">
                    <AlertTriangle className="h-5 w-5 text-red-600 flex-shrink-0" />
                    <div>
                      <p className="font-medium text-gray-900">{item.nome}</p>
                      <p className="text-sm text-gray-600">
                        Estoque: {item.quantidade_total} {item.unidade}
                        {item.estoque_minimo > 0 && ` (Mínimo: ${item.estoque_minimo})`}
                      </p>
                    </div>
                  </div>
                  <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                    item.quantidade_total <= 0 
                      ? 'bg-red-100 text-red-800' 
                      : 'bg-yellow-100 text-yellow-800'
                  }`}>
                    {item.quantidade_total <= 0 ? 'SEM ESTOQUE' : 'BAIXO'}
                  </span>
                </div>
              ))}
            </div>
            <Link
              href="/estoque"
              className="mt-4 flex items-center justify-center gap-2 w-full py-2 bg-red-600 hover:bg-red-700 text-white font-medium rounded-md transition-colors"
            >
              Ver Estoque Completo
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      )}

      {/* Cards de Resumo Geral */}
      <div className="mb-6">
        <h2 className="text-lg font-semibold text-gray-700 mb-4">Resumo Geral</h2>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Receitas */}
          <Link href="/receitas" className="bg-white rounded-lg shadow-md p-4 hover:shadow-lg transition-shadow border-2 border-gray-200">
            <div className="flex items-center gap-2 mb-2">
              <Package className="h-5 w-5 text-orange-500" />
              <p className="text-sm text-gray-600 font-medium">Receitas</p>
            </div>
            <p className="text-3xl font-bold text-gray-900">
              {loading ? '...' : stats?.receitasCadastradas || 0}
            </p>
            <p className="text-xs text-gray-600 mt-1">Cadastradas</p>
          </Link>

          {/* Estoque Total */}
          <Link href="/estoque" className="bg-white rounded-lg shadow-md p-4 hover:shadow-lg transition-shadow border-2 border-gray-200">
            <div className="flex items-center gap-2 mb-2">
              <Package className="h-5 w-5 text-blue-500" />
              <p className="text-sm text-gray-600 font-medium">Itens</p>
            </div>
            <p className="text-3xl font-bold text-gray-900">
              {loading ? '...' : stats?.estoqueTotal || 0}
            </p>
            <p className="text-xs text-gray-600 mt-1">No estoque</p>
          </Link>

          {/* Estoque Baixo */}
          <Link href="/estoque" className="bg-white rounded-lg shadow-md p-4 hover:shadow-lg transition-shadow border-2 border-yellow-200">
            <div className="flex items-center gap-2 mb-2">
              <AlertTriangle className="h-5 w-5 text-yellow-500" />
              <p className="text-sm text-gray-600 font-medium">Baixo</p>
            </div>
            <p className="text-3xl font-bold text-yellow-600">
              {loading ? '...' : stats?.estoqueBaixo || 0}
            </p>
            <p className="text-xs text-gray-600 mt-1">Reabastecer</p>
          </Link>

          {/* Sem Estoque */}
          <Link href="/estoque" className="bg-white rounded-lg shadow-md p-4 hover:shadow-lg transition-shadow border-2 border-red-200">
            <div className="flex items-center gap-2 mb-2">
              <AlertTriangle className="h-5 w-5 text-red-500" />
              <p className="text-sm text-gray-600 font-medium">Sem Estoque</p>
            </div>
            <p className="text-3xl font-bold text-red-600">
              {loading ? '...' : stats?.semEstoque || 0}
            </p>
            <p className="text-xs text-gray-600 mt-1">Urgente!</p>
          </Link>
        </div>
      </div>

      {/* Ações Rápidas */}
      <div>
        <h2 className="text-lg font-semibold text-gray-700 mb-4">Ações Rápidas</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <Link
            href="/vendas"
            className="flex items-center justify-center gap-2 p-6 bg-gradient-to-br from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white font-semibold rounded-lg shadow-md hover:shadow-lg transition-all"
          >
            <ShoppingCart className="h-6 w-6" />
            Nova Venda
          </Link>

          <Link
            href="/ingredientes"
            className="flex items-center justify-center gap-2 p-6 bg-gradient-to-br from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white font-semibold rounded-lg shadow-md hover:shadow-lg transition-all"
          >
            <Package className="h-6 w-6" />
            Ingredientes
          </Link>

          <Link
            href="/receitas"
            className="flex items-center justify-center gap-2 p-6 bg-gradient-to-br from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white font-semibold rounded-lg shadow-md hover:shadow-lg transition-all"
          >
            <Package className="h-6 w-6" />
            Receitas
          </Link>

          <Link
            href="/vendas/historico"
            className="flex items-center justify-center gap-2 p-6 bg-gradient-to-br from-purple-500 to-purple-600 hover:from-purple-600 hover:to-purple-700 text-white font-semibold rounded-lg shadow-md hover:shadow-lg transition-all"
          >
            <TrendingUp className="h-6 w-6" />
            Relatórios
          </Link>
        </div>
      </div>
    </div>
  )
}
