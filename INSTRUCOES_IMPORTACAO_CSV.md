# 📊 Guia de Importação de Ingredientes via CSV

## ✅ O que foi implementado:

### **Funcionalidades:**
- ✅ Upload de arquivo CSV
- ✅ Validação automática de dados
- ✅ Detecção de duplicatas
- ✅ Preview antes de importar
- ✅ 3 estratégias para lidar com duplicatas
- ✅ Download de template CSV
- ✅ Normalização automática de unidades (kg→g, L→ml)
- ✅ Registro automático no histórico de compras
- ✅ Feedback de progresso

---

## 🚀 Como usar:

### **Passo 1: Baixar o Template**

1. Vá na página **Ingredientes**
2. Clique no botão **"Template CSV"** (verde)
3. Um arquivo `template_ingredientes.csv` será baixado
4. Abra no Excel, Google Sheets ou editor de texto

### **Passo 2: Preencher o CSV**

O arquivo deve ter **exatamente 4 colunas**:

```csv
nome,preco_compra,quantidade_total,unidade
Farinha de Trigo,10.00,1,kg
Açúcar,8.50,1,kg
Chocolate em Pó,15.00,200,g
```

#### **Regras:**
- **Nome** - Texto (obrigatório)
- **preco_compra** - Número com ponto (ex: 10.50)
- **quantidade_total** - Número (ex: 1, 500, 2.5)
- **unidade** - Deve ser: `g`, `kg`, `ml`, `L` ou `un`

⚠️ **IMPORTANTE:**
- Use **ponto** (.) como separador decimal, não vírgula
- Não use símbolo R$ no preço
- Não deixe campos vazios

### **Passo 3: Importar**

1. Clique no botão **"Importar CSV"** (roxo)
2. Selecione seu arquivo `.csv`
3. Aguarde o processamento

### **Passo 4: Preview e Validação**

O sistema mostrará:
- ✅ **Novos** - Itens que serão adicionados
- ⚠️ **Duplicados** - Itens que já existem no estoque
- ❌ **Erros** - Itens com dados inválidos

### **Passo 5: Escolher Estratégia para Duplicados**

Se houver duplicatas, escolha uma opção:

#### **1. Pular (Recomendado)**
- Mantém os valores que já existem
- Não importa os duplicados
- **Quando usar:** Quando você já tem os dados corretos

#### **2. Substituir**
- Substitui os valores antigos pelos novos
- **Quando usar:** Quando os preços mudaram e você quer atualizar

#### **3. Somar (Atualizar Estoque)**
- Soma os valores totais gastos
- Soma as quantidades
- Recalcula o custo médio por unidade
- **Quando usar:** Quando você fez uma nova compra do mesmo ingrediente

### **Passo 6: Confirmar Importação**

1. Clique em **"Importar X itens"**
2. Aguarde o processamento
3. Veja o resumo: quantos foram importados, pulados ou tiveram erro

---

## 📝 Exemplo Completo:

### **Arquivo CSV (`meus_ingredientes.csv`):**

```csv
nome,preco_compra,quantidade_total,unidade
Farinha de Trigo,10.00,1,kg
Açúcar,8.50,1,kg
Chocolate em Pó,15.00,200,g
Ovos,12.00,12,un
Leite,5.50,1,L
Óleo de Soja,7.00,900,ml
Fermento em Pó,6.00,100,g
Manteiga,18.00,500,g
Sal,2.50,1,kg
Baunilha,12.00,30,ml
```

### **Resultado após importação:**

| Ingrediente | Status | Ação |
|-------------|--------|------|
| Farinha de Trigo | ✅ Novo | Importado como 1000g |
| Açúcar | ✅ Novo | Importado como 1000g |
| Chocolate | ✅ Novo | Importado como 200g |
| Ovos | ⚠️ Duplicado | Depende da estratégia |
| Leite | ✅ Novo | Importado como 1000ml |
| Óleo | ✅ Novo | Importado como 900ml |
| Fermento | ✅ Novo | Importado como 100g |
| Manteiga | ✅ Novo | Importado como 500g |
| Sal | ✅ Novo | Importado como 1000g |
| Baunilha | ✅ Novo | Importado como 30ml |

