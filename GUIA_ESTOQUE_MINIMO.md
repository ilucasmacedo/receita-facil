# 📦 GUIA: Sistema de Estoque Mínimo

## 🎯 O Que É?

Sistema de **alertas automáticos** que avisa quando:
- 🔴 **Insumos** estão acabando (sem estoque ou abaixo do mínimo)
- 🔴 **Produtos prontos** precisam ser produzidos

---

## ✅ INSTALAÇÃO (1 minuto)

### **Passo 1: Abrir Supabase**
```
🌐 https://supabase.com
➜ Login
➜ Seu projeto
```

### **Passo 2: SQL Editor**
```
📂 Menu lateral
➜ SQL Editor
➜ + New query
```

### **Passo 3: Executar SQL**
```
📄 Abrir: SQL_ESTOQUE_MINIMO_COMPLETO.sql
➜ Ctrl+A (selecionar tudo)
➜ Ctrl+C (copiar)
➜ Colar no Supabase
▶ Clique "Run"
```

### **Passo 4: Aguardar Confirmações**
```
✅ ESTOQUE MÍNIMO CONFIGURADO
✅ Colunas de Ingredientes
✅ Colunas de Receitas
📊 ESTATÍSTICAS DE INSUMOS
✅ VIEWS CRIADAS
✅ FUNÇÃO CRIADA
🎉 TUDO PRONTO!
```

---

## 🎨 O Que o SQL Cria?

### **1. Colunas Novas:**

#### **Tabela `ingredientes` (Insumos):**
- `estoque_minimo` - Quantidade mínima antes de alerta
- `estoque_atual` - Alias para quantidade_total (compatibilidade)

#### **Tabela `receitas` (Produtos):**
- Já tem: `quantidade_em_estoque` e `estoque_minimo_produtos`

### **2. Views (Consultas Prontas):**

#### **`alertas_estoque_insumos`**
Lista todos os insumos com status:
- 🔴 `sem_estoque` - Quantidade = 0
- 🟡 `estoque_baixo` - Quantidade ≤ estoque_minimo
- 🟢 `ok` - Quantidade > estoque_minimo

#### **`alertas_estoque_produtos`**
Lista todos os produtos prontos com status:
- 🔴 `sem_estoque` - Sem produtos prontos
- 🟡 `estoque_baixo` - Abaixo do mínimo
- 🟢 `ok` - Estoque normal

### **3. Função `contar_alertas_estoque`:**
Retorna contagem rápida para o dashboard:
- Total de insumos sem estoque
- Total de insumos com estoque baixo
- Total de produtos sem estoque
- Total de produtos com estoque baixo
- Total geral de alertas

---

## 📊 Valores Padrão de Estoque Mínimo

O SQL define automaticamente valores inteligentes:

| Unidade | Estoque Mínimo Padrão |
|---------|----------------------|
| g       | 100g                 |
| kg      | 0,5kg (500g)         |
| ml      | 100ml                |
| L       | 0,5L (500ml)         |
| un      | 5 unidades           |

**Você pode editar esses valores depois no formulário de Insumos!**

---

## 🎨 Como Aparece no App?

### **Página "Insumos":**

#### **Cards de Resumo:**
```
┌──────────┬──────────┬──────────┬──────────┐
│ Total:15 │ Com:12   │ Baixo:2  │ Sem:1    │
└──────────┴──────────┴──────────┴──────────┘
```

#### **Badges nos Itens:**
```
Farinha          🟢 OK
Açúcar           🟡 ESTOQUE BAIXO
Ovos             🔴 SEM ESTOQUE
```

### **Página "Produtos":**

#### **Status nos Cards:**
```
Bolo de Chocolate
Estoque: 0 un 🔴
Status: Produzir urgente!
```

---

## 🧪 Exemplo de Uso

### **Situação Inicial:**
```sql
-- Farinha
quantidade_total: 2000g
estoque_minimo: 100g
Status: 🟢 OK
```

### **Após Usar 1950g em Produção:**
```sql
-- Farinha
quantidade_total: 50g
estoque_minimo: 100g
Status: 🟡 ESTOQUE BAIXO (50g < 100g)
Alerta: "Reabastecer em breve"
```

### **Após Usar Mais 50g:**
```sql
-- Farinha
quantidade_total: 0g
estoque_minimo: 100g
Status: 🔴 SEM ESTOQUE
Alerta: "Comprar urgente!"
```

