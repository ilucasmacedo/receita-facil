# 🎯 NOVA LÓGICA: INSUMOS → PRODUÇÃO → VENDA

## ✅ **SISTEMA COMPLETAMENTE REESTRUTURADO!**

Implementei **EXATAMENTE** o que você pediu! Agora temos 3 etapas distintas e claras:

---

## 📚 **Dicionário do App (Nova Nomenclatura)**

| Nome Antigo | Nome Novo | O Que É |
|-------------|-----------|---------|
| ❌ Ingredientes | ✅ **🧺 Insumos** | **Tudo que você compra** (farinha, embalagem, etc) |
| ❌ Receitas | ✅ **📋 Modelos** | **Como fazer** (fórmula/ficha técnica, não é estoque) |
| ❌ *(não existia)* | ✅ **🏭 Produção** | **Registrar fabricação** (transforma insumos em produtos) |
| ❌ *(não existia)* | ✅ **📦 Produtos** | **Estoque de produtos prontos** (o que está na vitrine) |
| ✅ Vendas | ✅ **💰 Vendas** | **Vender produtos prontos** (deduz apenas do estoque de produtos) |

---

## 🔄 **O Fluxo Completo (Visual)**

```
┌─────────────────────────────────────────────────────────┐
│  1️⃣ COMPRA                                              │
│  Você compra Farinha (1kg) e Caixinha (10un)          │
│  ↓                                                      │
│  🧺 ESTOQUE DE INSUMOS                                  │
│  Farinha: 1000g                                        │
│  Caixinha: 10un                                        │
└─────────────────────────────────────────────────────────┘
                    ↓
┌─────────────────────────────────────────────────────────┐
│  2️⃣ PRODUÇÃO                                            │
│  Você clica: "Produzir 5 Bolos"                       │
│  Sistema verifica se tem insumos suficientes           │
│  ↓                                                      │
│  ✅ TEM! Deduz insumos:                                 │
│  Farinha: 1000g → 500g (-500g)                         │
│  Caixinha: 10un → 5un (-5un)                          │
│  ↓                                                      │
│  ✅ Adiciona ao estoque de produtos:                    │
│  📦 PRODUTOS PRONTOS: 5 Bolos                           │
└─────────────────────────────────────────────────────────┘
                    ↓
┌─────────────────────────────────────────────────────────┐
│  3️⃣ VENDA                                               │
│  Cliente compra 2 Bolos                                │
│  ↓                                                      │
│  ✅ Deduz APENAS de produtos prontos:                   │
│  📦 PRODUTOS PRONTOS: 5 → 3 bolos                       │
│  💰 Registra venda de R$ 40,00                          │
│  📊 Lucro: R$ 24,00                                     │
└─────────────────────────────────────────────────────────┘
```

---

## 📱 **Nova Estrutura de Menus**

### Antes (Confuso):
```
Ingredientes  Receitas  Vendas  Estoque
```

### Agora (Claro):
```
Dashboard
🧺 Insumos     ← Tudo que você compra
📋 Modelos     ← Como fazer (fórmula)
🏭 Produção    ← Transformar insumos em produtos
📦 Produtos    ← Estoque de produtos prontos
💰 Vendas      ← Vender produtos prontos
```

---

## 🗂️ **Estrutura do Banco de Dados**

### Tabelas:

1. **`ingredientes`** (agora "INSUMOS" na interface)
   - O que você compra da rua
   - `quantidade_total` = Estoque de matéria-prima
   - `estoque_minimo` = Alerta de recompra

2. **`receitas`** (agora "MODELOS" na interface)
   - Fórmulas/fichas técnicas
   - `quantidade_em_estoque` ← **NOVO!** = Produtos prontos
   - `estoque_minimo_produtos` ← **NOVO!** = Alerta de produção

3. **`itens_receita`**
   - Lista de insumos de cada modelo
   - Ex: Bolo usa 500g farinha + 1 caixinha

4. **`producoes`** ← **NOVA!**
   - Registro de quando você fabricou
   - quantidade_produzida, custo_total_producao, data

5. **`vendas`**
   - Registro de vendas
   - Agora deduz APENAS de `receitas.quantidade_em_estoque`

