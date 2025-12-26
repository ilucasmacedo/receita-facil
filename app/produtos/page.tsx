'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { supabase } from '@/lib/supabase'
import { useAuth } from '@/hooks/useAuth'
import { Receita } from '@/types/database'
import { 
  Package,
  Factory,
  AlertCircle,
  CheckCircle,
  Loader2,
  TrendingUp,
  RefreshCw,
  AlertTriangle,
  Plus
} from 'lucide-react'

interface ReceitaCompleta extends Receita {
  quantidade_em_estoque: number
  estoque_minimo_produtos: number
  capacidade_producao?: number
  insumos_insuficientes?: string[]
}

export default function ProdutosPage() {
  const { user, loading: authLoading } = useAuth()
  const [receitas, setReceitas] = useState<ReceitaCompleta[]>([])
  const [loading, setLoading] = useState(false)
  const [produzindo, setProduzindo] = useState<string | null>(null)
  const [quantidades, setQuantidades] = useState<Record<string, number>>({})
  const [abaAtiva, setAbaAtiva] = useState<'estoque' | 'producao'>('estoque')

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
        .eq('ativo', true)
        .order('nome', { ascending: true })

      if (error) throw error
      
      // Calcular capacidade de produção para cada receita
      const receitasComCapacidade = await Promise.all(
        (data || []).map(async (receita) => {
          const capacidade = await calcularCapacidadeProducao(receita.id)
          return {
            ...receita,
            capacidade_producao: capacidade.capacidade,
            insumos_insuficientes: capacidade.faltando
          }
        })
      )
      
      setReceitas(receitasComCapacidade)
    } catch (error: any) {
      console.error('Erro ao carregar receitas:', error)
      alert(`Erro ao carregar receitas: ${error.message}`)
    } finally {
      setLoading(false)
    }
  }

  const calcularCapacidadeProducao = async (receitaId: string) => {
    try {
      const { data: itens } = await supabase
        .from('itens_receita')
        .select(`
          quantidade_usada,
          ingredientes (nome, quantidade_total)
        `)
        .eq('receita_id', receitaId)

      if (!itens || itens.length === 0) {
        return { capacidade: 0, faltando: ['Nenhum insumo cadastrado'] }
      }

      let capacidadeMinima = Infinity
      const faltando: string[] = []

      itens.forEach((item: any) => {
        const disponivel = item.ingredientes.quantidade_total
        const necessario = item.quantidade_usada
        
        if (disponivel <= 0) {
          faltando.push(item.ingredientes.nome)
          capacidadeMinima = 0
        } else {
          const capacidade = Math.floor(disponivel / necessario)
          if (capacidade < capacidadeMinima) {
            capacidadeMinima = capacidade
          }
        }
      })

      return {
        capacidade: capacidadeMinima === Infinity ? 0 : capacidadeMinima,
        faltando: faltando.length > 0 ? faltando : undefined
      }
    } catch (error) {
      return { capacidade: 0, faltando: ['Erro ao calcular'] }
    }
  }

  const handleProducao = async (receita: ReceitaCompleta) => {
    const quantidade = quantidades[receita.id] || 1

    if (quantidade <= 0) {
      alert('Quantidade inválida')
      return
    }

    if (receita.capacidade_producao !== undefined && quantidade > receita.capacidade_producao) {
      alert(`Você só tem insumos para produzir ${receita.capacidade_producao} unidade(s)`)
      return
    }

    if (!confirm(`Registrar produção de ${quantidade} unidade(s) de "${receita.nome}"?\n\nIsso irá deduzir os insumos do estoque.`)) {
      return
    }

    setProduzindo(receita.id)
    try {
      const { data, error } = await supabase.rpc('registrar_producao', {
        receita_id_param: receita.id,
        quantidade_param: quantidade
      })

      if (error) throw error

      if (data && data.length > 0) {
        const resultado = data[0]
        
        if (resultado.sucesso) {
          alert(`✅ ${resultado.mensagem}\n\n${quantidade} unidade(s) de "${receita.nome}" adicionada(s) ao estoque de produtos prontos!`)
          setQuantidades({ ...quantidades, [receita.id]: 1 })
          await loadReceitas()
          // Mudar para aba de estoque para ver o resultado
          setAbaAtiva('estoque')
        } else {
          alert(`❌ ${resultado.mensagem}\n\n${resultado.insumo_faltante}:\nNecessário: ${resultado.quantidade_necessaria}\nDisponível: ${resultado.quantidade_disponivel}`)
        }
      }
    } catch (error: any) {
      console.error('Erro ao registrar produção:', error)
      alert(`Erro ao registrar produção: ${error.message}`)
    } finally {
      setProduzindo(null)
    }
  }

  const getStatusEstoque = (quantidade: number, minimo: number) => {
    if (quantidade <= 0) {
      return { cor: 'bg-red-100 text-red-800 border-red-300', texto: 'SEM ESTOQUE', icone: AlertTriangle }
    } else if (minimo > 0 && quantidade <= minimo) {
      return { cor: 'bg-yellow-100 text-yellow-800 border-yellow-300', texto: 'PRODUZIR', icone: AlertTriangle }
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

  // Estatísticas
  const totalProdutos = receitas.reduce((acc, p) => acc + (p.quantidade_em_estoque || 0), 0)
  const comEstoque = receitas.filter(p => (p.quantidade_em_estoque || 0) > 0).length
  const estoqueBaixo = receitas.filter(p => {
    const qtd = p.quantidade_em_estoque || 0
    const min = p.estoque_minimo_produtos || 0
    return qtd > 0 && qtd <= min && min > 0
  }).length
  const semEstoque = receitas.filter(p => (p.quantidade_em_estoque || 0) <= 0).length

  // Filtrar produtos com estoque para seção de estoque
  const produtosComEstoque = receitas.filter(p => (p.quantidade_em_estoque || 0) > 0)

  return (
    <div className="container mx-auto px-3 sm:px-4 py-6 sm:py-8 max-w-7xl">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-800 mb-2 flex items-center gap-2">
            <Package className="h-7 sm:h-8 w-7 sm:w-8 text-green-500" />
            Produtos
          </h1>
          <p className="text-gray-600">
            Estoque de produtos prontos e produção de novos lotes
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Link
            href="/receitas"
            className="flex items-center justify-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-md transition-colors"
          >
            <Plus className="h-4 w-4" />
            <span className="hidden sm:inline">Novo Modelo</span>
            <span className="sm:hidden">Novo</span>
          </Link>
          <button
            onClick={loadReceitas}
            disabled={loading}
            className="flex items-center justify-center gap-2 px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white font-medium rounded-md transition-colors disabled:opacity-50"
          >
            <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
            <span className="hidden sm:inline">Atualizar</span>
          </button>
        </div>
      </div>

      {/* Resumo */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <div className="bg-white rounded-lg shadow-md p-4">
          <div className="flex items-center gap-2 mb-2">
            <Package className="h-5 w-5 text-blue-500" />
            <p className="text-sm text-gray-600">Total de Unidades</p>
          </div>
          <p className="text-2xl font-bold text-gray-900">{totalProdutos}</p>
        </div>

        <div className="bg-white rounded-lg shadow-md p-4">
          <div className="flex items-center gap-2 mb-2">
            <TrendingUp className="h-5 w-5 text-green-500" />
            <p className="text-sm text-gray-600">Com Estoque</p>
          </div>
          <p className="text-2xl font-bold text-green-600">{comEstoque}</p>
        </div>

        <div className="bg-white rounded-lg shadow-md p-4">
          <div className="flex items-center gap-2 mb-2">
            <AlertTriangle className="h-5 w-5 text-yellow-500" />
            <p className="text-sm text-gray-600">Produzir Mais</p>
          </div>
          <p className="text-2xl font-bold text-yellow-600">{estoqueBaixo}</p>
        </div>

        <div className="bg-white rounded-lg shadow-md p-4">
          <div className="flex items-center gap-2 mb-2">
            <AlertTriangle className="h-5 w-5 text-red-500" />
            <p className="text-sm text-gray-600">Sem Estoque</p>
          </div>
          <p className="text-2xl font-bold text-red-600">{semEstoque}</p>
        </div>
      </div>

      {/* Toggle de Navegação (Chave) */}
      <div className="bg-white rounded-lg shadow-md overflow-hidden mb-6">
        <div className="p-4 sm:p-6">
          <div className="flex items-center justify-center">
            <div className="inline-flex rounded-lg border-2 border-gray-300 bg-gray-100 p-1 w-full sm:w-auto">
              <button
                onClick={() => setAbaAtiva('estoque')}
                className={`flex-1 sm:flex-initial flex items-center justify-center gap-2 px-4 sm:px-6 py-3 rounded-md text-sm sm:text-base font-semibold transition-all duration-200 ${
                  abaAtiva === 'estoque'
                    ? 'bg-green-600 text-white shadow-lg transform scale-105'
                    : 'text-gray-700 hover:text-gray-900'
                }`}
              >
                <Package className="h-5 w-5" />
                <span>Estoque Prontos</span>
                <span className={`ml-1 px-2 py-0.5 rounded-full text-xs font-bold ${
                  abaAtiva === 'estoque' 
                    ? 'bg-white text-green-600' 
                    : 'bg-gray-300 text-gray-700'
                }`}>
                  {produtosComEstoque.length}
                </span>
              </button>
              
              <button
                onClick={() => setAbaAtiva('producao')}
                className={`flex-1 sm:flex-initial flex items-center justify-center gap-2 px-4 sm:px-6 py-3 rounded-md text-sm sm:text-base font-semibold transition-all duration-200 ${
                  abaAtiva === 'producao'
                    ? 'bg-purple-600 text-white shadow-lg transform scale-105'
                    : 'text-gray-700 hover:text-gray-900'
                }`}
              >
                <Factory className="h-5 w-5" />
                <span>Produzir</span>
                <span className={`ml-1 px-2 py-0.5 rounded-full text-xs font-bold ${
                  abaAtiva === 'producao' 
                    ? 'bg-white text-purple-600' 
                    : 'bg-gray-300 text-gray-700'
                }`}>
                  {receitas.length}
                </span>
              </button>
            </div>
          </div>
          
          {/* Indicador Visual */}
          <div className="mt-3 text-center">
            <p className="text-sm text-gray-600">
              {abaAtiva === 'estoque' ? (
                <span className="flex items-center justify-center gap-1">
                  <CheckCircle className="h-4 w-4 text-green-600" />
                  Visualizando produtos prontos para venda
                </span>
              ) : (
                <span className="flex items-center justify-center gap-1">
                  <Factory className="h-4 w-4 text-purple-600" />
                  Transforme insumos em produtos prontos
                </span>
              )}
            </p>
          </div>
        </div>
      </div>

      {/* Conteúdo */}
      <div className="bg-white rounded-lg shadow-md overflow-hidden">

        {/* Conteúdo */}
        <div className="p-4 sm:p-6">
          {loading ? (
            <div className="p-8 text-center">
              <Loader2 className="h-6 w-6 animate-spin text-green-500 mx-auto" />
              <p className="mt-2 text-gray-600">Carregando...</p>
            </div>
          ) : (
            <>
              {/* Seção 1: Estoque de Produtos Prontos */}
              {abaAtiva === 'estoque' && (
                <div className="animate-fadeIn">
                  <div className="mb-4">
                    <h2 className="text-lg sm:text-xl font-semibold text-gray-700 flex items-center gap-2">
                      <Package className="h-5 w-5 text-green-500" />
                      Estoque de Produtos Prontos
                    </h2>
                    <p className="text-sm text-gray-600 mt-1">
                      Produtos que você já fabricou e estão prontos para vender
                    </p>
                  </div>

                  {produtosComEstoque.length === 0 ? (
                    <div className="p-8 text-center text-gray-500 bg-gray-50 rounded-lg">
                      <Package className="h-16 w-16 mx-auto mb-4 text-gray-300" />
                      <p className="mb-2">Nenhum produto em estoque</p>
                      <p className="text-sm mb-4">Clique no botão "Produzir" acima para fabricar produtos</p>
                      <button
                        onClick={() => setAbaAtiva('producao')}
                        className="inline-flex items-center gap-2 px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white font-medium rounded-md transition-colors"
                      >
                        <Factory className="h-4 w-4" />
                        Ir para Produção
                      </button>
                    </div>
                  ) : (
                    <div className="divide-y divide-gray-200">
                      {produtosComEstoque.map((produto) => {
                        const status = getStatusEstoque(
                          produto.quantidade_em_estoque || 0,
                          produto.estoque_minimo_produtos || 0
                        )
                        const StatusIcon = status.icone
                        const valorEstoque = (produto.quantidade_em_estoque || 0) * (produto.preco_venda || 0)

                        return (
                          <div key={produto.id} className="p-4 hover:bg-gray-50 transition-colors">
                            <div className="flex flex-col sm:flex-row gap-4">
                              {produto.foto_url && (
                                <img
                                  src={produto.foto_url}
                                  alt={produto.nome}
                                  className="w-full sm:w-24 h-24 object-cover rounded-md"
                                  onError={(e) => { e.currentTarget.style.display = 'none' }}
                                />
                              )}

                              <div className="flex-1">
                                <div className="flex items-start gap-3 mb-3">
                                  <div className="flex-1">
                                    <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-1">
                                      {produto.nome}
                                    </h3>
                                    <div className={`inline-flex items-center gap-1 px-2 py-1 rounded-md text-xs font-medium border-2 ${status.cor}`}>
                                      <StatusIcon className="h-3 w-3" />
                                      {status.texto}
                                    </div>
                                  </div>
                                </div>

                                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-sm">
                                  <div>
                                    <p className="text-gray-600">Em Estoque</p>
                                    <p className="text-lg font-bold text-gray-900">
                                      {produto.quantidade_em_estoque || 0} un
                                    </p>
                                  </div>
                                  <div>
                                    <p className="text-gray-600">Estoque Mínimo</p>
                                    <p className="text-lg font-semibold text-gray-600">
                                      {produto.estoque_minimo_produtos || 0} un
                                    </p>
                                  </div>
                                  <div>
                                    <p className="text-gray-600">Preço Unitário</p>
                                    <p className="text-lg font-semibold text-green-600">
                                      R$ {(produto.preco_venda || 0).toFixed(2)}
                                    </p>
                                  </div>
                                  <div>
                                    <p className="text-gray-600">Valor em Estoque</p>
                                    <p className="text-lg font-bold text-blue-600">
                                      R$ {valorEstoque.toFixed(2)}
                                    </p>
                                  </div>
                                </div>
                              </div>
                            </div>
                          </div>
                        )
                      })}
                    </div>
                  )}
                </div>
              )}

              {/* Seção 2: Produção */}
              {abaAtiva === 'producao' && (
                <div className="animate-fadeIn">
                <div className="mb-4">
                  <h2 className="text-lg sm:text-xl font-semibold text-gray-700 flex items-center gap-2">
                    <Factory className="h-5 w-5 text-purple-500" />
                    Registrar Produção
                  </h2>
                  <p className="text-sm text-gray-600 mt-1">
                    Transforme insumos em produtos prontos para venda
                  </p>
                </div>

                {/* Info Box */}
                <div className="bg-blue-50 border-2 border-blue-200 rounded-lg p-4 mb-6">
                  <div className="flex items-start gap-3">
                    <AlertCircle className="h-5 w-5 text-blue-600 flex-shrink-0 mt-0.5" />
                    <div className="flex-1">
                      <p className="font-medium text-blue-900 mb-1">Como funciona:</p>
                      <ul className="text-sm text-blue-800 space-y-1">
                        <li>✅ <strong>Capacidade:</strong> Quantas unidades você pode produzir com os insumos disponíveis</li>
                        <li>✅ <strong>Produtos Prontos:</strong> Quantos já estão no estoque aguardando venda</li>
                        <li>✅ Ao registrar produção, os insumos são deduzidos e os produtos prontos aumentam</li>
                      </ul>
                    </div>
                  </div>
                </div>

                  {receitas.length === 0 ? (
                    <div className="p-8 text-center text-gray-500 bg-gray-50 rounded-lg">
                      <Factory className="h-16 w-16 mx-auto mb-4 text-gray-300" />
                      <p className="mb-2">Nenhum modelo cadastrado</p>
                      <p className="text-sm mb-4">Crie modelos em "Modelos" primeiro</p>
                      <Link
                        href="/receitas"
                        className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-md transition-colors"
                      >
                        <Plus className="h-4 w-4" />
                        Criar Modelo
                      </Link>
                    </div>
                  ) : (
                    <div className="divide-y divide-gray-200">
                      {receitas.map((receita) => {
                        const estoqueBaixo = receita.quantidade_em_estoque <= (receita.estoque_minimo_produtos || 0)
                        const semCapacidade = (receita.capacidade_producao || 0) === 0
                        const quantidade = quantidades[receita.id] || 1

                        return (
                          <div key={receita.id} className="p-4 sm:p-6 hover:bg-gray-50 transition-colors">
                            <div className="flex flex-col lg:flex-row lg:items-center gap-4">
                              {receita.foto_url && (
                                <img
                                  src={receita.foto_url}
                                  alt={receita.nome}
                                  className="w-full lg:w-24 h-24 object-cover rounded-md"
                                  onError={(e) => { e.currentTarget.style.display = 'none' }}
                                />
                              )}

                              <div className="flex-1">
                                <h3 className="text-lg font-semibold text-gray-900 mb-2">{receita.nome}</h3>
                                
                                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-sm mb-3">
                                  <div>
                                    <p className="text-gray-600">Produtos Prontos</p>
                                    <p className={`text-lg font-bold ${estoqueBaixo ? 'text-red-600' : 'text-green-600'}`}>
                                      {receita.quantidade_em_estoque || 0} un
                                    </p>
                                  </div>
                                  <div>
                                    <p className="text-gray-600">Capacidade</p>
                                    <p className={`text-lg font-bold ${semCapacidade ? 'text-red-600' : 'text-blue-600'}`}>
                                      {receita.capacidade_producao || 0} un
                                    </p>
                                  </div>
                                  <div>
                                    <p className="text-gray-600">Custo Unitário</p>
                                    <p className="text-lg font-bold text-gray-900">
                                      R$ {(receita.custo_total || 0).toFixed(2)}
                                    </p>
                                  </div>
                                </div>

                                {receita.insumos_insuficientes && receita.insumos_insuficientes.length > 0 && (
                                  <div className="flex items-center gap-2 text-sm text-red-600 bg-red-50 px-3 py-2 rounded-md">
                                    <AlertCircle className="h-4 w-4 flex-shrink-0" />
                                    <span>Insumos insuficientes: {receita.insumos_insuficientes.join(', ')}</span>
                                  </div>
                                )}
                              </div>

                              <div className="flex flex-col gap-3 lg:w-64">
                                <div>
                                  <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Quantidade a Produzir
                                  </label>
                                  <input
                                    type="number"
                                    min="1"
                                    max={receita.capacidade_producao || 0}
                                    value={quantidade}
                                    onChange={(e) => setQuantidades({
                                      ...quantidades,
                                      [receita.id]: parseInt(e.target.value) || 1
                                    })}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
                                    disabled={semCapacidade}
                                  />
                                </div>
                                
                                <button
                                  onClick={() => handleProducao(receita)}
                                  disabled={produzindo === receita.id || semCapacidade}
                                  className="flex items-center justify-center gap-2 px-4 py-3 bg-purple-600 hover:bg-purple-700 text-white font-medium rounded-md transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                  {produzindo === receita.id ? (
                                    <>
                                      <Loader2 className="h-5 w-5 animate-spin" />
                                      Produzindo...
                                    </>
                                  ) : (
                                    <>
                                      <Factory className="h-5 w-5" />
                                      Registrar Produção
                                    </>
                                  )}
                                </button>
                                
                                {semCapacidade && (
                                  <p className="text-xs text-center text-red-600">
                                    Sem insumos suficientes
                                  </p>
                                )}
                              </div>
                            </div>
                          </div>
                        )
                      })}
                    </div>
                  )}
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  )
}
