# 🔄 Sistema de Atualização Automática de Custos

## 🎯 O Que Faz?

Detecta automaticamente quando ingredientes são alterados e avisa que as receitas precisam ser atualizadas!

---

## ⚡ Como Funciona:

### **1. Detecção Automática**
```
Você altera um ingrediente:
Farinha: R$ 10,00 → R$ 12,00

Sistema detecta automaticamente:
✅ Trigger dispara
✅ Marca todas as receitas que usam Farinha
✅ Badge "Atualizar" aparece
```

### **2. Alertas Visuais**
```
┌──────────────────────────────────┐
│ Bolo de Chocolate    [⚠️Atualizar]│
│ Custo: R$ 20,00 (desatualizado)  │
│                                  │
│ [🔄 Recalcular Custos]          │
└──────────────────────────────────┘
```

### **3. Atualização com 1 Clique**
```
Botão individual:
[🔄 Recalcular Custos]

Ou botão global:
[Atualizar Todas (3)]
```

---

## 🚀 Como Usar:

### **Passo 1: Execute o SQL**
```bash
1. Abra: https://supabase.com
2. SQL Editor
3. Execute: SQL_ATUALIZAR_CUSTOS_AUTOMATICO.sql
4. Aguarde 30 segundos
5. Reinicie: npm run dev
```

### **Passo 2: Altere um Ingrediente**
```
1. Vá em Ingredientes
2. Edite "Farinha": R$ 10,00 → R$ 12,00
3. Salve
```

### **Passo 3: Veja o Alerta**
```
1. Vá em Receitas
2. Veja badge laranja: [⚠️ Atualizar]
3. Veja botão: [🔄 Recalcular Custos]
```

### **Passo 4: Atualize**
```
Opção A - Individual:
Clique em [🔄 Recalcular Custos]

Opção B - Todas:
Clique em [Atualizar Todas (3)]
```

---

## 🎨 Interface Visual:

### **Cabeçalho (quando há receitas desatualizadas):**
```
┌────────────────────────────────────────────┐
│ Receitas Cadastradas  [Atualizar Todas (3)]│
└────────────────────────────────────────────┘
```

### **Card de Receita Desatualizada:**
```
┌────────────────────────────────────┐
│ 📷 [Foto da receita]              │
├────────────────────────────────────┤
│ Bolo de Chocolate  [⚠️ Atualizar] │ ← Badge laranja
│                                    │
│ Custo: R$ 20,00 (desatualizado)   │
│ Venda: R$ 40,00                   │
│                                    │
│ [🔄 Recalcular Custos]            │ ← Botão laranja
│ [Editar] [🗑️]                     │
│ [+ Produção Própria]              │
└────────────────────────────────────┘
```

### **Card de Receita Atualizada:**
```
┌────────────────────────────────────┐
│ 📷 [Foto da receita]              │
├────────────────────────────────────┤
│ Brigadeiro                         │ ← Sem badge
│                                    │
│ Custo: R$ 15,00 ✅                │
│ Venda: R$ 30,00                   │
│                                    │
│ [Editar] [🗑️]                     │ ← Sem botão recalcular
│ [+ Produção Própria]              │
└────────────────────────────────────┘
```

---

## 💡 Exemplo Completo:

### **Cenário: Preço da Farinha Aumentou**

**1. Estado Inicial:**
```
Ingrediente: Farinha
Preço: R$ 10,00

Receita: Bolo de Chocolate
Ingredientes:
- 500g Farinha → R$ 5,00
- 300g Açúcar → R$ 2,40
────────────────────────
Custo: R$ 7,40
Status: ✅ Atualizado
```

**2. Você Altera a Farinha:**
```
Ingrediente: Farinha
Preço: R$ 10,00 → R$ 12,00
```

**3. Sistema Detecta Automaticamente:**
```
🔔 Trigger dispara!
✅ "Bolo de Chocolate" marcado como desatualizado
✅ Badge [⚠️ Atualizar] aparece
✅ Botão [🔄 Recalcular] aparece
```

**4. Você Clica em "Recalcular Custos":**
```
Sistema recalcula:
- 500g Farinha → R$ 6,00 (novo)
- 300g Açúcar → R$ 2,40
────────────────────────
Custo Novo: R$ 8,40
Diferença: +R$ 1,00
```

**5. Popup de Confirmação:**
```
✅ Custos atualizados!

Novo custo total: R$ 8,40
Novo preço de venda: R$ 16,80

[OK]
```

**6. Status Atualiza:**
```
Receita: Bolo de Chocolate
Custo: R$ 8,40 ✅
Status: Atualizado
Badge: Removido
Botão: Removido
```

---

## 🔧 Funcionalidades:

### **1. Detecção Automática**
Detecta mudanças em:
- ✅ Preço do ingrediente
- ✅ Quantidade do ingrediente
- ✅ Tipo (comprado ↔ produção própria)

