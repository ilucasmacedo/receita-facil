# 🧹 Limpar Apenas Dados - Guia Rápido

## 🎯 O Que Faz?

```
❌ NÃO apaga tabelas
❌ NÃO apaga funções
❌ NÃO apaga triggers
❌ NÃO apaga políticas RLS

✅ Apaga APENAS os registros
✅ Mantém TODA a estrutura
✅ Sistema fica pronto para novos cadastros
```

---

## ⚡ Execução (1 minuto)

### Passo Único:

```
1. Supabase → SQL Editor → New query
2. Copie: SQL_LIMPAR_APENAS_DADOS.sql
3. Cole no editor
4. Run (F5)
5. Aguarde ~10 segundos
```

---

## ✅ Resultado

### Antes:
```
ingredientes: 50 registros
receitas: 20 registros
vendas: 15 registros
...
```

### Depois:
```
ingredientes: 0 registros ✅
receitas: 0 registros ✅
vendas: 0 registros ✅
...
```

### Estrutura mantida:
```
✅ 8 tabelas (vazias)
✅ 4 funções (ativas)
✅ 2 triggers (funcionando)
✅ 3 views (criadas)
✅ RLS (ativo)
```

---

## 🧪 Testar Multi-Usuário

Depois de limpar os dados:

### Usuário 1:
```
1. Login: teste1@teste.com / 123456
2. Cadastrar: 5 insumos
3. Criar: 2 receitas
```

### Usuário 2:
```
1. Logout
2. Cadastrar novo: teste2@teste.com / 123456
3. Cadastrar: 3 insumos
4. Criar: 1 receita
```

### Verificar:
```
✅ teste1 vê: 5 insumos, 2 receitas
✅ teste2 vê: 3 insumos, 1 receita
❌ teste1 NÃO vê dados do teste2
❌ teste2 NÃO vê dados do teste1
```

---

## 📊 Verificação SQL

Execute para confirmar limpeza:

```sql
SELECT 
    'ingredientes' AS tabela, 
    COUNT(*) AS registros 
FROM ingredientes
UNION ALL
SELECT 'receitas', COUNT(*) FROM receitas
UNION ALL
SELECT 'vendas', COUNT(*) FROM vendas;
```

**Resultado esperado:** Todos = 0

---

## 🔒 Segurança

```
✅ RLS permanece ativo
✅ Cada usuário vê apenas seus dados
✅ Políticas intactas
✅ Pronto para produção
```

---

## 📁 Arquivo

**Execute:** `SQL_LIMPAR_APENAS_DADOS.sql`

---

**Tempo total:** ~1 minuto  
**Resultado:** Dados zerados, estrutura intacta 🎉