---

## 🔧 Validações Automáticas:

O sistema valida automaticamente:

| Validação | Descrição | Exemplo Erro |
|-----------|-----------|--------------|
| **Nome vazio** | Nome não pode estar em branco | `,10.00,1,kg` ❌ |
| **Preço inválido** | Deve ser número positivo | `Farinha,abc,1,kg` ❌ |
| **Quantidade inválida** | Deve ser número positivo | `Farinha,10.00,-5,kg` ❌ |
| **Unidade inválida** | Deve ser g, kg, ml, L ou un | `Farinha,10.00,1,litros` ❌ |

---

## 💡 Dicas e Truques:

### **No Excel/Google Sheets:**
1. Use formatação de número para preços (sem R$)
2. Salve como **"CSV (separado por vírgulas)"**
3. Verifique que as colunas estão na ordem correta

### **Para grandes quantidades:**
- Você pode importar centenas de itens de uma vez
- O sistema processa linha por linha
- Se houver erro em uma linha, as outras ainda são processadas

### **Atualização de estoque:**
- Use a estratégia **"Somar"** para registrar novas compras
- Isso mantém o histórico de todas as compras
- O custo médio por unidade é calculado automaticamente

### **Correção de preços:**
- Use a estratégia **"Substituir"** para corrigir valores errados
- Ainda registra no histórico como nova compra

---

## 🐛 Problemas Comuns:

### **"CSV inválido! Deve conter as colunas..."**
**Causa:** Colunas faltando ou com nomes errados  
**Solução:** Use o template baixado do sistema

### **"Preço inválido"**
**Causa:** Vírgula ao invés de ponto no decimal  
**Solução:** Substitua `10,50` por `10.50`

### **"Unidade inválida"**
**Causa:** Unidade não reconhecida  
**Solução:** Use apenas: `g`, `kg`, `ml`, `L` ou `un`

### **Erro ao abrir CSV no Excel**
**Causa:** Codificação de caracteres  
**Solução:** 
1. Abra o Bloco de Notas
2. Cole os dados
3. Salve como `.csv` com codificação UTF-8

---

## 📊 Cenários de Uso:

### **Cenário 1: Primeira vez cadastrando**
```
Estratégia: Não importa (todos serão novos)
Resultado: Todos os ingredientes são cadastrados
```

### **Cenário 2: Nova compra no mercado**
```
Cenário: Você comprou mais Farinha (já tem no estoque)
Estratégia: Somar
Resultado: 
  - Valor total gasto é somado
  - Quantidade é somada
  - Custo médio/unidade é recalculado
  - Histórico é atualizado
```

### **Cenário 3: Correção de preços**
```
Cenário: Você cadastrou errado o preço do Açúcar
Estratégia: Substituir
Resultado: Valores antigos são substituídos pelos novos
```

### **Cenário 4: Reimportar arquivo antigo**
```
Cenário: Você importa o mesmo arquivo novamente por engano
Estratégia: Pular
Resultado: Nada é alterado, duplicados são ignorados
```

---

## ✅ Checklist de Importação:

Antes de importar, verifique:

- [ ] O arquivo é `.csv`
- [ ] Tem 4 colunas: nome, preco_compra, quantidade_total, unidade
- [ ] Preços usam ponto (.) como decimal
- [ ] Unidades são: g, kg, ml, L ou un
- [ ] Não há linhas vazias no meio do arquivo
- [ ] Todos os campos estão preenchidos

---

## 🎯 Próximos Passos:

Após importar seus ingredientes:
1. ✅ Vá na aba **Ingredientes** e confira se todos foram importados
2. ✅ Verifique os custos unitários calculados
3. ✅ Vá na aba **Receitas** e comece a criar suas receitas
4. ✅ Use o histórico para acompanhar seus gastos

---

## 📁 Arquivo Template Incluído:

O projeto já inclui um arquivo de exemplo:
- **`TEMPLATE_IMPORTACAO.csv`** - Template pronto para usar

Abra, preencha com seus dados e importe!

---

**Pronto para importar! 🎉**

Qualquer dúvida, consulte este guia.

