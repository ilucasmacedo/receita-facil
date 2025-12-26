# 📝 Passo a Passo: Renomear ENV_EXAMPLE.txt

## 🎯 Objetivo
Renomear `ENV_EXAMPLE.txt` para `.env.example`

---

## 🖥️ Método 1: Explorador do Windows (Mais Fácil)

### Passo 1: Abrir a Pasta
1. Abra o **Explorador de Arquivos** do Windows
2. Navegue até:
   ```
   C:\Users\imace\OneDrive\Documents\Receita facil
   ```

### Passo 2: Localizar o Arquivo
1. Procure por: **`ENV_EXAMPLE.txt`**
2. Você deve ver o arquivo na lista

### Passo 3: Renomear
**Opção A: Clique Duplo Lento**
1. Clique **UMA VEZ** no arquivo (para selecionar)
2. Aguarde 1 segundo
3. Clique **OUTRA VEZ** (não clique rápido, senão abre o arquivo)
4. O nome do arquivo fica editável
5. Apague tudo e digite: **`.env.example`**
6. Pressione **Enter**

**Opção B: Botão Direito**
1. Clique com o **botão direito** em `ENV_EXAMPLE.txt`
2. Selecione **"Renomear"**
3. Digite: **`.env.example`**
4. Pressione **Enter**

### Passo 4: Confirmar
1. Windows pode avisar: "Se você alterar uma extensão de arquivo, o arquivo pode ficar inutilizável"
2. Clique em **"Sim"** ✅
3. Pronto! O arquivo agora se chama `.env.example`

---

## 💻 Método 2: PowerShell (Terminal)

### Passo 1: Abrir PowerShell
1. Pressione **Windows + R**
2. Digite: `powershell`
3. Pressione **Enter**

### Passo 2: Navegar até a Pasta
```powershell
cd "C:\Users\imace\OneDrive\Documents\Receita facil"
```

### Passo 3: Renomear
```powershell
Rename-Item -Path "ENV_EXAMPLE.txt" -NewName ".env.example"
```

### Passo 4: Verificar
```powershell
dir .env.example
```
Se aparecer o arquivo, deu certo! ✅

---

## 🔧 Método 3: CMD (Prompt de Comando)

### Passo 1: Abrir CMD
1. Pressione **Windows + R**
2. Digite: `cmd`
3. Pressione **Enter**

### Passo 2: Navegar até a Pasta
```cmd
cd /d "C:\Users\imace\OneDrive\Documents\Receita facil"
```

### Passo 3: Renomear
```cmd
ren ENV_EXAMPLE.txt .env.example
```

### Passo 4: Verificar
```cmd
dir .env.example
```

---

## ✅ Verificação Final

Depois de renomear, verifique:

1. Abra a pasta do projeto
2. Procure por: **`.env.example`** (sem .txt)
3. Se encontrar, está correto! ✅

---

## 🎯 Visual

**ANTES:**
```
📄 ENV_EXAMPLE.txt
```

**DEPOIS:**
```
📄 .env.example
```

---

## ⚠️ Observações Importantes

1. **Ponto no início:** O arquivo deve começar com ponto (`.`)
2. **Sem extensão:** Não deve ter `.txt` no final
3. **Nome completo:** `.env.example` (com ponto antes do env)
4. **Windows pode ocultar:** Arquivos que começam com ponto podem ficar ocultos no Windows

---

## 🔍 Se o Arquivo Sumiu (Oculto)

Se renomeou mas não vê o arquivo:

1. No Explorador, vá em **"Visualizar"**
2. Marque: **"Itens ocultos"** ✅
3. O arquivo `.env.example` deve aparecer

---

## ✅ Resultado Esperado

Após renomear corretamente:
```
✅ Arquivo .env.example existe
✅ Sem extensão .txt
✅ Começa com ponto (.)
✅ Visível no projeto
```

---

**Escolha o método que achar mais fácil! Recomendo o Método 1 (Explorador).** 🎉

