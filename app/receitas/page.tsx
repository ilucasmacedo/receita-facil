'use client'

import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import { useAuth } from '@/hooks/useAuth'
import { Receita, Ingrediente, ItemReceitaComIngrediente } from '@/types/database'
import { 
  Trash2, 
  Plus, 
  Loader2, 
  Edit2, 
  X, 
  Upload, 
  ImageIcon,
  ChefHat,
  Clock,
  DollarSign,
  TrendingUp,
  Save,
  AlertCircle,
  Archive,
  Search
} from 'lucide-react'
import Link from 'next/link'
import { FiltroGenerico, InputFiltro, SelectFiltro } from '@/components/FiltroGenerico'
import UploadFoto from '@/components/UploadFoto'

interface FormData {
  nome: string
  tipo: string
  descricao: string
  foto_url: string
  rendimento_porcoes: string
  tempo_preparo_minutos: string
  margem_lucro_desejada: string
  quantidade_em_estoque: string
  estoque_minimo_produtos: string
}

interface IngredienteReceita {
  ingrediente_id: string
  quantidade_usada: number
  unidade: string
}

export default function ReceitasPage() {
  const { user, loading: authLoading } = useAuth()
  const [receitas, setReceitas] = useState<Receita[]>([])
  const [ingredientesDisponiveis, setIngredientesDisponiveis] = useState<Ingrediente[]>([])
  const [loading, setLoading] = useState(false)
  const [saving, setSaving] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  
  const [formData, setFormData] = useState<FormData>({
    nome: '',
    tipo: '',
    descricao: '',
    foto_url: '',
    rendimento_porcoes: '1',
    tempo_preparo_minutos: '30',
    margem_lucro_desejada: '100',
    quantidade_em_estoque: '0',
    estoque_minimo_produtos: '5',
  })

  // Estados de filtro
  const [filtroTipo, setFiltroTipo] = useState('')
  const [filtroNome, setFiltroNome] = useState('')
  const [tiposDisponiveis, setTiposDisponiveis] = useState<string[]>([])

  const [ingredientesSelecionados, setIngredientesSelecionados] = useState<IngredienteReceita[]>([])
  const [ingredienteAtual, setIngredienteAtual] = useState({
    ingrediente_id: '',
    quantidade_usada: '',
  })

  // Preview da foto
  const [previewFoto, setPreviewFoto] = useState<string>('')

  // Modal de Produção Própria
  const [modalProducaoPropria, setModalProducaoPropria] = useState<{
    show: boolean
    receita: Receita | null
  }>({
    show: false,
    receita: null,
  })
  const [producaoPropriaData, setProducaoPropriaData] = useState({
    quantidade: '',
    unidadeProducao: '',
  })

  // Carregar receitas e ingredientes
  useEffect(() => {
    if (user) {
      loadReceitas()
      loadIngredientes()
      loadTiposDisponiveis()
    }
  }, [user])

  // Recarregar quando filtros mudarem
  useEffect(() => {
    if (user) {
      loadReceitas()
    }
  }, [filtroTipo, filtroNome])

  const loadReceitas = async () => {
    if (!user) return
    setLoading(true)
    try {
      let query = supabase
        .from('receitas')
        .select('*')
        .eq('user_id', user.id)
        .eq('ativo', true) // Apenas receitas ativas
      
      // Aplicar filtros
      if (filtroTipo) {
        query = query.eq('tipo', filtroTipo)
      }
      
      if (filtroNome) {
        query = query.ilike('nome', `%${filtroNome}%`)
      }
      
      query = query.order('created_at', { ascending: false })

      const { data, error } = await query

      if (error) throw error
      setReceitas(data || [])
    } catch (error: any) {
      console.error('Erro ao carregar receitas:', error)
      alert(`Erro ao carregar receitas: ${error.message}`)
    } finally {
      setLoading(false)
    }
  }

  const loadTiposDisponiveis = async () => {
    if (!user) return
    try {
      const { data, error } = await supabase
        .from('receitas')
        .select('tipo')
        .eq('user_id', user.id)
        .not('tipo', 'is', null)
      
      if (error) throw error
      
      // Extrair tipos únicos
      const tiposUnicos = [...new Set(data.map(r => r.tipo).filter(Boolean))] as string[]
      setTiposDisponiveis(tiposUnicos.sort())
    } catch (error: any) {
      console.error('Erro ao carregar tipos:', error)
    }
  }

  const loadIngredientes = async () => {
    if (!user) return
    try {
      const { data, error } = await supabase
        .from('ingredientes')
        .select('*')
        .eq('user_id', user.id)
        .order('nome')

      if (error) throw error
      setIngredientesDisponiveis(data || [])
    } catch (error: any) {
      console.error('Erro ao carregar ingredientes:', error)
    }
  }

  // Adicionar ingrediente à receita
  const handleAdicionarIngrediente = () => {
    if (!ingredienteAtual.ingrediente_id || !ingredienteAtual.quantidade_usada) {
      alert('Selecione um ingrediente e informe a quantidade')
      return
    }

    const ingrediente = ingredientesDisponiveis.find(
      (ing) => ing.id === ingredienteAtual.ingrediente_id
    )

    if (!ingrediente) return

    // Verificar se já foi adicionado
    const jaAdicionado = ingredientesSelecionados.find(
      (item) => item.ingrediente_id === ingredienteAtual.ingrediente_id
    )

    if (jaAdicionado) {
      alert('Este ingrediente já foi adicionado')
      return
    }

    setIngredientesSelecionados([
      ...ingredientesSelecionados,
      {
        ingrediente_id: ingredienteAtual.ingrediente_id,
        quantidade_usada: parseFloat(ingredienteAtual.quantidade_usada),
        unidade: ingrediente.unidade,
      },
    ])

    setIngredienteAtual({ ingrediente_id: '', quantidade_usada: '' })
  }

  // Remover ingrediente da receita
  const handleRemoverIngrediente = (ingrediente_id: string) => {
    setIngredientesSelecionados(
      ingredientesSelecionados.filter((item) => item.ingrediente_id !== ingrediente_id)
    )
  }

  // Calcular custo total da receita
  const calcularCustoTotal = (): number => {
    let custoTotal = 0

    ingredientesSelecionados.forEach((item) => {
      const ingrediente = ingredientesDisponiveis.find((ing) => ing.id === item.ingrediente_id)
      if (ingrediente) {
        // Custo por unidade * quantidade usada
        const custoUnitario = ingrediente.preco_compra / ingrediente.quantidade_total
        custoTotal += custoUnitario * item.quantidade_usada
      }
    })

    return custoTotal
  }

  // Calcular preço de venda
  const calcularPrecoVenda = (): number => {
    const custoTotal = calcularCustoTotal()
    const margem = parseFloat(formData.margem_lucro_desejada) || 0
    return custoTotal * (1 + margem / 100)
  }

  // Calcular preço por porção
  const calcularPrecoPorPorcao = (): number => {
    const precoVenda = calcularPrecoVenda()
    const porcoes = parseFloat(formData.rendimento_porcoes) || 1
    return precoVenda / porcoes
  }

  // Upload de foto (simples com URL)
  const handleFotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const url = e.target.value
    setFormData({ ...formData, foto_url: url })
    setPreviewFoto(url)
  }

  // Salvar receita
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!user) {
      alert('Você precisa estar logado')
      return
    }

    if (!formData.nome.trim()) {
      alert('Informe o nome da receita')
      return
    }

    if (ingredientesSelecionados.length === 0) {
      alert('Adicione pelo menos um ingrediente')
      return
    }

    setSaving(true)

    try {
      const custoTotal = calcularCustoTotal()
      const precoVenda = calcularPrecoVenda()

      const receitaData = {
        user_id: user.id,
        nome: formData.nome.trim(),
        descricao: formData.descricao.trim() || null,
        foto_url: formData.foto_url.trim() || null,
        rendimento_porcoes: parseInt(formData.rendimento_porcoes) || 1,
        tempo_preparo_minutos: parseInt(formData.tempo_preparo_minutos) || 0,
        margem_lucro_desejada: parseFloat(formData.margem_lucro_desejada) || 0,
        custo_total: custoTotal,
        preco_venda: precoVenda,
      }

      if (editingId) {
        // Atualizar receita
        const { error } = await supabase
          .from('receitas')
          .update(receitaData)
          .eq('id', editingId)

        if (error) throw error

        // Deletar itens antigos
        await supabase.from('itens_receita').delete().eq('receita_id', editingId)

        // Inserir novos itens
        const itens = ingredientesSelecionados.map((item) => ({
          receita_id: editingId,
          ingrediente_id: item.ingrediente_id,
          quantidade_usada: item.quantidade_usada,
        }))

        const { error: itensError } = await supabase.from('itens_receita').insert(itens)
        if (itensError) throw itensError

        setEditingId(null)
      } else {
        // Criar nova receita
        const { data: novaReceita, error } = await supabase
          .from('receitas')
          .insert(receitaData)
          .select()
          .single()

        if (error) throw error

        // Inserir ingredientes
        const itens = ingredientesSelecionados.map((item) => ({
          receita_id: novaReceita.id,
          ingrediente_id: item.ingrediente_id,
          quantidade_usada: item.quantidade_usada,
        }))

        const { error: itensError } = await supabase.from('itens_receita').insert(itens)
        if (itensError) throw itensError
      }

      // Limpar formulário
      setFormData({
        nome: '',
        tipo: '',
        descricao: '',
        foto_url: '',
        rendimento_porcoes: '1',
        tempo_preparo_minutos: '30',
        margem_lucro_desejada: '100',
        quantidade_em_estoque: '0',
        estoque_minimo_produtos: '5',
      })
      setIngredientesSelecionados([])
      setPreviewFoto('')
      await loadTiposDisponiveis() // Recarregar tipos após adicionar novo

      await loadReceitas()
    } catch (error: any) {
      console.error('Erro ao salvar receita:', error)
      alert(`Erro ao salvar: ${error.message}`)
    } finally {
      setSaving(false)
    }
  }

  // Editar receita
  const handleEdit = async (receita: Receita) => {
    setEditingId(receita.id)
    setFormData({
      nome: receita.nome,
      tipo: receita.tipo || '',
      descricao: receita.descricao || '',
      foto_url: receita.foto_url || '',
      rendimento_porcoes: receita.rendimento_porcoes.toString(),
      tempo_preparo_minutos: (receita.tempo_preparo_minutos || 0).toString(),
      margem_lucro_desejada: receita.margem_lucro_desejada.toString(),
      quantidade_em_estoque: (receita.quantidade_em_estoque || 0).toString(),
      estoque_minimo_produtos: (receita.estoque_minimo_produtos || 5).toString(),
    })
    setPreviewFoto(receita.foto_url || '')

    // Carregar ingredientes da receita
    try {
      const { data, error } = await supabase
        .from('itens_receita')
        .select('*, ingredientes(*)')
        .eq('receita_id', receita.id)

      if (error) throw error

      const itens = data.map((item: any) => ({
        ingrediente_id: item.ingrediente_id,
        quantidade_usada: item.quantidade_usada,
        unidade: item.ingredientes?.unidade || 'g',
      }))

      setIngredientesSelecionados(itens)
    } catch (error) {
      console.error('Erro ao carregar itens:', error)
    }

    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  // Deletar receita
  const handleDesativar = async (id: string) => {
    const receita = receitas.find(r => r.id === id)
    if (!receita) return
    
    if (!confirm(`Deseja desativar a receita "${receita.nome}"?\n\nEla não será deletada, apenas ficará inativa e não aparecerá mais nas listas.\nVocê pode reativá-la depois se quiser.`)) return

    try {
      const { data, error } = await supabase.rpc('desativar_receita', {
        receita_id_param: id,
        motivo_param: 'Desativado pelo usuário'
      })
      
      if (error) throw error
      
      const resultado = data?.[0]
      if (resultado?.sucesso) {
        const stats = resultado.total_vendas > 0 
          ? `\n\nEstatísticas:\n• ${resultado.total_vendas} vendas registradas\n• ${resultado.quantidade_vendida} unidades vendidas\n• R$ ${resultado.total_faturado?.toFixed(2)} faturado`
          : '\n\nEsta receita não tinha vendas registradas.'
        
        alert(`✅ ${resultado.mensagem}${stats}`)
        await loadReceitas()
      } else {
        alert(`❌ ${resultado?.mensagem || 'Erro ao desativar'}`)
      }
    } catch (error: any) {
      console.error('Erro ao desativar:', error)
      alert(`Erro ao desativar: ${error.message}`)
    }
  }

  // Recalcular custos de uma receita
  const handleRecalcularCustos = async (receitaId: string) => {
    setLoading(true)
    try {
      const { data, error } = await supabase.rpc('recalcular_custo_receita', {
        receita_id_param: receitaId
      })

      if (error) throw error

      // A função SQL retorna um array com os campos: custo_total e preco_venda
      const custoTotal = data?.[0]?.custo_total || 0
      const precoVenda = data?.[0]?.preco_venda || 0

      alert(`✅ Custos atualizados!\n\nNovo custo total: R$ ${custoTotal.toFixed(2)}\nNovo preço de venda: R$ ${precoVenda.toFixed(2)}`)
      
      await loadReceitas()
    } catch (error: any) {
      console.error('Erro ao recalcular:', error)
      alert(`Erro ao recalcular custos: ${error.message}`)
    } finally {
      setLoading(false)
    }
  }

  // Recalcular todas as receitas desatualizadas
  const handleRecalcularTodas = async () => {
    const desatualizadas = receitas.filter(r => r.requer_atualizacao)
    
    if (desatualizadas.length === 0) {
      alert('Não há receitas para atualizar')
      return
    }

    if (!confirm(`Deseja recalcular ${desatualizadas.length} receita(s) desatualizada(s)?`)) {
      return
    }

    setLoading(true)
    try {
      const { data, error } = await supabase.rpc('recalcular_todas_receitas_desatualizadas')

      if (error) throw error

      const relatorio = data.map((r: any) => 
        `• ${r.receita_nome}: R$ ${r.custo_anterior?.toFixed(2)} → R$ ${r.custo_novo?.toFixed(2)} (${r.diferenca >= 0 ? '+' : ''}${r.diferenca?.toFixed(2)})`
      ).join('\n')

      alert(`✅ ${data.length} receita(s) atualizada(s)!\n\n${relatorio}`)
      
      await loadReceitas()
    } catch (error: any) {
      console.error('Erro ao recalcular:', error)
      alert(`Erro ao recalcular: ${error.message}`)
    } finally {
      setLoading(false)
    }
  }

  // Abrir modal de produção própria
  const handleAbrirModalProducaoPropria = (receita: Receita) => {
    setModalProducaoPropria({
      show: true,
      receita: receita,
    })
    setProducaoPropriaData({
      quantidade: receita.rendimento_porcoes.toString(),
      unidadeProducao: '',
    })
  }

  // Transformar receita em ingrediente de produção própria
  const handleConfirmarProducaoPropria = async () => {
    if (!modalProducaoPropria.receita || !user) return

    const quantidade = parseFloat(producaoPropriaData.quantidade)
    if (isNaN(quantidade) || quantidade <= 0) {
      alert('Quantidade inválida')
      return
    }

    if (!producaoPropriaData.unidadeProducao.trim()) {
      alert('Informe a unidade de produção')
      return
    }

    setSaving(true)

    try {
      const receita = modalProducaoPropria.receita

      const { error } = await supabase
        .from('ingredientes')
        .insert({
          user_id: user.id,
          nome: `${receita.nome} (Produção Própria)`,
          tipo_origem: 'producao_propria',
          receita_origem_id: receita.id,
          preco_compra: receita.custo_total || 0,
          quantidade_total: quantidade,
          unidade: 'un',
          unidade_producao: producaoPropriaData.unidadeProducao.trim(),
          quantidade_por_receita: quantidade,
        })

      if (error) throw error

      alert(`✅ Ingrediente "${receita.nome} (Produção Própria)" criado com sucesso!\n\nAgora você pode usar esta receita como ingrediente em outras receitas.`)
      
      setModalProducaoPropria({ show: false, receita: null })
      setProducaoPropriaData({ quantidade: '', unidadeProducao: '' })
    } catch (error: any) {
      console.error('Erro ao criar ingrediente:', error)
      alert(`Erro ao criar ingrediente: ${error.message}`)
    } finally {
      setSaving(false)
    }
  }

  // Cancelar edição
  const handleCancelEdit = () => {
    setEditingId(null)
    setFormData({
      nome: '',
      tipo: '',
      descricao: '',
      foto_url: '',
      rendimento_porcoes: '1',
      tempo_preparo_minutos: '30',
      margem_lucro_desejada: '100',
      quantidade_em_estoque: '0',
      estoque_minimo_produtos: '5',
    })
    setIngredientesSelecionados([])
    setPreviewFoto('')
  }

  // Limpar filtros
  const handleLimparFiltros = () => {
    setFiltroTipo('')
    setFiltroNome('')
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

  const custoTotal = calcularCustoTotal()
  const precoVenda = calcularPrecoVenda()
  const precoPorPorcao = calcularPrecoPorPorcao()

  return (
    <div className="container mx-auto px-3 sm:px-4 py-6 sm:py-8 max-w-7xl">
      <h1 className="text-2xl sm:text-3xl font-bold mb-4 sm:mb-6 text-gray-800 flex items-center gap-2">
        <ChefHat className="h-7 sm:h-8 w-7 sm:w-8 text-orange-500" />
        Gestão de Modelos
      </h1>

      {/* Formulário de Cadastro */}
      <div className="bg-white rounded-lg shadow-md p-4 sm:p-6 mb-6 sm:mb-8">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-4 sm:mb-6">
          <h2 className="text-lg sm:text-xl font-semibold text-gray-700">
            {editingId ? 'Editar Receita' : 'Cadastrar Nova Receita'}
          </h2>
          {editingId && (
            <button
              onClick={handleCancelEdit}
              className="flex items-center justify-center gap-2 px-4 py-2 bg-red-100 hover:bg-red-200 text-red-700 text-sm font-medium rounded-md transition-colors"
            >
              <X className="h-4 w-4" />
              Cancelar Edição
            </button>
          )}
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Layout: Campos à esquerda, Foto à direita */}
          <div className="grid grid-cols-1 lg:grid-cols-[1fr,220px] gap-6">
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Nome da Receita *
                </label>
                <input
                  type="text"
                  value={formData.nome}
                  onChange={(e) => setFormData({ ...formData, nome: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
                  placeholder="Ex: Bolo de Chocolate"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Tipo de Produto
                </label>
                <input
                  type="text"
                  value={formData.tipo}
                  onChange={(e) => setFormData({ ...formData, tipo: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
                  placeholder="Ex: Bolo, Doce, Salgado, Bebida..."
                  list="tipos-sugestoes"
                />
                <datalist id="tipos-sugestoes">
                  {tiposDisponiveis.map(tipo => (
                    <option key={tipo} value={tipo} />
                  ))}
                  <option value="Bolo" />
                  <option value="Doce" />
                  <option value="Salgado" />
                  <option value="Bebida" />
                  <option value="Torta" />
                </datalist>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Descrição
                </label>
                <textarea
                  value={formData.descricao}
                  onChange={(e) => setFormData({ ...formData, descricao: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
                  placeholder="Breve descrição da receita..."
                  rows={3}
                />
              </div>

            </div>

            {/* Upload de Foto - COMPACTO */}
            <div className="flex flex-col">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Foto
              </label>
              {user && (
                <UploadFoto
                  userId={user.id}
                  receitaId={editingId || undefined}
                  fotoAtual={formData.foto_url}
                  onUploadSuccess={(url) => {
                    setFormData({ ...formData, foto_url: url })
                    setPreviewFoto(url)
                  }}
                  onRemove={() => {
                    setFormData({ ...formData, foto_url: '' })
                    setPreviewFoto('')
                  }}
                />
              )}
            </div>
          </div>

          {/* Dados da Receita */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Rendimento (porções) *
              </label>
              <input
                type="number"
                min="1"
                value={formData.rendimento_porcoes}
                onChange={(e) => setFormData({ ...formData, rendimento_porcoes: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Tempo de Preparo (min)
              </label>
              <input
                type="number"
                min="0"
                value={formData.tempo_preparo_minutos}
                onChange={(e) => setFormData({ ...formData, tempo_preparo_minutos: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Margem de Lucro (%)
              </label>
              <input
                type="number"
                min="0"
                step="0.01"
                value={formData.margem_lucro_desejada}
                onChange={(e) => setFormData({ ...formData, margem_lucro_desejada: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
              />
            </div>
          </div>

          {/* Adicionar Ingredientes */}
          <div className="border-t pt-6">
            <h3 className="text-lg font-semibold mb-4 text-gray-700">Ingredientes da Receita</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Selecionar Ingrediente
                </label>
                <select
                  value={ingredienteAtual.ingrediente_id}
                  onChange={(e) => setIngredienteAtual({ ...ingredienteAtual, ingrediente_id: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
                >
                  <option value="">Escolha um ingrediente...</option>
                  {ingredientesDisponiveis.map((ing) => (
                    <option key={ing.id} value={ing.id}>
                      {ing.nome} ({ing.quantidade_total} {ing.unidade} disponível)
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex gap-2">
                <div className="flex-1">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Quantidade
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    value={ingredienteAtual.quantidade_usada}
                    onChange={(e) => setIngredienteAtual({ ...ingredienteAtual, quantidade_usada: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
                    placeholder="0"
                  />
                </div>
                <div className="flex items-end">
                  <button
                    type="button"
                    onClick={handleAdicionarIngrediente}
                    className="px-4 py-2 bg-orange-600 hover:bg-orange-700 text-white rounded-md transition-colors"
                  >
                    <Plus className="h-5 w-5" />
                  </button>
                </div>
              </div>
            </div>

            {/* Lista de Ingredientes Selecionados */}
            {ingredientesSelecionados.length > 0 && (
              <div className="bg-gray-50 rounded-lg p-4">
                <h4 className="font-medium mb-3 text-gray-700">Ingredientes Adicionados:</h4>
                <div className="space-y-2">
                  {ingredientesSelecionados.map((item) => {
                    const ingrediente = ingredientesDisponiveis.find((ing) => ing.id === item.ingrediente_id)
                    if (!ingrediente) return null

                    const custoUnitario = ingrediente.preco_compra / ingrediente.quantidade_total
                    const custoItem = custoUnitario * item.quantidade_usada

                    return (
                      <div key={item.ingrediente_id} className="flex items-center justify-between bg-white p-3 rounded-md">
                        <div className="flex-1">
                          <p className="font-medium text-gray-800">{ingrediente.nome}</p>
                          <p className="text-sm text-gray-600">
                            {item.quantidade_usada} {item.unidade} × R$ {custoUnitario.toFixed(4)} = R$ {custoItem.toFixed(2)}
                          </p>
                        </div>
                        <button
                          type="button"
                          onClick={() => handleRemoverIngrediente(item.ingrediente_id)}
                          className="text-red-600 hover:text-red-800 transition-colors"
                        >
                          <Trash2 className="h-5 w-5" />
                        </button>
                      </div>
                    )
                  })}
                </div>
              </div>
            )}
          </div>

          {/* Cálculos Automáticos */}
          {ingredientesSelecionados.length > 0 && (
            <div className="bg-gradient-to-r from-orange-50 to-yellow-50 rounded-lg p-6 border border-orange-200">
              <h3 className="text-lg font-semibold mb-4 text-gray-800 flex items-center gap-2">
                <DollarSign className="h-5 w-5 text-orange-600" />
                Análise Financeira
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="bg-white rounded-lg p-4 shadow-sm">
                  <p className="text-sm text-gray-600 mb-1">Custo Total</p>
                  <p className="text-2xl font-bold text-red-600">R$ {custoTotal.toFixed(2)}</p>
                </div>
                <div className="bg-white rounded-lg p-4 shadow-sm">
                  <p className="text-sm text-gray-600 mb-1">Preço de Venda</p>
                  <p className="text-2xl font-bold text-green-600">R$ {precoVenda.toFixed(2)}</p>
                </div>
                <div className="bg-white rounded-lg p-4 shadow-sm">
                  <p className="text-sm text-gray-600 mb-1">Preço / Porção</p>
                  <p className="text-2xl font-bold text-blue-600">R$ {precoPorPorcao.toFixed(2)}</p>
                </div>
                <div className="bg-white rounded-lg p-4 shadow-sm">
                  <p className="text-sm text-gray-600 mb-1">Lucro Total</p>
                  <p className="text-2xl font-bold text-purple-600">R$ {(precoVenda - custoTotal).toFixed(2)}</p>
                </div>
              </div>
            </div>
          )}

          {/* Botão Salvar */}
          <button
            type="submit"
            disabled={saving || ingredientesSelecionados.length === 0}
            className="w-full flex items-center justify-center gap-2 bg-green-600 hover:bg-green-700 text-white font-medium py-3 px-6 rounded-md transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {saving ? (
              <>
                <Loader2 className="h-5 w-5 animate-spin" />
                {editingId ? 'Atualizando...' : 'Salvando...'}
              </>
            ) : (
              <>
                <Save className="h-5 w-5" />
                {editingId ? 'Atualizar Receita' : 'Salvar Receita'}
              </>
            )}
          </button>
        </form>
      </div>

      {/* Filtros */}
      <FiltroGenerico titulo="Filtrar Modelos" onLimpar={handleLimparFiltros}>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <InputFiltro
            label="Buscar por Nome"
            placeholder="Digite o nome do modelo..."
            value={filtroNome}
            onChange={setFiltroNome}
            icon={<Search className="h-4 w-4" />}
          />
          <SelectFiltro
            label="Tipo de Produto"
            value={filtroTipo}
            onChange={setFiltroTipo}
            options={[
              ...tiposDisponiveis.map(tipo => ({ value: tipo, label: tipo })),
              { value: 'Bolo', label: 'Bolo' },
              { value: 'Doce', label: 'Doce' },
              { value: 'Salgado', label: 'Salgado' },
              { value: 'Bebida', label: 'Bebida' },
              { value: 'Torta', label: 'Torta' },
            ].filter((opt, index, self) => 
              index === self.findIndex((t) => t.value === opt.value)
            )}
            placeholder="Todos os tipos"
          />
        </div>
        {(filtroNome || filtroTipo) && (
          <div className="text-sm text-gray-600">
            Mostrando {receitas.length} modelo(s) {filtroTipo && `do tipo "${filtroTipo}"`} {filtroNome && `com "${filtroNome}" no nome`}
          </div>
        )}
      </FiltroGenerico>

      {/* Lista de Receitas */}
      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        <div className="px-4 sm:px-6 py-4 border-b border-gray-200">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <div className="flex flex-col sm:flex-row sm:items-center gap-3">
              <h2 className="text-lg sm:text-xl font-semibold text-gray-700">Receitas Ativas ({receitas.length})</h2>
              <Link
                href="/receitas/desativadas"
                className="flex items-center gap-1.5 px-3 py-1.5 bg-gray-100 hover:bg-gray-200 text-gray-700 text-sm font-medium rounded-md transition-colors w-fit"
                title="Ver receitas desativadas"
              >
                <Archive className="h-4 w-4" />
                <span>Desativadas</span>
              </Link>
            </div>
            {receitas.some(r => r.requer_atualizacao) && (
              <button
                onClick={handleRecalcularTodas}
                disabled={loading}
                className="flex items-center justify-center gap-2 px-4 py-2 bg-orange-600 hover:bg-orange-700 text-white text-sm font-medium rounded-md transition-colors disabled:opacity-50"
              >
                {loading ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <TrendingUp className="h-4 w-4" />
                )}
                Atualizar Todas ({receitas.filter(r => r.requer_atualizacao).length})
              </button>
            )}
          </div>
        </div>

        {loading ? (
          <div className="p-8 text-center">
            <Loader2 className="h-6 w-6 animate-spin text-orange-500 mx-auto" />
            <p className="mt-2 text-gray-600">Carregando receitas...</p>
          </div>
        ) : receitas.length === 0 ? (
          <div className="p-8 text-center text-gray-500">
            <ChefHat className="h-16 w-16 mx-auto mb-4 text-gray-300" />
            <p className="mb-2">Nenhuma receita cadastrada ainda.</p>
            <p className="text-sm">Comece criando sua primeira receita acima!</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 p-4 sm:p-6">
            {receitas.map((receita) => (
              <div key={receita.id} className="bg-white border-2 border-gray-200 rounded-lg overflow-hidden hover:shadow-lg transition-shadow">
                {/* Foto */}
                <div className="h-40 sm:h-48 bg-gray-100 overflow-hidden">
                  {receita.foto_url ? (
                    <img
                      src={receita.foto_url}
                      alt={receita.nome}
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        e.currentTarget.style.display = 'none'
                      }}
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <ImageIcon className="h-16 w-16 text-gray-300" />
                    </div>
                  )}
                </div>

                {/* Informações */}
                <div className="p-4">
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <h3 className="text-lg font-bold text-gray-800">{receita.nome}</h3>
                    {receita.requer_atualizacao && (
                      <span className="flex items-center gap-1 px-2 py-1 bg-orange-100 text-orange-700 text-xs font-medium rounded-full whitespace-nowrap">
                        <AlertCircle className="h-3 w-3" />
                        Atualizar
                      </span>
                    )}
                  </div>
                  {receita.descricao && (
                    <p className="text-sm text-gray-600 mb-3 line-clamp-2">{receita.descricao}</p>
                  )}

                  <div className="space-y-2 mb-4">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-600">Rendimento:</span>
                      <span className="font-medium">{receita.rendimento_porcoes} porções</span>
                    </div>
                    {receita.tempo_preparo_minutos ? (
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-gray-600">Tempo:</span>
                        <span className="font-medium flex items-center gap-1">
                          <Clock className="h-4 w-4" />
                          {receita.tempo_preparo_minutos} min
                        </span>
                      </div>
                    ) : null}
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-600">Custo:</span>
                      <span className="font-bold text-red-600">R$ {(receita.custo_total || 0).toFixed(2)}</span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-600">Venda:</span>
                      <span className="font-bold text-green-600">R$ {(receita.preco_venda || 0).toFixed(2)}</span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-600">Por porção:</span>
                      <span className="font-bold text-blue-600">
                        R$ {((receita.preco_venda || 0) / receita.rendimento_porcoes).toFixed(2)}
                      </span>
                    </div>
                  </div>

                  {/* Ações */}
                  <div className="flex flex-col gap-2">
                    {receita.requer_atualizacao && (
                      <button
                        onClick={() => handleRecalcularCustos(receita.id)}
                        className="flex items-center justify-center gap-2 px-4 py-2.5 bg-orange-100 hover:bg-orange-200 text-orange-700 text-sm font-medium rounded-md transition-colors border-2 border-orange-300"
                      >
                        <TrendingUp className="h-4 w-4" />
                        Recalcular Custos
                      </button>
                    )}
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleEdit(receita)}
                        className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 bg-blue-100 hover:bg-blue-200 text-blue-700 text-sm font-medium rounded-md transition-colors"
                      >
                        <Edit2 className="h-4 w-4" />
                        Editar
                      </button>
                      <button
                        onClick={() => handleDesativar(receita.id)}
                        className="flex items-center justify-center gap-2 px-4 py-2.5 bg-yellow-100 hover:bg-yellow-200 text-yellow-700 rounded-md transition-colors"
                        title="Desativar receita"
                      >
                        <X className="h-4 w-4" />
                        <span className="hidden sm:inline">Desativar</span>
                      </button>
                    </div>
                    <button
                      onClick={() => handleAbrirModalProducaoPropria(receita)}
                      className="flex items-center justify-center gap-2 px-4 py-2.5 bg-green-100 hover:bg-green-200 text-green-700 text-sm font-medium rounded-md transition-colors"
                      title="Usar esta receita como ingrediente em outras receitas"
                    >
                      <Plus className="h-4 w-4" />
                      Produção Própria
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Modal de Produção Própria */}
      {modalProducaoPropria.show && modalProducaoPropria.receita && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-lg w-full p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-bold text-gray-800">
                Transformar em Ingrediente de Produção Própria
              </h3>
              <button
                onClick={() => setModalProducaoPropria({ show: false, receita: null })}
                className="text-gray-400 hover:text-gray-600"
                disabled={saving}
              >
                <X className="h-6 w-6" />
              </button>
            </div>

            <div className="mb-4 p-4 bg-blue-50 rounded-lg">
              <p className="font-semibold text-blue-900">
                {modalProducaoPropria.receita.nome}
              </p>
              <p className="text-sm text-blue-700 mt-1">
                Custo: R$ {(modalProducaoPropria.receita.custo_total || 0).toFixed(2)}
              </p>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Quantas unidades esta receita produz? *
                </label>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  value={producaoPropriaData.quantidade}
                  onChange={(e) => setProducaoPropriaData({ ...producaoPropriaData, quantidade: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                  placeholder="1"
                  disabled={saving}
                />
                <p className="text-xs text-gray-500 mt-1">
                  Exemplos: 1 (bolo), 12 (cupcakes), {modalProducaoPropria.receita.rendimento_porcoes} (porções)
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Qual a unidade de produção? *
                </label>
                <input
                  type="text"
                  value={producaoPropriaData.unidadeProducao}
                  onChange={(e) => setProducaoPropriaData({ ...producaoPropriaData, unidadeProducao: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                  placeholder="Ex: bolo inteiro, cupcake, porção"
                  disabled={saving}
                />
                <p className="text-xs text-gray-500 mt-1">
                  Exemplos: &quot;bolo inteiro&quot;, &quot;cupcake&quot;, &quot;porção de 200g&quot;, &quot;pote&quot;
                </p>
              </div>

              <div className="bg-gray-50 p-4 rounded-lg">
                <p className="text-sm text-gray-700">
                  <strong>Resultado:</strong>
                </p>
                <p className="text-sm text-gray-600 mt-1">
                  • Nome: {modalProducaoPropria.receita.nome} (Produção Própria)
                </p>
                <p className="text-sm text-gray-600">
                  • Custo: R$ {(modalProducaoPropria.receita.custo_total || 0).toFixed(2)}
                </p>
                {producaoPropriaData.quantidade && producaoPropriaData.unidadeProducao && (
                  <>
                    <p className="text-sm text-gray-600">
                      • Quantidade: {producaoPropriaData.quantidade} {producaoPropriaData.unidadeProducao}
                    </p>
                    <p className="text-sm font-semibold text-green-600 mt-2">
                      • Custo por unidade: R${' '}
                      {((modalProducaoPropria.receita.custo_total || 0) / parseFloat(producaoPropriaData.quantidade || '1')).toFixed(2)}
                    </p>
                  </>
                )}
              </div>
            </div>

            <div className="flex items-center gap-3 mt-6">
              <button
                onClick={() => setModalProducaoPropria({ show: false, receita: null })}
                disabled={saving}
                className="flex-1 px-4 py-2 bg-gray-200 hover:bg-gray-300 text-gray-700 font-medium rounded-md transition-colors disabled:opacity-50"
              >
                Cancelar
              </button>
              <button
                onClick={handleConfirmarProducaoPropria}
                disabled={saving || !producaoPropriaData.quantidade || !producaoPropriaData.unidadeProducao.trim()}
                className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-green-600 hover:bg-green-700 text-white font-medium rounded-md transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {saving ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Criando...
                  </>
                ) : (
                  <>
                    <Plus className="h-4 w-4" />
                    Criar Ingrediente
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
