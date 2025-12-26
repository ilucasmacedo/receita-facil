# 📦 Guia: Subir para o GitHub

## 🎯 Passo a Passo Completo

### 1. Preparar o Projeto (2 min)

Os arquivos já estão prontos:
- ✅ `.gitignore` atualizado
- ✅ `README_GITHUB.md` criado
- ✅ Documentação completa

---

### 2. Inicializar Git (30 seg)

Abra o terminal no projeto e execute:

```bash
# Inicializar repositório
git init

# Adicionar todos os arquivos
git add .

# Primeiro commit
git commit -m "feat: Projeto Receita Fácil - Sistema de gestão de receitas e precificação"
```

---

### 3. Criar Repositório no GitHub (1 min)

1. Vá para [GitHub](https://github.com)
2. Clique em **"New repository"** (botão verde +)
3. Preencha:
   - **Repository name:** `receita-facil`
   - **Description:** `Sistema de gestão de receitas e precificação para pequenos empreendedores culinários`
   - **Visibilidade:** 
     - ✅ **Public** (recomendado para portfólio)
     - ⚪ Private (se quiser manter privado)
   - ❌ **NÃO** marque "Initialize with README" (já temos)
4. Clique em **"Create repository"**

---

### 4. Conectar e Fazer Push (1 min)

O GitHub vai mostrar comandos. Execute no terminal:

```bash
# Adicionar remote (SUBSTITUA SEU_USUARIO pelo seu usuário do GitHub)
git remote add origin https://github.com/SEU_USUARIO/receita-facil.git

# Definir branch principal
git branch -M main

# Fazer push
git push -u origin main
```

**Exemplo:**
```bash
git remote add origin https://github.com/joaosilva/receita-facil.git
git branch -M main
git push -u origin main
```

---

### 5. Verificar (30 seg)

1. Atualize a página do GitHub
2. Você deve ver todos os arquivos
3. O README será exibido automaticamente

---

## 📋 Checklist

- [ ] Executou `git init`
- [ ] Executou `git add .`
- [ ] Executou `git commit -m "..."`
- [ ] Criou repositório no GitHub
- [ ] Executou `git remote add origin ...`
- [ ] Executou `git push -u origin main`
- [ ] Verificou que os arquivos apareceram no GitHub

---

## 🔑 Autenticação

Se o GitHub pedir credenciais:

### Opção 1: Personal Access Token (Recomendado)

1. GitHub → **Settings** → **Developer settings** → **Personal access tokens** → **Tokens (classic)**
2. **Generate new token** → **Generate new token (classic)**
3. Marque: `repo` (full control)
4. Copie o token
5. Use como senha quando fizer push

### Opção 2: SSH (Mais seguro)

Veja: [Guia de SSH do GitHub](https://docs.github.com/en/authentication/connecting-to-github-with-ssh)

---

## 📝 Renomear README

Depois do push, renomeie localmente:

```bash
# Renomear para README.md (padrão do GitHub)
mv README_GITHUB.md README.md

# Commit
git add .
git commit -m "docs: Renomear README para padrão do GitHub"
git push
```

---

## 🚀 Próximo Passo: Deploy

Depois de subir no GitHub, você pode fazer deploy em:

### Vercel (Recomendado - Grátis)

1. Vá para [Vercel](https://vercel.com)
2. Faça login com GitHub
3. **Import Project**
4. Selecione `receita-facil`
5. Adicione variáveis de ambiente:
   ```
   NEXT_PUBLIC_SUPABASE_URL=...
   NEXT_PUBLIC_SUPABASE_ANON_KEY=...
   ```
6. **Deploy**
7. Pronto! Seu app estará online em minutos

---

## 🔄 Comandos Git Úteis

```bash
# Ver status
git status

# Ver histórico
git log --oneline

# Criar nova branch
git checkout -b feature/nova-funcionalidade

# Voltar para main
git checkout main

# Atualizar repositório
git add .
git commit -m "Sua mensagem"
git push
```

---

## 📦 .gitignore Configurado

Arquivos que **NÃO** vão para o GitHub (já configurado):

```
✅ node_modules/
✅ .env.local
✅ .next/
✅ /terminals
✅ *.log
```

---

## 🎨 Melhorar o README

Depois do push, você pode:

1. Adicionar screenshot do app
2. Atualizar link do repositório
3. Adicionar badges de CI/CD
4. Adicionar demo online

---

## ⚠️ Avisos Importantes

```
❌ NUNCA commite .env.local (já está no .gitignore)
❌ NUNCA commite credenciais do Supabase
❌ NUNCA commite node_modules
✅ Sempre revise com "git status" antes de commit
✅ Use mensagens de commit descritivas
```

---

## 📊 Estrutura de Commits Sugerida

```
feat: Nova funcionalidade
fix: Correção de bug
docs: Atualização de documentação
style: Formatação de código
refactor: Refatoração
test: Adição de testes
```

**Exemplos:**
```bash
git commit -m "feat: Adicionar filtro por tipo de receita"
git commit -m "fix: Corrigir cálculo de estoque"
git commit -m "docs: Atualizar guia de instalação"
```

---

## 🎉 Resultado Final

Depois de seguir todos os passos:

```
✅ Projeto no GitHub
✅ Código versionado
✅ README profissional
✅ Pronto para colaboração
✅ Pronto para deploy
✅ Portfólio atualizado
```

---

**Tempo total:** ~5 minutos  
**Dificuldade:** Fácil ⭐  
**Resultado:** Projeto público no GitHub 🎉

