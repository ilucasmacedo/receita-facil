# 🚨 ERRO DE PRODUÇÃO - CORREÇÃO RÁPIDA

## ❌ Problema

```
Erro ao registrar produção: Could not find the function 
public.registrar_producao(quantidade_param, receita_id_param) 
in the schema cache
```

**Causa:** A função SQL não foi criada no banco de dados.

---

## ✅ SOLUÇÃO (2 MINUTOS)

### **📋 PASSO A PASSO:**

#### **1. Abrir Supabase**
```
🌐 https://supabase.com
➜ Login
➜ Projeto: zqcjwaudqidtvtmbczim
```

#### **2. Abrir Editor SQL**
```
📂 Menu Lateral
➜ SQL Editor
➜ + New query
```

#### **3. Copiar e Colar**
```
📄 Abrir: SQL_FIX_PRODUCAO_URGENTE.sql
➜ Ctrl+A (selecionar tudo)
➜ Ctrl+C (copiar)
➜ Colar no Supabase
```

#### **4. Executar**
```
▶ Botão "Run" (ou Ctrl+Enter)
⏳ Aguardar 5 segundos
✅ Ver "Função criada com sucesso!"
```

#### **5. Testar**
```
🌐 http://192.168.0.19:3000/producao
➜ Selecionar um modelo
➜ Quantidade: 1
➜ Clicar "Produzindo..."
✅ Deve funcionar!
```

---

## 🎯 O SQL Cria:

✅ Função `registrar_producao` (principal)
✅ Tabela `producoes` (histórico)
✅ Tabela `historico_estoque` (movimentações)
✅ Colunas `quantidade_em_estoque` e `estoque_minimo_produtos` em `receitas`
✅ Políticas de segurança (RLS)

---

## 📊 O Que Vai Acontecer Após Executar:

### **ANTES:**
```
❌ Erro ao produzir
❌ Insumos não deduzem
❌ Produtos não aumentam
```

### **DEPOIS:**
```
✅ Produção funciona
✅ Insumos deduzem automaticamente
✅ Produtos prontos aumentam
✅ Histórico é registrado
```

---

## 🧪 Exemplo de Teste:

**Estado Inicial:**
```
Insumos:
  Farinha: 2000g
  Açúcar: 1000g
  Ovos: 10 un

Produtos:
  Bolo de Chocolate: 0 un
```

**Após Produzir 1 Bolo:**
```
Insumos: (deduzidos)
  Farinha: 1500g
  Açúcar: 800g
  Ovos: 8 un

Produtos: (aumentados)
  Bolo de Chocolate: 1 un ✅
```

---

## ⚠️ IMPORTANTE:

- **NÃO feche o navegador** durante a execução do SQL
- **Aguarde** as mensagens de confirmação
- **Se der erro**, copie o erro e me envie

---

## 🔍 Verificação Rápida

Após executar, no SQL Editor do Supabase, execute:

```sql
SELECT proname 
FROM pg_proc 
WHERE proname = 'registrar_producao';
```

**Deve aparecer:**
```
registrar_producao
```

**Se aparecer vazio:** Execute o SQL novamente.

---

## 📱 Arquivos Criados:

1. **`SQL_FIX_PRODUCAO_URGENTE.sql`** ← EXECUTE ESTE!
2. **`CORRECAO_PRODUCAO_PASSO_A_PASSO.md`** ← Guia detalhado
3. **`URGENTE_PRODUCAO.md`** ← Este arquivo (resumo)

---

## 🚀 EXECUTE AGORA!

1. Abra: **`SQL_FIX_PRODUCAO_URGENTE.sql`**
2. Copie tudo
3. Cole no Supabase SQL Editor
4. Clique "Run"
5. Teste no app

---

**Me avise quando executar! 🎯**