6. **`historico_estoque`**
   - `tipo_movimentacao`: 
     - `entrada_compra` ← Quando compra insumos
     - `saida_producao` ← Quando produz (deduz insumos)
     - `saida_venda` ← **REMOVIDO** (não deduz mais insumos direto)

---

## 🚀 **Como Usar o Novo Sistema**

### **1️⃣ Cadastrar Insumos** (`/ingredientes`)

Cadastre TUDO que você compra:

```
Farinha - 1kg - R$ 10,00 - Estoque Mín: 100g
Açúcar - 1kg - R$ 5,00 - Estoque Mín: 100g
Caixinha - 1un - R$ 2,00 - Estoque Mín: 5un
```

### **2️⃣ Criar Modelos** (`/receitas`)

Crie a fórmula (não é estoque!):

```
Bolo de Chocolate
- 500g Farinha
- 300g Açúcar
- 1un Caixinha
Custo: R$ 8,00
Preço Sugerido: R$ 16,00
Estoque Mínimo de Produtos: 5un
```

### **3️⃣ Registrar Produção** (`/producao`) ← **NOVO!**

Você decide fabricar:

```
┌─────────────────────────────────────┐
│ Bolo de Chocolate                   │
├─────────────────────────────────────┤
│ Produtos Prontos: 0 un              │
│ Capacidade: 10 un (com insumos)     │
│                                     │
│ Quantidade: [5] ▼                   │
│ [🏭 Registrar Produção]             │
└─────────────────────────────────────┘
```

**Ao clicar:**
- Sistema verifica insumos
- ✅ TEM: Deduz farinha, açúcar, caixinha
- ✅ Adiciona 5 bolos ao estoque de produtos
- 📊 Mostra: "Produção registrada!"

### **4️⃣ Ver Estoque de Produtos** (`/produtos`) ← **NOVO!**

Veja o que está pronto para vender:

```
┌─────────────────────────────────────┐
│ Estoque de Produtos Prontos         │
├─────────────────────────────────────┤
│ Bolo de Chocolate                   │
│ ✅ OK                                │
│ Em Estoque: 5 un                    │
│ Valor Total: R$ 80,00               │
└─────────────────────────────────────┘
```

### **5️⃣ Fazer Vendas** (`/vendas`)

Agora APENAS vende se tiver no estoque de produtos:

```
Cliente compra: 2x Bolo de Chocolate
Sistema verifica: 5 prontos ✅
Deduz: 5 → 3 produtos
NÃO toca nos insumos!
```

---

## 🎯 **Vantagens da Nova Lógica**

### ✅ **Clareza Total**

**Antes:**
- "Tenho farinha para 50 bolos, mas quantos bolos tenho prontos?" 🤔

**Agora:**
- **Capacidade:** "Posso fazer 50 bolos" (com os insumos)
- **Estoque:** "Tenho 5 bolos prontos" (já fabricados)

### ✅ **Prevenção de Erros**

**Antes:**
- Cliente pede 10 bolos
- Você vende sem produzir
- Sistema deduz insumos
- Você esquece de fazer os bolos! ❌

**Agora:**
- Cliente pede 10 bolos
- Sistema: "Você só tem 5 prontos! Produza mais" ⚠️
- Você vai em "Produção" e fabrica
- AI SIM pode vender ✅

### ✅ **Controle Real**

- **Insumos:** O que você TEM de matéria-prima
- **Produtos:** O que você JÁ FEZ e pode vender
- **Capacidade:** O que você PODE fazer com os insumos

---

## 📊 **Novo Dashboard**

### O Dashboard agora mostra:

```
┌──────────────────────────────────────────┐
│ 💰 Vendas do Mês                         │
│ Vendas: 10 | Faturamento: R$ 500        │
│ Lucro: R$ 300 | Ticket: R$ 50           │
├──────────────────────────────────────────┤
│ 🧺 ESTOQUE DE INSUMOS                    │
│ Total: 15 itens                          │
│ Baixo: 2 | Sem Estoque: 1               │
│ [Ver Insumos →]                          │
├──────────────────────────────────────────┤
│ 📦 ESTOQUE DE PRODUTOS                   │
│ Produtos Prontos: 25 un                  │
│ Produzir Mais: 3 | Sem Estoque: 2       │
│ [Ver Produtos →]                         │
├──────────────────────────────────────────┤
│ ⚡ AÇÕES RÁPIDAS                          │
│ [🏭 Produzir] [💰 Vender]                │
│ [🧺 Insumos]  [📊 Relatórios]            │
└──────────────────────────────────────────┘
```

