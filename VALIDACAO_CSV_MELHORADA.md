# ✅ Validação de CSV Melhorada

## 🎯 O que foi melhorado:

### **1. Coluna "Motivo" Adicionada**
Agora cada linha mostra **exatamente** o que está errado:

| Status | Nome | Preço | Qtd | Unidade | **Motivo** |
|--------|------|-------|-----|---------|------------|
| ❌ Erro | Ovos | Inválido | 12 | g | **Preço inválido: "abc" não é um número** |
| ❌ Erro | Açúcar | R$ 5,50 | 1000 | g | **Caracteres especiais corrompidos (problema de encoding)** |
| ❌ Erro | Farinha | R$ 0,00 | -5 | g | **Quantidade deve ser maior que zero (valor: -5)** |
| ⚠️ Duplicado | Leite | R$ 5,80 | 1000 | ml | **Já existe no estoque** |
| ✅ Novo | Manteiga | R$ 18,00 | 500 | g | **✓ Pronto para importar** |

---

## 🔍 Tipos de Erros Detectados:

### **1. Problemas de Encoding (Caracteres Especiais)**
**O que detecta:**
- Caracteres como `�`, `Ã`, `Ã§`, `Ã©`
- Acentos corrompidos: Açúcar → "AÃ§Ãºcar"

**Mensagem:**
```
Caracteres especiais corrompidos (problema de encoding)
```

**Alerta Especial:**
Quando detectado, aparece um banner laranja no topo com instruções:
- Como salvar o arquivo com UTF-8
- Passo a passo para corrigir no Bloco de Notas
- Alternativa usando Excel

---

### **2. Erros de Nome**
**Mensagens:**
- `Nome está vazio` - Primeira coluna em branco
- `Caracteres especiais corrompidos` - Acentos/ç corrompidos

---

### **3. Erros de Preço**
**Mensagens:**
- `Preço está vazio` - Coluna preço em branco
- `Use ponto (.) ao invés de vírgula (,) no preço` - Detecta "10,50"
- `Preço inválido: "abc" não é um número` - Texto no lugar de número
- `Preço deve ser maior que zero (valor: R$ 0)` - Preço zero ou negativo

---

### **4. Erros de Quantidade**
**Mensagens:**
- `Quantidade está vazia` - Coluna quantidade em branco
- `Use ponto (.) ao invés de vírgula (,) na quantidade` - Detecta "1,5"
- `Quantidade inválida: "xyz" não é um número` - Texto no lugar de número
- `Quantidade deve ser maior que zero (valor: -5)` - Quantidade negativa

---

### **5. Erros de Unidade**
**Mensagens:**
- `Unidade está vazia` - Coluna unidade em branco
- `Unidade "litros" inválida. Use: g, kg, ml, L ou un` - Unidade não reconhecida

---

### **6. Erros de Formato**
**Mensagens:**
- `Faltam colunas (encontrado 2, esperado 4)` - Linha incompleta

---

## 🎨 Melhorias Visuais:

### **1. Linhas com Erro em Destaque**
- Fundo vermelho claro para facilitar identificação
- Valores inválidos mostram "Inválido" em vermelho

### **2. Banner de Alerta de Encoding**
Quando detectado problema de acentuação:
```
⚠️ Problema de Encoding Detectado

Seu arquivo CSV contém caracteres especiais corrompidos (acentos, ç, etc).

▼ Como corrigir:
1. Abra o arquivo no Bloco de Notas
2. Clique em Arquivo > Salvar Como
3. Na opção de Codificação, selecione UTF-8
4. Salve e importe novamente
```

### **3. Botão "Baixar Erros"**
Se houver erros, aparece um botão vermelho:
- **"Baixar Erros"** - Gera um CSV só com os erros
- Contém todas as colunas + coluna "erro" com a explicação
- Facilita correção em massa

---

## 📊 Exemplo Visual:

### **Antes (Ruim):**
```
Status: ❌ Erro
Motivo: (nenhum, precisa adivinhar)
```

