# 🔧 CORREÇÃO URGENTE: Erro ao Registrar Produção

## ❌ Erro Atual

```
Erro ao registrar produção: Could not find the function 
public.registrar_producao(quantidade_param, receita_id_param) 
in the schema cache
```

## ✅ Solução (2 minutos)

### **Passo 1: Abrir o Supabase**

1. Acesse: [https://supabase.com](https://supabase.com)
2. Faça login
3. Abra seu projeto: **zqcjwaudqidtvtmbczim**

---

### **Passo 2: Abrir o Editor SQL**

1. No menu lateral, clique em **"SQL Editor"**
2. Clique em **"+ New query"**

---

### **Passo 3: Copiar e Colar o SQL**

1. Abra o arquivo: **`SQL_FIX_PRODUCAO_URGENTE.sql`**
2. **Copie TODO o conteúdo** (Ctrl+A, Ctrl+C)
3. **Cole** no editor SQL do Supabase (Ctrl+V)

---

### **Passo 4: Executar**

1. Clique no botão **"Run"** (ou pressione Ctrl+Enter)
2. Aguarde 5-10 segundos
3. Veja as mensagens de confirmação:

```
✅ Função criada com sucesso!
✅ Tabelas verificadas!
```

---

### **Passo 5: Testar no Aplicativo**

1. Volte para: `http://192.168.0.19:3000/producao`
2. Selecione um modelo (ex: Bolo de Chocolate)
3. Digite a quantidade: **1**
4. Clique em **"Produzindo..."**

**Resultado Esperado:**
- ✅ Mensagem: "Produção registrada com sucesso!"
- ✅ Insumos deduzidos automaticamente
- ✅ Produtos prontos aumentam

---

## 🔍 O Que o SQL Faz?

### **1. Cria a Função `registrar_producao`**
- Verifica se tem insumos suficientes
- Deduz do estoque de insumos
- Adiciona ao estoque de produtos prontos
- Registra histórico

### **2. Cria as Tabelas (se não existirem)**
- `producoes` - Histórico de produção
- `historico_estoque` - Movimentação de insumos

### **3. Adiciona Colunas nas Receitas**
- `quantidade_em_estoque` - Produtos prontos
- `estoque_minimo_produtos` - Alerta de mínimo

### **4. Configura Segurança (RLS)**
- Cada usuário vê apenas suas produções
- Proteção contra acessos não autorizados

---

## 🎯 Por Que o Erro Aconteceu?

O SQL anterior (`SQL_NOVA_LOGICA_PRODUCAO.sql`) pode não ter sido executado ou teve algum erro silencioso. Este novo SQL é **à prova de falhas**.

---

## ⚠️ Possíveis Mensagens Durante Execução

### **Mensagens Normais (OK):**
```
NOTICE: relation "producoes" already exists
NOTICE: column "quantidade_em_estoque" of relation "receitas" already exists
```
**Significado:** Já existia, foi ignorado. Isso é NORMAL.

### **Mensagens de Sucesso:**
```
CREATE FUNCTION
CREATE TABLE
ALTER TABLE
CREATE POLICY
NOTIFY
```
**Significado:** Tudo criado com sucesso!

---

## 🧪 Teste Completo

### **Cenário de Teste:**

**Antes da Produção:**
```
Insumos:
- Farinha: 2000g
- Açúcar: 1000g
- Ovos: 10 un

Produtos Prontos:
- Bolo de Chocolate: 0 un
```

**Produzir: 1 Bolo**
(Supondo que a receita usa: 500g farinha, 200g açúcar, 2 ovos)

**Depois da Produção:**
```
Insumos:
- Farinha: 1500g (2000 - 500)
- Açúcar: 800g (1000 - 200)
- Ovos: 8 un (10 - 2)

Produtos Prontos:
- Bolo de Chocolate: 1 un (0 + 1)
```

---

## 🚨 Se o Erro Persistir

### **Diagnóstico 1: Verificar se a função existe**

No SQL Editor do Supabase, execute:

```sql
SELECT 
  proname as funcao,
  pg_get_function_arguments(oid) as parametros
FROM pg_proc
WHERE proname = 'registrar_producao';
```

**Resultado esperado:**
```
funcao: registrar_producao
parametros: quantidade_param integer, receita_id_param uuid
```

**Se não aparecer nada:** A função não foi criada. Execute o SQL novamente.

---

### **Diagnóstico 2: Verificar tabelas**

```sql
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name IN ('producoes', 'historico_estoque')
ORDER BY table_name;
```

**Resultado esperado:**
```
historico_estoque
producoes
```

**Se faltar alguma:** Execute o SQL novamente.

---

### **Diagnóstico 3: Recarregar schema**

```sql
NOTIFY pgrst, 'reload schema';
```

Aguarde 10 segundos e teste novamente no aplicativo.

---

## 📊 Fluxo Completo Após Correção

```
1. INSUMOS (Compra)
   ↓
   [Você compra farinha, ovos, etc]
   ↓
   Estoque de Insumos aumenta

2. PRODUÇÃO (Transforma)
   ↓
   [Você clica "Produzir 10 Bolos"]
   ↓
   • Insumos diminuem (farinha, ovos)
   • Produtos Prontos aumentam (10 bolos)
   • Histórico registrado

3. VENDAS (Deduz)
   ↓
   [Você vende 5 bolos]
   ↓
   Produtos Prontos diminuem (5 bolos)
```

---

## ✅ Checklist Final

Após executar o SQL, verifique:

- [ ] Não há erros vermelhos no SQL Editor
- [ ] Apareceu "Função criada com sucesso!"
- [ ] Apareceu "Tabelas verificadas!"
- [ ] Voltou para `/producao`
- [ ] Conseguiu produzir 1 unidade
- [ ] Insumos foram deduzidos
- [ ] Produtos prontos aumentaram

---

## 🎉 Resultado Esperado

Após seguir todos os passos:

✅ **Produção funcionando**
✅ **Insumos deduzidos automaticamente**
✅ **Produtos prontos aumentados**
✅ **Histórico registrado**

---

## 💡 Dica

Se você tiver **receitas sem itens** (sem ingredientes cadastrados), a produção vai funcionar, mas não vai deduzir nada (porque não tem o que deduzir). Certifique-se de que suas receitas têm ingredientes cadastrados em **"Modelos"**.

---

## 📞 Próximos Passos

Após corrigir:
1. Teste produzir várias unidades
2. Veja o estoque de produtos em `/produtos`
3. Veja o estoque de insumos em `/ingredientes` (Visão Estoque)
4. Teste vender produtos em `/vendas`

---

**Execute o SQL agora e me avise se funcionou!** 🚀

