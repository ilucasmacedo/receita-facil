# 🔄 Mudar Conta GitHub no GitHub Desktop

## 📍 Nova Conta
```
https://github.com/ilucasmacedo/receita-facil
```

---

## ⚡ Passos no GitHub Desktop

### 1. Abrir Configurações do Repositório

1. No GitHub Desktop, vá em **Repository** → **Repository Settings** (ou pressione `Ctrl + ,`)
2. Ou clique no menu **Repository** no topo e selecione **Repository Settings**

### 2. Mudar o Remote URL

1. Na janela de configurações, procure a seção **"Remote"** ou **"Primary remote repository"**
2. Você verá o URL atual (provavelmente `https://github.com/saasfacil/receita-facil.git`)
3. Clique em **"Edit"** ou **"Change"**
4. Altere para: `https://github.com/ilucasmacedo/receita-facil.git`
5. Clique em **"Save"** ou **"OK"**

### 3. Verificar se Mudou

1. Volte para a tela principal
2. Clique em **Repository** → **View on GitHub**
3. Deve abrir: `https://github.com/ilucasmacedo/receita-facil`

---

## 🔄 Alternativa: Via Menu Repository

Se não encontrar as configurações:

1. **Repository** → **Repository Settings**
2. Na aba **Remote**, altere o URL
3. Salve

---

## 📤 Fazer Push (se necessário)

Se você já tem commits locais que não foram enviados:

1. Na tela principal do GitHub Desktop
2. Se houver commits não enviados, você verá um botão **"Push origin"**
3. Clique para enviar para a nova conta

---

## ✅ Verificar

1. Clique em **Repository** → **View on GitHub**
2. Deve abrir: `https://github.com/ilucasmacedo/receita-facil`
3. Todos os seus arquivos devem estar lá

---

## 🚨 Se Não Conseguir Mudar no GitHub Desktop

Use o terminal integrado do GitHub Desktop:

1. No GitHub Desktop, vá em **Repository** → **Open in Git Bash**
2. Execute estes comandos:

```bash
# Ver remote atual
git remote -v

# Remover remote antigo
git remote remove origin

# Adicionar novo remote
git remote add origin https://github.com/ilucasmacedo/receita-facil.git

# Verificar
git remote -v

# Fazer push (se necessário)
git push -u origin main
```

---

## 🔐 Autenticação

Quando fizer push, o GitHub Desktop pode pedir para autenticar:

1. Vá em **File** → **Options** → **Accounts**
2. Certifique-se de estar logado com a conta `ilucasmacedo`
3. Se não estiver, faça login com essa conta

---

**Pronto!** Seu repositório agora está conectado à conta `ilucasmacedo` 🎉

