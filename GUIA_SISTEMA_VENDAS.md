# 💰 Sistema de Vendas com Controle de Estoque Automático

## ✅ Sistema Completo Implementado!

O **Receita Fácil** agora possui um sistema completo de vendas que **deduz automaticamente** os ingredientes do estoque quando você registra uma venda! 🎯

---

## 🎯 Funcionalidades Principais

### 1. **Nova Venda**
- ✅ Seleção de produtos (receitas cadastradas)
- ✅ Carrinho de compras interativo
- ✅ Controle de quantidade por item
- ✅ **Preço personalizável** (diferente do sugerido na receita)
- ✅ Campo para nome do cliente (opcional)
- ✅ Observações da venda
- ✅ Cálculo automático de:
  - Valor total
  - Custo total
  - Lucro total
  - Margem de lucro (%)

### 2. **Controle de Estoque Automático**
- ✅ Ao finalizar a venda, o sistema automaticamente:
  - Deduz os ingredientes usados do estoque
  - Registra a movimentação no histórico
  - Calcula proporcionalmente (se a receita rende 10 porções e você vende 5, deduz metade dos ingredientes)

### 3. **Histórico de Vendas**
- ✅ Lista de todas as vendas realizadas
- ✅ Estatísticas gerais:
  - Total de vendas
  - Faturamento total
  - Lucro total
  - Ticket médio
- ✅ Detalhes de cada venda:
  - Data e hora
  - Cliente
  - Itens vendidos
  - Valores e lucro

---

## 🗂️ Estrutura do Banco de Dados

### Tabelas Criadas:

1. **`vendas`**
   - Armazena informações gerais da venda
   - Campos: valor_total, custo_total, lucro_total, cliente_nome, observacoes, status

2. **`itens_venda`**
   - Armazena cada item vendido
   - Relaciona venda com receita
   - Campos: quantidade, preco_unitario, custo_unitario, subtotal, lucro

3. **`historico_estoque`** (novo)
   - Registra TODAS as movimentações de estoque
   - Tipos: entrada_compra, saida_venda, ajuste_manual
   - Para auditoria e rastreabilidade

### Funções SQL:

1. **`deduzir_estoque_venda(venda_id)`**
   - Calcula quanto de cada ingrediente foi usado
   - Deduz do estoque
   - Registra no histórico

2. **`trigger_venda_concluida`**
   - Dispara automaticamente após inserir uma venda
   - Chama a função de dedução de estoque

---

## 📱 Como Usar (Passo a Passo)

### 1️⃣ **Executar o SQL**

1. Abra o **Supabase Dashboard**
2. Vá em **SQL Editor**
3. Copie e cole o conteúdo de `SQL_SISTEMA_VENDAS.sql`
4. Clique em **RUN**
5. Aguarde 30 segundos
6. Reinicie o servidor local: `npm run dev`

### 2️⃣ **Criar uma Venda**

1. Acesse `/vendas` no navegador ou celular
2. Clique em **"Adicionar Produto à Venda"**
3. Selecione uma receita da lista
4. Ajuste a quantidade (botões + e -)
5. **Ajuste o preço se quiser** (pode ser diferente do sugerido)
6. Adicione mais produtos se necessário
7. (Opcional) Preencha nome do cliente e observações
8. Veja o resumo financeiro (custo, valor, lucro, margem)
9. Clique em **"Finalizar Venda"**
10. Confirme ✅

**Resultado:**
- ✅ Venda registrada
- ✅ Estoque deduzido automaticamente
- ✅ Histórico atualizado

### 3️⃣ **Ver Histórico**

1. Acesse `/vendas/historico`
2. Veja estatísticas gerais
3. Clique em **"Ver Itens"** para ver detalhes de cada venda

---

## 🔄 Como Funciona a Dedução de Estoque

### Exemplo Prático:

**Receita: Bolo de Chocolate**
- Rende: 10 porções
- Ingredientes:
  - 500g de Farinha
  - 300g de Açúcar
  - 200g de Chocolate

**Venda: 5 unidades do Bolo**

**Cálculo:**
- 5 vendidos ÷ 10 rendimento = 0,5 (50%)
- **Farinha:** 500g × 0,5 = 250g deduzidos
- **Açúcar:** 300g × 0,5 = 150g deduzidos
- **Chocolate:** 200g × 0,5 = 100g deduzidos

**Automático!** 🎉

---

## 💡 Vantagens do Sistema

### ✅ **Preço Personalizado**
- O preço sugerido na receita é apenas uma referência
- Na venda, você pode cobrar o valor que quiser
- Exemplo: Receita sugere R$ 20, mas você vende por R$ 25

### ✅ **Controle de Lucro Real**
- Sabe exatamente quanto lucrou em cada venda
- Vê a margem de lucro em tempo real
- Identifica produtos mais lucrativos

### ✅ **Estoque Sempre Atualizado**
- Não precisa deduzir manualmente
- Histórico completo de movimentações
- Sabe quando reabastecer

