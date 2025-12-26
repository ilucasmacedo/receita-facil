# 🍰 Guia: Ingredientes de Produção Própria

## 🎯 O Que É?

Sistema que permite usar **receitas como ingredientes** em outras receitas.

### **Exemplo Prático:**
```
1. Você cria receita de "Bolo de Chocolate"
   Custo: R$ 20,00
   
2. Transforma em ingrediente de produção própria
   
3. Usa esse "Bolo" como ingrediente em "Bolo de Pote"
   Bolo de Pote = 1 Bolo + Creme + Cobertura
```

---

## 🚀 Como Funciona:

### **Passo 1: Execute o SQL**

1. Abra o Supabase: https://supabase.com
2. Vá em **SQL Editor**
3. Execute o arquivo: `SQL_INGREDIENTES_PRODUCAO_PROPRIA.sql`
4. Aguarde 30 segundos
5. Reinicie o servidor: `npm run dev`

---

### **Passo 2: Crie uma Receita Base**

1. Vá em **Receitas**
2. Crie uma receita (ex: "Bolo de Chocolate")
3. Adicione ingredientes
4. Salve a receita

**Exemplo:**
```
Receita: Bolo de Chocolate
Ingredientes:
- Farinha: 500g
- Açúcar: 300g
- Chocolate: 200g
- Ovos: 3un

Custo Total: R$ 20,00
Rendimento: 1 bolo
```

---

### **Passo 3: Transformar em Ingrediente**

Na lista de receitas, clique no botão:
```
[+ Produção Própria]
```

**Perguntas que aparecerão:**

1️⃣ **"Quantas unidades esta receita produz?"**
```
Exemplos:
- 1 (para 1 bolo inteiro)
- 12 (para 12 cupcakes)
- 6 (para 6 porções)

Digite: 1
```

2️⃣ **"Qual a unidade de produção?"**
```
Exemplos:
- "bolo inteiro"
- "cupcake"
- "porção de 200g"
- "pote"

Digite: bolo inteiro
```

**Resultado:**
```
✅ Ingrediente criado:
   Nome: "Bolo de Chocolate (Produção Própria)"
   Custo: R$ 20,00
   Quantidade: 1 bolo inteiro
   Tipo: Produção Própria
```

---

### **Passo 4: Usar em Outra Receita**

1. Vá em **Receitas**
2. Crie nova receita: "Bolo de Pote"
3. **Selecione ingredientes:**
   - ✅ Bolo de Chocolate (Produção Própria) - 1 un
   - ✅ Creme de Leite - 200g
   - ✅ Cobertura - 100g

4. **Cálculo automático:**
```
Bolo de Chocolate:  R$ 20,00 (1 un)
Creme de Leite:     R$ 3,80  (200g)
Cobertura:          R$ 5,00  (100g)
─────────────────────────────
Custo Total:        R$ 28,80
```

---

## 🎨 Interface Visual:

### **Na Página de Receitas:**
```
┌──────────────────────────────────────┐
│ Bolo de Chocolate                    │
│ Custo: R$ 20,00                      │
│ Rendimento: 1 bolo                   │
│                                      │
│ [Editar] [🗑️]                       │
│ [+ Produção Própria] ← NOVO!        │
└──────────────────────────────────────┘
```

### **Na Página de Ingredientes:**
```
┌─────────────────────────────────────────────────┐
│ [ ] Farinha de Trigo          R$ 10,00  1kg    │
│ [✓] Bolo de Chocolate         R$ 20,00  1un    │ ← Fundo verde
│     (Produção Própria)                          │
│     1 bolo inteiro                              │
│ [ ] Açúcar                    R$ 8,50   1kg    │
└─────────────────────────────────────────────────┘
```

---

## ⚡ Funcionalidades Automáticas:

### **1. Atualização Automática de Custo**

Se você alterar a receita base, o custo do ingrediente atualiza automaticamente!

**Exemplo:**
```
Receita Original:
Bolo de Chocolate = R$ 20,00

Você adiciona mais 1 ingrediente:
Bolo de Chocolate = R$ 25,00

Ingrediente atualiza automaticamente:
"Bolo de Chocolate (Produção Própria)" → R$ 25,00 ✅
```

### **2. Cálculo de Custo Unitário**

O sistema calcula automaticamente:
```
Custo da Receita: R$ 20,00
Quantidade Produzida: 1 bolo
────────────────────────────
Custo Unitário: R$ 20,00/un
```

Se você produz 12 cupcakes:
```
Custo da Receita: R$ 20,00
Quantidade Produzida: 12 cupcakes
────────────────────────────────
Custo Unitário: R$ 1,67/cupcake
```

---

## 📊 Exemplos de Uso:

### **Exemplo 1: Bolo de Pote**
```
Receita Base: Bolo de Chocolate
↓
Ingrediente: Bolo de Chocolate (Produção Própria)
↓
Receita Final: Bolo de Pote
  - 1 Bolo de Chocolate (R$ 20,00)
  - 200g Creme (R$ 3,80)
  - 100g Cobertura (R$ 5,00)
  = R$ 28,80 total
```

