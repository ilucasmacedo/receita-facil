# 🚀 Comandos Git - Novo Repositório

## 📍 Repositório Atualizado
```
https://github.com/ilucasmacedo/receita-facil
```

---

## ⚠️ Se Git Não Funcionar no PowerShell

O PowerShell pode não reconhecer o Git mesmo depois de instalado. Tente estas soluções:

### Solução 1: Git Bash (Recomendado)

1. Procure por **"Git Bash"** no menu Iniciar
2. Abra o **Git Bash**
3. Navegue até a pasta:
   ```bash
   cd "/c/Users/imace/OneDrive/Documents/Receita facil"
   ```
4. Execute os comandos abaixo

### Solução 2: Reiniciar PowerShell

1. **Feche TODOS os terminais PowerShell**
2. Abra um **NOVO PowerShell**
3. Execute:
   ```powershell
   git --version
   ```
4. Se aparecer versão, está funcionando!
5. Se não, use Git Bash

---

## 📋 Comandos para Executar

### No Git Bash ou PowerShell:

```bash
# 1. Inicializar repositório
git init

# 2. Adicionar todos os arquivos
git add .

# 3. Fazer commit inicial
git commit -m "feat: Receita Fácil - Sistema completo de gestão de receitas e precificação"

# 4. Conectar ao novo repositório
git remote add origin https://github.com/ilucasmacedo/receita-facil.git

# 5. Definir branch principal
git branch -M main

# 6. Fazer push
git push -u origin main
```

---

## 🔐 Autenticação

Quando executar `git push`, vai pedir credenciais:

### Opção 1: Personal Access Token (Recomendado)

1. GitHub → **Settings** → **Developer settings** → **Personal access tokens** → **Tokens (classic)**
2. **Generate new token (classic)**
3. Nome: `receita-facil`
4. Marque: `repo` (full control)
5. **Generate token**
6. **COPIE O TOKEN** (aparece só uma vez!)
7. Quando pedir senha, cole o token (não use sua senha do GitHub)

### Opção 2: GitHub CLI

Se tiver GitHub CLI instalado:
```bash
gh auth login
```

---

## ✅ Verificação

Depois do push:

1. Acesse: https://github.com/ilucasmacedo/receita-facil
2. Verifique que todos os arquivos apareceram
3. O README.md deve estar visível na página

---

## 🚨 Erros Comuns

### "remote origin already exists"
```bash
git remote remove origin
git remote add origin https://github.com/ilucasmacedo/receita-facil.git
```

### "fatal: not a git repository"
```bash
git init
# Depois repete os outros comandos
```

### "Permission denied"
- Use Personal Access Token em vez de senha
- Verifique que o token tem permissão `repo`

### "Git não encontrado"
- Use **Git Bash** em vez de PowerShell
- Ou reinicie o PowerShell após instalar Git

---

## 📝 Checklist

- [ ] Abriu Git Bash ou novo PowerShell
- [ ] Navegou até a pasta do projeto
- [ ] Executou `git init`
- [ ] Executou `git add .`
- [ ] Executou `git commit`
- [ ] Executou `git remote add origin ...`
- [ ] Executou `git branch -M main`
- [ ] Executou `git push`
- [ ] Verificou no GitHub que apareceu

---

**Recomendação:** Use **Git Bash** para garantir que funcione! 🚀

