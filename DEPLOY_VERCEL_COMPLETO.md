# 🚀 Deploy na Vercel - Guia Completo

## 📍 Objetivo
Publicar o projeto **Receita Fácil** na Vercel e torná-lo acessível publicamente.

---

## ✅ Passo 1: Tornar o Repositório Público no GitHub

### 1.1 Acessar Configurações do Repositório

1. Acesse: https://github.com/ilucasmacedo/receita-facil
2. Clique em **Settings** (no topo do repositório)
3. Role até a seção **"Danger Zone"** (no final da página)

### 1.2 Tornar Público

1. Clique em **"Change visibility"**
2. Selecione **"Make public"**
3. Digite o nome do repositório para confirmar: `ilucasmacedo/receita-facil`
4. Clique em **"I understand, change repository visibility"**

✅ **Pronto!** Seu repositório agora é público.

---

## 🚀 Passo 2: Deploy na Vercel

### 2.1 Criar Conta na Vercel

1. Acesse: https://vercel.com
2. Clique em **"Sign Up"**
3. Escolha **"Continue with GitHub"**
4. Autorize a Vercel a acessar seus repositórios

### 2.2 Importar Projeto

1. No dashboard da Vercel, clique em **"Add New..."** → **"Project"**
2. Você verá seus repositórios do GitHub
3. Encontre e clique em **`receita-facil`**
4. Clique em **"Import"**

### 2.3 Configurar o Projeto

A Vercel detecta automaticamente que é um projeto Next.js. Você verá:

**Framework Preset:** `Next.js` (já detectado) ✅

**Root Directory:** `.` (deixe como está)

**Build Command:** `npm run build` (já configurado) ✅

**Output Directory:** `.next` (já configurado) ✅

**Install Command:** `npm install` (já configurado) ✅

---

## 🔐 Passo 3: Configurar Variáveis de Ambiente

### 3.1 Adicionar Variáveis

Na tela de configuração do projeto, role até **"Environment Variables"**

Adicione estas duas variáveis:

#### Variável 1:
- **Name:** `NEXT_PUBLIC_SUPABASE_URL`
- **Value:** `[Cole sua URL do Supabase aqui]`
- **Environments:** Marque todas (Production, Preview, Development)

#### Variável 2:
- **Name:** `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- **Value:** `[Cole sua chave anon do Supabase aqui]`
- **Environments:** Marque todas (Production, Preview, Development)

### 3.2 Onde Encontrar as Credenciais do Supabase

1. Acesse: https://supabase.com/dashboard
2. Selecione seu projeto
3. Vá em **Settings** (ícone de engrenagem) → **API**
4. Copie:
   - **Project URL** → Use em `NEXT_PUBLIC_SUPABASE_URL`
   - **anon public key** → Use em `NEXT_PUBLIC_SUPABASE_ANON_KEY`

### 3.3 Exemplo de Valores

```env
NEXT_PUBLIC_SUPABASE_URL=https://xxxxxxxxxxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

⚠️ **IMPORTANTE:** Use os valores reais do seu projeto Supabase!

---

## 🎯 Passo 4: Fazer Deploy

1. Após adicionar as variáveis de ambiente, clique em **"Deploy"**
2. A Vercel vai:
   - Instalar dependências (`npm install`)
   - Fazer build do projeto (`npm run build`)
   - Publicar online

3. Aguarde 2-3 minutos (primeiro deploy é mais lento)

---

## ✅ Passo 5: Verificar Deploy

### 5.1 Acessar o Site

Após o deploy, você verá:

- **Status:** ✅ Ready
- **URL:** `https://receita-facil-xxxxx.vercel.app`

Clique na URL para acessar seu site!

### 5.2 Verificar se Está Funcionando

1. Acesse a URL fornecida pela Vercel
2. Você deve ver a tela de login do Receita Fácil
3. Teste criar uma conta ou fazer login

---

## 🔄 Passo 6: Configurar Domínio Personalizado (Opcional)

### 6.1 Adicionar Domínio

1. No dashboard do projeto na Vercel
2. Vá em **Settings** → **Domains**
3. Adicione seu domínio (ex: `receitafacil.com`)
4. Siga as instruções para configurar DNS

### 6.2 Usar Domínio da Vercel

A Vercel já fornece um domínio gratuito:
- Formato: `receita-facil-xxxxx.vercel.app`
- Já está funcionando! ✅

---

## 📊 Passo 7: Deploys Automáticos

### 7.1 Deploy Automático

A Vercel faz deploy automático quando você:

- Faz push para a branch `main` no GitHub
- Cria um Pull Request
- Faz merge de PR

### 7.2 Ver Deploys

1. No dashboard do projeto
2. Aba **"Deployments"**
3. Veja histórico de todos os deploys

---

## 🔐 Segurança

### ✅ O Que Está Seguro

- ✅ Variáveis de ambiente são privadas (não aparecem no código)
- ✅ `.env.local` não vai para o GitHub (está no .gitignore)
- ✅ Credenciais do Supabase ficam apenas na Vercel

### ⚠️ Importante

- Use apenas a **anon key** do Supabase (não a service role key)
- A anon key é segura para usar no frontend
- Row Level Security (RLS) protege os dados no Supabase

---

## 🚨 Resolução de Problemas

### Erro: "Build Failed"

**Causa comum:** Variáveis de ambiente não configuradas

**Solução:**
1. Vá em **Settings** → **Environment Variables**
2. Verifique se ambas as variáveis estão configuradas
3. Faça um novo deploy

### Erro: "Missing Supabase environment variables"

**Solução:**
1. Verifique se as variáveis estão com os nomes corretos:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
2. Verifique se estão marcadas para **Production**
3. Faça um novo deploy

### Site não carrega / Erro 500

**Possíveis causas:**
1. Variáveis de ambiente incorretas
2. Supabase não configurado corretamente
3. Tabelas não criadas no Supabase

**Solução:**
1. Verifique os logs na Vercel: **Deployments** → Clique no deploy → **Logs**
2. Verifique se as tabelas existem no Supabase
3. Teste localmente primeiro (`npm run dev`)

---

## 📋 Checklist Final

Antes de fazer deploy, certifique-se:

- [ ] Repositório está público no GitHub
- [ ] Conta na Vercel criada
- [ ] Projeto importado na Vercel
- [ ] Variáveis de ambiente configuradas:
  - [ ] `NEXT_PUBLIC_SUPABASE_URL`
  - [ ] `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- [ ] Deploy realizado
- [ ] Site acessível e funcionando

---

## 🎉 Pronto!

Seu projeto está online e acessível publicamente!

**URL do seu site:** `https://receita-facil-xxxxx.vercel.app`

**Repositório:** https://github.com/ilucasmacedo/receita-facil

---

## 📝 Comandos Úteis

### Ver logs do deploy
- Dashboard Vercel → Deployments → Clique no deploy → Logs

### Fazer novo deploy manual
- Dashboard Vercel → Deployments → "..." → Redeploy

### Atualizar variáveis de ambiente
- Settings → Environment Variables → Editar → Redeploy

---

**Tempo estimado:** 10-15 minutos  
**Dificuldade:** Fácil  
**Resultado:** Site público online! 🚀

