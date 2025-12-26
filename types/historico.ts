// Tipos para Histórico de Compras
export interface HistoricoCompra {
  id: string
  user_id: string
  ingrediente_id: string
  nome_ingrediente: string
  preco_compra: number
  quantidade_comprada: number
  unidade: string
  valor_total: number
  data_compra: string
  observacao?: string
}

export interface ResumoGastos {
  ingrediente_id: string
  nome_ingrediente: string
  total_compras: number
  total_gasto: number
  quantidade_total_comprada: number
  menor_preco: number
  maior_preco: number
  preco_medio: number
  primeira_compra: string
  ultima_compra: string
}

