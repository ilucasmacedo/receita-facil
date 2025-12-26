# 🔴 SOLUÇÃO: Erro ao Carregar Histórico

## ❌ Problema

Ao clicar no botão de histórico (ícone roxo/relógio), aparece um erro:
```
Could not find the table 'public.historico_compras' in the schema cache
```

## ✅ SOLUÇÃO

A tabela de histórico ainda não foi criada no Supabase.

---

## Passo a Passo

### 1. Abrir o SQL Editor no Supabase

1. Acesse: https://supabase.com/dashboard
2. Selecione seu projeto
3. No menu lateral, clique em **SQL Editor**
4. Clique em **New Query**

### 2. Copiar e Executar o SQL

Cole TODO este código SQL:

```sql
-- Criar tabela de histórico
CREATE TABLE IF NOT EXISTS historico_compras (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  ingrediente_id UUID REFERENCES ingredientes(id) ON DELETE CASCADE NOT NULL,
  nome_ingrediente TEXT NOT NULL,
  preco_compra DECIMAL(10,2) NOT NULL,
  quantidade_comprada DECIMAL(10,2) NOT NULL,
  unidade TEXT NOT NULL,
  valor_total DECIMAL(10,2) NOT NULL,
  data_compra TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  observacao TEXT
);

-- Habilitar RLS
ALTER TABLE historico_compras ENABLE ROW LEVEL SECURITY;

-- Criar políticas
CREATE POLICY "Users can view own historico" 
  ON historico_compras FOR SELECT 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own historico" 
  ON historico_compras FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own historico" 
  ON historico_compras FOR DELETE 
  USING (auth.uid() = user_id);

-- Criar índices
CREATE INDEX IF NOT EXISTS idx_historico_ingrediente 
  ON historico_compras(ingrediente_id, data_compra DESC);

CREATE INDEX IF NOT EXISTS idx_historico_user 
  ON historico_compras(user_id, data_compra DESC);
```

### 3. Executar

1. Clique no botão **RUN** (ou pressione Ctrl+Enter)
2. Aguarde a mensagem **"Success. No rows returned"**
3. ✅ Tabela criada com sucesso!

### 4. Aguardar 30 segundos

Aguarde o Supabase atualizar o cache interno.

### 5. Recarregar a Aplicação

1. Volte para a aplicação: http://localhost:3000/ingredientes
2. Recarregue a página (F5)
3. Clique no ícone roxo (relógio) novamente
4. ✅ Deve funcionar agora!

---

## 🔍 Verificar se Funcionou

### No Supabase:
1. Vá em **Table Editor**
2. Você deve ver a tabela **`historico_compras`** na lista
3. Se não aparecer, aguarde mais 30 segundos e recarregue

### Na Aplicação:
1. Adicione um ingrediente novo
2. Clique no ícone roxo (relógio) na linha dele
3. Modal de histórico deve abrir
4. Pode estar vazio (sem compras registradas ainda)

---

## 📊 Como Funciona

### Registro Automático:
- A partir de agora, cada compra será registrada automaticamente
- Ingredientes antigos não têm histórico (só os novos)

### Para Criar Histórico dos Ingredientes Antigos:
Se quiser ter histórico dos ingredientes que já existem:
1. Edite o ingrediente (botão de lápis)
2. Altere algum valor (ex: preço)
3. Salve
4. OU adicione uma compra duplicada e escolha "Calcular Média"

---

## ⚠️ Nota Importante

**Ingredientes cadastrados antes de criar a tabela de histórico não terão histórico retroativo.**

Apenas novas compras (a partir de agora) serão registradas.

---

## 🆘 Se Ainda Não Funcionar

1. **Verifique no Table Editor** se a tabela `historico_compras` aparece
2. **Aguarde mais tempo** (às vezes o cache demora)
3. **Reinicie o servidor Next.js:**
   - Terminal: Ctrl+C
   - Execute: `npm run dev`
4. **Limpe o cache do navegador:** Ctrl+Shift+Delete
5. **Tente novamente**

Execute o SQL acima e me avise se funcionou! 📊

