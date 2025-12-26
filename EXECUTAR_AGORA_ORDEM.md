# ⚡ LIMPAR TUDO - ORDEM DE EXECUÇÃO (ATUALIZADO)

## ⚠️ IMPORTANTE: Use o SQL Correto!

❌ **NÃO USE:** `SQL_DELETAR_TUDO_AGORA.sql` (erro de permissão)  
✅ **USE:** `SQL_DELETAR_TUDO_SUPABASE.sql` (compatível)

---

## 🎯 Execute EXATAMENTE Nesta Ordem

### Passo 1: DELETAR TUDO (1 min)

1. Abra **Supabase → SQL Editor**
2. Clique em **"New query"**
3. Abra o arquivo: `SQL_DELETAR_TUDO_SUPABASE.sql` ← **NOVO!**
4. **Copie TUDO** (Ctrl+A, Ctrl+C)
5. Cole no SQL Editor
6. Clique em **"Run"** (F5)
7. **Aguarde terminar**
8. Verifique resultado: "Tabelas restantes: 0" ✅

---

### Passo 2: CRIAR ESTRUTURA (2 min)

1. No **MESMO SQL Editor** (limpe o texto anterior)
2. Abra o arquivo: `SQL_CRIAR_ESTRUTURA.sql`
3. **Copie TUDO** (Ctrl+A, Ctrl+C)
4. Cole no SQL Editor
5. Clique em **"Run"** (F5)
6. **Aguarde terminar** (pode demorar um pouco)
7. Verifique resultado: "ESTRUTURA CRIADA COM SUCESSO!" ✅

---

### Passo 3: LIMPAR STORAGE (30 seg)

1. Vá para **Storage** no Supabase
2. Clique em **receitas-fotos**
3. Selecione todas as fotos (se houver)
4. Clique em **"Delete"**

---

### Passo 4: TESTAR NO APP (30 seg)

1. Volte para o navegador: `http://localhost:3000`
2. Faça login: `teste@teste.com` / `123456`
3. Vá para **Dashboard**
4. Deve estar completamente vazio ✅

---

## ✅ Resultado Esperado

```
✅ Tabelas: 8 (todas vazias)
✅ Funções: 4
✅ Triggers: 2
✅ Views: 3
✅ Políticas RLS: Todas ativas
✅ Storage: Vazio
✅ Dados: 0 em todas as tabelas
```

---

## 📋 Verificação Final

Execute este SQL para confirmar:

```sql
SELECT 
  'ingredientes' AS tabela, 
  COUNT(*) AS registros 
FROM ingredientes
UNION ALL
SELECT 'receitas', COUNT(*) FROM receitas
UNION ALL
SELECT 'itens_receita', COUNT(*) FROM itens_receita
UNION ALL
SELECT 'vendas', COUNT(*) FROM vendas;
```

**Resultado esperado:** Todos os contadores devem ser **0**

---

## 🚨 Se Der Erro

### Erro: "permission denied"
- Certifique-se de estar logado como Owner do projeto

### Erro: "cannot drop ... because other objects depend"
- Execute o Passo 1 novamente (SQL_DELETAR_TUDO_AGORA.sql)
- Ele tem CASCADE que força a remoção

### Erro no Passo 2: "relation does not exist"
- Normal! Significa que o Passo 1 funcionou
- Continue executando

---

## ⏱️ Tempo Total

```
Passo 1 (Deletar): ~1 minuto
Passo 2 (Criar):   ~2 minutos
Passo 3 (Storage): ~30 segundos
Passo 4 (Teste):   ~30 segundos
------------------------
TOTAL:             ~4 minutos
```

---

## 🎉 Depois de Executar

Você terá:

```
✅ Banco 100% limpo
✅ Estrutura 100% atualizada
✅ Sem nenhum dado antigo
✅ Pronto para começar do zero
✅ Todos os recursos funcionando
```

---

**EXECUTE AGORA:**

1️⃣ `SQL_DELETAR_TUDO_AGORA.sql`  
2️⃣ `SQL_CRIAR_ESTRUTURA.sql`  
3️⃣ Limpar Storage  
4️⃣ Testar no navegador

