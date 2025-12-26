'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { supabase } from '@/lib/supabase'
import { useAuth } from '@/hooks/useAuth'
import { Receita } from '@/types/database'
import { ItemCarrinho } from '@/types/vendas'
import { 
  ShoppingCart, 
  Plus, 
  Minus, 
  Trash2, 
  DollarSign,
  User,
  FileText,
  CheckCircle,
  AlertCircle,
  Loader2,
  TrendingUp,
  Package,
  History
} from 'lucide-react'

export default function VendasPage() {
  const { user, loading: authLoading } = useAuth()
  const [receitas, setReceitas] = useState<Receita[]>([])
  const [carrinho, setCarrinho] = useState<ItemCarrinho[]>([])
  const [loading, setLoading] = useState(false)
  const [salvando, setSalvando] = useState(false)
  
  // Dados da venda
  const [clienteNome, setClienteNome] = useState('')
  const [observacoes, setObservacoes] = useState('')

  // Modal de seleção de produto
  const [modalAberto, setModalAberto] = useState(false)

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
        .order('nome', { ascending: true })

      if (error) throw error
      setReceitas(data || [])
    } catch (error: any) {
      console.error('Erro ao carregar receitas:', error)
      alert(`Erro ao carregar receitas: ${error.message}`)
    } finally {
      setLoading(false)
    }
  }

  const adicionarAoCarrinho = (receita: Receita) => {
    const jaExiste = carrinho.find(item => item.receita_id === receita.id)
    
    if (jaExiste) {
      setCarrinho(carrinho.map(item => 
        item.receita_id === receita.id 
          ? { ...item, quantidade: item.quantidade + 1 }
          : item
      ))
    } else {
      setCarrinho([...carrinho, {
        receita_id: receita.id,
        receita_nome: receita.nome,
        receita_foto: receita.foto_url,
        quantidade: 1,
        preco_unitario: receita.preco_venda || 0,
        custo_unitario: receita.custo_total || 0,
      }])
    }
    setModalAberto(false)
  }

  const alterarQuantidade = (receita_id: string, delta: number) => {
    setCarrinho(carrinho.map(item => {
      if (item.receita_id === receita_id) {
        const novaQuantidade = Math.max(1, item.quantidade + delta)
        return { ...item, quantidade: novaQuantidade }
      }
      return item
    }).filter(item => item.quantidade > 0))
  }

  const alterarPreco = (receita_id: string, novoPreco: number) => {
    setCarrinho(carrinho.map(item => 
      item.receita_id === receita_id 
        ? { ...item, preco_unitario: Math.max(0, novoPreco) }
        : item
    ))
  }

  const removerDoCarrinho = (receita_id: string) => {
    setCarrinho(carrinho.filter(item => item.receita_id !== receita_id))
  }

  const calcularTotais = () => {
    const valorTotal = carrinho.reduce((acc, item) => 
      acc + (item.preco_unitario * item.quantidade), 0
    )
    const custoTotal = carrinho.reduce((acc, item) => 
      acc + (item.custo_unitario * item.quantidade), 0
    )
    const lucroTotal = valorTotal - custoTotal
    const margemLucro = custoTotal > 0 ? ((lucroTotal / custoTotal) * 100) : 0

    return { valorTotal, custoTotal, lucroTotal, margemLucro }
  }

  const finalizarVenda = async () => {
    if (carrinho.length === 0) {
      alert('Adicione pelo menos um item ao carrinho!')
      return
    }

    if (!confirm('Confirma a finalização desta venda?\n\nIsso irá deduzir os ingredientes do estoque automaticamente.')) {
      return
    }

    setSalvando(true)
    try {
      const totais = calcularTotais()

      // 1. Criar a venda
      const { data: vendaData, error: vendaError } = await supabase
        .from('vendas')
        .insert({
          user_id: user!.id,
          valor_total: totais.valorTotal,
          custo_total: totais.custoTotal,
          lucro_total: totais.lucroTotal,
          cliente_nome: clienteNome || null,
          observacoes: observacoes || null,
          status: 'concluida',
        })
        .select()
        .single()

      if (vendaError) throw vendaError

      // 2. Criar os itens da venda
      const itensVenda = carrinho.map(item => ({
        venda_id: vendaData.id,
        receita_id: item.receita_id,
        quantidade: item.quantidade,
        preco_unitario: item.preco_unitario,
        custo_unitario: item.custo_unitario,
        subtotal: item.preco_unitario * item.quantidade,
        lucro: (item.preco_unitario - item.custo_unitario) * item.quantidade,
      }))

      const { error: itensError } = await supabase
        .from('itens_venda')
        .insert(itensVenda)

      if (itensError) throw itensError

      alert(`✅ Venda finalizada com sucesso!\n\n💰 Valor Total: R$ ${totais.valorTotal.toFixed(2)}\n📊 Lucro: R$ ${totais.lucroTotal.toFixed(2)}\n\n🎯 Os ingredientes foram deduzidos do estoque automaticamente.`)

      // Limpar formulário
      setCarrinho([])
      setClienteNome('')
      setObservacoes('')
    } catch (error: any) {
      console.error('Erro ao finalizar venda:', error)
      alert(`Erro ao finalizar venda: ${error.message}`)
    } finally {
      setSalvando(false)
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

  const totais = calcularTotais()

  return (
    <div className="container mx-auto px-3 sm:px-4 py-6 sm:py-8 max-w-7xl">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-4 sm:mb-8">
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-800 flex items-center gap-2">
          <ShoppingCart className="h-7 sm:h-8 w-7 sm:w-8 text-green-500" />
          Nova Venda
        </h1>
        <Link
          href="/vendas/historico"
          className="flex items-center justify-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-md transition-colors"
        >
          <History className="h-4 w-4" />
          Ver Histórico
        </Link>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6">
        {/* Coluna Esquerda: Seleção de Produtos */}
        <div className="lg:col-span-2 space-y-4 sm:space-y-6">
          {/* Botão Adicionar Produto */}
          <div className="bg-white rounded-lg shadow-md p-4 sm:p-6">
            <button
              onClick={() => setModalAberto(true)}
              className="w-full flex items-center justify-center gap-2 bg-green-600 hover:bg-green-700 text-white font-medium py-3 px-6 rounded-md transition-colors"
            >
              <Plus className="h-5 w-5" />
              Adicionar Produto à Venda
            </button>
          </div>

          {/* Carrinho */}
          <div className="bg-white rounded-lg shadow-md overflow-hidden">
            <div className="px-4 sm:px-6 py-4 border-b border-gray-200 bg-gray-50">
              <h2 className="text-lg sm:text-xl font-semibold text-gray-700 flex items-center gap-2">
                <Package className="h-5 w-5" />
                Itens da Venda ({carrinho.length})
              </h2>
            </div>

            {carrinho.length === 0 ? (
              <div className="p-8 text-center text-gray-500">
                <ShoppingCart className="h-16 w-16 mx-auto mb-4 text-gray-300" />
                <p className="mb-2">Nenhum item adicionado</p>
                <p className="text-sm">Clique em &quot;Adicionar Produto&quot; para começar</p>
              </div>
            ) : (
              <div className="divide-y divide-gray-200">
                {carrinho.map((item) => (
                  <div key={item.receita_id} className="p-4 sm:p-6 hover:bg-gray-50 transition-colors">
                    <div className="flex items-start gap-4">
                      {/* Foto */}
                      {item.receita_foto && (
                        <img
                          src={item.receita_foto}
                          alt={item.receita_nome}
                          className="w-16 h-16 sm:w-20 sm:h-20 object-cover rounded-md flex-shrink-0"
                          onError={(e) => { e.currentTarget.style.display = 'none' }}
                        />
                      )}

                      {/* Informações */}
                      <div className="flex-1 min-w-0">
                        <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-2">
                          {item.receita_nome}
                        </h3>

                        {/* Controles de Quantidade */}
                        <div className="flex items-center gap-3 mb-3">
                          <span className="text-sm text-gray-600">Quantidade:</span>
                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => alterarQuantidade(item.receita_id, -1)}
                              className="p-1.5 bg-gray-200 hover:bg-gray-300 rounded-md transition-colors"
                            >
                              <Minus className="h-4 w-4" />
                            </button>
                            <span className="text-lg font-semibold w-8 text-center">
                              {item.quantidade}
                            </span>
                            <button
                              onClick={() => alterarQuantidade(item.receita_id, 1)}
                              className="p-1.5 bg-gray-200 hover:bg-gray-300 rounded-md transition-colors"
                            >
                              <Plus className="h-4 w-4" />
                            </button>
                          </div>
                        </div>

                        {/* Preço Unitário */}
                        <div className="flex flex-col sm:flex-row sm:items-center gap-2 mb-2">
                          <span className="text-sm text-gray-600">Preço Unitário:</span>
                          <div className="flex items-center gap-2">
                            <span className="text-sm text-gray-600">R$</span>
                            <input
                              type="number"
                              step="0.01"
                              min="0"
                              value={item.preco_unitario}
                              onChange={(e) => alterarPreco(item.receita_id, parseFloat(e.target.value) || 0)}
                              className="w-24 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                            />
                          </div>
                        </div>

                        {/* Subtotal */}
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-gray-600">Subtotal:</span>
                          <span className="text-lg font-bold text-green-600">
                            R$ {(item.preco_unitario * item.quantidade).toFixed(2)}
                          </span>
                        </div>

                        {/* Lucro por item */}
                        <div className="flex items-center justify-between text-sm mt-1">
                          <span className="text-gray-600">Lucro:</span>
                          <span className={`font-semibold ${
                            (item.preco_unitario - item.custo_unitario) * item.quantidade >= 0 
                              ? 'text-blue-600' 
                              : 'text-red-600'
                          }`}>
                            R$ {((item.preco_unitario - item.custo_unitario) * item.quantidade).toFixed(2)}
                          </span>
                        </div>
                      </div>

                      {/* Botão Remover */}
                      <button
                        onClick={() => removerDoCarrinho(item.receita_id)}
                        className="p-2 text-red-600 hover:bg-red-50 rounded-md transition-colors flex-shrink-0"
                        title="Remover item"
                      >
                        <Trash2 className="h-5 w-5" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Coluna Direita: Resumo e Finalização */}
        <div className="space-y-4 sm:space-y-6">
          {/* Informações do Cliente */}
          <div className="bg-white rounded-lg shadow-md p-4 sm:p-6">
            <h2 className="text-lg font-semibold text-gray-700 mb-4 flex items-center gap-2">
              <User className="h-5 w-5" />
              Cliente (Opcional)
            </h2>
            <input
              type="text"
              value={clienteNome}
              onChange={(e) => setClienteNome(e.target.value)}
              placeholder="Nome do cliente"
              className="w-full px-4 py-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 mb-3"
            />
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Observações
              </label>
              <textarea
                value={observacoes}
                onChange={(e) => setObservacoes(e.target.value)}
                placeholder="Ex: Retirada às 15h, embalagem especial..."
                className="w-full px-4 py-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 resize-none"
                rows={3}
              />
            </div>
          </div>

          {/* Resumo Financeiro */}
          <div className="bg-gradient-to-br from-green-50 to-blue-50 rounded-lg shadow-md p-4 sm:p-6 border-2 border-green-200">
            <h2 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
              <DollarSign className="h-5 w-5" />
              Resumo da Venda
            </h2>
            
            <div className="space-y-3">
              <div className="flex items-center justify-between py-2 border-b border-gray-300">
                <span className="text-gray-700">Custo Total:</span>
                <span className="text-lg font-semibold text-red-600">
                  R$ {totais.custoTotal.toFixed(2)}
                </span>
              </div>
              
              <div className="flex items-center justify-between py-2 border-b border-gray-300">
                <span className="text-gray-700">Valor Total:</span>
                <span className="text-lg font-semibold text-green-600">
                  R$ {totais.valorTotal.toFixed(2)}
                </span>
              </div>
              
              <div className="flex items-center justify-between py-2 border-b border-gray-300">
                <span className="text-gray-700 flex items-center gap-1">
                  <TrendingUp className="h-4 w-4" />
                  Lucro:
                </span>
                <span className={`text-xl font-bold ${
                  totais.lucroTotal >= 0 ? 'text-blue-600' : 'text-red-600'
                }`}>
                  R$ {totais.lucroTotal.toFixed(2)}
                </span>
              </div>

              <div className="flex items-center justify-between py-2">
                <span className="text-sm text-gray-600">Margem de Lucro:</span>
                <span className={`text-base font-semibold ${
                  totais.margemLucro >= 0 ? 'text-blue-600' : 'text-red-600'
                }`}>
                  {totais.margemLucro.toFixed(1)}%
                </span>
              </div>
            </div>
          </div>

          {/* Botão Finalizar */}
          <button
            onClick={finalizarVenda}
            disabled={salvando || carrinho.length === 0}
            className="w-full flex items-center justify-center gap-2 bg-green-600 hover:bg-green-700 text-white font-bold py-4 px-6 rounded-md transition-colors disabled:opacity-50 disabled:cursor-not-allowed text-lg"
          >
            {salvando ? (
              <>
                <Loader2 className="h-5 w-5 animate-spin" />
                Finalizando...
              </>
            ) : (
              <>
                <CheckCircle className="h-5 w-5" />
                Finalizar Venda
              </>
            )}
          </button>

          {carrinho.length === 0 && (
            <div className="bg-yellow-50 border-2 border-yellow-200 rounded-lg p-4 flex items-start gap-3">
              <AlertCircle className="h-5 w-5 text-yellow-600 flex-shrink-0 mt-0.5" />
              <p className="text-sm text-yellow-800">
                Adicione pelo menos um produto para finalizar a venda
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Modal de Seleção de Produto */}
      {modalAberto && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-hidden flex flex-col">
            <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
              <h3 className="text-xl font-bold text-gray-800">Selecionar Produto</h3>
              <button
                onClick={() => setModalAberto(false)}
                className="p-2 hover:bg-gray-100 rounded-md transition-colors"
              >
                <Trash2 className="h-5 w-5" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-6">
              {loading ? (
                <div className="flex items-center justify-center py-12">
                  <Loader2 className="h-8 w-8 animate-spin text-green-500" />
                </div>
              ) : receitas.length === 0 ? (
                <div className="text-center py-12 text-gray-500">
                  <Package className="h-16 w-16 mx-auto mb-4 text-gray-300" />
                  <p className="mb-2">Nenhuma receita cadastrada</p>
                  <p className="text-sm">Cadastre receitas primeiro para poder vender</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {receitas.map((receita) => (
                    <button
                      key={receita.id}
                      onClick={() => adicionarAoCarrinho(receita)}
                      className="bg-white border-2 border-gray-200 hover:border-green-400 rounded-lg overflow-hidden transition-all hover:shadow-lg text-left"
                    >
                      {receita.foto_url && (
                        <img
                          src={receita.foto_url}
                          alt={receita.nome}
                          className="w-full h-32 object-cover"
                          onError={(e) => { e.currentTarget.style.display = 'none' }}
                        />
                      )}
                      <div className="p-4">
                        <h4 className="font-semibold text-gray-900 mb-2">{receita.nome}</h4>
                        <div className="text-sm text-gray-600 space-y-1">
                          <div className="flex justify-between">
                            <span>Preço Sugerido:</span>
                            <span className="font-semibold text-green-600">
                              R$ {(receita.preco_venda || 0).toFixed(2)}
                            </span>
                          </div>
                          <div className="flex justify-between">
                            <span>Custo:</span>
                            <span className="font-semibold text-red-600">
                              R$ {(receita.custo_total || 0).toFixed(2)}
                            </span>
                          </div>
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

