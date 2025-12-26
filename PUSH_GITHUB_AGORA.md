# 🚀 Push para GitHub - Comandos Exatos

## 📍 Seu Repositório
```
https://github.com/ilucasmacedo/receita-facil
```

---

## ⚡ Comandos para Executar (Copie e Cole)

### Se Git NÃO está Instalado

1. **Baixar Git:** https://git-scm.com/download/win
2. Instalar (só clicar "Next" em tudo)
3. **Reabrir o terminal** após instalar

---

### Se Git JÁ está Instalado (ou após instalar)

Abra o **PowerShell** ou **Git Bash** na pasta do projeto e execute:

```bash
# 1. Verificar se git está instalado
git --version

# 2. Inicializar repositório (se ainda não tiver)
git init

# 3. Adicionar todos os arquivos
git add .

# 4. Fazer commit inicial
git commit -m "feat: Receita Fácil - Sistema completo de gestão de receitas e precificação"

# 5. Conectar ao GitHub
git remote add origin https://github.com/ilucasmacedo/receita-facil.git

# 6. Definir branch principal
git branch -M main

# 7. Fazer push (vai pedir login do GitHub)
git push -u origin main
```

---

## 🔐 Autenticação

Quando executar `git push`, o GitHub vai pedir credenciais:

### Opção 1: GitHub CLI (Mais Fácil)
```bash
# Instalar GitHub CLI
# Download: https://cli.github.com/

# Fazer login
gh auth login

# Depois fazer push normalmente
git push -u origin main
```

### Opção 2: Personal Access Token

1. GitHub → **Settings** → **Developer settings** → **Personal access tokens** → **Tokens (classic)**
2. **Generate new token (classic)**
3. Marque: `repo` (full control)
4. **Generate token**
5. **Copie o token** (aparece só uma vez!)
6. Use como **senha** quando fizer push:
   - Usuário: `ilucasmacedo`
   - Senha: `[cole o token aqui]`

---

## ✅ Verificação

Depois do push:

1. Acesse: https://github.com/ilucasmacedo/receita-facil
2. Você deve ver todos os arquivos
3. O README.md aparece automaticamente na página

---

## 🚨 Se Der Erro

### Erro: "fatal: not a git repository"
```bash
git init
# Depois repete os comandos
```

### Erro: "remote origin already exists"
```bash
git remote remove origin
git remote add origin https://github.com/ilucasmacedo/receita-facil.git
```

### Erro: "fatal: refusing to merge unrelated histories"
```bash
git pull origin main --allow-unrelated-histories
git push -u origin main
```

---

## 📊 O Que Vai Para o GitHub

✅ **Código completo**
✅ **README.md**
✅ **Documentação**
✅ **Scripts SQL**
✅ **Guias**

❌ **NÃO vai:**
- `.env.local` (credenciais)
- `node_modules/` (dependências)
- `.next/` (build temporário)

*(Já configurado no .gitignore)*

---

## 🎯 Próximo Passo: Deploy

Depois do push no GitHub, faça deploy na **Vercel**:

1. Vá para: https://vercel.com
2. Faça login com GitHub
3. **Import Project**
4. Selecione: `ilucasmacedo/receita-facil`
5. Adicione variáveis:
   ```
   NEXT_PUBLIC_SUPABASE_URL=sua_url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=sua_chave
   ```
6. **Deploy**
7. Pronto! App online em minutos! 🎉

---

**Tempo total:** ~5 minutos  
**Resultado:** Código no GitHub ✅

