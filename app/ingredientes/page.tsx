'use client'

import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import { useAuth } from '@/hooks/useAuth'
import { Ingrediente } from '@/types/database'
import { HistoricoCompra } from '@/types/historico'
import { Trash2, Plus, Loader2, Edit2, X, History, TrendingUp, Upload, FileText, AlertCircle, CheckCircle, Download, Check, Search } from 'lucide-react'
import { FiltroGenerico, InputFiltro } from '@/components/FiltroGenerico'

type Unidade = 'g' | 'kg' | 'ml' | 'L' | 'un'

interface CSVRow {
  nome: string
  preco_compra: number
  quantidade_total: number
  unidade: Unidade
  status?: 'novo' | 'duplicado' | 'erro'
  erro?: string
  existingId?: string
}

interface FormData {
  nome: string
  preco_compra: string
  quantidade_total: string
  unidade: Unidade
  estoque_minimo: string
}

export default function IngredientesPage() {
  const { user, loading: authLoading } = useAuth()
  const [ingredientes, setIngredientes] = useState<Ingrediente[]>([])
  const [loading, setLoading] = useState(false)
  const [saving, setSaving] = useState(false)
  const [visaoEstoque, setVisaoEstoque] = useState(false) // false = Visão Compra, true = Visão Estoque
  const [formData, setFormData] = useState<FormData>({
    nome: '',
    preco_compra: '',
    quantidade_total: '',
    unidade: 'g',
    estoque_minimo: '100',
  })
  const [editingId, setEditingId] = useState<string | null>(null)
  const [selectedIds, setSelectedIds] = useState<string[]>([])
  const [duplicateModal, setDuplicateModal] = useState<{
    show: boolean
    existing: Ingrediente | null
    new: { nome: string; preco: number; quantidade: number; unidade: Unidade }
  }>({
    show: false,
    existing: null,
    new: { nome: '', preco: 0, quantidade: 0, unidade: 'g' },
  })
  const [historicoModal, setHistoricoModal] = useState<{
    show: boolean
    ingredienteId: string | null
    nomeIngrediente: string
    historico: HistoricoCompra[]
    totalGasto: number
  }>({
    show: false,
    ingredienteId: null,
    nomeIngrediente: '',
    historico: [],
    totalGasto: 0,
  })

  // Estados para importação CSV
  const [csvModal, setCsvModal] = useState<{
    show: boolean
    data: CSVRow[]
    processing: boolean
    importStrategy: 'skip' | 'replace' | 'average'
  }>({
    show: false,
    data: [],
    processing: false,
    importStrategy: 'skip',
  })

  // Estado de filtro (apenas nome)
  const [filtroNome, setFiltroNome] = useState('')

  // Processar arquivo CSV
  const handleCSVUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    // Validar tipo de arquivo
    if (!file.name.endsWith('.csv')) {
      alert('Por favor, selecione um arquivo CSV')
      return
    }

    // IMPORTANTE: Recarregar ingredientes antes de processar para garantir detecção de duplicatas
    setLoading(true)
    try {
      await loadIngredientes()
    } catch (error) {
      console.error('Erro ao recarregar ingredientes:', error)
    } finally {
      setLoading(false)
    }

    const reader = new FileReader()
    reader.onload = async (e) => {
      try {
        const text = e.target?.result as string
        const rows = text.split('\n').filter(row => row.trim())
        
        // Remover header
        const header = rows[0].toLowerCase()
        const dataRows = rows.slice(1)

        // Validar header
        if (!header.includes('nome') || !header.includes('preco') || !header.includes('quantidade') || !header.includes('unidade')) {
          alert('CSV inválido! Deve conter as colunas: nome, preco_compra, quantidade_total, unidade')
          return
        }

        // Buscar ingredientes atualizados do banco para verificar duplicatas
        const { data: ingredientesAtualizados, error: errorIngredientes } = await supabase
          .from('ingredientes')
          .select('*')
          .eq('user_id', user!.id)

        if (errorIngredientes) {
          console.error('Erro ao buscar ingredientes:', errorIngredientes)
          alert('Erro ao verificar duplicatas. Tente novamente.')
          return
        }

        const ingredientesParaComparar = ingredientesAtualizados || []
        console.log('Ingredientes no banco:', ingredientesParaComparar.length)

        const parsedData: CSVRow[] = []

        for (const row of dataRows) {
          if (!row.trim()) continue

          const columns = row.split(',').map(col => col.trim())
          
          if (columns.length < 4) {
            parsedData.push({
              nome: columns[0] || 'Linha inválida',
              preco_compra: 0,
              quantidade_total: 0,
              unidade: 'g',
              status: 'erro',
              erro: `Faltam colunas (encontrado ${columns.length}, esperado 4)`,
            })
            continue
          }

          const nome = columns[0]
          const precoStr = columns[1]
          const quantidadeStr = columns[2]
          const unidadeRaw = columns[3].toLowerCase()

          // Validações detalhadas
          let erro = ''
          let unidadeFinal: Unidade = 'g'

          // Verificar encoding (caracteres especiais corrompidos)
          if (nome && (nome.includes('�') || nome.includes('Ã'))) {
            erro = 'Caracteres especiais corrompidos (problema de encoding)'
          }
          // Validar nome
          else if (!nome || nome.trim() === '') {
            erro = 'Nome está vazio'
          }
          // Validar preço
          else if (!precoStr || precoStr.trim() === '') {
            erro = 'Preço está vazio'
          }
          else if (precoStr.includes(',')) {
            erro = 'Use ponto (.) ao invés de vírgula (,) no preço'
          }
          else {
            const preco = parseFloat(precoStr)
            if (isNaN(preco)) {
              erro = `Preço inválido: "${precoStr}" não é um número`
            }
            else if (preco <= 0) {
              erro = `Preço deve ser maior que zero (valor: R$ ${preco})`
            }
          }

          // Validar quantidade
          if (!erro) {
            if (!quantidadeStr || quantidadeStr.trim() === '') {
              erro = 'Quantidade está vazia'
            }
            else if (quantidadeStr.includes(',')) {
              erro = 'Use ponto (.) ao invés de vírgula (,) na quantidade'
            }
            else {
              const quantidade = parseFloat(quantidadeStr)
              if (isNaN(quantidade)) {
                erro = `Quantidade inválida: "${quantidadeStr}" não é um número`
              }
              else if (quantidade <= 0) {
                erro = `Quantidade deve ser maior que zero (valor: ${quantidade})`
              }
            }
          }

          // Validar unidade
          if (!erro) {
            if (!unidadeRaw || unidadeRaw.trim() === '') {
              erro = 'Unidade está vazia'
            }
            else if (!['g', 'kg', 'ml', 'l', 'un'].includes(unidadeRaw)) {
              erro = `Unidade "${unidadeRaw}" inválida. Use: g, kg, ml, L ou un`
            }
            else {
              // Normalizar unidade
              if (unidadeRaw === 'l') unidadeFinal = 'L'
              else unidadeFinal = unidadeRaw as Unidade
            }
          }

          const preco = parseFloat(precoStr) || 0
          const quantidade = parseFloat(quantidadeStr) || 0

          // Verificar duplicata com normalização de nome (mais agressiva)
          const nomeNormalizado = nome
            .toLowerCase()
            .trim()
            .normalize('NFD')
            .replace(/[\u0300-\u036f]/g, '') // Remove acentos
            .replace(/\s+/g, ' ') // Normaliza espaços
          
          const existing = ingredientesParaComparar.find(ing => {
            const nomeExistente = ing.nome
              .toLowerCase()
              .trim()
              .normalize('NFD')
              .replace(/[\u0300-\u036f]/g, '')
              .replace(/\s+/g, ' ')
            return nomeExistente === nomeNormalizado
          })

          if (existing) {
            console.log(`⚠️ DUPLICATA DETECTADA: "${nome}" já existe como "${existing.nome}" (ID: ${existing.id})`)
          } else {
            console.log(`✅ NOVO ITEM: "${nome}"`)
          }

          parsedData.push({
            nome: nome || 'Nome vazio',
            preco_compra: preco,
            quantidade_total: quantidade,
            unidade: unidadeFinal,
            status: erro ? 'erro' : existing ? 'duplicado' : 'novo',
            erro,
            existingId: existing?.id,
          })
        }

        if (parsedData.length === 0) {
          alert('Nenhum dado válido encontrado no CSV')
          return
        }

        // Log de debug
        const duplicados = parsedData.filter(r => r.status === 'duplicado')
        const novos = parsedData.filter(r => r.status === 'novo')
        const erros = parsedData.filter(r => r.status === 'erro')
        
        console.log('=== RESULTADO DA ANÁLISE DO CSV ===')
        console.log('Total de linhas:', parsedData.length)
        console.log('Novos:', novos.length, novos.map(n => n.nome))
        console.log('Duplicados:', duplicados.length, duplicados.map(d => d.nome))
        console.log('Erros:', erros.length)

        setCsvModal({
          show: true,
          data: parsedData,
          processing: false,
          importStrategy: 'skip',
        })
      } catch (error) {
        console.error('Erro ao processar CSV:', error)
        alert('Erro ao processar arquivo CSV')
      }
    }

    reader.readAsText(file)
    event.target.value = '' // Limpar input
  }

  // Importar dados do CSV
  const handleImportCSV = async () => {
    if (!user || csvModal.data.length === 0) return

    // Verificar se há duplicatas e avisar o usuário
    const duplicados = csvModal.data.filter(r => r.status === 'duplicado')
    if (duplicados.length > 0) {
      const estrategiaTexto = 
        csvModal.importStrategy === 'skip' ? 'PULAR (não importar)' :
        csvModal.importStrategy === 'replace' ? 'SUBSTITUIR os valores existentes' :
        'SOMAR valores e quantidades (nova compra)'
      
      const confirmar = confirm(
        `⚠️ ATENÇÃO: ${duplicados.length} item(ns) duplicado(s) encontrado(s):\n\n` +
        duplicados.map(d => `• ${d.nome}`).join('\n') +
        `\n\nEles serão: ${estrategiaTexto}\n\nDeseja continuar?`
      )
      
      if (!confirmar) {
        setCsvModal({ ...csvModal, processing: false })
        return
      }
    }

    setCsvModal({ ...csvModal, processing: true })

    try {
      let importados = 0
      let pulados = 0
      let erros = 0

      for (const row of csvModal.data) {
        // Pular se tiver erro
        if (row.status === 'erro') {
          erros++
          continue
        }

        // Normalizar dados
        const { quantidade, unidade } = normalizeIngrediente({
          nome: row.nome,
          preco_compra: row.preco_compra.toString(),
          quantidade_total: row.quantidade_total.toString(),
          unidade: row.unidade,
          estoque_minimo: '0',
        })

        // Se for duplicado
        if (row.status === 'duplicado' && row.existingId) {
          console.log(`🔄 Processando duplicado: ${row.nome} (Estratégia: ${csvModal.importStrategy})`)
          
          if (csvModal.importStrategy === 'skip') {
            console.log(`⏭️ Pulando: ${row.nome}`)
            pulados++
            continue
          } else if (csvModal.importStrategy === 'replace') {
            console.log(`🔄 Substituindo: ${row.nome}`)
            // Substituir
            const { error } = await supabase
              .from('ingredientes')
              .update({
                preco_compra: row.preco_compra,
                quantidade_total: quantidade,
                unidade: unidade,
              })
              .eq('id', row.existingId)

            if (error) throw error

            // Registrar no histórico
            await registrarCompraHistorico(
              row.existingId,
              row.nome,
              row.preco_compra,
              quantidade,
              unidade
            )

            importados++
          } else if (csvModal.importStrategy === 'average') {
            // Somar valores
            const existing = ingredientes.find(ing => ing.id === row.existingId)
            if (existing) {
              const precoTotal = existing.preco_compra + row.preco_compra
              const quantidadeTotal = existing.quantidade_total + quantidade

              console.log(`➕ Somando: ${row.nome}`)
              console.log(`   Antes: R$ ${existing.preco_compra.toFixed(2)} / ${existing.quantidade_total}${existing.unidade}`)
              console.log(`   Novo: R$ ${row.preco_compra.toFixed(2)} / ${quantidade}${unidade}`)
              console.log(`   Depois: R$ ${precoTotal.toFixed(2)} / ${quantidadeTotal}${unidade}`)

              const { error } = await supabase
                .from('ingredientes')
                .update({
                  preco_compra: precoTotal,
                  quantidade_total: quantidadeTotal,
                })
                .eq('id', row.existingId)

              if (error) {
                console.error(`❌ Erro ao somar ${row.nome}:`, error)
                throw error
              }

              // Registrar no histórico
              await registrarCompraHistorico(
                row.existingId,
                row.nome,
                row.preco_compra,
                quantidade,
                unidade
              )

              console.log(`✅ ${row.nome} atualizado com sucesso!`)
              importados++
            } else {
              console.error(`❌ Não encontrou ingrediente existente para ${row.nome}`)
            }
          }
        } else {
          // Inserir novo
          console.log(`➕ Inserindo novo: ${row.nome}`)
          const { data: newIngrediente, error } = await supabase
            .from('ingredientes')
            .insert({
              user_id: user.id,
              nome: row.nome.trim(),
              preco_compra: row.preco_compra,
              quantidade_total: quantidade,
              unidade: unidade,
            })
            .select()
            .single()

          if (error) throw error

          // Registrar no histórico
          if (newIngrediente) {
            await registrarCompraHistorico(
              newIngrediente.id,
              row.nome.trim(),
              row.preco_compra,
              quantidade,
              unidade
            )
          }

          importados++
        }
      }

      // Fechar modal e recarregar
      setCsvModal({
        show: false,
        data: [],
        processing: false,
        importStrategy: 'skip',
      })

      // Recarregar ingredientes
      await loadIngredientes()
      
      // Mostrar resultado DEPOIS de recarregar
      alert(`✅ Importação concluída!\n\n📊 Resultado:\n• ${importados} importados/atualizados\n• ${pulados} pulados\n• ${erros} com erro\n\nOs dados foram atualizados na lista!`)
      
    } catch (error: any) {
      console.error('Erro ao importar CSV:', error)
      alert(`❌ Erro ao importar: ${error.message}`)
      setCsvModal(prev => ({ ...prev, processing: false }))
    }
  }

  // Baixar template CSV
  const handleDownloadTemplate = () => {
    const csv = `nome,preco_compra,quantidade_total,unidade
Farinha de Trigo,10.00,1,kg
Açúcar,8.50,1,kg
Chocolate em Pó,15.00,200,g
Ovos,12.00,12,un
Leite,5.50,1,L
Óleo de Soja,7.00,900,ml`

    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
    const link = document.createElement('a')
    link.href = URL.createObjectURL(blob)
    link.download = 'template_ingredientes.csv'
    link.click()
  }

  // Carregar ingredientes
  useEffect(() => {
    if (user) {
      loadIngredientes()
    }
  }, [user])

  // Recarregar quando filtros de nome mudarem (busca no DB)
  useEffect(() => {
    if (user) {
      loadIngredientes()
    }
  }, [filtroNome])

  // Recarregar quando a página ganha foco (útil após importar CSV)
  useEffect(() => {
    const handleFocus = () => {
      if (user) {
        loadIngredientes()
      }
    }
    window.addEventListener('focus', handleFocus)
    return () => window.removeEventListener('focus', handleFocus)
  }, [user])

  const handleLimparFiltros = () => {
    setFiltroNome('')
  }

  const loadIngredientes = async () => {
    if (!user) return

    setLoading(true)
    try {
      let query = supabase
        .from('ingredientes')
        .select('*')
        .eq('user_id', user.id)
      
      // Filtro de nome (server-side para performance)
      if (filtroNome) {
        query = query.ilike('nome', `%${filtroNome}%`)
      }
      
      query = query.order('created_at', { ascending: false })

      const { data, error } = await query

      if (error) throw error
      
      console.log('Ingredientes carregados:', data?.length || 0, 'itens')
      
      setIngredientes(data || [])
    } catch (error: any) {
      console.error('Erro ao carregar ingredientes:', error)
      const errorMessage = error?.message || 'Erro desconhecido'
      alert(`Erro ao carregar ingredientes: ${errorMessage}`)
    } finally {
      setLoading(false)
    }
  }

  // Usar ingredientes diretamente (filtro de nome já aplicado no server-side)
  const ingredientesFiltrados = ingredientes

  // Função de conversão: normaliza para unidades menores
  const normalizeIngrediente = (data: FormData) => {
    let quantidade = parseFloat(data.quantidade_total)
    let unidade: 'g' | 'ml' | 'un' = data.unidade as 'g' | 'ml' | 'un'

    // Converter kg para g
    if (data.unidade === 'kg') {
      quantidade = quantidade * 1000
      unidade = 'g'
    }
    // Converter L para ml
    else if (data.unidade === 'L') {
      quantidade = quantidade * 1000
      unidade = 'ml'
    }
    // Se já for g, ml ou un, mantém
    else if (data.unidade === 'g' || data.unidade === 'ml' || data.unidade === 'un') {
      unidade = data.unidade
    }

    return {
      quantidade,
      unidade,
    }
  }

  // Calcular custo unitário
  const calcularCustoUnitario = (preco: number, quantidade: number): number => {
    if (quantidade === 0) return 0
    return preco / quantidade
  }

  // Formatar custo unitário para exibição
  const formatarCustoUnitario = (custo: number, unidade: string): string => {
    if (custo < 0.01) {
      return `R$ ${custo.toFixed(4)}`
    }
    return `R$ ${custo.toFixed(2)}`
  }

  // Função para determinar status do estoque
  const getStatusEstoque = (quantidade: number, estoqueMinimo: number) => {
    if (quantidade <= 0) {
      return { 
        cor: 'bg-red-100 text-red-800 border-red-300', 
        texto: 'SEM ESTOQUE',
        textColor: 'text-red-600'
      }
    } else if (estoqueMinimo > 0 && quantidade <= estoqueMinimo) {
      return { 
        cor: 'bg-yellow-100 text-yellow-800 border-yellow-300', 
        texto: 'ESTOQUE BAIXO',
        textColor: 'text-yellow-600'
      }
    } else {
      return { 
        cor: 'bg-green-100 text-green-800 border-green-300', 
        texto: 'OK',
        textColor: 'text-green-600'
      }
    }
  }

  // Registrar compra no histórico
  const registrarCompraHistorico = async (
    ingredienteId: string,
    nome: string,
    preco: number,
    quantidade: number,
    unidade: string
  ) => {
    try {
      const valorTotal = preco
      const { error } = await supabase.from('historico_compras').insert({
        user_id: user!.id,
        ingrediente_id: ingredienteId,
        nome_ingrediente: nome,
        preco_compra: preco,
        quantidade_comprada: quantidade,
        unidade,
        valor_total: valorTotal,
      })
      
      // Se a tabela não existe, apenas avisar no console (não bloquear o cadastro)
      if (error && (error.message.includes('does not exist') || error.message.includes('schema cache'))) {
        console.warn('⚠️ Tabela de histórico não criada ainda. Execute SQL_CRIAR_HISTORICO_AGORA.sql no Supabase.')
      } else if (error) {
        console.error('Erro ao registrar histórico:', error)
      }
    } catch (error) {
      console.error('Erro ao registrar histórico:', error)
    }
  }

  // Buscar histórico de um ingrediente
  const loadHistorico = async (ingredienteId: string, nomeIngrediente: string) => {
    try {
      const { data, error } = await supabase
        .from('historico_compras')
        .select('*')
        .eq('ingrediente_id', ingredienteId)
        .order('data_compra', { ascending: false })

      if (error) {
        // Se a tabela não existe, mostrar mensagem específica
        if (error.message.includes('does not exist') || error.message.includes('schema cache')) {
          alert('A tabela de histórico ainda não foi criada.\n\nPor favor:\n1. Vá no SQL Editor do Supabase\n2. Execute o SQL do arquivo: SQL_CRIAR_HISTORICO_AGORA.sql\n3. Aguarde 30 segundos\n4. Tente novamente')
          return
        }
        throw error
      }

      const historico = data || []
      const totalGasto = historico.reduce((sum, item) => sum + item.valor_total, 0)

      setHistoricoModal({
        show: true,
        ingredienteId,
        nomeIngrediente,
        historico,
        totalGasto,
      })
    } catch (error: any) {
      console.error('Erro ao carregar histórico:', error)
      alert(`Erro ao carregar histórico: ${error.message}`)
    }
  }

  // Verificar se ingrediente já existe
  const checkDuplicate = (nome: string): Ingrediente | null => {
    return ingredientes.find(
      (ing) => ing.nome.toLowerCase().trim() === nome.toLowerCase().trim()
    ) || null
  }

  // Salvar ingrediente
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!user) {
      alert('Você precisa estar logado para cadastrar ingredientes')
      return
    }

    // Validação
    if (!formData.nome.trim()) {
      alert('Por favor, informe o nome do ingrediente')
      return
    }

    const preco = parseFloat(formData.preco_compra)
    const quantidade = parseFloat(formData.quantidade_total)

    if (isNaN(preco) || preco <= 0) {
      alert('Por favor, informe um preço válido')
      return
    }

    if (isNaN(quantidade) || quantidade <= 0) {
      alert('Por favor, informe uma quantidade válida')
      return
    }

    // Verificar duplicação (apenas se não estiver editando)
    if (!editingId) {
      const existing = checkDuplicate(formData.nome)
      if (existing) {
        // Normalizar dados para comparação
        const { quantidade: quantidadeNormalizada, unidade: unidadeNormalizada } =
          normalizeIngrediente(formData)
        
        setDuplicateModal({
          show: true,
          existing,
          new: {
            nome: formData.nome.trim(),
            preco,
            quantidade: quantidadeNormalizada,
            unidade: unidadeNormalizada,
          },
        })
        return
      }
    }

    setSaving(true)

    try {
      // Normalizar dados antes de salvar
      const { quantidade: quantidadeNormalizada, unidade: unidadeNormalizada } =
        normalizeIngrediente(formData)

      if (editingId) {
        // Atualizar ingrediente existente
        const { error } = await supabase
          .from('ingredientes')
          .update({
            nome: formData.nome.trim(),
            preco_compra: preco,
            quantidade_total: quantidadeNormalizada,
            unidade: unidadeNormalizada,
            estoque_minimo: parseFloat(formData.estoque_minimo) || 0,
          })
          .eq('id', editingId)

        if (error) throw error
        setEditingId(null)
      } else {
        // Inserir novo ingrediente
        const { data: newIngrediente, error } = await supabase
          .from('ingredientes')
          .insert({
            user_id: user.id,
            nome: formData.nome.trim(),
            preco_compra: preco,
            quantidade_total: quantidadeNormalizada,
            unidade: unidadeNormalizada,
            estoque_minimo: parseFloat(formData.estoque_minimo) || 0,
          })
          .select()
          .single()

        if (error) throw error

        // Registrar no histórico
        if (newIngrediente) {
          await registrarCompraHistorico(
            newIngrediente.id,
            formData.nome.trim(),
            preco,
            quantidadeNormalizada,
            unidadeNormalizada
          )
        }
      }

      // Limpar formulário
      setFormData({
        nome: '',
        preco_compra: '',
        quantidade_total: '',
        unidade: 'g',
        estoque_minimo: '100',
      })

      // Recarregar lista
      await loadIngredientes()
    } catch (error: any) {
      console.error('Erro ao salvar ingrediente:', error)
      const errorMessage = error?.message || 'Erro desconhecido ao salvar ingrediente'
      alert(`Erro ao salvar ingrediente: ${errorMessage}`)
    } finally {
      setSaving(false)
    }
  }

  // Atualizar com média de preços
  const handleUpdateWithAverage = async () => {
    if (!duplicateModal.existing || !duplicateModal.new) return

    setSaving(true)
    setDuplicateModal({ ...duplicateModal, show: false })

    try {
      const existing = duplicateModal.existing
      const newData = duplicateModal.new

      // CORRETO: Somar os valores totais gastos (não fazer média simples)
      // preco_compra deve representar o valor total acumulado
      const precoTotal = existing.preco_compra + newData.preco

      // Somar quantidades (já normalizadas)
      const quantidadeTotal = existing.quantidade_total + newData.quantidade

      const { error } = await supabase
        .from('ingredientes')
        .update({
          preco_compra: precoTotal,
          quantidade_total: quantidadeTotal,
        })
        .eq('id', existing.id)

      if (error) throw error

      // Registrar nova compra no histórico
      await registrarCompraHistorico(
        existing.id,
        existing.nome,
        newData.preco,
        newData.quantidade,
        newData.unidade
      )

      // Limpar formulário
      setFormData({
        nome: '',
        preco_compra: '',
        quantidade_total: '',
        unidade: 'g',
        estoque_minimo: '100',
      })

      await loadIngredientes()
    } catch (error: any) {
      console.error('Erro ao atualizar:', error)
      alert(`Erro ao atualizar: ${error.message}`)
    } finally {
      setSaving(false)
    }
  }

  // Substituir valores
  const handleReplace = async () => {
    if (!duplicateModal.existing || !duplicateModal.new) return

    setSaving(true)
    setDuplicateModal({ ...duplicateModal, show: false })

    try {
      const existing = duplicateModal.existing
      const newData = duplicateModal.new

      const { error} = await supabase
        .from('ingredientes')
        .update({
          preco_compra: newData.preco,
          quantidade_total: newData.quantidade,
          unidade: newData.unidade,
        })
        .eq('id', existing.id)

      if (error) throw error

      // Registrar nova compra no histórico
      await registrarCompraHistorico(
        existing.id,
        existing.nome,
        newData.preco,
        newData.quantidade,
        newData.unidade
      )

      // Limpar formulário
      setFormData({
        nome: '',
        preco_compra: '',
        quantidade_total: '',
        unidade: 'g',
        estoque_minimo: '100',
      })

      await loadIngredientes()
    } catch (error: any) {
      console.error('Erro ao substituir:', error)
      alert(`Erro ao substituir: ${error.message}`)
    } finally {
      setSaving(false)
    }
  }

  // Iniciar edição
  const handleEdit = (ingrediente: Ingrediente) => {
    setEditingId(ingrediente.id)
    
    // Converter de volta para kg ou L se necessário para o formulário
    let quantidade = ingrediente.quantidade_total
    let unidade: Unidade = ingrediente.unidade

    if (ingrediente.unidade === 'g' && ingrediente.quantidade_total >= 1000) {
      quantidade = ingrediente.quantidade_total / 1000
      unidade = 'kg'
    } else if (ingrediente.unidade === 'ml' && ingrediente.quantidade_total >= 1000) {
      quantidade = ingrediente.quantidade_total / 1000
      unidade = 'L'
    }

    setFormData({
      nome: ingrediente.nome,
      preco_compra: ingrediente.preco_compra.toString(),
      quantidade_total: quantidade.toString(),
      unidade,
      estoque_minimo: ((ingrediente as any).estoque_minimo || 0).toString(),
    })

    // Scroll para o formulário
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  // Cancelar edição
  const handleCancelEdit = () => {
    setEditingId(null)
    setFormData({
      nome: '',
      preco_compra: '',
      quantidade_total: '',
      unidade: 'g',
      estoque_minimo: '100',
    })
  }

  // Selecionar/Desselecionar item
  const handleToggleSelect = (id: string) => {
    setSelectedIds(prev =>
      prev.includes(id)
        ? prev.filter(selectedId => selectedId !== id)
        : [...prev, id]
    )
  }

  // Selecionar/Desselecionar todos
  const handleToggleSelectAll = () => {
    if (selectedIds.length === ingredientes.length) {
      setSelectedIds([])
    } else {
      setSelectedIds(ingredientes.map(ing => ing.id))
    }
  }

  // Excluir ingrediente único
  const handleDelete = async (id: string) => {
    if (!confirm('Tem certeza que deseja excluir este ingrediente?')) {
      return
    }

    try {
      const { error } = await supabase.from('ingredientes').delete().eq('id', id)

      if (error) throw error

      setSelectedIds(prev => prev.filter(selectedId => selectedId !== id))
      await loadIngredientes()
    } catch (error) {
      console.error('Erro ao excluir ingrediente:', error)
      alert('Erro ao excluir ingrediente')
    }
  }

  // Excluir múltiplos ingredientes
  const handleDeleteSelected = async () => {
    if (selectedIds.length === 0) return

    const confirmar = confirm(
      `Tem certeza que deseja excluir ${selectedIds.length} ingrediente(s) selecionado(s)?\n\n` +
      'Esta ação não pode ser desfeita.'
    )

    if (!confirmar) return

    setLoading(true)
    try {
      let sucessos = 0
      let erros = 0

      for (const id of selectedIds) {
        const { error } = await supabase.from('ingredientes').delete().eq('id', id)
        if (error) {
          console.error('Erro ao excluir:', id, error)
          erros++
        } else {
          sucessos++
        }
      }

      if (erros > 0) {
        alert(`Excluídos: ${sucessos}\nErros: ${erros}`)
      } else {
        alert(`✅ ${sucessos} ingrediente(s) excluído(s) com sucesso!`)
      }

      setSelectedIds([])
      await loadIngredientes()
    } catch (error: any) {
      console.error('Erro ao excluir ingredientes:', error)
      alert(`Erro ao excluir ingredientes: ${error.message}`)
    } finally {
      setLoading(false)
    }
  }

  // Formatar unidade para exibição (mostrar unidade original se foi convertida)
  const getUnidadeDisplay = (ingrediente: Ingrediente): string => {
    // Se está em g mas a quantidade é >= 1000, mostrar como kg
    if (ingrediente.unidade === 'g' && ingrediente.quantidade_total >= 1000) {
      return 'kg'
    }
    // Se está em ml mas a quantidade é >= 1000, mostrar como L
    if (ingrediente.unidade === 'ml' && ingrediente.quantidade_total >= 1000) {
      return 'L'
    }
    return ingrediente.unidade
  }

  // Formatar quantidade para exibição
  const getQuantidadeDisplay = (ingrediente: Ingrediente): string => {
    if (ingrediente.unidade === 'g' && ingrediente.quantidade_total >= 1000) {
      return (ingrediente.quantidade_total / 1000).toFixed(2)
    }
    if (ingrediente.unidade === 'ml' && ingrediente.quantidade_total >= 1000) {
      return (ingrediente.quantidade_total / 1000).toFixed(2)
    }
    return ingrediente.quantidade_total.toString()
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
          <p className="text-gray-600">
            Você precisa estar logado para acessar esta página.
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-3 sm:px-4 py-6 sm:py-8 max-w-6xl">
      <h1 className="text-2xl sm:text-3xl font-bold mb-4 text-gray-800">Gestão de Insumos e Estoque</h1>
      <p className="text-gray-600 mb-6">Tudo que você compra para produzir (matéria-prima e embalagens)</p>

      {/* Resumo de Estoque */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <div className="bg-white rounded-lg shadow-md p-4">
          <p className="text-sm text-gray-600 mb-1">Total de Insumos</p>
          <p className="text-2xl font-bold text-gray-900">{ingredientes.length}</p>
        </div>
        <div className="bg-white rounded-lg shadow-md p-4">
          <p className="text-sm text-gray-600 mb-1">Com Estoque</p>
          <p className="text-2xl font-bold text-green-600">
            {ingredientes.filter(i => i.quantidade_total > 0).length}
          </p>
        </div>
        <div className="bg-white rounded-lg shadow-md p-4">
          <p className="text-sm text-gray-600 mb-1">Estoque Baixo</p>
          <p className="text-2xl font-bold text-yellow-600">
            {ingredientes.filter(i => {
              const min = (i as any).estoque_minimo || 0
              return i.quantidade_total > 0 && min > 0 && i.quantidade_total <= min
            }).length}
          </p>
        </div>
        <div className="bg-white rounded-lg shadow-md p-4">
          <p className="text-sm text-gray-600 mb-1">
            {visaoEstoque ? 'Valor Total em Estoque' : 'Sem Estoque'}
          </p>
          {visaoEstoque ? (
            <p className="text-2xl font-bold text-blue-600">
              R$ {ingredientes.reduce((acc, i) => {
                const custo = calcularCustoUnitario(i.preco_compra, i.quantidade_total)
                return acc + (i.quantidade_total * custo)
              }, 0).toFixed(2)}
            </p>
          ) : (
            <p className="text-2xl font-bold text-red-600">
              {ingredientes.filter(i => i.quantidade_total <= 0).length}
            </p>
          )}
        </div>
      </div>

      {/* Formulário de Cadastro */}
      <div className="bg-white rounded-lg shadow-md p-4 sm:p-6 mb-6 sm:mb-8">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-4">
          <h2 className="text-lg sm:text-xl font-semibold text-gray-700">
            {editingId ? 'Editar Ingrediente' : 'Cadastrar Novo Ingrediente'}
          </h2>
          {editingId && (
            <button
              type="button"
              onClick={handleCancelEdit}
              className="flex items-center gap-2 px-4 py-2 bg-red-100 hover:bg-red-200 text-red-700 text-sm font-medium rounded-md transition-colors"
            >
              <X className="h-4 w-4" />
              Cancelar Edição
            </button>
          )}
        </div>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div>
              <label htmlFor="nome" className="block text-sm font-medium text-gray-700 mb-1">
                Nome do Ingrediente *
              </label>
              <input
                type="text"
                id="nome"
                value={formData.nome}
                onChange={(e) => setFormData({ ...formData, nome: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                placeholder="Ex: Farinha de Trigo"
                required
              />
            </div>

            <div>
              <label htmlFor="preco" className="block text-sm font-medium text-gray-700 mb-1">
                Preço Pago (R$) *
              </label>
              <input
                type="number"
                id="preco"
                step="0.01"
                min="0"
                value={formData.preco_compra}
                onChange={(e) => setFormData({ ...formData, preco_compra: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                placeholder="0.00"
                required
              />
            </div>

            <div>
              <label htmlFor="quantidade" className="block text-sm font-medium text-gray-700 mb-1">
                Quantidade Comprada *
              </label>
              <input
                type="number"
                id="quantidade"
                step="0.01"
                min="0"
                value={formData.quantidade_total}
                onChange={(e) => setFormData({ ...formData, quantidade_total: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                placeholder="0"
                required
              />
            </div>

            <div>
              <label htmlFor="unidade" className="block text-sm font-medium text-gray-700 mb-1">
                Unidade de Medida *
              </label>
              <select
                id="unidade"
                value={formData.unidade}
                onChange={(e) => setFormData({ ...formData, unidade: e.target.value as Unidade })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                required
              >
                <option value="g">Gramas (g)</option>
                <option value="kg">Quilogramas (kg)</option>
                <option value="ml">Mililitros (ml)</option>
                <option value="L">Litros (L)</option>
                <option value="un">Unidade (un)</option>
              </select>
            </div>

            <div>
              <label htmlFor="estoque_minimo" className="block text-sm font-medium text-gray-700 mb-1">
                Estoque Mínimo (Alerta)
              </label>
              <input
                type="number"
                id="estoque_minimo"
                step="0.01"
                min="0"
                value={formData.estoque_minimo}
                onChange={(e) => setFormData({ ...formData, estoque_minimo: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                placeholder="Ex: 100"
              />
              <p className="text-xs text-gray-500 mt-1">
                Você será alertado quando o estoque ficar abaixo deste valor
              </p>
            </div>
          </div>

          <button
            type="submit"
            disabled={saving}
            data-tour="botao-adicionar-insumo"
            className="w-full sm:w-auto flex items-center justify-center gap-2 bg-green-600 hover:bg-green-700 text-white font-medium py-3 sm:py-2 px-6 rounded-md transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {saving ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                {editingId ? 'Atualizando...' : 'Salvando...'}
              </>
            ) : editingId ? (
              <>
                <Edit2 className="h-4 w-4" />
                Atualizar Ingrediente
              </>
            ) : (
              <>
                <Plus className="h-4 w-4" />
                Adicionar Ingrediente
              </>
            )}
          </button>
        </form>
      </div>

      {/* Filtros */}
      <FiltroGenerico titulo="Filtrar Insumos" onLimpar={handleLimparFiltros}>
        <InputFiltro
          label="Buscar por Nome"
          placeholder="Digite o nome do insumo..."
          value={filtroNome}
          onChange={setFiltroNome}
          icon={<Search className="h-4 w-4" />}
        />
        {filtroNome && (
          <div className="text-sm text-gray-600">
            Mostrando {ingredientesFiltrados.length} de {ingredientes.length} insumo(s)
          </div>
        )}
      </FiltroGenerico>

      {/* Tabela de Ingredientes */}
      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        <div className="px-4 sm:px-6 py-4 border-b border-gray-200">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-3">
            <div className="flex flex-col sm:flex-row sm:items-center gap-3">
              <h2 className="text-lg sm:text-xl font-semibold text-gray-700">Insumos em Estoque ({ingredientes.length})</h2>
              
              {/* Toggle Visão */}
              <div className="flex items-center gap-2 bg-gray-100 rounded-lg p-1">
                <button
                  onClick={() => setVisaoEstoque(false)}
                  className={`px-3 py-1.5 text-sm font-medium rounded-md transition-colors ${
                    !visaoEstoque 
                      ? 'bg-white text-gray-900 shadow-sm' 
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  Visão Compra
                </button>
                <button
                  onClick={() => setVisaoEstoque(true)}
                  className={`px-3 py-1.5 text-sm font-medium rounded-md transition-colors ${
                    visaoEstoque 
                      ? 'bg-white text-gray-900 shadow-sm' 
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  Visão Estoque
                </button>
              </div>
            </div>
            <div className="grid grid-cols-3 sm:flex sm:items-center gap-2">
              <button
                onClick={handleDownloadTemplate}
                className="flex items-center justify-center gap-1 sm:gap-2 px-2 sm:px-4 py-2 bg-green-600 hover:bg-green-700 text-white text-xs sm:text-sm font-medium rounded-md transition-colors"
                title="Baixar template CSV"
              >
                <Download className="h-4 w-4" />
                <span className="hidden sm:inline">Template CSV</span>
                <span className="sm:hidden">CSV</span>
              </button>
              <label className="flex items-center justify-center gap-1 sm:gap-2 px-2 sm:px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white text-xs sm:text-sm font-medium rounded-md transition-colors cursor-pointer">
                <Upload className="h-4 w-4" />
                <span className="hidden sm:inline">Importar CSV</span>
                <span className="sm:hidden">Import</span>
                <input
                  type="file"
                  accept=".csv"
                  onChange={handleCSVUpload}
                  className="hidden"
                />
              </label>
              <button
                onClick={loadIngredientes}
                disabled={loading}
                className="flex items-center justify-center gap-1 sm:gap-2 px-2 sm:px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs sm:text-sm font-medium rounded-md transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                title="Recarregar lista"
              >
                {loading ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <>
                    <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                    </svg>
                    <span className="hidden sm:inline">Recarregar</span>
                  </>
                )}
              </button>
            </div>
          </div>
          
          {/* Barra de Seleção Múltipla */}
          {selectedIds.length > 0 && (
            <div className="flex items-center justify-between bg-blue-50 border border-blue-200 rounded-lg px-4 py-3">
              <div className="flex items-center gap-3">
                <CheckCircle className="h-5 w-5 text-blue-600" />
                <span className="text-sm font-medium text-blue-900">
                  {selectedIds.length} item(ns) selecionado(s)
                </span>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setSelectedIds([])}
                  className="px-3 py-1.5 text-sm text-blue-700 hover:text-blue-900 font-medium transition-colors"
                >
                  Limpar Seleção
                </button>
                <button
                  onClick={handleDeleteSelected}
                  className="flex items-center gap-2 px-4 py-1.5 bg-red-600 hover:bg-red-700 text-white text-sm font-medium rounded-md transition-colors"
                >
                  <Trash2 className="h-4 w-4" />
                  Excluir Selecionados
                </button>
              </div>
            </div>
          )}
        </div>

        {loading ? (
          <div className="p-8 text-center">
            <Loader2 className="h-6 w-6 animate-spin text-orange-500 mx-auto" />
            <p className="mt-2 text-gray-600">Carregando ingredientes...</p>
          </div>
        ) : ingredientes.length === 0 ? (
          <div className="p-8 text-center text-gray-500">
            <p className="mb-2">Nenhum ingrediente cadastrado ainda.</p>
            <p className="text-sm mb-4">Comece adicionando seu primeiro ingrediente acima.</p>
            <button
              onClick={loadIngredientes}
              className="text-blue-600 hover:text-blue-700 text-sm font-medium underline"
            >
              Ou clique aqui para recarregar
            </button>
          </div>
        ) : (
          <>
            {/* Versão Desktop (Tabela) */}
            <div className="hidden md:block overflow-x-auto">
              <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-left">
                    <input
                      type="checkbox"
                      checked={ingredientes.length > 0 && selectedIds.length === ingredientes.length}
                      onChange={handleToggleSelectAll}
                      className="w-4 h-4 text-blue-600 rounded focus:ring-2 focus:ring-blue-500 cursor-pointer"
                      title={selectedIds.length === ingredientes.length ? 'Desselecionar todos' : 'Selecionar todos'}
                    />
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Nome
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    {visaoEstoque ? 'Valor em Estoque' : 'Preço Original'}
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    {visaoEstoque ? 'Quantidade em Estoque' : 'Quantidade Original'}
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Custo Unitário
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Ações
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {ingredientesFiltrados.map((ingrediente) => {
                  const custoUnitario = calcularCustoUnitario(
                    ingrediente.preco_compra,
                    ingrediente.quantidade_total
                  )
                  const unidadeDisplay = getUnidadeDisplay(ingrediente)
                  const quantidadeDisplay = getQuantidadeDisplay(ingrediente)

                  const isSelected = selectedIds.includes(ingrediente.id)
                  const isProducaoPropria = ingrediente.tipo_origem === 'producao_propria'
                  const statusEstoque = getStatusEstoque(
                    ingrediente.quantidade_total, 
                    (ingrediente as any).estoque_minimo || 0
                  )

                  return (
                    <tr 
                      key={ingrediente.id} 
                      className={`hover:bg-gray-50 ${isSelected ? 'bg-blue-50' : ''} ${isProducaoPropria ? 'bg-green-50' : ''}`}
                    >
                      <td className="px-4 py-4 whitespace-nowrap">
                        <input
                          type="checkbox"
                          checked={isSelected}
                          onChange={() => handleToggleSelect(ingrediente.id)}
                          className="w-4 h-4 text-blue-600 rounded focus:ring-2 focus:ring-blue-500 cursor-pointer"
                        />
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex flex-col gap-1">
                          <div className="flex items-center gap-2">
                            <div className="text-sm font-medium text-gray-900">{ingrediente.nome}</div>
                            <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium border ${statusEstoque.cor}`}>
                              {statusEstoque.texto}
                            </span>
                          </div>
                          {isProducaoPropria && (
                            <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-green-100 text-green-800 w-fit">
                              Produção Própria
                            </span>
                          )}
                          {isProducaoPropria && ingrediente.unidade_producao && (
                            <div className="text-xs text-gray-500">
                              {ingrediente.quantidade_por_receita} {ingrediente.unidade_producao}
                            </div>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">
                          {visaoEstoque ? (
                            <span className="font-semibold text-blue-600">
                              R$ {(ingrediente.quantidade_total * custoUnitario).toFixed(2)}
                            </span>
                          ) : (
                            `R$ ${ingrediente.preco_compra.toFixed(2)}`
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">
                          {visaoEstoque ? (
                            <span className={`font-semibold ${statusEstoque.textColor}`}>
                              {quantidadeDisplay} {unidadeDisplay}
                            </span>
                          ) : (
                            `${quantidadeDisplay} ${unidadeDisplay}`
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-semibold text-green-600">
                          {formatarCustoUnitario(custoUnitario, ingrediente.unidade)} /{' '}
                          {ingrediente.unidade}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => loadHistorico(ingrediente.id, ingrediente.nome)}
                            className="text-purple-600 hover:text-purple-900 transition-colors"
                            title="Ver histórico de compras"
                          >
                            <History className="h-5 w-5" />
                          </button>
                          <button
                            onClick={() => handleEdit(ingrediente)}
                            className="text-blue-600 hover:text-blue-900 transition-colors"
                            title="Editar ingrediente"
                          >
                            <Edit2 className="h-5 w-5" />
                          </button>
                          <button
                            onClick={() => handleDelete(ingrediente.id)}
                            className="text-red-600 hover:text-red-900 transition-colors"
                            title="Excluir ingrediente"
                          >
                            <Trash2 className="h-5 w-5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
            </div>

            {/* Versão Mobile (Cards) */}
            <div className="md:hidden space-y-4 p-4">
              {ingredientesFiltrados.map((ingrediente) => {
                const custoUnitario = calcularCustoUnitario(
                  ingrediente.preco_compra,
                  ingrediente.quantidade_total
                )
                const unidadeDisplay = getUnidadeDisplay(ingrediente)
                const quantidadeDisplay = getQuantidadeDisplay(ingrediente)
                const isSelected = selectedIds.includes(ingrediente.id)
                const isProducaoPropria = ingrediente.tipo_origem === 'producao_propria'
                const statusEstoque = getStatusEstoque(
                  ingrediente.quantidade_total,
                  (ingrediente as any).estoque_minimo || 0
                )

                return (
                  <div
                    key={ingrediente.id}
                    className={`rounded-lg border-2 p-4 ${
                      isSelected ? 'border-blue-400 bg-blue-50' : 
                      isProducaoPropria ? 'border-green-300 bg-green-50' : 
                      'border-gray-200 bg-white'
                    }`}
                  >
                    {/* Header do Card */}
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-start gap-3 flex-1">
                        <input
                          type="checkbox"
                          checked={isSelected}
                          onChange={() => handleToggleSelect(ingrediente.id)}
                          className="mt-1 w-5 h-5 text-blue-600 rounded focus:ring-2 focus:ring-blue-500 cursor-pointer"
                        />
                        <div className="flex-1">
                          <h3 className="text-base font-semibold text-gray-900 mb-2">{ingrediente.nome}</h3>
                          <div className="flex flex-wrap gap-2">
                            <span className={`inline-flex items-center px-2 py-1 rounded text-xs font-medium border ${statusEstoque.cor}`}>
                              {statusEstoque.texto}
                            </span>
                            {isProducaoPropria && (
                              <span className="inline-flex items-center px-2 py-1 rounded text-xs font-medium bg-green-100 text-green-800">
                                Produção Própria
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Informações */}
                    <div className="space-y-2 mb-3 text-sm">
                      <div className="flex justify-between">
                        <span className="text-gray-600">{visaoEstoque ? 'Valor em Estoque:' : 'Preço:'}</span>
                        {visaoEstoque ? (
                          <span className="font-semibold text-blue-600">
                            R$ {(ingrediente.quantidade_total * custoUnitario).toFixed(2)}
                          </span>
                        ) : (
                          <span className="font-medium text-gray-900">R$ {ingrediente.preco_compra.toFixed(2)}</span>
                        )}
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">{visaoEstoque ? 'Qtd. em Estoque:' : 'Quantidade:'}</span>
                        {visaoEstoque ? (
                          <span className={`font-semibold ${statusEstoque.textColor}`}>
                            {quantidadeDisplay} {unidadeDisplay}
                          </span>
                        ) : (
                          <span className="font-medium text-gray-900">{quantidadeDisplay} {unidadeDisplay}</span>
                        )}
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Custo Unitário:</span>
                        <span className="font-semibold text-green-600">
                          {formatarCustoUnitario(custoUnitario, ingrediente.unidade)} / {ingrediente.unidade}
                        </span>
                      </div>
                      {isProducaoPropria && ingrediente.unidade_producao && (
                        <div className="flex justify-between">
                          <span className="text-gray-600">Produção:</span>
                          <span className="text-sm text-gray-700">
                            {ingrediente.quantidade_por_receita} {ingrediente.unidade_producao}
                          </span>
                        </div>
                      )}
                    </div>

                    {/* Botões de Ação */}
                    <div className="flex items-center gap-2 pt-3 border-t border-gray-200">
                      <button
                        onClick={() => loadHistorico(ingrediente.id, ingrediente.nome)}
                        className="flex-1 flex items-center justify-center gap-2 px-3 py-2 bg-purple-100 hover:bg-purple-200 text-purple-700 text-sm font-medium rounded-md transition-colors"
                        title="Ver histórico"
                      >
                        <History className="h-4 w-4" />
                        Histórico
                      </button>
                      <button
                        onClick={() => handleEdit(ingrediente)}
                        className="flex-1 flex items-center justify-center gap-2 px-3 py-2 bg-blue-100 hover:bg-blue-200 text-blue-700 text-sm font-medium rounded-md transition-colors"
                        title="Editar"
                      >
                        <Edit2 className="h-4 w-4" />
                        Editar
                      </button>
                      <button
                        onClick={() => handleDelete(ingrediente.id)}
                        className="px-3 py-2 bg-red-100 hover:bg-red-200 text-red-700 rounded-md transition-colors"
                        title="Excluir"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                )
              })}
            </div>
          </>
        )}
      </div>

      {/* Modal de Duplicata */}
      {duplicateModal.show && duplicateModal.existing && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full p-6">
            <h3 className="text-xl font-bold mb-4 text-gray-800">
              Ingrediente Já Cadastrado
            </h3>
            
            <p className="text-gray-600 mb-4">
              O ingrediente <strong>{duplicateModal.existing.nome}</strong> já existe. O que deseja fazer?
            </p>

            <div className="grid grid-cols-2 gap-4 mb-6">
              <div className="bg-blue-50 p-4 rounded-lg">
                <h4 className="font-semibold text-blue-900 mb-2">Valores Existentes</h4>
                <p className="text-sm text-gray-700">
                  Preço: R$ {duplicateModal.existing.preco_compra.toFixed(2)}
                </p>
                <p className="text-sm text-gray-700">
                  Quantidade: {duplicateModal.existing.quantidade_total} {duplicateModal.existing.unidade}
                </p>
              </div>

              <div className="bg-green-50 p-4 rounded-lg">
                <h4 className="font-semibold text-green-900 mb-2">Novos Valores</h4>
                <p className="text-sm text-gray-700">
                  Preço: R$ {duplicateModal.new.preco.toFixed(2)}
                </p>
                <p className="text-sm text-gray-700">
                  Quantidade: {duplicateModal.new.quantidade} {duplicateModal.new.unidade}
                </p>
              </div>
            </div>

            <div className="space-y-3">
              <button
                onClick={handleUpdateWithAverage}
                disabled={saving}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 px-4 rounded-md transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Somar Valores e Quantidades (Atualizar Estoque)
              </button>

              <button
                onClick={handleReplace}
                disabled={saving}
                className="w-full bg-orange-600 hover:bg-orange-700 text-white font-medium py-3 px-4 rounded-md transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Substituir pelos Novos Valores
              </button>

              <button
                onClick={() => setDuplicateModal({ show: false, existing: null, new: { nome: '', preco: 0, quantidade: 0, unidade: 'g' } })}
                disabled={saving}
                className="w-full bg-gray-600 hover:bg-gray-700 text-white font-medium py-3 px-4 rounded-md transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Cancelar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal de Histórico */}
      {historicoModal.show && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-hidden flex flex-col">
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
                    <History className="h-6 w-6 text-purple-600" />
                    Histórico de Compras
                  </h3>
                  <p className="text-gray-600 mt-1">{historicoModal.nomeIngrediente}</p>
                </div>
                <button
                  onClick={() => setHistoricoModal({ show: false, ingredienteId: null, nomeIngrediente: '', historico: [], totalGasto: 0 })}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <X className="h-6 w-6" />
                </button>
              </div>
              
              <div className="mt-4 grid grid-cols-3 gap-4">
                <div className="bg-purple-50 p-4 rounded-lg">
                  <p className="text-sm text-purple-600 font-medium">Total de Compras</p>
                  <p className="text-2xl font-bold text-purple-900">{historicoModal.historico.length}</p>
                </div>
                <div className="bg-green-50 p-4 rounded-lg">
                  <p className="text-sm text-green-600 font-medium">Total Gasto</p>
                  <p className="text-2xl font-bold text-green-900">R$ {historicoModal.totalGasto.toFixed(2)}</p>
                </div>
                <div className="bg-blue-50 p-4 rounded-lg">
                  <p className="text-sm text-blue-600 font-medium">Preço Médio / {historicoModal.historico[0]?.unidade || 'un'}</p>
                  <p className="text-2xl font-bold text-blue-900">
                    {(() => {
                      if (historicoModal.historico.length === 0) return 'R$ 0.00'
                      const totalQuantidade = historicoModal.historico.reduce((sum, item) => sum + item.quantidade_comprada, 0)
                      const precoMedio = totalQuantidade > 0 ? historicoModal.totalGasto / totalQuantidade : 0
                      return precoMedio < 0.01 ? `R$ ${precoMedio.toFixed(4)}` : `R$ ${precoMedio.toFixed(2)}`
                    })()}
                  </p>
                </div>
              </div>
            </div>

            <div className="flex-1 overflow-y-auto p-6">
              {historicoModal.historico.length === 0 ? (
                <div className="text-center py-12 text-gray-500">
                  <History className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                  <p>Nenhuma compra registrada ainda</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {historicoModal.historico.map((compra) => (
                    <div key={compra.id} className="bg-gray-50 rounded-lg p-4 hover:bg-gray-100 transition-colors">
                      <div className="flex items-center justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-4">
                            <div>
                              <p className="text-sm text-gray-500">
                                {new Date(compra.data_compra).toLocaleDateString('pt-BR', {
                                  day: '2-digit',
                                  month: '2-digit',
                                  year: 'numeric',
                                  hour: '2-digit',
                                  minute: '2-digit',
                                })}
                              </p>
                            </div>
                            <div className="flex-1">
                              <p className="font-medium text-gray-900">
                                {compra.quantidade_comprada} {compra.unidade}
                              </p>
                              <p className="text-sm text-gray-600">
                                R$ {compra.preco_compra.toFixed(2)}
                              </p>
                            </div>
                            <div className="text-right">
                              <p className="text-lg font-bold text-green-600">
                                R$ {compra.valor_total.toFixed(2)}
                              </p>
                              <p className="text-xs text-gray-500">Valor total</p>
                            </div>
                          </div>
                          {compra.observacao && (
                            <p className="text-sm text-gray-600 mt-2 italic">{compra.observacao}</p>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="p-6 border-t border-gray-200 bg-gray-50">
              <button
                onClick={() => setHistoricoModal({ show: false, ingredienteId: null, nomeIngrediente: '', historico: [], totalGasto: 0 })}
                className="w-full bg-gray-600 hover:bg-gray-700 text-white font-medium py-3 px-4 rounded-md transition-colors"
              >
                Fechar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal de Importação CSV */}
      {csvModal.show && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-6xl w-full max-h-[90vh] overflow-hidden flex flex-col">
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
                    <FileText className="h-6 w-6 text-purple-600" />
                    Preview da Importação CSV
                  </h3>
                  <p className="text-gray-600 mt-1">
                    {csvModal.data.length} itens encontrados
                  </p>
                </div>
                <button
                  onClick={() => setCsvModal({ show: false, data: [], processing: false, importStrategy: 'skip' })}
                  className="text-gray-400 hover:text-gray-600"
                  disabled={csvModal.processing}
                >
                  <X className="h-6 w-6" />
                </button>
              </div>

              {/* Alerta de Encoding */}
              {csvModal.data.some(r => r.erro?.includes('encoding') || r.erro?.includes('corrompidos')) && (
                <div className="mt-4 p-4 bg-orange-50 border border-orange-200 rounded-lg">
                  <div className="flex items-start gap-3">
                    <AlertCircle className="h-5 w-5 text-orange-600 mt-0.5 flex-shrink-0" />
                    <div>
                      <h4 className="font-semibold text-orange-900 mb-1">
                        Problema de Encoding Detectado
                      </h4>
                      <p className="text-sm text-orange-800 mb-2">
                        Seu arquivo CSV contém caracteres especiais corrompidos (acentos, ç, etc).
                      </p>
                      <details className="text-sm text-orange-700">
                        <summary className="cursor-pointer font-medium mb-1">Como corrigir:</summary>
                        <ol className="list-decimal ml-4 space-y-1 mt-2">
                          <li>Abra o arquivo no <strong>Bloco de Notas</strong> (Windows) ou <strong>TextEdit</strong> (Mac)</li>
                          <li>Clique em <strong>Arquivo &gt; Salvar Como</strong></li>
                          <li>Na opção de <strong>Codificação</strong>, selecione <strong>UTF-8</strong></li>
                          <li>Salve e importe novamente</li>
                        </ol>
                        <p className="mt-2 text-xs italic">
                          Alternativa: Use o Excel e ao salvar escolha &quot;CSV UTF-8 (separado por vírgulas)&quot;
                        </p>
                      </details>
                    </div>
                  </div>
                </div>
              )}

              {/* Estatísticas */}
              <div className="mt-4 grid grid-cols-3 gap-4">
                <div className="bg-green-50 p-3 rounded-lg">
                  <p className="text-sm text-green-600 font-medium">Novos</p>
                  <p className="text-2xl font-bold text-green-900">
                    {csvModal.data.filter(r => r.status === 'novo').length}
                  </p>
                </div>
                <div className="bg-yellow-50 p-3 rounded-lg">
                  <p className="text-sm text-yellow-600 font-medium">Duplicados</p>
                  <p className="text-2xl font-bold text-yellow-900">
                    {csvModal.data.filter(r => r.status === 'duplicado').length}
                  </p>
                </div>
                <div className="bg-red-50 p-3 rounded-lg">
                  <p className="text-sm text-red-600 font-medium">Erros</p>
                  <p className="text-2xl font-bold text-red-900">
                    {csvModal.data.filter(r => r.status === 'erro').length}
                  </p>
                </div>
              </div>

              {/* Estratégia para Duplicados */}
              {csvModal.data.some(r => r.status === 'duplicado') && (
                <div className="mt-4 p-4 bg-yellow-50 border-2 border-yellow-300 rounded-lg">
                  <div className="flex items-start gap-2 mb-3">
                    <AlertCircle className="h-5 w-5 text-yellow-600 mt-0.5 flex-shrink-0" />
                    <div>
                      <p className="font-bold text-yellow-900 mb-1">
                        ⚠️ {csvModal.data.filter(r => r.status === 'duplicado').length} item(ns) duplicado(s) encontrado(s)!
                      </p>
                      <p className="text-sm text-yellow-800 mb-3">
                        Estes itens já existem no seu estoque. Escolha como proceder:
                      </p>
                    </div>
                  </div>
                  <div className="space-y-3 ml-7">
                    <label className="flex items-start gap-3 cursor-pointer p-3 bg-white rounded-md hover:bg-yellow-50 border border-yellow-200">
                      <input
                        type="radio"
                        name="strategy"
                        value="skip"
                        checked={csvModal.importStrategy === 'skip'}
                        onChange={(e) => setCsvModal({ ...csvModal, importStrategy: e.target.value as any })}
                        className="w-4 h-4 mt-1 flex-shrink-0"
                      />
                      <div>
                        <p className="font-semibold text-gray-900">Pular (Não Importar)</p>
                        <p className="text-sm text-gray-600">
                          Mantém os valores existentes no estoque. Os duplicados do CSV serão ignorados.
                        </p>
                      </div>
                    </label>
                    <label className="flex items-start gap-3 cursor-pointer p-3 bg-white rounded-md hover:bg-yellow-50 border border-yellow-200">
                      <input
                        type="radio"
                        name="strategy"
                        value="replace"
                        checked={csvModal.importStrategy === 'replace'}
                        onChange={(e) => setCsvModal({ ...csvModal, importStrategy: e.target.value as any })}
                        className="w-4 h-4 mt-1 flex-shrink-0"
                      />
                      <div>
                        <p className="font-semibold text-gray-900">Substituir</p>
                        <p className="text-sm text-gray-600">
                          Substitui os valores do estoque pelos valores do CSV. Use para corrigir preços/quantidades.
                        </p>
                      </div>
                    </label>
                    <label className="flex items-start gap-3 cursor-pointer p-3 bg-white rounded-md hover:bg-yellow-50 border border-yellow-200">
                      <input
                        type="radio"
                        name="strategy"
                        value="average"
                        checked={csvModal.importStrategy === 'average'}
                        onChange={(e) => setCsvModal({ ...csvModal, importStrategy: e.target.value as any })}
                        className="w-4 h-4 mt-1 flex-shrink-0"
                      />
                      <div>
                        <p className="font-semibold text-gray-900">Somar (Atualizar Estoque)</p>
                        <p className="text-sm text-gray-600">
                          Soma os valores totais gastos e quantidades. Use para registrar nova compra do mesmo item.
                        </p>
                      </div>
                    </label>
                  </div>
                </div>
              )}
            </div>

            {/* Tabela de Preview */}
            <div className="flex-1 overflow-y-auto p-6">
              <div className="overflow-x-auto">
                <table className="w-full border-collapse">
                  <thead className="bg-gray-50 sticky top-0">
                    <tr>
                      <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase border-b">
                        Status
                      </th>
                      <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase border-b">
                        Nome
                      </th>
                      <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase border-b">
                        Preço
                      </th>
                      <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase border-b">
                        Quantidade
                      </th>
                      <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase border-b">
                        Unidade
                      </th>
                      <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase border-b">
                        Motivo
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {csvModal.data.map((row, index) => (
                      <tr key={index} className={`border-b hover:bg-gray-50 ${row.status === 'erro' ? 'bg-red-50' : ''}`}>
                        <td className="px-4 py-3">
                          {row.status === 'novo' && (
                            <span 
                              className="inline-flex items-center gap-1 px-2 py-1 bg-green-100 text-green-700 text-xs font-medium rounded"
                              title="Este item será adicionado ao estoque"
                            >
                              <CheckCircle className="h-3 w-3" />
                              Novo
                            </span>
                          )}
                          {row.status === 'duplicado' && (
                            <span 
                              className="inline-flex items-center gap-1 px-2 py-1 bg-yellow-100 text-yellow-700 text-xs font-medium rounded"
                              title="Este item já existe no estoque. Escolha uma estratégia abaixo."
                            >
                              <AlertCircle className="h-3 w-3" />
                              Duplicado
                            </span>
                          )}
                          {row.status === 'erro' && (
                            <span 
                              className="inline-flex items-center gap-1 px-2 py-1 bg-red-100 text-red-700 text-xs font-medium rounded cursor-help"
                              title={`Erro: ${row.erro || 'Dados inválidos'}`}
                            >
                              <X className="h-3 w-3" />
                              Erro
                            </span>
                          )}
                        </td>
                        <td className="px-4 py-3 text-sm text-gray-900">{row.nome}</td>
                        <td className="px-4 py-3 text-sm text-gray-900">
                          {isNaN(row.preco_compra) ? (
                            <span className="text-red-600">Inválido</span>
                          ) : (
                            `R$ ${row.preco_compra.toFixed(2)}`
                          )}
                        </td>
                        <td className="px-4 py-3 text-sm text-gray-900">
                          {isNaN(row.quantidade_total) ? (
                            <span className="text-red-600">Inválido</span>
                          ) : (
                            row.quantidade_total
                          )}
                        </td>
                        <td className="px-4 py-3 text-sm text-gray-900">{row.unidade}</td>
                        <td className="px-4 py-3">
                          {row.status === 'erro' && row.erro && (
                            <span className="text-xs text-red-600 font-medium flex items-center gap-1">
                              <AlertCircle className="h-3 w-3" />
                              {row.erro}
                            </span>
                          )}
                          {row.status === 'duplicado' && (
                            <span className="text-xs text-yellow-600">Já existe no estoque</span>
                          )}
                          {row.status === 'novo' && (
                            <span className="text-xs text-green-600">✓ Pronto para importar</span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Botões de Ação */}
            <div className="p-6 border-t border-gray-200 bg-gray-50">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setCsvModal({ show: false, data: [], processing: false, importStrategy: 'skip' })}
                    disabled={csvModal.processing}
                    className="px-6 py-3 bg-gray-600 hover:bg-gray-700 text-white font-medium rounded-md transition-colors disabled:opacity-50"
                  >
                    Cancelar
                  </button>
                  {csvModal.data.some(r => r.status === 'erro') && (
                    <button
                      onClick={() => {
                        const erros = csvModal.data.filter(r => r.status === 'erro')
                        const csv = 'nome,preco_compra,quantidade_total,unidade,erro\n' + 
                          erros.map(e => `"${e.nome}",${e.preco_compra},${e.quantidade_total},${e.unidade},"${e.erro}"`).join('\n')
                        const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
                        const link = document.createElement('a')
                        link.href = URL.createObjectURL(blob)
                        link.download = 'erros_importacao.csv'
                        link.click()
                      }}
                      className="flex items-center gap-2 px-4 py-3 bg-red-100 hover:bg-red-200 text-red-700 font-medium rounded-md transition-colors"
                      title="Baixar lista de erros"
                    >
                      <Download className="h-4 w-4" />
                      Baixar Erros
                    </button>
                  )}
                </div>
                <button
                  onClick={handleImportCSV}
                  disabled={csvModal.processing || csvModal.data.every(r => r.status === 'erro')}
                  className="flex items-center gap-2 px-6 py-3 bg-green-600 hover:bg-green-700 text-white font-medium rounded-md transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {csvModal.processing ? (
                    <>
                      <Loader2 className="h-5 w-5 animate-spin" />
                      Importando...
                    </>
                  ) : (
                    <>
                      <Upload className="h-5 w-5" />
                      Importar {csvModal.data.filter(r => r.status !== 'erro').length} itens
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
