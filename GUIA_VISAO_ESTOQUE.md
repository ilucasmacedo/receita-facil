# 🔄 Guia: Visão Compra vs. Visão Estoque

## 📋 Resumo

A página de **Insumos** agora possui um **toggle (chave)** que permite alternar entre duas visualizações:

### 🛒 **Visão Compra** (Padrão)
Mostra os dados da última compra:
- **Preço Original**: Quanto você pagou na compra
- **Quantidade Original**: Quanto você comprou
- **Custo Unitário**: Preço por g/ml/un

### 📦 **Visão Estoque** (Nova)
Mostra o valor financeiro atual em estoque:
- **Valor em Estoque**: Quanto dinheiro está "parado" naquele insumo
- **Quantidade em Estoque**: Quanto você tem agora (com cores de alerta)
- **Custo Unitário**: Mantém o mesmo

---

## 🎯 Para Que Serve?

### **Visão Compra:**
✅ Ver quanto pagou em cada compra
✅ Comparar preços entre compras diferentes
✅ Decidir onde comprar mais barato
✅ Registrar novas compras com facilidade

### **Visão Estoque:**
✅ Ver quanto dinheiro está investido em estoque
✅ Identificar insumos que "travam" capital
✅ Visualizar rapidamente o que está em falta
✅ Controlar o estoque atual colorido (OK/BAIXO/SEM)

---

## 🎨 Interface

### **Toggle no Topo da Tabela:**

```
┌────────────────────────────────────────┐
│ Insumos em Estoque (15)                │
│                                        │
│ ┌──────────┐ ┌──────────┐            │
│ │ Visão    │ │ Visão    │            │
│ │ Compra   │ │ Estoque  │            │
│ └──────────┘ └──────────┘            │
└────────────────────────────────────────┘
```

### **Resumo no Topo:**

#### **Visão Compra:**
```
┌────────────┬────────────┬────────────┬────────────┐
│ Total: 15  │ Com: 12    │ Baixo: 2   │ Sem: 1     │
└────────────┴────────────┴────────────┴────────────┘
```

#### **Visão Estoque:**
```
┌────────────┬────────────┬────────────┬────────────────┐
│ Total: 15  │ Com: 12    │ Baixo: 2   │ Valor: R$ 850  │
└────────────┴────────────┴────────────┴────────────────┘
```

### **Tabela Desktop:**

#### **Visão Compra:**
| Nome           | Preço Original | Quantidade Original | Custo Unitário |
|----------------|----------------|---------------------|----------------|
| Farinha        | R$ 10,00       | 2000 g              | R$ 0,005 / g   |
| Leite          | R$ 4,50        | 1000 ml             | R$ 0,0045 / ml |

#### **Visão Estoque:**
| Nome           | Valor em Estoque | Quantidade em Estoque | Custo Unitário |
|----------------|------------------|-----------------------|----------------|
| Farinha        | **R$ 10,00** 💙  | **2000 g** 🟢        | R$ 0,005 / g   |
| Leite          | **R$ 2,25** 💙   | **500 ml** 🟡        | R$ 0,0045 / ml |

---

## 💡 Exemplos de Uso

### **Cenário 1: Controle Financeiro**

**Pergunta:** "Quanto dinheiro está parado no meu estoque?"

**Solução:**
1. Clique em **"Visão Estoque"**
2. Veja o card **"Valor Total em Estoque"** (R$ 850,00)
3. Veja o **"Valor em Estoque"** de cada insumo individual

**Resultado:** Você sabe exatamente quanto capital está investido.

---

### **Cenário 2: Planejamento de Compras**

**Pergunta:** "Quais insumos estão em falta e quanto vou gastar?"

**Solução:**
1. Clique em **"Visão Estoque"**
2. Veja os insumos com badge 🔴 **"SEM ESTOQUE"**
3. Alterne para **"Visão Compra"**
4. Veja o **"Preço Original"** de cada um

**Resultado:** Lista de compras com valores previstos.

---

### **Cenário 3: Otimização de Capital**

**Pergunta:** "Onde está concentrado meu dinheiro?"