---

## 🛠️ **Funções SQL Criadas**

### 1. `registrar_producao(receita_id, quantidade)`

**O que faz:**
1. Verifica se tem insumos suficientes
2. Se NÃO: retorna erro com o que falta
3. Se SIM:
   - Deduz insumos
   - Adiciona produtos prontos
   - Registra no histórico

**Exemplo:**
```sql
SELECT * FROM registrar_producao(
  'uuid-do-bolo',
  5  -- produzir 5 bolos
);

-- Retorno se der erro:
{
  sucesso: false,
  mensagem: 'Insumo insuficiente',
  insumo_faltante: 'Farinha',
  quantidade_necessaria: 500,
  quantidade_disponivel: 300
}

-- Retorno se der certo:
{
  sucesso: true,
  mensagem: 'Produção registrada com sucesso!'
}
```

### 2. `deduzir_estoque_venda_produtos(venda_id)`

**O que faz:**
1. Verifica se tem produtos prontos
2. Se NÃO: retorna erro
3. Se SIM: deduz APENAS de `receitas.quantidade_em_estoque`

**NÃO toca mais nos insumos!**

---

## 📋 **Passo a Passo para Implementar**

### 1️⃣ **Execute o SQL**

```sql
-- Execute este arquivo no Supabase SQL Editor:
SQL_NOVA_LOGICA_PRODUCAO.sql
```

**Aguarde 30 segundos**

### 2️⃣ **Reinicie o Servidor**

```bash
npm run dev
```

### 3️⃣ **Teste o Fluxo Completo**

1. **Cadastre insumos** (`/ingredientes`):
   - Farinha (1kg)
   - Caixinha (10un)

2. **Crie um modelo** (`/receitas`):
   - Bolo (usa 500g farinha + 1 caixinha)
   - Define estoque mínimo de produtos: 5un

3. **Registre produção** (`/producao`):
   - Produzir 10 Bolos
   - Sistema deduz insumos
   - Adiciona 10 bolos ao estoque de produtos

4. **Veja produtos prontos** (`/produtos`):
   - Deve mostrar: 10 Bolos prontos

5. **Faça uma venda** (`/vendas`):
   - Venda 2 Bolos
   - Sistema deduz APENAS de produtos
   - Produtos: 10 → 8

6. **Verifique insumos** (`/ingredientes`):
   - Farinha: 500g (foi deduzida na produção)
   - Caixinha: 9un (foi deduzida na produção)
   - **NÃO foi tocada na venda!** ✅

---

## 🎉 **Resumo Final**

### O Novo Sistema:

✅ **3 Etapas Claras:**
1. COMPRA → Insumos
2. PRODUZ → Produtos Prontos
3. VENDE → Dinheiro

✅ **2 Estoques Separados:**
- 🧺 Insumos (matéria-prima)
- 📦 Produtos (prontos para vender)

✅ **Capacidade vs Estoque:**
- "Posso fazer 50" ≠ "Tenho 50 prontos"

✅ **Prevenção de Erros:**
- Não vende se não produziu

✅ **Interface Simples:**
- Nomes claros (Insumos, Modelos, Produção, Produtos)

---

## 📂 **Arquivos Criados:**

1. ✅ `SQL_NOVA_LOGICA_PRODUCAO.sql` - Nova estrutura SQL
2. ✅ `app/producao/page.tsx` - Página de produção
3. ✅ `app/produtos/page.tsx` - Estoque de produtos prontos
4. ✅ `components/Navbar.tsx` - Menu atualizado
5. ✅ `GUIA_NOVA_LOGICA_COMPLETA.md` - Esta documentação

---

**Execute o SQL e teste o novo fluxo!** 🚀

**Insumos → Produção → Produtos → Venda** ✨