### **Agora (Bom):**
```
Status: ❌ Erro
Motivo: Preço inválido: "R$ 10,50" não é um número
        Use ponto (.) ao invés de vírgula (,) no preço
```

---

## 🛠️ Como Usar:

### **1. Importar CSV:**
1. Clique em "Importar CSV"
2. Selecione o arquivo
3. **NOVO:** Veja o motivo específico de cada erro

### **2. Se houver erros de encoding:**
1. Leia o banner laranja no topo
2. Siga as instruções
3. Reimporte o arquivo corrigido

### **3. Se houver muitos erros:**
1. Clique em "Baixar Erros"
2. Abra o arquivo `erros_importacao.csv`
3. Corrija os erros no Excel
4. Reimporte

---

## 📝 Exemplo de Correção:

### **Arquivo Original (com erros):**
```csv
nome,preco_compra,quantidade_total,unidade
Açúcar,10,50,1,kg
Farinha,,1000,g
Leite,5.80,abc,ml
Chocolate,8.00,200,litros
```

### **Erros Detectados:**
| Linha | Problema | Solução |
|-------|----------|---------|
| 1 (Açúcar) | Caracteres corrompidos | Salvar como UTF-8 |
| 2 (Açúcar) | Vírgula no preço | Trocar "10,50" → "10.50" |
| 3 (Farinha) | Preço vazio | Adicionar preço |
| 4 (Leite) | Quantidade inválida | Trocar "abc" → "1000" |
| 5 (Chocolate) | Unidade inválida | Trocar "litros" → "ml" |

### **Arquivo Corrigido:**
```csv
nome,preco_compra,quantidade_total,unidade
Açúcar,10.50,1,kg
Farinha,5.20,1000,g
Leite,5.80,1000,ml
Chocolate,8.00,200,g
```

---

## 🎯 Resumo das Melhorias:

| Antes | Agora |
|-------|-------|
| ❌ Só mostrava "Erro" | ✅ Mostra motivo específico |
| ❌ Tinha que adivinhar o problema | ✅ Explica exatamente o que está errado |
| ❌ Sem ajuda para encoding | ✅ Banner com instruções passo a passo |
| ❌ Difícil corrigir muitos erros | ✅ Botão para baixar lista de erros |
| ❌ Valores inválidos não destacados | ✅ Mostra "Inválido" em vermelho |
| ❌ Linhas de erro se perdiam | ✅ Fundo vermelho claro |

---

## 🐛 Problemas Comuns Resolvidos:

### **Problema 1: "Não sei o que está errado"**
✅ **Solução:** Coluna "Motivo" com explicação detalhada

### **Problema 2: "Acentos aparecem como �"**
✅ **Solução:** Banner de alerta + instruções de como salvar UTF-8

### **Problema 3: "Muitos erros, difícil corrigir um por um"**
✅ **Solução:** Botão "Baixar Erros" gera CSV para correção em massa

### **Problema 4: "Usei vírgula ao invés de ponto"**
✅ **Solução:** Detecta e explica: "Use ponto (.) ao invés de vírgula (,)"

### **Problema 5: "Não sei quais unidades são válidas"**
✅ **Solução:** Lista unidades aceitas: "Use: g, kg, ml, L ou un"

---

## ✅ Checklist de Importação:

Antes de importar, verifique se seu CSV:
- [ ] Está salvo com encoding **UTF-8**
- [ ] Usa **ponto** como separador decimal (10.50 ✓ não 10,50 ✗)
- [ ] Não tem **R$** nos preços
- [ ] Usa unidades válidas: **g, kg, ml, L, un**
- [ ] Não tem **campos vazios**
- [ ] Tem **4 colunas** em cada linha

Se aparecer erros:
- [ ] Leia a coluna **"Motivo"**
- [ ] Siga as instruções específicas
- [ ] Se muitos erros, use **"Baixar Erros"**
- [ ] Corrija e reimporte

---

**Agora fica muito mais fácil identificar e corrigir erros! 🎉**

