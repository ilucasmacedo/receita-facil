# 🔧 Resolver Erro: "row-level security policy"

## ✅ Progresso

- ✅ Bucket criado
- ❌ Políticas de segurança faltando ← **VOCÊ ESTÁ AQUI**

---

## 📋 Solução em 3 Passos (2 minutos)

### 1. Abra o SQL Editor

1. Vá para Supabase Dashboard
2. No menu lateral: **SQL Editor**
3. Clique em **"New query"**

### 2. Cole e Execute o SQL

1. Abra o arquivo: `SQL_FIX_RLS_STORAGE.sql`
2. **Copie TODO o conteúdo**
3. Cole no SQL Editor
4. Clique em **"Run"** (ou F5)

### 3. Teste o Upload

1. Volte para o formulário de receita
2. Clique em "Adicionar Foto"
3. Selecione uma imagem
4. **Agora deve funcionar!** ✅

---

## 🎯 O Que o SQL Faz

```sql
Política 1: Permite UPLOAD (usuários autenticados)
Política 2: Permite LEITURA (público - para ver as fotos)
Política 3: Permite ATUALIZAÇÃO (usuários autenticados)
Política 4: Permite EXCLUSÃO (usuários autenticados)
```

---

## ⚠️ Se Ainda Der Erro

### Verifique se o bucket é PÚBLICO:

1. Vá para **Storage** no Supabase
2. Clique no bucket **receitas-fotos**
3. Vá em **"Configuration"**
4. Certifique-se que **"Public"** está ✅ MARCADO
5. Se não estiver, marque e salve

---

## ✅ Resultado Esperado

Após executar o SQL:

```
✅ Upload funciona
✅ Fotos aparecem na lista
✅ Pode trocar foto
✅ Pode remover foto
```

---

**Tempo total:** ~2 minutos  
**Arquivo SQL:** `SQL_FIX_RLS_STORAGE.sql`

