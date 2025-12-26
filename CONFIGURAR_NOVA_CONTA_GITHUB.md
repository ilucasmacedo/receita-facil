# 🔄 Configurar Git para Nova Conta GitHub

## 📍 Nova Conta
```
https://github.com/ilucasmacedo/receita-facil
```

---

## ⚡ Passos para Configurar

### 1. Encontrar o Git

O Git está instalado mas pode não estar no PATH. Tente encontrar em:

- `C:\Program Files\Git\bin\git.exe`
- `C:\Program Files (x86)\Git\bin\git.exe`
- Ou use o **Git Bash** (procure no menu Iniciar)

### 2. Abrir Terminal no Projeto

**Opção A: Git Bash (Recomendado)**
1. Clique com botão direito na pasta do projeto
2. Selecione **"Git Bash Here"**

**Opção B: PowerShell**
1. Abra PowerShell na pasta do projeto
2. Se o Git não funcionar, adicione ao PATH temporariamente:
```powershell
$env:PATH += ";C:\Program Files\Git\bin"
```

### 3. Executar Comandos

Copie e cole estes comandos **um por vez**:

```bash
# 1. Verificar Git
git --version

# 2. Inicializar repositório (se não existir)
git init

# 3. Remover remote antigo (se existir)
git remote remove origin

# 4. Adicionar novo remote
git remote add origin https://github.com/ilucasmacedo/receita-facil.git

# 5. Verificar remote
git remote -v

# 6. Adicionar todos os arquivos
git add .

# 7. Fazer commit
git commit -m "feat: Receita Facil - Sistema completo de gestao de receitas e precificacao"

# 8. Configurar branch main
git branch -M main

# 9. Fazer push (vai pedir credenciais)
git push -u origin main
```

---

## 🔐 Autenticação no Push

Quando executar `git push`, o GitHub vai pedir credenciais:

### Opção 1: Personal Access Token (Recomendado)

1. Acesse: https://github.com/settings/tokens
2. Clique em **"Generate new token (classic)"**
3. Dê um nome: `Receita Facil`
4. Marque a opção: **`repo`** (full control)
5. Clique em **"Generate token"**
6. **COPIE O TOKEN** (aparece só uma vez!)

Quando pedir credenciais:
- **Usuário:** `ilucasmacedo`
- **Senha:** `[cole o token aqui]`

### Opção 2: GitHub CLI

```bash
# Instalar GitHub CLI: https://cli.github.com/
gh auth login
git push -u origin main
```

---

## ✅ Verificar

Depois do push:

1. Acesse: https://github.com/ilucasmacedo/receita-facil
2. Você deve ver todos os arquivos
3. O README.md aparece automaticamente na página

---

## 🚨 Problemas Comuns

### "Git não encontrado"

**Solução:** Use o Git Bash em vez do PowerShell, ou adicione o Git ao PATH:

```powershell
# No PowerShell, adicione temporariamente:
$env:PATH += ";C:\Program Files\Git\bin"

# Ou adicione permanentemente nas Variáveis de Ambiente do Windows
```

### "remote origin already exists"

```bash
git remote remove origin
git remote add origin https://github.com/ilucasmacedo/receita-facil.git
```

### "fatal: not a git repository"

```bash
git init
# Depois repete os comandos
```

### "fatal: refusing to merge unrelated histories"

```bash
git pull origin main --allow-unrelated-histories
git push -u origin main
```

### "Authentication failed"

- Verifique se o token está correto
- Certifique-se de que marcou a opção `repo` ao criar o token
- Tente criar um novo token

---

## 📝 Resumo dos Comandos

```bash
git init
git remote remove origin
git remote add origin https://github.com/ilucasmacedo/receita-facil.git
git add .
git commit -m "feat: Receita Facil - Sistema completo"
git branch -M main
git push -u origin main
```

---

**Pronto!** Seu código estará em: https://github.com/ilucasmacedo/receita-facil 🎉