**Solução:**
1. Clique em **"Visão Estoque"**
2. Ordene mentalmente por **"Valor em Estoque"**
3. Identifique insumos com muito capital parado

**Resultado:** Decisão sobre reduzir estoque de itens caros que giram pouco.

---

## 🔢 Cálculos

### **Valor em Estoque:**
```
Valor em Estoque = Quantidade Total × Custo Unitário
```

**Exemplo:**
- Comprou: 2 kg de farinha por R$ 10,00
- Quantidade Total: 2000 g
- Custo Unitário: R$ 0,005 / g
- Valor em Estoque: 2000 × 0,005 = **R$ 10,00**

**Após usar 500g em produção:**
- Quantidade Total: 1500 g
- Custo Unitário: R$ 0,005 / g (não muda)
- Valor em Estoque: 1500 × 0,005 = **R$ 7,50**

---

## 🎯 Cores dos Alertas (Visão Estoque)

### **Desktop (Tabela):**
- Quantidade em **verde** = OK
- Quantidade em **amarelo** = BAIXO
- Quantidade em **vermelho** = SEM

### **Mobile (Cards):**
- Mesmo comportamento com badges coloridos

---

## 📱 Responsivo

### **Desktop:**
- Toggle horizontal ao lado do título
- Tabela com colunas completas

### **Mobile:**
- Toggle empilhado abaixo do título
- Cards com informações compactas
- Mesmas informações, design otimizado para toque

---

## ✅ Checklist de Uso Diário

### **Início do Dia:**
1. [ ] Abrir **"Insumos"**
2. [ ] Clicar em **"Visão Estoque"**
3. [ ] Verificar itens em 🟡 BAIXO e 🔴 SEM
4. [ ] Alternar para **"Visão Compra"**
5. [ ] Anotar preços para comprar

### **Ao Comprar:**
1. [ ] Clicar em **"Editar"** no insumo
2. [ ] Atualizar **Preço** e **Quantidade**
3. [ ] Salvar

### **Fim do Dia:**
1. [ ] Clicar em **"Visão Estoque"**
2. [ ] Ver **"Valor Total em Estoque"**
3. [ ] Comparar com dias anteriores

---

## 🚀 Próximos Passos

Com essa funcionalidade, você tem:

✅ **Controle financeiro** - Sabe quanto está investido
✅ **Controle operacional** - Sabe o que tem e o que falta
✅ **Flexibilidade** - Alterna entre visões com 1 clique
✅ **Decisões rápidas** - Informação visual e colorida

---

## 📊 Exemplo Completo

### **Situação Inicial (após compras):**

**Visão Compra:**
| Insumo           | Preço Original | Quantidade Original |
|------------------|----------------|---------------------|
| Farinha (2kg)    | R$ 10,00       | 2000 g              |
| Açúcar (5kg)     | R$ 15,00       | 5000 g              |
| Ovos (30 un)     | R$ 18,00       | 30 un               |

**Total Investido:** R$ 43,00

---

### **Após 1 semana de produção:**

**Visão Estoque:**
| Insumo           | Valor em Estoque | Quantidade em Estoque |
|------------------|------------------|-----------------------|
| Farinha          | **R$ 5,00** 💙   | **1000 g** 🟡        |
| Açúcar           | **R$ 12,00** 💙  | **4000 g** 🟢        |
| Ovos             | **R$ 6,00** 💙   | **10 un** 🔴         |

**Total em Estoque:** R$ 23,00
**Consumido:** R$ 20,00 (43 - 23)

---

## 🎓 Dica Pro

**Use a Visão Estoque para:**
- Ver o "quanto tenho" em dinheiro
- Identificar o que realmente está em falta

**Use a Visão Compra para:**
- Planejar novas compras
- Comparar preços de fornecedores
- Calcular gastos mensais

---

## ✨ Resultado Final

Com essa funcionalidade, você tem **controle total** sobre:

1. 💰 Quanto dinheiro está em estoque
2. 📦 Quanto você tem de cada insumo
3. ⚠️ O que precisa comprar AGORA
4. 📊 Evolução do estoque ao longo do tempo

**Acesse:** `http://localhost:3000/ingredientes`

🎯 **Toggle entre as visões e veja a diferença!**

