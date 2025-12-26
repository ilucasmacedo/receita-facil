# 📋 Instruções: Módulo de Receitas

## ✅ O que foi implementado:

### 1. **Atualização do Banco de Dados**
- ✅ Arquivo SQL criado: `SQL_ATUALIZAR_RECEITAS_COM_FOTO.sql`
- ✅ Novos campos na tabela `receitas`:
  - `foto_url` (TEXT) - URL da foto da receita
  - `descricao` (TEXT) - Descrição da receita
  - `tempo_preparo_minutos` (INT) - Tempo de preparo
  - `custo_total` (DECIMAL) - Custo total calculado
  - `preco_venda` (DECIMAL) - Preço de venda calculado

### 2. **Tipos TypeScript Atualizados**
- ✅ Interface `Receita` expandida com novos campos
- ✅ Interface `ItemReceitaComIngrediente` criada para facilitar exibição

### 3. **Página de Receitas Completa**
- ✅ Formulário com todos os campos necessários
- ✅ Upload de foto via URL
- ✅ Preview da foto em tempo real
- ✅ Seleção de ingredientes com quantidade
- ✅ Cálculo automático de custos
- ✅ Cálculo automático de preço de venda
- ✅ Cálculo de preço por porção
- ✅ Visualização em cards com foto
- ✅ Edição de receitas
- ✅ Exclusão de receitas

---

## 🚀 Como usar:

### **Passo 1: Atualizar o Banco de Dados**

1. Abra o **Supabase** (https://supabase.com)
2. Vá em **SQL Editor**
3. Abra o arquivo `SQL_ATUALIZAR_RECEITAS_COM_FOTO.sql`
4. Copie todo o conteúdo
5. Cole no SQL Editor do Supabase
6. Clique em **RUN**
7. Aguarde 30 segundos para o schema atualizar

### **Passo 2: Acessar a Página de Receitas**

1. Certifique-se de que o servidor está rodando: `npm run dev`
2. Faça login na aplicação
3. Clique em **"Receitas"** no menu superior
4. Você verá a página de cadastro de receitas

---

## 📝 Como cadastrar uma receita:

### **Informações Básicas:**
1. **Nome da Receita** (obrigatório) - Ex: "Bolo de Chocolate"
2. **Descrição** (opcional) - Breve descrição do prato
3. **URL da Foto** (opcional) - Cole o link de uma imagem
   - Exemplo: `https://images.unsplash.com/photo-1578985545062-69928b1d9587`
4. **Rendimento** (obrigatório) - Quantas porções a receita rende
5. **Tempo de Preparo** (opcional) - Em minutos
6. **Margem de Lucro** (%) - Quanto você quer lucrar sobre o custo

### **Adicionar Ingredientes:**
1. Selecione um ingrediente da lista suspensa
2. Digite a quantidade que será usada na receita
3. Clique no botão **"+"** para adicionar
4. Repita para todos os ingredientes
5. Para remover, clique no ícone de lixeira

### **Análise Financeira Automática:**
Conforme você adiciona ingredientes, o sistema calcula automaticamente:
- ✅ **Custo Total** - Soma do custo de todos os ingredientes
- ✅ **Preço de Venda** - Custo + Margem de Lucro
- ✅ **Preço por Porção** - Preço de venda dividido pelo rendimento
- ✅ **Lucro Total** - Diferença entre preço de venda e custo

### **Salvar:**
Clique em **"Salvar Receita"** para cadastrar.

---

## 🎨 Recursos Visuais:

### **Cards de Receitas:**
- Foto em destaque (ou ícone se não houver foto)
- Nome e descrição
- Rendimento e tempo de preparo
- Custo total (vermelho)
- Preço de venda (verde)
- Preço por porção (azul)
- Botões de editar e excluir

### **Edição:**
- Clique em "Editar" em qualquer receita
- O formulário será preenchido automaticamente
- Os ingredientes serão carregados
- Faça as alterações e clique em "Atualizar Receita"

---

## 💡 Dicas de Uso:

### **Para fotos bonitas e gratuitas:**
Use o Unsplash:
1. Vá em https://unsplash.com
2. Busque pela comida (ex: "chocolate cake")
3. Clique com botão direito na imagem
4. Copiar endereço da imagem
5. Cole no campo "URL da Foto"

### **Exemplos de URLs de fotos:**
- Bolo de Chocolate: `https://images.unsplash.com/photo-1578985545062-69928b1d9587`
- Pizza: `https://images.unsplash.com/photo-1513104890138-7c749659a591`
- Brigadeiro: `https://images.unsplash.com/photo-1606313564200-e75d5e30476c`

### **Cálculo de Margem:**
- **50%** = Preço de venda será 1.5x o custo
- **100%** = Preço de venda será 2x o custo (dobro)
- **200%** = Preço de venda será 3x o custo (triplo)

---

## 🔧 Funcionalidades Técnicas:

### **Conversão Automática:**
O sistema usa os ingredientes já normalizados (g, ml, un) para calcular o custo exato de cada item usado na receita.

### **Exemplo de Cálculo:**
```
Ingrediente: Farinha de Trigo
- Estoque: 2000g
- Custo: R$ 10,00
- Custo por grama: R$ 0,005

Receita usa: 500g
- Custo na receita: 500 × R$ 0,005 = R$ 2,50
```

### **Salvamento:**
- Salva a receita na tabela `receitas`
- Salva cada ingrediente na tabela `itens_receita`
- Calcula e armazena custo_total e preco_venda automaticamente

---

## ✅ Checklist de Teste:

- [ ] SQL executado no Supabase
- [ ] Página de receitas acessível
- [ ] Consegue adicionar ingredientes
- [ ] Cálculos aparecem corretamente
- [ ] Consegue salvar receita
- [ ] Receita aparece na lista
- [ ] Consegue editar receita
- [ ] Consegue excluir receita
- [ ] Preview de foto funciona

---

## 🐛 Possíveis Problemas:

### **"Erro ao salvar receita"**
- Verifique se executou o SQL no Supabase
- Aguarde 30 segundos após executar o SQL
- Reinicie o servidor: `npm run dev`

### **"Nenhum ingrediente disponível"**
- Cadastre ingredientes primeiro na aba "Ingredientes"

### **"Foto não aparece"**
- Verifique se a URL está correta
- Teste a URL no navegador antes de colar
- Use URLs diretas de imagens (.jpg, .png, .webp)

---

## 🎯 Próximos Passos Sugeridos:

1. ✅ Cadastrar alguns ingredientes
2. ✅ Criar sua primeira receita
3. ✅ Testar os cálculos de custo
4. 🔜 Implementar impressão de receitas
5. 🔜 Adicionar modo de preparo (passo a passo)
6. 🔜 Exportar receitas em PDF

---

**Pronto para usar! 🎉**

Qualquer dúvida, consulte este documento ou peça ajuda.

