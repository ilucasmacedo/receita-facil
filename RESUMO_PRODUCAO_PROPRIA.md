# 🍰 Ingredientes de Produção Própria - Resumo

## 🎯 O Que Faz?

Permite usar **receitas como ingredientes** em outras receitas!

**Exemplo:**
```
Bolo de Chocolate (receita) 
    ↓
Bolo de Chocolate (ingrediente)
    ↓
Bolo de Pote (receita nova)
```

---

## 🚀 Como Usar (3 Passos):

### **1️⃣ Execute o SQL** (uma vez só)
```bash
# No Supabase > SQL Editor
# Execute: SQL_INGREDIENTES_PRODUCAO_PROPRIA.sql
# Aguarde 30 segundos
# Reinicie: npm run dev
```

### **2️⃣ Crie uma Receita**
```
Receita: Bolo de Chocolate
Custo: R$ 20,00
Rendimento: 1 bolo
```

### **3️⃣ Clique em "Produção Própria"**
```
Na lista de receitas:
[+ Produção Própria] ← Clique aqui

Perguntas:
- Quantidade: 1
- Unidade: "bolo inteiro"

✅ Pronto! Agora "Bolo" é um ingrediente
```

---

## 🎨 Interface:

### **Receitas:**
```
┌──────────────────────────────┐
│ Bolo de Chocolate            │
│ R$ 20,00 | 1 bolo            │
│                              │
│ [Editar] [🗑️]               │
│ [+ Produção Própria] ← NOVO! │
└──────────────────────────────┘
```

### **Ingredientes:**
```
┌─────────────────────────────────────┐
│ Farinha         R$ 10,00  1kg      │
│ Bolo            R$ 20,00  1un      │ ← Fundo verde
│ (Produção Própria) 1 bolo inteiro  │
│ Açúcar          R$ 8,50   1kg      │
└─────────────────────────────────────┘
```

---

## 💡 Exemplo Prático:

### **Cenário: Bolo de Pote**

**1. Crie receita base:**
```
Receita: Bolo de Chocolate
Ingredientes:
- Farinha: R$ 5,00
- Açúcar: R$ 4,00
- Chocolate: R$ 8,00
- Ovos: R$ 3,00
────────────────
Total: R$ 20,00
Rende: 1 bolo
```

**2. Transforme em ingrediente:**
```
Clique [+ Produção Própria]
Quantidade: 1
Unidade: "bolo inteiro"

✅ Criado: Bolo de Chocolate (PP)
   Custo: R$ 20,00 / 1 bolo
```

**3. Use em nova receita:**
```
Receita: Bolo de Pote
Ingredientes:
- 1x Bolo de Chocolate (PP): R$ 20,00
- 200g Creme: R$ 3,80
- 100g Cobertura: R$ 5,00
─────────────────────────────────
Total: R$ 28,80
```

---

## ⚡ Recursos Automáticos:

### **1. Atualização Automática**
```
Se você mudar a receita base:
Bolo: R$ 20,00 → R$ 25,00

O ingrediente atualiza sozinho:
Bolo (PP): R$ 20,00 → R$ 25,00 ✅
```

### **2. Cálculo de Custo**
```
Receita produz 12 cupcakes
Custo total: R$ 24,00
────────────────────────
Custo unitário: R$ 2,00/cupcake
```

---

## 📊 Casos de Uso:

| Produto | Base | Derivado |
|---------|------|----------|
| Bolo de Pote | Bolo | Bolo + Creme |
| Cone Trufado | Brigadeiro | Brigadeiro + Cobertura |
| Torta | Massa | Massa + Recheio |
| Sanduíche | Pão | Pão + Recheio |

---

## ✅ Benefícios:

| Antes | Depois |
|-------|--------|
| ❌ Calcular custo manualmente | ✅ Automático |
| ❌ Digitar toda vez | ✅ Seleciona da lista |
| ❌ Esquecer de atualizar | ✅ Atualiza sozinho |
| ❌ Impreciso | ✅ Sempre correto |

---

## 🧪 Teste Rápido:

```bash
1. Execute SQL
2. Crie receita "Brigadeiro" (R$ 10,00, 50 un)
3. Clique [+ Produção Própria]
4. Veja na lista de ingredientes (fundo verde)
5. Use em receita "Cone Trufado"
6. ✅ Funciona!
```

---

## 📋 Checklist:

- [ ] Executou SQL
- [ ] Aguardou 30 segundos
- [ ] Reiniciou servidor
- [ ] Criou receita
- [ ] Transformou em ingrediente
- [ ] Viu na lista (fundo verde)
- [ ] Usou em outra receita
- [ ] Custo calculou certo

---

## 🎯 Resultado:

```
✨ Agora você pode:

✅ Criar produtos compostos
✅ Calcular custos complexos
✅ Atualizar automaticamente
✅ Escalar produção facilmente
✅ Ter controle profissional
```

---

**Execute o SQL e comece a usar agora! 🚀**

Arquivo: `SQL_INGREDIENTES_PRODUCAO_PROPRIA.sql`
Guia completo: `GUIA_PRODUCAO_PROPRIA.md`

