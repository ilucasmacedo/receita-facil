// types/vendas.ts - Tipos para o sistema de vendas

export interface Venda {
  id: string
  user_id: string
  data_venda: string
  valor_total: number
  custo_total: number
  lucro_total: number
  cliente_nome?: string
  observacoes?: string
  status: 'concluida' | 'cancelada' | 'pendente'
  created_at?: string
}

export interface ItemVenda {
  id: string
  venda_id: string
  receita_id: string
  quantidade: number
  preco_unitario: number
  custo_unitario: number
  subtotal: number
  lucro: number
  created_at?: string
}

export interface ItemVendaComReceita extends ItemVenda {
  receitas: {
    nome: string
    custo_total?: number
    preco_venda?: number
    foto_url?: string
  }
}

export interface HistoricoEstoque {
  id: string
  user_id: string
  ingrediente_id: string
  tipo_movimentacao: 'entrada_compra' | 'saida_venda' | 'ajuste_manual'
  quantidade: number
  quantidade_anterior?: number | null
  quantidade_nova?: number | null
  venda_id?: string
  observacao?: string
  data_movimentacao: string
}

export interface VendaDetalhada extends Venda {
  total_itens: number
  itens: Array<{
    receita_nome: string
    quantidade: number
    preco_unitario: number
    subtotal: number
    lucro: number
  }>
}

export interface ItemCarrinho {
  receita_id: string
  receita_nome: string
  receita_foto?: string
  quantidade: number
  preco_unitario: number
  custo_unitario: number
}