---

## 🔍 Consultas Úteis

### **Ver todos os insumos em alerta:**
```sql
SELECT * FROM alertas_estoque_insumos
WHERE auth.uid() = user_id
AND status IN ('sem_estoque', 'estoque_baixo')
ORDER BY 
  CASE status 
    WHEN 'sem_estoque' THEN 1 
    ELSE 2 
  END;
```

### **Ver produtos que precisam ser produzidos:**
```sql
SELECT * FROM alertas_estoque_produtos
WHERE auth.uid() = user_id
AND status IN ('sem_estoque', 'estoque_baixo');
```

### **Contar alertas para o dashboard:**
```sql
SELECT * FROM contar_alertas_estoque(auth.uid());
```

---

## 🎯 Fluxo Completo

```
1. COMPRA INSUMOS
   ↓
   quantidade_total aumenta
   ↓
   Se > estoque_minimo → 🟢 OK
   
2. PRODUZ PRODUTOS
   ↓
   quantidade_total de insumos diminui
   ↓
   Se ≤ estoque_minimo → 🟡 BAIXO
   Se = 0 → 🔴 SEM
   
3. DASHBOARD MOSTRA ALERTAS
   ↓
   "Você tem 2 insumos em falta"
   "Você precisa produzir 3 produtos"
   
4. VOCÊ AGE
   ↓
   Compra insumos ou produz mais
```

---

## ⚙️ Configuração Manual (Opcional)

### **Definir estoque mínimo personalizado:**

1. Vá em **Insumos** (`/ingredientes`)
2. Clique em **"Editar"** no insumo
3. Altere o campo **"Estoque Mínimo"**
4. Salve

**Exemplo:**
```
Farinha de Trigo
Estoque Mínimo: 500g (uso muito)

Corante Azul
Estoque Mínimo: 10ml (uso pouco)
```

---

## 📱 Benefícios

### **Controle Proativo:**
✅ Nunca fica sem insumo no meio da produção
✅ Planeja compras com antecedência
✅ Evita paradas inesperadas

### **Visibilidade:**
✅ Dashboard com contadores
✅ Cores intuitivas (🟢🟡🔴)
✅ Alertas claros

### **Automação:**
✅ Cálculo automático
✅ Atualização em tempo real
✅ Sem necessidade de conferir manualmente

---

## 🧪 Teste Após Instalação

### **1. Ver Estatísticas no Supabase:**
```sql
SELECT * FROM ingredientes
WHERE estoque_minimo > 0
LIMIT 5;
```

### **2. Ver Alertas:**
```sql
SELECT nome, quantidade_total, estoque_minimo, status
FROM alertas_estoque_insumos
WHERE auth.uid() = user_id
ORDER BY 
  CASE status 
    WHEN 'sem_estoque' THEN 1 
    WHEN 'estoque_baixo' THEN 2 
    ELSE 3 
  END;
```

### **3. No App:**
1. Acesse: `http://192.168.0.19:3000/ingredientes`
2. Veja os badges 🟢🟡🔴 em cada insumo
3. Veja os cards de resumo no topo

---

## 🚀 Próximos Passos

Após instalar o estoque mínimo:

1. ✅ Execute primeiro: **`SQL_COMPLETO_FINAL_PRODUCAO.sql`**
2. ✅ Depois execute: **`SQL_ESTOQUE_MINIMO_COMPLETO.sql`**
3. ✅ Teste a produção
4. ✅ Veja os alertas aparecendo
5. ✅ Configure estoques mínimos personalizados

---

## 📊 Resumo Visual

### **SEM Sistema de Estoque Mínimo:**
```
❌ Não sabe quando comprar
❌ Fica sem insumo de surpresa
❌ Precisa conferir manualmente
❌ Sem alertas visuais
```

### **COM Sistema de Estoque Mínimo:**
```
✅ Alerta automático quando está baixo
✅ Cores intuitivas (🟢🟡🔴)
✅ Dashboard com contadores
✅ Planejamento de compras facilitado
```

---

## 🎉 Resultado Final

Após executar este SQL:

✅ **Coluna `estoque_minimo` criada**
✅ **Valores padrão inteligentes definidos**
✅ **Views de alertas prontas**
✅ **Função de contagem criada**
✅ **Sistema de cores funcionando**
✅ **Tudo integrado ao app**

---

**Execute agora e tenha controle total sobre seus estoques!** 🚀