### **2. Marcação Inteligente**
- ✅ Marca APENAS receitas que usam o ingrediente alterado
- ✅ Não marca receitas que não usam
- ✅ Funciona com múltiplos ingredientes

### **3. Botões Contextuais**
- ✅ Botão individual por receita
- ✅ Botão global para todas
- ✅ Contador de receitas desatualizadas

### **4. Relatório de Atualização**
```
✅ 3 receita(s) atualizada(s)!

• Bolo de Chocolate: R$ 20,00 → R$ 22,00 (+R$ 2,00)
• Torta de Morango: R$ 30,00 → R$ 32,50 (+R$ 2,50)
• Cupcake: R$ 15,00 → R$ 14,50 (-R$ 0,50)
```

---

## 📊 Casos de Uso:

### **Caso 1: Preço de Ingrediente Subiu**
```
Farinha: R$ 10,00 → R$ 12,00
→ Sistema avisa
→ Você recalcula
→ Novos custos refletem aumento
```

### **Caso 2: Múltiplos Ingredientes Mudaram**
```
Farinha: R$ 10,00 → R$ 12,00
Açúcar: R$ 8,00 → R$ 9,00
→ Sistema marca todas as receitas afetadas
→ Botão "Atualizar Todas" aparece
→ Recalcula tudo de uma vez
```

### **Caso 3: Ingrediente de Produção Própria**
```
Receita Base: Bolo (R$ 20,00 → R$ 25,00)
Ingrediente PP: Bolo (atualiza automaticamente)
Receita Derivada: Bolo de Pote (marca para atualizar)
→ Atualiza em cascata
```

---

## ⚙️ Funções do Banco:

### **1. `recalcular_custo_receita()`**
Recalcula UMA receita específica.

```sql
SELECT * FROM recalcular_custo_receita('id_da_receita');
```

**Retorna:**
- Novo custo total
- Novo preço de venda
- Número de itens atualizados

### **2. `recalcular_todas_receitas_desatualizadas()`**
Recalcula TODAS as receitas desatualizadas.

```sql
SELECT * FROM recalcular_todas_receitas_desatualizadas();
```

**Retorna:**
- ID da receita
- Nome
- Custo anterior
- Custo novo
- Diferença

### **3. View: `receitas_desatualizadas`**
Lista receitas que precisam atualização.

```sql
SELECT * FROM receitas_desatualizadas;
```

---

## 🎯 Comparação:

### **Sem Sistema Automático:**
```
❌ Você altera ingrediente
❌ Não sabe quais receitas afetadas
❌ Precisa lembrar de atualizar manualmente
❌ Custos ficam incorretos
❌ Preços ficam desatualizados
```

### **Com Sistema Automático:**
```
✅ Você altera ingrediente
✅ Sistema detecta automaticamente
✅ Badge visual aparece
✅ Botão de atualização disponível
✅ Recalcula com 1 clique
✅ Sempre correto
```

---

## 📋 Checklist:

Antes de usar:
- [ ] Executou SQL no Supabase
- [ ] Aguardou 30 segundos
- [ ] Reiniciou o servidor
- [ ] Tem receitas cadastradas
- [ ] Tem ingredientes cadastrados

Para testar:
- [ ] Altere preço de um ingrediente
- [ ] Vá em Receitas
- [ ] Veja badge "Atualizar"
- [ ] Clique "Recalcular Custos"
- [ ] Veja popup com novo valor
- [ ] Badge deve desaparecer

---

## 🧪 Teste Completo:

### **1. Setup:**
```
Ingrediente: Leite - R$ 5,00
Receita: Bolo - Usa 1L Leite
Custo: R$ 10,00
```

### **2. Altere:**
```
Leite: R$ 5,00 → R$ 6,00
```

### **3. Verifique:**
```
✅ Badge aparece em "Bolo"
✅ Botão "Recalcular" aparece
✅ Contador no topo: "Atualizar Todas (1)"
```

### **4. Recalcule:**
```
Clique [Recalcular Custos]
```

### **5. Confirme:**
```
✅ Popup: "Novo custo: R$ 11,00"
✅ Badge desaparece
✅ Botão desaparece
✅ Custo atualizado na tela
```

---

## 🚨 Importante:

⚠️ **Ingredientes de Produção Própria:**
Se você alterar uma receita base que é usada como ingrediente, o sistema atualiza EM CASCATA:
```
Receita Base → Ingrediente PP → Receitas que usam esse ingrediente
(tudo atualiza automaticamente!)
```

⚠️ **Não perde histórico:**
O sistema mantém registro da última atualização:
- Data/hora da última atualização
- Status de atualização
- Histórico completo preservado

---

## ✅ Está Pronto!

Agora você tem:
1. ✅ Detecção automática de mudanças
2. ✅ Alertas visuais (badges)
3. ✅ Botões de atualização
4. ✅ Recalculo individual ou em lote
5. ✅ Relatórios de diferenças
6. ✅ Histórico preservado

---

**Execute o SQL e teste agora! 🚀**