### ✅ **Relatórios Automáticos**
- Faturamento total
- Lucro total
- Ticket médio
- Total de vendas

---

## 📊 Interface Responsiva

### Mobile (Celular):
- ✅ Produtos em grid 1 coluna
- ✅ Carrinho otimizado para toque
- ✅ Botões grandes e fáceis de tocar
- ✅ Controles de quantidade intuitivos

### Tablet:
- ✅ Grid 2 colunas
- ✅ Layout em 2 colunas (carrinho + resumo)

### Desktop:
- ✅ Grid 3 colunas de produtos
- ✅ Layout otimizado com sidebar

---

## 🔗 Fluxo Completo

```
1. INGREDIENTES
   ↓ (cadastrar com preços e quantidades)
   
2. RECEITAS
   ↓ (criar receitas usando ingredientes)
   ↓ (sistema calcula custo e sugere preço)
   
3. VENDAS ← VOCÊ ESTÁ AQUI!
   ↓ (registrar vendas com preços reais)
   ↓ (sistema deduz estoque automaticamente)
   
4. HISTÓRICO
   ↓ (ver vendas, lucros, estatísticas)
```

---

## 🎨 Screenshots do Sistema

### Página de Nova Venda:
```
┌──────────────────────────────────────┐
│ 🛒 Nova Venda                        │
├──────────────────────────────────────┤
│ [+ Adicionar Produto à Venda]        │
│                                      │
│ 📦 Itens da Venda (2)                │
│ ┌──────────────────────────────┐    │
│ │ Bolo de Chocolate            │    │
│ │ [-] 2 [+]                    │    │
│ │ R$ 25,00 [editar]            │    │
│ │ Subtotal: R$ 50,00 [🗑️]      │    │
│ └──────────────────────────────┘    │
├──────────────────────────────────────┤
│ 👤 Cliente: João Silva               │
│ 📝 Obs: Retirada às 15h              │
│                                      │
│ 💰 RESUMO:                           │
│ Custo Total: R$ 20,00                │
│ Valor Total: R$ 50,00                │
│ Lucro: R$ 30,00 (150%)               │
│                                      │
│ [✅ Finalizar Venda]                 │
└──────────────────────────────────────┘
```

### Página de Histórico:
```
┌──────────────────────────────────────┐
│ 📅 Histórico de Vendas               │
├──────────────────────────────────────┤
│ Total: 10 | Faturamento: R$ 500,00   │
│ Lucro: R$ 300,00 | Ticket: R$ 50,00  │
├──────────────────────────────────────┤
│ 23/12/2025 - 14:30                   │
│ Cliente: João Silva                  │
│ Valor: R$ 50,00 | Lucro: R$ 30,00    │
│ [👁️ Ver Itens]                        │
├──────────────────────────────────────┤
│ ...                                  │
└──────────────────────────────────────┘
```

---

## 🚀 Próximos Passos

Agora você pode:

1. ✅ **Testar o sistema:**
   - Execute o SQL
   - Reinicie o servidor
   - Acesse `/vendas` no celular
   - Faça uma venda de teste

2. ✅ **Verificar o estoque:**
   - Vá em `/ingredientes`
   - Veja que as quantidades foram deduzidas

3. ✅ **Ver o histórico:**
   - Acesse `/vendas/historico`
   - Veja suas vendas e estatísticas

---

## 🐛 Solução de Problemas

### Erro: "Could not find table vendas"
**Solução:** Execute o SQL `SQL_SISTEMA_VENDAS.sql` no Supabase e aguarde 30 segundos.

### Estoque não foi deduzido
**Solução:** Verifique se:
1. O trigger foi criado corretamente
2. A venda tem status "concluída"
3. A receita tem ingredientes cadastrados

### Erro ao finalizar venda
**Solução:**
1. Certifique-se que a receita tem custo calculado
2. Verifique se os ingredientes existem
3. Recarregue as receitas

---

## 📝 Resumo

| Recurso | Status |
|---------|--------|
| ✅ Nova venda | Completo |
| ✅ Carrinho de compras | Completo |
| ✅ Preço personalizável | Completo |
| ✅ Dedução automática de estoque | Completo |
| ✅ Histórico de vendas | Completo |
| ✅ Estatísticas | Completo |
| ✅ Responsivo (mobile/desktop) | Completo |
| ✅ Histórico de movimentações | Completo |

---

## 🎉 Conclusão

O **Sistema de Vendas** está completo e integrado! Agora você tem:
- ✅ Controle total de vendas
- ✅ Estoque sempre atualizado
- ✅ Lucro calculado automaticamente
- ✅ Histórico completo
- ✅ Interface mobile-first

**Teste agora e comece a vender!** 💰📱✨

---

**Acesso rápido:**
- Nova Venda: `http://192.168.0.19:3000/vendas`
- Histórico: `http://192.168.0.19:3000/vendas/historico`

