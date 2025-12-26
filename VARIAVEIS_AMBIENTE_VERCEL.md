# 🔐 Variáveis de Ambiente para Vercel

## 📋 Variáveis Necessárias

Você precisa adicionar **2 variáveis de ambiente** na Vercel:

---

## ✅ Variável 1: NEXT_PUBLIC_SUPABASE_URL

### Como Preencher na Vercel:

1. Na seção **"Environment Variables"**, clique em **"+ Add More"**
2. No campo **"Key"**, digite:
   ```
   NEXT_PUBLIC_SUPABASE_URL
   ```
3. No campo **"Value"**, cole a URL do seu projeto Supabase

### Onde Encontrar o Valor:

1. Acesse: https://supabase.com/dashboard
2. Selecione seu projeto
3. Vá em **Settings** (ícone de engrenagem) → **API**
4. Procure por **"Project URL"**
5. Copie a URL completa (exemplo: `https://xxxxxxxxxxxxx.supabase.co`)

### Exemplo:
```
Key: NEXT_PUBLIC_SUPABASE_URL
Value: https://abcdefghijklmnop.supabase.co
```

---

## ✅ Variável 2: NEXT_PUBLIC_SUPABASE_ANON_KEY

### Como Preencher na Vercel:

1. Clique em **"+ Add More"** novamente
2. No campo **"Key"**, digite:
   ```
   NEXT_PUBLIC_SUPABASE_ANON_KEY
   ```
3. No campo **"Value"**, cole a chave anon do Supabase

### Onde Encontrar o Valor:

1. Na mesma página do Supabase (Settings → API)
2. Procure por **"anon public"** ou **"anon key"**
3. Clique em **"Reveal"** ou **"Show"** para ver a chave
4. Copie a chave completa (é uma string longa começando com `eyJ...`)

### Exemplo:
```
Key: NEXT_PUBLIC_SUPABASE_ANON_KEY
Value: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFiY2RlZmdoaWprbG1ub3AiLCJyb2xlIjoiYW5vbiIsImlhdCI6MTYzODU2NzI5MCwiZXhwIjoxOTU0MTQzMjkwfQ.xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
```

---

## 📝 Resumo - O Que Adicionar

Na tela da Vercel, você deve ter:

| Key | Value |
|-----|-------|
| `NEXT_PUBLIC_SUPABASE_URL` | `https://seu-projeto.supabase.co` |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...` |

---

## ⚠️ Importante

1. **Use a chave "anon"** (não a "service_role")
2. **Copie os valores completos** (sem espaços extras)
3. **Não compartilhe essas chaves** publicamente
4. As variáveis ficam seguras na Vercel (não aparecem no código)

---

## 🎯 Passo a Passo na Tela da Vercel

### 1. Remover a Variável de Exemplo (se houver)
- Clique no botão **"-"** ao lado de `EXAMPLE_NAME`

### 2. Adicionar Primeira Variável
- Clique em **"+ Add More"**
- **Key:** `NEXT_PUBLIC_SUPABASE_URL`
- **Value:** Cole a URL do Supabase

### 3. Adicionar Segunda Variável
- Clique em **"+ Add More"** novamente
- **Key:** `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- **Value:** Cole a chave anon do Supabase

### 4. Verificar
Você deve ter exatamente **2 variáveis**:
- ✅ `NEXT_PUBLIC_SUPABASE_URL`
- ✅ `NEXT_PUBLIC_SUPABASE_ANON_KEY`

### 5. Fazer Deploy
- Role até o final da página
- Clique no botão **"Deploy"**

---

## 🔍 Como Verificar se Está Correto

### Nomes das Variáveis:
- ✅ `NEXT_PUBLIC_SUPABASE_URL` (com NEXT_PUBLIC_ no início)
- ✅ `NEXT_PUBLIC_SUPABASE_ANON_KEY` (com NEXT_PUBLIC_ no início)

### Valores:
- ✅ URL começa com `https://` e termina com `.supabase.co`
- ✅ Chave anon começa com `eyJ` e é uma string muito longa

---

## 🚨 Se Não Tiver as Credenciais do Supabase

Se você ainda não criou o projeto no Supabase:

1. Acesse: https://supabase.com
2. Crie uma conta gratuita
3. Crie um novo projeto
4. Aguarde alguns minutos
5. Vá em Settings → API
6. Copie as credenciais

---

**Pronto!** Após adicionar essas 2 variáveis, clique em **"Deploy"**! 🚀

