// Tipos para Ingredientes
export interface Ingrediente {
  id: string
  user_id: string
  nome: string
  preco_compra: number
  quantidade_total: number
  unidade: 'g' | 'kg' | 'ml' | 'L' | 'un'
  tipo_origem?: 'comprado' | 'producao_propria'
  receita_origem_id?: string | null
  unidade_producao?: string | null
  quantidade_por_receita?: number | null
  estoque_minimo?: number
  created_at?: string
}

// Tipos para Receitas
export interface Receita {
  id: string
  user_id: string
  nome: string
  tipo?: string | null // Tipo de produto (Bolo, Doce, Salgado, etc)
  foto_url?: string
  descricao?: string
  rendimento_porcoes: number
  tempo_preparo_minutos?: number
  margem_lucro_desejada: number
  custo_total?: number
  preco_venda?: number
  requer_atualizacao?: boolean
  ultima_atualizacao_custos?: string
  quantidade_em_estoque?: number
  estoque_minimo_produtos?: number
  ativo?: boolean
  data_desativacao?: string | null
  motivo_desativacao?: string | null
  created_at?: string
}

// Tipos para Itens de Receita (tabela intermediária)
export interface ItemReceita {
  id: string
  receita_id: string
  ingrediente_id: string
  quantidade_usada: number
  unidade?: string
}

// Tipo auxiliar para exibir item com dados do ingrediente
export interface ItemReceitaComIngrediente extends ItemReceita {
  ingrediente?: Ingrediente
  custo_item?: number
}

