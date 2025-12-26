# 🔍 Guia Completo: Sistema de Filtros - Receita Fácil

## ✅ Implementação Concluída

---

## 📋 Índice

1. [Visão Geral](#visão-geral)
2. [Componentes Criados](#componentes-criados)
3. [Filtros por Aba](#filtros-por-aba)
4. [Alterações no Banco de Dados](#alterações-no-banco-de-dados)
5. [Como Usar](#como-usar)
6. [Testes](#testes)

---

## 🎯 Visão Geral

Implementamos um **sistema completo de filtros** em 4 abas do Receita Fácil:

- ✅ **Modelos (Receitas)**: Filtros por tipo e nome
- ✅ **Dashboard**: Filtro de período/tempo
- ✅ **Insumos**: Filtros por nome, última compra, valores e quantidade
- ✅ **Vendas (Histórico)**: Filtros por tempo, valor e ticket médio

### Tecnologias Utilizadas:
- **React Hooks**: `useState`, `useEffect` para gerenciamento de estado
- **Supabase**: Queries server-side para filtros de nome e período
- **Client-side filtering**: Para filtros calculados (preço unitário, status de estoque)
- **TypeScript**: Interfaces tipadas para segurança de tipos
- **Tailwind CSS**: Estilização responsiva e moderna

---

## 🧩 Componentes Criados

### 1. `components/FiltroGenerico.tsx`

Componente principal que envolve todos os filtros:

```tsx
<FiltroGenerico titulo="Filtrar Modelos" onLimpar={handleLimparFiltros}>
  {/* Conteúdo dos filtros */}
</FiltroGenerico>
```

**Sub-componentes exportados:**

#### `InputFiltro`
Campo de texto com ícone opcional:
```tsx
<InputFiltro
  label="Buscar por Nome"
  placeholder="Digite o nome..."
  value={filtroNome}
  onChange={setFiltroNome}
  icon={<Search className="h-4 w-4" />}
/>
```

#### `SelectFiltro`
Dropdown para seleção de opções:
```tsx
<SelectFiltro
  label="Tipo de Produto"
  value={filtroTipo}
  onChange={setFiltroTipo}
  options={[
    { value: 'Bolo', label: 'Bolo' },
    { value: 'Doce', label: 'Doce' },
  ]}
  placeholder="Todos os tipos"
/>
```

#### `RangeFiltro`
Dois inputs para valores mínimo e máximo:
```tsx
<RangeFiltro
  label="Preço Unitário (R$)"
  valueMin={precoMin}
  valueMax={precoMax}
  onChangeMin={setPrecoMin}
  onChangeMax={setPrecoMax}
  type="number"
/>
```

#### `PeriodoFiltro`
Filtro de datas com presets (Hoje, Últimos 7 Dias, etc):
```tsx
<PeriodoFiltro
  dataInicio={dataInicio}
  dataFim={dataFim}
  onChangeInicio={setDataInicio}
  onChangeFim={setDataFim}
  onPresetChange={handlePresetPeriodo}
/>
```

### 2. `lib/filtros-utils.ts`

Funções utilitárias para filtros:

```typescript
// Calcular período baseado em preset
calcularPeriodo(preset: string): { inicio: string, fim: string }

// Verificar se valor está em range
estaNoRange(valor: number, min, max): boolean

// Normalizar nome para busca
normalizarNome(nome: string): string

// Formatar e parsear datas
formatarData(data: string): string
parsearData(data: string): string
```

---

## 🔍 Filtros por Aba

### 1️⃣ Modelos (Receitas)

**Arquivo:** `app/receitas/page.tsx`

**Filtros Disponíveis:**
- 🔍 **Nome**: Busca por nome do modelo (server-side com `ilike`)
- 📦 **Tipo**: Filtro por tipo de produto (Bolo, Doce, Salgado, etc)

**Implementação:**
```tsx
// Estados
const [filtroNome, setFiltroNome] = useState('')
const [filtroTipo, setFiltroTipo] = useState('')

// Query no Supabase
let query = supabase.from('receitas').select('*').eq('user_id', user.id)
if (filtroTipo) query = query.eq('tipo', filtroTipo)
if (filtroNome) query = query.ilike('nome', `%${filtroNome}%`)
```

**Funcionalidades Extras:**
- Autocomplete de tipos baseado em receitas existentes
- Contador de resultados filtrados
- Botão "Limpar Filtros"

---

### 2️⃣ Dashboard

**Arquivo:** `app/page.tsx`

**Filtros Disponíveis:**
- 📅 **Período**: Data início e fim com presets (Hoje, Últimos 7 dias, Este Mês, etc)

**Implementação:**
```tsx
// Estados
const [dataInicio, setDataInicio] = useState(primeiroDiaMes)
const [dataFim, setDataFim] = useState(hoje)

// Query no Supabase
const { data: vendas } = await supabase
  .from('vendas')
  .select('*')
  .eq('user_id', user.id)
  .gte('data_venda', `${dataInicio}T00:00:00`)
  .lte('data_venda', `${dataFim}T23:59:59`)
```

**Funcionalidades Extras:**
- Estatísticas atualizadas em tempo real
- Presets rápidos de período
- Formatação de período exibida no título

---

### 3️⃣ Insumos

**Arquivo:** `app/ingredientes/page.tsx`

**Filtros Disponíveis:**
- 🔍 **Nome**: Busca por nome do insumo (server-side)
- 📊 **Status de Estoque**: OK, Baixo, Sem Estoque
- 💰 **Preço Unitário**: Range de valores (R$ min - max)
- 📦 **Quantidade**: Range de quantidade em estoque
- 📅 **Última Compra**: Período de cadastro/compra

**Implementação:**
```tsx
// Estados
const [filtroNome, setFiltroNome] = useState('')
const [filtroEstoque, setFiltroEstoque] = useState('') // 'ok', 'baixo', 'sem'
const [filtroPrecoMin, setFiltroPrecoMin] = useState('')
const [filtroPrecoMax, setFiltroPrecoMax] = useState('')
const [filtroQtdMin, setFiltroQtdMin] = useState('')
const [filtroQtdMax, setFiltroQtdMax] = useState('')
const [filtroDataCompraInicio, setFiltroDataCompraInicio] = useState('')
const [filtroDataCompraFim, setFiltroDataCompraFim] = useState('')

// Filtro server-side (nome)
let query = supabase.from('ingredientes').select('*')
if (filtroNome) query = query.ilike('nome', `%${filtroNome}%`)

// Filtro client-side (valores calculados)
const ingredientesFiltrados = ingredientes.filter(ing => {
  const precoUnitario = ing.preco_compra / ing.quantidade_total
  if (!estaNoRange(precoUnitario, filtroPrecoMin, filtroPrecoMax)) return false
  if (!estaNoRange(ing.quantidade_total, filtroQtdMin, filtroQtdMax)) return false
  
  // Status de estoque
  if (filtroEstoque) {
    const qtd = ing.quantidade_total || 0
    const min = ing.estoque_minimo || 0
    if (filtroEstoque === 'sem' && qtd > 0) return false
    if (filtroEstoque === 'baixo' && (qtd <= 0 || qtd > min)) return false
    if (filtroEstoque === 'ok' && qtd <= min) return false
  }
  
  return true
})
```

**Funcionalidades Extras:**
- Grid responsivo de filtros (3 colunas no desktop, 1 no mobile)
- Contador "Mostrando X de Y insumos"
- Integração com toggle de "Visão Compra" vs "Visão Estoque"

---

### 4️⃣ Vendas (Histórico)

**Arquivo:** `app/vendas/historico/page.tsx`

**Filtros Disponíveis:**
- 📅 **Período**: Data início e fim com presets
- 💵 **Valor da Venda**: Range de valores totais (R$ min - max)
- 🎫 **Ticket Médio**: Range de ticket médio por venda

**Implementação:**
```tsx
// Estados
const [dataInicio, setDataInicio] = useState(primeiroDiaMes)
const [dataFim, setDataFim] = useState(hoje)
const [valorMin, setValorMin] = useState('')
const [valorMax, setValorMax] = useState('')
const [ticketMin, setTicketMin] = useState('')
const [ticketMax, setTicketMax] = useState('')

// Filtro server-side (período)
let query = supabase
  .from('vendas')
  .select('*')
  .gte('data_venda', `${dataInicio}T00:00:00`)
  .lte('data_venda', `${dataFim}T23:59:59`)

// Filtro client-side (valores)
const vendasFiltradas = vendas.filter(venda => {
  if (!estaNoRange(venda.valor_total, valorMin, valorMax)) return false
  if (ticketMin || ticketMax) {
    if (!estaNoRange(venda.valor_total, ticketMin, ticketMax)) return false
  }
  return true
})
```

**Funcionalidades Extras:**
- Estatísticas recalculadas (Total Vendas, Faturamento, Lucro, Ticket Médio)
- Contador de vendas filtradas
- Integração com detalhes de venda expandíveis

---

## 💾 Alterações no Banco de Dados

### 1. Nova Coluna: `receitas.tipo`

**Arquivo SQL:** `SQL_ADD_TIPO_RECEITAS.sql`

```sql
-- Adicionar coluna tipo
ALTER TABLE receitas 
ADD COLUMN IF NOT EXISTS tipo VARCHAR(255) DEFAULT NULL;

-- Criar índice para performance
CREATE INDEX IF NOT EXISTS idx_receitas_tipo ON receitas(tipo);

-- Notificar PostgREST
NOTIFY pgrst, 'reload schema';
```

**Como executar:**
1. Acesse Supabase Dashboard
2. Vá para SQL Editor
3. Cole e execute o script `SQL_ADD_TIPO_RECEITAS.sql`
4. Verifique se a coluna foi adicionada com sucesso

### 2. Coluna Existente: `ingredientes.estoque_minimo`

Esta coluna já foi adicionada em versões anteriores. Caso não exista, execute:

```sql
ALTER TABLE ingredientes 
ADD COLUMN IF NOT EXISTS estoque_minimo DECIMAL(10,2) DEFAULT 0;
```

### 3. Interfaces TypeScript Atualizadas

**`types/database.ts`:**

```typescript
export interface Receita {
  // ... campos existentes
  tipo?: string | null // NOVO
  quantidade_em_estoque?: number // Adicionado
  estoque_minimo_produtos?: number // Adicionado
  ativo?: boolean // Adicionado
}

export interface Ingrediente {
  // ... campos existentes
  estoque_minimo?: number // Adicionado
}
```

---

## 📖 Como Usar

### Para o Usuário Final:

#### 1. Filtrar Modelos por Tipo:
1. Acesse **Modelos** no menu
2. No card de "Filtrar Modelos":
   - Digite o nome no campo "Buscar por Nome"
   - Selecione um tipo no dropdown
3. A lista atualiza automaticamente
4. Clique em "Limpar" para remover filtros

#### 2. Filtrar Dashboard por Período:
1. Acesse **Dashboard**
2. No card "Filtrar Período":
   - Escolha um preset rápido (ex: "Últimos 30 Dias")
   - Ou selecione datas específicas
3. Estatísticas atualizam automaticamente
4. O título mostra o período selecionado

#### 3. Filtrar Insumos:
1. Acesse **Insumos**
2. No card "Filtrar Insumos":
   - **Nome**: Digite para buscar
   - **Status**: Selecione OK/Baixo/Sem Estoque
   - **Preço**: Defina range de preço unitário
   - **Quantidade**: Defina range de estoque
   - **Última Compra**: Selecione período
3. Contador mostra "Mostrando X de Y insumos"

#### 4. Filtrar Vendas:
1. Acesse **Vendas** → **Ver Histórico**
2. No card "Filtrar Vendas":
   - **Período**: Escolha preset ou datas
   - **Valor da Venda**: Defina range (ex: R$ 50 - R$ 200)
   - **Ticket Médio**: Defina range
3. Estatísticas recalculam automaticamente

---

## 🧪 Testes

### Checklist de Testes:

#### Modelos:
- [ ] Filtrar por nome encontra resultados corretos
- [ ] Filtrar por tipo mostra apenas receitas daquele tipo
- [ ] Limpar filtros restaura lista completa
- [ ] Autocomplete de tipos sugere tipos existentes
- [ ] Contador de resultados está correto

#### Dashboard:
- [ ] Preset "Hoje" mostra apenas vendas de hoje
- [ ] Preset "Últimos 7 Dias" mostra últimos 7 dias
- [ ] Período personalizado funciona corretamente
- [ ] Estatísticas recalculam corretamente
- [ ] Título mostra período formatado em português

#### Insumos:
- [ ] Filtro de nome busca corretamente (case-insensitive)
- [ ] Filtro de status "Baixo" mostra apenas itens abaixo do mínimo
- [ ] Filtro de status "Sem" mostra apenas com quantidade zero
- [ ] Range de preço filtra corretamente
- [ ] Range de quantidade filtra corretamente
- [ ] Período de última compra funciona
- [ ] Contador "Mostrando X de Y" está correto
- [ ] Integração com toggle "Visão Compra/Estoque" mantém filtros

#### Vendas:
- [ ] Período filtra vendas corretamente
- [ ] Range de valor filtra corretamente
- [ ] Range de ticket médio filtra corretamente
- [ ] Estatísticas (Total, Faturamento, Lucro, Ticket) recalculam
- [ ] Contador de vendas está correto
- [ ] Expandir detalhes de venda funciona com filtros ativos

---

## 📊 Performance

### Server-Side Filtering (Rápido):
- ✅ Filtro de **nome** em Modelos e Insumos
- ✅ Filtro de **período** em Dashboard e Vendas
- ✅ Usa índices do Supabase para performance

### Client-Side Filtering (Aceitável):
- ⚠️ Filtros de **preço unitário** (calculado)
- ⚠️ Filtros de **status de estoque** (calculado)
- ⚠️ Filtros de **valor** e **ticket médio** em Vendas

**Nota:** Para listas muito grandes (>1000 itens), considere mover filtros calculados para o servidor usando Supabase Functions/Views.

---

## 🚀 Próximos Passos (Opcional)

### Melhorias Futuras:

1. **Salvar Filtros Favoritos**:
   - Permitir que usuário salve combinações de filtros
   - Dropdown "Filtros Salvos" para aplicar rapidamente

2. **Exportar Dados Filtrados**:
   - Botão "Exportar CSV" com dados filtrados
   - Útil para relatórios e análises externas

3. **Filtros Avançados**:
   - Combinar múltiplos tipos em Modelos (ex: "Bolo OR Doce")
   - Filtros por margem de lucro
   - Filtros por data de criação/última atualização

4. **Performance**:
   - Criar Views no Supabase para filtros calculados
   - Adicionar paginação para listas muito grandes
   - Debounce em campos de texto para reduzir queries

5. **UX**:
   - Indicador visual de filtros ativos (badge na navbar)
   - Shortcuts de teclado para aplicar/limpar filtros
   - Animação suave ao aplicar filtros

---

## 📝 Resumo de Arquivos Criados/Modificados

### Novos Arquivos:
- ✅ `components/FiltroGenerico.tsx`
- ✅ `lib/filtros-utils.ts`
- ✅ `SQL_ADD_TIPO_RECEITAS.sql`
- ✅ `GUIA_COMPLETO_FILTROS.md` (este arquivo)

### Arquivos Modificados:
- ✅ `types/database.ts` - Adicionado `tipo`, `estoque_minimo`, etc
- ✅ `app/receitas/page.tsx` - Filtros de tipo e nome
- ✅ `app/page.tsx` (Dashboard) - Filtro de período
- ✅ `app/ingredientes/page.tsx` - Filtros múltiplos
- ✅ `app/vendas/historico/page.tsx` - Filtros de vendas

---

## ✅ Status Final

| Tarefa | Status |
|--------|--------|
| Componente Genérico | ✅ Concluído |
| Utils de Filtros | ✅ Concluído |
| SQL: Coluna 'tipo' | ✅ Concluído |
| TypeScript Interfaces | ✅ Concluído |
| Filtros em Modelos | ✅ Concluído |
| Filtros no Dashboard | ✅ Concluído |
| Filtros em Insumos | ✅ Concluído |
| Filtros em Vendas | ✅ Concluído |
| Documentação | ✅ Concluído |
| **Testes pelo Usuário** | ⏳ Pendente |

---

**Última Atualização:** Dezembro 2024  
**Desenvolvido para:** Receita Fácil - Micro SaaS de Gestão Culinária  
**Tecnologias:** Next.js, TypeScript, Supabase, Tailwind CSS

