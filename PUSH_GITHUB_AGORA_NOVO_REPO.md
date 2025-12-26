# ⚡ Push para GitHub - Comandos Exatos

## 📍 Novo Repositório
```
https://github.com/ilucasmacedo/receita-facil
```

---

## 🚀 Comandos (Copie e Cole)

### ⚠️ IMPORTANTE: Use Git Bash!

O PowerShell pode não reconhecer o Git. **Use Git Bash** (procure no menu Iniciar).

---

### No Git Bash:

```bash
# 1. Navegar até a pasta
cd "/c/Users/imace/OneDrive/Documents/Receita facil"

# 2. Inicializar
git init

# 3. Adicionar tudo
git add .

# 4. Commit
git commit -m "feat: Receita Fácil - Sistema completo de gestão"

# 5. Conectar ao repositório
git remote add origin https://github.com/ilucasmacedo/receita-facil.git

# 6. Branch principal
git branch -M main

# 7. Push (vai pedir login)
git push -u origin main
```

---

## 🔐 Autenticação

Quando executar `git push`:

**Usuário:** `ilucasmacedo`

**Senha:** Use um **Personal Access Token**

### Como criar token:
1. GitHub → Settings → Developer settings → Personal access tokens → Tokens (classic)
2. Generate new token (classic)
3. Nome: `receita-facil`
4. Marque: `repo` ✅
5. Generate token
6. **COPIE O TOKEN** (aparece só uma vez!)
7. Use como senha no push

---

## ✅ Verificar

Depois do push:
```
https://github.com/ilucasmacedo/receita-facil
```

---

**Use Git Bash e execute os comandos acima!** 🚀