### **Exemplo 2: Torta de Morango**
```
Receita Base: Massa de Torta
↓
Ingrediente: Massa de Torta (Produção Própria)
↓
Receita Final: Torta de Morango
  - 1 Massa de Torta (R$ 15,00)
  - 500g Morango (R$ 10,00)
  - 200g Creme (R$ 3,80)
  = R$ 28,80 total
```

### **Exemplo 3: Brigadeiro Gourmet**
```
Receita Base: Brigadeiro Tradicional (100 unidades)
↓
Ingrediente: Brigadeiro (Produção Própria) - R$ 50,00 / 100un
Custo unitário: R$ 0,50/un
↓
Receita Final: Brigadeiro Gourmet
  - 1 Brigadeiro (R$ 0,50)
  - Cobertura Premium (R$ 0,30)
  = R$ 0,80 por unidade
```

---

## 🔧 Configurações Avançadas:

### **Unidades Flexíveis:**

Você pode definir qualquer unidade de produção:

| Receita | Quantidade | Unidade Produção |
|---------|------------|------------------|
| Bolo | 1 | "bolo inteiro" |
| Cupcakes | 12 | "cupcake" |
| Brigadeiro | 100 | "brigadeiro" |
| Mousse | 500 | "g" |
| Molho | 1 | "L" |
| Pizza | 8 | "fatia" |

---

## 💡 Casos de Uso:

### **1. Confeitaria**
```
Massa de Bolo → Bolo Recheado → Bolo Decorado
```

### **2. Restaurante**
```
Caldo Base → Sopa → Sopa Especial
Molho → Prato com Molho → Prato Gourmet
```

### **3. Padaria**
```
Massa de Pão → Pão → Sanduíche
```

### **4. Doceria**
```
Brigadeiro → Cone Trufado
Brownie → Torta de Brownie
```

---

## ✅ Benefícios:

| Benefício | Descrição |
|-----------|-----------|
| 📊 **Custo Real** | Calcula custo exato de produtos compostos |
| ⚡ **Automático** | Atualiza custos quando receita base muda |
| 🎯 **Precisão** | Não precisa calcular manualmente |
| 📈 **Escalável** | Crie receitas complexas facilmente |
| 💼 **Profissional** | Sistema usado em indústrias |

---

## 🧪 Como Testar:

### **Teste Completo:**

1. **Execute o SQL**
   ```
   SQL_INGREDIENTES_PRODUCAO_PROPRIA.sql
   ```

2. **Crie receita simples**
   ```
   Nome: Brigadeiro Tradicional
   Ingredientes: Leite Condensado, Chocolate
   Custo: R$ 10,00
   Rendimento: 50 brigadeiros
   ```

3. **Transforme em ingrediente**
   ```
   Clique em [+ Produção Própria]
   Quantidade: 50
   Unidade: "brigadeiro"
   ```

4. **Veja na lista de ingredientes**
   ```
   ✅ Brigadeiro Tradicional (Produção Própria)
   Fundo verde
   50 brigadeiros
   R$ 0,20/un
   ```

5. **Use em nova receita**
   ```
   Receita: Cone Trufado
   Ingrediente: 3x Brigadeiro Tradicional (PP)
   Custo: R$ 0,60 (3 × R$ 0,20)
   ```

---

## 🎯 Comparação:

### **Sem Produção Própria:**
```
❌ Calcular custo do bolo manualmente
❌ Digitar custo toda vez
❌ Se mudar receita, atualizar manualmente
❌ Fácil esquecer de atualizar
```

### **Com Produção Própria:**
```
✅ Sistema calcula automaticamente
✅ Seleciona da lista
✅ Atualiza sozinho quando receita muda
✅ Sempre correto
```

---

## 📋 Checklist:

Antes de usar:
- [ ] Executou SQL no Supabase
- [ ] Aguardou 30 segundos
- [ ] Reiniciou o servidor
- [ ] Tem receitas cadastradas
- [ ] Testou criar receita

Para transformar em ingrediente:
- [ ] Receita está salva
- [ ] Definiu quantidade produzida
- [ ] Definiu unidade de produção
- [ ] Verificou na lista de ingredientes

Para usar em receita:
- [ ] Ingrediente PP aparece na lista
- [ ] Custo está correto
- [ ] Pode selecionar normalmente
- [ ] Cálculo está funcionando

---

## 🚨 Avisos Importantes:

⚠️ **Se alterar a receita base:**
- O custo do ingrediente atualiza automaticamente
- Todas as receitas que usam ele terão custo atualizado

⚠️ **Se excluir a receita base:**
- O ingrediente vira "comprado" normal
- Mantém o último custo calculado

⚠️ **Não crie loops:**
```
❌ Receita A usa Receita B
    Receita B usa Receita A
    (infinito!)
```

---

## 🎉 Está Pronto!

Agora você pode:
1. ✅ Criar receitas base
2. ✅ Transformar em ingredientes
3. ✅ Usar em receitas compostas
4. ✅ Calcular custos complexos automaticamente
5. ✅ Atualizar custos dinamicamente

---

**Execute o SQL e comece a usar! 🚀**

