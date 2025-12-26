# 📦 Instalar Git no Windows

## ⚠️ Git Não Encontrado

O sistema não encontrou o Git instalado. Você tem 2 opções:

---

## 🎯 Opção 1: GitHub Desktop (RECOMENDADO - Mais Fácil)

### 1. Download
```
https://desktop.github.com/
```

### 2. Instalar
- Baixe o instalador
- Execute e instale
- Faça login com sua conta GitHub (`saasfacil`)

### 3. Publicar Repositório

1. Abra o **GitHub Desktop**
2. Menu: **File → Add Local Repository**
3. Escolha a pasta: `C:\Users\imace\OneDrive\Documents\Receita facil`
4. Clique em **"Publish repository"**
5. Selecione: `saasfacil/receita-facil`
6. Marque: **"Keep this code private"** (se quiser) ou deixe desmarcado para público
7. Clique em **"Publish repository"**
8. **PRONTO!** ✅

---

## 🎯 Opção 2: Git via Terminal (Mais Técnico)

### 1. Download do Git
```
https://git-scm.com/download/win
```

### 2. Instalar
- Execute o instalador
- Durante instalação:
  - ✅ Use recommended settings
  - ✅ Deixe tudo padrão
  - ✅ Quando perguntar sobre PATH: **"Git from the command line and also from 3rd-party software"**
  - ✅ Finish

### 3. Reiniciar Terminal
- Feche todos os terminais
- Abra um **novo PowerShell** ou **Git Bash**
- Na pasta do projeto, execute:

```bash
# Verificar se instalou
git --version

# Se aparecer versão, então executar:
git init
git add .
git commit -m "feat: Receita Fácil - Sistema completo de gestão"
git remote add origin https://github.com/saasfacil/receita-facil.git
git branch -M main
git push -u origin main
```

---

## ⚡ Opção 3: Git via Winget (Windows 10/11)

Se você tem **Windows 10/11** e **Winget** instalado:

```powershell
# Abrir PowerShell como Administrador
winget install --id Git.Git -e --source winget

# Depois reiniciar terminal e executar os comandos
```

---

## 🎯 Recomendação: GitHub Desktop

**Por quê?**
- ✅ Interface visual
- ✅ Mais fácil para iniciantes
- ✅ Não precisa decorar comandos
- ✅ Login automático
- ✅ Upload com 3 cliques

**Tempo:** ~2 minutos  
**Dificuldade:** Muito fácil ⭐

---

## 📋 Depois de Instalar

### Com GitHub Desktop:
1. Abra o app
2. File → Add Local Repository
3. Publish repository
4. Pronto!

### Com Git Terminal:
1. Abra novo terminal
2. Execute os 6 comandos que você tinha
3. Pronto!

---

## ✅ Verificar Se Funcionou

Depois do upload, acesse:
```
https://github.com/saasfacil/receita-facil
```

Você deve ver todos os arquivos lá! 🎉

---

**Recomendação:** Use **GitHub Desktop** - é mais fácil e rápido!

